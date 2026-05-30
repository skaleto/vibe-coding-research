# 5 MVP Next.js → Vite + Capacitor + OTA 全量重构

## 为什么

5 个 MVP 当前栈是 Next.js 14 App Router + `output: 'standalone'`，本质是 web-only Node.js 程序。要打成 iOS / Android 原生 App 并支持 OTA 热更新（对齐 `ai-baby-growth-companion` 的工程范式），standalone 不可用——必须纯静态 webDir 喂给 Capacitor WebView。

最快的路径不是改 Next.js `output: 'export'`（API routes 仍要重构、Server Component / Server Actions 不可用），而是**整体迁移到 React + Vite + Capacitor**，完全对齐 ai-baby：
- Vite 天然纯静态
- Capacitor 直接吃 `dist/`
- `@capgo/capacitor-updater` 走 OTA 闭环
- 业务逻辑 `lib/` + UI `components/` 大部分原样复用，只换路由层和 build 工具

## 改什么

- 在 `mvp/products/0X-xxx/` 下**原地重构** 5 个产品：删 `app/` + `next.config.mjs`，新建 `src/` + `vite.config.ts`，路由换 React Router 6
- 抽 4 个产品的 API routes 到 `mvp/gateway/`（Hono on Cloudflare Workers）
- 新建 `mvp/ota-backend/`（独立 Workers + KV，承担 `/mobile-updates/check` 接口）
- 新建 `mvp/shared-mobile-template/`（统一 Capacitor 配置 / mobileUpdates.ts / bundle 命名）
- 02 倒数日作为先驱者（最简单，无 API 依赖）
- 完整 OTA 闭环验证：发 v0.0.1 → 改文案 → 发 v0.0.2 → 真机看到切换

## 能力变更

### 新增能力
- `mobile-cross-platform`：定义 5 个 MVP 的 iOS + Android 跨端打包契约
- `ota-pipeline`：定义 bundle 发布 + 客户端检查更新 + 热切换的端到端流程
- `gateway-llm-proxy`：定义 4 个产品共享的 LLM 网关 API 契约（含合规护栏服务端 enforce）

### 影响范围
- **5 个产品代码**：路由层全删全重写；lib/ 业务逻辑 ≥80% 复用
- **基础设施**：新增 gateway + ota-backend 两个 Workers 项目
- **部署**：新增 Cloudflare Workers staging 环境
- **截图**：所有 docs/screenshots/ 重新生成（Vite dev server 行为有差异）

## 不做

- 不接真实支付（保持 mock）
- 不实现 iOS WidgetKit 原生（02 倒数日继续留 `ios-widget-todo.md`）
- 不做 Cloudflare R2 / OSS 生产（用 staging）
- 不做 Android Widget（iOS 优先）
- 不迁移 unit test framework（顺手 Jest → Vitest，不专列任务）

## 验证标准

- 5 个产品都能 `npm run build` 产出 `dist/`，且 `dist/index.html` 存在
- 5 个产品都能 `npx cap open ios` 在 Xcode 真机或模拟器跑通
- 5 个产品都能成功 OTA：发 v0.0.1 后再发 v0.0.2，真机 2 分钟内看到切换
- 4 个产品的远端 gateway 调用走通（mock + 真实 key 两条路径）
- 所有合规护栏在新栈下不退化（lintAction / detectCrisis 17 测试 / 禁词 lint / 海报 disclaimer）

## 引用

- 详细 plan：[`plan.md`](./plan.md)
- 跨产品依赖：[`design.md`](./design.md)
- ai-baby 参考：`/Users/bytedance/Documents/ai-baby-growth-companion/capacitor.config.ts` + `frontend/src/mobileUpdates.ts`
