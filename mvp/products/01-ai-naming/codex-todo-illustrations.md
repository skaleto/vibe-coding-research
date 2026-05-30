# Codex Todo: 插画与占位图清单

本文档列出 AI 起名 MVP 中所有需要 codex / 设计师生成的插画。每张图都有对应的 `<Placeholder kind="..." />` 组件挂载点。

## 通用规范

- 主色：`#C8A56C` 古铜金 / `#8B4513` 朱砂深棕 / `#FFF8EE` 米白宣纸
- 风格：中国水墨 + 现代极简的混搭，文化感不油腻
- 字体：尽量避免在插画里硬编码可读文字（i18n 安全）
- 输出格式：PNG（带透明通道）/ SVG（图标）
- 输出路径：`public/placeholders/<kind>.png` 或 `.svg`

## 替换组件

替换时去 `components/Placeholder.tsx` 改成 `<Image src="/placeholders/<kind>.png" ... />`，或直接在使用处替换：

```tsx
// 替换前
<Placeholder kind="hero-naming" ... />

// 替换后
<Image src="/placeholders/hero-naming.png" alt="..." width={1600} height={1200} />
```

---

## 1. `hero-naming.png` （P0 · 首页 Hero）

- **位置**：`app/page.tsx` 第一屏 hero 卡片右侧
- **尺寸**：1600 × 1200（4:3），用户视图最大 ~600px 宽
- **风格关键词**：水墨毛笔在宣纸上书写"名"字，背景远山轮廓，旁有兰花/竹叶点缀
- **配色**：米白 #FFF8EE 底 + 墨色 #2A2A2A 主笔触 + 古铜金 #C8A56C 点缀
- **占位 caption**：首页 hero 水墨插画
- **占位 spec**：毛笔在宣纸上书写'名'字 + 远山 + 兰花 + 暖琥珀色调（米色背景），1600x1200

## 2. `icon-baby.png` （P0 · 宝宝起名 tab）

- **位置**：`app/page.tsx` 5 子产品卡片中
- **尺寸**：512 × 512 正方形（用户视图 ~256×170）
- **风格**：极简插画，婴儿襁褓 + 一支毛笔 + 一片柳叶，留白多
- **占位 caption**：宝宝起名 tab 图标
- **占位 spec**：婴儿襁褓 + 毛笔元素，正方形 256x256，米色背景

## 3. `icon-company.png` （P1 · 公司起名 tab）

- **位置**：同上
- **尺寸**：512 × 512
- **风格**：简约楼宇剪影 + 一枚红印章，传达"工商"印记
- **占位 caption**：公司起名 tab 图标
- **占位 spec**：简约楼宇 + 印章元素，正方形 256x256

## 4. `icon-pet.png` （P2 · 宠物起名 tab）

- **位置**：同上
- **尺寸**：512 × 512
- **风格**：猫与狗的剪影坐在一起 + 几个浮动毛球
- **占位 caption**：宠物起名 tab 图标
- **占位 spec**：猫狗剪影 + 毛球 + 暖色调，正方形 256x256

## 5. `icon-nickname.png` （P3 · 网名 tab）

- **位置**：同上
- **尺寸**：512 × 512
- **风格**：游戏手柄 + 一个文字气泡（含 "?"），年轻活泼
- **占位 caption**：网名 tab 图标
- **占位 spec**：游戏手柄 + 文字气泡，正方形 256x256，年轻活泼

## 6. `icon-penname.png` （P2 · 笔名 tab）

- **位置**：同上
- **尺寸**：512 × 512
- **风格**：钢笔 + 信纸的局部 + 月亮剪影，文艺感
- **占位 caption**：笔名 tab 图标
- **占位 spec**：钢笔 + 信纸 + 月亮，正方形 256x256，文艺感

## 7. `poster-decoration.png` （P0 · 海报装饰）

- **位置**：`components/PosterPreview.tsx` 中的 3 种海报模板
- **尺寸**：1080 × 1440（3:4），PNG 透明背景
- **风格**：水墨远山 + 兰花 + 落款印章模拟，透明背景方便叠加在 3 种海报上
- **占位 caption**：海报装饰花纹 PNG
- **占位 spec**：水墨远山 + 兰花 + 透明背景，1080x1440

## 8. `pricing-bg.png` （P1 · 付费墙顶部装饰）

- **位置**：`components/PricingModal.tsx` 顶部
- **尺寸**：900 × 300（3:1）
- **风格**：水墨"名"字毛笔书法 + 远山轮廓 + 米色底
- **占位 caption**：付费墙顶部水墨装饰
- **占位 spec**：水墨'名'字毛笔书法 + 远山轮廓 + 米色底

## 9. `payment-qrcode.png` （P2 · Mock 支付二维码）

- **位置**：`components/MockPaymentDialog.tsx`
- **尺寸**：480 × 480 正方形
- **风格**：模拟二维码点阵（不必扫得通），中央放一个"诗"字 logo，外圈古铜金边框
- **占位 caption**：微信 / 支付宝 二维码占位
- **占位 spec**：正方形 240x240，含品牌色边框，中央为模拟二维码点阵

---

## Codex 接入步骤

1. 用 Midjourney / DALL-E / Stable Diffusion 按上面 spec 生成图
2. 存到 `public/placeholders/<kind>.png`
3. 在对应组件里把 `<Placeholder>` 替换为 `<Image>`（next/image）
4. 跑 `npm run build` 确认无报错
