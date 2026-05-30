# A6 审计报告：依赖健康 · 构建配置 · iOS 工程 · OTA 可发布性

> **审计员**：DevOps + 移动构建审计员
> **审计日期**：2026-05-29
> **审计范围**：`mvp/` 全量（7 个 package.json + lock + capacitor.config.ts + ios 工程 + scripts + openspec）
> **方式**：只读（npm ls / npm audit / cat / grep / ls），未做任何 install / build / 改文件
> **基线状态**：`mvp/` 整个目录尚未纳入 git（`git ls-files mvp/` = 0），属首次待提交状态

---

## 0. 执行摘要

5 个产品已从 Next.js 全量迁到 **Vite 5 + Capacitor 8 + Capgo OTA**，Capacitor / Capgo 版本在 5 产品间**完全对齐**（`@capacitor/* @8.3.4`、`@capgo/capacitor-updater @8.47.4`），iOS 采用 SPM（CapApp-SPM），无 Podfile 残留，bundle ID 5 个唯一不冲突，Team ID 已注入。生产依赖 `npm audit` **0 漏洞**。

但存在**一类系统性发版阻塞**：Capacitor 8 + SPM 迁移期间，04 语音输入改用 Web Speech API、05 录音改用 Web MediaRecorder（删除了原生 speech-recognition / voice-recorder 插件），**却没有补齐 iOS Info.plist 隐私权限串与 Android RECORD_AUDIO 权限** —— 03 相机同样缺 iOS `NSCameraUsageDescription`。这会导致 App Store 审核拒绝 + 运行时崩溃 / 功能静默失效。其次 OTA 后端从未真实部署（KV / R2 / account id 全是 placeholder），且 01/03/04 的 `.gitignore` 未排除 `dist/`、`ios/Pods`，会把构建产物误提交。

严重度统计：🔴 Critical ×3 ｜ 🟠 High ×5 ｜ 🟡 Medium ×6 ｜ 🟢 Low ×3 ｜ 💡 Improvement ×3

---

## 1. Capacitor 8 升级残留

### F1.1 🔴 Critical — 移除原生语音/录音插件后，iOS/Android 权限声明未补齐
**位置**：
- `products/03-plant-doctor/ios/App/App/Info.plist`（缺 `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription`）
- `products/04-dream-journal/ios/App/App/Info.plist`（缺 `NSMicrophoneUsageDescription` / `NSSpeechRecognitionUsageDescription`）+ `android/app/src/main/AndroidManifest.xml`（仅 INTERNET）
- `products/05-pet-cards/ios/App/App/Info.plist`（缺 `NSMicrophoneUsageDescription`）+ `android/app/src/main/AndroidManifest.xml`（仅 INTERNET）

**问题**：5 个 Info.plist 内容完全相同，全部只有 Capacitor 模板默认键（CFBundle* / orientation 等），**无任何 `*UsageDescription`**。Capacitor 8 迁移时：
- 04 `DreamInput.tsx` 改用浏览器 `window.SpeechRecognition / webkitSpeechRecognition`（不再用 `@capacitor-community/speech-recognition`）。
- 05 `AudioRecorder.tsx` 改用 Web `MediaRecorder` + `getUserMedia({audio:true})`（`capacitor-voice-recorder` 已删，代码内留了 no-op stub）。
- 这些 Web API 在 iOS WKWebView 调麦克风/语音、Android WebView 调 getUserMedia 时，**仍需原生层声明权限串**。原生插件被删后，再没有任何东西注入这些权限。

03 相机：iOS 侧 `@capacitor/camera` **不会**自动写 Info.plist 权限串（需手动加）；Android 侧 `capacitor.settings.gradle` 已 include `capacitor-camera`，其 library manifest 会合并 `CAMERA` 权限，故 03 Android 相机 OK，**仅 iOS 缺串**。

**影响**：
- iOS：调用麦克风/相机瞬间 **进程崩溃**（iOS 对缺失 UsageDescription 是硬性 crash）；且 App Store Connect 上传即被静态扫描拒绝。
- Android（04/05）：WebView `getUserMedia` 无 RECORD_AUDIO → 权限弹窗不出现，录音/语音静默失败。

**建议**（发版前必修）：
- 03 Info.plist 加 `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`（中文用途说明）。
- 04 Info.plist 加 `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription`；04/05 AndroidManifest 加 `<uses-permission android:name="android.permission.RECORD_AUDIO"/>`。
- 05 Info.plist 加 `NSMicrophoneUsageDescription`。
- 注意：05 capacitor.config.ts 注释里已写明"必须在 Info.plist 加 NSMicrophoneUsageDescription"，但从未执行 —— 即文档已知此事，落地漏了。

### F1.2 🟡 Medium — `capacitor.config.ts` 死配置残留（SpeechRecognition / voice-recorder 注释）
**位置**：`products/04-dream-journal/capacitor.config.ts:24-27`、`products/05-pet-cards/capacitor.config.ts:9,11-15`

**问题**：
- 04 config 仍有 `SpeechRecognition: { ... }` 插件块；但 package.json 无 speech-recognition 依赖、Package.swift 无引用。`cap sync` 已把它写进 `ios/App/App/capacitor.config.json`（实测含 `"SpeechRecognition": {}`），映射到不存在的原生插件。
- 05 config 注释仍称"`android.permission.RECORD_AUDIO` 由 capacitor-voice-recorder 自动注入"、"VoiceRecorder 共用此权限" —— 该插件已删，注释**误导**后续维护者以为权限会自动来（实则不会，见 F1.1）。

**影响**：功能层面无害（无对应原生插件，sync 仅写空配置），但与真实依赖不一致，误导性强，且掩盖了 F1.1 的权限缺口。

**建议**：删除 04 的 SpeechRecognition 配置块；修正 05 注释为"已移除原生插件，改用 Web MediaRecorder，需手动声明 RECORD_AUDIO / NSMicrophoneUsageDescription"。

### F1.3 🟡 Medium — `AudioRecorder.tsx` 残留 Next.js 指令 + 大段死代码
**位置**：`products/05-pet-cards/src/components/AudioRecorder.tsx:1`（`'use client'`）、`:10-15`（VoiceRecorder no-op stub）、`:50`（`isNative=false` 硬编码）、`:112-174`（`startRecordingNative` / `stopRecordingNative` 永不执行）

**问题**：`isNative.current` 恒为 `false`，整段 Native（Capacitor）录音路径（约 60 行）是 dead code；顶部 `'use client'` 是 Next.js 残留。全仓共 **10 处 `'use client'`**（01 ×6、05 ×4）。

**影响**：不影响运行（Vite 忽略 `'use client'`），但增加维护负担与误读风险。

**建议**：清理 dead native path + 全仓移除 `'use client'`。

### F1.4 🟢 Low — `bundledWebRuntime` 已从 5 个 config 删除（✅ 合规），但模板文档仍保留
**位置**：5 个 `capacitor.config.ts` 均**无** `bundledWebRuntime`（正确，Cap8 已废弃）；但 `SHARED-CONVENTIONS.md:167` 模板里仍写 `bundledWebRuntime: false`。
**影响**：照模板新建产品会引入已废弃字段。**建议**：从 SHARED-CONVENTIONS 模板删除该行（详见 F6.x 文档漂移）。

### F1.5 🟢 Low — 残留空目录 `@capacitor-community/` 与 stale `.next/`
**位置**：`products/04-dream-journal/node_modules/@capacitor-community/`（空目录，speech-recognition 卸载残骸）；`products/01-ai-naming/.next/`、`products/03-plant-doctor/.next/`（Next.js 构建残留目录）
**影响**：node_modules 残骸下次 `npm ci` 会清掉，无害；`.next/` 是迁移未清干净的死目录（01 的 .gitignore 恰好还 ignore 了 `.next/`，故不会误提交，但 03 见 F7）。

---

## 2. legacy-peer-deps 风险（speech-recognition / voice-recorder）

### F2.1 🟢 Low — 幽灵依赖已彻底清除（package.json + lock + node_modules 三处干净）
**核实结果**（5 产品逐一）：
- **package.json**：无 `@capacitor-community/speech-recognition`、无 `capacitor-voice-recorder`、无任何 `--legacy-peer-deps` 痕迹。
- **package-lock.json**：5 个 lock 文件 grep `@capacitor-community` / `speech-recognition` / `voice-recorder` 均 **0 命中**。
- **node_modules**：无 `capacitor-voice-recorder` 目录；04 的 `@capacitor-community/` 为**空壳目录**（见 F1.5），不含实体包。

**结论**：当年 04/05 升级用的 `--legacy-peer-deps` 相关插件已从依赖树完全移除，**无版本冲突隐患、无实体幽灵依赖**。唯一残留是 F1.2/F1.3 的源码 + 配置层引用（不影响依赖解析）。Capacitor 8 全家桶 peer 一致（core/cli/ios/android/camera/capgo 均锁 8.x），重装无需 legacy-peer-deps。

---

## 3. 依赖健康

### F3.1 🟠 High — dev 工具链中危漏洞（esbuild / undici / devalue），生产 0 漏洞
**`npm audit` 结果（含 dev）**：

| 项目 | 总数 | moderate | high | 主要来源 |
|---|---|---|---|---|
| 01-ai-naming | 5 | 5 | 0 | esbuild ≤0.24.2（vite/vitest 传递） |
| 02-countdown | 5 | 5 | 0 | esbuild（同上） |
| 03-plant-doctor | 6 | 6 | 0 | esbuild + **PostCSS XSS** (GHSA-qx2v-qp2m-jg93) |
| 04-dream-journal | 5 | 5 | 0 | esbuild |
| 05-pet-cards | 5 | 5 | 0 | esbuild |
| gateway | 9 | 8 | **1** | esbuild + **undici** (HTTP 走私/CRLF 注入等 5 条，经 wrangler 3.x) |
| ota-backend | 11 | 7 | **4** | esbuild + **devalue 原型污染** (5 条) + vitest-pool-workers |

**`npm audit --omit=dev`（仅生产依赖）：7/7 项目全部 `found 0 vulnerabilities`。**

**问题**：所有漏洞均在 **devDependencies / 构建链**：
- esbuild ≤0.24.2 (GHSA-67mh-4wv8-2f99)：仅 dev-server 任意请求读响应，**不进生产包**。
- gateway 的 undici 5 条 high/moderate：来自 `wrangler@3.114.17`（已是 v3 最新），仅本地 `wrangler dev` 用到，不进 Workers 运行时。
- ota-backend 的 devalue 原型污染：来自 `@cloudflare/vitest-pool-workers`（测试专用）。

修复需 `vite@8` / `wrangler@4` / `vitest-pool-workers@0.16` 等**破坏性大版本升级**。

**影响**：生产运行时**无暴露**；风险面是开发机 dev-server 与 CI。属可控，但 gateway/ota-backend 各有 1+/4 条 high 应排期处理。

**建议**：发版**不阻塞**；下一迭代评估 wrangler 4 / vite 6+ 升级；CI 中 dev-server 不绑 0.0.0.0、不在公网跑即可缓解 esbuild 项。

### F3.2 🟠 High — 03-plant-doctor 依赖**精确锁定（无 `^`）**，与其余 4 产品 caret 风格不一致
**位置**：`products/03-plant-doctor/package.json`

**问题**：SHARED-CONVENTIONS 要求 5 产品版本统一（caret `^`），但 03 把多数依赖钉成精确版本：`html2canvas: "1.4.1"`、`lucide-react: "0.408.0"`、`zod: "3.23.8"`、`@types/node: "20.14.10"`、`autoprefixer: "10.4.19"`、`postcss: "8.4.39"`、`tailwindcss: "3.4.6"`、`typescript: "5.5.3"`（其余 4 产品同名依赖均为 `^x.y.z`）。

**影响**：依赖风格分裂；精确锁定本身利于复现，但与团队约定相悖，且会导致 03 拿不到补丁版（如 03 唯一中招 PostCSS XSS，恰因 postcss 钉死 8.4.39 不能随 caret 升到修复版）。

**建议**：统一为 caret，或反向把约定改成"全精确锁定 + Renovate"。当前**混用**是最差状态。

### F3.3 🟡 Medium — 顶层 `mvp/package.json` 与各包未声明 Node engines
**位置**：所有 package.json 无 `engines.node`。
**影响**：开发/CI Node 版本漂移风险（Vite 5 需 Node ≥18，wrangler 3 需 ≥18）。**建议**：补 `"engines": { "node": ">=18.18" }`。

### F3.4 🟢 Low — 跨产品共享依赖版本核对（除 03 外对齐良好）
react@18.3.1 / react-dom@18.3.1 / react-router-dom@^6.26.1 / zod@^3.23.8 / vite@^5.4.6 / vitest@^2.1.1 / typescript@^5.5.3 / tailwindcss@^3.4.6 在 01/02/04/05 完全一致；02/04 的 date-fns@^3.6.0、02 的 zustand@^4.5.4 符合约定。node_modules 实测安装版本：5 产品 `@capacitor/core` 与 `cli` 均 8.3.4、capgo 均 8.47.4 —— **运行时版本零漂移**。gateway/ota-backend hono 实测均 4.12.23。

---

## 4. iOS 工程

### F4.1 🟠 High — pbxproj 中 `CODE_SIGN_STYLE` 键重复（perl 注入产生）
**位置**：5 个 `ios/App/App.xcodeproj/project.pbxproj`，App target 的 Debug（504EC317）与 Release（504EC318）两个 buildSettings 块。

**问题**：perl 注入把 `DEVELOPMENT_TEAM = 2XJAMSVBL3;` + `CODE_SIGN_STYLE = Automatic;` 追加在 `PRODUCT_BUNDLE_IDENTIFIER` 之后（行 309-310 / 332-333），但每个 target 块**顶部本就已有** `CODE_SIGN_STYLE = Automatic;`（行 298 / 322）。结果同一 buildSettings 内 **`CODE_SIGN_STYLE` 出现两次**。
- `DEVELOPMENT_TEAM`：每个文件正好 2 处（仅 App target 的 Debug+Release），**project 级两个配置块（504EC314/315）未注入** Team —— 但 Xcode 以 target 级为准，可签名。
- `2XJAMSVBL3`：5 文件 ×2 = 一致。
- bundle ID 注入正确：每文件 Debug/Release 各 1 处。

**影响**：Xcode 解析重复键时"后者胜"，能编译能签名，**但 pbxproj 非法/脆弱**：下次 `cap sync`、Xcode 打开后自动整理、或再跑一次注入脚本，可能产生第 3 个重复键或顺序错乱，导致签名配置漂移。属技术债 + 潜在二次注入风险。

**建议**：发版前用幂等方式修正——先删块内已存在的 `CODE_SIGN_STYLE` 再注入，或改用 `xcconfig`（已有 debug.xcconfig/release.xcconfig 引用）统一管理 `DEVELOPMENT_TEAM` / `CODE_SIGN_STYLE`，避免直接 perl 改 pbxproj。

### F4.2 🟢 Low — Package.swift（SPM）齐全且插件引用正确（✅）
**核实结果**：5 个 `ios/App/CapApp-SPM/Package.swift` 一致、标准 Cap8 SPM 形态：
- `swift-tools-version: 5.9`、`platforms: [.iOS(.v15)]`、`capacitor-swift-pm exact: "8.3.4"`。
- 插件引用与 package.json 严格对应：03 含 `CapacitorCamera`；01/02/04/05 仅 `CapgoCapacitorUpdater`（**04 无 SpeechRecognition、05 无 VoiceRecorder，与插件移除一致** ✅）。
- 均 `// DO NOT MODIFY` 由 CLI 管理，路径 `../../../node_modules/...` 正确。
SPM 形态无 Podfile（已无 CocoaPods 残留），现代且干净。

### F4.3 🟢 Low — appId / appName / CapacitorUpdater 配置 5 产品一致（✅，含 1 处合理差异）
**核实结果**：
- appId 三方对齐（capacitor.config.ts = pbxproj PRODUCT_BUNDLE_IDENTIFIER = publish-bundle.sh 映射 = ota-backend），5 个均无连字符：`io.shijingnaming.app` / `io.countdownpro.app` / `io.plantdoctor.app` / `io.dreamjournal.app` / `io.petcards.app`。
- appName 中文名各异且正确。
- `CapacitorUpdater` 块 5 产品**完全一致**：`autoUpdate:false, appReadyTimeout:15000, responseTimeout:120, autoDeleteFailed:true, autoDeletePrevious:true, resetWhenUpdate:true, statsUrl:''`。
- 差异（合理）：03 多 `Camera` 插件块 + `ios.contentInset:'always'`；04 多（应删的）SpeechRecognition + contentInset；05 用注释描述 iOS/Android 权限。

### F4.4 🟢 Low — Bundle ID 5 个唯一不冲突（✅）+ Android applicationId/namespace 对齐（✅）
iOS bundle ID 与 Android `applicationId` / `namespace` 全部 5 个唯一、与 appId 一致。Android compileSdk/targetSdk=34、minSdk=22（Cap8 默认）。无 `google-services.json`（follow-up #3 提到的 google-services 冲突已不复存在）。

### F4.5 💡 Improvement — Info.plist 残留 `armv7` 设备能力（32 位）
5 个 Info.plist `UIRequiredDeviceCapabilities` 含 `armv7`（Capacitor 老模板默认）。现代 iOS 全 64 位，`armv7` 无意义但无害。建议清理为 `arm64` 或删除该键。

---

## 5. OTA 可发布性

### F5.1 🔴 Critical — `ota:publish` 脚本路径 01/02/03/05 错误，仅 04 正确
**位置**：5 产品 package.json `scripts.ota:publish`

**核实结果**（实际写法）：
| 产品 | ota:publish 路径 | slug 参数 | 状态 |
|---|---|---|---|
| 01-ai-naming | `./scripts/publish-bundle.sh` | ❌无 | ❌ 路径错 + 无 slug |
| 02-countdown | `./scripts/publish-bundle.sh` | ❌无 | ❌ 路径错 + 无 slug |
| 03-plant-doctor | `./scripts/publish-bundle.sh` | ❌无 | ❌ 路径错 + 无 slug |
| 04-dream-journal | `../../scripts/publish-bundle.sh 04-dream-journal` | ✅有 | ✅ **正确** |
| 05-pet-cards | `./scripts/publish-bundle.sh` | ❌无 | ❌ 路径错 + 无 slug |

**问题**：脚本实际在 `mvp/scripts/publish-bundle.sh`，产品目录在 `mvp/products/0X/`，相对路径必须是 `../../scripts/`。01/02/03/05 写成 `./scripts/`（产品目录下无此文件），且未传 slug → 脚本 `slug_to_app_id` 拿不到 appId。`npm run ota:publish` 在这 4 个产品里**直接报 No such file**。仅 04 已修对（与 SHARED-CONVENTIONS:110、integration-report follow-up #8 的指引一致）。

**影响**：4/5 产品无法用封装命令发 OTA（绕开走完整 `../../scripts/publish-bundle.sh <slug> <ver> dist` 仍可，但违背"npm run ota:publish 已封装"的承诺）。

**建议**（发版前必修）：01/02/03/05 改为 `... ../../scripts/publish-bundle.sh <slug>`（slug 填各自目录名），与 04 对齐。

### F5.2 🔴 Critical — OTA 后端从未真实部署：wrangler.toml KV/R2/account 全是 placeholder
**位置**：`ota-backend/wrangler.toml`、`gateway/wrangler.toml`

**核实结果**：
- `ota-backend`：`OTA_MANIFEST` KV `id = "0000...0"` + `preview_id = "0000...0"`（default & staging）；`R2_ACCOUNT_ID = "REPLACE_ME_ACCOUNT_ID"`（default & staging）；R2 bucket 名已写但未创建。
- `gateway`：`RATE_LIMIT_KV` `id = "PLACEHOLDER_REPLACE_BEFORE_DEPLOY"`（default & staging）。

**问题**：KV namespace id、R2 account id 均为占位符 → `wrangler deploy` 会失败或绑定到不存在资源。这正是 integration-report follow-up #2 未做的"真实部署"。

**影响**：OTA 端到端链路（R2 上传 + KV manifest + presigned URL）**完全无法运行**；publish-bundle.sh 的 `wrangler r2 object put` / `POST /admin/manifest` 必失败。

**建议**（发版前必修）：`wrangler kv namespace create OTA_MANIFEST`、`wrangler r2 bucket create mvp-ota-bundles`、填回真实 id / account id、`wrangler secret put OTA_ADMIN_TOKEN / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY`。

### F5.3 🟠 High — 5 产品 OTA backend / gateway URL 仍指向未注册的 placeholder 域名
**位置**：5 产品 `vite.config.ts:25-26`（define 默认值）、`.env.example`

**核实结果**：5 产品 `__OTA_BACKEND_URL__` 默认 `https://mvp-ota.workers.dev`、`__GATEWAY_URL__` 默认 `https://mvp-gateway.workers.dev`（除非 `VITE_OTA_BACKEND_URL` / `VITE_GATEWAY_URL` 覆盖）。`mobileUpdates.ts` 直接用 `__OTA_BACKEND_URL__` 拼 `/mobile-updates/check`。

**问题**：这两个 `workers.dev` 子域是 placeholder（依赖 F5.2 部署后才存在）。当前打包进客户端的就是死链。

**影响**：真机 OTA 检查会持续失败（`mobileUpdates.ts` 有 try/catch 优雅降级为"更新检查暂时失败"，**不崩溃**，但永远拉不到更新）；LLM 调用 `llm.ts` 有 mock 兜底（不崩溃，但无真实 AI）。属"软失败"，非阻塞崩溃，但**功能不可用**。

**建议**：部署后把真实 Workers 域名写进 5 产品 `.env`（CI 注入 `VITE_OTA_BACKEND_URL` / `VITE_GATEWAY_URL`），重新 build 再发版。

### F5.4 🟢 Low — publish-bundle.sh 脚本本身实现健壮（✅）
脚本逻辑完备：slug→appId 映射表与 SHARED-CONVENTIONS 一致、`set -euo pipefail`、依赖检查（zip/curl/jq/wrangler）、macOS/Linux 双 checksum、dist/index.html 校验、R2 immutable cache、jq 构造 manifest payload、`curl --fail`。脚本无问题，问题在调用方路径（F5.1）与未部署（F5.2）。

---

## 6. integration-report.md 的 12 个 follow-ups 逐条核实

> 基线为 2026-05-28 报告；下列为 **2026-05-29 当前** 实际状态（Capacitor 8 升级后）。

### 🟡 中优先级

| # | Follow-up | 状态 | 核实依据 |
|---|---|---|---|
| 1 | 01 + 05 单元测试未迁 | ❌ **未解决** | `01-ai-naming/src` 0 个 `*.test.ts`（`verifyQuote.ts` 等仍无测试）；`05-pet-cards/src` 0 个（`audioFeatures.ts` / `moodColors.ts` 无测试）。02=2、03=1、04=1。 |
| 2 | OTA pipeline 真实部署未做 | ❌ **未解决** | gateway KV id = `PLACEHOLDER_...`；ota-backend KV id = `0000...`、`R2_ACCOUNT_ID=REPLACE_ME_ACCOUNT_ID`。见 F5.2。 |
| 3 | iOS/Android 真机构建未做 + JDK/google-services | ⚠️ **部分** | iOS SPM + Team ID 已注入（F4.1/F4.2），但**未真机构建验证**，且 F1.1 权限缺失会令真机崩溃；google-services 冲突**已消失**（无该集成）；JDK 统一未见配置。 |
| 4 | html2canvas 在 WKWebView 兼容性未实测 | ❌ **未解决（无法静态核实）** | 4 产品（01/02/04/05）仍依赖 html2canvas@1.4.x 做海报；无真机/模拟器实测记录。 |
| 5 | 占位图 35 张待生成 | ⚠️ **未核实**（超出本次 deps/build/ios 范围，需 codex 接力，未见生成证据） |
| 6 | 顶层 README 未完整重写 | ⚠️ **未核实**（本次未审 README 文案；SHARED-CONVENTIONS 已是 Vite 版但仍有 Cap6 漂移，见下） |
| 7 | 5 产品 README OTA 章节缺失（除 02） | ⚠️ **未核实**（未逐一审 README 正文） |
| 8 | `ota:publish` 脚本路径错误 | ⚠️ **部分解决** | **仅 04 改对**（`../../scripts/...04-dream-journal`）；01/02/03/05 仍是错误的 `./scripts/publish-bundle.sh` 且无 slug。见 F5.1。 |

### 🟢 低优先级

| # | Follow-up | 状态 | 核实依据 |
|---|---|---|---|
| 9 | 02 chunk >500KB 需 manualChunks | ❌ **未解决** | `02-countdown/vite.config.ts` 的 `build` 无 `rollupOptions.output.manualChunks`。 |
| 10 | Vite dev 端口管理标准化 | ✅ **已解决** | 5 产品 `vite.config.ts` 均 `port: 3000 + productIndex` + `strictPort:true`。 |
| 11 | 截图脚本 URL 需更新到 Vite 端口 | ⚠️ **部分** | `scripts/screenshot.mjs:94` 默认 `http://localhost:3000`，而 5 产品 Vite 端口是 3001-3005，默认值仍错；但支持 `process.argv[3]` 覆盖 baseUrl，故非死板。 |
| 12 | archive 老 5 个 OpenSpec changes | ✅ **已解决** | `openspec/changes/archive/` 下已含 `implement-01..05`；changes 根目录已无 `implement-*`。 |

**解决率小结**：12 条中 **✅ 已解决 2（#10、#12）｜⚠️ 部分 3（#3、#8、#11）｜❌ 未解决 4（#1、#2、#4、#9）｜未核实 3（#5、#6、#7 属占位图/README 文案，超 deps-build-ios 范围）**。

> 严格口径（已落实=✅）：**2/12 ≈ 17% 已完全解决，3/12 部分解决，4/12 未解决，3/12 超范围未核实**。其中 #2、#8 是发版阻塞。

---

## 7. .gitignore

### F7.1 🟠 High — 01/03/04 的 .gitignore 未排除 `dist/`，且无 Capacitor 段，仍含 Next.js 残留
**位置**：`products/01-ai-naming/.gitignore`、`03-plant-doctor/.gitignore`、`04-dream-journal/.gitignore`

**核实结果**：
| 产品 | dist/ | ios/Pods + android/build | Next.js 残留 | 评价 |
|---|---|---|---|---|
| 01 | ❌ 无 | ❌ 无 | `.next/ out/ next-env.d.ts .vercel` | 差 |
| 02 | ✅ 有 | ✅ 完整 Capacitor 段 | 无 | 好 |
| 03 | ❌ 无 | ❌ 无 | `.next/ out/` | 差（且磁盘上有 stale `.next/`） |
| 04 | ❌ 无 | ❌ 无 | `.next/ out/ next-env.d.ts` | 差 |
| 05 | ✅ 有 | ✅ 完整 Capacitor 段 | 无 | 好 |

`mvp/` 根 `.gitignore` 亦是 Next.js 版（`.next/ out/`，无 dist/ Capacitor 段）。SHARED-CONVENTIONS:335-353 的模板（含 `ios/App/Pods/`、`android/build/` 等）**只有 02/05 真正落地**。

**问题**：`mvp/` 当前整体未入 git（首次提交在即）。一旦 `git add`：
- 01/03/04 会把 **`dist/`（4-6 个构建产物文件，OTA 发布源，约定明确不入 git）误提交**。
- 若开发者在 01/03/04 跑过 `pod install` / gradle build，`ios/App/Pods/`、`android/build/` 也会被提交（仓库膨胀、合并冲突）。

**影响**：违背 SHARED-CONVENTIONS "dist 不入 git" 约定；仓库污染。因尚未提交，**现在修零成本**。

**建议**（发版前必修，低成本）：把 02/05 的 .gitignore（含 dist/ + Capacitor 段）复制到 01/03/04 与 mvp 根，去掉 Next.js 行。

### F7.2 🟢 Low — gateway / ota-backend .gitignore 正确排除 secrets（✅）
两者均 ignore `.dev.vars` / `.wrangler` / `dist` / `node_modules`（gateway 还 `!.dev.vars.example` 白名单）。Workers 密钥不会误提交，良好。

### F7.3 💡 Improvement — ios/ android/ 该不该入 git
约定（SHARED-CONVENTIONS:69-70）要求 `ios/`、`android/` **入 git**（仅排除 Pods/build/.gradle）。这是 Capacitor 标准做法（原生工程需版本化）。当前 02/05 的 .gitignore 正确支持此策略；01/03/04 因缺 Capacitor 段，会把 Pods/build 一起带进来——按 F7.1 修复即对齐。

---

## 8. 测试覆盖缺口

### F8.1 🟠 High — 01-ai-naming + 05-pet-cards 零测试，且覆盖的是合规/核心逻辑
**位置**：`01-ai-naming/src`、`05-pet-cards/src`（各 0 个 `*.test.ts`）

**核实结果**：
| 产品 | 测试文件数 | 覆盖 |
|---|---|---|
| 01 | **0** | `verifyQuote.ts`（诗经引用核验，**合规相关**）、`blacklist.ts`、`schema.ts` 全裸奔 |
| 02 | 2 | storage / dateMath |
| 03 | 1 | `lintAction.test.ts`（合规命脉 ✅） |
| 04 | 1 | `detectCrisis.test.ts`（危机三级，合规命脉 ✅） |
| 05 | **0** | `audioFeatures.ts`、`moodColors.ts`、`storage.ts` 无测试 |

**问题**：01 的 `verifyQuote.ts`（防伪造诗经出处，属内容合规护栏）与 05 的 `audioFeatures.ts`（音频→心情映射核心算法）完全无回归保护。gateway（4 个 test 文件）+ ota-backend（4 个 test 文件）服务端有覆盖，但客户端 01/05 缺口与 integration-report follow-up #1 完全吻合，至今未补。

**影响**：不阻塞 build（无 test 时 `vitest run` 通过），但合规审查 / 重构时**回归风险高**，尤其 01 verifyQuote 若回归会放出伪造典故。

**建议**：补 `01/src/lib/verifyQuote.test.ts`（≥5 case，覆盖真/伪典故、空输入、注入）、`05/src/lib/audioFeatures.test.ts` + `moodColors.test.ts`。优先 01 verifyQuote（合规权重高）。

---

## 9. 发版前必须修的阻塞项（Blocking）

> 以下不修，App 上不了架 / OTA 不可用 / 仓库被污染：

1. **🔴 [F1.1] 补齐 iOS 隐私权限串 + Android RECORD_AUDIO**
   - 03 Info.plist：`NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`
   - 04 Info.plist：`NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription`；04 AndroidManifest：`RECORD_AUDIO`
   - 05 Info.plist：`NSMicrophoneUsageDescription`；05 AndroidManifest：`RECORD_AUDIO`
   - 否则：iOS 调用即崩溃 + App Store 拒审；Android 04/05 录音/语音静默失败。

2. **🔴 [F5.2] 真实部署 OTA 后端 + gateway**
   - 创建 KV namespace / R2 bucket，填回真实 id / R2_ACCOUNT_ID，注入 secrets。
   - 否则：OTA 链路整体不可用。

3. **🔴 [F5.1] 修 01/02/03/05 的 `ota:publish` 路径**为 `../../scripts/publish-bundle.sh <slug>`（对齐 04）。

4. **🟠 [F5.3] 部署后把真实 Workers 域名写入 5 产品 `.env` 并重新 build**（否则客户端拼死链，OTA/LLM 软失败不可用）。

5. **🟠 [F7.1] 修 01/03/04 + mvp 根 `.gitignore`**（加 `dist/` + Capacitor 段，删 Next.js 行）—— 必须在 `mvp/` 首次 `git add` 之前，否则误提交 dist/Pods。

6. **🟠 [F4.1] 修 pbxproj 重复 `CODE_SIGN_STYLE` 键**（幂等注入或迁 xcconfig），防签名配置二次注入漂移。

**强烈建议（非硬阻塞，发版同窗口处理）**：
- [F8.1] 补 01 `verifyQuote` 测试（合规护栏裸奔）。
- [F1.2/F1.3] 删 04 SpeechRecognition 死配置 + 05 误导注释 + AudioRecorder 死代码 + 全仓 `'use client'`。
- [F3.2] 统一 03 依赖版本风格（顺带让 03 拿到 PostCSS XSS 修复）。

---

## 10. 构建健康评分

### 评分：**B-**

**分项**：
| 维度 | 评级 | 说明 |
|---|---|---|
| Capacitor 8 版本对齐 | A | 5 产品版本零漂移，SPM 干净，幽灵依赖彻底清除 |
| 生产依赖安全 | A | `--omit=dev` 全 0 漏洞 |
| dev 工具链安全 | C+ | 中危/少量 high，均不进生产，但 gateway/ota high 需排期 |
| iOS 工程 | C | bundle/Team/SPM 对，但 Info.plist 权限缺失（崩溃级）+ pbxproj 重复键 |
| Android 工程 | C+ | applicationId 对、Camera 自动合并，但 RECORD_AUDIO 缺失 |
| OTA 可发布性 | D | 未部署 + 4/5 脚本路径错 + 客户端死链 |
| git 卫生 | C | 2/5 产品 .gitignore 合格，3/5 会误提交 dist |
| 测试覆盖 | C | 服务端好，01/05 客户端零测试（合规逻辑裸奔） |

整体被 OTA 未发布（D）与 iOS 权限缺失（崩溃级）拉低；但核心架构（Cap8 迁移、版本对齐、SPM、依赖安全）扎实，**阻塞项均为"配置/部署/权限补齐"类、改动量小、无架构性返工**，修完可达 A-。

### 一句话总评

**架构迁移底子扎实（Capacitor 8 全线对齐、SPM 干净、生产依赖 0 漏洞），但卡在"最后一公里"的工程化收尾——iOS/Android 媒体权限串缺失会让 03/04/05 一调相机麦克风就崩、OTA 后端从未真实部署且 4/5 发版脚本路径写错、3/5 产品的 .gitignore 会把 dist 误提交——这些都是小改动高影响的发版阻塞，补齐即可上架。**
