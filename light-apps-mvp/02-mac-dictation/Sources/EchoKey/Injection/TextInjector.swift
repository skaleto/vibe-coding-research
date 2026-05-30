import Foundation
import AppKit
import CoreGraphics

/// 文本注入策略。不同 App 兼容性不同，故提供两条路 + 兜底。
enum InjectionStrategy: String, CaseIterable, Codable, Identifiable {
    /// 用 CGEvent 模拟键盘逐字"打"进去。最通用，但对超长文本/某些输入法可能慢。
    case typeKeystrokes
    /// 写进剪贴板再模拟 ⌘V 粘贴。更快更稳，但会覆盖用户剪贴板（用完可恢复）。
    case pasteViaClipboard
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .typeKeystrokes:    return "模拟键盘输入（最通用）"
        case .pasteViaClipboard: return "剪贴板粘贴（更快更稳）"
        }
    }
}

/// 文本注入器 —— 把转写结果打进**当前焦点 App 的光标处**。
///
/// **真实实现框架**（需真机 + 辅助功能授权后验证）。两条策略都用 `CGEvent`：
///   - typeKeystrokes：用 `CGEvent(keyboardEventSource:)` + `keyboardSetUnicodeString`
///     直接发 Unicode 文本，绕过键码映射，天然支持中英文/emoji。
///   - pasteViaClipboard：写 `NSPasteboard` 后合成 ⌘V。
///
/// 权限：合成键盘事件需要在「系统设置 ▸ 隐私与安全性 ▸ 辅助功能」里授权本 App，
/// 否则事件会被系统静默丢弃（这是所有听写/自动化工具共同的坑，见 README）。
final class TextInjector {

    /// 把文本注入当前焦点 App。
    func inject(text: String, strategy: InjectionStrategy) {
        guard !text.isEmpty else { return }

        // 提示：真机上应先用 AXIsProcessTrusted() 检查是否已授权辅助功能，
        // 未授权则引导用户去开启（见 README「授权」）。骨架直接尝试。
        switch strategy {
        case .typeKeystrokes:
            typeUnicode(text)
        case .pasteViaClipboard:
            pasteViaClipboard(text)
        }
    }

    // MARK: - 策略 1：逐段发 Unicode 键盘事件

    private func typeUnicode(_ text: String) {
        guard let source = CGEventSource(stateID: .combinedSessionState) else { return }

        // CGEvent 的 unicode 字符串单次有长度上限，按块切分逐段发送更稳。
        let chunkSize = 20
        let scalars = Array(text.utf16)
        var index = 0
        while index < scalars.count {
            let end = min(index + chunkSize, scalars.count)
            var chunk = Array(scalars[index..<end])

            // 一对 keyDown/keyUp 携带这段 Unicode。keyCode 用 0（占位），靠
            // keyboardSetUnicodeString 决定实际字符。
            if let down = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: true) {
                down.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: &chunk)
                down.post(tap: .cgAnnotatedSessionEventTap)
            }
            if let up = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: false) {
                up.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: &chunk)
                up.post(tap: .cgAnnotatedSessionEventTap)
            }
            index = end
        }
    }

    // MARK: - 策略 2：剪贴板 + ⌘V

    private func pasteViaClipboard(_ text: String) {
        let pasteboard = NSPasteboard.general

        // 备份用户原剪贴板，粘贴后恢复，避免"偷走"用户剪贴板内容。
        let backup = pasteboard.string(forType: .string)

        pasteboard.clearContents()
        pasteboard.setString(text, forType: .string)

        synthesizeCommandV()

        // 略等粘贴完成再恢复剪贴板。真机可用更稳的完成回调；骨架用短延时。
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            pasteboard.clearContents()
            if let backup { pasteboard.setString(backup, forType: .string) }
        }
    }

    /// 合成 ⌘V。
    private func synthesizeCommandV() {
        guard let source = CGEventSource(stateID: .combinedSessionState) else { return }
        let vKeyCode: CGKeyCode = 0x09 // 'v'

        let down = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: true)
        down?.flags = .maskCommand
        down?.post(tap: .cgAnnotatedSessionEventTap)

        let up = CGEvent(keyboardEventSource: source, virtualKey: vKeyCode, keyDown: false)
        up?.flags = .maskCommand
        up?.post(tap: .cgAnnotatedSessionEventTap)
    }
}
