import type { TemplateId, TemplateMeta } from './types';

// 4 套模板元信息。免费版仅 'minimal' 可用，其余需 ¥9 买断解锁。
export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'minimal',
    name: '极简灰',
    desc: '黑白灰 · 单栏 · 大厂通用',
    free: true,
    accent: '#2D2D2D',
  },
  {
    id: 'blue',
    name: '专业蓝',
    desc: '左侧栏 · 稳重 · 国企考公',
    free: false,
    accent: '#1E5FA8',
  },
  {
    id: 'creative',
    name: '创意彩',
    desc: '彩色标题 · 时间线 · 设计运营',
    free: false,
    accent: '#7C3AED',
  },
  {
    id: 'academic',
    name: '学术黑',
    desc: '衬线体 · 严谨 · 科研保研',
    free: false,
    accent: '#1A1A1A',
  },
];

export const DEFAULT_TEMPLATE: TemplateId = 'minimal';

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

export function isFreeTemplate(id: TemplateId): boolean {
  return getTemplate(id).free;
}
