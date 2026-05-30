import type { ResumeData } from '@/lib/types';
import { Multiline } from '@/components/Multiline';

// 专业蓝：左侧深蓝信息栏 + 右侧主内容。稳重，适合国企 / 考公 / 社招。
export function BlueTemplate({ data }: { data: ResumeData }) {
  const { basics } = data;
  return (
    <div className="a4-sheet flex font-sans text-[13px] leading-relaxed">
      {/* 左侧栏 */}
      <aside className="w-[34%] bg-tpl-blue px-6 py-9 text-white">
        <h1 className="text-[26px] font-bold leading-tight">{basics.name || '你的名字'}</h1>
        <p className="mt-1 text-[13px] text-blue-100">{basics.title}</p>

        <SideBlock title="联系方式">
          <SideLine label="电话" value={basics.phone} />
          <SideLine label="邮箱" value={basics.email} />
          <SideLine label="城市" value={basics.city} />
          {basics.extras && <p className="mt-1 text-[11.5px] text-blue-50">{basics.extras}</p>}
        </SideBlock>

        {data.skills.length > 0 && (
          <SideBlock title="专业技能">
            {data.skills.map((s) => (
              <p key={s.id} className="text-[12px] text-blue-50">
                {s.name}
                {s.level && <span className="text-blue-200">（{s.level}）</span>}
              </p>
            ))}
          </SideBlock>
        )}

        {basics.summary && (
          <SideBlock title="个人简介">
            <p className="text-[12px] text-blue-50">{basics.summary}</p>
          </SideBlock>
        )}
      </aside>

      {/* 右侧主体 */}
      <main className="flex-1 px-7 py-9 text-tpl-blue">
        <MainSection title="教育经历" show={data.education.length > 0}>
          {data.education.map((e) => (
            <Item
              key={e.id}
              title={e.school}
              meta={`${e.start} - ${e.end}`}
              sub={[e.degree, e.major].filter(Boolean).join(' · ')}
              detail={e.detail}
            />
          ))}
        </MainSection>

        <MainSection title="实习 / 工作经历" show={data.work.length > 0}>
          {data.work.map((w) => (
            <Item
              key={w.id}
              title={w.company}
              meta={`${w.start} - ${w.end}`}
              sub={w.role}
              detail={w.detail}
              bullet
            />
          ))}
        </MainSection>

        <MainSection title="项目经历" show={data.projects.length > 0}>
          {data.projects.map((p) => (
            <Item
              key={p.id}
              title={p.name}
              meta={`${p.start} - ${p.end}`}
              sub={p.role}
              detail={p.detail}
              bullet
            />
          ))}
        </MainSection>

        <MainSection title="自我评价" show={Boolean(data.selfReview.trim())}>
          <Multiline
            text={data.selfReview}
            className="space-y-0.5 text-[12.5px] text-neutral-700"
          />
        </MainSection>
      </main>
    </div>
  );
}

function SideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-1.5 border-b border-white/30 pb-1 text-[12.5px] font-semibold tracking-widest">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SideLine({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="text-[12px] text-blue-50">
      <span className="text-blue-200">{label}：</span>
      {value}
    </p>
  );
}

function MainSection({
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
    <section className="mb-5">
      <h2 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold text-tpl-blue">
        <span className="inline-block h-4 w-1 rounded bg-tpl-blue" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Item({
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
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold text-neutral-800">{title}</span>
        <span className="text-[12px] text-neutral-500">{meta.replace(/^\s*-\s*$/, '')}</span>
      </div>
      {sub && <div className="text-[12.5px] text-tpl-blue">{sub}</div>}
      <Multiline
        text={detail}
        bullet={bullet}
        className="mt-1 space-y-0.5 text-[12.5px] text-neutral-700"
      />
    </div>
  );
}
