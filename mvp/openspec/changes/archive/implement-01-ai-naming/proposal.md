# 01 AI 起名 MVP 实现 Proposal

## 为什么

`light-products/detail-01-ai-naming.md` 已把 AI 起名细化到「明天就能写代码」程度。现在需要把它落成可运行的 web MVP，验证：核心 LLM 调用、典故白名单校验、海报生成、付费墙、5 子产品复用脚手架的工程可行性。

参照 codex review，**典故校验是 MVP 硬门槛**：必须有本地白名单数据库，校验失败的名字不能进结果页。

## 改什么

- 在 `mvp/products/01-ai-naming/` 下从零搭一个 Next.js 14 App Router 项目
- 实现 5 子产品 tab 切换（宝宝 / 公司 / 宠物 / 网名 / 笔名），其中 **宝宝起名**必须完整实现，其他 4 个可以共用同一表单 + Prompt 占位
- 实现 `/api/generate-names` API route，主调 DeepSeek（如有 env），mock fallback
- 实现典故白名单 verify_quote() 函数 + 最小 JSON 典故库（诗经 30 篇 + 唐诗 30 首样本，够 MVP 用）
- 实现海报生成（HTML2Canvas / dom-to-image 客户端方案）
- 付费墙 mock（不接真实支付；显示 ¥18/¥68/¥198 三档 + "升级到完整版" 按钮）
- 占位图用统一 `Placeholder` 组件 + 同目录 `codex-todo-illustrations.md` 给 codex 生成图的口子

## 能力变更

### 新增能力
- `ai-naming-mvp`：定义 web 端 AI 起名产品的最小可用闭环（输入 → LLM → 典故校验 → 结果 → 海报 → 付费墙）

## 影响范围

- 新目录：`mvp/products/01-ai-naming/`
- 技术栈：Next.js 14 + React 18 + TypeScript + Tailwind CSS + lucide-react
- 关键依赖：`html2canvas` 或 `dom-to-image-more`（海报）；可选 `better-sqlite3` 或纯 JSON（典故库）
- LLM：默认 mock；env `DEEPSEEK_API_KEY` 存在时走 DeepSeek `/v1/chat/completions`
- 部署：可一键 `vercel deploy`
- **不**实现：真实支付、登录注册、ASO 配置代码、多语言 i18n、海外版

## Tasks

### 1. 工程脚手架
- [ ] 1.1 在 `mvp/products/01-ai-naming/` 下 `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` 等价初始化（必须用 App Router）
- [ ] 1.2 `package.json` 添加：`html2canvas`、`lucide-react`、`zod`
- [ ] 1.3 `tailwind.config.ts` 配色：主色 `#C8A56C`（暖琥珀）+ 米黄背景 `#FFF8EE` + 文字 `#3D2C2E`
- [ ] 1.4 `next.config.mjs` 启用 `output: 'standalone'` 方便 deploy
- [ ] 1.5 `.env.example` 列出可选环境变量：`DEEPSEEK_API_KEY`、`OPENAI_API_KEY`
- [ ] 1.6 `README.md` 写本地运行步骤 + 截图占位

### 2. 路由结构（App Router）
- [ ] 2.1 `app/layout.tsx` 全局布局 + 中文字体（思源黑体 fallback 系统字体）
- [ ] 2.2 `app/page.tsx` 首页（5 子产品 tabs + CTA "免费起一个"）
- [ ] 2.3 `app/[type]/page.tsx` 输入表单页（type 取 baby/company/pet/nickname/penname）
- [ ] 2.4 `app/[type]/result/page.tsx` 结果页(接 query string 携带表单数据)
- [ ] 2.5 `app/poster/[id]/page.tsx` 海报预览/下载
- [ ] 2.6 `app/pricing/page.tsx` 付费墙

### 3. 核心组件
- [ ] 3.1 `components/Placeholder.tsx` 通用占位图组件（同 ai-baby-growth-companion 风格：含 `data-placeholder` 属性 + caption + spec）
- [ ] 3.2 `components/NameCard.tsx` 单个名字卡（名字 + 拼音 + 出处 + 意境 + 八字契合度）
- [ ] 3.3 `components/PosterPreview.tsx` 海报渲染（HTML2Canvas 导出）
- [ ] 3.4 `components/PricingModal.tsx` 付费墙弹窗
- [ ] 3.5 `components/Loading.tsx` 加载动画（"AI 正在排八字..."）

### 4. LLM 集成（API Route）
- [ ] 4.1 `app/api/generate-names/route.ts` POST 接口
- [ ] 4.2 入参 schema 用 zod 校验：surname / gender / vibe / birthdate?
- [ ] 4.3 主调 DeepSeek `https://api.deepseek.com/v1/chat/completions`，model `deepseek-chat`
- [ ] 4.4 Prompt 使用 `light-products/detail-01-ai-naming.md § A.1.1` 完整字符串
- [ ] 4.5 出参强制 JSON schema：`{ names: Array<{name, pinyin, source, original_quote, meaning, bazi_match}> }`
- [ ] 4.6 LLM 失败/无 key 时返回 mock 数据（含 5 个真实诗经/楚辞名字示例）
- [ ] 4.7 错误处理：超时 30s / 重试 1 次 / 用户友好错误信息

### 5. 典故校验（MVP 硬门槛）
- [ ] 5.1 `lib/classics-db.json` 最小典故库（诗经 30 篇 + 唐诗 30 首 + 楚辞 5 篇 + 论语 5 章）—— 每篇含 `book / chapter / verses[]`
- [ ] 5.2 `lib/verifyQuote.ts` 函数：输入 `(book, chapter, quote)`，全文检索 verses 是否包含 quote
- [ ] 5.3 API route 在返回前对每个名字调 verifyQuote，失败的名字打 `verified: false` 标志
- [ ] 5.4 结果页对 `verified: false` 的名字显示警告标识（橙色叹号 + "出处待人工核验"）
- [ ] 5.5 MVP 阶段允许 verified=false 显示（带警告），但海报和付费报告只允许 verified=true 的名字

### 6. 海报生成
- [ ] 6.1 设计 1 套海报模板（800×1200 竖版，含名字大字 + 出处小字 + 装饰花纹占位 + 二维码 placeholder）
- [ ] 6.2 用 html2canvas 把 React 组件转 PNG
- [ ] 6.3 "保存到相册" 按钮（mobile）/ "下载图片" 按钮（PC）
- [ ] 6.4 含品牌水印（产品名 + slogan）

### 7. 付费墙（Mock）
- [ ] 7.1 三档卡片：¥18 标准 / ¥68 深度 / ¥198 终身
- [ ] 7.2 点击任一按钮弹出 mock 支付二维码占位图 + "支付完成后请联系客服" 文案（避免接真实支付）
- [ ] 7.3 在 footer 加 "本产品 MVP 阶段，付费链路待接通" 提示

### 8. 占位图任务
- [ ] 8.1 创建 `mvp/products/01-ai-naming/codex-todo-illustrations.md`
- [ ] 8.2 列出 4-6 张需要生成的图：
  - `hero-naming.png`（首页 banner，16:9）
  - `icon-baby.png` / `icon-company.png` / `icon-pet.png` / `icon-nickname.png` / `icon-penname.png`（5 个 tab icon，正方形）
  - `poster-decoration.png`（海报装饰花纹，PNG 透明背景）
  - `pricing-bg.png`（付费墙背景，可选）
- [ ] 8.3 每张图给：路径、尺寸、风格关键词、当前 placeholder caption、当前 spec hint

### 9. 验证（执行清单，对应下方「验证标准」的工作项）
- [ ] 9.1 `npm install` 无 error
- [ ] 9.2 `npm run build` 通过（TypeScript + Next.js build）
- [ ] 9.3 `npm run dev` 后浏览器 `localhost:3000` 渲染 OK
- [ ] 9.4 人眼走完整路径：首页 → 选宝宝 → 填表 → 看结果 → 生成海报 → 看付费墙
- [ ] 9.5 mock 数据路径全跑通（不依赖真实 LLM key）
- [ ] 9.6 真实 LLM key 配置后路径也跑通（如果环境有 DEEPSEEK_API_KEY）

### 10. 文档与交付
- [ ] 10.1 README.md 含本地运行步骤 + 环境变量说明 + 已知限制
- [ ] 10.2 codex-todo-illustrations.md 完整可执行
- [ ] 10.3 `npm run build` 输出可直接 `vercel deploy`

## 验证标准

- `cd mvp/products/01-ai-naming && npm install && npm run dev` 可起 server
- 浏览器访问 `http://localhost:3000` 可看到首页
- 选"宝宝起名" → 填表 → 点生成 → 3 秒内看到 10 个名字卡片（带出处和释义）
- 点任一名字 → 海报预览页可生成图片
- 点"解锁全部" → 弹出付费墙（mock）
- `npm run build` 通过，无 TypeScript 错误
- `codex-todo-illustrations.md` 文档列出 3-5 张需要生成的图（首页 hero / 5 子产品 icon / 付费墙 background）

## 不做

- 不接真实支付（Stripe / IAP / 微信支付）
- 不做用户登录系统
- 不做后端持久化（结果只存 localStorage）
- 不实现 ASO 关键词代码（detail 文档里已经写好的不重复）
- 不做海外英文版（专注国内 MVP）
