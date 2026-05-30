import type { ResumeData } from '@/lib/types';
import { Multiline } from '@/components/Multiline';

// 极简灰：黑白灰、单栏、细分隔线。大厂通用、稳。
export function MinimalTemplate({ data }: { data: ResumeData }) {
  const { basics } = data;
  const contacts = [basics.phone, basics.email, basics.city].filter(Boolean).join('  ·  ');

  return (
    <div className="a4-sheet px-12 py-10 font-sans text-[13px] leading-relaxed text-tpl-minimal">
      {/* 头部 */}
      <header className="border-b-2 border-tpl-minimal pb-4">
        <div className="flex items-end justify-between">
          <h1 className="text-[30px] font-bold tracking-wide">{basics.name || '你的名字'}</h1>
          <span className="text-[15px] font-medium text-neutral-600">{basics.title}</span>
        </div>
        {contacts && <p className="mt-2 text-[12px] text-neutral-600">{contacts}</p>}
        {basics.extras && <p className="mt-0.5 text-[12px] text-neutral-600">{basics.extras}</p>}
        {basics.summary && <p className="mt-2 text-[12.5px] text-neutral-700">{basics.summary}</p>}
      </header>

      <Section title="教育经历" show={data.education.length > 0}>
        {data.education.map((e) => (
          <Entry
            key={e.id}
            left={e.school}
            right={`${e.start} - ${e.end}`}
            sub={[e.degree, e.major].filter(Boolean).join(' · ')}
            detail={e.detail}
          />
        ))}
      </Section>

      <Section title="实习 / 工作经历" show={data.work.length > 0}>
        {data.work.map((w) => (
          <Entry
            key={w.id}
            left={w.company}
            right={`${w.start} - ${w.end}`}
            sub={w.role}
            detail={w.detail}
            bullet
          />
        ))}
      </Section>

      <Section title="项目经历" show={data.projects.length > 0}>
        {data.projects.map((p) => (
          <Entry
            key={p.id}
            left={p.name}
            right={`${p.start} - ${p.end}`}
            sub={p.role}
            detail={p.detail}
            bullet
          />
        ))}
      </Section>

      <Section title="专业技能" show={data.skills.length > 0}>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {data.skills.map((s) => (
            <span key={s.id} className="text-[12.5px]">
              <span className="font-medium">{s.name}</span>
              {s.level && <span className="text-neutral-500">（{s.level}）</span>}
            </span>
          ))}
        </div>
      </Section>

      <Section title="自我评价" show={Boolean(data.selfReview.trim())}>
        <Multiline text={data.selfReview} className="space-y-0.5 text-[12.5px] text-neutral-700" />
      </Section>
    </div>
  );
}

function Section({
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
      <h2 className="mb-2 text-[14px] font-bold tracking-wider text-tpl-minimal">
        {title}
        <span className="ml-2 inline-block h-px w-full" />
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Entry({
  left,
  right,
  sub,
  detail,
  bullet = false,
}: {
  left: string;
  right: string;
  sub?: string;
  detail: string;
  bullet?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold">{left}</span>
        <span className="text-[12px] text-neutral-500">{right.replace(/^\s*-\s*$/, '')}</span>
      </div>
      {sub && <div className="text-[12.5px] text-neutral-600">{sub}</div>}
      <Multiline
        text={detail}
        bullet={bullet}
        className="mt-1 space-y-0.5 text-[12.5px] text-neutral-700"
      />
    </div>
  );
}
