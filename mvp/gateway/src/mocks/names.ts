/**
 * 01 起名 mock 数据 —— 1:1 移植自
 * mvp/products/01-ai-naming/lib/mockNames.ts
 */

export interface NameCandidate {
  full_name: string;
  given_name: string;
  pinyin_full: string;
  pinyin_tones: string;
  source_book: string;
  source_chapter: string;
  original_quote: string;
  char_meanings: Record<string, string>;
  explanation: string;
  style_tag: string;
  gender_fit: string;
  stroke_count: number;
  use_warning: string;
}

export const MOCK_BABY_NAMES_FEMALE: NameCandidate[] = [
  {
    full_name: '陈未央',
    given_name: '未央',
    pinyin_full: 'Chén Wèi Yāng',
    pinyin_tones: '2-4-1',
    source_book: '诗经',
    source_chapter: '小雅·庭燎',
    original_quote: '夜如何其，夜未央，庭燎之光',
    char_meanings: {
      未: '尚未、未来，含希望与展开',
      央: '中央、悠远，含从容长远',
    },
    explanation:
      '字义：未，尚未、未来，喻无限可能；央，悠远不尽。典故：出自《诗经·小雅·庭燎》"夜如何其，夜未央，庭燎之光"，写朝会前夜灯火通明、君臣肃穆的场景，"未央"被后世延伸为"长久、未尽"的象征，汉宫"未央宫"即由此得名。期许：愿宝宝的人生如未央长夜中那盏不灭的庭燎，岁月悠悠，光华不尽。',
    style_tag: '诗意自然',
    gender_fit: '女孩',
    stroke_count: 12,
    use_warning: '无',
  },
  {
    full_name: '陈思齐',
    given_name: '思齐',
    pinyin_full: 'Chén Sī Qí',
    pinyin_tones: '2-1-2',
    source_book: '论语',
    source_chapter: '里仁',
    original_quote: '见贤思齐焉，见不贤而内自省也',
    char_meanings: {
      思: '思考、思索',
      齐: '齐心、并肩、向贤者看齐',
    },
    explanation:
      '字义：思，深思熟虑；齐，向贤者看齐。典故：出自《论语·里仁》"见贤思齐焉，见不贤而内自省也"，是孔子教弟子的处世智慧，意为遇见优秀的人就想向其看齐，遇见不足之处则反观自身。期许：愿宝宝一生秉持向上向善的心，遇贤者思齐，遇不足自省。思齐二字端方大气，读来从容自信，是国学起名中最经久的女宝名字之一。',
    style_tag: '聪慧博学',
    gender_fit: '女孩',
    stroke_count: 23,
    use_warning: '无',
  },
  {
    full_name: '陈知微',
    given_name: '知微',
    pinyin_full: 'Chén Zhī Wēi',
    pinyin_tones: '2-1-1',
    source_book: '诗经',
    source_chapter: '小雅·节南山',
    original_quote: '知微知章，唯思唯念',
    char_meanings: {
      知: '知晓、明白、智慧通达',
      微: '细微、精妙、洞察入微',
    },
    explanation:
      '字义：知，通晓、明察；微，精妙、细致入微。典故：出自《诗经·小雅·节南山》"知微知章，唯思唯念"，意指既能明察微小，又能通晓显著之理。期许：愿宝宝既有敏锐的观察力，又有通达世事的智慧，从细微处见美好，从平凡中悟人生。名字读来轻柔含蓄，气质如清晨竹叶上的露珠，温润而灵慧。',
    style_tag: '温润灵气',
    gender_fit: '女孩',
    stroke_count: 21,
    use_warning: '无',
  },
  {
    full_name: '陈清辞',
    given_name: '清辞',
    pinyin_full: 'Chén Qīng Cí',
    pinyin_tones: '2-1-2',
    source_book: '楚辞',
    source_chapter: '九章·涉江',
    original_quote: '余幼好此奇服兮，年既老而不衰',
    char_meanings: {
      清: '清澈、清雅',
      辞: '言辞、文辞、华章',
    },
    explanation:
      '字义：清，清澈纯净；辞，文辞华章。典故：屈原《楚辞·九章·涉江》中以高洁奇服自况，其辞清华出尘，被后世奉为文心之典范，"清辞"即取楚辞清丽不染的文学气质。期许：愿宝宝的心性如清水般澄澈，所言所行皆如清辞般雅正动人。名字读来如水落玉盘，是诗意与文学气质兼具的女宝佳名。',
    style_tag: '古典优雅',
    gender_fit: '女孩',
    stroke_count: 24,
    use_warning: '无',
  },
  {
    full_name: '陈灵均',
    given_name: '灵均',
    pinyin_full: 'Chén Líng Jūn',
    pinyin_tones: '2-2-1',
    source_book: '楚辞',
    source_chapter: '离骚',
    original_quote: '名余曰正则兮，字余曰灵均',
    char_meanings: {
      灵: '灵秀、聪慧、灵动',
      均: '均衡、平正、和谐',
    },
    explanation:
      '字义：灵，聪慧灵秀；均，平和均衡。典故：出自《楚辞·离骚》"名余曰正则兮，字余曰灵均"，是屈原自述名字由来的著名诗句——"灵均"即屈原本人的字。期许：愿宝宝既有屈原般的灵秀才情，又有均衡平正的处事之道，于灵动中见沉稳，于聪慧中见淳厚。灵均二字带着楚辞的浪漫与古意，是女宝中难得不落俗套的名字。',
    style_tag: '诗意自然',
    gender_fit: '女孩',
    stroke_count: 14,
    use_warning: '无',
  },
];

export const MOCK_BABY_NAMES_MALE: NameCandidate[] = [
  {
    full_name: '陈修远',
    given_name: '修远',
    pinyin_full: 'Chén Xiū Yuǎn',
    pinyin_tones: '2-1-3',
    source_book: '楚辞',
    source_chapter: '离骚',
    original_quote: '路漫漫其修远兮，吾将上下而求索',
    char_meanings: {
      修: '修养、修炼、长远',
      远: '辽远、深远、志向高远',
    },
    explanation:
      '字义：修，修身养性；远，志在远方。典故：出自屈原《离骚》"路漫漫其修远兮，吾将上下而求索"，是中国文人最熟悉的求索精神宣言。期许：愿宝宝以求索者的姿态行走世间，不畏路途漫长，于困顿中坚持，于平淡中精进。修远二字既有楚辞的浪漫，又有男儿志在四方的开阔气象。',
    style_tag: '坚毅果敢',
    gender_fit: '男孩',
    stroke_count: 17,
    use_warning: '无',
  },
  {
    full_name: '陈承翊',
    given_name: '承翊',
    pinyin_full: 'Chén Chéng Yì',
    pinyin_tones: '2-2-4',
    source_book: '论语',
    source_chapter: '泰伯',
    original_quote: '士不可以不弘毅，任重而道远',
    char_meanings: {
      承: '承担、传承、承载',
      翊: '辅佐、辅助、护佑',
    },
    explanation:
      '字义：承，担当与传承；翊，辅佐与护持。典故：取意于《论语·泰伯》"士不可以不弘毅，任重而道远"——君子要有弘大刚毅之志去承担长远之任。期许：愿宝宝既能承担起家国与时代的重任，又有翊辅他人、成就团队的胸怀。承翊二字稳重大气，读来铿锵有力，适合期望孩子沉稳担当的家庭。',
    style_tag: '沉稳大气',
    gender_fit: '男孩',
    stroke_count: 19,
    use_warning: '无',
  },
  {
    full_name: '陈澈',
    given_name: '澈',
    pinyin_full: 'Chén Chè',
    pinyin_tones: '2-4',
    source_book: '唐诗',
    source_chapter: '韦应物·咏露珠',
    original_quote: '秋荷一滴露，清夜坠玄天',
    char_meanings: {
      澈: '清澈、通透、心境明朗',
    },
    explanation:
      '字义：澈，水至清而见底，引申为心境通透。典故：唐韦应物多以澈字状写露珠、寒泉之清，体现唐诗对"清澈"意境的钟爱。期许：愿宝宝有澈水般明净的内心，行事坦荡，思虑澄明，无论身处何境都能保持心灵的清亮。单字"澈"与陈姓搭配，两字均不重叠笔画，读来铿锵有韵，是唐诗气质的现代化呈现。',
    style_tag: '古典优雅',
    gender_fit: '男孩',
    stroke_count: 14,
    use_warning: '无',
  },
  {
    full_name: '陈在川',
    given_name: '在川',
    pinyin_full: 'Chén Zài Chuān',
    pinyin_tones: '2-4-1',
    source_book: '论语',
    source_chapter: '子罕',
    original_quote: '子在川上曰：逝者如斯夫，不舍昼夜',
    char_meanings: {
      在: '存在、伫立、安住',
      川: '河川、川流、宽广',
    },
    explanation:
      '字义：在，立身存在；川，河川宽广。典故：出自《论语·子罕》"子在川上曰：逝者如斯夫，不舍昼夜"，是孔子立于川边对时间长河的著名感慨。期许：愿宝宝有如孔子立于川上般的胸襟与思考力，知光阴之贵，亦知志向之远。在川二字读来开阔，含哲思与气度，是从典籍中提炼出来的清隽之名。',
    style_tag: '沉稳大气',
    gender_fit: '男孩',
    stroke_count: 9,
    use_warning: '无',
  },
  {
    full_name: '陈砚之',
    given_name: '砚之',
    pinyin_full: 'Chén Yàn Zhī',
    pinyin_tones: '2-4-1',
    source_book: '唐诗',
    source_chapter: '李贺·李凭箜篌引',
    original_quote: '吴丝蜀桐张高秋，空山凝云颓不流',
    char_meanings: {
      砚: '砚台、文房、沉淀',
      之: '助词，含古意与韵律',
    },
    explanation:
      '字义：砚，文房四宝之首，喻沉淀与积累；之，古典助词，调和音律。典故：唐李贺善以器物入诗，砚为文人案头不可少之物，象征着持续的修炼与文化的传承。期许：愿宝宝如砚台般沉静而蕴墨，于安静中积累深厚的内在，于岁月中显现温润的光泽。砚之二字读来清雅，避开了林森般的偏旁重叠，是男宝中既文气又不落俗的好名字。',
    style_tag: '古典优雅',
    gender_fit: '男孩',
    stroke_count: 12,
    use_warning: '无',
  },
];

const SURNAME_PINYIN_MAP: Record<string, string> = {
  陈: 'Chén', 李: 'Lǐ', 王: 'Wáng', 张: 'Zhāng', 刘: 'Liú',
  赵: 'Zhào', 周: 'Zhōu', 林: 'Lín', 朱: 'Zhū', 孙: 'Sūn',
  胡: 'Hú', 高: 'Gāo', 罗: 'Luó', 何: 'Hé', 郑: 'Zhèng',
  黄: 'Huáng', 杨: 'Yáng', 吴: 'Wú', 徐: 'Xú', 马: 'Mǎ',
  谢: 'Xiè', 田: 'Tián', 董: 'Dǒng', 萧: 'Xiāo', 程: 'Chéng',
  曹: 'Cáo', 袁: 'Yuán', 邓: 'Dèng', 许: 'Xǔ', 傅: 'Fù',
  沈: 'Shěn', 曾: 'Zēng', 彭: 'Péng', 吕: 'Lǚ', 苏: 'Sū',
  卢: 'Lú', 蒋: 'Jiǎng', 蔡: 'Cài', 贾: 'Jiǎ', 丁: 'Dīng',
  魏: 'Wèi', 薛: 'Xuē', 叶: 'Yè', 阎: 'Yán', 余: 'Yú',
  潘: 'Pān', 杜: 'Dù', 戴: 'Dài', 夏: 'Xià', 钟: 'Zhōng',
  汪: 'Wāng', 任: 'Rèn', 姜: 'Jiāng', 范: 'Fàn', 方: 'Fāng',
  石: 'Shí', 姚: 'Yáo', 谭: 'Tán', 廖: 'Liào', 邹: 'Zōu',
  熊: 'Xióng', 金: 'Jīn', 陆: 'Lù', 郝: 'Hǎo', 孔: 'Kǒng',
  白: 'Bái', 崔: 'Cuī', 康: 'Kāng', 毛: 'Máo', 邱: 'Qiū',
  秦: 'Qín', 江: 'Jiāng', 史: 'Shǐ', 顾: 'Gù', 侯: 'Hóu',
  邵: 'Shào', 孟: 'Mèng', 龙: 'Lóng', 万: 'Wàn', 段: 'Duàn',
  雷: 'Léi', 钱: 'Qián', 汤: 'Tāng', 尹: 'Yǐn', 黎: 'Lí',
  易: 'Yì', 常: 'Cháng', 武: 'Wǔ', 乔: 'Qiáo', 贺: 'Hè',
  赖: 'Lài', 龚: 'Gōng', 文: 'Wén',
};

const COMPOUND_SURNAMES: Record<string, string> = {
  欧阳: 'Ōuyáng',
  司马: 'Sīmǎ',
  上官: 'Shàngguān',
  诸葛: 'Zhūgě',
  东方: 'Dōngfāng',
  皇甫: 'Huángfǔ',
  尉迟: 'Yùchí',
  公孙: 'Gōngsūn',
};

function computeSurnamePinyin(surname: string): string {
  if (surname.length === 2 && COMPOUND_SURNAMES[surname]) return COMPOUND_SURNAMES[surname]!;
  return SURNAME_PINYIN_MAP[surname] ?? surname;
}

export function buildMockNames(surname: string, gender: '男孩' | '女孩'): NameCandidate[] {
  const template = gender === '男孩' ? MOCK_BABY_NAMES_MALE : MOCK_BABY_NAMES_FEMALE;
  return template.map((n) => ({
    ...n,
    full_name: n.full_name.replace(/^陈/, surname),
    pinyin_full: n.pinyin_full.replace(/^Chén/, computeSurnamePinyin(surname)),
  }));
}
