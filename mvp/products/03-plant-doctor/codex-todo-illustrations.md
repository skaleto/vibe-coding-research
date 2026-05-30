# 占位图清单 — 交接给 codex / 设计师

> 这些 ID 在代码里以 `<Placeholder kind="..." />` 形式出现；codex 在替换正式插画时按 ID 对接。
> 风格基调：暖绿主 `#527064` + 暖橙辅 `#E8A45E` + 米黄背景 `#FFF8EE`，柔和 pastel，圆润亲和，避免硬朗工具感。

## 通用约束

- 配色：与 Tailwind 主题对齐（primary / accent / bg）
- 风格：扁平 + 轻轻立体阴影，避免过度卡通
- 用途：MVP 阶段是 placeholder div，正式版替换为 SVG / PNG
- 输出：建议 SVG（可矢量缩放）或 2x PNG（移动端友好）
- 不出现：人物面孔特写、明星宠物 / 网红宠物、未授权字体或商业素材

## 清单

### `hero-plant`（首页 Hero）
- **位置**：`app/page.tsx` 首页顶部右侧
- **比例**：4/3，建议 600×450 渲染
- **描述**：家庭场景中并排的多种盆栽——绿萝、玉露、龟背竹、君子兰；暖色 pastel；阳光从右上斜入；植物状态健康饱满；给人「这盆是救得活的」的安全感
- **不要**：枯萎、病害、农药瓶、显示具体药剂名

### `empty-my-plants`（"我的植物"空态）
- **位置**：`app/my-plants/page.tsx`
- **比例**：4/3，建议 480×360 渲染
- **描述**：单只盆栽剪影（半透明）+ 一片轻飘的落叶 + 暖色 pastel 背景；下方留白以放副文案；传递「欢迎养第一盆」的温柔氛围
- **不要**：人手、过度复杂的场景

### `loading-leaf`（诊断中动画占位，未来扩展）
- **位置**：未来 `app/diagnose/page.tsx` 加载态可替换
- **格式**：Lottie 动画或 GIF
- **描述**：一片叶子在放大镜下慢慢旋转/扫描，色调暖绿，节奏 1.5s/圈
- **当前状态**：MVP 阶段未使用，loading 直接显示在 `/capture` 按钮内（spinner + "AI 正在分析叶片…"）

### 建议但非必需

- `diagnosis-illustration-*`：8 个常见病害的示意图（黑腐、白粉、叶斑、徒长、烂根、夹箭、灰霉、红蜘蛛），用于结果页配图。MVP 阶段不需要。
- `share-poster-template`：分享海报模板（含品牌 logo + 二维码）。MVP 不实现分享功能。
- `paywall-hero`：付费墙顶部插画。MVP 不实现付费。

## 替换流程

1. 设计师产出 SVG/PNG，放在 `public/placeholders/<kind>.svg`
2. 把 `<Placeholder kind="hero-plant" ... />` 替换为 `<Image src="/placeholders/hero-plant.svg" ... />`
3. 保留 `data-placeholder` / `data-spec` 注释，便于后续盘点

---

最近更新：2026-05-28
