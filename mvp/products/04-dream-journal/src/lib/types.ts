/**
 * 公共类型定义
 */

export type School = 'jungian' | 'freudian' | 'gestalt';

export interface DreamRecord {
  id: string;
  createdAt: string; // ISO 8601
  text: string;
  mood?: string;
  school: School;
  analysis?: DreamAnalysis;
  crisisLevel: 0 | 1 | 2 | 3;
}

export interface SchoolView {
  school: School;
  schoolLabel: string; // "荣格视角"
  body: string;
}

/**
 * 国内版分析输出（严格按 detail-04 § A.1 schema）。
 *
 * 关键：disclaimer_top 不依赖 LLM 输出，客户端会强制注入。
 */
export interface DreamAnalysis {
  disclaimer_top: string;
  key_symbols: string[];
  /** 三视角解读（弗洛伊德 / 荣格 / 格式塔） */
  views: SchoolView[];
  /** 主视角的长解读 */
  psychology_view: string;
  reflection_questions: string[];
  emotion_tags: string[];
  next_step: string;
  /** 严重情绪标记，由服务端 detectCrisis() 注入，客户端不可绕过 */
  crisis_alert: null | {
    level: 1 | 2 | 3;
    /** 仅 hint，不含具体号码 */
    note: string;
  };
}

export interface AnalyzeDreamRequest {
  dreamText: string;
  mood?: string;
  school?: School;
}

export interface AnalyzeDreamResponse {
  /** 一级危机：服务端直接返回 redirect 信号 */
  redirectToCrisis: boolean;
  /** 命中的 level（埋点用） */
  crisisLevel: 0 | 1 | 2 | 3;
  /** 走 mock、真实 LLM 还是远端 gateway */
  provider: 'mock' | 'deepseek' | 'openai' | 'zhipu' | 'gateway';
  analysis: DreamAnalysis | null;
}
