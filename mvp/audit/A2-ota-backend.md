# A2 — OTA Backend 安全审计报告

- **审计对象**：`mvp/ota-backend/`（Hono on Cloudflare Workers + KV + R2，OTA 热更后端）
- **代码规模**：`src/` 约 586 LOC（8 文件）+ tests 4 文件（39 用例，全部通过）+ `scripts/publish-bundle.sh`
- **审计方式**：只读静态审计 + 本地复算（aws4fetch 签名行为、版本比较边界、git 跟踪状态、`npx vitest run`）
- **参考契约**：`openspec/changes/migrate-to-vite-capacitor-ota/contract.md`（ai-baby OTA 协议）
- **审计日期**：2026-05-29
- **依赖版本**：`aws4fetch@1.0.20`、`hono@4.6.3`、`wrangler@3.78.0`

测试基线：`npx vitest run` → **39 passed / 4 files**。

> **总体信任模型（先讲清楚再看 finding）**：本后端把"bundle 完整性"完全外包给两件事 ——（a）admin token 不泄露；（b）客户端 `CapacitorUpdater.download({checksum})` 下载后自校验。服务端**既不校验 checksum 是否为合法 sha256、也不校验它是否真的匹配 R2 对象**，且 `minNativeVersion` 门禁的输入（`nativeVersion`）由客户端自报。因此 admin token 是整个系统唯一的强信任根，下面多条 finding 都围绕"放大/收窄这个信任根"展开。

---

## Findings

### 维度 1 — R2 Presigned URL 安全（`lib/r2-presign.ts`）

#### F-01　admin 写入的 `r2Key` 未做前缀/规范化校验，`../` 可越权签出桶外对象　🟠High
`src/routes/admin.ts:60-65`（仅校验非空字符串）、`src/lib/r2-presign.ts:48-55`

- **问题**：admin `POST /admin/manifest` 对 `r2Key` 只校验 `typeof === 'string' && 非空`，不校验它是否以 `${appId}/` 开头，也不拒绝 `..` / 前导斜杠。该 `r2Key` 原样写入 manifest，`/check` 时直接喂给 `signR2GetUrl`。本地复算确认：`signR2GetUrl(env, '../io.petcards.app/secret.zip')` 经 `encodeURIComponent('..')='..'`（点不被编码）再被 `new URL()` 规范化后，路径变成 `/io.petcards.app/secret.zip` —— **bucket 段 `mvp-ota-bundles` 被 `..` 吃掉**，签出的 URL 指向账号下另一个同名顶层路径/桶，且签名对该错误路径有效。
- **影响**：① 跨 app 投毒——给 A 应用的 manifest 填 B 应用的 `r2Key`，使 A 的客户端下载 B 的 bundle（appId 隔离形同虚设）；② `..` 可让签名 URL 脱离 `mvp-ota-bundles/` 前缀，若账号内有同名顶层结构则可签出本不应公开的对象。虽然前提是持有 admin token，但"持 token 者只应能发布本 app 的合法 bundle"这一最小权限边界被打破，且 publish 脚本一旦被诱导传错 slug 也会无声越权。
- **建议**：admin 侧强制 `r2Key.startsWith(appId + '/')` 且正则白名单 `^[a-z0-9.]+\/[A-Za-z0-9._-]+\.zip$`，拒绝包含 `..`、`//`、前导 `/` 的 key；签名前再次断言前缀。理想做法是**根本不接收 `r2Key`**，由服务端用 `appId/${version}.zip` 自行拼装（version 已做白名单后），彻底消除注入面。

#### F-02　bundle 完整性无服务端保证：checksum 纯透传、不校验格式也不比对 R2 对象　🟠High
`src/routes/admin.ts:66-79`、`src/routes/check.ts:125`、契约 `contract.md:94`

- **问题**：admin 提交的 `checksum` 仅校验"是字符串"，未校验是否为 64 位 hex，更不会去读 R2 对象重算 sha256 做比对；`/check` 把它原样下发。契约确认校验只发生在客户端下载后（`CapacitorUpdater.download({checksum})`）。
- **影响**：服务端对"下发的 URL 指向的字节"零完整性认知。若 manifest 与 R2 不一致（如 publish 脚本上传成功但 checksum 算错、或 R2 对象被覆盖），客户端会一直校验失败、热更永久卡住，而服务端无从发现。配合 F-01，持 token 者可下发"合法 checksum + 指向任意对象的 URL"组合（虽然客户端校验会拦下不匹配的包，但这意味着 DoS 而非静默投毒）。
- **建议**：admin 入参强校验 `^[a-f0-9]{64}$`；可选地在 publish 时让服务端 `OTA_BUCKET.head(r2Key)` 确认对象存在（绑定已存在但运行时未用，见 F-13），有条件则比对 `httpMetadata`/自定义 metadata 里的 sha256。至少把"checksum 非 hex"挡在写入前。

#### F-03　双重编码：含 `%`/`+` 的 key 段会被 round-trip 改写，签名路径与 R2 实际 key 不一致　🟡Medium
`src/lib/r2-presign.ts:48-51` + aws4fetch S3 分支 `aws4fetch.esm.mjs:125-137`

- **问题**：路由先对每段 `encodeURIComponent`，而 aws4fetch 对 `service:'s3'` 会**先 `decodeURIComponent` 整个 pathname、再 `encodeURIComponent`**（`singleEncode` 未传，默认 false）。本地复算：key `100%done.zip` → 路由编码成 `100%25done.zip` → aws4fetch 解码回 `100%done.zip` 再编码 → 最终签 `100%25done.zip`（双编码叠加正确）；但若 R2 对象本身存的就是字面 `100%done`，签出的 `%25done` 会 404。`a+b.zip` → 签成 `a%2Bb.zip`，同理。对常规 key（`io.x.app/0.0.2-ts.zip`，仅点/连字符）是幂等的，所以现网大概率不触发——但属于隐性正确性地雷。
- **影响**：当前命名规范下不触发；一旦 version/key 出现空格、`%`、`+` 等字符即签出错误路径导致下载 404。与 aws4fetch 的语义重叠是"双重编码"反模式。
- **建议**：**不要手动 per-segment 编码**，把原始 key 交给 aws4fetch（它自己处理 S3 编码），或显式传 `aws: { signQuery: true, singleEncode: true }` 并自行保证编码恰好一次。配合 F-01 的 key 白名单（禁止特殊字符）可彻底规避。

#### F-04　签名 URL 暴露 R2 Access Key ID（SigV4 固有），需确保仅走 HTTPS 且不进日志　🟢Low
`src/lib/r2-presign.ts:58-61`、`src/routes/check.ts:114`

- **问题**：SigV4 presigned URL 的 `X-Amz-Credential` 段必然含 `R2_ACCESS_KEY_ID`（本地复算确认 `AKIDEXAMPLE/.../auto/s3/...`）。Secret Key 不出现（正确）。但 AK ID 会下发到所有客户端。
- **影响**：AK ID 本身非机密（仅 SK 是），单独泄露不可用于签名，风险低。但若 `/check` 的 URL 被记进客户端崩溃日志/代理日志/分析平台，会增加凭证侧写面。`check.ts:114` 的错误日志只记 `r2Key` 不记 URL（好）。
- **建议**：确认 R2 API token 是**最小权限（仅该桶 Object Read）**，便于泄露时快速轮换；不要把完整签名 URL 写进任何持久日志；保持 5min TTL（见 F-05，合理）。

#### F-05　TTL=300s 合理且生效（非默认 86400）　🟢Low / 信息项
`src/lib/r2-presign.ts:17,56`

- **结论**：本地复算确认 `X-Amz-Expires=300` 真正进入签名串（aws4fetch 仅在未显式设置时才回落 86400 默认）。相比 ai-baby 原系统的 24h，收紧到 5min 显著缩短了 URL 泄露后的可用窗口，配合 `responseTimeout:120` 客户端超时足够覆盖慢网重试。**评价为优点**，无需整改。

---

### 维度 2 — Admin 鉴权（`lib/auth.ts` + `routes/admin.ts`）

#### F-06　`timingSafeEqual` 非真常量时间：提前 length 比较 + JS 字符串/TextEncoder 旁路　🟡Medium
`src/lib/auth.ts:8-17`

- **问题**：实现先 `if (a.length !== b.length) return false`（按长度提前返回，泄露 token 长度信息），再逐字节 XOR。两处旁路：① 长度短路使攻击者能用响应时间区分"长度对不对"；② `new TextEncoder().encode()` 与按 `aBytes.length` 循环本身的耗时随输入长度变化，且 V8 字符串 `.length`/编码并非常量时间。注释自称"constant-time"名不副实。
- **影响**：理论上可通过计时侧信道逐步推断 token 长度/前缀。**实际可利用性极低**——目标是边缘网络（Workers 抖动巨大）、token 是高熵随机串（见 F-08）、无在线高频探测面。属于"实现与声明不符"的健壮性问题而非现实可利用漏洞。
- **建议**：用 Web Crypto 做 HMAC 包裹比较以抹平长度信息：对 `provided` 与 `expected` 各算 `HMAC-SHA256(randomKeyPerRequest, x)` 后再常量时间比对等长摘要；或直接接受现状但把注释从"constant-time"改为"best-effort timing-resistant"，避免误导。优先级低于 F-01/F-02。

#### F-07　CORS `Access-Control-Allow-Origin: *` 全局覆盖 admin 路由，与 `Authorization` 头并存　🟡Medium
`src/index.ts:21-29`（中间件 `app.use('*')` 在挂载 admin 路由之前生效）

- **问题**：全局 CORS 对所有路径（含 `/admin/*`）回 `ACAO: *` 且允许 `Authorization` 头。注释已标"permissive for MVP"。虽然 `*` 与 `Allow-Credentials: true` 不能共存（浏览器规则），且 admin 用的是 Bearer 而非 cookie，所以 CSRF 风险不大；但任意网页 JS 都能跨域读取 `/check` 响应、并向 `/admin/manifest` 发起请求（只是没 token 会 401）。
- **影响**：`/check` 响应（含签名 URL）可被任意源页面读取——放大 F-04 的 URL 泄露面。admin 端因 Bearer 不随浏览器自动携带，CSRF 影响有限。
- **建议**：上线前按设计注释收紧：`/check` 限定到实际 app 域名/移动端（移动端 WebView 通常不发 CORS preflight，可只为 web 平台放行白名单 origin）；`/admin/*` 不需要任何 CORS（仅 CI/CLI 调用），应单独不返回 ACAO。

#### F-08　admin token 无强度/长度要求，示例值弱且可被误用为生产值　🟡Medium
`src/lib/auth.ts:38`（仅校验 `expectedToken` 非空）、`.dev.vars.example:4`、`README.md:133,208`

- **问题**：`verifyAdminAuth` 只要求 `expectedToken` 非空，对长度/熵无任何约束。`.dev.vars.example` 与 README 示例用 `dev-admin-token-change-me` 这类低熵串。没有任何机制阻止运维把弱 token 直接 `wrangler secret put` 到生产。
- **影响**：admin token 是整个系统的唯一强信任根（见开头信任模型）。一旦设弱或沿用示例值，攻击者爆破/猜测成功即可发布任意 bundle 给数万终端（远程代码/内容投毒级影响）。
- **建议**：在启动或首次 admin 调用时断言 `OTA_ADMIN_TOKEN.length >= 32`（不达标直接 500 并日志告警）；文档强制 `openssl rand -hex 32` 生成；区分 dev/prod 值并在 README 顶部加粗警示"切勿在生产使用示例 token"。

#### F-09　admin 中间件覆盖完整（GET+POST 均拦截），评价为正确　🟢Low / 信息项
`src/routes/admin.ts:19-28`

- **结论**：`adminRouter.use('/admin/*', ...)` 在路由定义前注册，对 `POST /admin/manifest` 与 `GET /admin/manifest/:appId` 均生效；测试 `admin-manifest.test.ts:44-70,181-189` 覆盖了无头/错 token/缺 Bearer 前缀三种 401 场景。**鉴权覆盖无缺口**。唯一旁路是全局 CORS 的 `OPTIONS` 在 `index.ts:25-27` 提前 204 返回（preflight 不带 body、不触发写操作，无害）。无需整改。

---

### 维度 3 — 版本比较（`lib/version.ts`）

#### F-10　`minNativeVersion` 门禁输入由客户端自报，可被绕过　🟠High（设计层）
`src/routes/check.ts:86`、`src/lib/version.ts:11-24`

- **问题**：`compareVersions(nativeVersion, current.minNativeVersion)` 中的 `nativeVersion` 直接来自请求 body，无任何服务端校验/签名。本地复算确认：客户端只要上报 `nativeVersion:"999.999.999"` 即可让门禁恒过，下载本只应发给更新原生壳的 bundle。
- **影响**：`minNativeVersion` 的设计意图是"原生能力不足的旧壳别拉新 bundle 以免白屏/崩溃"。客户端自报使该保护可被任意绕过——恶意或被篡改的客户端能强行拉取不兼容 bundle，触发崩溃或回滚循环。这是 OTA"信任客户端自报版本"的固有弱点，但应被记录并接受。
- **建议**：这是协议层取舍，短期内接受（与 ai-baby 一致）。缓解：服务端可结合 `platform` 与可信渠道（如原生壳在 header 注入签名版本）交叉校验；或在客户端 `CapacitorUpdater` 配置层用 `resetWhenUpdate` 兜底。报告中标注为"已知设计风险"。

#### F-11　`compareVersions` 弱语义：忽略前导零、忽略预发布标识、忽略非数字段　🟢Low
`src/lib/version.ts:26-35`

- **问题**：`splitVersion` 按 `[^0-9]+` 切分只取数字段。本地复算：`1.01.0 === 1.1.0`（前导零）、`v1.2.3 === 1.2.3`（前缀 v 被吞）、`abc` 与 `xyz` 都 →`[]`→ 相等（全零）。`0.0.1-rc1` 会被解析成 `[0,0,1,1]` 比 `0.0.1` 大（注释已说明）。
- **影响**：仅用于 `minNativeVersion` 门禁。误差场景（如 `0.0.5` vs `0.0.5-rc`）可能让"应被门禁"的边界版本被放行/误拦，影响面小且与原 Java 实现行为一致（契约 §6 明确不做严格 semver）。bundle 版本走字符串全等，不受影响。**失败方向偏安全**：纯垃圾 `nativeVersion`→`[]`→恒小于任意 minNative→被门禁（fail-safe），见 F-10 复算。
- **建议**：保持与契约一致即可；若未来切真 semver，集中改这一处并补预发布优先级用例。当前无需整改。

#### F-12　版本号无注入风险，评价为安全　🟢Low / 信息项
`src/lib/version.ts`、`src/routes/check.ts:99`

- **结论**：版本字符串只参与 `===` 全等与数字切分比较，不进入 KV key（key 是 `manifest:${appId}`，appId 已白名单）、不进入 R2 路径拼接（除非经 `r2Key`，见 F-01）、不拼 SQL/命令。无注入面。大数字段 `parseInt` 在时间戳量级（13 位）内不溢出 double 精度。无需整改。

---

### 维度 4 — Manifest 管理（`lib/manifest.ts`）

#### F-13　KV 读改写无事务/无 CAS，并发 publish 存在丢更新（lost update）　🟠High
`src/routes/admin.ts:73-85`、`src/lib/manifest.ts:38-40,46-64`

- **问题**：`POST /admin/manifest` 是典型 read-modify-write：`readManifest` → `appendBundle` → `writeManifest`，三步之间无锁、无 CAS、无版本号。Cloudflare KV 不提供事务/条件写。两次并发 publish（或 publish 与未来的 enabled-toggle 接口）交错时，后写者用的是"读到的旧 manifest"，会**覆盖**前者刚写入的 current，导致一次发布连同其 history 条目永久丢失。
- **影响**：多人/CI 并发发布（5 个产品共用一个后端，CI 矩阵并行很常见）时，manifest.current 可能停留在错误版本、history 缺条目。OTA 场景下"current 指向哪个 bundle"是关键状态，丢更新意味着用户可能收不到本应发布的版本，或 history 无法用于排障/回滚。叠加 KV 最终一致（≤60s）窗口，问题更隐蔽。
- **建议**：① 简单缓解——publish 串行化（CI 层加并发锁/队列，文档明确"勿并发发布同一后端"）;② 结构性修复——改用支持事务的存储（D1 单表 + `UPDATE ... WHERE version=?` 乐观锁，或 Durable Object 串行化每个 appId 的写）。MVP 阶段至少把该限制写进 README"Open ops items"。

#### F-14　缺少 manifest schema 校验：KV 中损坏/恶意 JSON 会被部分信任，`current` 无字段校验　🟡Medium
`src/lib/manifest.ts:19-35`

- **问题**：`readManifest` 仅做"是 object、enabled 归一、history 保证数组"的浅归一，**不校验 `current` 的内部结构**（`current.r2Key`/`current.checksum`/`current.version` 可能缺失或类型错误）。若 KV 值被手工编辑坏、或写入路径被绕过塞入畸形数据，`check.ts:83` 拿到的 `current` 可能 `r2Key=undefined`，进而 `signR2GetUrl(env, undefined)` 抛错（被 try/catch 兜成 enabled:false，结果偏安全但掩盖问题）；`current.checksum=undefined` 则下发 `checksum:undefined`。
- **影响**：现网写入路径受 admin 鉴权保护，畸形数据主要来自人工误操作或 F-01/F-13 衍生的脏写。后果是静默降级（enabled:false）或下发无 checksum 的响应，排障困难。
- **建议**：`readManifest` 对 `current`（及 `history[]`）做字段级校验（version/r2Key/checksum 均为非空字符串、checksum 为 hex），不合规则视为 `current:null` 并 `console.warn`，把损坏可观测化。

#### F-15　`appendBundle` 无法关闭 enabled，也无回滚接口——kill switch 与回滚缺失　🟡Medium
`src/lib/manifest.ts:60`（`enabled: base.enabled !== false`）、`src/routes/admin.ts` 全文、`README.md:238`

- **问题**：① `appendBundle` 每次发布强制 `enabled: base.enabled !== false`——一旦曾被设为 false，新发布会把它**重新打开**，且**没有任何 API 能把 enabled 置 false**（kill switch 只能靠手工 `wrangler kv` 改值或直接编辑）。② 没有"回滚到 history[n]"的接口；README 说 history 留 20 条"够回滚调查"，但代码层没有回滚动作——回滚=重新 publish 老 bundle（要重新上传或复用旧 r2Key）。
- **影响**：线上 bundle 出事故需紧急止血时，运维只能去 dashboard 手改 KV（易错、慢、无审计），违背"OTA 必须有快速 kill switch"的运维常识。回滚同样缺乏一键能力。
- **建议**：新增受同一鉴权保护的 `POST /admin/manifest/:appId/disable`（仅翻 `enabled`，不动 current）与 `POST /admin/manifest/:appId/rollback`（把 `history[0]` 提回 current）。两者都是轻量读改写，注意同样受 F-13 并发问题约束，建议与 F-13 一并按 D1/DO 方案落地。

#### F-16　history 上限 20 生效正确；R2 对象不随 history 滚动回收（已知 ops 项）　🟢Low / 信息项
`src/lib/manifest.ts:62`、测试 `admin-manifest.test.ts:131-152`、`README.md:244`

- **结论**：`history.slice(0, MAX_HISTORY)` 行为正确，测试覆盖了"22 次发布后 history=20、最旧 v2、v1 滚掉"。R2 对象不自动 GC（README 已坦承，留作手工 prune）。无安全问题，仅成本/存储增长项，已被文档记录。无需整改。

---

### 维度 5 — Check 路由（`routes/check.ts`）

#### F-17　appId 白名单 + 未知→400 策略一致且正确，入参校验充分　🟢Low / 信息项
`src/routes/check.ts:43-72`、测试 `check.test.ts`

- **结论**：`/check` 对 appId 走 `isKnownAppId` 白名单、未知返回 400（与 admin 一致，测试覆盖）；platform 限 `ios|android|web`；nativeVersion 必填;JSON 解析失败 400。校验顺序合理、错误码规范。**信息泄露注意点**：`check.ts:55` 与 `admin.ts:94` 把未知 appId 原样回显进错误消息（`Unknown appId: ${appId}`），属轻微反射，appId 非敏感且白名单已知，风险可忽略。整体评价为良好。

#### F-18　R2 签名失败降级为 `enabled:false`——行为安全但语义可能误导客户端　🟢Low
`src/routes/check.ts:110-118`

- **问题**：签名异常时返回 `{enabled:false, updateAvailable:false}`。这与"manifest 缺失/被 kill"返回值完全相同，客户端无法区分"功能被关"与"后端临时签名故障"。
- **影响**：临时 R2 凭证故障会被客户端理解为"OTA 关闭"，不会重试升级（因为 enabled:false 通常意味着别再问了）。属可用性/可观测性问题，非安全漏洞。`check.ts:114` 已记服务端日志（好）。
- **建议**：签名失败更适合回 5xx（让客户端按瞬时错误重试），或保留 enabled:true 但 updateAvailable:false + 一个区分性 message。至少保留现有 `console.error` 以便 `wrangler tail` 观测。

---

### 维度 6 — OTA 协议正确性（对照 `contract.md`）

#### F-19　路由路径与契约存在 `/api` 前缀偏差，需确认客户端配置对齐　🟡Medium
`src/index.ts:6`、`src/routes/check.ts:21`（`/mobile-updates/check`）vs 契约 `contract.md:13,19`（`/api/mobile-updates/check`）

- **问题**：契约多处写 `POST /api/mobile-updates/check`，本实现路由是 `/mobile-updates/check`（无 `/api` 前缀）。admin 路由 `/admin/manifest` 也无 `/api`。
- **影响**：若移动端 `mobileUpdates.ts` 沿用契约里的 `/api/...` 路径，会全量 404、热更完全不工作。这不是后端代码 bug，但属于**契约一致性缺口**，集成时是高频踩坑点。
- **建议**：确认 `VITE_OTA_BACKEND_URL` 拼接的最终路径与后端一致（要么后端加 `/api` 前缀，要么客户端去掉）。在 README/契约里统一并加一行集成自检 curl。

#### F-20　响应字段与契约一致性良好，仅 `enabled:false` 时省略 version 属合理收敛　🟢Low / 信息项
`src/types.ts:54-62`、`src/routes/check.ts:78-129`、契约 `contract.md:35-51`

- **结论**：`CheckResp` 字段（enabled/updateAvailable/version/url/checksum/minNativeVersion/message）与契约 §2 出参一一对应；同版本短路返回中文 message、minNativeVersion 门禁返回提示文案，均符合 ai-baby 语义。契约出参在 disabled 时 version 可为 null，本实现直接省略字段（`enabled:false` 不带 version），对客户端 `??`/可选读取无碍。bundle 完整性保证依赖客户端 checksum（见 F-02），与契约 §6 一致。无需整改。

---

### 维度 7 — `publish-bundle.sh`

#### F-21　slug→appId 映射与白名单一致；zip 根校验、sha256 跨平台处理正确　🟢Low / 信息项
`scripts/publish-bundle.sh:38-48,108-115,118-136`

- **结论**：① slug→appId 映射的 5 个目标与 `types.ts::KNOWN_APP_IDS` 完全一致（io.shijingnaming/countdownpro/plantdoctor/dreamjournal/petcards.app），未知 slug 走 `return 1` 报错退出；② `index.html` 在 dist 根校验存在（line 122-125），`cd "$DIST_DIR" && zip -qr "$ZIP_PATH" .` 保证 zip 内 index.html 在根（符合契约 §4）；③ checksum 优先 `shasum -a 256`、回落 `sha256sum`，跨 macOS/Linux 正确；④ `set -euo pipefail` + 依赖检查 + `curl --fail` 错误处理到位。整体质量良好。

#### F-22　admin token 经环境变量传给 `curl --header`，进程参数表/历史存在短暂暴露面　🟡Medium
`scripts/publish-bundle.sh:170`、`README.md:208`

- **问题**：`--header "Authorization: Bearer ${OTA_ADMIN_TOKEN}"` 把 token 拼进 curl 命令行。在多用户主机上，`ps auxww` 可在请求存续期间看到完整 token；若用户在交互 shell `export OTA_ADMIN_TOKEN=...` 还会落入 shell history（README:208 正是教用户 export）。脚本本身未 `set -x`（好），不会主动打印 token。
- **影响**：CI 隔离 runner 上风险低；但本地开发机/共享跳板机上 token 可能被旁观进程或 history 文件捕获。token 一旦泄露即等同 F-08 的最坏后果。
- **建议**：改用 `curl --header @-` 从 stdin 读 header，或 `curl -H "Authorization: Bearer $TOKEN"` 配合 `--config <(printf 'header = "..."')` 进程替换避免出现在 argv;文档改用 `read -rs OTA_ADMIN_TOKEN`（不入 history）或从 secret manager 注入而非 `export`。

#### F-23　VERSION 默认含时间戳、未约束字符集，可经 `r2Key` 流入签名路径　🟢Low
`scripts/publish-bundle.sh:85,139`

- **问题**：默认 `VERSION="${PKG_VERSION}-$(date +%Y%m%d%H%M%S)"`，`R2_KEY="${RESOLVED_APP_ID}/${VERSION}.zip"`。若用户显式传入含空格/特殊字符的 `MOBILE_UPDATE_VERSION`，会原样进 r2Key，叠加 F-03 编码问题导致下载 404。
- **影响**：默认路径安全（时间戳纯数字+连字符）；仅自定义 version 含特殊字符时触发，且与 F-01/F-03 同源。
- **建议**：脚本里对 VERSION 加正则校验 `^[A-Za-z0-9._-]+$`，不合规即报错退出，从上游堵住 F-03。

---

### 配置/部署杂项

#### F-24　`.dev.vars` 含密钥占位符但已被 gitignore 且未入库——评价为正确处理　🟢Low / 信息项
`.gitignore:3`、复算 `git check-ignore` + `git ls-files`

- **结论**：实测 `.dev.vars` 被 `.gitignore` 命中且 `git ls-files` 未跟踪，内容仅为 dev 占位符（`dev-admin-token-change-me` 等），无真实密钥泄露。生产密钥走 `wrangler secret put`（运行时注入，不入 wrangler.toml）。密钥管理姿势正确。仅提醒：`.dev.vars.example` 的占位符不应被任何人当真值使用（见 F-08）。

#### F-25　`wrangler.toml` 占位 id 与超前 compatibility_date　🟢Low
`wrangler.toml:3,16-17,31`

- **问题**：① `compatibility_date = "2026-05-01"` 超出本地 runtime 支持上限（测试日志报回落到 `2024-12-30`）——部署到真实 Workers 时需确认该日期受支持，否则行为可能与本地测试不一致；② KV id 为占位 `0000...`、`R2_ACCOUNT_ID="REPLACE_ME_ACCOUNT_ID"`，属未完成配置（部署前必填）。
- **影响**：未替换占位值会导致部署即失败或绑定到错误命名空间，属部署 checklist 项而非代码缺陷。
- **建议**：部署前替换全部占位；compatibility_date 取实际可用的近期日期并与 wrangler 版本对齐。

---

## Top 3 必修

1. **F-01（🟠High）admin `r2Key` 未做前缀/规范化校验** —— 强制 `r2Key` 以 `${appId}/` 开头并白名单字符集、拒绝 `..`，最好改由服务端用 `appId/${version}.zip` 自拼。这是 appId 隔离与最小权限的根本防线，且修复成本最低（几行校验）。

2. **F-13（🟠High）manifest 读改写无事务，并发发布丢更新** —— 5 产品共用后端 + CI 并行的现实下迟早触发 current/history 错乱。短期在 CI 串行化并写进文档，中期迁 D1 乐观锁或 Durable Object 串行化每 appId 写入。

3. **F-08（🟡Medium，但信任根级）admin token 无强度校验 + 示例值弱** —— admin token 是全系统唯一强信任根，一旦弱/沿用示例即等同向数万终端开放任意 bundle 投毒。启动时断言 `length>=32`，文档强制 `openssl rand -hex 32` 并加粗"勿用示例值上生产"。

> 紧随其后建议处理 **F-02（服务端 checksum 不校验格式/不比对）** 与 **F-15（缺 kill switch / 回滚接口）**——前者补 `^[a-f0-9]{64}$` 校验成本极低，后者是 OTA 上线前的运维硬需求。

---

## 健康评分：**B−**

代码整洁、职责分层清晰、测试覆盖扎实（39 用例覆盖核心分支）、TTL 收紧、密钥不入库、admin 鉴权覆盖无缺口、publish 脚本质量高——工程基本功在 MVP 水准之上。扣分集中在**信任边界的几个结构性缺口**：`r2Key` 注入（F-01）、KV 无事务并发丢更新（F-13）、服务端零完整性校验（F-02）、缺 kill switch/回滚（F-15）、token 强度无门槛（F-08）。这些都不是"写错了"，而是"MVP 阶段尚未补齐"的安全/运维护栏，且多数修复成本很低。补齐 Top 3 + F-02/F-15 后可达到 B+/A−。

## 一句话总评

工程素养扎实的 MVP 级 OTA 后端，主要风险不在实现 bug 而在"把太多信任压在单一 admin token + 客户端自校验上"——补齐 `r2Key` 校验、KV 并发防护、token 强度门槛与 kill switch 这几道护栏即可放心上线。
