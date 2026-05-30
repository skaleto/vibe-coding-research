# 04 AI 梦境日记 MVP 实现 Proposal

## 为什么

`light-products/detail-04-dream-journal.md` 已细化国内+海外双 Prompt + 35 意象库 + **严重情绪三层检测系统**。**codex review 强制**：禁止硬编码停用心理热线、删除"我现在还好继续分析"按钮、disclaimer 客户端强制注入、不依赖 LLM 自觉、AI 拟人化禁止。

MVP 阶段聚焦国内合规版（海外版留 i18n 口子）。MVP 上线前的合规预审是关键。

## 改什么

- 在 `mvp/products/04-dream-journal/` 下 Next.js 14 App Router 项目
- 实现梦境记录（文字 + 语音输入用 Web Speech API mock）
- 实现 LLM 分析（国内合规 prompt 严格按 detail-04 § A.1）
- 实现 35 意象库 JSON
- **核心：严重情绪三级检测系统**（关键词 + LLM 双保险 + 后置审查）
- 时间轴页 + 月度报告（mock）
- 占位图 + codex-todo

## 影响范围

- 新目录：`mvp/products/04-dream-journal/`
- 依赖：`lucide-react`、`zod`、`date-fns`
- LLM：env `DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY`，mock fallback
- **严格合规**：禁词全 lint / 热线占位符 / 危机干预页面无"继续分析"按钮

## Tasks

### 1. 脚手架
- [ ] 1.1 `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [ ] 1.2 依赖：`lucide-react`、`zod`、`date-fns`
- [ ] 1.3 配色：深紫 `#3D2C4A` + 月白 `#F5F1E8` + 金 `#D4A574`（梦境感）
- [ ] 1.4 字体：思源宋体 / 系统衬线
- [ ] 1.5 README + .env.example

### 2. 路由
- [ ] 2.1 `app/page.tsx` 首页 / 大输入框 "今天做了什么梦？" + 语音按钮
- [ ] 2.2 `app/analyzing/page.tsx` 分析中（"AI 正在解读你的梦境..."）
- [ ] 2.3 `app/result/[id]/page.tsx` 分析结果（关键意象 / 心理学多视角解读 / 反思问题）
- [ ] 2.4 `app/timeline/page.tsx` 梦境时间轴
- [ ] 2.5 `app/monthly/page.tsx` 月度报告（mock）
- [ ] 2.6 `app/crisis/page.tsx` 严重情绪触发页面（关怀回应 + 求助入口，**无"继续分析"按钮**）
- [ ] 2.7 `app/about/page.tsx` 关于 + disclaimer 全文

### 3. 严重情绪三级检测系统（命脉）
- [ ] 3.1 `lib/crisisKeywords.ts` 三级关键词表：
  - **一级**：自杀 / 跳楼 / 上吊 / 自缢 / 割腕 / 安乐死 / 了断 / 不想活 / 想死 / 自残 / 撞墙 / 伤害自己 / 消失算了
  - **二级**：绝望 / 痛苦 / 熬不下去 / 撑不住 / 崩溃 / 空虚 / 没意思 / 活着累
  - **三级**：孤独 / 累 / 想消失 / 没人懂 / 躲起来 / 一个人
- [ ] 3.2 `lib/detectCrisis.ts` 检测函数：返回 `level: 0|1|2|3`
- [ ] 3.3 一级触发：客户端**强制跳转** `/crisis` 页面，不再调 LLM；页面只显示关怀回应 + 求助入口；**无"继续分析"按钮**
- [ ] 3.4 二级触发：常规分析 + 末尾追加暖色卡片 + 热线占位符
- [ ] 3.5 三级触发：常规分析 + 末尾追加温和建议

### 4. 心理热线管理（codex 强制）
- [ ] 4.1 `lib/crisisHotlines.ts` 数据结构含：name / number / region / hours / sourceUrl / lastVerified / verifiedBy
- [ ] 4.2 **不硬编码热线号码**，全部用 placeholder：`{{crisis_hotline_primary}}`
- [ ] 4.3 README 显著说明："上线前必须人工核验所有热线号码，每月复核"
- [ ] 4.4 占位符 fallback：显示"请联系本地紧急电话 / 可信任的人 / 专业心理机构"通用文案，**不编造号码**
- [ ] 4.5 危机页面提供 3 个按钮：「打开拨号」(`tel:` link, 占位)、「发送给信任的人」(`sms:` link)、「稍后再记录」

### 5. LLM API
- [ ] 5.1 `app/api/analyze-dream/route.ts` POST 接口
- [ ] 5.2 入参：dreamText / userId (mock)
- [ ] 5.3 **服务端先跑 detectCrisis()**，一级命中直接返回 crisis 标志，不调 LLM
- [ ] 5.4 LLM Prompt 完整复制 `detail-04-dream-journal.md § A.1` 国内合规版
  - **禁词清单**：算命 / 解梦 / 预测 / 运势 / 吉凶 / 灵性
  - **强制 disclaimer 输出**：每次分析结果首尾必须含
- [ ] 5.5 客户端**强制注入** disclaimer banner，不依赖 LLM 自觉
- [ ] 5.6 mock fallback：返回一个完整梦境解读示例（含弗洛伊德/荣格/格式塔三视角）

### 6. 意象库
- [ ] 6.1 `lib/symbols-db.json` 从 detail-04 § B 抽 35 个高频意象的多流派解读结构化
- [ ] 6.2 结果页可点击意象关键词查看详细解读（多视角）

### 7. UI 关键合规细节
- [ ] 7.1 所有页面顶部强制 banner："AI 生成内容，仅供心理探索参考，不构成医疗诊断或预测"
- [ ] 7.2 App 名称 / 标题 / 文案 lint：禁词清单
- [ ] 7.3 类目自我标注 "健康记录 / 生活记录"，**不是**"心理咨询"
- [ ] 7.4 反沉迷弹窗：连续 7 天 / 单日 30 次记录触发休息提示

### 8. 占位图
- [ ] 8.1 `codex-todo-illustrations.md`：
  - `hero-dream.png`（首页：月亮 / 星空 / 梦境抽象，深紫+金）
  - `empty-timeline.png`（空时间轴：未记录梦境）
  - `crisis-care.png`（关怀页面：温暖手势 / 灯光等温暖意象，**禁止悲伤/危险图像**）

### 9. 验证
- [ ] 9.1 `npm install` / `npm run build` / `npm run dev` 通过
- [ ] 9.2 mock 路径：输入"我梦到飞翔..." → 看完整解读
- [ ] 9.3 一级触发测试：输入含"想死"的文本 → 自动跳转 /crisis 页面，**确认无"继续分析"按钮**
- [ ] 9.4 二级触发测试：输入含"绝望"的文本 → 常规分析 + 末尾暖色卡片
- [ ] 9.5 lint 测试：app 介绍 / 截图文案 / Prompt 都搜不到禁词

### 10. 不做
- 不接真实支付
- 不做海外版（留 i18n 口子但不实现）
- 不接真实语音转文字 API（用 Web Speech API mock）
- 不做用户登录系统
- **不在代码里硬编码任何心理热线号码**
