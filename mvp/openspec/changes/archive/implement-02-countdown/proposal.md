# 02 AI 倒数日 Pro MVP 实现 Proposal

## 为什么

`light-products/detail-02-countdown.md` 已细化 5 套主题完整设计 + UI 详规 + WidgetKit Swift 骨架 + Day 1-7 计划。这是 5 个产品里**合规零雷点**、最稳的 idea，对标 Days Matter（B 级数据，估算月入 $60K）。

MVP 阶段先做 web 版（5 套主题切换 + 倒数日 CRUD + 海报截图分享），iOS WidgetKit 留 TODO（在 README 标注 + 留 Capacitor iOS 目录入口）。

## 改什么

- 在 `mvp/products/02-countdown/` 下 Next.js 14 App Router 项目
- 5 套主题（少女心 / 极简 / 复古胶片 / 国风 / 赛博朋克）完整实现 CSS 配色 + 字体 + 装饰元素
- 倒数日 CRUD（localStorage 持久化，无需后端）
- 列表页 + 详情页 + 新建编辑页 + 设置页（主题切换 + 通知开关 mock）
- 海报截图分享（html2canvas）
- "桌面小组件预览" 卡片（web 端展示 Widget 视觉效果，真实 WidgetKit 实现留 TODO）
- 占位图：5 套主题的"完美截图"展示 + hero banner

## 能力变更

### 新增能力
- `countdown-mvp`：定义 web 端倒数日产品的最小可用闭环（CRUD + 5 主题切换 + 截图分享）

## 影响范围

- 新目录：`mvp/products/02-countdown/`
- 依赖：`html2canvas`、`lucide-react`、`date-fns`
- 无 LLM 调用（产品本身不需要 LLM）
- 部署：Vercel 一键
- **iOS WidgetKit 实现留 TODO**：在 README 写明，并在 `ios-widget-todo.md` 给出实现指引

## Tasks

### 1. 脚手架
- [ ] 1.1 `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [ ] 1.2 安装：`html2canvas date-fns lucide-react zustand`（zustand 管主题切换状态）
- [ ] 1.3 `tailwind.config.ts` 配 5 套主题色板（参考 `detail-02-countdown.md § A`）
- [ ] 1.4 README + .env.example

### 2. 5 套主题完整实现
- [ ] 2.1 `lib/themes.ts` 定义 5 套主题数据结构：name / colors / fonts / decorations
- [ ] 2.2 **少女心**：主色 `#FFB6C1` 辅 `#FFC0CB` 背景 `#FFF5F7` 装饰：圆角心形 / 蝴蝶结
- [ ] 2.3 **极简**：主色 `#1A1A1A` 辅 `#666666` 背景 `#FFFFFF` 装饰：极细线条 / Helvetica 字号阶梯
- [ ] 2.4 **复古胶片**：主色 `#8B6F47` 辅 `#D4A574` 背景 `#F5EFE6` 装饰：胶片框 / 颗粒噪点纹理
- [ ] 2.5 **国风**：主色 `#8B2D2D` 辅 `#D4A574` 背景 `#F4E4C1` 装饰：印章方框 / 毛笔字字体
- [ ] 2.6 **赛博朋克**：主色 `#FF006E` 辅 `#00FFFF` 背景 `#0A0A0F` 装饰：霓虹外发光 / 像素字
- [ ] 2.7 每套主题给一个 ThemeCard 组件用于预览选择

### 3. 倒数日 CRUD
- [ ] 3.1 数据模型：`{ id, title, targetDate, type: 'countdown'|'countup', emoji, theme, note }`
- [ ] 3.2 `lib/storage.ts` localStorage 封装（含 export / import JSON 备份）
- [ ] 3.3 `app/page.tsx` 列表页（卡片网格 + "+" 浮动按钮）
- [ ] 3.4 `app/new/page.tsx` 新建页（表单：标题/日期/emoji 选择器/主题选择/备注）
- [ ] 3.5 `app/[id]/page.tsx` 详情页（大数字倒数 + 编辑 / 删除 / 分享按钮）
- [ ] 3.6 `app/settings/page.tsx` 设置（全局主题切换 / 数据备份 / 关于）

### 4. Widget 预览（Web 端可视化）
- [ ] 4.1 `components/WidgetPreview.tsx` 三尺寸（Small 158×158 / Medium 338×158 / Large 338×354）
- [ ] 4.2 详情页显示 "Add to Home Screen?" 按钮，点击展示 Widget 预览模态框（教学性质）
- [ ] 4.3 模态框里说明 "iOS WidgetKit 在原生壳启用后可见"

### 5. 海报截图分享
- [ ] 5.1 `lib/exportPoster.ts` 用 html2canvas 把详情页 / Widget 预览导出 PNG
- [ ] 5.2 分享按钮（下载图片 + 复制图片到剪贴板，根据浏览器支持降级）

### 6. 占位图
- [ ] 6.1 创建 `codex-todo-illustrations.md`，列出：
  - `hero-themes.png`（首页 banner：5 主题缩略平铺展示）
  - 每套主题 1 张代表截图（5 张）—— 推荐生成像素 1242×2688 用于小红书种草
  - `widget-preview-bg.png`（Widget 预览背景，可选）

### 7. iOS WidgetKit TODO
- [ ] 7.1 创建 `ios-widget-todo.md` 详细写明：
  - 5 个 Widget 尺寸（systemSmall / systemMedium / systemLarge / accessoryCircular / accessoryRectangular）
  - 引用 `detail-02-countdown.md § C` 的 Swift 骨架代码
  - 关键集成点（App Group ID / UserDefaults key 命名 / Timeline Provider 刷新频率）
  - 实现优先级：先 systemSmall + systemMedium → 锁屏 → systemLarge

### 8. 验证
- [ ] 8.1 `npm install` / `npm run build` / `npm run dev` 全部通过
- [ ] 8.2 走完整路径：列表 → 新建 → 选主题 → 看详情 → 导出海报 → 切换主题 → 设置页
- [ ] 8.3 localStorage 持久化测试（刷新页面数据还在）
- [ ] 8.4 5 套主题切换效果可见，互不串色

### 9. 不做
- 不实现真实 iOS Widget（留 TODO）
- 不接 iCloud 同步（localStorage 即可）
- 不实现真实通知（在新建表单留开关 mock）
- 不实现 IAP（5 套主题全部免费在 MVP 阶段）
