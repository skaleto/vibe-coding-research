# A4 前端审计报告 — 04 梦境日记 + 05 宠物心情卡片

**审计员**：资深前端审计 + 合规专家
**日期**：2026-05-29
**审计模式**：只读，不改代码
**对照标准**：`light-products/compliance-checklist.md` § 4 + § 5
**审计范围**：
- `mvp/products/04-dream-journal/src/`
- `mvp/products/05-pet-cards/src/`

---

## 一、总体结论速览

两个产品的**合规护栏整体设计扎实**，命脉机制（危机三级检测、disclaimer 客户端强制注入、禁词 lint、热线零硬编码、娱乐免责）在代码层面均已落地，且大量带「不依赖 LLM 自觉」「客户端兜底再跑一次」的防御式注释与实现。这是一份明显经过 Codex Review 加固的代码。

**但存在若干会削弱合规护栏的真实缺口**，其中 1 条 Critical（04 反沉迷弹窗完全缺失，违反 § 4.D 硬性条款）、若干 High（一级危机存在理论绕过路径、热线兜底文案在 crisis 页重复、lint 禁词清单与 checklist 不完全对齐）。详见下文。

---

## 二、产品 04 梦境日记 — Findings

### F04-01 反沉迷弹窗完全未实现 🔴 Critical [合规]
**file**: `mvp/products/04-dream-journal/src/` (全局缺失，应在 `App.tsx` / 新组件)
**问题**：compliance-checklist § 4.D 明确要求「反沉迷弹窗：连续 7 天/天 30 次记录梦境自动触发休息提示」。全 src grep `反沉迷 / 休息 / 连续 / streak / rest` 均无任何实现，`stats.ts` 只有一个 `recorded` 累计计数器，无「按天计数」「连续天数」逻辑。
**影响**：这是 checklist 中带 checkbox 的硬验收项，未通过项「一律不上架」。对一个主打"心理 / 情绪"且自带危机干预的产品，反沉迷缺失在监管与舆论上都是放大项。
**建议**：实现按天计数 + 连续天数追踪（localStorage），命中 7 天连续或单日 30 次时弹出非阻断式休息提示。上架前必补。

### F04-02 一级危机存在「绕过 redirect 仍写库 / 仍可能触发分析」的窄路径 🟠 High [合规]
**file**: `src/components/DreamInput.tsx:85-89` + `src/routes/AnalyzingPage.tsx:39-44` + `src/lib/llm.ts:84-92`
**问题**：危机拦截做了三层（DreamInput 提交前、AnalyzingPage useEffect 兜底、llm.analyzeDream 内再跑），设计良好。但 DreamInput 的拦截逻辑是：
```ts
const crisis = detectCrisis(trimmed);
if (crisis.level === 1) { navigate('/crisis'); return; }
```
此处一级命中**确实**在写库与发请求前 return，符合「不发任何 fetch」。**但**用户可手动导航 `/analyzing?id=xxx`（id 来自已保存的 0 级记录），若某条记录文本在 DreamInput 当时是 0 级、之后关键词表更新后变成 1 级，AnalyzingPage 的兜底 `detectCrisis` 会用**新表**重判并 redirect —— 这是好的。真正的窄缝在 llm.ts：二/三级返回 supportive mock 时，若关键词表存在「同一句既含 L1 词又含 L2 词」但 L1 词因大小写 / 全半角差异未命中（见 F04-04），可能降级到 L2 而非 redirect。属于「检测时机本身没问题，但依赖单一关键词命中」的脆弱点。
**影响**：正常流程无法绕过一级 redirect（三层防御 + replace 跳转），护栏**实践上不可被普通用户绕过**。残余风险来自关键词漏配而非流程缺陷。
**建议**：把「一级命中」的判定从纯 `includes` 升级为「归一化（去空格 / 全角转半角 / 去标点）后匹配」，详见 F04-04；并在 AnalyzingPage redirect 前，对已保存记录回写 `crisisLevel=1` 以留痕。

### F04-03 detectCrisis 对文本未做归一化，存在规避空间 🟠 High [合规]
**file**: `src/lib/detectCrisis.ts:42-48`
**问题**：仅做 `text.toLowerCase()` 后 `includes(kw)`。中文关键词对以下情况会漏判：
- 插入空格 / 标点："自 杀"、"想·死"、"跳　楼"（全角空格）
- 全角英文 / 数字混排
- 拆字 / 谐音（"自sha"、"4了"）—— 谐音 MVP 可不强求，但空格 / 标点穿插是高频规避手段
英文表同理（"k i l l myself"）。
**影响**：危机检测是人身安全命脉，"保守优先，宁可误报不可漏报"是其设计原则（见文件头注释），但当前实现对最简单的空格穿插就会漏。
**建议**：匹配前对 normalized 文本执行：去除所有空白字符 + 全角转半角 + 去除常见标点（保留汉字 / 字母 / 数字）。这能在不增加误报的前提下显著提升召回。

### F04-04 一级关键词表对部分高危新词 / 变体覆盖不全 🟡 Medium [合规]
**file**: `src/lib/crisisKeywords.ts:27-68`
**问题**：一级表较完整（自杀 / 跳楼 / 上吊 / 割腕 / 想死 / 自残等齐全），但缺少若干常见高危表达：
- "不想醒了" / "再也不想醒" / "睡过去就好了"（梦境语境下尤其相关）
- "解脱" / "想解脱"（极高频自杀委婉语，当前完全缺失）
- "活着好难"（介于 L1/L2）
- 谐音 / 拼音规避（见 F04-03）
二级表的"破防"已收录（符合 § 4.B 网络新词要求），三级"emo / 摆烂"也在，这点是达标的。
**影响**：漏配直接等于漏检，对命脉而言是实质风险。checklist § 4.B 要求「三级关键词系统每月复核」，但"解脱"这类应在**一级**。
**建议**：补充"解脱 / 想解脱 / 不想醒 / 睡过去算了"等到一级；建立词表 review 时把"委婉自杀表达"作为独立类目。

### F04-05 误报（False Positive）反馈机制未实现 🟡 Medium [合规]
**file**: `src/routes/CrisisPage.tsx` (缺失) + `src/lib/detectCrisis.ts:30-32`
**问题**：detectCrisis 注释明确写「不做否定语境过滤（'我不想自杀'仍触发）」并采用保守策略——这是对的。但 checklist § 4.B 要求「False Positive 处理：触发后允许用户标注'误报'，反馈到关键词优化」。CrisisPage 没有任何"这是误报 / 我只是在描述梦境"的反馈入口，crisisKeywords.ts 也无对应埋点钩子。
**影响**：纯合规清单项缺失。另外，保守策略 + 无误报出口意味着普通用户描述"梦到割腕"会被强制拦截且无法申诉，长期可能伤害留存。注意：误报反馈**不得**变成"继续分析"的绕过后门（§ 4.B「删除继续分析按钮」优先级更高）。
**建议**：在 CrisisPage 增加一个不通向分析的"标记为误报"链接，仅上报埋点（不解锁分析），既满足 § 4.B 又不破坏 § 4.B 的禁绕过要求。

### F04-06 语音输入无 native fallback，且与 § 4 录音迁移要求脱节 🟡 Medium
**file**: `src/components/DreamInput.tsx:50-78`
**问题**：语音输入纯走 Web Speech API（`SpeechRecognition` / `webkitSpeechRecognition`）。在 iOS WKWebView（Capacitor 容器）中 Web Speech API **不被支持**，会直接落到 `setVoiceErr('当前浏览器不支持语音输入…')`。即 App 打包成 iOS 原生后，语音输入在最主要的目标平台上是失效的。
- 好的一面：speech-recognition plugin 已从 package.json **干净移除**（grep 无 `@capacitor-community/speech-recognition` 残留），无悬空 import，迁移残留干净。
- 问题：移除 plugin 后没有补任何 native fallback，文档化的"native fallback"在 04 实际不存在（05 的 AudioRecorder 有完整 MediaRecorder web 路径，04 没有等价物）。
**影响**：非合规，但属功能性缺陷。iOS 用户点"语音输入"必报错。
**建议**：要么在 UI 上对 native 容器隐藏语音入口（`Capacitor.isNativePlatform()` 判断），要么接入支持 WKWebView 的 STT 方案。当前至少应让错误文案对原生环境更准确。

### F04-07 `crisisLevel` 一级未回写到已保存记录 🟡 Medium [合规]
**file**: `src/components/DreamInput.tsx:95-102` + `src/routes/AnalyzingPage.tsx:41-44`
**问题**：DreamInput 一级命中时直接 `navigate('/crisis')` 且**未保存记录**（这部分是对的，不留梦境原文符合隐私）。但 checklist § 4.B 要求「后台告警 + 隐私保护下记录触发标记」。当前一级命中后既无埋点上报，也无任何"触发标记"留痕（detectCrisis 返回了 `matched` 关键词用于埋点，但 DreamInput / AnalyzingPage 都没消费它）。
**影响**：合规清单要求的"后台告警 + 触发标记"在客户端侧无任何落地钩子。
**建议**：一级命中时调用一个埋点函数（仅上报 level + matched 关键词 + 时间戳，**不**上报梦境原文），满足"隐私保护下记录触发标记"。

### F04-08 lint 禁词清单与 checklist § 4.C 不完全对齐（缺"预测"等）🟡 Medium [合规]
**file**: `src/lib/complianceLint.ts:17-38`
**问题**：`FORBIDDEN_PHRASES` 覆盖了算命 / 解梦 / 占卜 / 运势 / 吉凶 / 灵性等，但 checklist § 4.C 列明的「预测 / 命理 / 阴阳 / 测命」**未全部纳入 lint**：
- "预测"：未在 lint 表中。而 `MonthlyPage.tsx:123`、`disclaimer.ts`、`prompts.ts`、`mockAnalysis.ts` 都在**否定语境**用了"预测"（"不构成…预测"），语义安全；但因为"预测"不在 lint 表，lint 对它**完全无监控**，未来若有人正面使用"预测你的运势"不会被拦。
- "命理 / 测命 / 阴阳"同样未单独列入（"八字"在，但"测命""阴阳"不在）。
**影响**：lint 作为 CI gate 存在盲区，与 checklist 的禁词全集不一致。
**建议**：把 § 4.C 全部禁词（含预测 / 预示 / 命理 / 测命 / 阴阳 / 灵性）加入 FORBIDDEN_PHRASES；对"预测"这类会在免责文案中合法出现的词，依赖现有 `ALLOW_FORBIDDEN_PHRASE_IN` 白名单机制放行 disclaimer.ts / prompts.ts / AboutPage.tsx / MonthlyPage.tsx 即可（注意 MonthlyPage.tsx 目前**不在**白名单内，加词后需补进白名单，否则 CI 会误报）。

### F04-09 热线 fallback 文案在 CrisisPage 出现"双重兜底"轻微冗余 🟢 Low [合规]
**file**: `src/routes/CrisisPage.tsx:48-55`
**问题**：CrisisPage 同时渲染了 `hotlines.map(renderHotlineLine)`（每条占位热线都返回 fallback 文案）**和** `GENERIC_CARE_FALLBACK`。由于两条占位热线都未核验，`renderHotlineLine` 各自输出一遍"请联系本地紧急电话 / 可信任的人…"，再加上 GENERIC_CARE_FALLBACK，用户会看到 3 段语义高度重复的兜底文字。
**影响**：合规上**安全**（绝无硬编码号码，fallback 完全合规），但体验上啰嗦。
**建议**：当所有热线均未核验时，只显示一条 GENERIC_CARE_FALLBACK，隐藏逐条占位行；核验后再逐条展示。

### F04-10 AnalyzingPage 进度 interval 与真实完成无关联（纯装饰）🟢 Low
**file**: `src/routes/AnalyzingPage.tsx:23-28`
**问题**：4 步文案的 `setInterval` 每 1800ms 推进且封顶在最后一步，与真实分析完成时机完全解耦。若 LLM 8-10s 才返回，进度条早已"卡"在最后一步；若 mock 瞬间返回，用户几乎看不到中间步骤。属常见无害模式，但"正在准备 3 个反思问题…"这类文案在真实未发请求（二/三级走 mock）时仍然展示，略有误导。
**影响**：纯体验，无合规问题。
**建议**：可接受。如要打磨，让步进与 promise 状态联动。

### F04-11 FirstLaunchGate "退出"按钮跳 about:blank 体验突兀 🟢 Low
**file**: `src/components/FirstLaunchGate.tsx:48-52`
**问题**：用户不同意免责声明时点"退出"，执行 `window.location.href = 'about:blank'`。在原生容器里这会把 WKWebView 导到空白页且无法返回，等于"卡死"。强阻断设计本身符合 § 4.D 首启弹窗要求，但退出实现粗糙。
**影响**：体验问题，合规上"必须同意才能用"的强阻断是达标的。
**建议**：原生端改为 `App.exitApp()`（Capacitor），web 端可保留或提示关闭页面。

---

## 三、产品 05 宠物心情卡片 — Findings

### F05-01 AudioRecorder 残留整套 VoiceRecorder native 死代码 🟠 High
**file**: `src/components/AudioRecorder.tsx:10-15, 50, 112-174, 240-252`
**问题**：package.json 已**干净移除** `capacitor-voice-recorder`（grep 确认无依赖），但组件内：
- 保留了一个手写的 `VoiceRecorder` stub 对象（所有方法返回 false / 空）。
- `isNative` 被 `useRef(false)` **硬编码为 false**，注释说明"iOS WKWebView 支持 MediaRecorder，已删 native dep"。
- 因此 `startRecordingNative` / `stopRecordingNative`（约 60 行）**永远不可达**——它们调用 stub，而 stub 永远不会被走到（`startRecording`/`stopRecording` 的 `if (isNative.current)` 恒为 false）。
**影响**：无运行时风险（web 路径正确），但这是迁移残留死代码，增加维护误读风险：未来有人误以为 native 录音"已接好"。`stopRecordingNative` 还引用了不存在的真实 plugin 返回结构。
**建议**：删除 `VoiceRecorder` stub、`isNative` ref、两个 `*Native` 函数及 `base64ToBlob`（仅 native 路径用），`startRecording`/`stopRecording` 直接调 web 版。纯 web 路径已完备。

### F05-02 MediaRecorder web 录音路径正确性良好，但权限拒绝判定依赖错误信息字符串 🟡 Medium
**file**: `src/components/AudioRecorder.tsx:223-232`
**问题**：web 录音整体实现正确——`getUserMedia` → `MediaRecorder` → `ondataavailable` 收集 chunks → `onstop` 合成 Blob，mime 候选探测（webm/opus → mp4 → ogg）合理，10s 上限通过 `setInterval` 检查 `elapsed >= MAX_DURATION_SEC` 自动 `stop`（§ 5.C 的 10s 上限**达标**），最小 1s 校验也在。权限拒绝时判定靠 `msg.toLowerCase().includes('permission'|'denied')`。
**影响**：不同浏览器 getUserMedia 拒绝抛出的是 `NotAllowedError`（name 字段），message 文案不保证含"permission/denied"（尤其中文 / 本地化浏览器）。判定可能误落到通用错误分支而非 `denied` UI。
**建议**：改用 `err.name === 'NotAllowedError' || err.name === 'SecurityError'` 判定权限类，`NotFoundError` 判定无设备，比 message 文本可靠。

### F05-03 海报 disclaimer 强制嵌入达标，但字号 / 对比度偏弱，逼近 § 5.C 红线 🟡 Medium [合规]
**file**: `PosterStyle1.tsx:113-116`、`PosterStyle2.tsx:104-107`、`PosterStyle3.tsx:138-144`
**问题**：三套海报底部都**强制**嵌入了 `DISCLAIMER`（来自 types 常量，组件硬编码、无 prop 开关、用户**不可删除**——§ 5.B「不可隐藏/不可删除」**达标**）。但呈现弱：
- Style1：`text-[11px]` + `opacity: 0.55`
- Style2：`text-[10px]` + 颜色 `#BBB`（白底上的浅灰，对比度很低）
- Style3：`text-[10px]` + `#7A5C3D`（牛皮纸上的棕色，尚可）
§ 5.C 明确「Disclaimer 在所有海报底部以可读字号呈现（不能用 1pt 字号糊弄）」。10px 在 540×960 的海报画布上换算后偏小，Style2 的 `#BBB` 浅灰对比度尤其不足，截图/缩放后接近不可读。
**影响**：未触线（不是 1pt），但 Style2 的浅灰小字在审核员或维权场景下可被质疑"变相弱化免责"。
**建议**：统一 disclaimer 最小 12px 等效字号，opacity ≥ 0.7，Style2 改用更深的灰（如 `#888`），保证缩放后仍清晰可读。

### F05-04 水印 / 二维码"付费版可选移除"逻辑未实现 🟡 Medium [合规]
**file**: 三套 Poster 组件 + `PosterActions.tsx`
**问题**：§ 5.C 要求「水印/二维码不可移除（免费版固定，付费版可选透明）」。当前水印（`@宠物心情卡片`）和 QRCodePlaceholder 在三套海报里都是**写死**的（这对免费版是对的、合规的）。但完全没有"付费版可选透明"的开关入口，也没有付费态判断。MVP 阶段可接受（无付费体系），但需明确这是"免费版全锁死"而非"已实现可选"。
**影响**：当前状态合规（水印全程不可移除）。仅为与 checklist 完整度对齐的提示。
**建议**：MVP 维持现状即可；接入付费后再加透明开关，且必须确保 disclaimer **始终**不可移除（仅水印/QR 可透明）。

### F05-05 HomePage 提交流程 submitting 状态在成功路径未复位 + 提前导航 🟡 Medium
**file**: `src/routes/HomePage.tsx:33-67`
**问题**：`submit` 先 `setSubmitting(true)` → 立即 `navigate('/analyzing')` → await `generatePetCard` → 成功则 `navigate('/result')`。成功路径**没有** `setSubmitting(false)`（无 finally）。因为成功会导航走、组件卸载，实践上无 bug；但若 generatePetCard 极快返回或导航被拦截，`submitting` 可能滞留 true 导致录音按钮 disabled。另外"先导航到 analyzing 再发请求"使 AnalyzingPage 与请求是并行的两套计时（AnalyzingPage 12s 兜底回首页 vs llm 8s 超时），靠 HomePage 成功后 `navigate('/result', {replace})` 抢先——竞态上 8s < 12s 通常安全，但耦合脆弱。
**影响**：边界 bug，正常网络下不可见。
**建议**：`submit` 包 `try/finally` 复位 submitting；或把 loading 状态完全交给 AnalyzingPage，HomePage 不自己管 submitting。

### F05-06 AnalyzingPage / llm 超时窗口耦合，深链直达会空转 12s 🟢 Low
**file**: `src/routes/AnalyzingPage.tsx:25-29` + `src/lib/llm.ts:60`
**问题**：AnalyzingPage 自身不发请求（注释说明由 HomePage 驱动），用户深链 `/analyzing` 直达会空转 12s 才回首页。llm 超时 8s、AnalyzingPage 兜底 12s，两个魔数无共享常量。
**影响**：纯体验，深链是非典型路径。
**建议**：可接受。如打磨，把超时抽成共享常量。

### F05-07 mockScenarios 第 7 条用「先写错再覆盖」的怪异写法 🟢 Low
**file**: `src/lib/mockScenarios.ts:108-133, 340-354`
**问题**：第 7 条（雪团 困倦）在数组字面量里写了一个 `[...].length === 3 ? {...} : {fallback}` 的三元怪胎，然后第 340 行又 `MOCK_SCENARIOS[6] = {...}` 整条覆盖。等于同一条数据写了两遍、第一遍是死逻辑。
**影响**：无运行时问题（最终被覆盖为正确值），纯代码异味，易误导维护者。
**建议**：删掉数组内第 7 条的三元写法，直接写正常对象；删掉第 340 行的覆盖。

### F05-08 mockScenarios name 替换用未转义的 RegExp，特殊字符名会抛错 🟢 Low
**file**: `src/lib/mockScenarios.ts:372-374`
**问题**：`line.replace(new RegExp(picked.name, 'g'), userName)` —— `picked.name` 是预设名（奶油 / 大黄等，安全）。但此模式若被复用到用户输入名，且名字含正则元字符（`(`、`*`、`+`、`?`），`new RegExp` 会抛 SyntaxError。当前 picked.name 全是安全中文，故**暂不触发**；但 petName 用户可输入任意字符（HomePage `maxLength=20` 无字符校验）。注意此处替换的是 `picked.name`（预设）不是 userName，所以当前安全，仅为隐患提示。
**影响**：当前不触发；若后续逻辑改为按 userName 构造正则则会炸。
**建议**：用 `split(picked.name).join(userName)` 替代 RegExp，彻底规避转义问题。

### F05-09 "翻译"语义字段名 `translation` 贯穿全栈 💡 Improvement [合规]
**file**: `types.ts:46`、所有 Poster、ResultPage、HistoryPage、mockScenarios、prompt schema
**问题**：§ 5.A「全 src 用户面 0 处'翻译'」—— grep 确认**用户可见文案 0 处**出现"翻译"（仅 prompt 禁词列表、llm 禁词列表、AboutPage 否定语境，全部合规）。**但**数据字段统一命名为 `translation`（`PetCardSchema.translation`、`result.translation.map(...)`）。该字段名不渲染给用户，技术上不违反 § 5.A。
**影响**：合规**达标**（字段名非用户面）。但字段名叫 translation 与产品"绝不是翻译"的核心定位自相矛盾，存在两类风险：(1) 截图/录屏调试面板若暴露 JSON，字段名会被截到；(2) 未来开发者顺手把字段名渲染成 label。
**建议**：重命名为 `lines` / `dialogue` / `monologue`，从根上消除"翻译"语义。非阻断，但建议尽早做。

### F05-10 录音被 disabled 时无视觉反馈说明 💡 Improvement
**file**: `src/components/AudioRecorder.tsx:236-245, 366-376`
**问题**：`disabled` 时按钮只是降透明度 + 不响应，无文案说明"正在生成中，请稍候"。结合 F05-05 的 submitting 滞留风险，用户可能困惑为何按钮点不动。
**建议**：disabled 时给一行提示文案。

---

## 四、合规命脉专项核对表（对照 checklist § 4 / § 5）

### 04 梦境日记

| checklist 条款 | 实现状态 | 证据 / 缺口 |
|---|---|---|
| § 4.B 一级命中提交前 navigate /crisis 且不发 fetch | ✅ 达标 | DreamInput.tsx:85-89 先检测后 return，未写库未 fetch |
| § 4.B 一级三层兜底（input/analyzing/llm） | ✅ 达标 | DreamInput + AnalyzingPage:41 + llm.ts:84 三处 detectCrisis |
| § 4.A 一级删除"继续分析"按钮 | ✅ 达标 | CrisisPage 仅 3 按钮，无任何继续/跳过入口 |
| § 4.A crisis 页 3 按钮（拨号/发信任的人/稍后） | ✅ 达标 | CrisisPage.tsx:64-83 三按钮齐全 |
| § 4.A 热线全 placeholder、无硬编码号码 | ✅ 达标 | crisisHotlines.ts 全 `{{...}}`，lint 有号码正则 gate |
| § 4.A 配置缺失 fallback 不编造号码 | ✅ 达标 | renderHotlineLine + GENERIC_CARE_FALLBACK（见 F04-09 冗余） |
| § 4.A 每条热线含核验字段 | ✅ 达标 | HotlineRecord 含 lastVerified/verifiedBy/sourceUrl |
| § 4.A 不依赖 LLM 自觉强制注入 disclaimer | ✅ 达标 | sanitizeAnalysis 强制覆盖 disclaimer_top（llm.ts:52） |
| § 4.B 二级暖色卡片 + 热线 | ✅ 达标 | CrisisWarmCard + buildSupportiveMockAnalysis level2 |
| § 4.B 三级温和建议 | ✅ 达标 | level3 分支 append-gentle-tip |
| § 4.B 网络新词（emo/破防/摆烂） | ✅ 达标 | crisisKeywords 三级含 emo/摆烂，二级含破防 |
| § 4.B 文本归一化抗规避 | ❌ 缺口 | F04-03，仅 toLowerCase，空格穿插可绕 |
| § 4.B 一级词表完整性（解脱/不想醒） | ⚠️ 部分 | F04-04，缺"解脱"等高危委婉语 |
| § 4.B 后台告警 + 触发标记留痕 | ❌ 缺口 | F04-07，matched 关键词无任何埋点消费 |
| § 4.B False Positive 误报反馈 | ❌ 缺口 | F04-05，无误报标注入口 |
| § 4.C App 名 / 文案禁词（解梦/算命等） | ✅ 达标 | grep 仅在 lint 表 / prompt 反向清单 / 否定语境出现 |
| § 4.C lint 禁词全集对齐 | ⚠️ 部分 | F04-08，缺"预测/命理/测命/阴阳" |
| § 4.C 安全替代词（梦境日记等） | ✅ 达标 | App 名"梦境心理学日记"，无禁词 |
| § 4.D AI 标识每次输出顶部 | ✅ 达标 | DISCLAIMER_TOP + ResultPage 顶部 + 全局 banner |
| § 4.D 反沉迷弹窗 | ❌ **完全缺失** | **F04-01 Critical** |
| § 4.D 首次启动强制免责弹窗 | ✅ 达标 | FirstLaunchGate 勾选才放行（退出实现见 F04-11） |

### 05 宠物心情卡片

| checklist 条款 | 实现状态 | 证据 / 缺口 |
|---|---|---|
| § 5.A App 名不含"翻译" | ✅ 达标 | "宠物心情卡片"，AboutPage 副标"萌宠对白生成器" |
| § 5.A 全 src 用户面 0 处"翻译" | ✅ 达标 | grep 确认仅禁词清单 + 否定语境；字段名 translation 非用户面（F05-09） |
| § 5.A 介绍页置顶免责 | ✅ 达标 | AboutPage hero disclaimer + HomePage banner |
| § 5.B system prompt 强制 disclaimer 字段 | ✅ 达标 | prompt.ts:24 强制输出 disclaimer |
| § 5.B disclaimer 客户端强制嵌入不可删 | ✅ 达标 | enforceDisclaimer（llm.ts:27）覆盖；Poster 硬编码无开关 |
| § 5.B prompt 禁"准确/真实意图" | ✅ 达标 | prompt.ts:35 + llm.ts FORBIDDEN_OUTPUT_TERMS 双层 |
| § 5.B 禁严肃行为学诊断（焦虑症等） | ✅ 达标 | FORBIDDEN_OUTPUT_TERMS 含分离焦虑/焦虑症/兽医，命中即 fallback |
| § 5.C 海报水印/QR 不可移除 | ✅ 达标 | 三套 Poster 写死，无 prop 开关（付费透明未实现，F05-04） |
| § 5.C disclaimer 海报底部可读字号 | ⚠️ 部分 | F05-03，10px + Style2 浅灰对比度弱 |
| § 5.C 多处嵌入（footer/海报/结果/about） | ✅ 达标 | App footer + 3 Poster + ResultPage:124 + AboutPage |
| 录音 10s 上限 | ✅ 达标 | MAX_DURATION_SEC=10，interval 自动停 |
| 录音权限处理 | ⚠️ 部分 | F05-02，权限判定靠 message 字符串不可靠 |
| capacitor-voice-recorder 残留清理 | ⚠️ 部分 | package.json 干净，但组件内 stub 死代码残留（F05-01） |
| MediaRecorder web 路径正确性 | ✅ 达标 | mime 探测 + chunks + onstop 合成，正确 |

---

## 五、严重度统计

| 严重度 | 数量 | 编号 |
|---|---|---|
| 🔴 Critical | 1 | F04-01 |
| 🟠 High | 3 | F04-02, F04-03, F05-01 |
| 🟡 Medium | 9 | F04-04, F04-05, F04-06, F04-07, F04-08, F05-02, F05-03, F05-04, F05-05 |
| 🟢 Low | 5 | F04-09, F04-10, F04-11, F05-06, F05-07 |
| 💡 Improvement | 3 | F05-08(隐患), F05-09, F05-10 |
| **合计** | **21** | 其中 **[合规] 标注 12 条** |

---

## 六、产品评分与护栏强度结论

### 04 梦境日记 — 评分：**B-**
- **合规护栏强度**：危机干预流程（三层检测 + redirect + 无绕过按钮 + 热线零硬编码 + disclaimer 强制注入）是**真扎实**的，正常用户**无法绕过**一级 redirect。
- **扣分主因**：① 反沉迷弹窗（§ 4.D 硬性项）**完全缺失** → 单这一项就足以卡上架；② 检测文本无归一化（空格穿插可绕，命脉召回有缺口）；③ 词表缺"解脱"类高危词；④ 触发标记 / 误报反馈两个 checklist 项无落地。护栏"机制对、覆盖有洞"。

### 05 宠物心情卡片 — 评分：**B+**
- **合规护栏强度**：娱乐免责定位贯彻**到位**——"翻译"用户面 0 处、disclaimer 五处强制嵌入且不可删、双层禁词 fallback、水印写死。**普通用户无法绕过** disclaimer / 水印。
- **扣分主因**：① AudioRecorder 大段 native 死代码（迁移残留，维护风险）；② 海报 disclaimer 字号/对比度偏弱（Style2 浅灰小字逼近 § 5.C 红线）；③ 权限判定不可靠 + submitting 状态边界 bug。均非合规致命，多为工程质量项。

### 合规护栏能否被绕过——总结论
> **两个产品的核心合规护栏在正常使用路径下均不可被普通用户绕过**：04 的一级危机 redirect 有三层防御 + replace 跳转 + 无继续按钮；05 的 disclaimer/水印硬编码无开关。
> **残余绕过风险来自"检测召回缺口"而非"流程设计缺陷"**：04 的 detectCrisis 因无文本归一化 + 词表漏配，可被刻意构造的输入（空格穿插、"解脱"类委婉语）规避检测——这是命脉的真实软肋，但属"漏检"而非"用户主动绕过 UI"。

---

## 七、Top 3 必修

1. **【04 · F04-01 🔴】实现反沉迷弹窗**（连续 7 天 / 单日 30 次 → 休息提示）。§ 4.D 硬性验收项，缺失即不可上架。

2. **【04 · F04-03 + F04-04 🟠】加固 detectCrisis 召回**：匹配前做文本归一化（去空格 / 全角转半角 / 去标点），并补"解脱 / 想解脱 / 不想醒"等高危委婉语到一级表。这是危机命脉的真实软肋，直接关系人身安全责任。

3. **【05 · F05-01 🟠 + F05-03 🟡】清理 AudioRecorder native 死代码 + 加固海报 disclaimer 可读性**：删除不可达的 VoiceRecorder stub / `*Native` 函数；统一 disclaimer ≥12px 等效字号、opacity ≥0.7、Style2 改深灰，避免被质疑"变相弱化免责"。

---

## 八、一句话总评

> 两个产品都是"合规护栏机制设计到位、正常路径无法绕过"的扎实 MVP，但 04 的反沉迷缺失（卡上架）与危机检测召回缺口（命脉软肋）、05 的 native 录音死代码与海报免责字号偏弱，是上架前必须补齐的真实短板——护栏的骨架很硬，漏洞在覆盖面而非结构。
