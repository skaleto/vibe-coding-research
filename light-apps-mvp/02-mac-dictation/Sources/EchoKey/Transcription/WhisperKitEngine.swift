import Foundation

// MARK: - 接入开关
//
// 默认情况下 WhisperKit 不在依赖图里（见 Package.swift 注释），所以本文件用
// `#if ECHOKEY_WHISPERKIT` 把"真实实现"和"占位实现"分开：
//   - 不接依赖时：编译占位版，prepare() 抛 dependencyMissing，提示用户去接 WhisperKit。
//     ——这样整个工程始终能 `swift build`，不被外部依赖阻塞。
//   - 接了依赖后：在 Package.swift 打开 WhisperKit product 依赖，并给 target 加
//     swiftSettings: [.define("ECHOKEY_WHISPERKIT")]，即可编译真实实现。
//
// 真实实现已按 WhisperKit 公开 API 写出**完整调用框架**（含模型加载、language hint、
// 把 [Float] 直接喂给 transcribe），需在真机连同模型下载一起验证。

#if ECHOKEY_WHISPERKIT
import WhisperKit

/// 端侧 Whisper 转写引擎（**中英混说主引擎**）。真实实现。
final class WhisperKitEngine: TranscriptionEngine {
    private let modelName: String
    private let language: DictationLanguage
    private var pipe: WhisperKit?

    init(modelName: String, language: DictationLanguage) {
        self.modelName = modelName
        self.language = language
    }

    func prepare() async throws {
        guard pipe == nil else { return }
        // WhisperKit 首次会从 HuggingFace 下载并编译 CoreML 模型到本地缓存，
        // 之后永久离线。`model:` 传档位名（"small" / "large-v3" …）。
        let config = WhisperKitConfig(model: modelName)
        do {
            self.pipe = try await WhisperKit(config)
        } catch {
            throw TranscriptionError.underlying("WhisperKit 初始化失败：\(error.localizedDescription)")
        }
    }

    func transcribe(audio: AudioBuffer, language: DictationLanguage) async throws -> String {
        guard let pipe else { throw TranscriptionError.engineNotReady }
        guard !audio.samples.isEmpty else { throw TranscriptionError.emptyAudio }

        // 中英混说的关键：codeSwitch 时 language = nil，让 multilingual 模型自动识别，
        // 不锁死单一语言 token。这是相对 Apple SFSpeechRecognizer 的核心优势。
        var options = DecodingOptions()
        options.language = language.whisperLanguageCode   // nil = 自动检测（混说）
        options.task = .transcribe                        // 转写而非翻译
        options.usePrefillPrompt = true

        do {
            // WhisperKit 接受 16kHz 单声道 [Float]，与我们的 AudioBuffer 对齐。
            let results = try await pipe.transcribe(audioArray: audio.samples, decodeOptions: options)
            let text = results.map { $0.text }.joined()
            return text.trimmingCharacters(in: .whitespacesAndNewlines)
        } catch {
            throw TranscriptionError.underlying("转写失败：\(error.localizedDescription)")
        }
    }
}

#else

/// WhisperKit **占位实现**（依赖未接入时编译这一版）。
///
/// 它保证工程可编译、可运行，并在被真正调用时给出清晰的"去接 WhisperKit"提示，
/// 而不是默默失败。生产前请按上方 `#if` 注释打开真实实现。
final class WhisperKitEngine: TranscriptionEngine {
    private let modelName: String
    private let language: DictationLanguage

    init(modelName: String, language: DictationLanguage) {
        self.modelName = modelName
        self.language = language
    }

    func prepare() async throws {
        // 明确告诉调用方：要用真实端侧转写，得先接依赖 + 打开 ECHOKEY_WHISPERKIT。
        throw TranscriptionError.dependencyMissing(
            "WhisperKit 尚未接入。请在 Package.swift 打开 WhisperKit 依赖，并给 target 加 .define(\"ECHOKEY_WHISPERKIT\")（详见 README）。当前可用 Mock 引擎演示流程。"
        )
    }

    func transcribe(audio: AudioBuffer, language: DictationLanguage) async throws -> String {
        throw TranscriptionError.engineNotReady
    }
}

#endif
