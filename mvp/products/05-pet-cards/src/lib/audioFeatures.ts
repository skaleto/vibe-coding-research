import type { AudioFeatures } from './types';

// 仅用浏览器 AudioContext 做最简频谱二分：pitch_high / pitch_low / burst
// 不做真实识别（codex 强制）
export async function extractAudioFeatures(blob: Blob): Promise<{
  durationSec: number;
  features: AudioFeatures;
}> {
  if (typeof window === 'undefined') {
    return { durationSec: 0, features: { pitch: 'high', burst: 'short_burst' } };
  }

  try {
    const arrayBuf = await blob.arrayBuffer();
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
    const durationSec = audioBuf.duration;
    const sampleRate = audioBuf.sampleRate;
    const channel = audioBuf.getChannelData(0);

    // 极简能量谱：把信号分成 hi-band/lo-band 通过零交叉率
    // 高 ZCR = 高频；低 ZCR = 低频
    let zeroCrossings = 0;
    let energy = 0;
    let lastSample = 0;
    for (let i = 0; i < channel.length; i++) {
      const s = channel[i] ?? 0;
      energy += s * s;
      if ((s >= 0 && lastSample < 0) || (s < 0 && lastSample >= 0)) {
        zeroCrossings++;
      }
      lastSample = s;
    }
    const zcr = zeroCrossings / (channel.length / sampleRate);
    const rms = Math.sqrt(energy / channel.length);

    // 经验阈值（粗略）
    const pitch: AudioFeatures['pitch'] = zcr > 1500 ? 'high' : 'low';

    // burst 判断：把信号切成 50ms 窗，看活跃窗占比
    const windowSize = Math.floor(sampleRate * 0.05);
    let activeWindows = 0;
    let totalWindows = 0;
    const threshold = rms * 0.5;
    for (let i = 0; i + windowSize < channel.length; i += windowSize) {
      let wEnergy = 0;
      for (let j = 0; j < windowSize; j++) {
        const s = channel[i + j] ?? 0;
        wEnergy += s * s;
      }
      const wRms = Math.sqrt(wEnergy / windowSize);
      if (wRms > threshold) activeWindows++;
      totalWindows++;
    }
    const activeRatio = totalWindows === 0 ? 0 : activeWindows / totalWindows;
    let burst: AudioFeatures['burst'];
    if (activeRatio < 0.1) burst = 'silent';
    else if (activeRatio > 0.6) burst = 'long_continuous';
    else burst = 'short_burst';

    // 关闭 AudioContext
    try {
      await ctx.close();
    } catch {
      // ignore
    }
    return { durationSec, features: { pitch, burst } };
  } catch {
    // 提取失败则给个安全默认
    return { durationSec: 3, features: { pitch: 'high', burst: 'short_burst' } };
  }
}
