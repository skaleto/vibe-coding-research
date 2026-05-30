/**
 * 客户端强制注入的 disclaimer 文案。
 *
 * 设计原则：
 * - 不依赖 LLM 自觉，所有 disclaimer 由客户端 / API route 强制注入
 * - 即便 LLM 漏写，渲染时也用本文件的常量覆盖
 */

export const DISCLAIMER_TOP =
  '以下内容为 AI 基于心理学知识科普生成，仅供反思参考，不构成医疗诊断或专业咨询建议。';

export const DISCLAIMER_FOOTER =
  'AI 生成的解读仅是众多可能视角之一，不构成任何形式的预测、诊断或建议。若你的情绪困扰持续超过两周或影响日常生活，建议联系专业心理咨询师。';

export const DISCLAIMER_FIRST_LAUNCH = `欢迎使用梦境心理学日记。

在开始之前请你知悉：
✓ 本应用是自我反思工具，不是算命、占卜或预测应用
✓ AI 输出基于心理学知识生成，不替代任何形式的专业医疗或心理咨询
✓ 你的梦境数据默认仅保存在你的设备，不会用于训练 AI
✓ 如果你正在经历严重情绪困扰，请优先联系专业人士`;

/** 全应用顶部小字 banner */
export const DISCLAIMER_GLOBAL_BANNER =
  'AI 生成内容，仅供心理探索参考，不构成医疗诊断或预测。';

export const NEXT_STEP_DEFAULT =
  '如果近期情绪困扰持续，建议咨询专业心理咨询师。';
