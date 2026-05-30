import Foundation
import SwiftUI
import Combine

/// 听写状态机的状态枚举。驱动菜单栏图标 + UI 文案。
enum DictationStatus: Equatable {
    case idle               // 空闲，等待热键
    case recording          // 正在录音（热键按住中）
    case transcribing       // 录音结束，端侧模型转写中
    case error(String)      // 出错（权限缺失 / 模型未就绪 等）

    var symbolName: String {
        switch self {
        case .idle:         return "mic"
        case .recording:    return "mic.fill"
        case .transcribing: return "waveform"
        case .error:        return "exclamationmark.triangle"
        }
    }

    var label: String {
        switch self {
        case .idle:         return "EchoKey：空闲"
        case .recording:    return "EchoKey：录音中…"
        case .transcribing: return "EchoKey：转写中…"
        case .error(let m): return "EchoKey：错误 \(m)"
        }
    }
}

/// 应用核心状态机 —— **这是完整的编排逻辑**（非占位）。
///
/// 它把六个子系统粘起来：设置持久化、热键、录音、转写引擎、词典纠错、文本注入。
/// 各子系统内部"碰系统底层"的部分（CGEvent / Carbon / AVAudioEngine）是真实接口 +
/// 实现框架，需在真机授权后验证；而"流程编排"这一层（本文件）是可直接读、逻辑闭环的。
@MainActor
final class AppState: ObservableObject {

    // MARK: - 对外发布的状态（驱动 UI）

    @Published private(set) var status: DictationStatus = .idle
    /// 最近一次转写结果（设置面板/调试用，也方便用户复制）。
    @Published private(set) var lastTranscript: String = ""
    /// 用户设置（语言、模型、热键、注入策略…），变更会自动持久化。
    @Published var settings: AppSettings {
        didSet { settings.save() }
    }

    // MARK: - 子系统

    private let hotkeyManager = HotkeyManager()
    private let recorder = AudioRecorder()
    private let injector = TextInjector()
    private var vocabulary: Vocabulary
    /// 当前转写引擎。可在设置里切换（Mock / WhisperKit / Apple 端侧），故用 protocol 抽象。
    private var engine: TranscriptionEngine

    init() {
        let loaded = AppSettings.load()
        self.settings = loaded
        self.vocabulary = Vocabulary(entries: loaded.vocabularyEntries)
        self.engine = AppState.makeEngine(for: loaded)

        configureHotkey()
    }

    // MARK: - 引擎工厂

    /// 根据设置选用引擎。这是"抽象层"价值所在：上层完全不关心是哪种引擎。
    private static func makeEngine(for settings: AppSettings) -> TranscriptionEngine {
        switch settings.engineKind {
        case .mock:
            return MockEngine()
        case .whisperKit:
            // 真机接入 WhisperKit 后返回 WhisperKitEngine（见该文件）。
            // 模型未下载/依赖未接时，WhisperKitEngine 会在 prepare() 抛错并降级提示。
            return WhisperKitEngine(modelName: settings.whisperModel.rawValue,
                                    language: settings.language)
        }
    }

    /// 设置变更后，重建依赖设置的子系统（引擎 / 词典 / 热键）。供 SettingsView 调用。
    func applySettings() {
        engine = AppState.makeEngine(for: settings)
        vocabulary = Vocabulary(entries: settings.vocabularyEntries)
        configureHotkey()
    }

    // MARK: - 热键编排

    private func configureHotkey() {
        hotkeyManager.register(
            keyCombo: settings.hotkey,
            onPress: { [weak self] in
                // 按住 → 开始录音。回到主线程更新状态。
                Task { @MainActor in self?.startDictation() }
            },
            onRelease: { [weak self] in
                // 松开 → 停止录音并转写。
                Task { @MainActor in await self?.stopAndTranscribe() }
            }
        )
    }

    // MARK: - 主流程（完整逻辑）

    /// 开始一次听写：检查状态 → 启动录音。
    func startDictation() {
        guard status == .idle else { return }
        do {
            try recorder.start()
            status = .recording
        } catch {
            status = .error("录音启动失败：\(error.localizedDescription)")
        }
    }

    /// 停止录音并把音频交给端侧引擎转写，再做词典纠错，最后注入当前 App。
    func stopAndTranscribe() async {
        guard status == .recording else { return }
        status = .transcribing

        // 1) 停止录音，拿到 PCM 缓冲。
        let audio = recorder.stop()

        do {
            // 2) 确保引擎就绪（首次会触发模型加载；Mock 立即返回）。
            try await engine.prepare()

            // 3) 端侧转写（中英混说由 multilingual 模型 + language 配置支撑）。
            let raw = try await engine.transcribe(audio: audio, language: settings.language)

            // 4) 词典纠错：把 "graph cool" → "GraphQL" 这类技术词修回来。
            let corrected = vocabulary.correct(raw)

            // 5) 注入当前焦点 App。
            lastTranscript = corrected
            injector.inject(text: corrected, strategy: settings.injectionStrategy)

            status = .idle
        } catch {
            status = .error("转写失败：\(error.localizedDescription)")
        }
    }

    /// 手动触发（菜单里的"开始/停止听写"按钮，给没配热键或想用鼠标的用户）。
    func toggleDictationManually() {
        switch status {
        case .idle:
            startDictation()
        case .recording:
            Task { await stopAndTranscribe() }
        default:
            break // 转写中/错误态不响应手动 toggle
        }
    }

    /// 把错误态清回空闲（用户在 UI 点"知道了"）。
    func clearError() {
        if case .error = status { status = .idle }
    }
}
