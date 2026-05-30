# A3 前端审计报告 · 01 诗经起名 / 02 倒数日 / 03 植物医生

> 审计员：资深前端 + React 架构审计员（opus 4.7）
> 范围：`mvp/products/0{1,2,3}/src/`，对照 `mvp/SHARED-CONVENTIONS.md`
> 性质：**只读审计，未改动任何代码**
> 日期：2026-05-29

## 摘要

| 维度 | 结论 |
|---|---|
| Next.js → Vite 迁移 | 02 / 03 干净；**01 残留 6 处 `'use client'`** + Loading 文案「排八字」 |
| 架构一致性 | 目录结构 / vite.config / mobileUpdates / llm 模式高度一致；**Capacitor 版本集体偏离规范（6→8）**、`ota:publish` 脚本三个产品全错 |
| 合规客户端 | 03 lintAction 双重清洗真生效（含 render-time），Camera + web fallback 正确；01 verifyQuote 警告链路正确，但 PricingModal/Loading 有**伪造数据 + 命理文案**违反 compliance |
| 状态管理 | 02 zustand store 正确，hydration 有保护；localStorage 容错完善 |
| LLM client | 三产品 mock fallback + 超时 + 降级齐全，永不抛 500 |
| React 反模式 | 01 ResultPage useCallback 依赖错误（`retryKey`）；OTA 通知事件全产品无消费者（死代码） |

严重度统计：🔴 Critical **3** · 🟠 High **6** · 🟡 Medium **9** · 🟢 Low **5** · 💡 Improvement **6**

---

# 产品 01 · 诗经起名（AI Naming）

### [01-1] 6 个组件残留 Next.js `'use client'` 指令 🟠 High
`src/components/NameCard.tsx:1`、`PosterPreview.tsx:1`、`PricingModal.tsx:1`、`MockPaymentDialog.tsx:1`、`StatBadge.tsx:1`、`Loading.tsx:1`
- **问题**：迁到 Vite + React Router 后，这 6 个组件文件首行仍是 `'use client';`。02、03 已全部清除，仅 01 残留。
- **影响**：Vite/esbuild 把它当普通字符串字面量忽略，**不报错也无运行时副作用**，但属于明确的迁移残留，违反审计重点维度 1，且 StatBadge/Loading 注释里仍写「SSR 期渲染 0」「SSR 阶段」等已不存在的概念，误导维护者以为还有 SSR。
- **建议**：删除全部 6 处 `'use client';`，并清理 StatBadge.tsx:15-18 / stats.ts 中「SSR 期 / SSR 阶段」措辞（Vite SPA 无 SSR，`typeof window === 'undefined'` 分支实际只在 vitest 命中）。

### [01-2] Loading 默认文案「AI 正在排八字…」直接违反合规红线 🔴 Critical
`src/components/Loading.tsx:12`
- **问题**：`Loading({ tip = 'AI 正在排八字…' })`。而 prompt（baby-naming.ts:28,32）和表单页（NamingFormPage.tsx:196）都白纸黑字写明「不涉及算命/八字/吉凶/打分」「不使用五行/八字/吉凶」。产品自己的免责声明与默认 loading 文案自相矛盾。
- **影响**：用户每次生成都会先看到「排八字」——这正是 compliance-checklist 要求规避的命理定位，是上架审核与广告法风险点。虽然 STEPS[0]「正在翻阅《诗经》…」会在 1.1s 后覆盖它，但首帧仍显示该文案，且 `tip` 作为兜底随时可能出现。
- **建议**：改为「AI 正在翻阅典籍…」之类中性文案；全仓 grep「八字/五行/吉凶/打分」确保无其他残留。

### [01-3] PricingModal / MockPaymentDialog 含伪造社交证明数字 🔴 Critical
`src/components/PricingModal.tsx:165`（`已为 12,438 位家庭起名`）
- **问题**：stats.ts 顶部花了大段注释说明「SEED 全为 0，杜绝伪造社交证明」，但 PricingModal footer 硬编码「已为 12,438 位家庭起名」，PosterPreview 同类。这是 stats.ts 立场刚禁止、又在别处复活的虚假宣传。
- **影响**：与项目 compliance-checklist 立场直接冲突；一个全新本地用户在付费墙看到「12,438 位家庭」是明确的虚假数据。
- **建议**：删除该固定数字，或改为不含具体数量的中性表述（「为人生重要的一刻起名」）。
- **关联**：PricingModal.tsx:165 还写「7 天无理由退款」，MVP 无真实支付，属未兑现承诺，建议一并软化。

### [01-4] ResultPage `useCallback` 依赖数组含未使用的 `retryKey`，且漏依赖真正用到的入参 🟠 High
`src/routes/ResultPage.tsx:70-92`
- **问题**：`fetchNames` 的依赖数组写了 `retryKey`，但函数体内**并未使用** `retryKey`；它依赖的是 `type/surname/gender/vibeTags/sourcePreference/taboo`（这些虽在数组里）。点击「重新生成」`setRetryKey(k=>k+1)` 之所以能触发重拉，纯粹因为 `retryKey` 变更使 `fetchNames` 引用变化 → `useEffect([fetchNames])` 重跑。这是「靠副作用 work」的脆弱写法，ESLint `exhaustive-deps` 不会满意，且语义晦涩。
- **影响**：功能当前正常，但极易在重构（例如有人「清理无用依赖」删掉 retryKey）时悄然失效——重试按钮变哑。
- **建议**：把 `retryKey` 显式用进 fetch（如作为 cache-buster 或仅作为 effect 依赖独立列出），或改用 `useEffect(()=>{...},[retryKey, type, ...])` 直接写 effect，去掉中间 useCallback。

### [01-5] verifyQuote Step 2 长度阈值与包含方向不对称，可能漏判/误判 🟡 Medium
`src/lib/verifyQuote.ts:133`
- **问题**：Step 1（精确匹配）用双向包含 `verseNorm.includes(quoteNorm) || quoteNorm.includes(verseNorm)`；Step 2（仅书名匹配）只判 `quoteNorm.length >= 4 && verseNorm.includes(quoteNorm)`（单向）。当 LLM 给的 `original_quote` 比库里 verse **更长**（多抄了上下文）时，Step 1 能靠 `quoteNorm.includes(verseNorm)` 命中，但若书名对、章节错，Step 2 因单向 includes 直接漏掉，落到 Step 3（要求 ≥6 字且全库扫描），可能判 verified=false。
- **影响**：合法引文被误标「出处待人工核验」橙色警告，且禁用「生成海报」按钮（NameCard.tsx:131）。属体验降级，非安全问题。
- **建议**：Step 2 也用双向包含并对齐 Step 3 的字数门槛逻辑，或补单测覆盖「quote 长于 verse + 章节写错」组合。

### [01-6] 海报深链页 PosterPage 用硬编码默认值伪造 verified=true 🟡 Medium
`src/routes/PosterPage.tsx:28-43`
- **问题**：`/poster/:id` 把 query 缺省值拼成一个**强制 `verified: true`** 的 VerifiedName（默认「陈知微」）。任何人访问 `/poster/任意id`（无 query）都会渲染一张「已校验」海报，且 PosterPreview 内「下载海报」无校验门槛。
- **影响**：绕过了 ResultPage/NameCard 里「未校验不可生成海报」的合规约束（NameCard.tsx:131 `disabled={!name.verified}`）。深链入口成了校验旁路。
- **建议**：深链页应对传入参数跑一次 `verifyQuote` 再决定是否允许下载，或明确标注「深链预览，未经校验」。

### [01-7] ResultPage gender 用 `as` 断言绕过校验，URL 篡改可注入任意值 🟡 Medium
`src/routes/ResultPage.tsx:52`
- **问题**：`const gender = (searchParams.get('gender') as '男孩' | '女孩') ?? '女孩'`。`searchParams.get` 返回 `string | null`，`as` 断言不做运行时校验；URL 里 `?gender=foo` 会原样进入 fetch 请求体与展示（header「…· foo · …」）。`source_preference as never`（:80）同理。
- **影响**：mockNames.buildMockNames 对未知 gender 落入 female 模板（无崩溃），但展示层会显示乱码 gender。非安全漏洞，是类型安全形同虚设。
- **建议**：用已有的 `GenderSchema.safeParse` / `SourcePreferenceSchema.safeParse` 兜底，与 NamingTypeSchema 的处理方式保持一致。

### [01-8] NameCard「分享」按钮与「复制」是同一个 handler 🟢 Low
`src/routes/.../NameCard.tsx:138-145`
- **问题**：「分享」按钮 `onClick={handleCopy}`，与「复制」完全同逻辑（写剪贴板），未调用 `navigator.share`。
- **影响**：移动端用户点「分享」期望拉起系统分享面板，实际只是复制，交互预期落空。
- **建议**：接 Web Share API（`navigator.share`）并在不支持时回退到复制。

### [01-9] `vite-env.d.ts` 缺 `ImportMetaEnv` 接口声明（与规范不符）💡 Improvement
`src/vite-env.d.ts:1-6`
- **问题**：SHARED-CONVENTIONS（行 140-154）要求 `vite-env.d.ts` 同时声明 define globals **和** `ImportMetaEnv`（VITE_GATEWAY_URL 等）。01 只声明了 4 个 `__XXX__` global，缺 `ImportMetaEnv`。03 是完整版（含 ImportMeta），02 与 01 一样缺。
- **影响**：01 的 llm.ts 未用 `import.meta.env`（直接用 `__GATEWAY_URL__`），暂无类型报错；但与规范不一致，且若将来引用 `import.meta.env.VITE_*` 会 fallback 到 vite 内置宽松类型。
- **建议**：补齐 `ImportMetaEnv` / `ImportMeta`，对齐 03。

### [01-10] copy 成功态用 setTimeout 但组件可能已卸载 🟢 Low
`src/components/NameCard.tsx:21-29`
- **问题**：`setTimeout(() => setCopied(false), 1800)` 未在 unmount 时清理。若用户复制后立即关闭海报弹窗/路由跳转，会对已卸载组件 setState（React 18 已静默，但仍是泄漏苗头）。Loading.tsx:16-22 的 interval 有正确清理可作对照。
- **建议**：忽略（React 18 容忍）或用 ref 守卫。

---

# 产品 02 · 倒数日 Pro（Countdown）

### [02-1] zustand store + localStorage 持久化整体正确 ✅（无严重问题）
`src/lib/store.ts` / `storage.ts`
- store 的 `addCard/updateCard/deleteCard` 均「先 persist 再 set」，`hydrate()` 有 `get().hydrated` 幂等守卫 + `typeof window` 守卫，ThemeRoot 在 effect 里调用一次。storage 读写全程 zod `safeParse` + try/catch，schema 版本号 `SCHEMA_VERSION=1` 存在。**这是三个产品里状态管理最扎实的。** 仅以下为改进项。

### [02-2] localStorage 持久化与 zustand 状态存在静默不一致风险 🟡 Medium
`src/lib/store.ts:44-49`、`storage.ts:117-125`
- **问题**：`addCard` 先 `persistCards(next)` 再 `set({cards:next})`。`persistCards` 在 quota 超限 / 隐私模式抛错时**被 try/catch 静默吞掉**（storage.ts:122），但 `set` 照常更新内存。结果：UI 显示卡片已创建，刷新后丢失，用户无任何提示。
- **影响**：边界场景（存储满 / Safari 隐私模式）下数据「假成功」。
- **建议**：persist 失败时返回布尔，store 据此提示「保存失败，请检查存储空间」。MVP 可降级为 Low。

### [02-3] 跨标签页 / OTA 更新后 store 不会重新 hydrate 🟡 Medium
`src/lib/store.ts:32-43`、`ThemeRoot.tsx:14-16`
- **问题**：`hydrate()` 因 `get().hydrated` 守卫只跑一次，且无 `storage` 事件监听。多标签页打开时，A 页新建的卡片不会同步到 B 页内存（B 仍显示旧 cards）。
- **影响**：双开/PWA 多窗口场景数据不同步。原生 App 单 WebView 通常无此问题，故 Medium。
- **建议**：可选地监听 `window.addEventListener('storage', ...)` 触发 re-hydrate；或文档注明 MVP 不支持多窗口同步。

### [02-4] `computeView` 月/年单位用固定除数 30/365，跨月跨年显示有偏差 🟡 Medium
`src/lib/dateMath.ts:47-52,63-64`
- **问题**：`unitDivisor = { month: 30, year: 365 }`，`value = Math.floor(absValue / divisor)`。即「还有 2 个月」实际是「还有 60 天」，与日历月（28-31 天）和闰年（366 天）不符。例如目标日 59 天后选「月」单位会显示「1 月」而非「约 2 月」。
- **影响**：展示精度问题，非崩溃。dateMath.test.ts:72-80 也只验证了 14→2 周、60→2 月这种整除 case，未覆盖真实日历语义。
- **建议**：月/年改用 date-fns `differenceInCalendarMonths` / `differenceInCalendarYears`；或在 UI 标注「约」。

### [02-5] SharePoster / exportPoster 在 iOS 原生壳会失败但无降级 🟠 High
`src/lib/exportPoster.ts:18-19,26`、`src/components/SharePoster.tsx`
- **问题**：exportPoster.ts 注释明写「html2canvas web-only，别在 iOS 原生壳跑」，但 SharePoster 的「下载海报 / 复制图片」按钮在任何平台都直接调 `exportNodeToPng`。Capacitor WebView 里 `a.click()` 下载 + `navigator.clipboard.write` 图片均可能静默失败或抛错。SharePoster 仅 catch 后显示「导出失败」，没有走 Capacitor 原生分享/保存路径。
- **影响**：上架 App 后，海报分享（产品核心增长点 / 小红书裂变）在真机上大概率不可用，而开发者在浏览器测时一切正常。03 的 ImageCapture 已示范了「`Capacitor.isNativePlatform()` 分叉」的正确做法，02 此处缺失。
- **建议**：检测 `Capacitor.isNativePlatform()`，原生端用 `@capacitor/share` + `Filesystem` 落地；或在 todo 中明确登记此缺口（当前仅 DetailPage 文案提了 WidgetKit，未提海报导出）。

### [02-6] DetailPage / Form / Settings 用原生 `window.confirm` 删除确认 🟢 Low
`src/routes/DetailPage.tsx:97`、`CountdownForm.tsx:220`、`SettingsPage.tsx:106`
- **问题**：删除/重置走 `window.confirm`。Capacitor WebView 里原生 confirm 样式割裂、且部分 WebView 配置下会被禁用（返回 false），导致删除按钮「点了没反应」。
- **影响**：原生端体验/可用性风险。
- **建议**：替换为应用内 Dialog 组件（项目已有 Modal 模式可复用）。

### [02-7] 列表排序对「已过期 countdown」与「countup」signedDays 混排，语义可能反直觉 🟢 Low
`src/routes/ListPage.tsx:14-20`
- **问题**：统一按 `signedDays` 升序排。countup（过去日期，signedDays 为负且越久越负）会永远排在所有 countdown 之前，且「在一起 365 天」比「在一起 10 天」排更前。对「正数日」用户，通常期望越新的排前或单独分组。
- **影响**：纯排序观感，非 bug。
- **建议**：考虑按 type 分组或对 countup 取绝对值排序。

### [02-8] Settings「首次启动已完成」开关暴露内部 onboarding flag 💡 Improvement
`src/routes/SettingsPage.tsx:76-81`
- **问题**：把 `onboardingDismissed` 直接做成用户可见开关「首次启动已完成 / 关闭后下次会看到欢迎提示」。这是内部状态，但实际上 buildDemoCards 的 seeding 逻辑（store.ts:38）依赖它——关掉它且清空卡片会重新塞 demo 数据，行为对用户费解。
- **建议**：移除该开关或改为「重新查看新手引导」语义化按钮。

### [02-9] EmojiPicker 弹层无点击外部关闭 / 无 Esc 🟢 Low
`src/components/EmojiPicker.tsx:47-68`
- **问题**：popover 仅靠再次点击触发按钮或选中 emoji 关闭，无 outside-click / Escape（WidgetModal.tsx:26-33 有 Esc，可作对照）。
- **建议**：补 outside-click 关闭，提升可访问性。

---

# 产品 03 · AI 植物医生（Plant Doctor）

### [03-1] 合规双重清洗（lintAction）真生效，含 render-time safety belt ✅
`src/lib/lintAction.ts` / `DiagnosePage.tsx:58` / `ResultPage.tsx:52-59`
- lintDiagnosisResult 递归覆盖了 DiagnosisResult 所有文本字段（plant_name / diagnosis[].cause+evidence / action_steps / prognosis.fallback_if_fail / calendar_30d[].action / disclaimer）。**DiagnosePage 落库前清洗一次，ResultPage 渲染前再清洗一次**（防 localStorage 旧脏数据），符合 compliance-checklist § 3.B「双重保险」。lintAction.test.ts 11 个用例覆盖农药名/稀释比例/剂量/频次/民间偏方/误伤防护。命中即整段替换为安全话术、不做局部替换（避免漏网），设计正确。

### [03-2] Camera plugin + web fallback 实现正确 ✅
`src/components/ImageCapture.tsx:57-92`
- `handlePickFromCamera` 先判 `Capacitor.isNativePlatform()`：原生走 `CapCamera.getPhoto`（Prompt 源 + correctOrientation），web 回退 `<input type=file>`；两条路径都过同一套 `compressDataUrl`/`compressImage` 压缩管线；用户取消（`/cancel/i`）不计错误。是三产品里平台分叉做得最好的。

### [03-3] lintAction 的农药名扫描可被「拆字/空格/谐音」绕过 🟠 High
`src/lib/lintAction.ts:101-119`
- **问题**：`lintText` 用 `text.includes(name)` 精确子串匹配。LLM 若输出「多 菌灵」「多-菌灵」「波尔多 液」（中间夹空格/标点）或异体写法，`includes` 直接漏过。DOSAGE_PATTERNS 同理依赖紧凑格式。lintAction.ts 注释自称「即便 LLM 漏网也能兜底」，但兜底强度低于宣称。
- **影响**：合规护栏在对抗性/噪声输出下有缺口。规范也强调「合规护栏不能只靠 client，gateway 必须 enforce」——若 gateway 端清洗同样是 includes，则整条链路都可被绕过。
- **建议**：扫描前先 normalize（去空白/标点）再匹配，与 verifyQuote.normalize 思路一致；关键名做字符间可插入 `\s*` 的正则。本审计仅覆盖 client，建议同步核查 gateway 端实现。

### [03-4] DiagnosePage 的 error 分支几乎是死代码，gateway 失败无「真错误」反馈 🟡 Medium
`src/lib/llm.ts:101-113`、`DiagnosePage.tsx:52-87`
- **问题**：`diagnose()` 内部已 try/catch 并**永远返回 mock**（provider:'mock' + fallbackReason），从不 throw。因此 DiagnosePage `try { const llm = await diagnose() } catch` 的 catch 仅在 `lintDiagnosisResult` / `saveDiagnosis`（localStorage 写）抛错时触发——而这些也基本不抛。结果：gateway 宕机时用户**永远看到玉露黑腐病这条 mock 数据**，且 UI 无任何「这是兜底数据」提示（fallbackReason 只 console.warn）。
- **影响**：与 01 ResultPage 不同（01 会在结果页顶部黄条显示 `humanizeWarning(warning)`），03 完全不向用户暴露「当前为离线 mock」。所有诊断失败都伪装成「成功诊断出黑腐病」，对一个医疗类比的产品是误导。
- **建议**：把 `llm.fallbackReason` / `provider==='mock'` 透传到 SavedDiagnosis 并在 ResultPage 顶部显示「网络异常，以下为示例诊断，请重试」横幅。

### [03-5] store.ts 中 setPendingDiagnosis / getPendingDiagnosis / clearPendingDiagnosis 是死代码 🟡 Medium
`src/lib/store.ts:85-102`、`DiagnosePage.tsx:69`
- **问题**：DiagnosePage 调了 `setPendingDiagnosis(saved)`，但 ResultPage 通过 `getDiagnosis(id)`（从 diagnoses 列表查）读取，**从不调用 `getPendingDiagnosis`**，`clearPendingDiagnosis` 全仓无调用。于是每次诊断都往 `plant-doctor/pending-diagnosis` 写一份完整结果（含 base64 缩略图）却永不读取也永不清理。
- **影响**：(1) 死代码；(2) localStorage 里长期驻留一份**最近一次诊断的完整 base64 图片副本**，白白占用配额（叠加 diagnoses 列表本身存全部缩略图，见 03-6）。
- **建议**：删除这三个函数及 DiagnosePage:69 的调用。

### [03-6] 诊断历史把多张 base64 原图塞进单个 localStorage key，易超配额 🟠 High
`src/routes/CapturePage.tsx:48-58`、`src/lib/store.ts:56-65`、`DiagnosePage.tsx:61-69`
- **问题**：链路上有三处 base64 堆积：
  1. CapturePage 把**最多 3 张** ~200KB 图（base64 后约 270KB/张）塞进 `pending-request` 一个 key（≈800KB+）。
  2. saveDiagnosis 把 `thumb`（第一张完整 200KB+ base64）存进 `diagnoses` 列表，且 `all.unshift` **永不限制条数**——用户诊断 10 次就有 10 张全尺寸缩略图累积在一个 key 里（≈2-3MB）。
  3. setPendingDiagnosis 再存一份（见 03-5）。
- **影响**：localStorage 单域名通常 5-10MB。多次诊断后 `safeSet` 静默 quota 失败（store.ts:41 catch 吞掉），表现为「保存了但列表里没有」或「删不掉」。MyPlantsPage 缩略图也会因此越来越重导致首屏卡顿。
- **建议**：(1) thumb 存压缩到 ≤30KB 的小图而非完整图；(2) diagnoses 列表设上限（如 LRU 保留最近 20 条）；(3) 大图考虑 IndexedDB 而非 localStorage。

### [03-7] CapturePage 提交后 `pending-request` 在异常路径不清理 + 历史残留 🟡 Medium
`src/routes/CapturePage.tsx:58`、`DiagnosePage.tsx:33,74`
- **问题**：CapturePage 写 `PENDING_REQUEST_KEY` 后 `navigate('/diagnose')`。仅当诊断**成功**时 DiagnosePage:74 才 `removeItem`。若用户在 /diagnose 加载中关闭 App、或诊断 catch 进 error 分支后点「回上一步重试」（DiagnosePage:104 只 navigate 不清 key），那份 800KB+ 的 pending payload 会留在 localStorage。下次进 /diagnose 会用**上一次的旧图**重新诊断（DiagnosePage:33 无条件读取）。
- **影响**：陈旧请求复用 + 配额占用。
- **建议**：DiagnosePage 读取后立即 removeItem（无论成败），或在 error 分支也清理。

### [03-8] imageCompress 不保证「压到 200KB 以内」，仅尽力而为 🟡 Medium
`src/lib/imageCompress.ts:44-58`
- **问题**：质量从 0.85 降到 `MIN_QUALITY=0.5` 后即停止，**不再继续缩小长边**。一张细节极丰富的 1024px 大图在 q=0.5 仍可能 >200KB，函数照常返回（bytes 字段会如实 >200KB）。审计重点维度 3 要求「图片压缩 200KB」，此处是软目标非硬保证。
- **影响**：极端图片下 payload 偏大，叠加 3 张 + base64 膨胀，逼近 gateway body 限制。非崩溃。
- **建议**：q 触底后再迭代下调 `MAX_LONG_EDGE`（如 1024→768→512）直到达标，或文档注明这是 best-effort。

### [03-9] ResultPage 每次 render 重跑 lintDiagnosisResult（useMemo 依赖整个 record 对象）🟢 Low
`src/routes/ResultPage.tsx:52-59`
- **问题**：`cleaned` 的 useMemo 依赖 `[record]`，而 `handleToggle`（:75-80）每次勾选日历都 `setRecord(fresh)` 生成新对象引用 → 整份诊断（含 30 天日历）重新递归 lint。
- **影响**：诊断结果不大，性能可忽略；但「render-time 二次清洗」在每次勾选时全量重跑，略浪费。
- **建议**：可接受现状（清洗是幂等且必要的 safety belt）；若优化，可只在 id 变化时 lint。

### [03-10] DiagnosePage 进度条「步骤」是纯装饰假进度 💡 Improvement
`src/routes/DiagnosePage.tsx:124-129`
- **问题**：5 个 Step 里前两个写死 `ok`（✓），后三个永远 `·`，与真实 diagnose() 进度无关联（diagnose 是单次 await，无中间事件）。
- **影响**：诚信观感小问题，非功能 bug。属营销动效。
- **建议**：可保留（常见做法），或在 fallback 时不显示「加密发送到诊断网关 ✓」以免误导。

---

# 跨产品共性问题

### [X-1] `ota:publish` 脚本路径三个产品全部错误（规范已点名）🔴 Critical
`01/02/03 package.json:16` 均为 `... ./scripts/publish-bundle.sh`
- **问题**：SHARED-CONVENTIONS 行 110 **白纸黑字**：「当前 01/02/03/05 的 ota:publish 仍指向 `./scripts/publish-bundle.sh`，对应文件并不存在 —— **必须**改成 `../../scripts/publish-bundle.sh <slug>` 才能发版」。审计确认三个产品仍是错误的相对路径，且缺 `<slug>` 参数。
- **影响**：`npm run ota:publish` 在任一产品目录下都会因找不到脚本而失败，**OTA 发版流程全线不通**。这是已知且被规范明确标记为 follow-up 的硬伤。
- **建议**：统一改为 `... ../../scripts/publish-bundle.sh 0X-xxx`（slug 用目录名）。

### [X-2] Capacitor 全家桶版本集体偏离规范（6.x → 8.x）🟠 High
全产品 `@capacitor/{core,cli,ios}@^8.3.4`、`@capgo/capacitor-updater@^8.47.4`、`@capacitor/camera@^8.2.0`
- **问题**：SHARED-CONVENTIONS 通用栈表（行 24-25）规定 Capacitor 6（`^6.1.2`）+ capgo `^6.6.0`。三产品实际全部用 Capacitor 8 + capgo 8。**好的一面**：三者高度一致（无产品间漂移）；**问题**：与规范文档严重脱节，且 capacitor.config.ts 模板字段（appReadyTimeout/responseTimeout 等）是按 capgo 6 写的，capgo 8 的配置/事件 API 可能有 breaking change（如 `download` 事件字段名），需复核 mobileUpdates.ts 对 capgo 8 是否仍正确。
- **影响**：文档失真会误导后续 codex 接手；潜在 capgo 6→8 API 不兼容风险未验证。
- **建议**：要么把 SHARED-CONVENTIONS 升级到 Capacitor 8，要么降级依赖回 6；并对 mobileUpdates.ts 跑一次 capgo 8 真机验证。

### [X-3] OTA 更新通知事件（MOBILE_UPDATE_NOTICE_EVENT）全产品零消费者 🟠 High
`01/03 mobileUpdates.ts:177` dispatch；全仓无 `addEventListener`
- **问题**：三个产品的 mobileUpdates.ts 都精心实现了 `emitMobileUpdateNotice`（含进度条 determinate/indeterminate、tone、duration），通过 `window.dispatchEvent(MOBILE_UPDATE_NOTICE_EVENT)` 广播。但 grep 全仓 `addEventListener` / `MOBILE_UPDATE_NOTICE_EVENT` 监听端 = **0**。没有任何 Toast / 通知组件订阅它。
- **影响**：约 50 行 OTA 进度反馈逻辑（含 sleep(900)、进度计算）是**纯死代码**——用户在 OTA 下载/切换时看不到任何提示，体验上 OTA 静默发生。`02` main.tsx 同样未挂载任何通知 UI。
- **建议**：实现一个监听该事件的全局 Toast 组件挂到各 App.tsx 根部（三产品可共享），否则删除这些 emit 调用以减负。

### [X-4] 三产品 stats.ts / store.ts 残留 `typeof window === 'undefined'` SSR 守卫 💡 Improvement
`01/02/03 stats.ts`、`02 store.ts:33`、`03 store.ts`
- **问题**：迁到 Vite SPA 后已无 SSR，`typeof window === 'undefined'` 分支只在 vitest（jsdom 其实有 window）理论命中，实际是 Next.js 时代遗留。01 stats.ts:27 注释还写「SSR 阶段返回 SEED」。
- **影响**：无害但误导，暗示仍有 SSR 心智模型。
- **建议**：保留无妨（防御性），但清理注释里的「SSR」字样。

### [X-5] tsconfig `lib` 与规范不一致（02/03 用 ES2022，规范要 ES2023）💡 Improvement
`02/03 tsconfig.json:3`（`"lib": ["ES2022", ...]`） vs 规范行 251（`"lib": ["ES2023", ...]`）
- **问题**：规范要求 `lib: ["ES2023","DOM","DOM.Iterable"]`，02/03 是 ES2022。01 未单独读取 lib 行但 target 一致。三者 `strict/noUncheckedIndexedAccess/noImplicitOverride` 均 true（这点合规）。另规范要求 `noUnusedLocals: false`，各产品未显式设置（默认 false，OK）。
- **影响**：ES2023 数组方法（`findLast` / `toSorted` 等）在 02/03 不可用，纯能力差异，无现存 bug。
- **建议**：统一为 ES2023 或更新规范。

### [X-6] 三产品 stats 的「累计」语义与首页大数字混用，易被误读为社交证明 🟡 Medium
`01 HomePage`、`02 ListPage:36-51`、`03 HomePage:29-33`
- **问题**：stats.ts 的初衷（注释明示）是「杜绝伪造社交证明，只显示本地真实计数」，方向正确。但 02 ListPage 把 `cards.length`（当前持有数）与 `createdTotal`（累计创建数，含已删）并列展示，03 首页「已分析 N+ 张照片」带 `+` 号——`+` 暗示「不止这些」，对本地计数（新用户为 0）显示「0+」语义怪异，对老用户「7+」也有夸大嫌疑。
- **影响**：与 stats.ts 反伪造初衷有张力（程度远轻于 01-3 的硬编码 12438）。
- **建议**：去掉 `+` 号，或新用户为 0 时隐藏 badge。

---

# 健康评分

| 产品 | 评分 | 理由 |
|---|---|---|
| **01 诗经起名** | **C** | 功能完整、verifyQuote/blacklist/mock 设计扎实，但有 2 个 Critical 合规问题（排八字文案 + 伪造 12438）+ 6 处 use client 残留 + useCallback 依赖脆弱。合规是该品类生命线，故压到 C。 |
| **02 倒数日** | **B** | 架构最干净（无迁移残留）、zustand/storage 有单测且容错完善、组件分层清晰。主要扣分在 SharePoster 原生端导出缺降级（High）+ 月/年除数精度 + confirm 原生兼容。无合规/Critical。 |
| **03 植物医生** | **B-** | 合规客户端（lintAction 双清洗 + Camera fallback）是三产品标杆，实现到位。但 base64 在 localStorage 堆积（无上限 + 死代码 pending）是 High 隐患，且 gateway 失败静默伪装成功诊断对医疗类比产品偏危险。lint includes 可绕过待与 gateway 一起加固。 |

# Top 3 必修

1. **🔴 [X-1] 修 `ota:publish` 脚本路径**（三产品 package.json:16 → `../../scripts/publish-bundle.sh <slug>`）。这是规范已点名、导致**全线 OTA 发版不可用**的硬伤，一行修复，收益最大。
2. **🔴 [01-2]+[01-3] 清除 01 的合规违规内容**：Loading「排八字」改中性文案 + 删 PricingModal「已为 12,438 位家庭起名」伪造数字。起名/命理品类的上架审核与广告法红线，且与产品自身免责声明自相矛盾。
3. **🟠 [03-6]+[03-4] 修植物医生数据/反馈**：(a) diagnoses 列表加条数上限 + thumb 缩到 ≤30KB，杜绝 localStorage 配额静默失败；(b) gateway 失败时在结果页明示「示例诊断/请重试」，不要把 mock 黑腐病伪装成真实诊断。

# 一句话总评

> 三个产品工程基线整齐、mock 兜底与目录约定执行到位（02 最干净、03 合规护栏最用心），但**OTA 发版脚本全线断裂、OTA 进度提示是死代码、01 残留命理文案与伪造社交证明、03 把 base64 无上限堆进 localStorage** 这四类问题必须在上架前清掉——尤其前两条是规范已点名却仍未落地的 follow-up。
