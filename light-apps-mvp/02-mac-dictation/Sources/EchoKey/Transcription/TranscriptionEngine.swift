import Foundation

/// 端侧采集到的音频，交给转写引擎。
///
/// 用 16kHz 单声道 Float PCM —— 这是 Whisper 系模型的标准输入格式。
/// `AudioRecorder` 负责把设备原生采样率转换到这个格式。
struct AudioBuffer {
    /// 归一化到 [-1, 1] 的单声道采样点。
    let samples: [Float]
    /// 采样率（恒为 16000）。
    let sampleRate: Double

    var durationSeconds: Double {
        guard sampleRate > 0 else { return 0 }
        return Double(samples.count) / sampleRate
    }

    static let empty = AudioBuffer(samples: [], sampleRate: 16000)
}

/// 转写过程中可能抛出的错误。
enum TranscriptionError: LocalizedError {
    case engineNotReady           // 引擎未就绪（如模型未下载）
    case emptyAudio               // 没采到声音
    case dependencyMissing(String) // 缺依赖（如 WhisperKit 未接入）
    case underlying(String)        // 底层引擎报错

    var errorDescription: String? {
        switch self {
        case .engineNotReady:          return "转写引擎未就绪（模型可能尚未下载）"
        case .emptyAudio:              return "没有采集到音频"
        case .dependencyMissing(let d): return "缺少依赖：\(d)"
        case .underlying(let m):        return m
        }
    }
}

/// **端侧转写抽象层** —— 整个产品可替换引擎的关键。
///
/// 设计意图：把"中英混说 WhisperKit / 零下载 Apple 端侧 / 演示用 Mock"这些差异
/// 全部隔离在协议之下，上层 `AppState` 只依赖这个协议。这样：
///   - MVP 阶段用 MockEngine 跑通全链路，不被模型下载阻塞；
///   - 真机接 WhisperKitEngine，一行工厂代码切换；
///   - 未来加 AppleSpeechEngine（SFSpeechRecognizer 降级路径）也只是再加一个实现。
///
/// 用 `async` 是因为转写是耗时操作，必须离开主线程，避免卡住菜单栏 UI。
protocol TranscriptionEngine: AnyObject {
    /// 准备引擎（加载/下载模型等）。可重复调用，已就绪时应快速返回。
    func prepare() async throws

    /// 把音频转成文字。`language` 决定中/英/混说解码策略。
    func transcribe(audio: AudioBuffer, language: DictationLanguage) async throws -> String
}
