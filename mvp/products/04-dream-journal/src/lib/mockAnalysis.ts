/**
 * Mock 梦境解读 —— 不依赖任何 LLM key 也能让 demo 跑通。
 *
 * 必须是完整结构化数据（含弗洛伊德 / 荣格 / 格式塔 三视角），
 * 不允许 "TODO" / 占位文本，保证截图可用。
 */

import type { DreamAnalysis, School } from './types';
import { DISCLAIMER_TOP, NEXT_STEP_DEFAULT } from './disclaimer';

const PSYCHOLOGY_VIEWS: Record<School, string> = {
  jungian:
    '在荣格心理学视角下，这个梦境中的核心意象常被理解为内在世界的回响。荣格认为，梦不是对未来的预测，而是潜意识与意识对话的一种方式。你描述的画面，一种可能的理解角度是它呼应了「个体化历程」中的某个阶段——意识正在试图整合那些尚未被充分察觉的内在内容。重复出现的元素（人物 / 场景 / 情绪）在心理学层面常被视为某种主题在请求被关注，这并不意味着「有什么不对」，而是邀请你与这部分体验对话。值得注意的是，意象的象征意义会随个人经验而不同，最贴近你的解读，往往是当你自己停下来感受这些画面时浮现的那个直觉。',
  freudian:
    '弗洛伊德将梦境视为「通往潜意识的康庄大道」。他认为梦中的画面常通过「凝缩」（多个想法压缩成一个意象）与「移置」（情感对象的转移）来表达被日常意识屏蔽的内容。你描述的核心意象，在这个视角下可能与某种「未被允许」的内在愿望或冲突相关联——这是心理学知识层面的一种参考，不构成判断。需要强调：弗洛伊德的诠释框架是 19 世纪末构建的，许多结论已被现代神经科学修正；它更适合作为一个反思工具，而非「真相揭露」。',
  gestalt:
    '格式塔心理学认为，梦中的每个元素——人物、动作、场景、甚至情绪——都是「自我的一部分」。让我们试着把每个意象都当成你内在的一个声音：哪一部分在说话？想说什么？哪一部分被忽略了？这个视角不预测未来，而是邀请你与自己的内在多元性对话。皮尔斯（Fritz Perls）会建议你想象自己「成为」那个意象，问它："你想告诉我什么？" 这种方式有时会让原本模糊的感受变得清晰。这是一种可能的理解角度，最终的解读权在你自己手里。',
};

export function buildMockAnalysis(school: School = 'jungian'): DreamAnalysis {
  return {
    disclaimer_top: DISCLAIMER_TOP,
    key_symbols: ['水', '门', '远处的光'],
    views: [
      {
        school: 'freudian',
        schoolLabel: '弗洛伊德视角',
        body: '在弗洛伊德框架下，"水"常被理解为潜意识情感能量的象征性流动，"门"可能映射意识与潜意识之间的过渡。',
      },
      {
        school: 'jungian',
        schoolLabel: '荣格视角',
        body: '荣格视角下，"水"常呼应集体潜意识的深层；"门"可被理解为意识层次之间的阈限（liminal）象征。',
      },
      {
        school: 'gestalt',
        schoolLabel: '格式塔视角',
        body: '让"水"和"门"分别说话——水带着什么感受？门通向你内在的什么部分？',
      },
    ],
    psychology_view: PSYCHOLOGY_VIEWS[school],
    reflection_questions: [
      '梦中"水"的状态，像不像你最近的情绪？',
      '"门"后面，你希望或害怕看到什么？',
      '如果可以对梦中的自己说一句话，你想说什么？',
    ],
    emotion_tags: ['情感流动', '过渡感', '期待与未知'],
    next_step: NEXT_STEP_DEFAULT,
    crisis_alert: null,
  };
}

/**
 * 二级 / 三级触发时使用的暖色卡片样例分析（仅 psychology_view 改写得更温和）。
 * 服务端会在原 analysis 基础上挂 crisis_alert，客户端额外渲染暖色卡。
 */
export function buildSupportiveMockAnalysis(
  school: School,
  level: 2 | 3
): DreamAnalysis {
  const base = buildMockAnalysis(school);
  if (level === 2) {
    base.psychology_view =
      '你描述中传达的情绪让我有些担心。在我们看意象之前，想先停下来说：这种沉重的感觉是真实的，值得被认真对待。在心理学层面，梦境常常是白天未处理情绪的夜间整合，一种可能的理解角度是，这个梦或许是你的心在请求一些温柔的关注。你不需要立刻解决任何事，但也不必一个人扛——下面会附上可以联系的支持入口。';
    base.reflection_questions = [
      '此刻，你身体里最强烈的感受在哪里？',
      '过去 24 小时内，是否有让你感到一丝安慰的瞬间？',
      '你身边此刻有可以信任的人吗？',
    ];
    base.crisis_alert = {
      level: 2,
      note: '检测到强烈负面情绪关键词，已附加关怀支持卡片。',
    };
  } else {
    base.psychology_view +=
      '\n\n小提醒：你描述中流露的一些感受，如果近期反复出现并影响生活，和专业心理咨询师聊聊会很有帮助。这不是夸张，是一种值得被认真对待的自我关照。';
    base.crisis_alert = {
      level: 3,
      note: '检测到持续低落迹象，已附加温和的咨询建议。',
    };
  }
  return base;
}
