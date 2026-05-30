/**
 * 5 子产品的元数据。供首页 tab、各 [type] 页面共用。
 */

import type { NamingType } from './schema';

export type ProductConfig = {
  type: NamingType;
  emoji: string;
  title: string;
  shortTitle: string;
  description: string;
  cta: string;
  surnameLabel: string;
  surnamePlaceholder: string;
  genderLabel: string;
  /** 性别字段的选项；宝宝是男女，宠物是猫狗，公司是有限/股份等 */
  genderOptions: { value: '男孩' | '女孩'; label: string }[];
  vibeOptionLabel: string;
  vibeOptions: string[];
  /** placeholder for the illustration card */
  iconId: string;
  iconCaption: string;
  iconSpec: string;
};

export const PRODUCTS: Record<NamingType, ProductConfig> = {
  baby: {
    type: 'baby',
    emoji: '🍼',
    title: '宝宝起名',
    shortTitle: '宝宝',
    description: '怀孕到出生，用诗经楚辞给宝宝起一个有出处的名字',
    cta: '为宝宝起 10 个名字 →',
    surnameLabel: '宝宝的姓氏',
    surnamePlaceholder: '请输入姓氏，如：陈（支持复姓欧阳/司马）',
    genderLabel: '宝宝的性别',
    genderOptions: [
      { value: '男孩', label: '👶 男孩' },
      { value: '女孩', label: '👧 女孩' },
    ],
    vibeOptionLabel: '希望宝宝的名字给人什么感觉（最多选 3 个）',
    vibeOptions: [
      '温润灵气',
      '坚毅果敢',
      '聪慧博学',
      '活泼可爱',
      '沉稳大气',
      '诗意自然',
      '古典优雅',
      '现代清新',
    ],
    iconId: 'icon-baby',
    iconCaption: '宝宝起名 tab 图标',
    iconSpec: '婴儿襁褓 + 毛笔元素，正方形 256x256，米色背景',
  },
  company: {
    type: 'company',
    emoji: '🏢',
    title: '公司起名',
    shortTitle: '公司',
    description: '注册公司前，AI 帮您起 10 个不违规、寓意吉祥的字号',
    cta: '生成 10 个公司字号 →',
    surnameLabel: '公司字号偏好（可选）',
    surnamePlaceholder: '输入注册人姓氏或品牌简称，如：杭',
    genderLabel: '行业方向',
    genderOptions: [
      { value: '男孩', label: '🏭 科技 / 制造' },
      { value: '女孩', label: '☕ 文化 / 服务' },
    ],
    vibeOptionLabel: '希望字号传达什么气质（最多选 3 个）',
    vibeOptions: [
      '聪慧博学',
      '坚毅果敢',
      '沉稳大气',
      '现代清新',
      '诗意自然',
      '古典优雅',
    ],
    iconId: 'icon-company',
    iconCaption: '公司起名 tab 图标',
    iconSpec: '简约楼宇 + 印章元素，正方形 256x256',
  },
  pet: {
    type: 'pet',
    emoji: '🐱',
    title: '宠物起名',
    shortTitle: '宠物',
    description: '给毛孩子起一个诗意又好叫的名字',
    cta: '为宠物起 10 个名字 →',
    surnameLabel: '宠物物种（可选）',
    surnamePlaceholder: '猫 / 狗 / 兔 / 仓鼠 等',
    genderLabel: '宠物性别',
    genderOptions: [
      { value: '男孩', label: '♂ 公' },
      { value: '女孩', label: '♀ 母' },
    ],
    vibeOptionLabel: '希望名字是什么风格（最多选 3 个）',
    vibeOptions: ['活泼可爱', '诗意自然', '古典优雅', '现代清新', '温润灵气'],
    iconId: 'icon-pet',
    iconCaption: '宠物起名 tab 图标',
    iconSpec: '猫狗剪影 + 毛球 + 暖色调，正方形 256x256',
  },
  nickname: {
    type: 'nickname',
    emoji: '🎮',
    title: '网名起名',
    shortTitle: '网名',
    description: '为社交账号 / 游戏 ID 起一个有记忆点的网名',
    cta: '生成 10 个网名 →',
    surnameLabel: '想保留的字（可选）',
    surnamePlaceholder: '如真名首字 / 喜欢的字',
    genderLabel: '使用偏好',
    genderOptions: [
      { value: '男孩', label: '♂ 偏男性' },
      { value: '女孩', label: '♀ 偏女性' },
    ],
    vibeOptionLabel: '风格偏好（最多选 3 个）',
    vibeOptions: [
      '活泼可爱',
      '古典优雅',
      '现代清新',
      '诗意自然',
      '坚毅果敢',
      '聪慧博学',
    ],
    iconId: 'icon-nickname',
    iconCaption: '网名 tab 图标',
    iconSpec: '游戏手柄 + 文字气泡，正方形 256x256，年轻活泼',
  },
  penname: {
    type: 'penname',
    emoji: '✒️',
    title: '笔名 / 自媒体',
    shortTitle: '笔名',
    description: '做小红书 / 公众号 / B 站？为账号起一个专业笔名',
    cta: '生成 10 个笔名 →',
    surnameLabel: '内容方向（可选）',
    surnamePlaceholder: '读书 / 美妆 / 职场 / 旅行 等',
    genderLabel: '账号定位',
    genderOptions: [
      { value: '男孩', label: '✒ 中性 / 个人 IP' },
      { value: '女孩', label: '🌸 偏柔美' },
    ],
    vibeOptionLabel: '想要的笔名调性（最多选 3 个）',
    vibeOptions: [
      '诗意自然',
      '古典优雅',
      '现代清新',
      '聪慧博学',
      '温润灵气',
      '活泼可爱',
    ],
    iconId: 'icon-penname',
    iconCaption: '笔名 tab 图标',
    iconSpec: '钢笔 + 信纸 + 月亮，正方形 256x256，文艺感',
  },
};

export const PRODUCT_ORDER: NamingType[] = ['baby', 'company', 'pet', 'nickname', 'penname'];
