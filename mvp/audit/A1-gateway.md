# A1 — Gateway 安全 + 架构审计报告

- **审计对象**：`mvp/gateway/`（Hono on Cloudflare Workers，共享 LLM 网关）
- **代码规模**：29 个源文件，~3594 LOC（src + tests + 配置）
- **审计方式**：全量只读审计，未改动任何代码。关键论断已用独立脚本（`node`）验证（正则复用、危机绕过、限流竞态、误杀等）。
- **基线**：`npx vitest run` → 20/20 通过。
- **审计日期**：2026-05-29

---

## 0. 总体结论速览

合规"出口清洗"骨架是对的（detectCrisis 短路、lintAction 出口过滤、disclaimer 硬注入、5xx→200 兜底都落实了，且有测试覆盖），但**enforce 的"不可绕过"在几个真实输入维度上并不成立**：危机关键词可被空格/零宽字符/繁体轻易绕过；`mood` 字段完全不过危机检测；农药词表只覆盖简体精确匹配，空格/繁体/英文名均漏过。这些是**合规口径的硬伤**，不是工程 bug。其次限流是 fail-open + 非原子的，等于"尽力而为"而非"配额"。

---

## 1. 合规服务端 enforce

### F-01 🔴 Critical — 危机关键词检测可被「字符间插入空白/零宽字符」绕过
**位置**：`src/lib/detectCrisis.ts:157-173`（`detectCrisis` 用 `normalized.includes(kw)`）

**问题**：检测仅做 `toLowerCase()` 后 `includes()` 子串匹配，不做任何归一化（去空白、去零宽字符、繁简、全半角）。已用脚本验证：
- `我想死` → 命中 level 1 ✅
- `我 想 死`（插空格）→ **level 0，未命中** ❌
- `我想​死`（插零宽空格 U+200B）→ **level 0** ❌
- `我想⁤死`（插 U+2064）→ **level 0** ❌

**影响**：这是 04 梦境产品**最高优先级的法律/伦理护栏**——一级命中本应"不调 LLM、直接 redirectToCrisis"。绕过后，明确表达自杀意图的文本会被当作普通梦境送进 LLM 做"意象分析"，属于严重合规与伦理事故（且用户极易无意触发：输入法、复制粘贴都会带不可见字符）。

**建议修复**：在 `detectCrisis` 入口对 `text` 先归一化再匹配：
```ts
const normalized = text
  .normalize('NFKC')                 // 全角→半角、繁简部分归一
  .replace(/[\s​-‍⁠⁤﻿]/g, '') // 去所有空白+零宽字符
  .toLowerCase();
```
注意关键词表本身含空格（如 `kill myself`、`self harm`），需对英文表保留词内空格或改用"去空白后再匹配去空白后的关键词"的双向归一。建议中英分开处理：中文去全部空白，英文按词边界。

---

### F-02 🔴 Critical — `mood` 字段不过危机检测（短路盲区）
**位置**：`src/endpoints/analyzeDream.ts:107`（`detectCrisis(dreamText, ...)` 只传 `dreamText`）+ `src/endpoints/analyzeDream.ts:27-32`（`mood: z.string().optional()`，**无 `.max()`**）

**问题**：危机检测只扫 `dreamText`，但 `mood` 字段同样会被 `buildDreamUserPrompt` 拼进 prompt 送给 LLM（`prompts/dream.ts:78`）。用户把"我想死"写进 `mood`，则：
1. 绕过 level-1 短路 → 照常调 LLM；
2. `mood` 无长度上限，可塞超长文本（`dreamText` 有 `.max(8000)`，`mood` 没有）。

**影响**：与 F-01 同级的合规盲区——危机内容经 `mood` 通道可 100% 绕过短路。长度无上限还带来 prompt 注入/费用放大面。

**建议修复**：危机检测应覆盖所有进入 prompt 的用户文本：
```ts
const crisis = detectCrisis(`${dreamText}\n${mood ?? ''}`, locale ?? 'zh-CN');
```
并给 `mood` 加 `.max(200)` 等约束。

---

### F-03 🟠 High — 农药词表仅简体精确匹配，空格/繁体/英文名漏过
**位置**：`src/lib/lintAction.ts:84-100`（`lintText` 用 `text.includes(name)`）

**问题**：`PESTICIDE_NAMES` 是简体定值串，`includes` 精确匹配。已验证漏过：
- `多 菌 灵`（插空格）→ 不命中
- `多菌靈`（繁体）→ 不命中
- `carbendazim` / `chlorothalonil`（英文通用名）→ 不命中

LLM（尤其 GPT 系）完全可能输出英文农药名或带空格的排版。

**影响**：出口清洗本是 03 植物医生的合规底线（禁止给出农药商品名/剂量）。绕过后会向用户直接下发具体农药名，违背设计红线。注：此为 1:1 移植自 `products/03-plant-doctor/src/lib/lintAction.ts` 的**既有缺陷**，非网关新引入。

**建议修复**：匹配前对文本归一化（NFKC + 去空白），并补充英文通用名词表（carbendazim、chlorothalonil、imidacloprid、mancozeb、abamectin 等）。剂量正则同理应对去空白后的文本运行。

---

### F-04 🟠 High — 剂量正则误杀正常内容（时间「10:30」被当稀释比例）
**位置**：`src/lib/lintAction.ts:70`（`/\d+\s*[:：]\s*\d{2,5}/g`）

**问题**：`\d+:\d{2,5}` 会匹配任何"数字:2~5位数字"。已验证：
- `上午 10:30 浇水` → 命中 `10:30`，整条 `action_step` 被替换为"请咨询本地园艺师或农资人员"
- `1:100`、`1:1000` 正常命中（预期）
- `16:9`、`2:1` 不命中（后段不足 2 位）

**影响**：合理的护理日历/步骤里若出现"上午 9:30"、"温度 28:某值"之类，会被整段误杀，破坏功能可用性。结合 F-05（整段替换）后果被放大。属"宁可错杀"的设计取向带来的可用性损失。同为移植自原产品的既有行为。

**建议修复**：给比例正则加语境约束（要求邻近出现"稀释/兑/比例/倍"等词，或排除常见时间格式 `[0-2]?\d:[0-5]\d`），降低误杀。

---

### F-05 🟡 Medium — lintText 命中即「整段替换」，正常内容连带丢失
**位置**：`src/lib/lintAction.ts:96-99`（命中任意 token → `cleaned = SAFE_REPLACEMENT`）

**问题**：只要字段内出现一个敏感 token，整段文本被替换为固定话术。已验证：一条 60+ 字、仅末尾含"多菌灵"的护理步骤，输出只剩"请咨询本地园艺师或农资人员"，其余有效养护信息全丢。

**影响**：合规上是安全的（不泄露），但用户体验/信息量损失大；且与 F-04 误杀叠加时，单个误判即抹掉整条步骤。属合规 vs 可用性的权衡，非安全漏洞。

**建议修复**：可考虑"仅替换命中片段 + 追加提示"而非整段替换；若坚持整段替换以求保守，则务必先修 F-04 的误杀。

---

### F-06 🟡 Medium — diagnose 出口清洗未覆盖 `image_quality_ok` 之外的两个 prognosis 子字段
**位置**：`src/lib/lintAction.ts:177-183`（`prognosis` 只清洗了 `fallback_if_fail`）

**问题**：`lintDiagnosisResult` 对 `prognosis` 仅清洗 `fallback_if_fail`，未清洗 `time_to_observe`。LLM 完全可能把用药频次写进 `time_to_observe`（如"每周喷 2 次共观察 3 周"，会命中 `喷.*\d+.*次`）。同理 `diagnosis[].cause`/`evidence` 已覆盖、`action_steps`/`calendar` 已覆盖，但 `time_to_observe` 是个漏点。

**影响**：一条合理但含喷洒频次的观察周期描述会绕过清洗下发给用户。属覆盖不全，非全量失效。

**建议修复**：`prognosis.time_to_observe` 也走 `lintAndTrack`；最稳做法是用一个"递归遍历所有 string 叶子节点"的清洗器，杜绝新增字段时漏配（当前是手写逐字段，可维护性差，加字段极易漏）。

---

### F-07 🟢 Low — 05 禁词检测 `includes` 同样可被空格/变体绕过，且不查 LLM 自带 disclaimer
**位置**：`src/endpoints/generateCards.ts:46-49`（`containsForbiddenTerms`）

**问题**：`FORBIDDEN_OUTPUT_TERMS`（兽医/分离焦虑/翻译/准确…）用 `allText.includes(term)`，`兽 医`、`兽醫` 可绕过。另外检测只覆盖 `translation + mood_tag`，不查 LLM 返回的 `disclaimer` 字段内容（虽然 disclaimer 最终被硬覆盖，影响有限）。

**影响**：05 是娱乐场景，违规外溢风险低；但"翻译准确""真实意图"等承诺性话术若带变体仍可能漏出。

**建议修复**：检测前归一化；与 F-01/F-03 共用一个归一化工具函数。

---

### ✅ 合规正确实现（确认无误）
- **04 一级短路确实在调 LLM 之前**：`analyzeDream.ts:107` 检测 → `:111-119` `if (crisis.level===1)` 直接 return，**不触达** `:124` 的 `callTextLLM`。测试 `analyze-dream-crisis.test.ts:53-77` 用"fetch 抛错"桩验证了 LLM 未被调用。（**前提**：危机文本未被 F-01/F-02 绕过。）
- **05 disclaimer 硬注入覆盖全路径**：mock fallback（`:79`）、schema 失败（`:122`）、禁词（`:140`）、正常 LLM（`:150`）四条返回路径全部经 `enforceDisclaimer`/显式注入 `DISCLAIMER`，测试 `generate-cards-disclaimer.test.ts` 覆盖了 LLM 省略/给错 disclaimer 的情形。
- **03 lintAction 必跑**：`diagnose.ts:144` 无条件 `lintDiagnosisResult(result)`，mock 与 LLM 结果都过清洗。

---

## 2. LLM Provider Chain

### F-08 🟠 High — 文本链「降级」名不副实：只用首选 provider，从不跨 provider 降级
**位置**：`src/llm/textChain.ts:170-195`（`callTextLLM`）+ `:38-43`（`pickProvider`）

**问题**：注释与文件头都写"Priority: DEEPSEEK > ZHIPU > OPENAI > mock"，但 `pickProvider` 只**选一个**（首个有 key 的），`callTextLLM` 的循环只对**这一个** provider 重试 `retries` 次，失败后**直接降级到 mock**，从不尝试下一个 provider。即：DeepSeek key 存在但 DeepSeek 持续 5xx/超时 → 直接走 mock，**完全不会尝试 Zhipu/OpenAI**。

**影响**：与视觉链（`visionChain.ts:126-139` 有 zhipu→openai 真降级）行为不一致；文本三接口（01/04/05）在主 provider 故障时可用性骤降为 mock，而本可降级到次选真实 LLM。属功能性缺陷 + 文档误导。

**建议修复**：`callTextLLM` 改为遍历 `['deepseek','zhipu','openai']` 中所有有 key 者，逐个（含各自重试）尝试，全失败再 mock。或显式更新注释说明"文本链不跨 provider 降级"。

---

### F-09 🟡 Medium — `parseJsonSafely` 的「数组→{names:[...]}」包装污染非起名接口
**位置**：`src/llm/textChain.ts:153-162`

**问题**：当 LLM 返回顶层数组时，`parseJsonSafely` 统一包装成 `{ names: arr }`。这是为 01 起名设计的，但该函数被 04/05 共用。若 04 梦境 LLM 误输出数组，会被包成 `{names:[...]}`，`sanitizeAnalysis` 的 zod 校验失败 → 走 mock（结果正确但归因为"解析失败"，掩盖了真实形态）。05 同理。

**影响**：仅影响异常归因/可观测性，最终输出仍安全（mock 兜底）。

**建议修复**：把数组包装逻辑移出通用 parser，仅在 `extractCandidates` 内处理；或让包装 key 可配置。

---

### F-10 🟡 Medium — 25s/30s 单次超时叠加重试，可逼近 Workers CPU/请求时限
**位置**：`textChain.ts:90`（25s）+ `:178-187`（retries=1，间隔 800ms）；`visionChain.ts:81`（30s）

**问题**：文本接口默认 `timeoutMs=25_000` + `retries=1` + 800ms 退避 → 最坏 ~50.8s 墙钟。视觉接口 30s 单次。01/04 都用 25s+retry1。Cloudflare Workers 付费版墙钟时限通常足够，但**免费档约 10s CPU / 受限墙钟**下，叠加重试极易触发平台层 1102/超时，绕过"永不 5xx"的应用层兜底（见 F-12）。05 已正确收紧为 8s + retries=0。

**影响**：取决于部署套餐。若免费档/低配，长尾请求会被平台杀掉返回 5xx，破坏核心架构不变量。

**建议修复**：明确目标套餐；将 01/04 单次超时收紧（如 15s）并确认 `retries` 后总时长 < 平台墙钟上限；或对 04 也降 retries=0。

---

### ✅ Provider Chain 正确实现（确认无误）
- **超时**：`AbortController` + `setTimeout(abort)`，`finally` 清 timer（`textChain.ts:89-120`），无 timer 泄漏。
- **key 缺失**：`getConfig` 返回 null → `callOnce` 抛错；`pickProvider`/`pickVisionProvider` 无 key 时直接返回 `mock` 不发请求。
- **JSON 容错**：`parseJsonSafely` 四级回退（裸 JSON → 去 markdown → 截 `{...}` → 截 `[...]`），覆盖常见 LLM 脏输出。
- **视觉跳过 deepseek**：`visionChain` 类型 `Exclude<ProviderName,'mock'|'deepseek'>`，正确。
- **视觉降级**：zhipu→openai→mock 真实降级链存在且带 warning。

---

## 3. Rate Limit

### F-11 🟠 High — 限流非原子（read-modify-write 竞态）+ 全程 fail-open，配额形同虚设
**位置**：`src/middleware/rateLimit.ts:57-93`

**问题**：两处叠加：
1. **非原子**：`get` → `parseInt` → `put(count+1)` 是读改写。已用脚本验证：5 个并发请求都读到 0，都写 1 → 计数最终为 1（应为 5）。突发并发下实际放行量可远超配额。KV 本身也最终一致（边缘节点间不强一致），跨节点更不准。
2. **全程 fail-open**：KV 未绑定（`:46`）、`get` 抛错（`:61-64`）、`put` 抛错（`:89-90`）全部放行。

**影响**：限流对**单点慢速攻击**有效，但对**并发突发**几乎无效（视觉接口 10/min 的"昂贵"配额最易被击穿，直接放大第三方视觉 API 费用）。`wrangler.toml:25` 的 KV id 还是 `PLACEHOLDER_REPLACE_BEFORE_DEPLOY`——若上线忘记替换，KV 行为未定义/可能整体 fail-open，限流彻底失效。

**建议修复**：
- MVP 可接受"尽力而为"，但应在文档/告警里明确"限流非强一致、可被并发突破"。
- 真要强配额：用 Durable Objects（单点串行计数）或 KV + 条件写/版本号 CAS。
- `wrangler.toml` 的 PLACEHOLDER 必须在部署清单里强制替换并加 CI 校验（见 F-17）。

---

### F-12 🟡 Medium — IP 提取在「未经 CF 边缘」时可被 X-Forwarded-For 伪造
**位置**：`src/middleware/rateLimit.ts:26-35`（`getClientIp`）

**问题**：优先 `cf-connecting-ip`（CF 边缘设置，**可信**），回退 `x-forwarded-for` 首段（**客户端可伪造**），再回退 `cf-ipcountry`/`'anon'`。在 Workers 标准部署下 `cf-connecting-ip` 恒在，XFF 分支不会触达，安全。但若通过 `workers.dev` 直连测试、或前置了非 CF 代理、或本地 dev，XFF 可被伪造 → 攻击者每请求换一个 XFF 即可绕过 IP 限流。

**影响**：标准 CF 部署下风险低；非标准链路下限流可被 IP 轮换绕过。`'anon'` 兜底还会让所有无 IP 请求共享一个桶（互相挤占/或集体免限）。

**建议修复**：生产仅信任 `cf-connecting-ip`，删除 XFF 回退（或仅在显式信任代理时启用）；无可信 IP 时按更严格策略（如直接限流/拒绝）而非合并到 `'anon'`。

---

### F-13 🟢 Low — 限流计数桶按"墙钟分钟对齐"，桶边界双倍突发
**位置**：`src/middleware/rateLimit.ts:22-24`（`Math.floor(Date.now()/60_000)`）

**问题**：固定窗口（非滑动）。在 `59.9s` 和 `60.1s` 两侧各可打满配额 → 跨桶边界 1~2 秒内可达 2×quota。经典固定窗口缺陷。

**影响**：轻微，MVP 可接受。

**建议修复**：如需更平滑可用滑动窗口/令牌桶；MVP 阶段记录即可。

---

## 4. "5xx 永不返回" 是否成立

### F-14 🟠 High — 平台层超时/CPU 超限会绕过 `onError`，返回平台 5xx
**位置**：`src/index.ts:84-97`（`onError`）

**问题**：`app.onError` 只能捕获**应用代码内抛出**的异常并转 200。它无法捕获：
1. Cloudflare 平台层错误：CPU 超时、墙钟超时（与 F-10 叠加）、内存超限、`Script exceeded time limit`（HTTP 1102）等 → CF 直接回 5xx/52x，应用代码根本没机会执行 `onError`。
2. `c.req.json()` 解析超大 body 时，若 body 无 `Content-Length`（chunked，绕过 `bodySizeGuard`，见 F-15），在 5MB diagnose 接口上读取/解析大体积可能撞 CPU/内存限制。

**影响**：架构不变量"5xx never returned"是**应用层尽力**，并非平台层保证。在 F-10（长超时+重试）下尤其真实。属对不变量的边界澄清 + 实际风险。

**建议修复**：
- 文档把不变量改述为"应用层异常一律转 200；平台层超限不在此保证内"。
- 配合 F-10 收紧超时，把总墙钟压到平台上限内，最大限度避免平台 5xx。

---

### F-15 🟡 Medium — `bodySizeGuard` 仅校验 `Content-Length` 头，可被 chunked / 缺头绕过
**位置**：`src/middleware/common.ts:48-67`

**问题**：仅当请求带 `content-length` 头且 `> maxBytes` 才 413。攻击者用 `Transfer-Encoding: chunked`（无 Content-Length）即可绕过大小检查，随后 `c.req.json()` 仍会把整个 body 读入内存。对 5MB 的 `/diagnose` 尤其敏感（base64 图片本就大）。

**影响**：内存/CPU 放大面；与 F-14 共同可能触发平台 5xx 或费用问题。CF 平台自身有请求体硬上限（约 100MB 默认/付费更高），是最后防线，但应用层 16KB/64KB 的精细限制被轻易绕过。

**建议修复**：在读取后基于**实际**字节数二次校验，或对 `c.req.arrayBuffer()` 做流式大小累加截断；最简做法：读 raw text 后 `if (text.length > maxBytes) return 413` 再 `JSON.parse`。

---

### ✅ 5xx 兜底正确实现（确认无误）
- 应用内异常：`onError` 捕获 → 200 + `warning`（`index.ts:84-97`）。
- body 解析失败：各 handler `try/catch` → 400（01/03/04）或 200+mock（05）。
- 404/405：显式返回 4xx JSON，不抛错。
- 各 endpoint 的 LLM/schema 失败均降级 mock + 200，无裸抛。

---

## 5. CORS

### F-16 🟡 Medium — `Access-Control-Allow-Origin: *` 全开放
**位置**：`src/middleware/common.ts:32-45`

**问题**：所有响应（含 OPTIONS 预检）写死 `ACAO: *`。由于这些接口**不使用 Cookie / 不依赖凭证认证**（无鉴权，纯公共 LLM 代理），`*` 本身不构成 CSRF/凭证泄露风险。真实风险是：**任何第三方网站都能直接调用你的网关消耗 LLM 配额/费用**（盗刷），限流（F-11）又可被绕过。

**影响**：无凭证场景下不是经典 CORS 漏洞，但配合无鉴权 + 弱限流，等于"任意来源免费白嫖后端"。未暴露敏感响应头（只回 `X-Request-Id` 等非敏感头，`/health` 也只回 provider 布尔，不泄露 key 值——`index.ts:43-47` 这点做得对）。

**建议修复**：MVP 若必须 `*`，则强化限流 + 加轻量来源/签名校验（如简单的 Origin 白名单或 HMAC 签名头）防盗刷；否则收紧 ACAO 为已知前端域名白名单。

---

## 6. 错误处理 / 输入校验

### F-17 🟡 Medium — `wrangler.toml` KV id 为 PLACEHOLDER，存在"上线即裸奔"风险
**位置**：`wrangler.toml:25-26`、`:41-42`

**问题**：`id`/`preview_id` 均为 `PLACEHOLDER_REPLACE_BEFORE_DEPLOY`。若部署前未替换：限流要么报错 fail-open（F-11），要么绑定到一个不存在/共享的命名空间，行为未定义。

**建议修复**：CI/部署脚本里加断言（grep 到 PLACEHOLDER 即 fail）；或用环境变量注入真实 id。

### F-18 🟢 Low — `mood`（04）、`description`/各文本字段（03）缺长度上限
**位置**：`analyzeDream.ts:29`（`mood` 无 max，已在 F-02 提及）、`diagnose.ts:26-31`（`waterFreq/light/soil/description/plantSelfReport/city` 均 `z.string().optional()` 无 max）、`generateNames.ts` 仅 `taboo` 有 max(200)。

**问题**：这些字段会拼进 prompt。无上限 → prompt 注入面 + token 费用放大 + 潜在体积问题（虽 body 有总上限兜底，但单字段无约束）。

**建议修复**：给所有进 prompt 的自由文本字段加合理 `.max()`。

### F-19 🟢 Low — `x-request-id` 回显未净化，潜在响应头注入/日志注入
**位置**：`src/middleware/common.ts:19-23`

**问题**：`incoming` 若 `≤80` 字符即原样 `c.set('requestId')` 并 `c.header('X-Request-Id', id)`，还会进 `console.error`（`index.ts:85`）。Workers 的 `Headers.set` 会拒绝含 CR/LF 的值（运行时层面挡了头注入），但该值进日志时未净化，可做**日志注入/伪造**（插入换行伪造日志行）。

**建议修复**：对 `incoming` 做白名单校验（`/^[A-Za-z0-9_-]{1,80}$/`），否则用 `genId()`。

### F-20 💡 Improvement — `extractCandidates` 宽松解析容错好，但 `char_meanings` 用 `z.record(z.string())` 可被对象注入超大 map
**位置**：`generateNames.ts:48`、`:80`

**问题**：`char_meanings: z.record(z.string())` 不限 key 数/长度。LLM（或经 mock 路径不会，但 LLM 路径会）若返回巨大 map 会被原样透传给客户端。影响小（最终 `slice(0, 10)` 限了条数，但单条 map 无限），属健壮性改进。

---

## 7. Mock 数据质量

### F-21 🟢 Low — `mockUnableToIdentify` 为死代码（已导出但无人调用）
**位置**：`src/mocks/diagnose.ts:85-104`

**问题**：`grep` 确认 `mockUnableToIdentify` 在 src/tests 中**无任何调用方**。diagnose 失败一律走 `mockSucculentBlackRot()`（一个"黑腐病"诊断）。即：用户拍了张**模糊/无植物**的图、LLM 失败降级时，会收到一份**自信的"玉露黑腐病"诊断**，而非"图片不清请补图"。

**影响**：mock 误导性强（把"无法诊断"伪装成"明确诊断"），对 03 这种"救活植物"诉求的产品体验/可信度有损；非安全问题。

**建议修复**：删除死代码，或在 `image_quality`/无图等场景路由到 `mockUnableToIdentify`。注意 mock 始终返回同一株"黑腐病"也偏单一，可考虑多模板随机（参照 05 的 `MOCK_SCENARIOS`）。

### ✅ Mock 质量正确实现（确认无误）
- 05 `MOCK_SCENARIOS` 20 条、覆盖 cat/dog 多场景，`pickMockScenario` 按物种过滤 + 随机 + 用户名替换（`pet.ts:319-338`），且全部自带 `DISCLAIMER`、不含禁词，质量高。
- 01 `buildMockNames` 男女各 5 条，姓氏拼音映射含 ~110 单姓 + 8 复姓，回退原样（`names.ts:250-262`）。
- 04 mock 三流派 `psychology_view` 文案完整，`buildSupportiveMockAnalysis` 对 level2/3 有差异化支持文案，且都挂 `crisis_alert`。
- mock 数据与服务端常量（`DISCLAIMER`/`DISCLAIMER_TOP`/`NEXT_STEP_DEFAULT`）共享同源，避免漂移。
- 注：无法在本仓库内核对"与各产品 client mock 是否字面一致"（gateway 注释声明 1:1 移植，且 lintAction/危机词表已确认与 `products/03` 同源），如需逐字段比对建议另起一轮跨目录 diff。

---

## Top 3 必修

1. **F-01 + F-02（🔴）危机检测可绕过**：`detectCrisis` 加 NFKC + 去空白/零宽字符归一化，并让检测覆盖 `mood` 等所有进 prompt 的用户文本。这是 04 的法律/伦理底线，当前可被空格甚至复制粘贴的不可见字符无意绕过。
2. **F-03（🟠）农药出口清洗可绕过**：`lintText` 匹配前归一化（去空白/繁简）+ 补英文通用名词表。否则 03 的"禁农药名"合规红线在 LLM 英文/排版输出下失效。
3. **F-11（🟠）限流非原子 + fail-open + PLACEHOLDER**：明确"尽力而为"的定位或改用 Durable Objects 强配额；务必在部署前替换 `wrangler.toml` 的 KV PLACEHOLDER 并加 CI 校验，否则视觉接口的 10/min 昂贵配额会被并发击穿、放大第三方费用。

---

## 模块健康评分

| 模块 | 评分 | 说明 |
|------|------|------|
| 合规 enforce（短路/清洗/disclaimer 骨架） | **B** | 流程位置全对、测试覆盖主路径；但匹配层（归一化、字段覆盖、mood 盲区）有 Critical 绕过 |
| LLM Provider Chain | **B** | 超时/解析/key 缺失稳健；文本链不跨 provider 降级（名实不符）、超时叠加偏长 |
| Rate Limit | **C** | fail-open + 非原子 + PLACEHOLDER，并发下近乎失效 |
| 5xx 兜底 / 错误处理 | **B** | 应用层兜底扎实；平台层超时/chunked body 是真实缺口 |
| CORS / 输入校验 | **B-** | `*` 全开放 + 无鉴权易被盗刷；多字段缺长度上限 |
| Mock 数据质量 | **B+** | 05/01/04 质量高且同源；03 死代码 + 失败统一伪装成"黑腐病"误导 |
| **综合** | **B-** | 工程骨架与"安全默认值"思路正确，但合规 enforce 的"不可绕过"在真实输入维度上未成立，限流偏弱 |

---

## 一句话总评

> 网关的"安全兜底"骨架（短路 / 出口清洗 / disclaimer 硬注入 / 5xx→200）方向全对且有测试护着，但**合规 enforce 的"不可绕过"是纸面承诺**——危机词与农药词都停在简体精确 `includes` 匹配、`mood` 字段还是检测盲区，叠加 fail-open 且非原子的限流，先补"归一化 + 全文本覆盖 + 强配额"这三件事，再谈生产可用。
