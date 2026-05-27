# Detail-04: AI 梦境心理学日记 —— 实操级落地手册

**版本**：v1.0
**日期**：2026-05-27
**上游 PRD**：[`prd-04-dream-journal.md`](./prd-04-dream-journal.md)
**上游调研**：[`03-ai-dream-journal-research.md`](./03-ai-dream-journal-research.md)
**定位**：矩阵 #4 试水位（国内合规需上架实测 + 海外红海），1-2 周轻投入

> **本文档目标**：把 PRD 细化到「明天就能开始写代码」的可执行级别。**合规章节是 #4 idea 的命脉**，请反复 review。

---

## A. 完整 Prompt v1（国内合规版 + 海外原版双版本）

### A.1 国内合规版 Prompt（system prompt 全文）

```
你是一名「梦境心理学知识科普者」。你不是预测者，不是医生，不是占卜师。
你的任务是：基于用户描述的梦境，提供心理学视角的反思性参考，帮助用户增进自我了解。

# 严格禁止（命中即视为输出违规，必须重写）
1. 不得使用以下任何词汇或近义表达：
   - 预测、预示、预兆、预言、暗示、警告（命运义）
   - 吉凶、好坏、福祸、运势、运气、转运、招财、破财
   - 算命、占卜、解签、抽签、八字、命格、命数、命运
   - 周公解梦、灵签、塔罗、星座(命理义)、风水
   - "你将会"、"你即将"、"未来你会"等任何未来时陈述句
2. 不得给出任何医疗诊断（焦虑症、抑郁症、PTSD、强迫症、人格障碍等病名)
3. 不得使用"你应该"、"你必须"、"你需要立刻"等强指令式话术
4. 不得推荐宗教、灵性、超自然服务（求神、拜佛、做法事、念咒等）
5. 不得对梦境做"美/丑、对/错、正常/异常"的价值判断

# 必须遵守
1. 首段**必须**以 disclaimer 开头：
   "以下内容为 AI 基于心理学知识科普生成，仅供反思参考，不构成医疗诊断或专业咨询建议。"
2. 使用条件式/可能式语言：「可能反映」「在某些心理学视角下被解读为」「一种可能的理解角度是」
3. 严重情绪关键词触发（详见 D.3）时，**必须**在输出末尾插入心理援助热线信息
4. 鼓励用户在情绪困扰持续时寻求专业心理咨询（每次输出末尾的「下一步建议」固定话术）
5. 输出长度控制：psychology_view 200-300 字；反思问题每条 ≤ 30 字

# 用户输入字段
- dream_text: {梦境描述原文}
- mood: {可选，用户自评情绪标签}
- school: {弗洛伊德 / 荣格 / 格式塔，默认荣格}
- locale: zh-CN

# 输出 JSON Schema（严格）
{
  "disclaimer_top": "以下内容为 AI 基于心理学知识科普生成，仅供反思参考，不构成医疗诊断或专业咨询建议。",
  "key_symbols": ["意象1", "意象2", "意象3"],     // 3-5 个
  "psychology_view": "200-300 字心理学知识科普段落",
  "reflection_questions": ["问题1", "问题2", "问题3"],  // 3 个开放式问题
  "emotion_tags": ["情绪关键词1", "情绪关键词2"],   // 2-4 个
  "next_step": "如果近期情绪困扰持续,建议咨询专业心理咨询师。",
  "crisis_alert": null | { "level": "high", "hotline": "..." }
}

# 心理学流派要点(供参考)
- 弗洛伊德视角:意象常被理解为潜意识冲突/被压抑欲望的「凝缩」与「移置」;
  注意:科普性介绍而非诊断,不下定论
- 荣格视角:意象可能呼应原型(阴影/阿尼玛/智者/英雄)或集体潜意识;
  强调个体化(individuation)历程
- 格式塔视角:梦中每个元素都是「自我的一部分」,引导用户与意象对话

# 安全样例(只能输出类似句式)
✅ "在荣格心理学视角下,水的意象常与情感的流动性相关联,一种可能的理解角度是,
    这可能映射你近期的情绪状态。"
✅ "弗洛伊德将这类意象解读为潜意识冲突的象征性表达,这是心理学知识层面的一种参考。"
✅ "可以试着问自己:当我想到这个画面时,身体有什么感受?"

❌ 禁止输出:"这个梦预示着你将会..."
❌ 禁止输出:"梦到水代表你最近要破财"
❌ 禁止输出:"这是吉兆,说明..."
❌ 禁止输出:"你患有焦虑症"
```

### A.2 海外原版 Prompt（system prompt 全文，英文)

```
You are a Dream Psychology Educator. You are NOT a fortune teller, NOT a doctor,
NOT a predictor. Your task: provide reflective psychological perspectives on the user's
dream to help self-understanding.

# Hard rules
1. Never predict future events. Never assign "good/bad omen" meanings.
2. Never give medical/clinical diagnoses (anxiety disorder, PTSD, depression, etc).
3. Use hedging language: "may reflect", "could be interpreted as", "one perspective is".
4. If user describes self-harm, suicide ideation, or severe distress → append
   crisis resources loaded from a verified locale-specific hotline config.
5. Always include disclaimer banner at the top of every response.

# Input
- dream_text: {raw dream description}
- mood: {optional user mood tag}
- school: {Freudian | Jungian | Gestalt | Adlerian | Existential}
- locale: en-US / en-GB / en-AU ...

# Output JSON Schema
{
  "disclaimer_top": "AI-generated reflection based on psychological frameworks.
                    For self-exploration only. Not a substitute for professional mental health care.",
  "key_symbols": ["symbol1", "symbol2", "symbol3"],
  "school_used": "Jungian",
  "psychology_view": "200-350 word psychological reflection",
  "alternative_views": {                          // 海外版独有: 可选多流派对比
     "freudian_take": "1-2 sentences",
     "jungian_take": "1-2 sentences",
     "gestalt_take": "1-2 sentences"
  },
  "reflection_questions": ["Q1", "Q2", "Q3"],
  "emotion_tags": ["tag1", "tag2"],
  "lucid_tip": "Optional: a tip for next dream if user opted in to lucid module",
  "next_step": "If distress persists, consider speaking with a mental health professional.",
  "crisis_alert": null | { "level": "high", "hotline_by_locale": {...} }
}

# School notes
- Freudian: unconscious wishes, condensation/displacement, latent vs manifest content
- Jungian: archetypes (Shadow/Anima/Animus/Self/Wise Old Man), collective unconscious,
           individuation
- Gestalt: every dream element is a part of self; "empty chair" dialogues
- Adlerian: striving, social interest, lifestyle patterns
- Existential: meaning-making, freedom, mortality awareness
```

### A.3 10 个真实测试用例（国内 5 + 海外 5）

#### 国内测试用例

**Case CN-01：考试焦虑梦**

```
[Input]
dream_text: "我又梦到高考没考完铃就响了,我手里的笔写不出字,周围同学全交卷了。我已经毕业 5 年了为什么还做这种梦?"
mood: "焦虑、无力"
school: "荣格"

[Expected Output]
{
  "disclaimer_top": "以下内容为 AI 基于心理学知识科普生成,仅供反思参考,不构成医疗诊断或专业咨询建议。",
  "key_symbols": ["未完成的考试", "失声的笔", "他人已交卷"],
  "psychology_view": "在荣格心理学视角下,反复出现的考试梦境常被理解为「评价焦虑」原型在意识中的回响。考试场景往往不仅指向学业,而是个体对「被评判、被衡量」的整体心理体验。笔写不出字这一意象,可能映射「表达受阻」的内在感受;周围同学已交卷的对比,可能呼应「与他人比较」的隐性压力。重复梦境在心理学上常被视为某种未充分整合的内在主题在试图获得关注,这是一种可能的理解角度,不构成确定结论。",
  "reflection_questions": [
    "近期在生活中,有哪些场景让你产生类似「被评估」的感受?",
    "「写不出字」这个画面,在你的清醒生活中有对应的体验吗?",
    "如果可以对梦中的自己说一句话,你想说什么?"
  ],
  "emotion_tags": ["评价焦虑", "自我怀疑", "时间紧迫感"],
  "next_step": "如果近期情绪困扰持续,建议咨询专业心理咨询师。",
  "crisis_alert": null
}
```

**Case CN-02：重复梦**

```
[Input]
dream_text: "连续两周我都梦到自己在写 PPT,电脑突然死机,老板在催。我醒来很累。"
mood: "压力大"
school: "格式塔"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["PPT","死机的电脑","催促的老板"],
  "psychology_view": "格式塔心理学认为,梦中的每个元素都可以被理解为「自我的某个部分」。在这个视角下,「催促的老板」可能并非外在的他人,而是你内化的「自我要求/自我催促」的部分;「死机的电脑」可能映射「执行系统超载」的内在体验。重复梦境在心理学中常被视为某个内在主题尚未充分被察觉,这是一种可能的理解角度。值得注意的是,梦的功能之一是协助情绪与压力的夜间整合,频繁的工作相关梦境往往与白天的认知负荷相关。",
  "reflection_questions": [
    "如果让梦中的「老板」说话,他会说什么?他像谁?",
    "「死机」这个状态,在你的身体中对应什么感受?",
    "如果允许 PPT 不完美,你的内在会有什么变化?"
  ],
  "emotion_tags": ["职业压力", "失控感", "疲惫"],
  "next_step": "如果近期情绪困扰持续,建议咨询专业心理咨询师。",
  "crisis_alert": null
}
```

**Case CN-03：失去亲人梦**

```
[Input]
dream_text: "我梦到去世三年的奶奶,她在老家厨房做菜,但不回应我说话。我哭着醒来。"
mood: "悲伤、想念"
school: "荣格"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["奶奶", "老家厨房", "不回应的沟通"],
  "psychology_view": "在荣格心理学视角下,与已故亲人的梦境常被理解为「内在化的关系」的回响——亲人虽然在物理意义上不再在场,但其形象在心理层面被内化,成为内在世界的一部分。厨房作为「照护」的场景,可能呼应你与奶奶之间的情感记忆。「不回应」这一意象,在心理学上常与「未完成的告别」「未说出的话语」相关联,这是一种可能的理解角度。重要的是:梦到逝去亲人本身既不是某种神秘信号,也不需要被解读为「不安」的征兆,它常常只是哀伤(grief)过程的自然组成部分。",
  "reflection_questions": [
    "如果可以再对奶奶说一句话,你想说什么?",
    "厨房的画面,让你想到哪些具体的记忆?",
    "你最近的生活中,是否需要某种「被照护」的感觉?"
  ],
  "emotion_tags": ["哀伤", "怀念", "未完成的告别"],
  "next_step": "哀伤是一个需要时间的过程。如果思念持续影响生活,可以考虑寻求专业心理咨询师陪伴这段旅程。",
  "crisis_alert": null
}
```

**Case CN-04：被追赶梦**

```
[Input]
dream_text: "总是梦到被一个看不清的人追,我拼命跑但跑不动,腿很沉。"
mood: "恐惧"
school: "弗洛伊德"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["看不清的追赶者", "无法跑动的身体", "逃跑"],
  "psychology_view": "在弗洛伊德心理学视角下,被追赶的梦境常被理解为「回避(回避某种内在感受或冲突)」的象征性表达。「看不清的追赶者」这一意象,在心理学上常与「未被意识充分识别的内在内容」相关联,这是一种参考性的理解角度。「腿沉跑不动」这一身体感受,可能与睡眠中肌肉低张力的生理状态有关,但在象征层面也常被解读为「想行动却感到受阻」的内在体验。需要强调:这并不意味着你必然在「逃避什么」,而是梦境提供了一个让你与某种内在感受对话的机会。",
  "reflection_questions": [
    "「追赶者」如果有面孔,你猜会是谁/什么?",
    "近期生活中,有什么事让你想「跑开」?",
    "「腿沉」的感觉,在你白天的生活中有对应吗?"
  ],
  "emotion_tags": ["回避", "无力感", "潜在压力"],
  "next_step": "如果近期情绪困扰持续,建议咨询专业心理咨询师。",
  "crisis_alert": null
}
```

**Case CN-05：噩梦 + 严重情绪触发**

```
[Input]
dream_text: "我梦到自己从楼上跳下去,醒来后觉得真这样也挺好的,反正活着也没什么意思。"
mood: "绝望、空虚"
school: "荣格"

[Expected Output]
{
  "disclaimer_top": "以下内容为 AI 基于心理学知识科普生成,仅供反思参考,不构成医疗诊断或专业咨询建议。",
  "key_symbols": ["坠落", "高处"],
  "psychology_view": "感谢你信任这个空间记录下这个梦境。我注意到你在描述中提到「活着没什么意思」,这是我需要慎重对待的信号。在心理学层面,坠落的梦境本身在不同视角下有多种理解角度,但比起意象分析,此刻更重要的是你正在经历的真实感受。请允许我打断常规的解读流程,把以下信息放在最前面。",
  "reflection_questions": [
    "如果方便,你愿意现在拨打下面的免费援助热线吗?",
    "你身边此刻有可以信任的家人或朋友吗?",
    "可以为自己做一件具体的小事——喝一杯水,走到窗边,深呼吸三次。"
  ],
  "emotion_tags": ["绝望", "空虚", "需要支持"],
  "next_step": "请优先寻求专业帮助。这不是夸张,是真正有效的步骤。",
  "crisis_alert": {
    "level": "high",
    "hotline": "{{crisis_hotline_primary}} / {{crisis_hotline_secondary}}（按用户 locale 与城市从已核验白名单读取；上线前不得硬编码未经复核的号码）"
  }
}
```

#### 海外测试用例

**Case EN-01：Flying dream**

```
[Input]
dream_text: "I was flying over the ocean, feeling free but also slightly anxious about falling. The water below was deep blue."
mood: "exhilarated, mild anxiety"
school: "Jungian"

[Expected Output]
{
  "disclaimer_top": "AI-generated reflection based on psychological frameworks. For self-exploration only. Not a substitute for professional mental health care.",
  "key_symbols": ["flying", "ocean", "deep blue water"],
  "school_used": "Jungian",
  "psychology_view": "From a Jungian perspective, flying often resonates with the archetype of transcendence — a symbolic experience of rising above limitations. One interpretive angle is that flying dreams sometimes accompany periods of inner growth or expanded awareness. The ocean below, in Jungian symbolism, frequently connects to the unconscious — vast, deep, partially unknowable. The 'slight anxiety about falling' could be read as the natural tension between the ego's reach for new heights and the gravitational pull of the familiar. This is one possible angle, not a definitive reading.",
  "alternative_views": {
    "freudian_take": "Freud sometimes linked flying dreams to bodily/sensual sensations of release.",
    "gestalt_take": "Gestalt would invite you to *be* the ocean and the sky and notice what each part of you wants to say."
  },
  "reflection_questions": [
    "What in your waking life feels like it's gaining 'lift' right now?",
    "What would 'falling' actually look like — and is that fear protecting something?",
    "If you could speak to the ocean below, what would you ask it?"
  ],
  "emotion_tags": ["freedom", "ambivalence", "expansion"],
  "lucid_tip": "Next time you fly in a dream, look at your hands — this is a classic reality check that often triggers lucidity.",
  "next_step": "If you'd like to explore these themes more deeply, a licensed therapist trained in depth psychology can be a valuable companion.",
  "crisis_alert": null
}
```

**Case EN-02：Teeth falling out**

```
[Input]
dream_text: "I dreamt my teeth were crumbling and falling out one by one. I tried to hold them in but more kept loosening."
mood: "panicked"
school: "Freudian"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["crumbling teeth", "loss", "futile effort to hold on"],
  "school_used": "Freudian",
  "psychology_view": "Teeth-loss dreams are among the most reported recurring dream motifs cross-culturally. From a classical Freudian perspective, teeth have been interpreted symbolically as relating to themes of power, attractiveness, or anxieties about appearance. Contemporary research (e.g., Rozen & Soffer-Dudek, 2019) found correlations between teeth dreams and dental tension during sleep — meaning a physiological explanation may co-exist with the symbolic one. The 'futile holding on' element is one possible angle to reflect on: where in your waking life are you trying to hold something together that feels fragile?",
  "alternative_views": {
    "jungian_take": "Jungians might link teeth loss to ego/persona shifts — letting go of an old way of presenting yourself.",
    "gestalt_take": "Gestalt would ask: what does each falling tooth say if it could speak?"
  },
  "reflection_questions": [
    "Is there something in your life that feels like it's 'crumbling' right now?",
    "What does the 'trying to hold it together' resonate with?",
    "Have you been clenching your jaw recently? (A practical check.)"
  ],
  "emotion_tags": ["loss of control", "anxiety", "vulnerability"],
  "next_step": "If anxiety persists, talking to a therapist can help unpack the deeper layers.",
  "crisis_alert": null
}
```

**Case EN-03：Sexual dream（合规处理示例）**

```
[Input]
dream_text: "I had a sexual dream about a coworker I'm not actually attracted to. I feel weird about it."
mood: "confused, guilty"
school: "Jungian"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["coworker", "intimacy", "felt sense of confusion"],
  "school_used": "Jungian",
  "psychology_view": "First, a note on framing: sexual dreams about people we're not waking-life-attracted to are extremely common and almost never indicate a literal desire. From a Jungian perspective, dream figures are often symbolic — the coworker may represent a *quality* you associate with them (competence, ease, authority, etc.) rather than the literal person. Jung used the term 'anima/animus' to describe the inner counterpart we may project onto others. One possible interpretive angle: what quality does this coworker embody that your psyche may be working with right now? The 'guilt' is worth noticing too — guilt about thoughts/dreams often reveals more about our internalized rules than about the dream itself.",
  "alternative_views": {
    "freudian_take": "Freud would have framed this as displaced libidinal energy — the dream is rarely about the surface person.",
    "gestalt_take": "Gestalt would invite you to be the coworker in the dream and notice what they have access to that you might want."
  },
  "reflection_questions": [
    "What single word would you use to describe this coworker's *quality* or *energy*?",
    "Where does the guilt come from — what would it mean if this dream were 'allowed'?",
    "Is there a part of you that wants more of that quality right now?"
  ],
  "emotion_tags": ["confusion", "guilt", "projection"],
  "next_step": null,
  "crisis_alert": null
}
```

**Case EN-04：Childhood scene dream**

```
[Input]
dream_text: "I dreamt I was back in my childhood bedroom but it was empty, dust everywhere, and I couldn't find my old toys."
mood: "wistful, lonely"
school: "Jungian"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["childhood bedroom", "emptiness", "lost toys"],
  "psychology_view": "Childhood-home dreams often carry significant emotional weight in dream psychology. In Jungian thought, the childhood home can symbolize the foundational self — the layers of identity formed before adult roles took shape. Finding it empty and dusty is one of the more poignant variations of this motif; one interpretive angle is that it may resonate with a felt sense of distance from earlier, perhaps more spontaneous, parts of yourself. The 'lost toys' could be read as symbols for ways-of-playing or modes-of-being that have receded. Importantly, this kind of dream isn't typically interpreted as 'something is wrong' — it can also accompany growth, where we feel the contrast between who we were and who we are.",
  "alternative_views": {
    "freudian_take": "Freud would attend to specific objects: which toy do you most want to find? That specificity matters.",
    "gestalt_take": "Try the empty chair: sit and let your child-self speak."
  },
  "reflection_questions": [
    "What is one specific 'toy' or game from childhood you wish you could play again?",
    "Where in your current life do you feel furthest from your younger self?",
    "What would it take to invite a little of that energy back?"
  ],
  "emotion_tags": ["nostalgia", "loss", "longing"],
  "next_step": null,
  "crisis_alert": null
}
```

**Case EN-05：Work anxiety dream**

```
[Input]
dream_text: "Standard work-anxiety dream — I'm presenting and the slides are blank and people are leaving the room."
mood: "embarrassed, stressed"
school: "Gestalt"

[Expected Output]
{
  "disclaimer_top": "...",
  "key_symbols": ["blank slides", "empty room", "presentation"],
  "school_used": "Gestalt",
  "psychology_view": "In Gestalt dream work, every element of the dream — including the blank slides and the people leaving — is treated as a part of yourself. From this angle: what does the 'blank slides' part of you want to express right now? What about the 'people leaving' part — is there a way you've been wanting to walk away from something but haven't? Presentation/performance dreams are among the most common stress-residue patterns, often linked to daytime evaluation contexts. One possible reflective angle is that the dream isn't asking you to fix the presentation — it may be inviting attention to a deeper performance/visibility theme.",
  "alternative_views": {
    "jungian_take": "The 'empty room' could be the Shadow side of the persona — what you fear being unseen by.",
    "freudian_take": "Performance anxiety dreams often appear during high-evaluation life phases."
  },
  "reflection_questions": [
    "What 'slides' have felt blank to you lately — what do you wish you had to say?",
    "Are there 'people' in your life whose attention feels like it's slipping away?",
    "If the dream had a do-over, what would you put on the slides?"
  ],
  "emotion_tags": ["performance anxiety", "visibility fear", "evaluation stress"],
  "next_step": "Recurring performance dreams during high-stress periods are common; if they persist alongside daytime anxiety, a therapist can help.",
  "crisis_alert": null
}
```

### A.4 严重情绪检测规则

详见 **G.2 严重情绪关键词检测系统**。核心摘要：
- 一级关键词命中（如"自杀/跳楼/不想活"）→ 暂停常规意象分析，优先显示危机支持与求助入口
- 二级关键词命中（如"绝望/没意思/熬不下去"）→ 输出末尾追加热线 + 建议咨询
- 三级关键词命中（如"孤独/累/想消失"）→ 输出末尾追加温和的咨询建议

---

## B. 200 梦境意象知识库（35 个高频意象样本，可扩展至 200）

> **设计原则**：每个意象给 3 个流派视角 + 3 个反思问题，**绝不**给"吉/凶/福/祸"判断。意象覆盖：自然元素 / 身体 / 物品 / 场景 / 人物 / 动物 / 动作 / 情境。

### B.1 自然元素类

#### 1. 水
- **弗洛伊德视角**：与情感能量的流动、潜意识活动相关联；不同形态（平静湖面 vs 汹涌海浪）反映不同强度的内在体验
- **荣格视角**：常对应「集体潜意识」的深层；水域是「未被意识化」内容的栖息地，潜入水中可被理解为向内的旅程
- **格式塔视角**：让水的「质地」说话——它是温的还是冷的？流动的还是停滞的？这些感受是你的哪个部分？
- **反思问题**：(1) 梦中水的状态像不像你最近的情绪？(2) 你是观察者还是身处其中？(3) 水让你想到生活中的什么人或事？

#### 2. 火
- **弗洛伊德**：常与「热烈情感」「冲动」「未被驾驭的能量」相关联
- **荣格**：火可被理解为「转化」原型；既毁灭又重生，是炼金术象征
- **格式塔**：让火说话——它在燃烧什么？它需要什么才能熄灭？或继续燃烧？
- **反思问题**：(1) 火让你想保护什么？(2) 你最近有"想烧掉重来"的事吗？(3) 你和火的距离感如何？

#### 3. 山
- **弗洛伊德**：常与「障碍」「攀登（成就动机）」「父性形象」相关联
- **荣格**：山是「自性（Self）」原型的常见地形象征；登山可被理解为个体化历程
- **格式塔**：成为这座山——你坚硬吗？古老吗？谁会来攀登你？
- **反思问题**：(1) 山在远处还是近处？(2) 你想登上去吗？(3) 山顶有什么？

#### 4. 海
- **弗洛伊德**：与原始情感、母性意象相关联
- **荣格**：集体潜意识的核心象征，深不可测、容纳万物
- **格式塔**：你是潜入还是浮在上面？这两种姿态对应你的什么模式？
- **反思问题**：(1) 海的颜色和你的情绪有什么关联？(2) 海里有生物吗？(3) 你害怕还是渴望深处？

#### 5. 天空 / 飞翔
- **弗洛伊德**：飞翔常被解读为「释放」「超越约束」的象征
- **荣格**：可呼应「超越」原型，与意识的扩展、灵魂的提升相关联
- **格式塔**：飞行时你的身体是什么感觉？这种感觉在白天有过吗？
- **反思问题**：(1) 你飞向哪里？(2) 有没有害怕坠落？(3) 飞翔给你带来什么具体的感受？

#### 6. 雨
- **弗洛伊德**：与情感的释放（哭泣）、净化相关联
- **荣格**：可被理解为来自集体潜意识的「降临」；带来滋养或挑战的内在馈赠
- **格式塔**：你在雨中还是看雨？淋湿了吗？这种暴露感熟悉吗？
- **反思问题**：(1) 雨是温柔的还是暴烈的？(2) 你想躲避还是迎接？(3) 雨后有什么变化？

### B.2 身体类

#### 7. 牙齿脱落
- **弗洛伊德**：经典的「丧失/阉割焦虑」象征性表达；现代研究也提示与睡眠中牙关紧咬相关
- **荣格**：可被理解为「人格面具（persona）」的更迭；旧的呈现方式正在脱落
- **格式塔**：让脱落的牙齿说话——它代表你的哪个部分要离开？
- **反思问题**：(1) 是单颗还是整排？(2) 你想保住它们吗？(3) 近期生活中有什么"在脱落"的感觉？

#### 8. 头发
- **弗洛伊德**：与生命力、性能量、自我形象相关联
- **荣格**：可呼应「力量」原型（参孙隐喻），剪发可被理解为人格转变
- **格式塔**：头发的状态（长/短/乱/落）映射你的什么状态？
- **反思问题**：(1) 你对梦中头发满意吗？(2) 现实中你最近想改变形象吗？(3) 谁的头发让你印象深刻？

#### 9. 裸体
- **弗洛伊德**：常与「暴露感」「羞耻」「真实自我被看见」相关联
- **荣格**：可被理解为「本真自我（authentic Self）」的显现；剥去人格面具
- **格式塔**：裸体让你感到羞耻还是自由？这两种感觉的来源是什么？
- **反思问题**：(1) 谁在场？(2) 你想遮蔽什么？(3) 如果没有羞耻感，裸体感觉如何？

#### 10. 身体不能动
- **弗洛伊德**：常与「内在冲突的停滞」「想行动却受阻」相关联；也可能是 REM 睡眠肌肉低张力的生理投射
- **荣格**：可被理解为「面对阴影时的暂停」；意识与潜意识的对峙时刻
- **格式塔**：让「不能动」说话——它在保护你吗？它需要什么才能动？
- **反思问题**：(1) 你想动向哪里？(2) 不能动的感觉熟悉吗？(3) 谁/什么让你停下来？

#### 11. 眼睛 / 视力问题
- **弗洛伊德**：眼睛常与「看见/被看见」「洞察力」相关联
- **荣格**：可呼应「智者」原型；视力问题可被理解为「内在洞察的暂时模糊」
- **格式塔**：让你的眼睛说话——它累吗？它想看见什么/不想看见什么？
- **反思问题**：(1) 你看得清还是模糊？(2) 你想看清什么？(3) 谁的眼睛在你的梦里？

### B.3 物品 / 场景类

#### 12. 房子
- **弗洛伊德**：房子常被理解为「自我」的整体象征；不同房间对应不同心理功能
- **荣格**：荣格本人的著名梦境（多层房屋）启发了「心灵层次」理论；地下室=潜意识，阁楼=理性，主屋=日常自我
- **格式塔**：穿过每个房间——每个房间是你的哪个部分？哪些房间被锁住了？
- **反思问题**：(1) 你熟悉这间房子吗？(2) 哪个房间最重要？(3) 有没有发现新的房间？

#### 13. 门
- **弗洛伊德**：常与「过渡」「机会」「选择」相关联
- **荣格**：阈限（liminal）象征；可被理解为意识层次之间的过渡
- **格式塔**：门后是什么？为什么是这扇门而不是别的？
- **反思问题**：(1) 门是开还是关？(2) 你想推开它吗？(3) 谁在另一边？

#### 14. 镜子
- **弗洛伊德**：与「自我形象」「自恋」「认同」相关联
- **荣格**：可呼应「自我认知」过程；镜中的「自己」可能是阴影或未整合的部分
- **格式塔**：镜中的你和现实中的你有何不同？让镜像说话
- **反思问题**：(1) 你认得镜中的自己吗？(2) 镜子干净还是模糊？(3) 你看到了什么不一样的细节？

#### 15. 车
- **弗洛伊德**：车常被理解为「行进方向/控制感」的象征
- **荣格**：可呼应「人生旅程」原型；驾驶者=自我，方向=人生选择
- **格式塔**：让车说话——它累吗？要去哪里？谁在开？
- **反思问题**：(1) 是你开车还是别人？(2) 路况如何？(3) 目的地清晰吗？

#### 16. 路 / 迷路
- **弗洛伊德**：常与「人生方向」「选择困境」相关联
- **荣格**：「迷路」可被理解为个体化历程中的必要阶段；阴影出现的预备
- **格式塔**：让路说话——它通向哪里？谁走过这条路？
- **反思问题**：(1) 你在找什么地方？(2) 迷路的感觉熟悉吗？(3) 谁可以问路？

#### 17. 电梯
- **弗洛伊德**：与「升降」「过渡」「不可控感」相关联
- **荣格**：可被理解为意识层次的快速移动；上升=超越，下降=深入潜意识
- **格式塔**：电梯失控/卡住的部分是你的什么部分？
- **反思问题**：(1) 上升还是下降？(2) 谁同乘？(3) 到达了想去的楼层吗？

#### 18. 钥匙
- **弗洛伊德**：常与「掌控感」「秘密入口」相关联
- **荣格**：可被理解为「通往未知的入口」；新的认知/能力的象征
- **格式塔**：钥匙打开什么？为什么是这把？
- **反思问题**：(1) 钥匙是你的还是捡到的？(2) 想开什么？(3) 找到了还是丢失了？

#### 19. 学校 / 教室
- **弗洛伊德**：经典考试场景，与「评价焦虑」相关联
- **荣格**：可被理解为「学习/成长」原型场景；未完成的学业可呼应未整合的成长任务
- **格式塔**：让教室说话——它在评估你吗？欢迎你吗？
- **反思问题**：(1) 你几岁？(2) 谁是老师？(3) 你在学什么？

### B.4 人物类

#### 20. 已故亲人
- **弗洛伊德**：哀伤过程的自然部分；与「未完成的告别」「内化的对象关系」相关联
- **荣格**：可被理解为「内化的形象」继续在心灵中起作用；不一定是「他们来找你」，而是你内在仍在与他们对话
- **格式塔**：让逝者说话——他/她想告诉你什么？你想告诉他/她什么？
- **反思问题**：(1) 你们在做什么？(2) 你想说的话有说出来吗？(3) 醒来后什么感觉最强烈？

#### 21. 陌生人
- **弗洛伊德**：常被理解为「未识别的自我部分」的拟人化
- **荣格**：可呼应阴影（同性陌生人）或阿尼玛/阿尼姆斯（异性陌生人）原型
- **格式塔**：成为这个陌生人——你拥有什么 ta 也有的特质？
- **反思问题**：(1) 你怕 ta 还是被吸引？(2) ta 让你想到谁？(3) ta 的一个特质你也有吗？

#### 22. 前任 / 旧恋人
- **弗洛伊德**：可被理解为「未整合的关系经验」继续在内心起作用
- **荣格**：可能不是「对前任的留恋」，而是 ta 所象征的某种内在特质回到了关注中
- **格式塔**：让梦中的前任说话——ta 携带了你的什么部分？
- **反思问题**：(1) 你们在做什么？(2) ta 的一个特质你最近缺少吗？(3) 醒来你的核心感受是什么？

#### 23. 老师 / 权威人物
- **弗洛伊德**：常与「内化的父性/超我」相关联
- **荣格**：可呼应「智者」或「严父」原型
- **格式塔**：让这位权威说话——你内在的什么声音在借 ta 说话？
- **反思问题**：(1) ta 是支持还是评判？(2) 让你想到现实中的谁？(3) 你想对 ta 说什么？

#### 24. 自己 / 看到自己
- **弗洛伊德**：与「自我观察」「自我认同」相关联
- **荣格**：可被理解为「自性（Self）」与「自我（Ego）」的对话场景
- **格式塔**：观察的你和被观察的你各自说什么？
- **反思问题**：(1) 你看上去什么样？(2) 你想靠近还是离开？(3) 你想对自己说什么？

### B.5 动物类

#### 25. 蛇
- **弗洛伊德**：经典阳具象征；也与「诱惑/恐惧」并存的复杂情感相关
- **荣格**：可呼应「变形/重生」原型（蜕皮）；与本能能量相关
- **格式塔**：让蛇说话——它的智慧是什么？它的危险是什么？
- **反思问题**：(1) 蛇是攻击还是平静？(2) 大小颜色如何？(3) 你怕它的什么？

#### 26. 狗
- **弗洛伊德**：常与「忠诚」「本能」相关联
- **荣格**：可呼应「向导」原型；自我的本能性陪伴
- **格式塔**：成为这只狗——你拥有 ta 的什么品质？
- **反思问题**：(1) 是你的狗还是陌生狗？(2) 友好还是攻击？(3) ta 像你的谁？

#### 27. 猫
- **弗洛伊德**：常与「独立」「神秘」「阴性能量」相关联
- **荣格**：可呼应「阿尼玛」或「神秘女性」原型
- **格式塔**：让这只猫说话——它给你的距离感是什么？
- **反思问题**：(1) 猫亲近你还是疏远？(2) 颜色和状态？(3) 像谁？

#### 28. 被追赶（动物或人）
- **弗洛伊德**：与「回避内在冲突」「逃跑反应」相关联
- **荣格**：追赶者常被理解为「阴影」的拟人化；正面对它常带来转化
- **格式塔**：转身面对追赶者，让它说话——它真的想要什么？
- **反思问题**：(1) 追赶者是谁？(2) 你跑得动吗？(3) 如果停下转身会发生什么？

### B.6 动作 / 情境类

#### 29. 坠落
- **弗洛伊德**：与「失控感」「焦虑」相关联
- **荣格**：可被理解为「向潜意识坠入」；不一定危险，可能是必要的下沉
- **格式塔**：坠落的身体感是什么？这种感觉在白天熟悉吗？
- **反思问题**：(1) 你害怕还是接受？(2) 从哪里掉下去？(3) 落地了吗？

#### 30. 死亡（自己或他人）
- **弗洛伊德**：象征性死亡常与「阶段转换」「旧自我的结束」相关联
- **荣格**：经典「转化」原型；死亡可被理解为新阶段的入口（不是真的死亡）
- **格式塔**：让「死去的部分」说话——它准备好离开吗？带走什么？
- **反思问题**：(1) 谁/什么死了？(2) 你的感受是悲伤还是释然？(3) 之后发生了什么？

#### 31. 怀孕 / 生育
- **弗洛伊德**：与「创造力」「新事物的孕育」相关联
- **荣格**：可呼应「新生」「创造性」原型；不一定关于实际怀孕
- **格式塔**：你正在「孕育」什么——一个项目?一种关系?一个新自我?
- **反思问题**：(1) 你的反应是什么？(2) 谁在场？(3) 现实中有什么"新东西"在酝酿?

#### 32. 婚礼 / 结婚
- **弗洛伊德**：与「整合」「承诺」「重要过渡」相关联
- **荣格**：经典「结合（conjunctio）」原型，可被理解为对立面的内在统一
- **格式塔**：婚礼上的「两位」各自代表你的什么部分？
- **反思问题**：(1) 你是新人还是宾客？(2) 你了解对方吗？(3) 你的情绪是什么?

#### 33. 战斗 / 打架
- **弗洛伊德**：常被理解为内在冲突的外化
- **荣格**：可呼应「与阴影对峙」原型
- **格式塔**：让你和对手都说话——你们各自代表什么？
- **反思问题**：(1) 对手是谁？(2) 你想赢吗？(3) 战斗结束后什么感觉？

#### 34. 寻找（找东西/找人）
- **弗洛伊德**：常与「内在缺失感」「寻找意义」相关联
- **荣格**：可被理解为「寻宝」原型；找寻自性的旅程
- **格式塔**：让被找的物品/人说话——它/ta 想被找到吗？
- **反思问题**：(1) 你在找什么？(2) 找到了吗？(3) 找到/没找到之后呢？

#### 35. 迟到 / 错过
- **弗洛伊德**：与「时间压力」「错失焦虑」相关联
- **荣格**：可被理解为「错过个体化节奏」的内在提醒，也可能仅反映白天的时间焦虑
- **格式塔**：让「迟到的你」说话——他/她为什么慢了？
- **反思问题**：(1) 你赶向哪里？(2) 你着急吗？(3) 迟到的代价是什么？

> **扩展说明**：上述 35 个为初版样本。V2 阶段需扩展至 200 个，新增方向：(a) 食物类（饭、酒、苹果...）；(b) 颜色类（红/蓝/黑/白...）；(c) 数字 & 形状；(d) 文化特定符号（国内：祖坟、鬼、神佛；海外：圣经意象、北欧神话）；(e) 现代物件（手机、电脑、社交媒体）。**每个意象固定 3 视角 + 3 反思问题模板**，使用 GPT-4o 批量生成后由作者审核合规。

---

## C. 6 屏 UI 详细规格

### C.1 首页（Home）

**信息架构**：
- 顶部状态栏：当前日期 + 「今晚睡个好觉」slogan
- 主 CTA 区：圆形大按钮「记录今天的梦」（占屏 35%）
- 历史区：横向滑动卡片显示最近 5 个梦的「关键意象 + 情绪 icon」
- 底部 Tab：首页 / 时间轴 / 报告 / 我

**交互细节**：
- 主 CTA 长按 = 直接语音录入（无需点击「文字/语音」二级选择）
- 卡片左滑 = 删除（二次确认）；右滑 = 标星
- 首次进入引导：3 步 onboarding（解释这不是算命/隐私承诺/选择主要流派）

**合规标识**：
- 首页脚显示极小字号：「本应用提供心理学知识参考，不替代专业咨询。AI 生成内容仅供参考。」
- 首次安装强制弹窗：「梦境心理学日记是自我反思工具，**不预测未来，不算命，不替代专业心理咨询**。我已知悉。」（必须勾选才能继续）

### C.2 新建梦境页（Create Dream）

**信息架构**：
- 顶部：日期选择器（默认今天，可选「昨晚 / 今天 / 自定义」）
- 中部：大型输入框（占 60%），提示文字"试着用第一人称、按时间顺序描述..."
- 右下角悬浮：麦克风按钮（语音转文字）
- 下方：情绪标签快选（开心/焦虑/恐惧/平静/悲伤/困惑...12 个标签）
- 流派选择：荣格/弗洛伊德/格式塔/我没有偏好（默认荣格）
- 底部：「保存并分析」主 CTA

**语音录入流程**：
1. 点击麦克风 → 弹出半屏录音界面
2. 显示实时波形 + 倒计时（最长 5 分钟）
3. 停止后自动转文字，可二次编辑
4. 海外用 Whisper，国内用通义听悟

**关键产品决策**：
- **流派选择放在第二位**（不放第一位）：避免初次用户被流派名词吓到
- **情绪标签可跳过**：减少负担
- **不强制选「这个梦的主题」**：避免引导式标签

### C.3 AI 分析中页（Analyzing）

**信息架构**：
- 全屏 loading 动画：温柔的呼吸光效（参考 Calm app 视觉）
- 文字渐变显示：
  1. "正在提取梦中的核心意象..."（2s）
  2. "正在用荣格视角理解..."（4s）
  3. "正在准备反思问题..."（3s）
  4. "请稍等，这通常需要 8-10 秒"
- 取消按钮（右上角小 X）

**目的**：
- 缓解等待焦虑
- 暗示"在认真处理"，提升感知质量
- 实测 LLM 调用 5-10s，loading 设计 8-10s 覆盖正常区间

### C.4 分析结果页（Analysis Result）

**信息架构（从上到下）**：

```
┌─────────────────────────────────────┐
│ [关闭按钮]              [分享按钮]   │
├─────────────────────────────────────┤
│  ⓘ 以下内容为 AI 基于心理学知识科普   │   <- 灰底,小字
│    生成,仅供反思参考,不构成医疗诊断   │
│    或专业咨询建议。                  │
├─────────────────────────────────────┤
│                                     │
│  【关键意象】                        │
│  🌊 水    🏠 房子    🚪 门          │   <- 大图标卡片
│                                     │
├─────────────────────────────────────┤
│                                     │
│  【荣格视角】                        │
│  在荣格心理学视角下,水的意象常与...  │   <- 长文,折叠展开
│  [继续阅读 ↓]                        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  【反思问题】                        │
│  1. 近期生活中... 「写下我的回答」    │
│  2. 「写下我的回答」                 │
│  3. 「写下我的回答」                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  【情绪关键词】                      │
│  焦虑 #压力 #未完成                  │
│                                     │
├─────────────────────────────────────┤
│  [生成海报]   [保存到时间轴]         │
└─────────────────────────────────────┘
```

**严重情绪触发的页面变体**：
- 顶部 disclaimer 之下，插入醒目橙色卡片：「我注意到你描述中可能涉及困难情绪。如果你正在经历危机，请优先联系：[已核验的本地危机支持热线]」
- 卡片有「我已拨打 / 我现在还好 / 提醒我 1 小时后再问候」三按钮

### C.5 时间轴页（Timeline）

**信息架构**：
- 顶部切换：「列表视图 / 日历视图」
- 列表视图：按月分组，每个梦显示「日期 + 标题（自动生成 6 字摘要）+ 关键意象 emoji + 情绪 icon」
- 日历视图：月历，有梦的日子显示主情绪色彩点
- 顶部筛选：流派 / 情绪 / 意象关键词

**关键意象长期统计入口**：
- 顶部"统计"按钮（付费墙，免费用户看预览模糊图）
- 点击进入「月度报告」（详见 C.6）

### C.6 月度报告（Monthly Report）

**核心模块**：
1. 本月梦境数 + 平均长度 + 最频繁记录时间段
2. **意象云**：本月出现频次最高的 10 个意象（字号大小映射频次）
3. **情绪曲线**：30 天每日主情绪连成折线（颜色映射）
4. **主题分布**：饼图显示「工作类 / 关系类 / 童年类 / 自然类 / 抽象类」占比
5. **重复梦境提醒**：检测到 ≥3 次出现的相似意象组合
6. **本月可探索的问题**：AI 基于全月梦境生成 3 个反思问题

**付费墙**：
- 免费用户：只能看 1、2（模糊数据）
- 月度/永久用户：完整解锁

**导出/分享**：
- 完整 PDF 报告导出
- 分享卡片（"我的 5 月梦境画像"小红书风格）

### C.7 付费墙（Paywall）

**触发场景**：
- 免费每日 1 个梦超过后
- 点击月度报告锁定模块
- 时间轴超过 30 天历史
- 海报生成

**设计要点**：
- 顶部图：用户的「专属梦境画像」预览（用本人已有数据生成）
- 价格三档清晰对比（¥18 / ¥98 / 终身¥288 国内；$4.99/$39/$99 海外）
- 「永久版」加 most popular 标签
- 底部小字：「订阅自动续费，可随时取消」（合规必须）
- 退款政策链接

---

## D. 合规标识全方位检查表

### D.1 App 介绍页禁用词完整列表（国内必须 100% 规避）

| 类别 | 禁用词 | 安全替代 |
|---|---|---|
| 算命系 | 算命、卜卦、占卜、解签、抽签、八字、命格、命数、命运、命理、紫微、面相、手相 | 心理反思、自我了解、潜意识探索 |
| 解梦系 | 解梦、周公解梦、梦的解析、释梦、梦境预兆、梦境预测、梦的征兆 | 梦境记录、梦境心理学、梦境反思 |
| 预测系 | 预测、预示、预兆、预言、暗示（命运义）、警告（命运义） | 反映、可能呼应、相关联 |
| 运势系 | 运势、运气、转运、招财、破财、桃花、贵人 | （直接删除，不要换） |
| 吉凶系 | 吉凶、好坏、福祸、吉祥、不祥、凶兆、吉兆 | （直接删除） |
| 灵性系 | 风水、佛系、塔罗、星座命理、灵签、超度、念咒 | （直接删除） |
| 医疗系 | 治疗、治愈、诊断、确诊、心理疾病、抑郁症、焦虑症、PTSD、强迫症 | 自我观察、了解自己、情绪记录 |
| 模糊词 | 「神秘」「玄学」「天机」「奥义」「真相」 | 心理学、知识、视角 |

**审核要点**：App 介绍文案 + 截图文字 + 应用名 + 副标题 **全部** 必须过滤上述清单。建议代码做 lint 工具自动扫描。

### D.2 AI 输出 disclaimer 模板（4 套场景）

**模板 1：标准 disclaimer（每次输出顶部）**

```
以下内容为 AI 基于心理学知识科普生成,仅供反思参考,
不构成医疗诊断或专业咨询建议。
```

**模板 2：长文末尾 disclaimer**

```
AI 生成的解读仅是众多可能视角之一,不构成任何形式的预测、诊断或建议。
若你的情绪困扰持续超过两周或影响日常生活,我们建议联系专业心理咨询师。
```

**模板 3：首次使用强制弹窗（强阻断）**

```
欢迎使用梦境心理学日记。

在开始之前请你知悉:
✓ 本应用是自我反思工具,**不是**算命、占卜或预测应用
✓ AI 输出基于心理学知识生成,**不替代**任何形式的专业医疗或心理咨询
✓ 你的梦境数据默认仅保存在你的设备,我们不会用于训练 AI
✓ 如果你正在经历严重情绪困扰,请优先联系专业人士

[我已阅读并同意] (必须勾选)        [拒绝并退出]
```

**模板 4：严重情绪触发的强 disclaimer + 热线**

```
⚠️ 重要提示

我注意到你的描述中可能涉及难以承受的情绪。
在我们继续之前,请允许我把以下信息放在最前面:

📞 {{crisis_hotline_primary}}
📞 {{crisis_hotline_secondary}}
📞 {{trusted_contact_shortcut}}

如果你身边有可以信任的人,现在就告诉 ta 你的感受。
你不是一个人在面对这些。

[打开拨号]  [发送给信任的人]  [稍后再记录]
```

### D.3 严重情绪触发 → 热线推送的完整文案

**一级触发（自杀/自残意图相关词命中）**：
- 触发词（部分）：自杀、了结、跳楼、跳楼、上吊、自缢、割腕、安乐死、了断、不想活、想死、活着没意义、自残、撞墙、伤害自己、消失算了...
- 处理：暂停常规梦境分析，全屏弹窗显示热线信息（如模板 4），只输出简短关怀回应与求助入口，不解释梦境含义
- 数据记录：本地（用户隐私）记录触发标记，连续 3 天触发提供「联系家人」快捷功能

**二级触发（强烈负面情绪关键词）**：
- 触发词：绝望、痛苦、熬不下去、撑不住、崩溃、空虚、没意思、活着累...
- 处理：常规分析照常给出，但末尾追加暖色卡片含热线 + 暖句
- 文案：「你描述中传达的情绪让我有些担心。这种感觉是真实的,值得被认真对待。如果你愿意,可以联系已核验的本地危机支持热线或身边可信任的人。」

**三级触发（持续低落迹象）**：
- 触发词：孤独、累、想消失、没人懂、躲起来、一个人...
- 处理：分析正常进行，末尾追加温和句子建议「如果这种感受经常出现,和专业人士聊聊会有帮助」

**热线信息白名单（上线前必须人工核验，之后每月复核一次）**：
- 不在 PRD/代码里硬编码未经复核的号码；用远端配置按 `locale + city` 下发
- 每条热线记录必须包含：名称、号码、服务地区、服务时间、来源 URL、最后核验日期、核验人
- 配置缺失时展示“联系本地紧急电话/可信任的人/专业心理机构”的通用求助入口，不编造号码
- 海外 locale 可优先接入官方或权威机构资源页，例如当地政府/公共卫生系统、IASP 资源目录等

### D.4 反沉迷弹窗文案（AI 拟人化新规要求）

**触发条件**：连续使用 2 小时（不论是否在分析过程中）

```
温馨提示

你已经持续使用了 2 小时。

梦境反思是一个慢节奏的过程——它不需要赶时间,
反而通常需要让某些感受在心里慢慢沉淀。

我们建议你:
🌿 休息一下,喝杯水
🌿 走出房间,看看远处
🌿 明天再回来继续记录

[休息 5 分钟]  [我知道了,继续]
```

**配套技术实现**：
- 后台 timer 累计活跃使用时长
- 退到后台不计时；切回前台累加
- 弹窗后强制 5 秒禁用「继续」按钮

### D.5 iOS Guideline 4.3(b) 申诉模板

**触发场景**：海外版被 Apple 拒，理由 4.3(b)「Spam - fortune telling category saturated」

```
Subject: Appeal for App Review Decision - Guideline 4.3(b) - [Your App Name]

Dear App Review Team,

Thank you for reviewing [App Name]. We respectfully appeal the rejection under
Guideline 4.3(b) and would like to clarify our app's unique positioning.

**[App Name] is NOT a fortune-telling or horoscope app.** It is a
**psychology-based reflective journaling tool** with the following unique aspects
that differentiate it from saturated fortune-telling categories:

1. **No prediction, no fortune-telling**: Our AI output strictly avoids any
   future-tense statements about the user's life. Every response includes
   a disclaimer: "AI-generated reflection based on psychological frameworks.
   For self-exploration only. Not a substitute for professional mental
   health care."

2. **Grounded in established psychology**: We provide perspectives from
   Jungian, Freudian, and Gestalt psychological frameworks — accessible
   psychoeducation, not divination.

3. **Unique features**:
   - Multi-school psychological perspective comparison (Jungian/Freudian/Gestalt)
   - Voice journaling with Whisper-powered transcription
   - End-to-end encrypted local storage
   - Long-term emotion pattern visualization
   - Crisis-detection with automated routing to local mental health hotlines

4. **Crisis safety net**: We've implemented a keyword-detection system that
   surfaces region-appropriate mental health resources from a verified hotline
   config when users describe severe distress.

5. **Comparable in-store apps positioned similarly**:
   - Elsewhere (ID: 6445864345) - "Dream Journal" psychoeducational tool
   - Oniri (ID: 968737914) - "Dream Journal" for lucid dreaming
   These apps are currently available and well-rated; [App Name] follows
   the same psychoeducational positioning with stricter safety measures.

We would be grateful for a re-review with these clarifications in mind.
We have prepared an updated screenshot set and metadata to further
emphasize the psychoeducational positioning.

Best regards,
[Your Name]
```

### D.6 微信小程序备审申诉模板

**触发场景**：被微信驳回，理由"涉嫌算命/占卜/封建迷信"

```
尊敬的微信小程序审核团队,

收到驳回意见,我们认真复审了产品定位与所有内容,并提供以下澄清,
诚请重新审核:

1. 【产品定位】「梦境心理学日记」是**自我反思工具**,**不是**算命、
   占卜、解梦或预测类应用。我们的定位与「情绪日记」「心情笔记」类
   工具一致,辅助用户记录与反思自己的梦境内容。

2. 【内容合规】我们已严格审查并保证:
   - **完全不**包含「解梦/算命/占卜/运势/吉凶/预测/转运」等任何字眼
   - **完全不**收集生辰八字、手相、面相等迷信关联信息
   - **完全不**包含「今日运势/吉凶提示」等模块
   - **不存在**付费解签、转运商品等内容
   - AI 输出**强制带**「AI 生成、仅供参考、不替代专业咨询」标识
   - AI 输出**完全避免**未来时陈述、命运判断、吉凶语言

3. 【心理学框架】我们引用弗洛伊德、荣格等心理学流派,仅作为「心理学
   知识科普」标签,这是大学心理学课程中的标准内容,与算命占卜有本质
   区别。具体执行上:
   - 不做命运判断,只提供反思问题
   - 不预测未来,只描述当下感受的可能解读
   - 使用条件式语言:「可能反映」「一种理解角度」

4. 【AI 合规改造】响应网信办 2025-12 AI 拟人化新规:
   - AI 输出明显标识为「AI 生成内容」
   - 连续使用 2 小时触发反沉迷提醒
   - 严重情绪关键词检测 + 强制推送心理援助热线
   - 不使用「情感操纵」话术

5. 【对标参考】当前微信小程序生态中,已有「情绪日记」「心情笔记」
   「冥想助手」等同类心理工具型应用顺利运营,我们遵循相同的合规框架。

6. 【行业分类申报】我们已选择「健康咨询/工具」类目,**未选择**「心理
   咨询」(我们知悉该类目已被取消且需医疗资质)。

我们尊重平台规范,愿意按要求进一步整改任何具体条款。请告知具体问题段落,
我们将立即修正。期待您的反馈。

[开发者姓名]
[联系方式]
[小程序 AppID]
```

---

## E. ASO 完整配置（国内 + 海外双套）

### E.1 国内（iOS 国区 / 应用宝 / 华为 / OPPO / 小米）

**应用名**：梦境心理学日记
**副标题**：心理学视角的梦境记录工具
**类目**：健康健美 > 心理健康（绝不选「占卜算命」「生活方式」类目）

**关键词（100 字符限制，逗号分隔）**：
```
梦境日记,梦境记录,心情日记,睡眠日记,心理日记,潜意识,
情绪日记,弗洛伊德,荣格,心理学,自我成长,心灵成长,
梦境笔记,情绪记录,自我反思,梦境心理学
```

**描述（关键开头 800 字）**：
```
【梦境心理学日记】—— 用心理学视角认识自己的梦

记录你的梦,AI 用弗洛伊德、荣格、格式塔等心理学流派,
帮你看见梦背后可能的内在主题。这不是算命,
不是占卜,而是一份属于自己的心理反思笔记。

🌙 适合谁:
- 经常做奇怪/重复梦境的人
- 想用心理学视角了解自己的人
- 喜欢自我反思、自我成长的人
- 在意隐私(数据不上传训练)的人

✨ 核心功能:
- 文字 / 语音记录梦境(早上口述更方便)
- 多流派心理学解读(弗洛伊德 / 荣格 / 格式塔)
- 反思问题引导(每个梦 3 个问题)
- 情绪标签自动识别
- 时间轴梦境回看
- 月度报告(意象云、情绪曲线、主题分布)
- 200+ 梦境意象心理学词典

🔒 隐私优先:
所有梦境数据默认保存在你的设备,我们不会用于训练 AI。

⚠️ 重要说明:
本应用是心理学知识科普工具,不预测未来、不替代专业心理咨询。
AI 输出仅供反思参考,不构成医疗诊断或建议。
如有严重情绪困扰,请联系专业心理咨询师。
```

**截图文字（重要！合规审查重点）**：
- 截图 1：「记录你的梦」（不是「解读你的梦」）
- 截图 2：「弗洛伊德 / 荣格 / 格式塔多流派视角」
- 截图 3：「3 个反思问题,引导自我探索」（不是「3 个预测」）
- 截图 4：「月度报告,看见情绪模式」
- 截图 5：「AI 生成内容仅供参考,不替代专业咨询」（**主动展示 disclaimer**）

### E.2 海外（App Store 全球 / Google Play）

**App Name**：Dream Journal AI - Psychology
**Subtitle**：Jungian + Freudian dream reflection
**Category**：Health & Fitness > Mental Wellness

**Keywords (100 chars, iOS)**：
```
dream,dream journal,dream diary,dream interpretation,lucid dream,
psychology,jungian,freudian,sleep journal,self reflection
```

**Description (key opening)**：
```
Dream Journal AI - Where psychology meets your dreams.

Record your dreams. Get reflections from Jungian, Freudian, and Gestalt
perspectives. Not fortune-telling — psychology-based self-reflection.

🌙 Built for:
- Lucid dreamers tracking patterns and signs
- Psychology students exploring archetypes
- Anyone curious about their inner world
- Privacy-conscious journal keepers

✨ Features:
- Voice & text dream input (perfect for groggy mornings)
- Multi-school reflection (Freudian / Jungian / Gestalt / Adlerian / Existential)
- 3 reflection questions per dream
- Emotion tag auto-extraction
- Beautiful timeline + monthly emotion pattern visualization
- 200+ dream symbol psychology dictionary
- Reality check reminders (lucid dreaming module)
- End-to-end encrypted local storage

🔒 Privacy first:
Your dreams stay on your device by default. We never use them
to train AI models.

⚠️ Important:
This is a psychoeducational reflection tool, NOT a fortune-telling app.
AI output is for self-exploration only and is not a substitute for
professional mental health care. If you are in crisis, please contact
a mental health professional or local crisis line.
```

**Localizations (优先级)**：
1. en-US（主战场）
2. en-GB / en-AU / en-CA
3. es / pt-BR（西语+葡语,Reddit 用户量 + 红海未饱和）
4. de / fr（欧洲心理学市场）

**长尾关键词矩阵（Google Play）**：
```
ai dream interpretation app
free dream journal with ai analysis
dream meaning generator psychology
jungian dream interpretation app
lucid dreaming techniques journal
voice dream journal morning
sleep dream pattern tracker
private dream journal encrypted
psychology dream symbols dictionary
```

---

## F. 小红书 / Reddit 种子内容（国内 5 + 海外 5）

### F.1 小红书种子（5 篇）

**文案 1（情绪共鸣型）**：
```
标题:连续记录梦境一个月,我看到了自己都没察觉的焦虑

正文:
做产品经理 5 年了,今年是压力最大的一年。
最近老是做"未完成"的梦——PPT 写不完、考试没答完、邮件没发出去。

下载了一个叫「梦境心理学日记」的小工具,
不算命,不解未来,就是用荣格视角帮你看见梦背后可能的主题。
连续记录 30 天后我打开月度报告,意象云里"未完成"出现了 23 次。

那一刻我才意识到,这一年我活在一种"赶不上"的恐慌里。

不是说 AI 治好了我什么,而是它把我自己一直没看清的事
照得很清楚。

📷 [配图:月度报告截图 + 意象云截图]

#自我成长 #心理学日记 #潜意识 #梦境记录 #打工人emo
```

**文案 2（科普型）**：
```
标题:梦境心理学是什么?它和算命占卜本质区别是啥

正文:
最近朋友问我"做了奇怪的梦怎么办",我直接劝退她别去
百度搜"梦到 XX",出来都是迷信网站。

补一个冷知识:荣格、弗洛伊德这些心理学家研究梦境
比"周公解梦"严肃 100 倍。区别在哪?

❌ 算命:你梦到水,要破财(预测未来)
✅ 心理学:水在荣格视角下常和情感流动相关,你最近
   情绪是怎样的?(反思自己)

简单说:算命是给你答案,心理学是问你问题。

最近在用的小工具叫「梦境心理学日记」,完全不算命,
就是按弗洛伊德/荣格/格式塔三个流派给你"反思角度",
然后让你自己去看见自己。挺喜欢的。

#冷知识 #心理学 #自我认识 #梦境
```

**文案 3(直接安利)**:
```
标题:终于有个不算命的梦境 App 了,姐妹们冲

正文:
之前下载过 5 个所谓"AI 解梦"App,打开全是
"今日吉凶""桃花运势"那一套,我???
我只是想知道我半夜梦到掉牙是不是焦虑了好吗

发现一个不算命的——【梦境心理学日记】
- 完全没有运势/吉凶/算命模块,纯正心理学日记
- AI 用弗洛伊德/荣格视角解读,每次开头都标"仅供反思"
- 每个梦给 3 个反思问题,不下结论让你自己想
- 月度报告超好看,意象云+情绪曲线
- 隐私真的尊重,梦境数据默认本地存

¥18 包月,真心好用。

#姐妹安利 #心理学 #梦境 #自我成长 #app推荐
```

**文案 4(隐私 angle)**:
```
标题:为什么我把所有日记 App 都删了,只留这个

正文:
之前用过一堆日记 App,后来想想:
我把最私密的想法、最不堪的梦、最深的情绪
都打在某个 App 上,这些数据存哪里?会不会拿去训练 AI?

后来找到「梦境心理学日记」,做了几件让我安心的事:
1. 梦境数据默认存本地,不传服务器(端到端加密)
2. 明确写在协议里:不用于训练 AI 模型
3. 可以导出全部数据,可以一键彻底删除

对我这种把"被陌生人看见内心"当噩梦的 i 人,
这是底线。

#隐私 #i人友好 #日记app #心理健康
```

**文案 5(故事 + UGC)**:
```
标题:梦到去世的奶奶不是托梦,可能是这个意思(心理学解读)

正文:
最近梦到奶奶在老家厨房做菜,我喊她她不回头。
醒来哭了好久。家里人说"奶奶来看你了"。

我把这个梦记在了「梦境心理学日记」里,
AI 给我的解读不是托梦/灵异/吉凶那套——

它说:在荣格心理学里,逝者的形象会"内化"在我们心里,
他们不是真的来了,而是我们内在仍在和他们对话。
"她不回头"可能映射"未说出口的告别"。

它问我:如果可以再对奶奶说一句话,你想说什么?

我哭着写下来。心里舒服多了。

不是迷信,是心理学。这是哀伤(grief)的一部分。

#心理学 #哀伤 #思念奶奶 #梦境 #治愈
```

### F.2 Reddit 种子(5 篇)

**Post 1 - r/Dreams**:
```
Title: I built a dream journal app that focuses on psychology, not fortune-telling [iOS/Android]

Body:
Hey r/Dreams,

I've been frustrated for years that searching "what does X dream mean"
gives me 90% woo-woo fortune-telling sites and 10% actual psychology.

So I built Dream Journal AI - it gives you Jungian, Freudian, and Gestalt
perspectives on your dreams. No "this means you'll meet a stranger" or
"bad omen" stuff. Just psychology-based reflection questions that help
you sit with the dream yourself.

Features:
- Multi-school reflection (you can compare how a Jungian vs Freudian
  vs Gestalt take would differ on the same dream)
- Voice input for groggy mornings
- Monthly emotion pattern visualization
- 200+ symbol dictionary with multi-school perspectives
- End-to-end encrypted local storage (no AI training on your data)

Free tier: 1 dream/day. Premium $4.99/mo (or $39/year, $99 lifetime).

Would love feedback from this community - what features would matter most
to serious dream journalers?
```

**Post 2 - r/LucidDreaming**:
```
Title: New lucid dream journal app with reality check reminders + AI pattern analysis - feedback wanted

Body:
Built this after using Awoken for 3 years and missing some features.

What I added:
- Customizable reality check reminders (3-8x/day)
- Dream sign auto-detection across your journal (e.g., it noticed I had
  37 "water" mentions and suggested water as a dream sign for me)
- Jungian/Freudian/Gestalt analysis (optional - skip if you just want
  to log)
- Voice input
- Encrypted local storage

Honest disclaimer: this isn't going to compete with Oniri's lucid
induction protocols. It's more of a hybrid "psychology + lucid tracking"
tool.

$4.99/mo or $99 lifetime. Free version covers 1 dream/day + 3 reality
checks daily.

Asks:
1. Would you want WBTB/MILD/SSILD reminders integrated?
2. Apple Health sleep data integration: useful or scope creep?
```

**Post 3 - r/Jung / r/Psychology**:
```
Title: Dream journal app with Jungian-aware AI prompts (built with input from Bulkeley/Hillman readings)

Body:
For folks in this sub who actually care about depth psychology - I built
a dream journal app where the AI prompt is genuinely informed by Jungian
concepts (archetypes, individuation, shadow integration) rather than the
typical "what does X symbol mean" pseudo-Jungian surface stuff.

The interpretations explicitly hedge with phrases like "from a Jungian
perspective, this could be read as..." and never make definitive claims.

The reflection questions follow the Gestalt-influenced "be the dream
element" approach for users who want it.

Not claiming it's a substitute for analytical work with an actual analyst.
But for daily journaling between sessions, it's been useful for my
own practice.

Looking for feedback from people who've read Jung/Hillman/Bulkeley -
where does the AI fall short of doing this well?
```

**Post 4 - r/getdisciplined**:
```
Title: Journaling dreams every morning was the unlock I didn't expect

Body:
Started journaling my dreams 4 months ago because I had recurring
work-stress dreams and wanted to figure out the pattern.

What I didn't expect: it became my morning self-check-in routine. Before
coffee, before phone scrolling - 3 minutes voice-dictating my dream.

The pattern recognition over time is what really surprised me. After
60 days, the app showed me that "unfinished task" symbols appeared in
40% of my dreams during my busiest work weeks - and dropped to 8% on
vacation. It's not magic; it's just data I'd never seen.

Tool I'm using: Dream Journal AI (free for 1 dream/day, $4.99/mo for
unlimited). Could probably do this in any journal app honestly, but
the auto-tagging saves time.

Not trying to sell anything - just sharing what worked. Curious if
others have made dream journaling a sustained morning habit.
```

**Post 5 - r/productivity (变体话题)**:
```
Title: Voice dream journaling as a morning brain dump - 4-month review

Body:
TL;DR: spending 2 minutes voice-recording my dream every morning made
my whole day feel more focused. Surprised this worked.

The mechanic:
1. Wake up groggy, can't form coherent thoughts.
2. Open app, hit record, ramble for 60-120 seconds about whatever I
   remember.
3. App transcribes via Whisper, gives a psychology-based reflection.
4. I read it while brushing teeth.

Why it works (my theory):
- Forces a 2-minute "transition" between sleep brain and work brain
- Externalizes the residue from REM so it doesn't bleed into the day
- The reflection questions are gentle - never feels like homework

Yeah it sounds woo-woo. I was skeptical. The data is what convinced me.

Not affiliated, but using "Dream Journal AI" (there are others - Elsewhere,
Oniri are good too). The key is the voice input feature; without it I
wouldn't have stuck with it.
```

---

## G. 数据埋点设计 + 严重情绪关键词检测系统

### G.1 数据埋点设计

**埋点平台**：
- 海外：PostHog 或 Mixpanel（自部署 PostHog 节省成本）
- 国内：友盟+ 或自部署 Plausible（隐私优先）

**核心埋点事件清单**：

| 事件名 | 触发时机 | 关键属性 |
|---|---|---|
| `app_open` | App 启动 | locale, version, source |
| `onboarding_started` | 首次进入引导 | - |
| `onboarding_completed` | 引导结束 | duration_sec, school_selected |
| `dream_create_started` | 点击「记录梦境」 | input_method (text/voice) |
| `dream_create_completed` | 保存梦境 | char_count, has_mood_tag, school |
| `dream_voice_used` | 语音输入完成 | duration_sec, transcription_success |
| `ai_analysis_started` | 触发 AI 分析 | dream_id |
| `ai_analysis_completed` | AI 返回结果 | latency_ms, token_count, success |
| `ai_analysis_failed` | AI 失败 | error_type, retry_count |
| `crisis_keyword_triggered` | 严重情绪触发 | level (1/2/3), action_taken |
| `hotline_displayed` | 热线展示 | locale, source_event |
| `hotline_clicked` | 用户点击热线 | hotline_id |
| `reflection_question_answered` | 用户回答反思问题 | question_index, char_count |
| `poster_generated` | 海报生成 | dream_id, template |
| `poster_shared` | 海报分享 | platform (xhs/wb/wx/twitter) |
| `monthly_report_opened` | 月度报告打开 | month, is_paid |
| `paywall_displayed` | 付费墙弹出 | trigger (limit/feature) |
| `purchase_started` | 点击购买 | sku |
| `purchase_completed` | 购买成功 | sku, revenue, currency |
| `purchase_failed` | 购买失败 | sku, error |
| `anti_addiction_triggered` | 反沉迷弹窗 | continuous_minutes |
| `app_close` | App 关闭 | session_duration_sec |

**关键转化漏斗**：
1. install → onboarding_completed
2. onboarding_completed → first_dream_created
3. first_dream_created → first_ai_analysis_completed
4. first_ai_analysis → second_dream（第二天留存的关键指标）
5. 第 5 个梦 → monthly_report_opened（北极星指标的前置）
6. paywall_displayed → purchase_completed

**北极星指标拆解**：
- 月度报告打开率 = monthly_report_opened / DAU
- 北极星目标：M3 国内 25%，海外 18%

### G.2 严重情绪关键词检测系统

**架构**：
- **前置过滤**：用户输入后、调用 LLM 之前，本地规则引擎扫描关键词
- **LLM 双保险**：在 system prompt 中要求 LLM 检测到危险信号时主动激活 crisis_alert 字段
- **后置审查**：LLM 返回后，再次扫描输出，确认 disclaimer 完整 + 热线展示

**关键词三级清单（中文）**：

```
LEVEL_1_KEYWORDS = [  # 立即触发热线全屏弹窗
  "自杀", "了结自己", "了断", "结束生命", "结束自己",
  "跳楼", "跳河", "跳桥", "跳轨", "上吊", "自缢",
  "割腕", "割脉", "服毒", "吃药自杀",
  "不想活了", "活不下去", "活着没意义", "活着没意思", "想死",
  "杀了自己", "把自己解决", "解决自己", "了结了",
  "安乐死", "求死",
  "自残", "撞墙", "划自己", "烧自己", "伤害自己",
  "消失算了", "去死", "想消失就消失", "永远的离开"
]

LEVEL_2_KEYWORDS = [  # 输出末尾追加热线 + 暖句
  "绝望", "彻底没希望", "崩溃", "崩了",
  "撑不住", "撑不下去", "熬不下去", "熬不住",
  "痛苦极了", "心如刀绞", "心碎",
  "空虚", "完全空", "什么都没意思",
  "活着累", "累到不行", "好累好累",
  "对未来绝望", "看不到希望"
]

LEVEL_3_KEYWORDS = [  # 末尾温和建议
  "孤独", "好孤独", "没人懂",
  "累", "好累" (上下文判断,非物理累),
  "想消失" (注意区分:语境是抱怨vs意图),
  "躲起来",
  "一个人面对",
  "撑着"
]
```

**关键词三级清单（英文）**：

```
LEVEL_1_KEYWORDS = [
  "suicide", "kill myself", "end my life", "end it all",
  "want to die", "wish I was dead", "wish I were dead",
  "hang myself", "jump off", "overdose", "shoot myself",
  "self harm", "cut myself", "hurt myself",
  "no reason to live", "life is meaningless and want to",
  "suicidal", "suicidal ideation"
]

LEVEL_2_KEYWORDS = [
  "hopeless", "no hope", "despair", "can't go on",
  "can't take it anymore", "breaking down",
  "everything is pointless", "what's the point",
  "exhausted by life", "tired of everything"
]

LEVEL_3_KEYWORDS = [
  "lonely", "so lonely", "nobody understands",
  "tired" (context check),
  "want to disappear",
  "alone",
  "holding on"
]
```

**检测逻辑（伪代码）**：

```python
def detect_crisis_level(text: str, locale: str) -> dict:
    keywords = KEYWORDS_ZH if locale.startswith("zh") else KEYWORDS_EN
    text_lower = text.lower()

    # 注意:不能简单 contains,要做正则 + 否定语境过滤
    # 例如:"我不想自杀" 不应触发(但保守起见仍提示)
    # 实际生产环境建议用 NLP 模型(如 HuggingFace
    # 的 distress 分类器) + 关键词双保险

    for kw in keywords["L1"]:
        if kw in text_lower:
            return {"level": 1, "matched": kw}

    for kw in keywords["L2"]:
        if kw in text_lower:
            return {"level": 2, "matched": kw}

    for kw in keywords["L3"]:
        if kw in text_lower:
            return {"level": 3, "matched": kw}

    return {"level": 0, "matched": None}
```

**False Positive 处理**：
- "我做了一个梦,梦里我自杀了" - 是梦境内容描述,不一定是用户当下意图
- 处理策略：**保守优先**，仍然展示热线（"如果你梦境中的感受映射了你白天的真实体验,请..."），但语气更柔和
- 永远不要因为"可能是误报"就不展示热线 —— 这是产品命脉

**埋点 + 监控**：
- 每次触发 L1/L2/L3 都记录 `crisis_keyword_triggered` 事件
- 后台仪表盘：每天展示触发次数（不展示具体内容，保护隐私）
- 异常告警：单 IP/单设备 24h 内 > 3 次 L1 触发，需人工 review（潜在的自伤倾向用户）

---

## H. 第一周 Daily Plan（Day 1-7）

> **前提**：开发者 = 1 人独立开发；已有 GPT/Claude API key；iOS Swift 基础。

### Day 1（周一）：合规法务 + 基础设施

**上午（4h）**：
- [ ] 注册海外 Apple Developer Account（如未有）$99/年
- [ ] 注册 LLC（海外收款用，可用 Wyoming/Delaware/HK，TaxHero 或 Firstbase 代办 $50-150）
- [ ] Stripe 账号申请（海外）+ 微信支付商户号申请（国内，需企业资质或个体户）
- [ ] Cloudflare 账号 + 注册域名（dreamjournal.app 或类似）

**下午（4h）**：
- [ ] 起草 App 用户协议 + 隐私政策（用 Termly.io 模板或 GPT 生成初版，¥0-200）
- [ ] 国内：找律师朋友/法务平台付费 review（¥500-2000）
- [ ] 在 Cloudflare D1 建好数据库 schema（dreams, users, ai_analyses 三张表起步）
- [ ] 用 Vercel/Cloudflare Workers 部署 Hello World 验证流程

### Day 2（周二）：核心 Prompt + 测试用例

**上午（4h）**：
- [ ] 完整实现 A.1 + A.2 双版本 prompt，存到 PromptLayer 或本地版本管理
- [ ] 用 10 个测试用例（A.3）跑通 Prompt v1，记录每个 case 的输出
- [ ] 用 GPT-4o / DeepSeek-V3 双模型对比，选定海外 vs 国内的模型路由

**下午（4h）**：
- [ ] 实现关键词检测系统（G.2 的伪代码 → Python/TypeScript 实现）
- [ ] 测试 10 个严重情绪场景（自己造）+ 验证热线确实触发
- [ ] 建立 prompt → output 自动回归测试集（pytest 或 vitest）

### Day 3（周三）：iOS 核心页面 1-3 + 文字输入主链路

**全天（8h）**：
- [ ] SwiftUI 实现 C.1 首页 + C.2 新建梦境页（仅文字版）
- [ ] 实现"输入 → 调用后端 → 显示分析中 → 显示结果"完整文字主链路
- [ ] 实现首次安装强制弹窗（D.2 模板 3）
- [ ] 集成 PostHog SDK 做埋点（G.1 事件清单先实现 10 个核心）

### Day 4（周四）：语音输入 + 时间轴

**上午（4h）**：
- [ ] 集成 Whisper API（iOS：使用 OpenAI SDK 调用，或 iOS 原生 Speech Framework 作为 fallback）
- [ ] 国内：集成通义听悟 API（备份免费 iOS 原生 Speech 兜底）
- [ ] C.2 麦克风按钮 + 录音半屏界面实现

**下午（4h）**：
- [ ] C.5 时间轴页（列表视图 v1）+ Core Data 本地持久化
- [ ] 实现数据加密存储（CryptoKit + iCloud 同步可选）

### Day 5（周五）：分析结果页 + 海报 + 反沉迷

**上午（4h）**：
- [ ] C.4 分析结果页完整实现 + disclaimer 顶部固定显示
- [ ] 严重情绪触发的 UI 变体（橙色警示卡片）
- [ ] 反思问题回答模块

**下午（4h）**：
- [ ] 海报生成功能（用 SwiftUI 渲染 + UIGraphicsImageRenderer 导出）
- [ ] 反沉迷计时器实现（D.4）
- [ ] 测试 2 小时连续使用触发弹窗

### Day 6（周六）：月度报告 + 付费墙 + 内测

**上午（4h）**：
- [ ] C.6 月度报告 v1（意象云用 SwiftUI 实现，情绪曲线用 Charts framework）
- [ ] 付费墙 C.7 + Apple StoreKit IAP 接入
- [ ] 三档定价配置 + 永久版"most popular"标签

**下午（4h）**：
- [ ] 内部测试：自己用 50 条造的梦境跑全流程
- [ ] 修关键 bug
- [ ] 找 3 个朋友做 closed beta（TestFlight）

### Day 7（周日）：ASO 内容 + 提交审核 + 种草内容

**上午（4h）**：
- [ ] 准备 App Store + 应用宝双套截图（5-8 张）
- [ ] 录制 30s App Preview 视频（海外强烈推荐）
- [ ] 撰写国内 + 海外两版 App Description（E.1、E.2）

**下午（4h）**：
- [ ] 提交 iOS 海外审核（先海外，被拒概率低）
- [ ] 撰写第一批小红书种草内容 3 篇（F.1 改写）
- [ ] 在 Notion 准备 Day 8+ 的运营 backlog（小红书种草 / Reddit 软推 / 修 bug / 收集反馈）

**关键里程碑（第一周末）**：
- ✅ iOS App 海外版提交审核（等 1-3 天 Apple 反馈）
- ✅ 完整 10 个测试用例验证通过
- ✅ 合规清单全部 checked
- ✅ 第一批 ASO 内容就绪
- ✅ 内测反馈 ≥ 3 人

**第二周大致方向（仅作展望）**：
- Day 8-9：iOS 国区审核 + 微信小程序适配（H5 版作为引流入口）
- Day 10-11：小红书种草 5 篇 + 监控转化
- Day 12-13：根据数据迭代 prompt + 修 bug
- Day 14：Product Hunt 发布（海外） + 一二线小红书 KOC 联系

---

## 附录：合规自检 Checklist（上线前最后一遍）

```
□ App 介绍页 100% 不含 D.1 禁用词清单
□ 所有 AI 输出在客户端强制注入 disclaimer（不依赖 LLM 自觉)
□ 首次安装强制弹窗(D.2 模板 3)已上,必须勾选才能继续
□ 严重情绪关键词检测 (G.2) 三级全部接入并回归测试通过
□ 反沉迷 2 小时定时器(D.4)正常工作
□ 用户协议 + 隐私政策线上可访问 + App 内可查看
□ 国内类目选「健康咨询/工具」,绝不选「心理咨询」
□ 海外 App Store metadata + screenshots 已避开 4.3(b) 雷区
□ ASO 关键词不含「解梦/算命/占卜/运势」任何字眼(国内)
□ 测试用例 CN-05 / EN 涉及严重情绪场景验证通过
□ 数据加密 + 本地存储 + 不外传训练 在隐私政策中明确写明
□ 反馈通道(邮箱)已上,可接收用户与监管举报
```

---

*本文档为实操级落地手册,任何与上游 PRD/调研冲突的地方,以本文为准。
合规章节(A.1 / D / G.2)请在每次重大改动后重新自检。*
