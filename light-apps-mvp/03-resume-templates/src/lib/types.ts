// 简历数据模型：与模板完全解耦。
// 换模板时只换渲染层，这份数据不动 → "换模板数据不丢"。

export interface BasicsData {
  name: string;
  title: string; // 求职意向 / 头衔，如「前端开发工程师」
  phone: string;
  email: string;
  city: string;
  /** 其他自定义条目，如 GitHub / 学历 / 政治面貌，灵活展示 */
  extras: string; // 一行用 ｜ 分隔
  summary: string; // 一句话简介（顶部，模板可选用）
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string; // 学历，如「本科」「硕士」
  start: string; // 「2021.09」
  end: string; // 「2025.06」/「至今」
  detail: string; // 主修课程 / GPA / 排名，多行
}

export interface WorkItem {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  detail: string; // 工作内容 / 业绩，多行（每行一条）
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  start: string;
  end: string;
  detail: string; // 项目描述 / 职责 / 成果，多行
}

export interface SkillItem {
  id: string;
  name: string;
  level: string; // 「熟练」「了解」等，可空
}

export interface ResumeData {
  basics: BasicsData;
  education: EducationItem[];
  work: WorkItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  /** 自我评价，多行 */
  selfReview: string;
}

export type TemplateId = 'minimal' | 'blue' | 'creative' | 'academic';

export interface TemplateMeta {
  id: TemplateId;
  name: string; // 「极简灰」
  desc: string; // 一句话风格描述
  /** 是否属于免费版可用（免费仅 1 套） */
  free: boolean;
  /** 缩略图主题色，用于无图情况下的占位缩略 */
  accent: string;
}
