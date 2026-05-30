# Codex TODO — 占位图清单

> 本文件给 codex / 设计师交接：本 MVP 留了哪些 Placeholder，需要生成哪些图。
> Placeholder 组件已在代码中预留 `kind` / `spec` 属性，方便定位。

## 调色板

- 主色 深紫 `#3D2C4A`（深沉、安静、梦境感）
- 强调 金色 `#D4A574`（月光感）
- 背景 月白 `#F5F1E8`
- 关怀暖色 `#E8A87C`（仅 crisis 页面用）

## 待生成图

### 1. `hero-dream`（首页 hero）

- **位置**：`app/page.tsx` 顶部
- **尺寸**：16:7 横图
- **风格**：抽象月亮 / 星空 / 梦境视觉；柔和星云感；不要任何文字水印
- **关键文案占位**：「今晚，记录一个梦」
- **禁忌**：避免出现具体宗教符号、占星轮盘、塔罗牌、八卦图等任何"算命/灵性"视觉元素

### 2. `empty-timeline`（空时间轴）

- **位置**：`app/timeline/TimelineClient.tsx`
- **尺寸**：16:9
- **风格**：沉睡中的月亮 / 安静的星空 / 空白书页（暗示「等待书写」）
- **关键文案占位**：「这里会渐渐有你的梦境」
- **禁忌**：避免凄凉、孤单、悲伤的视觉暗示（如哭脸、雨）

### 3. `crisis-care`（危机关怀页核心插画）

- **位置**：`app/crisis/page.tsx`
- **尺寸**：16:7
- **风格**：温暖橙色 `#E8A87C` 主调；柔和、不刺眼；
  推荐视觉：一杯热茶、一盏灯、一双手轻轻放在另一双手上、一只猫蜷在窗台
- **目标心理感**：被陪伴、被看见、不孤单
- **🔴 严格禁忌**：
  - **不允许**任何坠落、跳跃、悬崖、高楼、刀具、药片、绳索等危险图像
  - **不允许**哭泣、绝望、阴暗、压抑的视觉暗示
  - **不允许**任何形式的拟人 AI 形象（合规：AI 拟人化新规）

## 实现建议

放在 `public/placeholders/` 目录下，文件名与 `kind` 对应：
- `public/placeholders/hero-dream.png`
- `public/placeholders/empty-timeline.png`
- `public/placeholders/crisis-care.png`

替换时把对应 `<Placeholder kind="hero-dream" ... />` 改为 `<Image src="/placeholders/hero-dream.png" ... />` 即可。

## 设计 review checklist

每张图交付前自检：
- [ ] 不含禁忌视觉元素
- [ ] 不含具体心理热线号码 / 文字
- [ ] 不含宗教 / 占卜 / 算命 / 运势相关符号
- [ ] crisis-care 图须经心理咨询师 review 后再上线
