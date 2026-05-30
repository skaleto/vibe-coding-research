/**
 * 严重情绪三级关键词表（命脉）
 *
 * 来源：detail-04-dream-journal.md § G.2
 *
 * 一级：自杀 / 自残意图相关 → 客户端强制跳转 /crisis，不调 LLM
 * 二级：强烈负面情绪 → 常规分析 + 末尾追加暖色卡片 + 热线
 * 三级：持续低落迹象 → 常规分析 + 末尾追加温和建议
 *
 * 注意：
 * - 关键词清单 **每月人工复核一次**，含网络新词（emo / 破防 / 摆烂 等）
 * - 不允许在代码或 prompt 里硬编码任何具体心理热线号码
 * - False positive 保守优先：哪怕语境是梦境描述，依然展示求助入口
 */

export type CrisisLevel = 0 | 1 | 2 | 3;

export interface CrisisKeywordTable {
  level1: string[];
  level2: string[];
  level3: string[];
}

// 中文清单（zh-CN）
//
// 注意：关键词一律以**简体**收录。detectCrisis 会先把输入文本做
// 繁→简归一（见 detectCrisis.ts normalize），故无需在此重复列繁体变体；
// 但对「自杀 / 自殺」这类极高危核心词，仍显式补一条繁体硬兜底，
// 以防归一映射表未覆盖某个生僻变体时仍能命中（保守优先）。
export const CRISIS_KEYWORDS_ZH: CrisisKeywordTable = {
  // 一级：立即触发危机干预页面
  level1: [
    '自杀',
    '自殺', // 繁体硬兜底
    '了结自己',
    '了结了',
    '了断',
    '结束生命',
    '结束自己',
    '结束这一切',
    '跳楼',
    '跳河',
    '跳桥',
    '跳轨',
    '上吊',
    '自缢',
    '割腕',
    '割脉',
    '服毒',
    '吃药自杀',
    '不想活',
    '不想活了',
    '活不下去',
    '活着没意义',
    '活着没意思',
    '活着没什么意思',
    '活着没有意义',
    '想死',
    '我想死',
    '杀了自己',
    '把自己解决',
    '解决自己',
    '安乐死',
    '求死',
    '自残',
    '撞墙',
    '划自己',
    '烧自己',
    '伤害自己',
    '消失算了',
    '去死',
    '想消失就消失',
    '永远的离开',
    '永远离开',
    // —— 委婉自杀表达（高频规避词，审计 F04-04 要求补入一级）——
    '解脱', // 极高频自杀委婉语
    '想解脱',
    '求解脱',
    '不想撑了',
    '撑不下去', // 审计 F04-04：作为自杀委婉语升入一级（原在二级，此处提级，二级已移除以免被遮蔽）
    '撑不下去了',
    '不想再撑',
    '了结这一切',
    '不想醒了',
    '不想醒来',
    '再也不想醒',
    '睡过去就好了',
    '睡过去算了',
    '一睡不醒',
    '一了百了',
  ],

  // 二级：分析正常进行 + 末尾追加暖色卡片
  level2: [
    '绝望',
    '彻底没希望',
    '崩溃',
    '崩了',
    '撑不住',
    // '撑不下去' 已提级至 level1（自杀委婉语，保守优先）
    '熬不下去',
    '熬不住',
    '痛苦极了',
    '心如刀绞',
    '心碎',
    '空虚',
    '完全空',
    '什么都没意思',
    '活着累',
    '累到不行',
    '好累好累',
    '对未来绝望',
    '看不到希望',
    '破防',
  ],

  // 三级：末尾温和建议
  level3: [
    '孤独',
    '好孤独',
    '没人懂',
    '没人理解',
    '想消失',
    '躲起来',
    '一个人面对',
    '一个人扛',
    '撑着',
    'emo',
    '摆烂',
  ],
};

// 英文清单（en-US，i18n 占位，本次 MVP 走 zh-CN）
export const CRISIS_KEYWORDS_EN: CrisisKeywordTable = {
  level1: [
    'suicide',
    'suicidal',
    'kill myself',
    'end my life',
    'end it all',
    'want to die',
    'wish i was dead',
    'wish i were dead',
    'hang myself',
    'jump off',
    'overdose',
    'shoot myself',
    'self harm',
    'self-harm',
    'cut myself',
    'hurt myself',
    'no reason to live',
  ],
  level2: [
    'hopeless',
    'no hope',
    'despair',
    "can't go on",
    "can't take it anymore",
    'breaking down',
    'everything is pointless',
    "what's the point",
    'exhausted by life',
    'tired of everything',
  ],
  level3: [
    'lonely',
    'so lonely',
    'nobody understands',
    'want to disappear',
    'all alone',
    'holding on',
  ],
};

export function getKeywordTable(locale = 'zh-CN'): CrisisKeywordTable {
  if (locale.startsWith('en')) return CRISIS_KEYWORDS_EN;
  return CRISIS_KEYWORDS_ZH;
}
