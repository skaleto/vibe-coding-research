import type {
  ResumeData,
  EducationItem,
  WorkItem,
  ProjectItem,
  SkillItem,
} from '@/lib/types';
import { genId } from '@/lib/sampleData';
import { TextField, AreaField, FieldRow } from '@/components/fields';
import { FormSection, ItemCard } from '@/components/SectionCard';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
}

// 通用数组操作：增 / 删 / 改 / 上移 / 下移，复用到 4 个 section。
function arrayHelpers<T extends { id: string }>(
  list: T[],
  set: (next: T[]) => void,
) {
  return {
    update(id: string, patch: Partial<T>) {
      set(list.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    remove(id: string) {
      set(list.filter((it) => it.id !== id));
    },
    move(index: number, dir: -1 | 1) {
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      const next = [...list];
      const a = next[index];
      const b = next[target];
      if (!a || !b) return;
      next[index] = b;
      next[target] = a;
      set(next);
    },
  };
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const patch = (p: Partial<ResumeData>) => onChange({ ...data, ...p });
  const setBasics = (p: Partial<ResumeData['basics']>) =>
    patch({ basics: { ...data.basics, ...p } });

  const edu = arrayHelpers<EducationItem>(data.education, (n) => patch({ education: n }));
  const work = arrayHelpers<WorkItem>(data.work, (n) => patch({ work: n }));
  const proj = arrayHelpers<ProjectItem>(data.projects, (n) => patch({ projects: n }));
  const skill = arrayHelpers<SkillItem>(data.skills, (n) => patch({ skills: n }));

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <FormSection title="基本信息">
        <FieldRow>
          <TextField label="姓名" value={data.basics.name} onChange={(v) => setBasics({ name: v })} placeholder="林晓" />
          <TextField label="求职意向 / 头衔" value={data.basics.title} onChange={(v) => setBasics({ title: v })} placeholder="前端开发工程师" />
        </FieldRow>
        <FieldRow>
          <TextField label="电话" value={data.basics.phone} onChange={(v) => setBasics({ phone: v })} placeholder="138-0000-0000" />
          <TextField label="邮箱" value={data.basics.email} onChange={(v) => setBasics({ email: v })} placeholder="you@example.com" />
        </FieldRow>
        <TextField label="城市" value={data.basics.city} onChange={(v) => setBasics({ city: v })} placeholder="杭州" />
        <TextField
          label="其他信息"
          value={data.basics.extras}
          onChange={(v) => setBasics({ extras: v })}
          placeholder="本科 · 计算机 ｜ github.com/你"
        />
        <AreaField
          label="一句话简介"
          value={data.basics.summary}
          onChange={(v) => setBasics({ summary: v })}
          rows={2}
          placeholder="3 段实习经历的应届生，熟悉 React 工程化"
        />
      </FormSection>

      {/* 教育经历 */}
      <FormSection
        title="教育经历"
        addLabel="加一段"
        onAdd={() =>
          patch({
            education: [
              ...data.education,
              { id: genId('edu'), school: '', major: '', degree: '', start: '', end: '', detail: '' },
            ],
          })
        }
      >
        {data.education.map((e, i) => (
          <ItemCard
            key={e.id}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < data.education.length - 1}
            canRemove={data.education.length > 0}
            onMoveUp={() => edu.move(i, -1)}
            onMoveDown={() => edu.move(i, 1)}
            onRemove={() => edu.remove(e.id)}
          >
            <FieldRow>
              <TextField label="学校" value={e.school} onChange={(v) => edu.update(e.id, { school: v })} placeholder="某某大学" />
              <TextField label="专业" value={e.major} onChange={(v) => edu.update(e.id, { major: v })} placeholder="计算机科学与技术" />
            </FieldRow>
            <FieldRow>
              <TextField label="学历" value={e.degree} onChange={(v) => edu.update(e.id, { degree: v })} placeholder="本科" />
              <TimeRange
                start={e.start}
                end={e.end}
                onStart={(v) => edu.update(e.id, { start: v })}
                onEnd={(v) => edu.update(e.id, { end: v })}
              />
            </FieldRow>
            <AreaField
              label="补充"
              hint="（主修课程 / GPA / 排名，每行一条）"
              value={e.detail}
              onChange={(v) => edu.update(e.id, { detail: v })}
              rows={2}
            />
          </ItemCard>
        ))}
      </FormSection>

      {/* 工作 / 实习 */}
      <FormSection
        title="实习 / 工作经历"
        addLabel="加一段"
        onAdd={() =>
          patch({
            work: [
              ...data.work,
              { id: genId('work'), company: '', role: '', start: '', end: '', detail: '' },
            ],
          })
        }
      >
        {data.work.map((w, i) => (
          <ItemCard
            key={w.id}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < data.work.length - 1}
            canRemove={data.work.length > 0}
            onMoveUp={() => work.move(i, -1)}
            onMoveDown={() => work.move(i, 1)}
            onRemove={() => work.remove(w.id)}
          >
            <FieldRow>
              <TextField label="公司" value={w.company} onChange={(v) => work.update(w.id, { company: v })} placeholder="某互联网公司" />
              <TextField label="职位" value={w.role} onChange={(v) => work.update(w.id, { role: v })} placeholder="前端开发实习生" />
            </FieldRow>
            <TimeRange
              start={w.start}
              end={w.end}
              onStart={(v) => work.update(w.id, { start: v })}
              onEnd={(v) => work.update(w.id, { end: v })}
            />
            <AreaField
              label="工作内容 / 业绩"
              hint="（每行一条，建议带数据）"
              value={w.detail}
              onChange={(v) => work.update(w.id, { detail: v })}
              rows={3}
              placeholder={'负责 xx 模块开发\n列表性能优化，耗时下降 60%'}
            />
          </ItemCard>
        ))}
      </FormSection>

      {/* 项目 */}
      <FormSection
        title="项目经历"
        addLabel="加一个"
        onAdd={() =>
          patch({
            projects: [
              ...data.projects,
              { id: genId('proj'), name: '', role: '', start: '', end: '', detail: '' },
            ],
          })
        }
      >
        {data.projects.map((p, i) => (
          <ItemCard
            key={p.id}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < data.projects.length - 1}
            canRemove={data.projects.length > 0}
            onMoveUp={() => proj.move(i, -1)}
            onMoveDown={() => proj.move(i, 1)}
            onRemove={() => proj.remove(p.id)}
          >
            <FieldRow>
              <TextField label="项目名" value={p.name} onChange={(v) => proj.update(p.id, { name: v })} placeholder="校园二手交易小程序" />
              <TextField label="角色" value={p.role} onChange={(v) => proj.update(p.id, { role: v })} placeholder="前端负责人" />
            </FieldRow>
            <TimeRange
              start={p.start}
              end={p.end}
              onStart={(v) => proj.update(p.id, { start: v })}
              onEnd={(v) => proj.update(p.id, { end: v })}
            />
            <AreaField
              label="项目描述 / 成果"
              hint="（每行一条）"
              value={p.detail}
              onChange={(v) => proj.update(p.id, { detail: v })}
              rows={3}
            />
          </ItemCard>
        ))}
      </FormSection>

      {/* 技能 */}
      <FormSection
        title="专业技能"
        addLabel="加一项"
        onAdd={() => patch({ skills: [...data.skills, { id: genId('sk'), name: '', level: '' }] })}
      >
        {data.skills.map((s, i) => (
          <ItemCard
            key={s.id}
            index={i}
            canMoveUp={i > 0}
            canMoveDown={i < data.skills.length - 1}
            canRemove={data.skills.length > 0}
            onMoveUp={() => skill.move(i, -1)}
            onMoveDown={() => skill.move(i, 1)}
            onRemove={() => skill.remove(s.id)}
          >
            <FieldRow>
              <TextField label="技能" value={s.name} onChange={(v) => skill.update(s.id, { name: v })} placeholder="React / TypeScript" />
              <TextField label="熟练度（可空）" value={s.level} onChange={(v) => skill.update(s.id, { level: v })} placeholder="熟练" />
            </FieldRow>
          </ItemCard>
        ))}
      </FormSection>

      {/* 自我评价 */}
      <FormSection title="自我评价">
        <AreaField
          label="自我评价"
          hint="（每行一条）"
          value={data.selfReview}
          onChange={(v) => patch({ selfReview: v })}
          rows={4}
          placeholder={'对前端工程化有热情，习惯用数据衡量优化效果\n学习能力强，能快速上手新框架'}
        />
      </FormSection>
    </div>
  );
}

// 起止时间两列组件（复用）
function TimeRange({
  start,
  end,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
}) {
  return (
    <div>
      <span className="field-label">起止时间</span>
      <div className="grid grid-cols-2 gap-2">
        <input className="field-input" value={start} placeholder="2021.09" onChange={(e) => onStart(e.target.value)} />
        <input className="field-input" value={end} placeholder="2025.06 / 至今" onChange={(e) => onEnd(e.target.value)} />
      </div>
    </div>
  );
}
