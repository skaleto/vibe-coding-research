import SwiftUI
import AppKit

/// 菜单栏下拉内容：状态、开始/停止、设置入口、退出。
struct MenuContentView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 标题 + 当前状态
            HStack {
                Image(systemName: appState.status.symbolName)
                Text("EchoKey").font(.headline)
                Spacer()
            }
            Text(appState.status.label)
                .font(.caption)
                .foregroundStyle(.secondary)

            Divider()

            // 开始/停止听写（给不想用热键的用户）
            Button(action: { appState.toggleDictationManually() }) {
                Label(startStopTitle, systemImage: startStopSymbol)
            }
            .keyboardShortcut("d", modifiers: [.command, .shift])

            // 当前热键提示
            Text("热键：按住 \(appState.settings.hotkey.displayString) 说话")
                .font(.caption2)
                .foregroundStyle(.secondary)

            // 最近一次转写结果（方便用户确认/复制）
            if !appState.lastTranscript.isEmpty {
                Divider()
                Text("最近一次：")
                    .font(.caption).foregroundStyle(.secondary)
                Text(appState.lastTranscript)
                    .font(.caption)
                    .lineLimit(3)
                    .textSelection(.enabled)
            }

            // 错误态：给一个"知道了"清除
            if case .error(let msg) = appState.status {
                Divider()
                Text(msg).font(.caption).foregroundStyle(.red).lineLimit(3)
                Button("知道了") { appState.clearError() }
            }

            Divider()

            Button("设置…") { Self.openSettingsWindow() }
                .keyboardShortcut(",", modifiers: .command)

            Button("退出 EchoKey") { NSApplication.shared.terminate(nil) }
                .keyboardShortcut("q", modifiers: .command)
        }
        .padding(12)
        .frame(width: 280)
    }

    private var startStopTitle: String {
        appState.status == .recording ? "停止听写" : "开始听写"
    }
    private var startStopSymbol: String {
        appState.status == .recording ? "stop.circle" : "mic.circle"
    }

    /// 打开设置窗口。macOS 14+ 有 `@Environment(\.openSettings)`，但我们要兼容
    /// macOS 13，故用 AppKit 选择器：13 上是 `showSettingsWindow:`，更老是
    /// `showPreferencesWindow:`。两者都试一遍，保证各版本都能打开。
    static func openSettingsWindow() {
        NSApp.activate(ignoringOtherApps: true)
        let settingsSel = Selector(("showSettingsWindow:"))   // macOS 13+
        let prefsSel = Selector(("showPreferencesWindow:"))   // 旧系统
        if NSApp.sendAction(settingsSel, to: nil, from: nil) { return }
        NSApp.sendAction(prefsSel, to: nil, from: nil)
    }
}
