# Design: 5 MVP Mobile Cross-Platform Migration

> Architect output. Two sections: § Gateway (T2, this section) + § Mobile Template / § OTA Backend (T3, appended).
> Companion docs: [`proposal.md`](./proposal.md), [`plan.md`](./plan.md), [`contract.md`](./contract.md).

---

## § Gateway

### Goals

- 把产品 01 / 03 / 04 / 05 的 4 个 Next.js API routes 全部迁到 **一个 Cloudflare Workers 后端** (`mvp/gateway/`)，产品端不再保留 server-side runtime。
- **选型确定**：Hono framework on Cloudflare Workers (`hono@^4`)。Hono 在 Workers 上 zero-cold-start、bundle 小、TypeScript 一等公民、和 4.x 路由抽象与 Next route handler 心智模型一致。
- **合规护栏全部在 gateway 服务端 enforce**（zero-trust 客户端）：
  - 03 `lintAction`（40+ 农药名 + 4 类剂量正则）在出口必跑一次
  - 04 `detectCrisis` 一级关键词命中 → **直接返回 redirect 标志，绝不调 LLM**
  - 05 `disclaimer` 字段服务端强制注入 + 禁词检测命中走 mock
- **mock fallback 完整保留**：无任何 LLM env key、超时、网络故障、上游 5xx 时返回与各产品 client 现有 mock 数据 **结构完全一致** 的回包，客户端代码 0 修改。
- **5xx 永远不返回给客户端**：所有未预期异常 → mock + 200，附 `warning` / `fallbackReason` 字段。
- 部署到 `staging.mvp-gateway.workers.dev`（subdomain 可配），通过 `wrangler deploy`。

### Non-Goals

- ❌ 不做 auth / 用户系统（MVP 阶段 anonymous，IP-based rate limit 足够）
- ❌ 不接付费链路（IAP / Stripe / 支付宝走客户端 IAP，不经 gateway）
- ❌ 不做 SSE / WebSocket / streaming response（4 个 endpoint 全 request-response，单次 < 30s）
- ❌ 不做日志持久化数据库（依赖 `wrangler tail` 实时日志 + Workers Analytics Engine 计数）
- ❌ 不做用户级配额 / billing meter（IP rate limit 即可）
- ❌ 不内嵌产品业务逻辑（如 01 的 `verifyQuote` / `classics-db.json` 保留在客户端，gateway 不接典籍 DB）
- ❌ 不做产品 02 倒数日的 endpoint（02 全本地，无 LLM 调用）

### Interface

完整 TypeScript 类型定义。implementer 直接用，不要重新设计。

```typescript
// =========================================================
// 通用：请求 / 响应公共字段
// =========================================================

/** 所有 endpoint 返回的元字段 (header 形式或 JSON 字段) */
type ProviderName = 'deepseek' | 'zhipu' | 'openai' | 'mock';

/** 通用错误响应 (仅 4xx 使用；5xx 永不出现，由 mock fallback 兜底成 200) */
type GatewayError = {
  error: {
    code:
      | 'invalid_json'
      | 'invalid_input'
      | 'payload_too_large'
      | 'rate_limited'
      | 'method_not_allowed';
    message: string;
    /** zod 校验失败时填，最多 5 条 */
    issues?: Array<{ path: string; message: string }>;
  };
};

/** Response headers (所有成功响应)
 * - X-Compliance-Sanitized: "true" 表示服务端跑过 lintAction / detectCrisis / disclaimer enforcer
 * - X-Provider: 实际生效的 provider
 * - X-Request-Id: ULID,wrangler tail 排查用
 * - X-RateLimit-Remaining: 当前 IP 剩余配额
 */

// =========================================================
// POST /generate-names  (产品 01)
// =========================================================

type NamingType = 'baby' | 'company' | 'pet' | 'nickname' | 'penname';
type Gender = '男孩' | '女孩';
type NameLength = '双字名' | '单字名' | '不限';
type SourcePref = '诗经' | '楚辞' | '唐诗' | '宋词' | '论语' | '周易' | '不限';

type GenerateNamesReq = {
  type: NamingType;                  // default 'baby'
  surname: string;                   // 1-4 char
  gender: Gender;
  name_length?: NameLength;
  vibe_tags: string[];               // 1-3 个 VibeTag
  taboo?: string;                    // max 200
  source_preference?: SourcePref;
};

type NameCandidate = {
  full_name: string;
  given_name: string;
  pinyin_full: string;
  pinyin_tones: string;
  source_book: string;
  source_chapter: string;
  original_quote: string;
  char_meanings: Record<string, string>;
  explanation: string;
  style_tag: string;
  gender_fit: string;
  stroke_count: number;             // >= 0 int
  use_warning: string;
};

type GenerateNamesResp = {
  /** **未经 verifyQuote 校验**。校验在客户端跑(保留 classics-db.json + verifyQuote.ts)，避免在 Workers 边缘加载大 JSON。 */
  names: NameCandidate[];           // 10 个,不足则 mock 补齐
  provider: ProviderName;
  warning?: string;                 // e.g. "fallback_to_mock" / "supplemented_with_mock"
};

// =========================================================
// POST /diagnose  (产品 03,含 base64 图片)
// =========================================================

type DiagnoseReq = {
  /** base64 data URL,e.g. "data:image/jpeg;base64,..."。客户端必须先压缩 < 200KB/张。 */
  images: string[];                  // 1-3 张
  waterFreq?: string;
  light?: string;
  soil?: string;
  description?: string;
  plantSelfReport?: string;
  city?: string;
};

type Likelihood = '高' | '中' | '低';
type Severity = '轻' | '中' | '重';
type CalendarType =
  | 'watering' | 'fertilizing' | 'lighting'
  | 'ventilation' | 'observation' | 'repotting' | 'consult';

type DiagnosisResult = {
  plant_name: string;
  scientific_name: string;
  confidence: number;                // 0..1
  image_quality_ok: boolean;
  image_quality_feedback: string;
  diagnosis: Array<{
    cause: string;
    likelihood: Likelihood;
    evidence: string;
    severity: Severity;
  }>;
  action_steps: string[];
  prognosis: {
    recovery_outlook: Likelihood;
    time_to_observe: string;
    fallback_if_fail: string;
  };
  calendar_30d: Array<{ day: number; action: string; type: CalendarType }>;
  disclaimer: string;
};

type DiagnoseResp = {
  ok: true;                          // 4xx 时 `ok: false` + GatewayError
  provider: ProviderName;
  result: DiagnosisResult;           // **已经 lintAction 清洗过**
  lint: {
    hits: number;
    fields: string[];                // 触发的字段路径,e.g. "action_steps[2]"
    matchedTokens: string[];         // 命中的 token,去重
  };
  fallbackReason?: string;
};

// =========================================================
// POST /analyze-dream  (产品 04,服务端先 detectCrisis 再决定调不调 LLM)
// =========================================================

type School = 'jungian' | 'freudian' | 'gestalt';

type AnalyzeDreamReq = {
  dreamText: string;                 // 1..8000 char
  mood?: string;
  school?: School;                   // default 'jungian'
  /** i18n,影响 crisis keyword 表; default zh-CN */
  locale?: 'zh-CN' | 'en-US';
};

type DreamAnalysis = {
  /** 服务端强制注入 DISCLAIMER_TOP,覆盖 LLM 输出 */
  disclaimer_top: string;
  key_symbols: string[];             // 1-6
  views: Array<{
    school: School;
    schoolLabel: string;             // e.g. "荣格视角"
    body: string;
  }>;
  psychology_view: string;
  reflection_questions: string[];    // 1-5
  emotion_tags: string[];            // 1-6
  /** 服务端强制注入 NEXT_STEP_DEFAULT(若 LLM 漏写) */
  next_step: string;
  crisis_alert: null | { level: 1 | 2 | 3; note: string };
};

type AnalyzeDreamResp = {
  /** 一级危机:服务端 detectCrisis 命中 level 1 时 true,客户端必须 navigate /crisis,不渲染 analysis */
  redirectToCrisis: boolean;
  crisisLevel: 0 | 1 | 2 | 3;
  provider: ProviderName;
  /** redirectToCrisis=true 时为 null */
  analysis: DreamAnalysis | null;
};

// =========================================================
// POST /generate-cards  (产品 05)
// =========================================================

type PetSpecies = 'cat' | 'dog' | 'unknown';
type AudioPitch = 'high' | 'low';
type AudioBurst = 'short_burst' | 'long_continuous' | 'silent';

type GenerateCardsReq = {
  petType: PetSpecies;
  petName: string;                   // 1..20 char
  audioDurationSec: number;          // 0..15
  audioFeatures: { pitch: AudioPitch; burst: AudioBurst };
};

type PetCard = {
  translation: string[];             // 3..5 句
  mood_tag: string;                  // 5 字内
  emoji_set: string[];               // length 3
  /** 服务端强制重写为 "⚠️ 仅供娱乐,AI 生成宠物心情卡片" */
  disclaimer: string;
};

type GenerateCardsResp = {
  card: PetCard;
  source: 'llm' | 'mock' | 'mock_fallback';
  provider: ProviderName;
  note?: string;
};
```

#### 路径汇总

| Endpoint | Method | Max Body | Timeout (上游 LLM) | Vision? |
|---|---|---|---|---|
| `/generate-names` | POST | 64 KB | 25 s | No |
| `/diagnose` | POST | 5 MB | 30 s | Yes |
| `/analyze-dream` | POST | 64 KB | 25 s | No |
| `/generate-cards` | POST | 16 KB | 8 s | No |
| `/health` | GET | — | — | — |

> `/health` 返回 `{ ok: true, version: <git-sha>, providers: { deepseek: bool, zhipu: bool, openai: bool } }`，但不暴露 key 本体。

### Behavior（服务端合规 enforce 详解）

#### 1. 04 一级 crisis 短路（最关键的安全门）

```
[client POST /analyze-dream]
   ↓ (body 解析 + zod 校验)
   ↓
detectCrisis(dreamText, locale)
   ↓
   ├─ level === 1 → return { redirectToCrisis: true, crisisLevel: 1,
   │                          provider: 'mock', analysis: null }
   │                **不调任何 LLM,不进入 callLlm**
   │
   ├─ level === 2 → callLlm() → 在 analysis.crisis_alert 注入
   │                            { level: 2, note: '检测到强烈负面情绪关键词,已附加关怀支持卡片。' }
   │
   ├─ level === 3 → callLlm() → 在 analysis.crisis_alert 注入
   │                            { level: 3, note: '检测到持续低落迹象,已附加温和的咨询建议。' }
   │
   └─ level === 0 → callLlm() → crisis_alert: null
```

- **行为对齐源码**：`/Users/bytedance/Documents/research/mvp/products/04-dream-journal/app/api/analyze-dream/route.ts:44-86`
- **关键词来源**：`crisisKeywords.ts` 中的 `CRISIS_KEYWORDS_ZH` / `CRISIS_KEYWORDS_EN` 双表，gateway 必须直接复用（拷贝 ts → 在 gateway repo 里），不要重新整理一份
- **`mock` provider 命中 level 2/3 时**：调 `buildSupportiveMockAnalysis(school, level)` 替代普通 mock，文字偏温和支持向（参见 `app/api/analyze-dream/route.ts:61-69`）

#### 2. 03 lintAction 二次清洗（双重保险）

```
[client POST /diagnose]
   ↓
diagnose(input)        ← LLM 调用(zhipu / openai / mock)
   ↓
lintDiagnosisResult(llmOutput.result)   ← **必跑**,不可跳过
   ↓ (返回 cleaned result + lint report)
JSON response { result: cleaned, lint: report }
```

- **lint 规则**：40+ 农药名 (`PESTICIDE_NAMES`) + 4 类正则（稀释比例 `\d+:\d+`、浓度 `Xml/L`、可湿性粉剂、喷洒次数）
- **行为**：命中任何字段 → 整段替换为 `请咨询本地园艺师或农资人员`，命中字段路径写进 `lint.fields`
- **客户端契约**：客户端**也跑一遍** lintAction（在 `03-plant-doctor` 里保留 `lib/lintAction.ts`），形成双重保险。gateway 响应 `lint.hits > 0` 时客户端可在 UI 上加一个角标"AI 输出经过自动安全过滤"
- **测试要求**：T4 实施时必须验证 `lintAction.test.ts` 现有 11 个 case（输入 `多菌灵 1:1000` / `5ml/L` / `波尔多液` 等）在 gateway 里全部跑通

#### 3. 05 disclaimer 强制注入 + 禁词降级

```
[client POST /generate-cards]
   ↓
generatePetCard(req)
   ├─ 调 LLM
   ├─ containsForbiddenTerms(card)?  ← 8 个禁词:翻译/准确/真实意图/真实还原/科学解读/分离焦虑/焦虑症/兽医
   │     └─ true → fallback mock,source='mock_fallback'
   └─ enforceDisclaimer(card)        ← disclaimer 字段强制写为常量 DISCLAIMER
   ↓
return { card, source, provider }
```

- **禁词列表来源**：`/Users/bytedance/Documents/research/mvp/products/05-pet-cards/lib/llm.ts:16-25`
- **disclaimer 常量**：`'⚠️ 仅供娱乐，AI 生成宠物心情卡片'`（即 `lib/types.ts:62`）

#### 4. 01 输出宽松解析（兼容多种 LLM JSON 包装）

- 复用 `extractCandidates()` 逻辑（`app/api/generate-names/route.ts:160-202`）：兼容 `{names:[]}` / `{data:[]}` / `{result:[]}` / `{candidates:[]}` / 顶层 array 五种包装
- **黑名单过滤**：保留 `filterByBlacklist`（19 字硬黑名单 + 13 字软黑名单标记），在 gateway 跑
- **verifyQuote / classics-db.json 不进 gateway**：典籍 DB 留在客户端（避免 Workers bundle > 1 MB），客户端拿到 candidates 后跑 `verifyQuote` 给 UI 加"已校验"角标
- **mock 补齐**：candidates < 5 时用 `buildMockNames(surname, gender)` 补齐到 5 个，warning 标 `supplemented_with_mock`

#### 5. mock fallback 触发条件 (所有 endpoint 通用)

按优先级：
1. 无任何 LLM env key (`pickProvider()` 返回 `mock`) → 直接返回 mock，warning `no_api_key`
2. LLM 返回非 200 / 网络异常 / 超时 → 重试 1 次 → 仍失败返回 mock，warning `<provider>_failed: <错误>`
3. LLM 返回内容无法解析为有效 JSON / zod schema 校验失败 → 返回 mock，warning `parse_failed`
4. LLM 输出含禁词（05）/ 一级 crisis 命中（04 不调 LLM）→ 返回特殊 mock

**关键不变量**：4 个 endpoint 在任何状态下 **永远返回 HTTP 200**（4xx 仅在客户端入参不合法/超限时返回；5xx 在设计上不出现）。

### LLM Provider Chain

#### 文本接口（01 / 04 / 05）

```
DEEPSEEK_API_KEY  (默认,deepseek-chat,api.deepseek.com)
   ↓ key 不存在 or 失败
ZHIPU_API_KEY     (glm-4-flash,open.bigmodel.cn)
   ↓
OPENAI_API_KEY    (gpt-4o-mini,api.openai.com)
   ↓
mock              (server-side mock,与各产品 client mock 数据结构完全一致)
```

#### 视觉接口（03 only）

```
ZHIPU_API_KEY     (glm-4v-flash, 主路径)
   ↓ key 不存在 or 失败
OPENAI_API_KEY    (gpt-4o-mini with image_url, 备用)
   ↓
mock              (mockSucculentBlackRot,固定多肉黑腐病 mock)
```

> **跳过 deepseek**：deepseek 本无视觉能力。`/Users/bytedance/Documents/research/mvp/products/03-plant-doctor/lib/llm.ts:34-38` 已确定的行为。

#### Workers Secrets 命名表

implementer 用 `wrangler secret put <NAME>` 注入。

| Secret Key | 用途 | 必填? |
|---|---|---|
| `DEEPSEEK_API_KEY` | 文本主路径 | 否(没就走链路下一档) |
| `ZHIPU_API_KEY` | 文本备路径 + 视觉主路径 | 推荐填 |
| `OPENAI_API_KEY` | 兜底 + 视觉备路径 | 否 |
| `DEEPSEEK_BASE_URL` | 覆盖默认 endpoint(自部署/代理用) | 否 |
| `ZHIPU_BASE_URL` | 同上 | 否 |
| `OPENAI_BASE_URL` | 同上 | 否 |

非密钥的可放 `wrangler.toml [vars]`：`DEEPSEEK_MODEL` / `ZHIPU_MODEL` / `OPENAI_MODEL` / `ZHIPU_VISION_MODEL` 等。

### Rate Limit

#### KV 计数器实现要点

- Workers KV namespace 名：`RATE_LIMIT_KV`（实际名字 implementer 决定，详见 Open Questions）
- 计数 key 格式：`rl:<endpoint>:<ip>:<minute_bucket>`，TTL 70 秒（覆盖一个完整窗口 + 10s 缓冲）
- IP 取值优先级：`CF-Connecting-IP` > `X-Forwarded-For` 首段 > `request.headers.get('cf-ipcountry')` fallback `"anon"`

#### 配额

| Endpoint | 配额 | 超限响应 |
|---|---|---|
| `/generate-names` | **60 req/min/IP** | 429 `{ error: { code: 'rate_limited', ... } }` |
| `/analyze-dream` | **60 req/min/IP** | 同上 |
| `/generate-cards` | **60 req/min/IP** | 同上 |
| `/diagnose`（视觉） | **10 req/min/IP** ⚠️ 单独低配额，成本控制 | 同上 |

429 响应必含 header `Retry-After: 60`。

#### Body 大小

- `/diagnose`：上限 5 MB（3 张 base64 图片 × ≤200KB 约 800KB，留 5x 余量；超 5MB 拒收 → 413 `payload_too_large`）。这一上限低于 Workers 100MB 硬限，便于 implementer 早 reject 节省 CPU 时间
- 其他 endpoint：上限 64 KB

### CORS

- `Access-Control-Allow-Origin`: 见 Open Questions。MVP 阶段 implementer 可先用 `*`（anonymous + 无 cookie + 无敏感写操作），上线前收窄
- `Access-Control-Allow-Methods`: `POST, GET, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, X-Request-Id`
- `OPTIONS` preflight 永远返回 204 + 上述 headers，不走任何业务逻辑

### Error Handling

#### 4xx（结构化 JSON，客户端可解析）

| Code | 触发条件 | HTTP Status |
|---|---|---|
| `invalid_json` | request body 不是合法 JSON | 400 |
| `invalid_input` | zod 校验失败 | 400 |
| `payload_too_large` | body 超 endpoint 上限 | 413 |
| `rate_limited` | KV 计数器超额 | 429 |
| `method_not_allowed` | 非 POST（`/health` 除外） | 405 |

**例外**：05 `/generate-cards` 的 `invalid_input` **不返回 4xx**，而是按现有行为返回 200 + mock + `note: "入参不合法: ..."`，**保持用户体验底线**（参见 `app/api/generate-cards/route.ts:18-29`）。这是 05 的特殊行为，其他 3 个 endpoint 仍走标准 4xx。

#### 5xx（永远不应该出现）

- 任何未被 catch 的异常 → Hono 顶层 `onError` 中间件兜底
- 返回 mock + 200，附 `warning: 'unexpected_error: <message>'`
- 同步 `console.error` 到 `wrangler tail`

#### 超时分级

| 阶段 | 上限 | 行为 |
|---|---|---|
| Gateway 自身处理（解析 + lint + 路由） | 2 s 软上限 | 不强制中断 |
| LLM 单次调用（文本） | 25 s | AbortController 中断 → fallback mock |
| LLM 单次调用（视觉，03） | 30 s | 同上 |
| LLM 单次调用（05，原 8s） | 8 s | 同上(05 用户在等录音卡片,容忍度低) |
| 重试 | 文本最多 1 次重试，视觉不重试 | 第一次失败等 800ms 再试 |

> Workers 默认 CPU time 上限 30s（付费版可调）。implementer 注意 25+30 不能叠加，超时设计应避免重试导致总时长超 30s。

### Open Questions（implementer 自行决定）

1. **Hono 版本**：用 `hono@^4`（4.x 是当前 stable）。是否要锁到具体 minor 由 implementer 在 `package.json` 决定。
2. **KV namespace 名称**：建议 `RATE_LIMIT_KV`，但 implementer 可改名（同步改 `wrangler.toml`）。生产 / staging 是否分两个 namespace 也由 implementer 定。
3. **Workers Cache for /diagnose**：是否启用图片 hash（SHA-256 of base64）→ Cache API 去重，节省 vision LLM 成本？建议**先不启用**，T11 集成时若发现成本问题再开。开启时 cache TTL 24h，hash 用前 100KB 数据做 fingerprint 防止 OOM。
4. **CORS Origin 白名单**：MVP 阶段 `*` 即可。上线前应收窄到 `https://01-naming.app` / `https://03-plant.app` / `https://04-dream.app` / `https://05-pet.app` + Capacitor `capacitor://localhost` + `http://localhost:5173`（Vite dev）。
5. **`/diagnose` 是否走 stream/分片上传**：5MB body 在 Workers 单 request 是 OK 的，但若用户网络差可能慢。MVP 不优化；T11 时若复盘有 timeout 抱怨再加 `multipart/form-data` 分片。
6. **Mock 数据放在 gateway 还是产品端**：建议两边都放（gateway 用作服务端 fallback；产品端用作离线 fallback，OTA 检查失败 / 网络挂时 client 直接 mock）。两份 mock 数据**结构必须完全一致**（implementer 在 T4 / T7-T10 之间做对齐）。
7. **`X-Request-Id` 生成位置**：客户端传则用客户端的，否则 gateway 用 `crypto.randomUUID()` 生成。decision 留给 implementer。

### 部署 / 本地命令

implementer 在 `mvp/gateway/README.md` 里固化以下命令：

```bash
# 本地 dev (Miniflare)
npm run dev               # = wrangler dev --local

# Secrets 注入(部署前)
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put ZHIPU_API_KEY
wrangler secret put OPENAI_API_KEY  # 可选

# 部署
npm run deploy            # = wrangler deploy

# 实时日志(排查 mock fallback 原因)
wrangler tail

# 健康检查
curl https://<workers-subdomain>.workers.dev/health
```

---

## § Mobile Template

### Goals

5 个 MVP（01 起名、02 倒数日、03 植物医生、04 梦境日记、05 宠物心情卡片）共用同一套 Vite + Capacitor + OTA 骨架，差异只在业务逻辑（`src/components/` + `src/lib/` + `src/routes/`）。骨架收敛：

- 同一份 `vite.config.ts` / `tsconfig.json` / `tailwind.config.ts` / `postcss.config.js`
- 同一份 `capacitor.config.ts` 模板（只参数化 `appId` / `appName`）
- 同一份 `mobileUpdates.ts` 客户端（参数化 `appId` + `apiBaseUrl` + localStorage key prefix）
- 同一组依赖版本（5 个 `package.json` 严格对齐，避免漂移）
- 同一组路由 / 入口模板（`src/main.tsx` + `src/App.tsx`）

骨架物化为 `mvp/shared-mobile-template/`，**作为 reference + copy 源**而不是 npm package（避免 monorepo workspace 复杂度，MVP 阶段 5 个产品独立 install）。

### Non-Goals

- 不抽 monorepo（5 product 独立 `node_modules`）
- 不做 SSR / SSG（Vite 全 client-side，OTA bundle 即 dist 静态产物）
- 不做共享 UI 库 / design system（每个产品视觉强差异）
- 不接真实推送 / IAP（保留现状 mock）

### 5 个产品命名表

> **2026-05-28 修订（T6 实施反馈）**：Capacitor CLI 强制 `appId` 必须是 Java package 形式（`a-z0-9` + `.`，**禁连字符**）。原表里 5 个 appId 含 `-`，`npx cap add ios` 会报 `Invalid App ID`。已统一改为无连字符版本。R2 / KV 的命名也跟着改（OTA backend manifest key 是 `manifest:<appId>`）。

| Slug | 产品 | `appId`（iOS Bundle ID + Android applicationId） | `appName` | Vite dev port |
|---|---|---|---|---|
| 01 | 诗经起名 | `io.shijingnaming.app` | 诗经起名 | 3001 |
| 02 | 倒数日 Pro | `io.countdownpro.app` | 倒数日 Pro | 3002 |
| 03 | AI 植物医生 | `io.plantdoctor.app` | AI 植物医生 | 3003 |
| 04 | 梦境日记 | `io.dreamjournal.app` | 梦境日记 | 3004 |
| 05 | 宠物心情卡片 | `io.petcards.app` | 宠物心情卡片 | 3005 |

**约束**：`appId` 一旦发布到 App Store / TestFlight 不可改，OTA `manifest:<appId>` 是 KV primary key，迁移成本巨大 → 在 T3 阶段必须 final。命名采用 `io.<slug>.app` 反域名，无需真实持有 `io` 域名（App Store 允许）。

### Vite 项目标准目录结构

每个产品（如 `mvp/products/02-countdown/`）迁移后形如：

```
products/0X-<slug>/
├── index.html               # Vite 入口，<div id="root"></div>
├── vite.config.ts           # 共享模板（仅 port 不同）
├── tsconfig.json            # 共享模板
├── tailwind.config.ts       # 共享模板（content glob 含 src/**）
├── postcss.config.js        # 共享模板
├── package.json             # 共享依赖版本
├── capacitor.config.ts      # 模板，仅 appId/appName 不同
├── src/
│   ├── main.tsx             # ReactDOM.createRoot + BrowserRouter + startMobileUpdateRuntime()
│   ├── App.tsx              # <Routes> 配置 + global providers (theme/store)
│   ├── routes/              # 每个路由对应一个 .tsx 文件
│   │   ├── HomePage.tsx
│   │   └── ...
│   ├── components/          # 业务组件（从原 Next.js components/ 直接复制，去 'use client'）
│   ├── lib/                 # 业务逻辑（绝大多数复用，store / themes / etc.）
│   ├── mobileUpdates.ts     # OTA 客户端（每产品独立拷贝，appId 不同）
│   └── styles.css           # Tailwind directives + global CSS
├── public/                  # Vite static assets (favicon, og image, etc.)
├── ios/                     # npx cap add ios 生成；纳入 git
├── android/                 # npx cap add android 生成；纳入 git
└── scripts/
    └── publish-bundle.sh -> ../../shared-mobile-template/scripts/publish-bundle.sh  # symlink，或各产品自己一份
```

`ios/` `android/` 是否进 git：**进**。原生工程一旦 generate 后可能含手工改动（Info.plist 权限、icons、widget extension stub），不进 git 会丢失。

### `capacitor.config.ts` 模板

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.countdownpro.app",        // ← 每产品替换（必须 Java package 形式，不允许连字符）
  appName: "倒数日 Pro",                  // ← 每产品替换
  webDir: "dist",                       // Vite 默认产物目录
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,            // 兼容 ota-backend http(s) 混合（dev）
  },
  server: {
    androidScheme: "http",
    cleartext: true,
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,                // 业务侧手动 check（与 ai-baby 一致）
      appReadyTimeout: 15000,           // 15s 未 notifyAppReady → 回滚
      responseTimeout: 120,             // 单次 http 超时秒数
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,            // 装新原生包后清空已下载 OTA bundle
      statsUrl: "",                     // 关闭 capgo 默认统计上报
    },
    // 产品 03 额外：
    // Camera: { permissions: ["camera", "photos"] },
    // 产品 05 / 04 额外：
    // VoiceRecorder: {},  // @capacitor-community/voice-recorder 自带配置
  },
};

export default config;
```

**5 个产品差异化**仅限于：`appId` / `appName` / 业务相关 plugin 块。其余字段（OTA 配置）**严格一致**——这是后续可批量升级 OTA 行为的前提。

### `package.json` 标准依赖列表

5 个产品 `package.json` 的 `dependencies` / `devDependencies` 块强制一致（业务多出的字段除外，如 02 的 `zustand`、04 的 `date-fns`）：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "cap:sync": "npm run build && npx cap sync",
    "cap:ios": "npm run cap:sync && npx cap open ios",
    "cap:android": "npm run cap:sync && npx cap open android",
    "ota:publish": "MOBILE_UPDATE_VERSION=$(node -p \"require('./package.json').version\") ./scripts/publish-bundle.sh"
  },
  "dependencies": {
    "@capacitor/android": "^6.1.2",
    "@capacitor/core": "^6.1.2",
    "@capacitor/ios": "^6.1.2",
    "@capgo/capacitor-updater": "^6.6.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "^6.26.1",
    "lucide-react": "0.408.0",
    "zod": "3.23.8"
    /* 产品差异：
       02: + zustand 4.5.4, date-fns 3.6.0, html2canvas 1.4.1
       03: + html2canvas 1.4.1, @capacitor/camera ^6.0.2
       04: + date-fns 3.6.0, html2canvas 1.4.1, @capacitor-community/voice-recorder ^6.0.0
       05: + html2canvas 1.4.1, @capacitor-community/voice-recorder ^6.0.0
       01: + html2canvas 1.4.1
    */
  },
  "devDependencies": {
    "@capacitor/cli": "^6.1.2",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.39",
    "tailwindcss": "3.4.6",
    "typescript": "5.5.3",
    "vite": "^5.4.6",
    "vitest": "^2.1.1"
  }
}
```

**关键决策**：
- **Capacitor 6.x**：当前 LTS，Xcode 15+ / Android API 34 兼容。原任务 prompt 标 `^7.x` Capgo Updater，但 `@capgo/capacitor-updater@7.x` 要求 Capacitor 7（仍 beta，2025-Q4 才稳定）。这里固定 **Capacitor 6 + capacitor-updater 6.x**，与 ai-baby 同栈，降低风险。如未来要升 7，整 5 产品同步升。
- **React 18.3.1** 锁死：与 5 产品当前一致，避免 React 19 RC + Capacitor 兼容性试错。
- **Vitest 而非 Jest**：Vite 原生，5 产品的 lintAction / detectCrisis 测试迁移成本最低（`node --test --import tsx` → `vitest`）。

### `vite.config.ts` 模板

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const productIndex = parseInt(env.VITE_PRODUCT_INDEX ?? "2", 10);
  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") }, // 兼容原 Next.js "@/lib/..." import
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      cssCodeSplit: true,
      minify: "esbuild",
    },
    server: {
      port: 3000 + productIndex,    // 3001-3005
      strictPort: true,
    },
    define: {
      __OTA_BACKEND_URL__: JSON.stringify(env.VITE_OTA_BACKEND_URL ?? "https://mvp-ota.workers.dev"),
      __GATEWAY_URL__: JSON.stringify(env.VITE_GATEWAY_URL ?? "https://mvp-gateway.workers.dev"),
      __APP_ID__: JSON.stringify(env.VITE_APP_ID ?? "io.unknown.app"),
      __APP_VERSION__: JSON.stringify(env.MOBILE_UPDATE_VERSION ?? "0.0.0-dev"),
    },
  };
});
```

`VITE_PRODUCT_INDEX` / `VITE_APP_ID` 通过各产品 `.env` 文件注入：

```ini
# products/02-countdown/.env
VITE_PRODUCT_INDEX=2
VITE_APP_ID=io.countdownpro.app
VITE_OTA_BACKEND_URL=https://mvp-ota.workers.dev
VITE_GATEWAY_URL=https://mvp-gateway.workers.dev
```

### `src/main.tsx` 模板

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { startMobileUpdateRuntime } from "./mobileUpdates";
import "./styles.css";

startMobileUpdateRuntime();   // OTA 自检：notifyAppReady + delayed check

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

### `src/App.tsx` 模板（按产品填充 routes）

```typescript
import { Routes, Route } from "react-router-dom";
import HomePage from "./routes/HomePage";
// ... 业务路由 import

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 产品 02 示例：
      <Route path="/new" element={<NewPage />} />
      <Route path="/:id" element={<DetailPage />} />
      <Route path="/:id/edit" element={<EditPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      */}
    </Routes>
  );
}
```

### `mobileUpdates.ts` 移植清单

从 ai-baby `frontend/src/mobileUpdates.ts` 整文件复制 → 每产品 `src/mobileUpdates.ts`，**改 4 处**：

1. **第 4 行**：删除 `import { apiBaseUrl, apiFetch } from "./authApi"` → 改为
   ```typescript
   const apiBaseUrl = __OTA_BACKEND_URL__;     // Vite define 注入
   const apiFetch = (url: string, init?: RequestInit) => fetch(url, init);
   ```
   （ai-baby 的 `apiFetch` 带认证 header；MVP 阶段 OTA backend 是公开接口，无需认证）。
2. **第 6 行 `LAST_CHECK_AT_KEY`**：`xiaobao-mobile-update-last-check-at` → 每产品独立，避免 5 个 app 共用同一台模拟器测试时互相干扰：
   ```typescript
   const LAST_CHECK_AT_KEY = `${__APP_ID__}.mobile-update-last-check-at`;
   ```
3. **第 8 行 `MOBILE_UPDATE_NOTICE_EVENT`**：同上 prefix 化
   ```typescript
   export const MOBILE_UPDATE_NOTICE_EVENT = `${__APP_ID__}.mobile-update-notice`;
   ```
4. **第 58 行 endpoint**：`/api/mobile-updates/check` → `/mobile-updates/check`（OTA backend 不带 `/api` 前缀，见 § OTA Backend）。第 62 行 `appId` 写死的 `com.xiaobao.growthcompanion` → `__APP_ID__`。

其余逻辑（频控 60s / setTimeout 2500ms / download progress event / set vs next 切换 / 失败 toast）**原样保留**。这是 ai-baby 生产验证过的时序，contract.md §1 + §7 已固化。

### 路由迁移规则（Next.js App Router → React Router 6）

| Next.js | React Router 6 | 备注 |
|---|---|---|
| `app/page.tsx` | `<Route path="/" element={<HomePage />}>` | 复制 component body，去 `'use client'` |
| `app/foo/page.tsx` | `<Route path="/foo" element={<FooPage />}>` | |
| `app/[id]/page.tsx` | `<Route path="/:id" element={<DetailPage />}>` | `useParams<{id:string}>()` 取 |
| `app/[id]/edit/page.tsx` | `<Route path="/:id/edit" element={<EditPage />}>` | |
| `useRouter().push(x)` | `useNavigate()(x)` | |
| `useSearchParams()` | `useSearchParams()` (react-router) | API 略不同 |
| `<Link href="/x">` | `<Link to="/x">` (react-router) | import 改 |
| `app/api/foo/route.ts` | **删除** | 已迁到 gateway，client `fetch(__GATEWAY_URL__ + "/foo")` |
| `app/layout.tsx` | 拆：`<head>` 内容进 `index.html` / `<body>` 内 provider 进 `App.tsx` |  |
| `globals.css` | `src/styles.css` | Tailwind directives 不动 |
| `'use client'` | **全删** | Vite 整个 client，无需标记 |

**5 个产品的具体路由表**（implementer T6-T10 直接照抄）：

| 产品 | 路由（路径 → component） |
|---|---|
| 01 起名 | `/` `HomePage` · `/:type` `TypePage` · `/:type/result` `ResultPage` · `/poster/:id` `PosterPage` · `/pricing` `PricingPage` |
| 02 倒数日 | `/` `ListPage` · `/new` `NewPage` · `/:id` `DetailPage` · `/:id/edit` `EditPage` · `/settings` `SettingsPage` |
| 03 植物医生 | `/` `HomePage` · `/capture` `CapturePage` · `/diagnose` `DiagnosePage` · `/result/:id` `ResultPage` · `/my-plants` `MyPlantsPage` · `/about` `AboutPage` |
| 04 梦境日记 | `/` `HomePage` · `/analyzing` `AnalyzingPage` · `/result/:id` `ResultPage` · `/timeline` `TimelinePage` · `/monthly` `MonthlyPage` · `/crisis` `CrisisPage` · `/about` `AboutPage` |
| 05 宠物心情卡片 | `/` `HomePage` · `/recording` `RecordingPage` · `/analyzing` `AnalyzingPage` · `/result/:id` `ResultPage` · `/poster/:id/:style` `PosterPage` · `/history` `HistoryPage` · `/about` `AboutPage` |

### `tsconfig.json` 模板

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": false,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src/**/*", "vite.config.ts"]
}
```

### 平台打包流程（implementer 验证清单）

每个产品迁移完成后须验证（**只验证 build，不实际签名上架**）：

1. `npm install` 不报错
2. `npm run type-check` 通过
3. `npm run build` 产出 `dist/index.html` + `dist/assets/*.js,css`
4. `npx cap add ios` 生成 `ios/App/App.xcodeproj`
5. `npx cap add android` 生成 `android/app/build.gradle`
6. `npx cap sync` 把 `dist/` 同步到 native 工程的 `public/` 目录
7. `npx cap open ios` 能成功唤起 Xcode 项目（不要求真机 / 模拟器跑通——那是 T11 的事）
8. `npx cap open android` 能成功唤起 Android Studio

**对 implementer 的要求**：完成 1-6，**8 / 7 不强制**（受限于本机 Xcode / Android Studio 安装状态）。T11 integrator 阶段会在专门有 Mac + Xcode 的环境跑模拟器端到端。

### Open Questions（implementer 决策）

1. **`html2canvas` 在 native WebView 是否兼容**：02 / 04 / 05 都用它生成海报。Capacitor 6 + WKWebView 已知有 canvas 跨域限制 → 可能要换成截屏走 `@capacitor/screenshot` 或 server-rendered。**先按现状迁，T11 实测如挂再换**。
2. **iOS Widget 是否一并迁移**：02 倒数日有 `ios-widget-todo.md`，原 Next.js 时代没做。Capacitor 不直接支持 WidgetKit → 需在 `ios/App/App/` 下手写 SwiftUI extension target。**MVP 阶段不做，保留 todo**。
3. **`zustand persist middleware` 是否兼容 Capacitor Preferences**：02 的 store 当前 `localStorage`，native WebView 内 `localStorage` 可用但会被系统清理 → 迁到 `@capacitor/preferences` 更可靠。**implementer 自行权衡**（迁移成本 vs 数据丢失风险）。
4. **`<input capture>` vs Capacitor Camera plugin**：03 现状用 `<input type="file" capture="environment">`，iOS WebView 兼容性可。Camera plugin 体验更佳（实时预览） → 是 plan T8 的明确 scope，依 implementer 完成度。
5. **`MediaRecorder` vs Voice Recorder plugin**：04 / 05 都依赖语音输入。iOS WKWebView `MediaRecorder` 长期 broken → **必须** 用 `@capacitor-community/voice-recorder`，plan T9 / T10 已明确。

---

## § OTA Backend

### Goals

为 5 个产品（5 个独立 `appId`）提供**统一**的 OTA 后端，承担：

- `POST /mobile-updates/check`：客户端版本检查（5 产品复用同一 endpoint，按 `appId` 路由）
- `POST /admin/manifest`：发布脚本上报新 bundle 版本（受 admin token 保护）
- bundle 二进制存储 + 临时签名下载 URL 颁发（5 分钟有效）

后端独立部署到 `mvp-ota.workers.dev`（与 `mvp-gateway.workers.dev` 不同 Worker）：OTA 是发布基础设施，与 LLM gateway 解耦。

### Non-Goals

- 不接 IAP / 计费（仅做 bundle 分发）
- 不做 A/B 灰度（未来 enhancement，MVP 全量发布）
- 不做客户端遥测上报（Capgo 自带 stats 已禁用 `statsUrl: ""`）
- 不做 bundle 历史版本 GC（KV history 数组无限增长 ≤ MVP 数月内无忧）

### 选型

| 组件 | 选型 | 理由 |
|---|---|---|
| 后端框架 | **Hono on Cloudflare Workers** | 与 gateway 同栈；Workers 免费 100K req/day / 10ms CPU；边缘部署延迟低 |
| Manifest 存储 | **Cloudflare KV** (namespace `OTA_MANIFEST`) | 单 manifest << 100KB，KV 适合；read 强一致 across edge（写入 60s 内最终一致） |
| Bundle 二进制存储 | **Cloudflare R2** (bucket `mvp-ota-bundles`) | S3 兼容；与 Workers 同 zone 出口流量免费；私有桶 + 签名 URL |
| 签名 URL | **`aws4fetch`** lib 内部生成 R2 presigned GET URL | Workers 不能跑 AWS SDK Java/Node；`aws4fetch` 是纯 Web Crypto 实现 ~5KB |
| Admin auth | **Bearer token via env `OTA_ADMIN_TOKEN`** | MVP 不上 OAuth；发布脚本本地 `wrangler secret` 注入 |

### 项目结构

```
mvp/ota-backend/
├── package.json
├── tsconfig.json
├── wrangler.toml
├── src/
│   ├── index.ts            # Hono app 入口；export default app
│   ├── routes/
│   │   ├── check.ts        # POST /mobile-updates/check
│   │   └── admin.ts        # POST /admin/manifest + GET /admin/manifest/:appId
│   ├── lib/
│   │   ├── manifest.ts     # KV read/write helpers
│   │   ├── r2-presign.ts   # aws4fetch presigned URL 生成
│   │   ├── version.ts      # compareVersions() 移植自 contract §2
│   │   └── auth.ts         # admin bearer 验证
│   └── types.ts            # CheckReq / CheckResp / Manifest
├── tests/
│   ├── check.test.ts       # vitest + miniflare
│   └── admin.test.ts
└── README.md
```

### API Contract

#### `POST /mobile-updates/check`

入参（同 contract.md §2）：

```typescript
type CheckReq = {
  appId: string;                    // 必填，5 产品之一；未识别 appId → enabled:false
  platform: "ios" | "android" | "web";
  nativeVersion: string;            // 如 "0.0.1"
  currentBundleId?: string;
  currentBundleVersion?: string;    // 用于比对 manifest.current.version
};
```

出参：

```typescript
type CheckResp = {
  enabled: boolean;
  updateAvailable: boolean;
  version?: string;                 // 例 "0.0.2-20260528..."
  url?: string;                     // R2 presigned GET URL，TTL 5min
  checksum?: string;                // sha256 hex
  minNativeVersion?: string;
  message?: string;                 // 给客户端 toast 显示的中文说明
};
```

**判定逻辑**（伪代码，参照 contract §2）：

```typescript
async function check(req: CheckReq, env: Env): Promise<CheckResp> {
  const manifest = await readManifest(env.OTA_MANIFEST, req.appId);
  if (!manifest || !manifest.current) return { enabled: false, updateAvailable: false };
  if (manifest.enabled === false) return { enabled: false, updateAvailable: false };

  const current = manifest.current;
  // native 版本兜底检查
  if (current.minNativeVersion && compareVersions(req.nativeVersion, current.minNativeVersion) < 0) {
    return { enabled: true, updateAvailable: false, version: current.version,
             minNativeVersion: current.minNativeVersion,
             message: "需要先升级到最新原生包" };
  }
  // 字符串相等 → upToDate（沿用 ai-baby 不做语义比较）
  if (req.currentBundleVersion === current.version) {
    return { enabled: true, updateAvailable: false, version: current.version,
             message: "当前已是最新版本" };
  }
  // 签发临时 URL
  const url = await signR2GetUrl(env, current.r2Key, 300);
  return {
    enabled: true,
    updateAvailable: true,
    version: current.version,
    url,
    checksum: current.checksum,
    minNativeVersion: current.minNativeVersion,
    message: current.message,
  };
}
```

#### `POST /admin/manifest`

发布脚本调用，写入新 bundle 版本。

入参：

```typescript
type PublishReq = {
  appId: string;
  version: string;
  r2Key: string;                    // 例 "io.countdownpro.app/0.0.2.zip"
  checksum: string;                 // sha256 hex
  minNativeVersion?: string;
  message?: string;
};
```

出参：`{ ok: true, manifest: Manifest }` / 401 / 400

**鉴权**：`Authorization: Bearer <OTA_ADMIN_TOKEN>`，token 比对走常量时间比较防 timing attack。

**写入逻辑**：把当前 `manifest.current` 推入 `history`（数组 max len 20，超过滚动），写入新 `current`。

#### `GET /admin/manifest/:appId`

读取 manifest 用于发布脚本验证（同样 admin token 保护）。

### Manifest KV 结构

KV key 命名：`manifest:<appId>`，例 `manifest:io.countdownpro.app`。

```json
{
  "appId": "io.countdownpro.app",
  "enabled": true,
  "current": {
    "version": "0.0.2-20260528120000",
    "uploadedAt": "2026-05-28T12:00:00.000Z",
    "uploadedBy": "yaoyibin.vi",
    "minNativeVersion": "0.0.1",
    "r2Key": "io.countdownpro.app/0.0.2-20260528120000.zip",
    "checksum": "sha256-hex-string-64-chars",
    "message": "修复倒数日详情页崩溃"
  },
  "history": [
    {
      "version": "0.0.1-20260527120000",
      "uploadedAt": "2026-05-27T12:00:00.000Z",
      "r2Key": "io.countdownpro.app/0.0.1-20260527120000.zip",
      "checksum": "..."
    }
  ]
}
```

**字段说明**：
- `enabled`：per-app 总开关。`false` 则 check 接口直接返回 `{enabled:false}`（应急熔断用）。
- `uploadedBy`：发布脚本读 `$USER` env，可空。
- `history` max length 20，第 21 条 push 时 shift 最早一条；同时**不删** R2 object（成本极低，回滚能力优先）。

### R2 存储约定

- Bucket：`mvp-ota-bundles`（单 bucket 容纳 5 产品；按 prefix 隔离）
- Object key：`<appId>/<version>.zip`
  - 例 `io.countdownpro.app/0.0.2-20260528120000.zip`
  - **不**用 product slug（如 `02-countdown/`）—— appId 是唯一稳定 key，slug 可能改名
- Content-Type：`application/zip`
- Cache-Control：`public, max-age=31536000, immutable`（zip 内容由 version hash 标识，可长期缓存）
- **zip 内必须 `index.html` 在根**（contract §4，硬性约束）

**桶选型**：单 bucket 共享。理由：
- 5 产品总 bundle size 预期 << 1GB，R2 免费额度 10GB
- 单 wrangler.toml R2 binding 简单
- 权限管理：MVP 阶段无需 per-product 隔离（admin token 全局）

未来分桶时机：某产品 bundle > 100MB / 需要不同 retention 策略。

### `aws4fetch` R2 Presigned URL 生成

```typescript
// src/lib/r2-presign.ts
import { AwsClient } from "aws4fetch";

export async function signR2GetUrl(env: Env, key: string, ttlSeconds = 300): Promise<string> {
  const aws = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
  // R2 S3 endpoint：https://<account-id>.r2.cloudflarestorage.com
  const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(ttlSeconds));
  const signed = await aws.sign(new Request(url, { method: "GET" }), { aws: { signQuery: true } });
  return signed.url;
}
```

**TTL 决策**：5 分钟（vs ai-baby 24h）。
- 客户端拿到 URL 后立即开始 download，下载完成通常 < 30s（bundle 体积 << 5MB）
- 短 TTL 防止 URL 被截获后长期复用
- 缺点：客户端弱网失败需重新 check → 可接受（频控 60s 内不会风暴重发）

### `wrangler.toml`

```toml
name = "mvp-ota"
main = "src/index.ts"
compatibility_date = "2026-05-01"
workers_dev = true

[[kv_namespaces]]
binding = "OTA_MANIFEST"
id = "<填生产 KV namespace id>"
preview_id = "<填 preview KV namespace id>"

[[r2_buckets]]
binding = "OTA_BUCKET"
bucket_name = "mvp-ota-bundles"
preview_bucket_name = "mvp-ota-bundles-dev"

[vars]
R2_ACCOUNT_ID = "<account-id>"
R2_BUCKET_NAME = "mvp-ota-bundles"

# Secrets via `wrangler secret put`：
# - OTA_ADMIN_TOKEN
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
```

### `publish-bundle.sh` 设计

发布脚本设计为**单一入口**，5 个产品复用同一份。每个产品 `mvp/products/0X-xxx/scripts/publish-bundle.sh` 是 symlink → `mvp/shared-mobile-template/scripts/publish-bundle.sh`。

```bash
#!/usr/bin/env bash
# scripts/publish-bundle.sh
# Usage:
#   APP_ID=io.countdownpro.app \
#   MOBILE_UPDATE_VERSION=0.0.2 \
#   MOBILE_UPDATE_MESSAGE="修复 xxx" \
#   ./publish-bundle.sh
#
# 默认从当前 cwd 的 package.json 读取 version，从 .env 读 APP_ID。

set -euo pipefail

# 1. 加载 .env
[[ -f .env ]] && source .env

APP_ID="${APP_ID:-${VITE_APP_ID:?VITE_APP_ID required}}"
VERSION="${MOBILE_UPDATE_VERSION:-$(node -p "require('./package.json').version")-$(date +%Y%m%d%H%M%S)}"
DIST_DIR="${DIST_DIR:-dist}"
MIN_NATIVE_VERSION="${MOBILE_UPDATE_MIN_NATIVE_VERSION:-}"
MESSAGE="${MOBILE_UPDATE_MESSAGE:-}"
OTA_BACKEND_URL="${VITE_OTA_BACKEND_URL:-https://mvp-ota.workers.dev}"
OTA_ADMIN_TOKEN="${OTA_ADMIN_TOKEN:?OTA_ADMIN_TOKEN required (wrangler secret)}"

# 2. build（implementer 在调用 publish-bundle 前已 npm run build）
[[ -d "$DIST_DIR/" ]] || { echo "no dist/ — run 'npm run build' first"; exit 1; }
[[ -f "$DIST_DIR/index.html" ]] || { echo "dist/index.html missing"; exit 1; }

# 3. zip dist contents (NOT dist itself，zip 内不能有 dist/ 前缀)
PRODUCT_SLUG="$(basename "$(pwd)")"           # 例 02-countdown
ZIP_NAME="${PRODUCT_SLUG}-${VERSION}.zip"
ZIP_PATH="/tmp/${ZIP_NAME}"
rm -f "$ZIP_PATH"
(cd "$DIST_DIR" && zip -qr "$ZIP_PATH" .)

# 4. checksum
CHECKSUM="$(shasum -a 256 "$ZIP_PATH" | awk '{print $1}')"

# 5. R2 upload via wrangler
R2_KEY="${APP_ID}/${VERSION}.zip"
wrangler r2 object put "mvp-ota-bundles/${R2_KEY}" \
  --file="$ZIP_PATH" \
  --content-type="application/zip" \
  --cache-control="public, max-age=31536000, immutable"

# 6. POST manifest
curl -fsSL "${OTA_BACKEND_URL}/admin/manifest" \
  -H "Authorization: Bearer ${OTA_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg appId "$APP_ID" \
    --arg version "$VERSION" \
    --arg r2Key "$R2_KEY" \
    --arg checksum "$CHECKSUM" \
    --arg minNative "$MIN_NATIVE_VERSION" \
    --arg message "$MESSAGE" \
    '{appId:$appId, version:$version, r2Key:$r2Key, checksum:$checksum,
      minNativeVersion:$minNative, message:$message}')"

echo ""
echo "Published: ${APP_ID} ${VERSION}"
echo "  R2 key:   ${R2_KEY}"
echo "  Checksum: ${CHECKSUM}"
echo "  Size:     $(du -h "$ZIP_PATH" | awk '{print $1}')"
```

**关键决策**：
- **wrangler r2 object put 而非 aws4fetch**：发布脚本 local-only，用 wrangler CLI 最直接（无需配 AK/SK 在本地）。R2 admin 通过 `wrangler login` 拿权限。
- **R2 access key 仍要配在 Workers env**：Workers 内 sign URL 需要 AK/SK（dashboard 申请的 R2 API token），与 wrangler CLI 权限独立。
- **zip 命名 vs R2 key 不一致**：
  - 本地 zip 文件名：`<slug>-<version>.zip`（人类可读，例 `02-countdown-0.0.2.zip`）
  - R2 object key：`<appId>/<version>.zip`（程序友好，按 appId 隔离）
  - 客户端从 presigned URL 下载，URL 含 R2 key 但客户端不解析
- **不依赖 `MobileUpdateOssUploader.java` Maven 黑魔法**：纯 bash + node + curl + wrangler，可移植性 ↑

### Open Questions（implementer 决策）

1. **Admin auth 强度**：MVP 用 bearer token 足够。是否要加 IP allowlist？**先不加**，token 泄漏后回滚成本（rotate token + 重发 manifest）可接受。
2. **R2 bucket：共享 vs per-product**：design 选共享。如果某产品要独立 retention / quota 再分。
3. **客户端 `appId` 未识别如何返回**：design 选 `{ enabled: false }` 静默拒绝（不暴露 "未知 appId" 信息以防扫描）。客户端会显示 "更新检查暂时失败" toast。
4. **Manifest 回滚机制**：当前 design 只支持 push 新版本。若发布出问题需回滚到 `history[0]`，目前需手工调 `POST /admin/manifest` 重新指定老 `r2Key`。**先不做** rollback API，回滚是低频事件可走脚本。
5. **`enabled: false` per-app vs global kill switch**：design 选 per-app（写入 KV manifest 字段）。如要做 global kill，要么所有 manifest 批量改，要么加一个 `manifest:global` 特殊 key（**先不做**）。
6. **bundle size 上限**：R2 单 object < 5GB，Workers `r2.get()` < 100MB 一次性 → MVP bundle < 5MB 无忧。**implementer 在 T11 实测 dist 大小，> 2MB 要报警**。
7. **Worker 部署后 URL 长期不变性**：`mvp-ota.workers.dev` 是 Cloudflare 子域，永久。客户端 `mobileUpdates.ts` 写死这个 URL OK；后续上自有域名（`ota.mvp.example.com`）通过 Workers Custom Domain 切换，**客户端无需改动**。

