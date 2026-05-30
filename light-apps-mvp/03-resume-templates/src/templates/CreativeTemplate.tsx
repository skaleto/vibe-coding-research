import type { ResumeData } from '@/lib/types';
import { Multiline } from '@/components/Multiline';

// 创意彩：紫色标题色块 + 左侧时间线圆点。适合设计 / 运营 / 新媒体。
export function CreativeTemplate({ data }: { data: ResumeData }) {
  const { basics } = data;
  const contacts = [basics.phone, basics.email, basics.city].filter(Boolean).join('  ｜  ');

  return (
    <div className="a4-sheet px-11 py-9 font-sans text-[13px] leading-relaxed text-neutral-800">
      {/* 头部：左名字、右联系方式，紫色背景条 */}
      <header className="mb-5 overflow-hidden rounded-xl bg-gradient-to-r from-tpl-creative to-fuchsia-500 px-7 py-5 text-white">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold leading-none">{basics.name || '你的名字'}</h1>
            <p className="mt-1.5 text-[14px] text-violet-100">{basics.title}</p>
          </div>
          <div className="text-right text-[11.5px] leading-snug text-violet-50">
            {contacts && <p>{contacts}</p>}
            {basics.extras && <p>{basics.extras}</p>}
          </div>
        </div>
        {basics.summary && (
          <p className="mt-2.5 border-t border-white/25 pt-2 text-[12.5px] text-violet-50">
            {basics.summary}
          </p>
        )}
      </header>

      <TimelineSection title="教育经历" show={data.education.length > 0}>
        {data.education.map((e) => (
          <Node
            key={e.id}
            title={e.school}
            meta={`${e.start} - ${e.end}`}
            sub={[e.degree, e.major].filter(Boolean).join(' · ')}
            detail={e.detail}
          />
        ))}
      </TimelineSection>

      <TimelineSection title="实习 / 工作经历" show={data.work.length > 0}>
        {data.work.map((w) => (
          <Node
            key={w.id}
            title={w.company}
            meta={`${w.start} - ${w.end}`}
            sub={w.role}
            detail={w.detail}
            bullet
          />
        ))}
      </TimelineSection>

      <TimelineSection title="项目经历" show={data.projects.length > 0}>
        {data.projects.map((p) => (
          <Node
            key={p.id}
            title={p.name}
            meta={`${p.start} - ${p.end}`}
            sub={p.role}
            detail={p.detail}
            bullet
          />
        ))}
      </TimelineSection>

      {data.skills.length > 0 && (
        <section className="mt-5">
          <Heading>专业技能</Heading>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-tpl-creative/10 px-3 py-1 text-[12px] font-medium text-tpl-creative"
              >
                {s.name}
                {s.level && <span className="opacity-70">·{s.level}</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {Boolean(data.selfReview.trim()) && (
        <section className="mt-5">
          <Heading>自我评价</Heading>
          <Multiline
            text={data.selfReview}
            className="mt-2 space-y-0.5 text-[12.5px] text-neutral-700"
          />
        </section>
      )}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block rounded-md bg-tpl-creative/10 px-2.5 py-1 text-[14px] font-bold text-tpl-creative">
      {children}
    </h2>
  );
}

function TimelineSection({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <section className="mt-5">
      <Heading>{title}</Heading>
      <div className="mt-2.5 space-y-3 border-l-2 border-tpl-creative/25 pl-4">{children}</div>
    </section>
  );
}

function Node({
  title,
  meta,
  sub,
  detail,
  bullet = false,
}: {
  title: string;
  meta: string;
  sub?: string;
  detail: string;
  bullet?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute -left-[1.32rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-tpl-creative shadow" />
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold">{title}</span>
        <span className="text-[12px] text-neutral-500">{meta.replace(/^\s*-\s*$/, '')}</span>
      </div>
      {sub && <div className="text-[12.5px] text-tpl-creative">{sub}</div>}
      <Multiline
        text={detail}
        bullet={bullet}
        className="mt-1 space-y-0.5 text-[12.5px] text-neutral-700"
      />
    </div>
  );
}
