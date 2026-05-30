# EchoKey — 本地语音听写（菜单栏 MVP 骨架）

> 按住快捷键说话 → 端侧转写 → 把文字打进**任意 App** 的 macOS 听写工具。
> 全程本机跑（Whisper / Apple 端侧），主打 **中英混说 + 技术词汇 + 真私有 + 一次买断**。
> 对标月费 $15 且每句上传服务器的 Wispr Flow。

产品 PRD 见同级目录的 `../prd-02-mac-dictation.md`。

---

## 这是什么 / 不是什么

- ✅ 一个**工程结构完整、关键逻辑写实、可真正 `swift build` 通过**的 MVP 骨架。
- ✅ 流程闭环：热键 → 录音 → 转写（Mock 引擎即可跑通）→ 词典纠错 → 文本注入。
- ⚠️ 不是成品：真实端侧转写（WhisperKit）默认未接入依赖；几处"碰系统底层"的能力
  （CGEvent 注入 / Carbon 热键 / AVAudioEngine 采麦）是**真实接口 + 实现框架**，
  需在**真机授权后验证**（CI / headless 环境跑不全这些权限相关行为）。

### 完整逻辑 vs 占位（一目了然）

| 模块 | 文件 | 状态 |
|---|---|---|
| App 入口 / MenuBarExtra | `EchoKeyApp.swift` | ✅ 完整 |
| 状态机 / 全链路编排 | `AppState.swift` | ✅ 完整逻辑 |
| 设置持久化（Codable + UserDefaults） | `Models/Settings.swift` | ✅ 完整逻辑 |
| 语言模型（中/英/**中英混**） | `Models/DictationLanguage.swift` | ✅ 完整 |
| 转写抽象层 protocol | `Transcription/TranscriptionEngine.swift` | ✅ 完整 |
| Mock 转写引擎 | `Transcription/MockEngine.swift` | ✅ 完整可运行 |
| 词典纠错（graph cool→GraphQL） | `Injection/Vocabulary.swift` | ✅ 完整逻辑 |
| 菜单 UI / 设置面板 | `Views/*.swift` | ✅ 完整 |
| 录音（AVAudioEngine→16kHz） | `Audio/AudioRecorder.swift` | 🟡 真实实现框架，需真机麦克风验证 |
| 全局热键（Carbon 按住/松开） | `Hotkey/HotkeyManager.swift` | 🟡 真实实现框架，需真机验证 |
| 文本注入（CGEvent 两策略） | `Injection/TextInjector.swift` | 🟡 真实实现框架，需辅助功能授权验证 |
| WhisperKit 端侧转写 | `Transcription/WhisperKitEngine.swift` | 🟡 真实实现（`#if` 后），需接 SPM 依赖 + 下模型 |

> 说明：🟡 不是"空壳 TODO"，而是写出了可读、可编译、逻辑闭环的真实代码，
> 只是其行为依赖系统权限 / 外部模型，必须在真机上才能端到端跑通。

---

## 工程结构

```
02-mac-dictation/
├── Package.swift                     # SwiftPM 可执行包（macOS 13+）
├── Info.plist                        # 权限说明（麦克风/语音识别，中文）— 供 Xcode 工程使用
├── README.md
├── .gitignore
└── Sources/EchoKey/
    ├── EchoKeyApp.swift              # @main + MenuBarExtra + Settings 场景
    ├── AppState.swift                # 状态机：粘合全部子系统（完整编排）
    ├── Models/
    │   ├── DictationLanguage.swift   # 中 / 英 / 中英混
    │   └── Settings.swift            # AppSettings + 持久化
    ├── Transcription/
    │   ├── TranscriptionEngine.swift # 抽象层 protocol + AudioBuffer
    │   ├── MockEngine.swift          # 假引擎（让骨架无模型也能跑）
    │   └── WhisperKitEngine.swift    # 真实端侧引擎（#if 切换）
    ├── Audio/
    │   └── AudioRecorder.swift       # AVAudioEngine 采麦 + 重采样到 16kHz
    ├── Hotkey/
    │   └── HotkeyManager.swift       # Carbon RegisterEventHotKey 按住/松开
    ├── Injection/
    │   ├── TextInjector.swift        # CGEvent 键入 / 剪贴板粘贴
    │   └── Vocabulary.swift          # 自定义词典纠错
    └── Views/
        ├── MenuContentView.swift     # 菜单栏下拉
        └── SettingsView.swift        # 设置面板（引擎/语言/热键/词典）
```

---

## 快速开始（命令行，无需开 Xcode）

```bash
cd 02-mac-dictation
swift build            # 默认用 MockEngine，无需任何模型 / 不联网即可编译
swift run EchoKey      # 启动菜单栏 App（顶部状态栏出现麦克风图标）
```

> 默认引擎是 **Mock**：按住热键（⌥Space）说话→松开，会注入一句演示文本，
> 其中故意含 "graph cool"，你能看到词典把它纠成 "GraphQL"。这样**不接模型也能验证全链路 UI/流程**。

### 在 Xcode 打开

```bash
cd 02-mac-dictation
open Package.swift     # Xcode 会以 SwiftPM 包形式打开，可直接 Run
```

或新建一个标准 macOS App 工程并把 `Sources/EchoKey/` 拖进去——**发布版推荐用 .xcodeproj**，
因为要配置 `INFOPLIST_FILE = Info.plist`（权限说明）、App Sandbox/Hardened Runtime、代码签名、
以及 WhisperKit 模型打包，这些 SwiftPM 可执行包不便管理。

---

## 接入真实端侧转写（WhisperKit，中英混说主引擎）

骨架默认**不**引入 WhisperKit，以保证离线/CI 下也能 `swift build`。接入步骤：

1. **打开依赖**：编辑 `Package.swift`，取消两处注释——
   - `dependencies` 里的 `.package(url: ".../WhisperKit.git", from: "0.9.0")`
   - target `dependencies` 里的 `.product(name: "WhisperKit", package: "WhisperKit")`
2. **打开真实实现宏**：给 target 加 `swiftSettings: [.define("ECHOKEY_WHISPERKIT")]`
   （`WhisperKitEngine.swift` 用 `#if ECHOKEY_WHISPERKIT` 切到真实实现）。
3. **下模型**：首次运行 `WhisperKit(config)` 会从 HuggingFace 拉取并编译 CoreML 模型到本地缓存，
   之后**永久离线**。MVP 默认 `small` 档（中英混说性价比较好）。
4. 在设置面板把引擎切到 **WhisperKit 端侧**。

> 中英混说的关键：`DictationLanguage.codeSwitch` 时把 Whisper 的 `language` 设为 `nil`，
> 让 multilingual 模型自动识别、自由在中/英间切换——这正是 Apple SFSpeechRecognizer 做不好的点。

---

## 授权（真机必做）

| 权限 | 何时需要 | 在哪开 |
|---|---|---|
| **麦克风** | 录音 | 首次录音弹窗 / 系统设置 ▸ 隐私与安全性 ▸ 麦克风 |
| **辅助功能** | 文本注入（CGEvent）+ 未来"按住 fn" | 系统设置 ▸ 隐私与安全性 ▸ 辅助功能（手动把 EchoKey 打勾） |
| **语音识别** | 仅当走 Apple SFSpeechRecognizer 降级路径 | 首次弹窗 |

> 注入文本若"没反应"，**99% 是辅助功能没授权**——CGEvent 会被系统静默丢弃。
> 真机版应在注入前用 `AXIsProcessTrusted()` 检查并引导用户去开启。

---

## 自验结果（诚实记录）

本仓库在 **Swift 6.3.1 / Xcode 26.4 / macOS SDK 26.4** 环境实测：

- ✅ `swift build` —— **Build complete!**，0 error / 0 warning，产物 `.build/debug/EchoKey`（~733 KB）。
- ✅ `./.build/debug/EchoKey` —— 启动后稳定运行（>3s 无崩溃、无报错），说明 `AppState`
  及其子系统（含 Carbon 热键注册、引擎工厂）整图初始化正常。
- ✅ `WhisperKitEngine.swift` 的 `#if ECHOKEY_WHISPERKIT` 真实实现分支 `swiftc -parse` 通过
  （语法合法；模块解析留待真机接依赖时）。

> 注意：build 成功是因为本环境**恰好装了完整 Xcode**。在纯 CLI Swift 工具链（无 macOS GUI
> framework）下，SwiftUI/AppKit/Carbon 链接会失败——这属于环境差异，非代码问题。

---

## MVP 边界与缺什么（待真机/后续）

- 热键录制 UI（设置里"更改…"按钮目前禁用）——需真机捕获按键写回 `AppSettings.hotkey`。
- "按住 fn 说话"：纯 `fn` 键 Carbon 注册不了，需改用 `CGEventTap` 监听 `.maskSecondaryFn`
  （需辅助功能授权）。MVP 先用可注册的 ⌥Space。
- 文本注入跨 App 兼容性：Electron 应用 / 终端 / 密码框行为不一，需逐一验证；已提供
  "键入 / 剪贴板粘贴"双策略兜底。
- AI 后处理（口语→规范文本、加标点、整理 prompt）：P1，用 Apple Foundation Models 端侧、零云。
- 模型下载中心 / 多模型管理 / 分应用模式：P1。
- 付费墙：MVP 不做，先免费发 HN / r/macapps 验证"中英混说 + 离线"是否有人尖叫。

---

## 设计要点回顾

- **为什么 Swift 不用 Tauri**：全局热键、CGEvent 注入、菜单栏、WhisperKit/Apple 端侧模型
  全是 macOS 系统底层，Tauri/Electron 做不好（详见 PRD §7.1）。
- **为什么有抽象层**：`TranscriptionEngine` protocol 把引擎差异隔离，MVP 用 Mock 跑通、
  真机切 WhisperKit、未来加 Apple 降级路径都只是"再加一个实现"，一行工厂代码切换。
- **隐私是反卖点**：默认零网络、可断网验证；这是相对 Wispr「每句上传」的结构性优势。
