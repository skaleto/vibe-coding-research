# mvp-gateway

Shared LLM backend for MVP products 01 / 03 / 04 / 05.
Built on **Hono**. **主部署 = Node.js / 阿里云 ECS**（Node 进程 + systemd + nginx HTTPS 反代），
见 [`docs/aliyun-deploy.md`](docs/aliyun-deploy.md)。Cloudflare Workers 保留为备选目标
（`wrangler.toml` 仍在；国内不带 VPN 不可靠，故不作主部署）。

- `POST /generate-names`  — 01 起名
- `POST /diagnose`        — 03 植物医生 (含 base64 图片)
- `POST /analyze-dream`   — 04 梦境日记 (服务端 detectCrisis 优先)
- `POST /generate-cards`  — 05 宠物心情卡片 (服务端强制注入 disclaimer)
- `GET  /health`          — 健康检查 + providers 状态

## 设计不变量

1. **任何 5xx 不返回给客户端**。未捕获异常 → 200 + mock + `warning` 字段。
2. **合规护栏全部在服务端 enforce**：
   - `/diagnose` 出口必跑 `lintAction` → 农药名 / 剂量 / 稀释比例命中替换为 "请咨询本地园艺师或农资人员"
   - `/analyze-dream` 服务端 `detectCrisis()` 一级命中 → 直接返回 `redirectToCrisis: true`，**不调任何 LLM**
   - `/generate-cards` 服务端硬塞 `disclaimer = "⚠️ 仅供娱乐，AI 生成宠物心情卡片"`
3. **LLM provider chain 自动降级**：无 key / 超时 / 上游 5xx → mock fallback；客户端无感。
4. **所有成功响应携带 `X-Compliance-Sanitized: true`** + `X-Provider` + `X-Request-Id`。

## 本地开发 (Node)

```bash
cd mvp/gateway
npm install

# 配置 LLM keys (可全部不填，会走 mock fallback)。从 process.env 读取。
export DEEPSEEK_API_KEY=...   # 或 ZHIPU_API_KEY / OPENAI_API_KEY 任意一个

# 热重载 dev (tsx watch src/server.ts)
npm run dev
# → http://localhost:8400  (端口由 env PORT 控制，默认 8400)

# 或：构建 + 跑产物
npm run build                 # esbuild → dist/server.js (ESM bundle)
PORT=8400 npm start           # node dist/server.js
```

`.dev.vars.example` 列出了所有可配 key（原为 wrangler 用，字段名与 process.env 一致，仍可参考）。

## 部署到阿里云 ECS（主部署）

完整步骤（systemd unit、nginx HTTPS 反代、`X-Real-IP` 注入、env 注入）见
[`docs/aliyun-deploy.md`](docs/aliyun-deploy.md)。要点：

```bash
npm ci && npm run build       # 产出 dist/server.js
# systemd: Environment=DEEPSEEK_API_KEY=... PORT=8400, ExecStart=node dist/server.js
# nginx:   HTTPS 443 → proxy_pass http://127.0.0.1:8400
#          proxy_set_header X-Real-IP $remote_addr;  (限速身份来源，必须设置)
sudo systemctl restart mvp-gateway
```

成功后 health check：

```bash
curl https://<your-domain>/health
# { "ok": true, "version": "...", "providers": { "deepseek": true, ... } }
```

实时日志：

```bash
journalctl -u mvp-gateway -f
```

## 部署到 Cloudflare（备选）

国内不带 VPN 访问 Workers 不可靠，仅作备选保留。代码侧 `src/index.ts` 仍 `export default app`，
`wrangler.toml` 保留。注意：限速已改为进程内 Map（见下），CF 上多实例需自行换回 KV 或 Redis。

```bash
npm install -g wrangler && wrangler login
wrangler kv:namespace create RATE_LIMIT_KV          # 如恢复 KV 限速
wrangler secret put DEEPSEEK_API_KEY                # ZHIPU / OPENAI 同理
npm run deploy:cf                                    # 默认环境
npm run deploy:cf:staging                            # staging
wrangler tail                                        # 实时日志
```

## Endpoint curl 示例

### 01 起名

```bash
curl -X POST https://<host>/generate-names \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "baby",
    "surname": "李",
    "gender": "男孩",
    "vibe_tags": ["沉稳大气", "古典优雅"],
    "source_preference": "诗经"
  }'
```

### 03 植物医生

```bash
# 注意 images 字段必须是 base64 data URL,客户端先压缩 < 200KB/张
curl -X POST https://<host>/diagnose \
  -H 'Content-Type: application/json' \
  -d '{
    "images": ["data:image/jpeg;base64,/9j/4AA..."],
    "waterFreq": "每周 2 次",
    "light": "散射光",
    "description": "叶片发黄"
  }'
```

### 04 梦境

```bash
curl -X POST https://<host>/analyze-dream \
  -H 'Content-Type: application/json' \
  -d '{
    "dreamText": "我梦到自己在飞翔，穿过云层",
    "school": "jungian"
  }'
```

危机文本（一级命中）— 服务端立即返回 `redirectToCrisis: true`，不调 LLM：

```bash
curl -X POST https://<host>/analyze-dream \
  -H 'Content-Type: application/json' \
  -d '{ "dreamText": "我想死" }'
# → { "redirectToCrisis": true, "crisisLevel": 1, "provider": "mock", "analysis": null }
```

### 05 宠物卡片

```bash
curl -X POST https://<host>/generate-cards \
  -H 'Content-Type: application/json' \
  -d '{
    "petType": "cat",
    "petName": "奶油",
    "audioDurationSec": 4,
    "audioFeatures": { "pitch": "high", "burst": "short_burst" }
  }'
```

## 5 个产品如何接入

每个产品在 `.env`（Vite）配 `VITE_GATEWAY_URL`：

```ini
VITE_GATEWAY_URL=https://mvp-gateway-staging.workers.dev
```

客户端：

```typescript
const resp = await fetch(`${import.meta.env.VITE_GATEWAY_URL}/generate-names`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

产品 01 仍在客户端跑 `verifyQuote` / `classics-db.json` (典籍校验角标)，
gateway 不承载该大 JSON（避免 Workers bundle > 1MB）。

产品 03 客户端再跑一次 `lintAction` (双重保险) + 200KB 图片压缩。

产品 04 客户端提交前应再跑一次 `detectCrisis()` (客户端短路，连一个网络请求都省)，
但 gateway 服务端 detectCrisis 永远是兜底防线。

## Rate Limit

- `/generate-names`、`/analyze-dream`、`/generate-cards`：60 req/min/IP
- `/diagnose`（视觉成本高）：10 req/min/IP

超限：`429 { error: { code: 'rate_limited' } }` + `Retry-After: 60`。

**限速存储 = 进程内 `Map<string,{count,resetAt}>`（TTL 70s，惰性清理）**，原为 Cloudflare KV。
单机 ECS 单 Node 进程下该计数器即权威。**多实例（PM2 cluster / 多台 ECS）需换 Redis（ioredis）**：
每进程独立 Map 会让有效配额翻倍；`enforceRateLimit` / `getClientIp` 签名刻意保持不变，届时只换存储。

**限速身份 = `X-Real-IP`（首选）或 `X-Forwarded-For` 首跳**，二者均由我们自己的 nginx 注入。
nginx 必须 `proxy_set_header X-Real-IP $remote_addr;` 且**覆盖**（而非透传追加）客户端原始 XFF，
否则攻击者可每次请求轮换 `X-Forwarded-For` 落入新桶绕过配额。该意图与原 `cf-connecting-ip`
（只信边缘注入的头）一致。无任何代理头时（直连本地 dev）→ 固定 `local-dev` 单桶，限速仍生效。

## Testing

普通 **Node vitest**（`environment: 'node'`），直接 `import app from '../src/index'` 并用
`app.fetch(req, env)` 驱动 —— 与 `src/server.ts` 调用方式一致，仅 env 改为按用例传入。
不再依赖 `@cloudflare/vitest-pool-workers` / `cloudflare:test`（env / SELF），无 KV stub。
限速为进程内 Map，rate-limit 用例在 `beforeEach` 调 `__resetRateLimitStore()` 隔离计数。

```bash
npm test            # vitest run  (51 个用例全过)
npm run type-check  # tsc --noEmit
```

测试覆盖（51 cases）：
- `tests/generate-names.test.ts` — mock path + invalid_input + invalid_json
- `tests/diagnose-lint.test.ts` — `lintText` / `lintDiagnosisResult` 多 case + 端到端 mock + **SSRF 护栏（http/ftp/协议相对/裸域名/非图片 data URL 全拒 + 不调用上游）**
- `tests/analyze-dream-crisis.test.ts` — level-1 短路（断言 LLM fetch 未被调用）+ 字符变体绕过 + benign mock + level-2 supportive
- `tests/generate-cards-disclaimer.test.ts` — invalid_input 走 mock_fallback + LLM 漏写 disclaimer 强制注入 + 禁词（含变体）→ mock_fallback
- `tests/rate-limit.test.ts` — `getClientIp` 新策略（X-Real-IP 优先、XFF 首跳兜底、cf-connecting-ip 不再信任）+ 同一 X-Real-IP 轮换客户端 XFF 仍落一桶 → 11th 429 + Retry-After
