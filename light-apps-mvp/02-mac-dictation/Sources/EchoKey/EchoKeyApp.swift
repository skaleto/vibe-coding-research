import SwiftUI

/// EchoKey — 本地语音听写工具的菜单栏入口。
///
/// 架构总览（数据流，全程本机）：
///   全局热键(按住) ──▶ AudioRecorder 采麦 ──▶ TranscriptionEngine 端侧转写
///        松开 ─────────────────────────────────▶ Vocabulary 词典纠错 ──▶ TextInjector 打进当前 App
///
/// 这层 App struct 只负责"把 SwiftUI 场景搭起来"，所有业务逻辑都在 `AppState`（ObservableObject）里。
/// 菜单栏 App 用 `MenuBarExtra`（macOS 13+），这是本骨架能跑通的关键。
@main
struct EchoKeyApp: App {
    /// 全局唯一的应用状态机。`@StateObject` 保证生命周期跟随 App。
    @StateObject private var appState = AppState()

    var body: some Scene {
        // 菜单栏图标 + 下拉内容。`.menuBarExtraStyle(.window)` 让我们能放一个真正的
        // SwiftUI 视图（带按钮/状态），而不是只能放 Menu item。
        MenuBarExtra {
            MenuContentView()
                .environmentObject(appState)
        } label: {
            // 状态驱动的图标：空闲 / 录音中 / 转写中 用不同 SF Symbol，给用户即时反馈。
            Image(systemName: appState.status.symbolName)
                .accessibilityLabel(Text(appState.status.label))
        }
        .menuBarExtraStyle(.window)

        // 设置窗口：⌘, 打开，或从菜单点"设置…"。
        Settings {
            SettingsView()
                .environmentObject(appState)
        }
    }
}
