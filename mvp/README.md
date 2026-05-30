# Vibe Coding 轻产品矩阵 · MVP 实现

**最新更新**：2026-05-28（迁移到 Vite + Capacitor + OTA）
**栈**：**Vite 5 + React 18 + React Router 6 + TypeScript + Tailwind + Capacitor 6 + @capgo/capacitor-updater**（全 5 个产品统一）
**架构**：5 产品（web + iOS + Android 三端）+ mvp/gateway（共享 LLM 网关，Hono on Workers）+ mvp/ota-backend（OTA 热更后端，Workers + KV + R2）
**原 Next.js 14 standalone 栈**：已弃用，迁移过程见 `openspec/changes/migrate-to-vite-capacitor-ota/`

---

## 5 个 MVP 总览（迁移后）

| # | 产品 | 路径 | appId | 关键特性 | 验证状态 |
|---|---|---|---|---|---|
| 1 | **诗经起名** | `products/01-ai-naming/` | `io.shijingnaming.app` | 71 篇典籍库 + verify_quote 校验 + 5 子产品 + 海报 + Mock 付费墙 | ✅ type-check/build/cap-sync 全过 |
| 2 | **倒数日 Pro** | `products/02-countdown/` | `io.countdownpro.app` | 5 套主题独立 CSS（少女/极简/胶片/国风/赛博）+ localStorage CRUD + WidgetKit TODO | ✅ + 24 unit tests |
| 3 | **植物医生** | `products/03-plant-doctor/` | `io.plantdoctor.app` | Capacitor Camera + lintAction 11 测试 + 25 病害库 + likelihood 高/中/低 | ✅ + **lintAction 11 全过** |
| 4 | **梦境日记** | `products/04-dream-journal/` | `io.dreamjournal.app` | 三级 crisis 检测 17 测试 + client+server 双拦截 + 热线占位符 + 35 意象库 | ✅ + **detectCrisis 17 全过** |
| 5 | **宠物心情卡片** | `products/05-pet-cards/` | `io.petcards.app` | Capacitor Voice Recorder + 3 套海报 + 20 mock 场景 + 全站禁"翻译"二字 | ✅ + 海报 disclaimer 强制嵌入 |

**Infra 项目**：
| 项目 | 路径 | 用途 | 测试 |
|---|---|---|---|
| Gateway | `gateway/` | 共享 LLM 网关（Hono on Cloudflare Workers），4 endpoints + 合规服务端 enforce | ✅ 20 tests |
| OTA Backend | `ota-backend/` | OTA manifest + bundle 分发（Hono + KV + R2 + aws4fetch presigned URL）| ✅ 39 tests |

> 总测试数：**111 passed**（gateway 20 + ota-backend 39 + 02 24 + 03 11 + 04 17）
> 详细 integration 报告：[`openspec/changes/migrate-to-vite-capacitor-ota/integration-report.md`](./openspec/changes/migrate-to-vite-capacitor-ota/integration-report.md)

每个产品**独立可运行**：`cd products/0X-xxx && npm run dev`（端口 3001-3005 自动分配）

---

## 📱 5 个 MVP 手机端速览（iPhone 14 Pro · 393×852）

| 1️⃣ AI 起名 | 2️⃣ 倒数日 Pro | 3️⃣ 植物医生 |
|---|---|---|
| ![](./products/01-ai-naming/docs/screenshots/01-home.png) | ![](./products/02-countdown/docs/screenshots/02-list-seeded.png) | ![](./products/03-plant-doctor/docs/screenshots/01-home.png) |
| 暖琥珀+米黄 hero · 71 篇典籍 · 5 子产品 | **3 套主题同列**：胶片 + 少女心 + 极简 | 暖绿 hero · 三步走 · 合规提示 |

| 4️⃣ 梦境日记 | 5️⃣ 宠物心情卡片 |
|---|---|
| ![](./products/04-dream-journal/docs/screenshots/03-crisis.png) | ![](./products/05-pet-cards/docs/screenshots/01-home.png) |
| ⚠️ 危机页（合规核心）· 无"继续分析"按钮 | 萌粉奶黄 · 录音入口 · 强制 disclaimer |

> 每个产品 docs/screenshots/ 含 3-5 张完整页面截图，详见各产品 README。
> 截图脚本：[`scripts/screenshot.mjs`](./scripts/screenshot.mjs)（Playwright iPhone 14 Pro viewport，可重复跑）。

---

## 快速启动

### Web 端开发（自动端口分配 3001-3005）

```bash
# 单个产品（端口由 vite.config.ts 的 port: 3000 + productIndex 决定）
cd products/02-countdown && npm install && npm run dev
# 浏览器访问 http://localhost:3002

# 5 个产品同时跑（端口不冲突）
cd products/01-ai-naming && npm run dev &   # :3001
cd products/02-countdown && npm run dev &   # :3002
cd products/03-plant-doctor && npm run dev & # :3003
cd products/04-dream-journal && npm run dev & # :3004
cd products/05-pet-cards && npm run dev &   # :3005
```

### iOS / Android 原生壳（Capacitor）

```bash
cd products/02-countdown
npm run cap:ios        # build + sync + Xcode 打开 ios 工程
npm run cap:android    # build + sync + Android Studio 打开 android 工程
```

依赖：macOS + Xcode + CocoaPods（iOS）；Android Studio + JDK 17 + Android SDK（Android）。

### Gateway + OTA Backend（本地）

```bash
# 共享 LLM 网关
cd mvp/gateway && npm install && wrangler dev   # 默认 :8787

# OTA 后端
cd mvp/ota-backend && npm install && wrangler dev   # 另一端口

# 5 产品的 .env 配置：
# VITE_GATEWAY_URL=http://localhost:8787
# VITE_OTA_BACKEND_URL=http://localhost:8788
```

### OTA 发布

```bash
cd mvp/products/02-countdown
npm run build
# 上传 dist/ 到 R2，更新 manifest KV
../../scripts/publish-bundle.sh 02-countdown 0.0.2 dist
```

---

## 环境变量

5 个产品**默认走 mock**，无 key 也能跑通完整路径。

如果想启用真实 LLM：

```bash
cd products/0X-xxx
cp .env.example .env.local
# 编辑 .env.local 填入至少一个 key
```

各产品支持的 LLM provider（按优先级降序）：

| 产品 | 优先级 1 | 优先级 2 | 优先级 3 | Fallback |
|---|---|---|---|---|
| 01 起名 | DEEPSEEK_API_KEY | ZHIPU_API_KEY | OPENAI_API_KEY | mock |
| 02 倒数日 | （不用 LLM） | — | — | — |
| 03 植物医生 | **ZHIPU_API_KEY**（GLM-4V 视觉）| OPENAI_API_KEY (GPT-4V) | — | mock |
| 04 梦境日记 | DEEPSEEK_API_KEY | OPENAI_API_KEY | — | mock |
| 05 宠物心情卡片 | DEEPSEEK_API_KEY | ZHIPU_API_KEY | OPENAI_API_KEY | mock |

---

## 文档结构

```
mvp/
├── README.md                    ← 本文件
├── SHARED-CONVENTIONS.md         ← 共享技术约定（栈/目录/Placeholder/LLM proxy）
├── openspec/
│   ├── config.yaml
│   └── changes/
│       ├── implement-01-ai-naming/proposal.md + tasks.md
│       ├── implement-02-countdown/proposal.md
│       ├── implement-03-plant-doctor/proposal.md
│       ├── implement-04-dream-journal/proposal.md
│       └── implement-05-pet-cards/proposal.md
└── products/
    ├── 01-ai-naming/
    │   ├── README.md            ← 产品自身运行说明
    │   ├── codex-todo-illustrations.md   ← 给 codex 的占位图生成清单
    │   ├── package.json
    │   ├── app/                 ← Next.js 14 App Router
    │   ├── components/
    │   ├── lib/
    │   └── ...
    ├── 02-countdown/
    │   └── ... (同上结构 + ios-widget-todo.md)
    ├── 03-plant-doctor/
    ├── 04-dream-journal/
    └── 05-pet-cards/
```

---

## 占位图（给 codex 接力）

每个产品根目录都有 `codex-todo-illustrations.md`，列出：
- 占位图 ID（对应组件 `kind` prop）
- 实际显示尺寸
- 推荐生成像素（2x 高 DPI 适配）
- 风格关键词
- 当前 placeholder caption
- 整合步骤（import + 替换 `<Placeholder>` 为 `<img>`）

占位图总数：

| 产品 | 占位图数 | 备注 |
|---|---|---|
| 01 起名 | 9 张 | hero + 5 tab icon + 海报装饰 + 付费墙背景 + 支付二维码 |
| 02 倒数日 | 8 张 | hero + 5 主题种草摆拍 + widget 预览背景 + 海报框 |
| 03 植物医生 | 3 张 | hero / empty / loading |
| 04 梦境日记 | 3 张 | hero / empty timeline / crisis-care（**禁悲伤/坠落图像**） |
| 05 宠物心情卡片 | 12 张 | hero + recording + loading + 3 海报背景 + 4 猫头像 + 4 狗头像 |
| **合计** | **35 张** | 启用 codex 生成后逐张替换 |

---

## 合规验收

参考 `../light-products/compliance-checklist.md`（codex review 加固版）。

每个产品上架前必须按 checklist 自检：

| 产品 | 关键合规雷点 | 验收门槛 |
|---|---|---|
| 1️⃣ 起名 | LLM 编造典故 | verify_quote 校验通过 + 每日人工抽检 50 条误检率 < 2% |
| 2️⃣ 倒数日 | （无显著雷点） | iCloud 同步无丢失 + 字体版权 |
| 3️⃣ 植物医生 | 推荐农药 | lintAction 命中替换为咨询提示 |
| 4️⃣ 梦境日记 | 硬编码停用热线 | 热线远端配置 + 月度核验 + 一级触发无"继续分析"按钮 |
| 5️⃣ 宠物心情卡片 | "翻译"虚假宣传 | App 名称/海报/Prompt 输出不含"翻译"二字 |

---

## 已知 limitation（全产品共同）

1. **付费链路全部 mock**：未接真实 IAP / Stripe / 微信支付
2. **localStorage 持久化**：换设备 / 换浏览器数据不同步
3. **真实 LLM 路径**：在没有 env key 的环境只跑过 mock 路径；真实 key 路径通过 type-check + build 但未人工实测
4. **占位图未生成**：所有图都是 `<Placeholder>` 组件占位，需 codex 接力（每个产品的 codex-todo-illustrations.md）
5. **iOS / Android 原生壳未启用**：02 倒数日的 WidgetKit 见 `products/02-countdown/ios-widget-todo.md`；其他产品后续需要 Capacitor 集成

---

## 各产品自身亮点

### 01 AI 起名（最完整）
- **71 篇典籍库 / ~270 条原文**（诗经 32 + 唐诗 22 + 楚辞 5 + 论语 5 + 宋词 7）
- 完整 800+ 字 v1 Prompt（19 字硬黑名单 + 13 字软黑名单）
- 5 mock 名字（未央 / 思齐 / 灵均 / 知微 / 清辞）全部真实诗经楚辞出处
- 5 子产品脚手架（宝宝 + 公司 + 笔名 + 宠物 + 网名）

### 02 倒数日 Pro
- 5 套主题各自独立 CSS + 装饰（scanlines / 胶片齿孔 / 朱砂印章 / 蝴蝶结 / 霓虹角标）
- localStorage schema 版本控制 + zod 校验
- 完整 iOS Widget TODO（5 尺寸优先级 P0-P4 + Swift 骨架 + App Group + 10 项验收清单）

### 03 植物医生
- **lintAction 11 测试全过**（命中 40+ 农药名 + 稀释比例 + 剂量正则；不误伤"颗粒土 70%"）
- 25 病害结构化样本
- 严格 codex 合规：likelihood 高/中/低（无 % / 无 probability 字段）
- 三层 LLM fallback chain（智谱 GLM-4V → OpenAI GPT-4V → mock）

### 04 梦境日记
- **三级 crisis 检测 17 测试全过**（zh + en + 网络新词如 emo/破防）
- 一级触发 API 返回 `redirectToCrisis: true`，**不调 LLM**
- 心理热线全 placeholder，grep 验证无硬编码号码
- 35 意象库（弗洛伊德/荣格/格式塔三视角）

### 05 宠物心情卡片
- 全栈 grep "翻译"：**用户面 0 处**，仅 about 页和服务端守卫
- MediaRecorder 录音 + 8 秒超时
- 3 套海报（萌系卡通 / 简约 / 复古胶片）+ 11 mood 配色映射
- 20 mock 场景

---

## 维护节奏（参考 light-products/compliance-checklist.md）

| 频次 | 项目 |
|---|---|
| 每周 | 用户投诉 review + 关键词 lint 复检 |
| 每月 | 心理热线全核验 + 禁词清单更新 + AI 抽检 |
| 每季度 | 法规变化追踪 |
| 每半年 | 重新 review checklist |

---

## 引用文档

- 母研究：`../vibe-coding-research-2026-05.md`（含证据等级 A/B/C/D + 成功公式 5 条）
- 产品调研：`../light-products/01-05-research.md`
- 产品 PRD：`../light-products/prd-0X-xxx.md`
- 产品实操手册：`../light-products/detail-0X-xxx.md`（含完整 Prompt / UI 详规 / Day 1-7 plan）
- 合规清单：`../light-products/compliance-checklist.md`
- 共享技术约定：`./SHARED-CONVENTIONS.md`
- 各产品 OpenSpec proposal：`./openspec/changes/implement-0X-xxx/proposal.md`

---

## 下一步

1. **设置真实 LLM key**：申请 DeepSeek（最便宜）或智谱（视觉模型）的 API key，在各产品 `.env.local` 填入
2. **codex 生成占位图**：35 张图按各产品 `codex-todo-illustrations.md` 逐张生成
3. **接付费链路**：选 1 个产品（推荐 02 倒数日，合规最简单）接 Apple IAP 试水
4. **02 倒数日 iOS 原生**：按 `ios-widget-todo.md` 用 Capacitor + Swift 实现 WidgetKit
5. **用户访谈**：先做 5-10 个真实用户访谈验证愿付费（参考 detail-01 的 Van Westendorp 测试模板）

---

**祝早起开发顺利 🌅**
