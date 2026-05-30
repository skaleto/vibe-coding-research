# codex-todo: 占位图清单

> MVP 当前用 emoji + Placeholder 组件占位。codex 接手后请按以下规格替换为真实素材。

## 1. 首页 hero banner

| ID | 路径 | 尺寸 | 用途 | 设计要点 |
|---|---|---|---|---|
| `hero-pet` | `public/placeholders/hero-pet.png` | 1600×900 (16:9) | 首页头图 | 猫和狗坐在云朵上互相对话的萌系卡通插画。奶黄底色 `#FFF8E1`，主色 `#FFB6C1`。猫狗表情可爱，可带气泡里写"今天又是好心情~" |

## 2. 录音流装饰

| ID | 路径 | 尺寸 | 用途 | 设计要点 |
|---|---|---|---|---|
| `recording-wave` | `public/placeholders/recording-wave.png` | 480×120 | 录音中波形装饰 | 5 道粉色波形条，背景透明，可作为录音 UI 的装饰背景 |
| `loading-pet` | `public/placeholders/loading-pet.png` | 320×320 | AI 生成中动画 | 一只小动物戴耳机的循环动画 sprite（如 Lottie JSON 更佳） |

## 3. 3 套海报背景纹理

| ID | 路径 | 尺寸 | 用途 | 设计要点 |
|---|---|---|---|---|
| `poster-bg-1` | `public/placeholders/poster-bg-1.png` | 1080×1920 | 萌系卡通风背景 | 奶油色 `#FFF6E5` 渐变 + 角落小星星/小爪印/小心心 |
| `poster-bg-2` | `public/placeholders/poster-bg-2.png` | 1080×1920 | 简约可爱风背景 | 纯白 + 顶部一条极细灰线 + 右上角圆形 mood 强调点 |
| `poster-bg-3` | `public/placeholders/poster-bg-3.png` | 1080×1920 | 复古胶片风背景 | 牛皮纸黄 `#F0E6D2` + 颗粒噪点纹理 + 深炭灰内框 |

## 4. 卡通宠物头像（替换 emoji）

> 当前海报使用 emoji 充当头像，codex 接手后可换成手绘卡通头像增强差异化

| ID | 路径 | 尺寸 | 用途 | 设计要点 |
|---|---|---|---|---|
| `avatar-cat-1..4` | `public/placeholders/avatar-cat-*.png` | 280×280 (圆形) | 猫预制头像 4 款 | 圆脸大眼睛萌系。橘猫/布偶/英短/田园 4 款 |
| `avatar-dog-1..4` | `public/placeholders/avatar-dog-*.png` | 280×280 (圆形) | 狗预制头像 4 款 | 金毛/柯基/泰迪/中华田园 4 款 |

## 5. 二维码 placeholder

当前海报底部用网格模拟二维码。后续接入真实下载链接后生成动态 QR：

| ID | 实现 | 备注 |
|---|---|---|
| `qrcode-app` | 用 `qrcode` npm 包动态生成 | 内容指向真实下载页 URL；MVP 不接 |

## 设计风格基线

- 配色：萌粉 `#FFB6C1` / 奶黄 `#FFF8E1` / 深咖啡 `#3D2C2E` / 薄荷绿 `#B5EAD7` / 复古红 `#A63A33`
- 字体：圆润可爱（思源黑体 / 阿里巴巴普惠体 / OPPO Sans / 站酷快乐体）
- emoji 默认池：🐱🐶🐾💕🍣🦴🍖💤😾🥺👀💢🧶🚪☀️🌙

## 替换流程

1. codex 准备图片放入 `public/placeholders/`
2. 删除对应 `<Placeholder kind="...">` 调用，换成 `<Image src="/placeholders/xxx.png" ... />`
3. 海报组件（`PosterStyle1/2/3.tsx`）中目前用 emoji 的位置可改为 `<img>` 引用对应素材
