import Foundation
import AVFoundation

/// 麦克风录音器 —— 用 `AVAudioEngine` 实时采集，并转换到 16kHz 单声道 Float PCM
/// （Whisper 输入格式）。**这是真实框架调用 + 完整实现框架**，需在真机授权麦克风后验证。
///
/// 工作方式：在输入节点上装一个 tap，把每个 buffer 通过 `AVAudioConverter` 重采样到
/// 16kHz，累加到 `collectedSamples`。stop() 时打包成 `AudioBuffer` 返回。
final class AudioRecorder {

    private let engine = AVAudioEngine()
    private var converter: AVAudioConverter?
    /// 目标格式：16kHz / 单声道 / Float32 —— Whisper 标准输入。
    private let targetFormat = AVAudioFormat(
        commonFormat: .pcmFormatFloat32,
        sampleRate: 16_000,
        channels: 1,
        interleaved: false
    )!

    private var collectedSamples: [Float] = []
    private let bufferLock = NSLock()
    private(set) var isRecording = false

    /// 启动录音。会在 input node 上装 tap 并启动 engine。
    /// - Throws: 引擎启动失败（设备无麦克风 / 权限被拒）。
    func start() throws {
        guard !isRecording else { return }

        bufferLock.lock()
        collectedSamples.removeAll(keepingCapacity: true)
        bufferLock.unlock()

        let input = engine.inputNode
        let inputFormat = input.outputFormat(forBus: 0)

        // 设备原生采样率（常见 44.1k/48k）→ 16k 的转换器。
        converter = AVAudioConverter(from: inputFormat, to: targetFormat)

        // tap 缓冲大小取 4096 帧，延迟与开销折中。
        input.installTap(onBus: 0, bufferSize: 4096, format: inputFormat) { [weak self] buffer, _ in
            self?.appendConverted(buffer)
        }

        engine.prepare()
        try engine.start()
        isRecording = true
    }

    /// 停止录音，返回采集到的全部音频。
    func stop() -> AudioBuffer {
        guard isRecording else { return .empty }
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        isRecording = false

        bufferLock.lock()
        let samples = collectedSamples
        collectedSamples.removeAll(keepingCapacity: false)
        bufferLock.unlock()

        return AudioBuffer(samples: samples, sampleRate: targetFormat.sampleRate)
    }

    // MARK: - 私有：把一个输入 buffer 重采样后累加

    private func appendConverted(_ inputBuffer: AVAudioPCMBuffer) {
        guard let converter else { return }

        // 估算输出帧数（按采样率比例），分配输出 buffer。
        let ratio = targetFormat.sampleRate / inputBuffer.format.sampleRate
        let outCapacity = AVAudioFrameCount(Double(inputBuffer.frameLength) * ratio) + 1
        guard let outBuffer = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: outCapacity) else {
            return
        }

        var consumed = false
        var error: NSError?
        converter.convert(to: outBuffer, error: &error) { _, statusPtr in
            if consumed {
                statusPtr.pointee = .noDataNow
                return nil
            }
            consumed = true
            statusPtr.pointee = .haveData
            return inputBuffer
        }
        if error != nil { return }

        guard let channelData = outBuffer.floatChannelData else { return }
        let frames = Int(outBuffer.frameLength)
        let ptr = channelData[0]

        bufferLock.lock()
        collectedSamples.append(contentsOf: UnsafeBufferPointer(start: ptr, count: frames))
        bufferLock.unlock()
    }
}
