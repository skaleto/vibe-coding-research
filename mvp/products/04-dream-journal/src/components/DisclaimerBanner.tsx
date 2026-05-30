import { Info } from 'lucide-react';
import { DISCLAIMER_GLOBAL_BANNER } from '@/lib/disclaimer';

/**
 * 顶部全局 banner（每个页面都强制显示）。
 *
 * 合规要求：客户端强制注入，不依赖 LLM 自觉。
 */
export function DisclaimerBanner() {
  return (
    <div className="compliance-banner sticky top-0 z-30 flex items-center justify-center gap-2">
      <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{DISCLAIMER_GLOBAL_BANNER}</span>
    </div>
  );
}
