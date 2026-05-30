import type { ResumeData } from '@/lib/types';
import { Multiline } from '@/components/Multiline';

// 学术黑：衬线字体、居中页眉、双线分隔。严谨，适合保研 / 科研 / 学术岗。
export function AcademicTemplate({ data }: { data: ResumeData }) {
  const { basics } = data;
  const contacts = [basics.phone, basics.email, basics.city].filter(Boolean).join('  ·  ');

  return (
    <div className="a4-sheet px-14 py-10 font-serif text-[13px] leading-relaxed text-tpl-academic">
      {/* 居中页眉 */}
      <header className="border-b-[3px] border-double border-tpl-academic pb-3 text-center">
        <h1 className="text-[28px] font-bold tracking-[0.15em]">{basics.name || '你的名字'}</h1>
        {basics.title && <p className="mt-1 text-[14px] tracking-wide">{basics.title}</p>}
        {contacts && <p className="mt-1.5 text-[12px] text-neutral-600">{contacts}</p>}
        {basics.extras && <p className="text-[12px] text-neutral-600">{basics.extras}</p>}
      </header>

      {basics.summary && (
        <p className="mt-3 text-center text-[12.5px] italic text-neutral-700">{basics.summary}</p>
      )}

      <Section title="教育背景" show={data.education.length > 0}>
        {data.education.map((e) => (
          <Row
            key={e.id}
            left={e.school}
            sub={[e.degree, e.major].filter(Boolean).join('，')}
            right={`${e.start} - ${e.end}`}
            detail={e.detail}
          />
        ))}
      </Section>

      <Section title="科研 / 工作经历" show={data.work.length > 0}>
        {data.work.map((w) => (
          <Row
            key={w.id}
            left={w.company}
            sub={w.role}
            right={`${w.start} - ${w.end}`}
            detail={w.detail}
            bullet
          />
        ))}
      </Section>

      <Section title="项目与成果" show={data.projects.length > 0}>
        {data.projects.map((p) => (
          <Row
            key={p.id}
            left={p.name}
            sub={p.role}
            right={`${p.start} - ${p.end}`}
            detail={p.detail}
            bullet
          />
        ))}
      </Section>

      <Section title="专业技能" show={data.skills.length > 0}>
        <p className="text-[12.5px] text-neutral-700">
          {data.skills
            .map((s) => (s.level ? `${s.name}（${s.level}）` : s.name))
            .filter(Boolean)
            .join('；')}
        </p>
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
      <h2 className="mb-2 border-b border-tpl-academic pb-0.5 text-[14.5px] font-bold tracking-[0.2em]">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Row({
  left,
  sub,
  right,
  detail,
  bullet = false,
}: {
  left: string;
  sub?: string;
  right: string;
  detail: string;
  bullet?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold">
          {left}
          {sub && <span className="ml-2 font-normal italic text-neutral-600">{sub}</span>}
        </span>
        <span className="text-[12px] text-neutral-500">{right.replace(/^\s*-\s*$/, '')}</span>
      </div>
      <Multiline
        text={detail}
        bullet={bullet}
        className="mt-0.5 space-y-0.5 text-[12.5px] text-neutral-700"
      />
    </div>
  );
}
