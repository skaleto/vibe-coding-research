# 低 AI 成本轻应用 · 3 个 MVP

**完成**：2026-05-30
**方向**：开发用 vibe coding（一次性省力）+ 运行时零/低 AI 成本 + 一次性买断（详见 `../light-app-low-ai-2026/deep-dive/00-MASTER.md`）
**实现**：3 个 opus agent 并行，每个先写 PRD 再 vibe code MVP + 自验。

---

## 三个产品

| # | 产品 | 场景 | 形态 | 运行时 AI | 变现 | 状态 |
|---|---|---|---|---|---|---|
| 01 | **TrustJSON** | 可信零追踪 JSON 查看器（蹭 JSON Formatter 塌房窗口）| Chrome MV3 扩展 | 零（纯本地）| 免费 + Pro $19-29 买断 | ✅ 真 Chrome CDP 端到端跑通，50.8MB JSON 160ms 解析 |
| 02 | **EchoKey** | 本地语音听写（中英混说+买断，对标 Wispr Flow）| Mac SwiftUI menubar | 端侧（Whisper）| $29-39 买断 | ✅ swift build 0 error，需真机授权验证录音/热键 |
| 03 | **简历模板** | 简历模板 + 填表→排版→导出 PDF（小红书产品即内容）| Vite+React web | 零（纯模板套数据）| 免费 + ¥9 买断 | ✅ npm build 0 error + Playwright 16/16 通过 |

PRD 分别在 `prd-01-trustjson.md` / `prd-02-mac-dictation.md` / `prd-03-resume-templates.md`。
截图在 `shots/`。

---

## 如何运行

### 01 TrustJSON（Chrome 扩展）
```
chrome://extensions → 开启「开发者模式」→「加载已解压的扩展程序」→ 选 light-apps-mvp/01-trustjson/
自验：cd 01-trustjson && npm run check   （manifest 24/24 + core 31/31）
```
功能：粘贴/打开/拖拽 JSON → 树视图(折叠/类型着色) + Web Worker 解析 + 虚拟滚动(扛 50MB) + 搜索高亮 + 复制路径 + 格式化/压缩 + 错误行列定位 + 深浅主题。隐私：仅 storage 权限、无 host_permissions、CSP connect-src 'none'、零网络请求。

### 02 EchoKey（Mac 语音听写）
```
open light-apps-mvp/02-mac-dictation/Package.swift   （Xcode 打开）
swift build                                          （已验证 0 error，需 macOS 13+）
接 WhisperKit：见 README 三步（加 SPM 依赖 + ECHOKEY_WHISPERKIT define + 下模型）
```
完整逻辑：MenuBarExtra + 状态机 + 设置持久化 + 转写抽象层 + MockEngine（可跑通）+ 词典纠错。需真机授权验证：录音(AVAudioEngine)、全局热键(Carbon)、文本注入(CGEvent)。

### 03 简历模板（Web）
```
cd light-apps-mvp/03-resume-templates && npm install && npm run dev → http://localhost:3003
build：npm run build （已验证 0 error）
```
4 套模板（极简灰/专业蓝/创意彩/学术黑）+ 左表单右 A4 实时预览 + 增删排序 + localStorage 自动存 + 付费墙 mock + 响应式。PDF 双方案（html2canvas+jsPDF 下载 / react-to-print 矢量打印）。

---

## 共同特征（对齐研究结论）
- **运行时零/低 AI 成本**：01/03 纯本地零网络，02 端侧转写零云
- **一次性买断**：规避持续 API 账单
- **痛点真实有付费验证**：见各 PRD 引用的子报告数据
- **vibe coding 友好**：01/03 一周可 ship，02 骨架已搭好

## 已知限制（诚实）
- 三者付费均为 mock，未接真实支付（微信/Apple IAP/ExtensionPay）
- 02 EchoKey 的录音/热键/注入需真机授权后验证（Mock 引擎可跑流程）
- 01 Pro 功能（diff/jq/JWT）为占位；03 PDF 下载为位图（矢量走打印）
- 均未做冷启动（Show HN / 小红书内容）—— 这是研究反复强调的真壁垒

## 下一步建议
按研究的 all-in 排序：先把 **01 TrustJSON** 上架 + Show HN 蹭塌房事件（你是字节工程师=目标用户，时机不等人），同步开小红书号试 **03 简历模板**内容选题；**02 EchoKey** 作为第二阶段（最重，需聚焦"中英混说"楔子做到中文开发者尖叫）。
