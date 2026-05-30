import Foundation
import Carbon.HIToolbox

/// 一个热键组合：keyCode + 修饰键。Codable，方便持久化到 Settings。
///
/// keyCode 是 Carbon 虚拟键码（与字符无关，物理键位）。modifiers 用 Carbon 的
/// `controlKey/optionKey/cmdKey/shiftKey` 位掩码。
struct KeyCombo: Codable, Equatable {
    var keyCode: UInt32
    var carbonModifiers: UInt32
    /// 给 UI 显示的人类可读串，如 "⌥Space"。持久化一份，免得每次反查。
    var displayString: String

    /// 默认热键：⌥Space（Option+空格）。
    ///
    /// 说明：很多本地听写工具默认"按住 fn"，但纯 `fn` 键无法用 Carbon
    /// `RegisterEventHotKey` 注册（它不是常规修饰键），需走 `CGEventTap` 监听
    /// `flagsChanged` 才行（见文件底部说明）。MVP 骨架默认用可注册的 ⌥Space，
    /// 把 fn 方案作为 P1 的 CGEventTap 实现。
    static let defaultFnLike = KeyCombo(
        keyCode: UInt32(kVK_Space),
        carbonModifiers: UInt32(optionKey),
        displayString: "⌥Space"
    )
}

/// 全局热键管理器 —— 用 Carbon `RegisterEventHotKey` 实现"**按住说话、松开停止**"。
///
/// **真实实现框架**（需真机验证）：Carbon 的热键事件能区分 `kEventHotKeyPressed` 和
/// `kEventHotKeyReleased`，正好对应"按下开始录音 / 松开停止转写"。我们安装一个
/// 应用级事件处理器同时监听这两类事件。
///
/// 权限注意：纯热键注册不需要辅助功能权限；但**文本注入**（TextInjector）需要，
/// 见那边说明。
final class HotkeyManager {

    private var hotKeyRef: EventHotKeyRef?
    private var eventHandler: EventHandlerRef?
    private var onPress: (() -> Void)?
    private var onRelease: (() -> Void)?

    /// 用一个固定 signature/id 标识我们的热键。
    private let hotKeyID = EventHotKeyID(signature: OSType(0x45434B59 /* "ECKY" */), id: 1)

    /// 注册（或重注册）热键。
    func register(keyCombo: KeyCombo, onPress: @escaping () -> Void, onRelease: @escaping () -> Void) {
        unregister() // 先清掉旧的，支持运行时改键

        self.onPress = onPress
        self.onRelease = onRelease

        installHandlerIfNeeded()

        var ref: EventHotKeyRef?
        let status = RegisterEventHotKey(
            keyCombo.keyCode,
            keyCombo.carbonModifiers,
            hotKeyID,
            GetEventDispatcherTarget(),
            0,
            &ref
        )
        if status == noErr {
            hotKeyRef = ref
        } else {
            // 注册失败（如键位被占用）。真机上应回报到 UI；骨架仅打印。
            NSLog("[EchoKey] RegisterEventHotKey 失败，status=\(status)")
        }
    }

    func unregister() {
        if let hotKeyRef {
            UnregisterEventHotKey(hotKeyRef)
            self.hotKeyRef = nil
        }
    }

    // MARK: - 事件处理器（同时收 pressed / released）

    private func installHandlerIfNeeded() {
        guard eventHandler == nil else { return }

        var eventTypes = [
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed)),
            EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyReleased))
        ]

        // 把 self 作为 userData 传给 C 回调，回调里取回来分发。
        let userData = Unmanaged.passUnretained(self).toOpaque()

        InstallEventHandler(
            GetEventDispatcherTarget(),
            hotKeyEventCallback,
            eventTypes.count,
            &eventTypes,
            userData,
            &eventHandler
        )
    }

    /// 由 C 回调调用：根据事件 kind 分发到 onPress / onRelease。
    fileprivate func handle(eventKind: UInt32) {
        switch Int(eventKind) {
        case kEventHotKeyPressed:  onPress?()
        case kEventHotKeyReleased: onRelease?()
        default: break
        }
    }

    deinit {
        unregister()
        if let eventHandler { RemoveEventHandler(eventHandler) }
    }
}

/// 顶层 C 回调（不能捕获上下文，故通过 userData 拿回 HotkeyManager 实例）。
private func hotKeyEventCallback(
    _ nextHandler: EventHandlerCallRef?,
    _ event: EventRef?,
    _ userData: UnsafeMutableRawPointer?
) -> OSStatus {
    guard let event, let userData else { return OSStatus(eventNotHandledErr) }

    let manager = Unmanaged<HotkeyManager>.fromOpaque(userData).takeUnretainedValue()
    let kind = GetEventKind(event)
    manager.handle(eventKind: kind)
    return noErr
}

// MARK: - 关于"按住 fn 说话"的工程说明（P1）
//
// 纯 `fn`（Globe）键不是 Carbon 意义上的标准修饰键，RegisterEventHotKey 注册不了。
// 要支持"按住 fn"，需改用 CGEventTap 监听 .flagsChanged 事件，检测 .maskSecondaryFn
// 的按下/抬起。CGEventTap 需要"辅助功能"授权（与 TextInjector 同一项权限）。
// MVP 骨架先用可注册的 ⌥Space，把 fn 方案留作 P1 升级，避免一上来就卡在权限+事件流细节。
