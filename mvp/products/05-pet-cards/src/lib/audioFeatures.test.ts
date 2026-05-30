import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractAudioFeatures } from './audioFeatures';

// extractAudioFeatures 用浏览器 AudioContext.decodeAudioData 拿到 PCM，然后:
//  - pitch:  零交叉率 (ZCR) > 1500 → 'high'，否则 'low'
//  - burst:  把信号切成 50ms 窗，活跃窗占比 <0.1 → 'silent'，>0.6 → 'long_continuous'，否则 'short_burst'
// 这里用一个可控的 AudioContext mock 喂合成 PCM，验证核心分类算法（不依赖真实音频解码）。

const SAMPLE_RATE = 16000;

type SynthOpts = {
  durationSec: number;
  // 每个样本由回调生成，便于构造正弦/静音/突发信号
  sample: (index: number, sampleRate: number) => number;
};

function makeAudioBuffer({ durationSec, sample }: SynthOpts) {
  const length = Math.floor(SAMPLE_RATE * durationSec);
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) data[i] = sample(i, SAMPLE_RATE);
  return {
    duration: durationSec,
    sampleRate: SAMPLE_RATE,
    length,
    getChannelData: () => data,
  };
}

// 安装一个返回指定 AudioBuffer 的 AudioContext mock 到 window 上。
function installAudioContext(buffer: ReturnType<typeof makeAudioBuffer> | 'throw') {
  const ctor = vi.fn().mockImplementation(() => ({
    decodeAudioData: vi.fn().mockImplementation(async () => {
      if (buffer === 'throw') throw new Error('decode failed');
      return buffer;
    }),
    close: vi.fn().mockResolvedValue(undefined),
  }));
  (window as unknown as { AudioContext: unknown }).AudioContext = ctor;
}

// blob.arrayBuffer() 在 jsdom 下不一定可用 —— 给一个最小可用 Blob 替身。
function fakeBlob(): Blob {
  return { arrayBuffer: async () => new ArrayBuffer(8) } as unknown as Blob;
}

describe('extractAudioFeatures', () => {
  const originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
  });

  it('case 1: 高频正弦波 → pitch=high（ZCR 远超阈值）', async () => {
    // 2000Hz 正弦 → 每秒约 4000 次零交叉，ZCR 远 > 1500
    const buffer = makeAudioBuffer({
      durationSec: 2,
      sample: (i, sr) => Math.sin((2 * Math.PI * 2000 * i) / sr),
    });
    installAudioContext(buffer);

    const { features, durationSec } = await extractAudioFeatures(fakeBlob());
    expect(features.pitch).toBe('high');
    expect(durationSec).toBeCloseTo(2, 5);
  });

  it('case 2: 低频正弦波 → pitch=low（ZCR 低于阈值）', async () => {
    // 200Hz 正弦 → 每秒约 400 次零交叉，ZCR < 1500
    const buffer = makeAudioBuffer({
      durationSec: 2,
      sample: (i, sr) => Math.sin((2 * Math.PI * 200 * i) / sr),
    });
    installAudioContext(buffer);

    const { features } = await extractAudioFeatures(fakeBlob());
    expect(features.pitch).toBe('low');
  });

  it('case 3: 持续大音量信号 → burst=long_continuous（活跃窗占比 >0.6）', async () => {
    // 全程饱满正弦：几乎每个 50ms 窗都活跃
    const buffer = makeAudioBuffer({
      durationSec: 2,
      sample: (i, sr) => Math.sin((2 * Math.PI * 800 * i) / sr),
    });
    installAudioContext(buffer);

    const { features } = await extractAudioFeatures(fakeBlob());
    expect(features.burst).toBe('long_continuous');
  });

  it('case 4: 极弱/接近静音信号 → burst=silent（活跃窗占比 <0.1）', async () => {
    // 单个极短脉冲，其余全静音 → 绝大多数窗不活跃
    const buffer = makeAudioBuffer({
      durationSec: 3,
      sample: (i) => (i < 5 ? 0.9 : 0),
    });
    installAudioContext(buffer);

    const { features } = await extractAudioFeatures(fakeBlob());
    expect(features.burst).toBe('silent');
  });

  it('case 5: decodeAudioData 抛错 → 返回安全默认值（不抛给调用方）', async () => {
    installAudioContext('throw');

    const result = await extractAudioFeatures(fakeBlob());
    expect(result).toEqual({
      durationSec: 3,
      features: { pitch: 'high', burst: 'short_burst' },
    });
  });

  it('case 6: 无 AudioContext（不支持的环境）→ catch 兜底返回安全默认值', async () => {
    // 删除 AudioContext / webkitAudioContext，模拟不支持的浏览器
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;

    const result = await extractAudioFeatures(fakeBlob());
    expect(result.features.pitch).toBe('high');
    expect(result.features.burst).toBe('short_burst');
    expect(result.durationSec).toBeGreaterThan(0);
  });

  it('case 7: 返回的 features 始终符合 pitch/burst 枚举', async () => {
    const buffer = makeAudioBuffer({
      durationSec: 1,
      sample: (i, sr) => Math.sin((2 * Math.PI * 1000 * i) / sr),
    });
    installAudioContext(buffer);

    const { features } = await extractAudioFeatures(fakeBlob());
    expect(['high', 'low']).toContain(features.pitch);
    expect(['short_burst', 'long_continuous', 'silent']).toContain(features.burst);
  });
});
