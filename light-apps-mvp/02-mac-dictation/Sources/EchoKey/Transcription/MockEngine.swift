import Foundation

/// 假转写引擎 —— **完整可运行**（非占位）。
///
/// 作用：让整个骨架在**没有任何模型、不联网、CI 里**也能跑通
/// "热键 → 录音 → 转写 → 词典纠错 → 注入"全链路，方便 UI / 流程联调。
///
/// 它会根据音频时长和语言模式返回一句"像样的"假文本，并故意塞进 "graph cool"
/// 这个错词，好让你直观看到 Vocabulary 词典把它纠成 "GraphQL" 的效果。
final class MockEngine: TranscriptionEngine {

    func prepare() async throws {
        // 模拟一点点"加载"耗时，但不真的做任何事——Mock 永远就绪。
        try? await Task.sleep(nanoseconds: 50_000_000) // 50ms
    }

    func transcribe(audio: AudioBuffer, language: DictationLanguage) async throws -> String {
        // 模拟端侧推理耗时（真实 small 模型几百 ms 量级）。
        try? await Task.sleep(nanoseconds: 200_000_000) // 200ms

        // 即便是空音频，Mock 也给一句话，方便没接麦克风时也能看 UI 流程。
        // 真实引擎这里会对 emptyAudio 抛错。
        let secs = String(format: "%.1f", max(audio.durationSeconds, 0))

        switch language {
        case .chinese:
            return "这是一段中文听写示例，时长约 \(secs) 秒。"
        case .english:
            return "This is an English dictation sample, about \(secs) seconds."
        case .codeSwitch:
            // 故意混说 + 故意写错 "graph cool"，演示词典纠错。
            return "帮我用 graph cool 把这个 PR merge 一下，时长约 \(secs) 秒。"
        }
    }
}
