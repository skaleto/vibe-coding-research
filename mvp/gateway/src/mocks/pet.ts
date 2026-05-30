/**
 * 05 宠物心情卡片 mock 数据 —— 1:1 移植自
 * mvp/products/05-pet-cards/lib/mockScenarios.ts (+types.ts disclaimer)
 */

export type PetSpecies = 'cat' | 'dog' | 'unknown';

export interface PetCard {
  translation: string[];
  mood_tag: string;
  emoji_set: string[];
  disclaimer: string;
}

export const DISCLAIMER = '⚠️ 仅供娱乐，AI 生成宠物心情卡片';

export interface MockScenario {
  species: PetSpecies;
  name: string;
  card: PetCard;
}

export const MOCK_SCENARIOS: MockScenario[] = [
  {
    species: 'cat',
    name: '奶油',
    card: {
      translation: [
        '🐱 主人主人！奶油的饭碗又空啦！',
        '你昨晚答应的小鱼干呢？嘤嘤嘤~',
        '再不给就要绝食啦（开玩笑的嘿嘿）',
      ],
      mood_tag: '求食',
      emoji_set: ['🐱', '🍣', '😾'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '大黄',
    card: {
      translation: [
        '🐶 主人主人快蹲下来嘛~',
        '大黄今天表现可棒啦！',
        '求摸摸头 求摸摸头 嗷呜~',
        '不摸我就一直蹭你脚 (尾巴疯狂摇)',
      ],
      mood_tag: '撒娇',
      emoji_set: ['🐶', '💕', '🐾'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '豆豆',
    card: {
      translation: [
        '🐾 主人主人！窗外的世界在召唤豆豆！',
        '快开门嘛快开门嘛~',
        '外面有好闻的味道还有狗朋友们！',
        '答应你只出去 10 分钟（其实想玩一小时）',
      ],
      mood_tag: '想出门',
      emoji_set: ['🐾', '🚪', '🌳'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: 'Coco',
    card: {
      translation: [
        '🐶 汪汪汪！门外有人！是坏人吗？',
        'Coco要保护妈妈！谁都别想进来！',
        '（瑟瑟发抖中假装很凶）',
      ],
      mood_tag: '警惕',
      emoji_set: ['🐶', '🚪', '😤'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '布丁',
    card: {
      translation: [
        '🐱 主人~ 布丁今天乖乖等了你一整天~',
        '过来摸摸头嘛 摸摸头嘛~',
        '只要 3 分钟就好（5 分钟也行 10 分钟更好）',
        '（呼噜呼噜启动）',
      ],
      mood_tag: '求摸摸',
      emoji_set: ['🐱', '🥺', '💕'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '阿橘',
    card: {
      translation: [
        '😾 哼！又是加班是吗？',
        '阿橘等了你一整天 你就这样对我？',
        '今晚的呼噜声没了 自己反省去！',
        '（其实偷偷瞄了你 8 次）',
      ],
      mood_tag: '抱怨',
      emoji_set: ['😾', '💢', '🌙'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '雪团',
    card: {
      translation: [
        '💤 嘘~ 别吵别吵',
        '雪团正在追梦 不要打扰',
        '今天的梦里有满满的小鱼干呢~',
      ],
      mood_tag: '困倦',
      emoji_set: ['💤', '🐱', '🌙'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '小鱼干',
    card: {
      translation: [
        '🐱 主人快看快看！盘子里那是什么！',
        '是小鱼干吗？是小鱼干对不对？',
        '小鱼干 就是小鱼干本人想吃小鱼干啦~',
        '（眼睛瞪到最大）',
      ],
      mood_tag: '求食',
      emoji_set: ['🐱', '🍣', '👀'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '馒头',
    card: {
      translation: [
        '☀️ 早安啦主人！太阳出来啦！',
        '馒头今天能量满满！',
        '一起去散步好不好嘛~',
        '今天会是超棒的一天哦！',
      ],
      mood_tag: '开心',
      emoji_set: ['☀️', '🐶', '✨'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '月亮',
    card: {
      translation: [
        '🌙 主人 月亮要睡觉啦~',
        '今天玩得好开心呢~',
        '晚安啦 明天还要继续要小鱼干哦~',
      ],
      mood_tag: '困倦',
      emoji_set: ['🌙', '💤', '🐱'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '阿喵',
    card: {
      translation: [
        '😾 哼！不理你了！',
        '阿喵的猫薄荷玩具被你弄丢了对不对？',
        '今晚的呼噜声没了！自己反省去！',
      ],
      mood_tag: '闹脾气',
      emoji_set: ['😾', '💢', '🧶'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '球球',
    card: {
      translation: [
        '🎾 主人主人！球球的球呢？',
        '快扔过来快扔过来！',
        '球球今天还没玩够呢！',
        '再扔 100 次就好！',
      ],
      mood_tag: '开心',
      emoji_set: ['🎾', '🐶', '✨'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '西瓜',
    card: {
      translation: [
        '🚪 主人主人快开门！紧急情况！',
        '西瓜憋不住啦~',
        '再不出去就要在地毯上解决啦！',
        '（认真严肃脸）',
      ],
      mood_tag: '想出门',
      emoji_set: ['🚪', '🐶', '💦'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '多多',
    card: {
      translation: [
        '🐶 主人主人！那是什么毛茸茸！',
        '多多想凑过去闻一闻可以吗？',
        '（小心翼翼伸爪试探）它会不会咬我呀...',
      ],
      mood_tag: '好奇',
      emoji_set: ['🐶', '🐱', '👀'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '团子',
    card: {
      translation: [
        '😾 哈！那个汪汪叫的是什么？',
        '团子表示不想理它',
        '快让它走 不然团子就要炸毛啦！',
        '（其实已经在炸毛了）',
      ],
      mood_tag: '警惕',
      emoji_set: ['😾', '🐶', '💢'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '镜镜',
    card: {
      translation: [
        '👀 咦？那只猫怎么和我长一样？',
        '镜镜伸手 它也伸手',
        '镜镜后退 它也后退',
        '这是新朋友吗？还是另一个镜镜？',
      ],
      mood_tag: '好奇',
      emoji_set: ['👀', '🐱', '✨'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '包子',
    card: {
      translation: [
        '🐶 主人你手里那是什么！不要靠近我！',
        '包子今天身体超级棒，不需要吃药药！',
        '（钻沙发底下进入战备状态）',
      ],
      mood_tag: '闹脾气',
      emoji_set: ['🐶', '💊', '🙅'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '雪糕',
    card: {
      translation: [
        '😾 不要不要不要！',
        '雪糕已经很干净了！',
        '那个会喷水的怪物快走开！',
        '（四爪疯狂蹬墙中）',
      ],
      mood_tag: '闹脾气',
      emoji_set: ['😾', '💦', '🙅'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'cat',
    name: '黑桃',
    card: {
      translation: [
        '😾 这个猫砂盆怎么 3 天没换了！',
        '黑桃表示非常嫌弃！',
        '再不清理就拒绝使用！',
        '（高傲转身离开）',
      ],
      mood_tag: '抱怨',
      emoji_set: ['😾', '💢', '🐾'],
      disclaimer: DISCLAIMER,
    },
  },
  {
    species: 'dog',
    name: '警长',
    card: {
      translation: [
        '🐶 汪汪汪！门外的脚步声！',
        '是坏人吗？是快递员吗？',
        '警长要保护这个家！',
        '（瑟瑟发抖中维持威严）',
      ],
      mood_tag: '警惕',
      emoji_set: ['🐶', '📦', '😤'],
      disclaimer: DISCLAIMER,
    },
  },
];

export function pickMockScenario(species: PetSpecies, name?: string): PetCard {
  const filtered =
    species === 'unknown'
      ? MOCK_SCENARIOS
      : MOCK_SCENARIOS.filter((s) => s.species === species);
  const pool = filtered.length > 0 ? filtered : MOCK_SCENARIOS;
  const fallback = pool[0]!;
  const idx = Math.floor(Math.random() * pool.length);
  const picked = pool[idx] ?? fallback;
  if (name && name.trim().length > 0) {
    const userName = name.trim();
    return {
      ...picked.card,
      translation: picked.card.translation.map((line) =>
        line.replace(new RegExp(picked.name, 'g'), userName),
      ),
    };
  }
  return picked.card;
}
