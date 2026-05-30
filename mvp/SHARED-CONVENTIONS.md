# MVP 共享技术约定（Vite + Capacitor + OTA 版）

> 所有 5 个 MVP 产品必须遵守此文件。
> 主要目的：让 5 个 subagent 独立工作时输出风格、依赖、目录结构一致，方便后续维护和 codex 接手。
>
> **2026-05-28 重写**：从 Next.js 14 App Router 全量迁到 **Vite + React Router 6 + Capacitor 8 + OTA**。
> 原 Next.js 版本规范见 git history。
>
> **2026-05-29 更新**：Capacitor 6 → **8.3.4**（SPM 工程，无 CocoaPods/Podfile），capgo updater 6.6 → **8.47.4**。

---

## 通用栈

| 层 | 选型 | 版本 |
|---|---|---|
| 打包 | **Vite** | `^5.4.x` |
| 框架 | React + React Router 6 | `react@18.3.1` + `react-router-dom@6.26.x` |
| 语言 | TypeScript（`strict: true`） | `^5.5.x` |
| 样式 | Tailwind CSS + 内联 className | `^3.4.x` |
| 图标 | lucide-react | `^0.408.x` |
| 校验 | zod | `^3.23.x` |
| 状态 | 本地 useState / URL params / localStorage；跨页用 zustand（仅 02 倒数日 / 05 宠物心情有需要） | zustand `^4.5.x` |
| 日期 | date-fns | `^3.6.x` |
| 图片导出 | html2canvas | `^1.4.1` |
| 移动壳 | **Capacitor 8**（iOS / Android，SPM 工程，无 Podfile） | `@capacitor/{core,cli,ios,android}@^8.3.4` |
| OTA | `@capgo/capacitor-updater` | `^8.47.4` |
| 测试 | Vitest + jsdom | `vitest@^2.x` |
| 包管理 | npm（**不**用 yarn / pnpm，保持一致） | — |

> 4 个产品（01/03/04/05）会调远端 **gateway**（共享 LLM 网关，Hono on Cloudflare Workers）。
> 5 个产品全部走远端 **ota-backend**（独立 Cloudflare Workers + KV + R2）拉 OTA 更新。
> 02 倒数日**不**调 LLM，仅用 OTA。

---

## 5 个产品 appId 表（与 `mvp/scripts/publish-bundle.sh`、`mvp/ota-backend/src/types.ts:KNOWN_APP_IDS` 必须严格一致）

| Slug | 产品 | `appId` | 默认端口 |
|---|---|---|---|
| `01-ai-naming` | 诗经起名（AI 起名） | `io.shijingnaming.app` | 3001 |
| `02-countdown` | 倒数日 Pro | `io.countdownpro.app` | 3002 |
| `03-plant-doctor` | AI 植物医生 | `io.plantdoctor.app` | 3003 |
| `04-dream-journal` | 梦境日记 | `io.dreamjournal.app` | 3004 |
| `05-pet-cards` | 宠物心情卡片 | `io.petcards.app` | 3005 |

**重要**：Capacitor CLI / Java package 命名规范不允许连字符，因此全部去横线（design.md 原表的 `io.shijing-naming.app` 等已淘汰）。

端口由 `vite.config.ts` 里 `port: 3000 + productIndex` 决定，`productIndex` 默认值与 slug 数字对齐（见各产品 `vite.config.ts`）。

---

## 目录结构（每个产品）

```
mvp/products/0X-xxx/
├── README.md                    ← 本地运行 + iOS 真机 + OTA 发布
├── codex-todo-illustrations.md  ← 占位图清单交接给 codex
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js            ← ESM
├── vite.config.ts               ← port + define 注入 GATEWAY_URL / OTA_BACKEND_URL / APP_ID
├── vitest.config.ts             ← jsdom 环境（如需测试）
├── capacitor.config.ts          ← appId + CapacitorUpdater 插件配置
├── index.html                   ← Vite 入口
├── .env.example                 ← VITE_PRODUCT_INDEX / VITE_APP_ID / VITE_GATEWAY_URL / VITE_OTA_BACKEND_URL
├── .gitignore
├── public/
│   └── placeholders/
├── ios/                         ← `npx cap add ios` 生成（入 git，但 Pods/ 不入）
├── android/                     ← `npx cap add android` 生成（入 git，但 build/ 不入）
├── docs/screenshots/            ← `scripts/screenshot.mjs` 产出
├── dist/                        ← `npm run build` 产物（**不**入 git，OTA 发布源）
└── src/
    ├── main.tsx                 ← React 入口
    ├── App.tsx                  ← React Router 6 路由
    ├── styles.css               ← Tailwind 入口（@tailwind base / components / utilities）
    ├── mobileUpdates.ts         ← OTA 客户端（notifyAppReady / check / download / set）
    ├── vite-env.d.ts            ← 自定义 import.meta.env 类型
    ├── test-setup.ts            ← Vitest 共享 setup（如需）
    ├── routes/                  ← 各页面 *.tsx（替代 Next.js app/）
    ├── lib/                     ← 产品特有工具（verifyQuote / detectCrisis / lintAction / llm.ts）
    └── components/              ← 产品特有组件
```

**已移除**：`app/`、`next.config.mjs`、`next-env.d.ts`、`.next/`、`pages/`（如有）、`app/api/`（API 全部迁到 `mvp/gateway/`）。

---

## package.json scripts（统一）

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "cap:sync": "npm run build && npx cap sync",
    "cap:ios": "npm run cap:sync && npx cap open ios",
    "cap:android": "npm run cap:sync && npx cap open android",
    "ota:publish": "MOBILE_UPDATE_VERSION=$(node -p \"require('./package.json').version\") ../../scripts/publish-bundle.sh <slug>"
  }
}
```

`<slug>` 用所在目录名（如 `02-countdown`）；`mvp/scripts/publish-bundle.sh` 会按 slug → appId 表映射。

> ⚠️ 当前 01 / 02 / 03 / 05 的 `ota:publish` 仍指向 `./scripts/publish-bundle.sh`，对应文件并不存在 —— **必须**改成 `../../scripts/publish-bundle.sh <slug>` 才能发版。见 integration-report.md follow-ups。

---

## vite.config.ts 模板（端口隔离 + define 注入）

```ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const productIndex = parseInt(env.VITE_PRODUCT_INDEX ?? '<N>', 10); // 1..5 对应自己

  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false, cssCodeSplit: true, minify: 'esbuild' },
    server: { port: 3000 + productIndex, strictPort: true },
    define: {
      __OTA_BACKEND_URL__: JSON.stringify(env.VITE_OTA_BACKEND_URL ?? 'https://mvp-ota.workers.dev'),
      __GATEWAY_URL__:     JSON.stringify(env.VITE_GATEWAY_URL     ?? 'https://mvp-gateway.workers.dev'),
      __APP_ID__:          JSON.stringify(env.VITE_APP_ID          ?? '<io.xxx.app>'),
      __APP_VERSION__:     JSON.stringify(env.MOBILE_UPDATE_VERSION ?? '0.0.0-dev'),
    },
  };
});
```

`src/vite-env.d.ts` 必须声明这些 define globals + 自定义 env：

```ts
/// <reference types="vite/client" />
declare const __OTA_BACKEND_URL__: string;
declare const __GATEWAY_URL__: string;
declare const __APP_ID__: string;
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_OTA_BACKEND_URL?: string;
  readonly VITE_APP_ID?: string;
}
```

---

## capacitor.config.ts 模板

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.<xxx>.app',                      // 见上表
  appName: '<产品中文名>',
  webDir: 'dist',
  // 注意：Capacitor 8 已废弃 bundledWebRuntime，不要再写该字段
  android: { allowMixedContent: true },
  server: { androidScheme: 'http', cleartext: true },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,                       // 我们手动控制时序
      appReadyTimeout: 15000,                  // 启动 15s 内未 notifyAppReady → 回滚
      responseTimeout: 120,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
      statsUrl: '',
    },
  },
};

export default config;
```

---

## LLM 调用约定（4 产品共用）

> 02 倒数日**不**调 LLM；本节针对 01 / 03 / 04 / 05。

**所有 LLM 请求一律走远端 gateway**，不再在客户端持有 API key：

```ts
// src/lib/llm.ts（每产品独立实现，结构相同）
const gatewayUrl = __GATEWAY_URL__;

export async function callGateway(payload: ...) {
  if (!gatewayUrl || gatewayUrl === '') return mockFallback(payload);   // dev 无 gateway → mock
  try {
    const res = await fetch(`${gatewayUrl}/<endpoint>`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`gateway HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[gateway] fallback to mock', err);
    return mockFallback(payload);   // **永远 mock 兜底，绝不抛给用户**
  }
}
```

**关键约束**：
1. **永远先实现 mock fallback**，离线 / 无 gateway / 网络异常都要可用。
2. **mock 数据必须真实可用**（不是 `{ result: "TODO" }`），完整结构化示例。
3. **服务端任何异常返回都不能让用户看到 500**；客户端必须 `try/catch` 降级到 mock。
4. **合规护栏不能只靠 client**（gateway 兜底强制 enforce）：
   - 03 `/diagnose` 出口跑 `lintAction`
   - 04 `/analyze-dream` 一级 crisis 命中 → 不调 LLM，返回 `{ redirectToCrisis: true }`
   - 05 `/generate-cards` 强制注入 `disclaimer`
5. 客户端**也要**跑同样的一级 crisis 检测（04 DreamInput 提交前先 `detectCrisis()`，命中直接 navigate，不发 fetch）。

---

## 环境变量（每个产品的 `.env.example`）

```bash
# vite dev 端口与 define 注入
VITE_PRODUCT_INDEX=2                                # → port 3002
VITE_APP_ID=io.countdownpro.app                     # Capacitor + OTA
VITE_GATEWAY_URL=https://mvp-gateway.workers.dev    # T4 共享 LLM 网关（02 不用，留空也可）
VITE_OTA_BACKEND_URL=https://mvp-ota.workers.dev    # T5 OTA 后端

# OTA 发布（不入 vite，只给 ./scripts/publish-bundle.sh 用）
# OTA_ADMIN_TOKEN=<wrangler secret 设置>
# MOBILE_UPDATE_VERSION=0.0.2
```

> LLM API key 全部移到 gateway 的 wrangler secrets，**客户端不再持有**。

---

## TypeScript 严格模式（每产品 tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": false,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts", "capacitor.config.ts"]
}
```

---

## Tailwind 配置（每个产品独立配色，格式统一）

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],   // 不再扫 app/ components/，全部在 src 下
  theme: {
    extend: {
      colors: { primary: '...', accent: '...', bg: '...' },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
```

```js
// postcss.config.js (ESM)
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

---

## Placeholder 组件（每产品有一份相同代码）

```tsx
// src/components/Placeholder.tsx
type PlaceholderProps = {
  kind: string;
  width?: number;
  height?: number;
  aspect?: string;
  caption: string;
  spec: string;
  className?: string;
};

export function Placeholder({ kind, width, height, aspect, caption, spec, className }: PlaceholderProps) {
  return (
    <div
      data-placeholder={kind}
      data-spec={spec}
      className={`flex items-center justify-center bg-stone-100 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 text-sm ${className || ''}`}
      style={{
        width:  width  ? `${width}px`  : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: aspect,
      }}
    >
      <div className="text-center p-4">
        <div className="opacity-50 text-xs uppercase">Placeholder</div>
        <div className="font-medium mt-1">{caption}</div>
        <div className="text-xs opacity-50 mt-1">id: {kind}</div>
      </div>
    </div>
  );
}
```

---

## Git ignore（每个产品独立 `.gitignore`）

```
node_modules/
dist/
.env
.env.local
.env.production
.DS_Store
*.log

# Capacitor
ios/App/Pods/
ios/App/build/
android/.gradle/
android/build/
android/app/build/
android/local.properties
```

---

## 移动壳工作流（iOS / Android 真机）

```bash
# 一次性（已为 5 产品全执行，工程文件入 git）
npx cap add ios
npx cap add android

# 每次改前端
npm run cap:sync           # = vite build + npx cap sync
npm run cap:ios            # 打开 Xcode
npm run cap:android        # 打开 Android Studio

# iOS 首次（需开发者证书）
# Capacitor 8 采用 SPM（CapApp-SPM），不再有 CocoaPods/Podfile，
# 依赖由 npx cap sync 拉取，Xcode 打开后自动解析 Swift Package。
```

---

## OTA 发布工作流（5 产品共用）

```bash
# 1. 设置 admin token（一次性，从 wrangler secret 拿）
export OTA_ADMIN_TOKEN=<token>

# 2. 改前端 → 构建
npm run build              # 产 dist/

# 3. 发版（slug 自动从 cwd 推断；version 自动从 package.json + timestamp）
../../scripts/publish-bundle.sh 02-countdown 0.0.2 ./dist
# 或 npm run ota:publish（package.json 已封装）
```

`mvp/scripts/publish-bundle.sh` 做的事：
1. zip dist → `/tmp/<slug>-<version>.zip`
2. sha256 校验
3. `wrangler r2 object put` → R2 bucket `mvp-ota-bundles/<appId>/<version>.zip`
4. `POST /admin/manifest` 写 manifest 到 KV
5. 客户端 2 分钟内自动检测 → 下载 → set bundle（详见 `mvp/ota-backend/README.md`）

---

## 检查清单（subagent 完成后必须自检）

- [ ] `npm install` 无 error
- [ ] `npm run type-check` 0 error
- [ ] `npm run build` 产 `dist/index.html`
- [ ] `npm test` 全过（如有 *.test.ts）
- [ ] `npm run dev` 启动后 `http://localhost:300<N>` 渲染正常
- [ ] mock 路径全跑通（无 gateway 也能用）
- [ ] `capacitor.config.ts` `appId` 在表中（无连字符）
- [ ] `npx cap sync` 无错
- [ ] README 包含 OTA 发布步骤
- [ ] codex-todo-illustrations.md 列出所有占位图

---

## 不允许的事

1. **不要修改其他 4 个产品目录**（每个 subagent 只动自己的 `mvp/products/0X-xxx/`）
2. **不要在客户端持有 LLM key**（全部走 gateway）
3. **不要在 client 一处放合规护栏**（gateway 必须有兜底）
4. **不要绕过 codex review 的合规约束**
5. **不要让 appId 用连字符**（Capacitor / Java package 不允许）
6. **不要让客户端真正 throw 500 给用户**（永远 try/catch + mock 兜底）

---

## 引用

- 母研究：`../vibe-coding-research-2026-05.md`
- 产品调研：`../light-products/01-05-research.md`
- 合规清单：`../light-products/compliance-checklist.md`
- 共享 Gateway 设计：`./openspec/changes/migrate-to-vite-capacitor-ota/design.md` § Gateway
- OTA Backend 设计：`./openspec/changes/migrate-to-vite-capacitor-ota/design.md` § OTA Backend
- 接口契约：`./openspec/changes/migrate-to-vite-capacitor-ota/contract.md`
- Gateway README：`./gateway/README.md`
- OTA Backend README：`./ota-backend/README.md`
- 发版脚本：`./scripts/publish-bundle.sh`
