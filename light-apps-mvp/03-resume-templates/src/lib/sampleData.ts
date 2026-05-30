import type { ResumeData } from './types';

let seq = 0;
/** 轻量唯一 id，避免引入 uuid 依赖 */
export function genId(prefix = 'i'): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq.toString(36)}`;
}

// 默认示例数据：新用户进来即所见所得，降低空白页焦虑、也是小红书截图素材。
export function createSampleData(): ResumeData {
  return {
    basics: {
      name: '林晓',
      title: '前端开发工程师',
      phone: '138-0000-0000',
      email: 'linxiao@example.com',
      city: '杭州',
      extras: '本科 · 计算机科学与技术 ｜ github.com/linxiao',
      summary: '3 段实习经历的应届生，熟悉 React 工程化，做过 2 个上线项目。',
    },
    education: [
      {
        id: genId('edu'),
        school: '某某大学',
        major: '计算机科学与技术',
        degree: '本科',
        start: '2021.09',
        end: '2025.06',
        detail: '主修：数据结构、操作系统、计算机网络、Web 开发\nGPA 3.8/4.0 · 专业前 10%',
      },
    ],
    work: [
      {
        id: genId('work'),
        company: '某互联网公司',
        role: '前端开发实习生',
        start: '2024.07',
        end: '2024.12',
        detail:
          '负责 B 端中后台 3 个核心模块的开发与重构\n主导列表虚拟滚动优化，长列表渲染耗时下降 60%\n沉淀 8 个团队通用组件，被 4 条业务线复用',
      },
    ],
    projects: [
      {
        id: genId('proj'),
        name: '校园二手交易小程序',
        role: '前端负责人',
        start: '2023.10',
        end: '2024.03',
        detail:
          '独立完成小程序前端，累计注册用户 5000+\n实现图片端侧压缩与本地缓存，首屏加载提升 40%\nGitHub 开源 200+ star',
      },
    ],
    skills: [
      { id: genId('sk'), name: 'React / TypeScript', level: '熟练' },
      { id: genId('sk'), name: 'Vite / Webpack 工程化', level: '熟练' },
      { id: genId('sk'), name: 'Node.js / 小程序', level: '了解' },
      { id: genId('sk'), name: 'Figma / 设计走查', level: '了解' },
    ],
    selfReview:
      '对前端工程化与性能优化有持续热情，习惯用数据衡量优化效果。\n学习能力强，能快速上手新框架并产出可复用沉淀。\n沟通主动，做过跨端协作，能独立负责模块从设计到上线。',
  };
}

/** 空白模板（用户点「清空重填」时用），保留每个 section 一条空条目方便填写 */
export function createEmptyData(): ResumeData {
  return {
    basics: {
      name: '',
      title: '',
      phone: '',
      email: '',
      city: '',
      extras: '',
      summary: '',
    },
    education: [
      { id: genId('edu'), school: '', major: '', degree: '', start: '', end: '', detail: '' },
    ],
    work: [{ id: genId('work'), company: '', role: '', start: '', end: '', detail: '' }],
    projects: [{ id: genId('proj'), name: '', role: '', start: '', end: '', detail: '' }],
    skills: [{ id: genId('sk'), name: '', level: '' }],
    selfReview: '',
  };
}
