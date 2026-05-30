# Placeholder Illustration TODO · 倒数日 Pro Web MVP

> 当前 MVP 中所有"应该有插画但暂时没画师"的位置统一用 `<Placeholder kind="…" />` 组件落位。Codex / 设计接手时，请按下表生成或外包配图，落到 `public/placeholders/` 同名 PNG / SVG，然后把 `<Placeholder />` 替换为 `<Image src="/placeholders/<id>.png" />`。

## 命名规范
- 文件名 = 表中的 ID。
- 比例与尺寸已写明，**严格遵守**，避免布局抖动。
- 配色须从 [`lib/themes.ts`](./lib/themes.ts) 取值，不要随手脑补。
- 中文部分按"小红书种草向"风格（柔和、有质感、留白），不要做"贴图广告腔"。

## 清单（8 张）

| # | ID | 用途 / 出现位置 | 比例 / 尺寸 | 风格 spec |
|---|---|---|---|---|
| 1 | `hero-themes` | 列表页顶部 banner / 营销首图 | 16:9 (1920×1080) | 5 套主题缩略卡水平排列，主色背景叠加，左上角 logo。色块来源：`lib/themes.ts` 每个主题 primary + bg。 |
| 2 | `theme-pink-coquette` | 主题市场 / Settings 主题卡 | 1:1.6 (1242×2000) | 千禧粉色 iPhone 桌面摆拍：粉色云朵壁纸 + 中尺寸粉色 widget"距 ❤️ 100 天纪念日"+ 蝴蝶结。 |
| 3 | `theme-minimal-thingsy` | 同上 | 1:1.6 | 极简：纯黑壁纸 + 极简 widget"距护照过期 92 天" + Apple Watch 倒影。 |
| 4 | `theme-film-kodak` | 同上 | 1:1.6 | 木质桌面 + 真实柯达胶卷散落 + iPhone 显示胶片主题 widget"距日本旅行 32 天"。 |
| 5 | `theme-ink-zen` | 同上 | 1:1.6 | iPhone 放茶席旁 + 大尺寸水墨 widget"距夏至 15 天" + 建盏 + 香炉。 |
| 6 | `theme-cyber-neon` | 同上 | 1:1.6 | 黑色机械键盘 + 赛博 widget 方阵（DEADLINE / RELEASE / PROD_DEPLOY）。 |
| 7 | `widget-preview-bg` | WidgetModal 背景装饰（可选） | 4:3 (1280×960) | 桌面 + 锁屏 mockup 半透明叠底，配上 5 个尺寸 ghost 框。 |
| 8 | `share-poster-frame` | SharePoster 装饰框（可选） | 3:5 (720×1200) | 海报四角装饰：蝴蝶结 / 胶片齿孔 / 印章 / 霓虹角标 4 选 1，按当前主题挑。 |

## 现状

MVP web 端目前 **未直接渲染**这些插画 —— 所有主题视觉都用 CSS / SVG 程序化生成，避免上线时还在等图。下面是"如果有图就锦上添花"的待替换点（替换前用 `<Placeholder />` 临时占位）：

- 列表空状态 hero 图
- 设置页关于卡片
- 主题预览的真机摆拍卡

## 给 codex / 画师

1. 风格参考板：
   - Pinterest 搜：`y2k aesthetic widget`、`vintage film camera ui`、`chinese ink ui`、`cyberpunk dashboard`、`minimal countdown app`
   - Dribbble 搜：`countdown widget`、`days matter alternative`
2. 颜色不要"网图发糊感"，要"小红书 cleanfeed"风。
3. 不允许任何明星 / 网红 / 知名品牌商标 / 第三方 emoji 包出现在素材里（合规清单 § 2D）。
4. 字体仅限：思源宋体 / 思源黑体 / 系统字体 / 开源 Caveat / 开源 LXGW WenKai / 开源 Orbitron。商业字体一律不用。
