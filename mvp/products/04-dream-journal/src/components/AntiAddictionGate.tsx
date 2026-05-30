import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import {
  DREAM_RECORDED_EVENT,
  evaluateRestReminder,
  markReminded,
  type RestReminderReason,
} from '@/lib/usage';

/**
 * 反沉迷休息提示（合规 § 4.D 硬性项 / 审计 F04-01）。
 *
 * 触发条件（lib/usage.ts 判定）：
 *   - 连续 7 天记录梦境，或
 *   - 单日记录 ≥ 30 次
 *
 * 设计取向（心理健康产品语气）：
 * - **非阻断**：只是温柔提醒，用户可随时关闭继续使用，不锁功能、不退出。
 *   （区别于 FirstLaunchGate 的强阻断免责弹窗——那是法律必经，这里是关怀。）
 * - 当天只弹一次（markReminded），不反复打扰。
 * - 文案不评判、不制造焦虑，鼓励休息与线下连接。
 *
 * 挂载：App.tsx 全局，监听 DREAM_RECORDED_EVENT + 路由变化 + 首次挂载，
 * 重新判定是否需要展示。
 */

const COPY: Record<
  RestReminderReason,
  { title: string; body: string }
> = {
  streak: {
    title: '你已经连续记录了好多天',
    body: '坚持记录梦境是一件很棒的事。也别忘了，休息和真实生活里的连接同样重要。今天要不要先合上手机，做点让自己放松的事？',
  },
  daily: {
    title: '今天记录得有点多了',
    body: '你今天已经记录了很多次。如果此刻心里有些纷乱，停下来深呼吸一会儿也很好。需要的话，和信任的人聊聊，会比反复记录更有帮助。',
  },
};

export function AntiAddictionGate() {
  const location = useLocation();
  const [reason, setReason] = useState<RestReminderReason | null>(null);

  const check = useCallback(() => {
    // 已经显示中就不重复判定，避免抖动
    setReason((current) => {
      if (current) return current;
      const decision = evaluateRestReminder();
      return decision.show ? decision.reason : null;
    });
  }, []);

  // 首次挂载 + 路由变化时判定（覆盖「隔天打开应用恰好满足连续天数」等场景）
  useEffect(() => {
    check();
  }, [check, location.pathname]);

  // 记录梦境后实时判定
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener(DREAM_RECORDED_EVENT, check);
    return () => window.removeEventListener(DREAM_RECORDED_EVENT, check);
  }, [check]);

  const dismiss = useCallback(() => {
    markReminded(); // 当天不再打扰
    setReason(null);
  }, []);

  if (!reason) return null;
  const { title, body } = COPY[reason];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-primary-dark/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anti-addiction-title"
    >
      <div className="surface-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-care-accent">
          <Coffee className="w-6 h-6" aria-hidden="true" />
          <h2 id="anti-addiction-title" className="text-lg font-semibold">
            {title}
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-ink">{body}</p>
        <div className="flex justify-end pt-2">
          <button type="button" className="btn-primary" onClick={dismiss}>
            好的，我休息一下
          </button>
        </div>
      </div>
    </div>
  );
}
