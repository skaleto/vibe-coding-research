import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mic, Sparkles, AlertTriangle } from 'lucide-react';
import type { School } from '@/lib/types';
import { newDreamId, saveDream } from '@/lib/storage';
import { bumpStat } from '@/lib/stats';
import { detectCrisis } from '@/lib/detectCrisis';
import { emitDreamRecorded, recordDreamUsage } from '@/lib/usage';

const SCHOOLS: Array<{ value: School; label: string }> = [
  { value: 'jungian', label: '荣格' },
  { value: 'freudian', label: '弗洛伊德' },
  { value: 'gestalt', label: '格式塔' },
];

const MOODS = [
  '平静',
  '焦虑',
  '恐惧',
  '困惑',
  '悲伤',
  '怀念',
  '兴奋',
  '羞愧',
];

interface SpeechWindow {
  SpeechRecognition?: { new (): SpeechRecognitionLike };
  webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
}

export function DreamInput() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | undefined>(undefined);
  const [school, setSchool] = useState<School>('jungian');
  const [submitting, setSubmitting] = useState(false);
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  function startVoice() {
    if (typeof window === 'undefined') return;
    const w = window as unknown as SpeechWindow;
    const Recog = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Recog) {
      setVoiceErr('当前浏览器不支持语音输入，请改用文字记录。');
      return;
    }
    const rec = new Recog();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'zh-CN';
    rec.onresult = (e) => {
      let chunk = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r) chunk += r[0].transcript;
      }
      if (chunk) setText((prev) => (prev ? prev + '\n' + chunk : chunk));
    };
    rec.onend = () => setRecording(false);
    try {
      rec.start();
      setRecording(true);
      setVoiceErr(null);
    } catch {
      setVoiceErr('启动语音失败，请改用文字记录。');
    }
  }

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 客户端先跑一次危机检测（双保险），一级直接跳转，根本不发请求
    const crisis = detectCrisis(trimmed);
    if (crisis.level === 1) {
      navigate('/crisis');
      return;
    }

    setSubmitting(true);
    try {
      const id = newDreamId();
      // 保存初始记录
      saveDream({
        id,
        createdAt: new Date().toISOString(),
        text: trimmed,
        mood,
        school,
        crisisLevel: 0,
      });
      bumpStat('recorded', 1);
      // 反沉迷计数（按天 + 连续天数），并通知全局 gate 重新判定。
      // 注意：一级危机已在上方 return，不会计入，符合"危机不算沉迷"的预期。
      recordDreamUsage();
      emitDreamRecorded();
      // 转跳到 analyzing 页，那里发起 API 调用
      const qs = new URLSearchParams({ id });
      navigate(`/analyzing?${qs.toString()}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface-card p-5">
        <label htmlFor="dream-text" className="block text-sm text-ink-muted mb-2">
          今天做了什么梦？
        </label>
        <textarea
          id="dream-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="试着用第一人称、按时间顺序描述。比如：我梦到自己站在……"
          rows={8}
          className="w-full bg-transparent text-ink leading-relaxed resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={startVoice}
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary"
            disabled={recording}
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            {recording ? '正在录音…' : '语音输入'}
          </button>
          <span className="text-xs text-ink-light">{text.length} 字</span>
        </div>
        {voiceErr ? (
          <p className="mt-2 text-xs text-status-warn flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {voiceErr}
          </p>
        ) : null}
      </div>

      <div className="surface-card p-5 space-y-4">
        <div>
          <div className="text-sm text-ink-muted mb-2">情绪标签（可选）</div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? undefined : m)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  mood === m
                    ? 'bg-primary text-bg border-primary'
                    : 'border-ink-light/40 text-ink-muted hover:border-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm text-ink-muted mb-2">心理学流派</div>
          <div className="flex flex-wrap gap-2">
            {SCHOOLS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSchool(s.value)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  school === s.value
                    ? 'bg-accent text-primary-dark border-accent'
                    : 'border-ink-light/40 text-ink-muted hover:border-accent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!text.trim() || submitting}
        className="btn-primary w-full disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        {submitting ? '保存中…' : '保存并分析'}
      </button>
    </div>
  );
}
