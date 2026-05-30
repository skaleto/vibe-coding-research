# MVP 工厂全面审计 · 总报告

**审计日期**：2026-05-29
**方法**：7 个 opus 4.7 审计 agent 并行（逐库深审 ×4 + 横切专项 ×2 + 产品商业 ×1），全程 read-only，关键论断由 agent 用 PoC / node 脚本独立验证，汇总者交叉核验纠偏。
**范围**：~21,000 LOC，7 个代码库（gateway / ota-backend / 5 产品）+ 产品商业层。
**子报告**：`mvp/audit/A1~A7-*.md`

---

## 一、执行摘要

### 健康评分总览

| 模块 | 评分 | 一句话 |
|---|---|---|
| gateway 后端 | **B−** | 工程扎实，但合规 enforce 的关键算法（子串匹配）可被字符变体击穿 |
| ota-backend | **B−** | 基本功好，风险集中在"单一 admin token + 客户端自校验"信任根 |
| 前端 01 起名 | **C** | 合规违规文案 + 6 处 'use client' 残留，最需返工 |
| 前端 02 倒数日 | **B** | 5 产品质量标杆（zustand+单测+zod 容错）|
| 前端 03 植物医生 | **B−** | lintAction 双拦截到位，但 localStorage 易爆 + 假诊断兜底 |
| 前端 04 梦境日记 | **B−** | 合规 UI 绕不过，但危机检测"漏检"是真软肋 + 反沉迷弹窗缺失 |
| 前端 05 宠物心情 | **B+** | 最干净，"翻译"禁词 + disclaimer 落地最好 |
| 安全（横切） | **C** | 密钥/XSS 优等生，但护栏可绕过 + OTA 供应链单点爆炸半径过大 |
| 构建/iOS（横切） | **B−** | 卡在权限串/部署/收尾，都是小改动高影响阻塞 |

### 一句话总判断

> **架构与工程基本功扎实（密钥零泄露、零 XSS、合规 UI 绕不过、Capacitor 8 迁移干净），但有两类结构性问题让它现在"不能上线"：(1) 合规护栏的核心算法是子串匹配，已被 PoC 验证可绕过——心理健康/医疗产品的安全红线；(2) 我升级 Capacitor 8 时删了原生录音/相机插件改用 Web API，却没补 iOS 权限串——03/04/05 调用即崩溃 + 必然拒审。两者都是"小改动、高影响"，修完可达可上线门槛。**

### Finding 总量（7 份去重后）

- 🔴 **Critical 7 类**（多 agent 交叉验证）
- 🟠 **High ~14**
- 🟡 Medium ~40
- 🟢 Low / 💡 ~50

---

## 二、🔴 Critical（必修，按主题去重）

### C1. 危机/禁词检测可被字符变体绕过 ⭐ 头号问题
**来源**：A1 F-01/02 + A4 F04-02 + A5-01/02（**3 个 agent 独立命中，A5 已复现 PoC**）
**位置**：`gateway/src/lib/detectCrisis.ts` + `products/04-dream-journal/src/lib/detectCrisis.ts` + `gateway/src/lib/lintAction.ts`

- 危机检测只做 `toLowerCase + includes` 简体子串匹配，无 NFKC 归一化、无去空白：
  - `自 杀`（空格）/ `自​杀`（零宽字符）/ `自殺`（繁体）→ **全部漏检**
  - `mood` 字段完全不进检测（A1）
  - 委婉语"解脱""不想撑了"未进一级词表（A4）
- 农药/禁词 lint 同样的字符变体可绕过 + 英文名（carbendazim）漏匹配
- **客户端和服务端共用同一弱算法 → 双层防御坍缩成单层弱防御**
- **影响**：04 心理健康产品的法律底线、03 禁农药红线在实战下形同虚设
- **修复**：统一 normalize 层（NFKC + 去空白/零宽 + 繁简归一）；危机词表覆盖全部进 prompt 文本（含 mood）；补委婉语词表；lintAction 同步硬化 + 补英文农药名。**A5 已挂后台 chip 可一键 spin off。**

### C2. iOS Info.plist 缺隐私权限串 → 调用即崩溃 + 拒审 ⭐ 我埋的雷
**来源**：A6 #1（汇总者已核验：03/04/05 的 Info.plist **确实 0 个权限串**）
**根因**：升级 Capacitor 8 时删了 native speech/voice 插件改用 Web API，但没补对应权限声明。

- 03 缺 `NSCameraUsageDescription`（拍照诊断）
- 04 缺 `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription`（语音输入）
- 05 缺 `NSMicrophoneUsageDescription`（录音）
- 04/05 Android 缺 `RECORD_AUDIO`
- **影响**：用户点录音/拍照按钮 → App 当场崩溃；App Store 审核必拒（Guideline 5.1.1）
- **修复**：5 分钟工作量，往各 Info.plist 补权限串（中文用途说明）。**这是真机已装的 4 个 App 的隐藏雷——现在点录音会崩。**

### C3. 04 反沉迷弹窗完全缺失 → 卡上架
**来源**：A4 F04-01
**位置**：`products/04-dream-journal/`（compliance-checklist § 4.D 硬性项，未实现）
- AI 拟人化新规要求心理类产品有反沉迷提示，当前完全没做
- **影响**：国内合规硬性项缺失，上架被拒
- **修复**：连续 7 天 / 单日 30 次记录触发休息弹窗

### C4. 01 合规违规文案（命理红线 + 伪造社交证明）
**来源**：A3（汇总者已核验属实）
**位置**：
- `01-ai-naming/src/components/Loading.tsx:12` —— 默认文案 **"AI 正在排八字…"**（"八字"是命理红线，与产品自身"不算命"免责声明直接冲突）
- `01-ai-naming/src/components/PricingModal.tsx:165` —— **"已为 12,438 位家庭起名"**（伪造社交证明，与 stats.ts 刻意归零的诚信立场冲突）
- **影响**：上架合规风险 + 品牌诚信自相矛盾
- **修复**：改 Loading 默认文案为"AI 正在为宝宝选字…"；删伪造数字或接真实 stats

### C5. OTA 全链路当前不可用（部署 + 1 个脚本路径）
**来源**：A3 + A6 #2/#3（汇总者已核验纠偏）
- OTA 后端 + gateway **从未部署**，wrangler.toml 的 KV id / R2 account / OTA URL 全是 placeholder
- `ota:publish` 路径：**实际只有 05-pet-cards 还错**（`./scripts/` 应为 `../../scripts/publish-bundle.sh 05-pet-cards`）；01/02/03/04 已正确（A3/A6 摘要把范围说大了）
- **影响**：OTA 热更新（整个跨端方案的核心卖点）目前完全跑不通
- **修复**：部署 2 个 Workers（需 Cloudflare 账号）+ 修 05 的脚本路径一行

### C6. OTA 供应链单点爆炸半径过大
**来源**：A2 F-01 + A5-08/09
- `/admin/manifest` 的 `r2Key` 只校验非空 → `../io.petcards.app/x.zip` 经 `new URL()` 规范化可签出桶外/跨 app 对象（路径穿越）
- 5 个 app 共享同一 `OTA_ADMIN_TOKEN` → 一个 token 泄露 = 5 个上架 app 全部可被供应链投毒
- OTA 无端到端来源签名（capgo OSS checksum 只防传输不防来源）+ 全 5 产品 `cleartext:true`/`androidScheme:'http'`
- **影响**：bundle 投毒可推恶意代码到所有已装用户（OTA 绕过 App Store 审核）
- **修复**：r2Key 强制 `${appId}/` 前缀 + 字符白名单；per-app token；bundle 端到端签名；关 cleartext

### C7. manifest 并发写丢更新
**来源**：A2 F-13
- read-modify-write 无 CAS/事务，5 产品共用后端 + CI 并行发布时丢 current/history
- **影响**：并发发版数据损坏
- **修复**：串行化或迁 Cloudflare D1/Durable Objects

---

## 三、🟠 High（应修）

| # | 问题 | 来源 | 影响 |
|---|---|---|---|
| H1 | `/diagnose` images 未强制 `data:` URI → **SSRF**，经 LLM provider 出口打任意内网 URL | A5-14 | 服务端被当跳板 |
| H2 | 限速 `X-Forwarded-For` 可伪造 + KV fail-open + 部署 placeholder → 无限刷 LLM | A1 F-11 + A5-16 | 账单攻击 |
| H3 | gateway 文本链**从不跨 provider 降级**（注释写降级，实际只用首选）；与视觉链不一致 | A1 | 单 provider 挂 = 全挂（实际靠 mock 兜底，但非预期） |
| H4 | diagnose 失败时把 mock"玉露黑腐病"伪装成**自信的真实诊断**（`mockUnableToIdentify` 是死代码）| A1 + A3 | 用户被误导给错植物用错养护 |
| H5 | 03 base64 缩略图无上限堆进 localStorage（含 pending 死代码）→ 易爆配额 | A3 | 用户多次诊断后 App 卡死 |
| H6 | admin token 无强度校验 + 示例值弱 | A2 F-08 | 信任根脆弱 |
| H7 | 05 AudioRecorder 残留整套 native VoiceRecorder 死代码（Cap8 已删插件）| A4 + A6 | 维护混淆，stub 永远 false |
| H8 | 04 无 native 语音 fallback（删了 plugin），iOS WKWebView Web Speech 会报错 | A4 | 语音输入功能在真机不可用 |

---

## 四、产品 / 商业层判断（A7）

### 商业评分（结合实际做出来的形态）

| 产品 | 商业分 | MVP 完成度 | 上架过审概率 | 天花板 | 关键 gap |
|---|---|---|---|---|---|
| 01 起名 | **4.0** | 70% | 中（命理文案需清） | ¥15-30K/月 | 占位图 8 张 0 生成（首页开天窗）|
| 02 倒数日 | **3.5** | 85% | **90%（最高）** | ¥5-15K/月 | WidgetKit 仅 TODO、付费 mock |
| 03 植物医生 | **3.0** | 75% | 高 | ¥3-8K/月 | 真 key 未实测诊断准确率 |
| 04 梦境日记 | **2.5** | 70% | **50%（最低）** | ¥3-6K/月 | 反沉迷缺失 + 责任最重 |
| 05 宠物心情 | **2.5** | 80% | 中 | 爆款赌注/零复购 | 海报背景图 0 生成 |

### 最尖锐的洞察：工程精力错配
**最重的合规工程（危机干预三层检测、热线 placeholder、disclaimer 强制注入）投在了最不赚钱、责任最重的 04/05 上**；而商业天花板最高的 01 反而残留命理违规文案 + 评分最低（C）。

### levelsio 3 条经验落地度
- ✅ Fire your X 标语：3 个套用 + 2 个合规规避
- ✅ 首页数字 banner：诚信归零（拒绝伪造）—— **但 01 的 PricingModal 仍有伪造"12,438 家庭"，自相矛盾**
- ✅ 删营销段：01/03 删了一屏

### 商业闭环空心
付费 100% mock（零支付 SDK）、35 张占位图 0 生成、02 核心 WidgetKit 仅 TODO、0 用户访谈。

---

## 五、两个战略张力（需你决策）

### 张力 1：04 梦境日记——修还是砍？
- **代码层（A1/A4/A5）**：它的危机检测有已验证可绕过的漏检洞，要投入加固（normalize + 词表）
- **产品层（A7）**：天花板最低（¥3-6K）+ 过审概率最低（50%）+ 法律责任最重，建议**冻结止损**
- **矛盾点**：到底是花力气把合规命脉修对（C1+C3），还是直接砍掉不上架？

### 张力 2：先"能上架"还是先"能赚钱"？
- **能上架路径**：先清 C1-C4 安全合规阻塞 → 5 产品都能过审
- **能赚钱路径（A7 推荐）**：直接 all-in 02 倒数日，48h 接 IAP + 补 WidgetKit，跑出第一笔真实付费，验证商业模式再说

---

## 六、改进路线图（分阶段）

### P0 · 阻塞上架（必修，~1-2 天）
1. **C2** 补 iOS Info.plist 权限串（03/04/05）+ Android RECORD_AUDIO — 5 分钟，但不修真机必崩
2. **C1** 危机/禁词检测 normalize 硬化（gateway + 04 client + lintAction）— 半天，安全红线
3. **C4** 清 01 命理违规文案（排八字 + 伪造数字）— 10 分钟
4. **C3** 04 补反沉迷弹窗 — 2 小时（若决定保留 04）
5. **H4** diagnose 失败别伪装真实诊断，改"请补图" — 30 分钟

### P1 · 安全加固（上线前应修，~1 天）
6. **C6** OTA r2Key 前缀校验 + per-app token + 关 cleartext
7. **C7** manifest 串行化/迁 D1
8. **H1** /diagnose 强制 data: URI
9. **H2** 限速 IP 可信来源 + fail-closed
10. **H6** admin token 强度断言

### P2 · 商业闭环（赚钱前提，~3-5 天）
11. **C5** 部署 gateway + ota-backend（Cloudflare 账号）+ 修 05 脚本
12. all-in 02：接 Apple IAP + 补 WidgetKit
13. 生成占位图（01 的 8 张 + 05 的 12 张，codex 接力）
14. 真 LLM key 实测 03 诊断准确率
15. 5-10 个用户付费访谈校准定价

### P3 · 质量收尾（~2 天）
16. 01 + 05 补单元测试（verifyQuote / audioFeatures）
17. 清死代码（05 VoiceRecorder stub、03 pending、OTA 进度事件无监听）
18. 更新 SHARED-CONVENTIONS（Capacitor 6→8、ES2022 实际值）
19. .gitignore 补 dist/ 排除
20. H3 文本链真降级 or 修注释

---

## 七、正向结论（做对的地方）

- 密钥/凭证零泄露到客户端与 git（LLM key / OTA token / R2 凭证）
- 零 XSS sink，无 dangerouslySetInnerHTML 误用
- disclaimer 服务端强制注入不可绕过；admin token 常量时间比较
- Capacitor 8 迁移干净：版本零漂移、SPM 干净、幽灵依赖三处彻底清除、Bundle ID 唯一、生产依赖 0 漏洞
- 02 倒数日是工程标杆（zustand + 单测 + zod 容错）
- 合规 UI 层绕不过（04 三层 + 零继续按钮，05 翻译 0 处 + disclaimer 五处）
- levelsio 数字 banner 诚信归零（除 01 PricingModal 那处矛盾）

---

*汇总者交叉核验纠偏记录：(1) ota:publish 路径——agent 说 4 个错，实测只有 05 错；(2) iOS 权限串——实测 03/04/05 确认 0 权限串，属实；(3) 01 违规文案——实测 Loading.tsx:12 + PricingModal.tsx:165 属实；(4) detectCrisis 无 normalize——实测属实。*
