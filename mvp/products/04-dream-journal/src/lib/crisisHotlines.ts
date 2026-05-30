/**
 * 心理援助热线数据结构 + 占位符渲染
 *
 * ⚠️ Codex Review 强制要求：
 *   绝不在代码 / Prompt / PRD / 文案里硬编码任何具体热线号码。
 *   所有号码用占位符（如 `{{crisis_hotline_primary}}`），上线前由人工核验后注入。
 *
 * 来源：detail-04-dream-journal.md § D.3 / compliance-checklist § 4.A
 *
 * 上线前必做：
 * 1. 人工逐条核验所有 locale 热线（来源 URL + 拨打测试）
 * 2. 每月 1 号复核一次（设定 calendar reminder）
 * 3. 任何复核未通过的热线立即从配置中移除
 * 4. 配置缺失时显示通用 fallback，**绝不**编造号码
 */

export interface HotlineRecord {
  /** 占位符 key，用于 placeholder 替换 */
  placeholderKey: string;
  /** 热线名称（公开展示） */
  name: string;
  /** 号码：MVP 阶段保留 placeholder，上线前替换 */
  number: string;
  /** 服务地区 */
  region: string;
  /** 服务时间 */
  hours: string;
  /** 信息来源 URL（用于核验留痕） */
  sourceUrl: string;
  /** 最后人工核验日期，ISO 8601 */
  lastVerified: string | null;
  /** 核验人工号或姓名 */
  verifiedBy: string | null;
}

/**
 * 热线配置 —— **不含具体号码**，仅含 placeholder。
 *
 * 上线前流程：
 * 1. 替换 number 字段为人工核验过的真实号码
 * 2. 填写 lastVerified / verifiedBy / sourceUrl
 * 3. 部署到远端配置（如 Cloudflare KV / D1），客户端按 locale 拉取
 */
export const HOTLINES_ZH: HotlineRecord[] = [
  {
    placeholderKey: 'crisis_hotline_primary',
    name: '心理援助热线（待人工核验填入）',
    number: '{{crisis_hotline_primary}}',
    region: '中国大陆',
    hours: '待核验',
    sourceUrl: '上线前由合规负责人填入官方来源（如卫健委公告页）',
    lastVerified: null,
    verifiedBy: null,
  },
  {
    placeholderKey: 'crisis_hotline_secondary',
    name: '备用心理援助热线（待人工核验填入）',
    number: '{{crisis_hotline_secondary}}',
    region: '中国大陆',
    hours: '待核验',
    sourceUrl: '上线前由合规负责人填入官方来源',
    lastVerified: null,
    verifiedBy: null,
  },
];

// i18n 占位（海外版未实现，本次 MVP 不实际暴露）
export const HOTLINES_EN: HotlineRecord[] = [
  {
    placeholderKey: 'crisis_hotline_primary',
    name: 'Crisis support hotline (verify before launch)',
    number: '{{crisis_hotline_primary}}',
    region: 'US / international',
    hours: 'TBD',
    sourceUrl: 'IASP resource directory / local public health',
    lastVerified: null,
    verifiedBy: null,
  },
];

export function getHotlines(locale = 'zh-CN'): HotlineRecord[] {
  if (locale.startsWith('en')) return HOTLINES_EN;
  return HOTLINES_ZH;
}

/**
 * 渲染热线信息字符串。
 *
 * 当所有热线都未核验时，返回通用 fallback 文案（不编造号码）。
 */
export function renderHotlineLine(h: HotlineRecord): string {
  // 未核验 / 仍是 placeholder → 显示 fallback
  if (!h.lastVerified || h.number.startsWith('{{')) {
    return `${h.name}：请联系本地紧急电话 / 可信任的人 / 专业心理机构（号码上线前由合规人工核验填入）`;
  }
  return `${h.name}（${h.region}，${h.hours}）：${h.number}`;
}

/**
 * 通用 fallback（任何渲染失败时的兜底文案）。
 *
 * **不包含**任何号码 —— 这是有意为之，避免代码里残留过期号码。
 */
export const GENERIC_CARE_FALLBACK =
  '如果你正在经历难以承受的感受，请优先：1) 拨打你所在地区的紧急电话；2) 联系一个你信任的人；3) 走进就近的医院心理科 / 社区心理服务中心。你不是一个人。';
