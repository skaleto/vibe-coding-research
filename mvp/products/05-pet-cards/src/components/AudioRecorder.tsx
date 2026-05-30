import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, RotateCcw, Square, AlertTriangle } from 'lucide-react';
import { extractAudioFeatures } from '@/lib/audioFeatures';
import type { AudioFeatures } from '@/lib/types';

// Capacitor 8 + SPM migration: capacitor-voice-recorder has no SPM Package.swift,
// so we record exclusively via the Web MediaRecorder API. iOS WKWebView supports it
// since iOS 14.3, Android WebView via getUserMedia (needs RECORD_AUDIO in manifest +
// NSMicrophoneUsageDescription in Info.plist). There is no native recording path.

const MAX_DURATION_SEC = 10;
const MIN_DURATION_SEC = 1;

export type RecorderResult = {
  blob: Blob;
  durationSec: number;
  features: AudioFeatures;
};

type Props = {
  onResult: (result: RecorderResult) => void;
  disabled?: boolean;
};

type Phase = 'idle' | 'requesting' | 'recording' | 'analyzing' | 'preview' | 'denied' | 'unsupported';

export function AudioRecorder({ onResult, disabled }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<RecorderResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  // 检查浏览器是否支持 MediaRecorder + getUserMedia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setPhase('unsupported');
    }
  }, []);

  const cleanup = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const finalizeBlob = useCallback(
    async (blob: Blob, fallbackMime: string, wallClockSec: number) => {
      if (wallClockSec < MIN_DURATION_SEC) {
        setErrorMsg('录音太短啦，再按久一点呀~');
        setPhase('idle');
        cleanup();
        return;
      }
      setPhase('analyzing');
      try {
        const { durationSec, features } = await extractAudioFeatures(blob);
        const finalDuration =
          Number.isFinite(durationSec) && durationSec > 0 ? durationSec : wallClockSec;
        setPreview({ blob, durationSec: finalDuration, features });
        setPhase('preview');
      } catch {
        // 提取失败兜底
        setPreview({
          blob,
          durationSec: wallClockSec,
          features: { pitch: 'high', burst: 'short_burst' },
        });
        setPhase('preview');
      } finally {
        cleanup();
      }
      // mime 仅用于诊断；本地 fallbackMime 已挂在 blob.type 上
      void fallbackMime;
    },
    [cleanup]
  );

  // ---------- Web MediaRecorder handlers ----------
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled) return;
    if (phase === 'recording' || phase === 'requesting' || phase === 'unsupported') return;
    setErrorMsg(null);
    setPhase('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      let mimeType = '';
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      for (const c of candidates) {
        if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c)) {
          mimeType = c;
          break;
        }
      }
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const realDuration = (Date.now() - startTimeRef.current) / 1000;
        await finalizeBlob(blob, mimeType || 'audio/webm', realDuration);
      };
      mediaRecorderRef.current = rec;
      rec.start();
      startTimeRef.current = Date.now();
      setElapsed(0);
      setPhase('recording');
      tickRef.current = window.setInterval(() => {
        const e = (Date.now() - startTimeRef.current) / 1000;
        setElapsed(e);
        if (e >= MAX_DURATION_SEC) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      cleanup();
      // 权限类错误优先用 error.name 判定（NotAllowedError/SecurityError），
      // 跨浏览器/本地化下比 message 文本可靠；message 仅作兜底关键词匹配。
      const name = err instanceof DOMException ? err.name : '';
      const msg = err instanceof Error ? err.message : String(err);
      if (
        name === 'NotAllowedError' ||
        name === 'SecurityError' ||
        msg.toLowerCase().includes('permission') ||
        msg.toLowerCase().includes('denied')
      ) {
        setPhase('denied');
      } else {
        setPhase('idle');
        setErrorMsg(`无法开启录音: ${msg.slice(0, 80)}`);
      }
    }
  }, [cleanup, finalizeBlob, stopRecording, disabled, phase]);

  const handleConfirm = useCallback(() => {
    if (preview) onResult(preview);
  }, [preview, onResult]);

  const handleRetry = useCallback(() => {
    setPreview(null);
    setPhase('idle');
    setErrorMsg(null);
    setElapsed(0);
  }, []);

  // ---------- Render ----------

  if (phase === 'unsupported') {
    return (
      <div className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle className="mr-1 inline h-4 w-4" />
        当前设备不支持录音，建议用 Chrome / Safari 最新版打开。
        <div className="mt-2 text-xs">不用担心，你仍可使用下方"用示例数据看效果"按钮体验产品。</div>
      </div>
    );
  }

  if (phase === 'denied') {
    return (
      <div className="rounded-card border border-tomato bg-tomato-light/30 p-4 text-sm text-tomato-dark">
        <AlertTriangle className="mr-1 inline h-4 w-4" />
        麦克风权限被拒绝啦~
        <ul className="ml-5 mt-2 list-disc text-xs">
          <li>iOS：设置 → 宠物心情卡片 → 麦克风 → 允许</li>
          <li>Android：设置 → 应用 → 宠物心情卡片 → 权限 → 麦克风</li>
        </ul>
        <button
          onClick={() => {
            setPhase('idle');
            setErrorMsg(null);
          }}
          className="mt-3 rounded-btn bg-tomato px-4 py-1 text-xs text-white"
        >
          重新尝试
        </button>
      </div>
    );
  }

  if (phase === 'preview' && preview) {
    return (
      <div className="rounded-card bg-white p-4 shadow-card">
        <div className="text-center text-sm text-ink-muted">录音预览</div>
        <div className="mt-1 text-center text-3xl font-bold text-primary-dark">
          {preview.durationSec.toFixed(1)}s
        </div>
        <div className="mt-3 flex h-16 items-center justify-center gap-1">
          <FakeWaveform />
        </div>
        <audio controls src={URL.createObjectURL(preview.blob)} className="mt-3 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-1 rounded-btn border border-ink-light bg-white py-2.5 text-sm text-ink"
          >
            <RotateCcw className="h-4 w-4" />
            重录
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-btn bg-primary py-2.5 text-sm font-medium text-white shadow-bubble"
          >
            生成心情卡片
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'recording') {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={stopRecording}
          className="relative flex h-44 w-44 items-center justify-center rounded-full bg-tomato text-white shadow-bubble no-select"
          aria-label="停止录音"
        >
          <Square className="h-12 w-12 fill-white" />
          <span className="absolute -bottom-1 text-xs">点击停止</span>
        </button>
        <div className="mt-6 text-3xl font-bold text-tomato">
          {elapsed.toFixed(1)} / {MAX_DURATION_SEC}s
        </div>
        <div className="mt-3 flex h-16 items-center gap-1.5">
          <FakeWaveform />
        </div>
        <div className="mt-2 text-xs text-ink-muted">
          {elapsed < 1 ? '再说久一点呀~' : '说够了就点中间停止'}
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center py-6">
        <div className="text-base text-ink-muted">正在处理录音...</div>
        <div className="mt-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // idle / requesting
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={startRecording}
        disabled={disabled || phase === 'requesting'}
        className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-bubble disabled:opacity-60 no-select"
        aria-label="开始录音"
      >
        <span className="breathing-ring" />
        <span className="breathing-ring delay-1" />
        <span className="breathing-ring delay-2" />
        <Mic className="h-16 w-16" />
      </button>
      <div className="mt-5 text-base font-medium text-ink">
        {phase === 'requesting' ? '正在申请麦克风权限...' : '点击开始录音'}
      </div>
      <div className="mt-1 text-xs text-ink-muted">最长 {MAX_DURATION_SEC} 秒，松开自动停止</div>
      {errorMsg ? <div className="mt-3 text-xs text-tomato-dark">{errorMsg}</div> : null}
    </div>
  );
}

function FakeWaveform() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </>
  );
}
