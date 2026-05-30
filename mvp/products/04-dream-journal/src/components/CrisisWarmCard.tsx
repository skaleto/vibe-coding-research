import { Link } from 'react-router-dom';
import { Heart, Phone } from 'lucide-react';
import { getHotlines, renderHotlineLine } from '@/lib/crisisHotlines';

interface Props {
  level: 2 | 3;
}

/**
 * 二级 / 三级触发时附加在分析结果末尾的暖色卡片。
 *
 * 不允许有"关闭 / 跳过 / 我已经好了"按钮。用户可以继续浏览页面，
 * 但卡片始终在场，不可被消除。
 */
export function CrisisWarmCard({ level }: Props) {
  const hotlines = getHotlines('zh-CN');
  const isLevel2 = level === 2;
  return (
    <section
      className={`${
        isLevel2
          ? 'bg-care-card border-care-warm/50'
          : 'bg-bg-alt border-ink-light/30'
      } border rounded-card p-5 space-y-3`}
    >
      <div className="flex items-center gap-2 text-care-accent text-sm font-medium">
        <Heart className="w-4 h-4" aria-hidden="true" />
        <span>
          {isLevel2 ? '你描述中流露的感受，值得被认真对待' : '一个温柔的提醒'}
        </span>
      </div>
      <p className="text-sm text-ink leading-relaxed">
        {isLevel2
          ? '这种沉重的感觉是真实的。如果你愿意，可以联系一个你信任的人，或者下面列出的支持入口。这不是夸张，是真正有效的小步骤。'
          : '如果这种感受最近经常出现，并影响到日常生活，和专业心理咨询师聊一聊会很有帮助。'}
      </p>
      <ul className="text-xs text-ink-muted space-y-1.5 leading-relaxed">
        {hotlines.map((h) => (
          <li key={h.placeholderKey}>{renderHotlineLine(h)}</li>
        ))}
      </ul>
      <div className="pt-1">
        <Link
          to="/crisis"
          className="inline-flex items-center gap-1.5 text-xs text-care-accent font-medium hover:underline"
        >
          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
          查看完整的求助入口
        </Link>
      </div>
    </section>
  );
}
