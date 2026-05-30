# MVP 服务端阿里云 ECS 部署指南

> gateway（LLM 网关）+ ota-backend（OTA 热更）从 Cloudflare Workers 迁到阿里云 ECS（Node + systemd + Nginx HTTPS）。
> 选这条路的原因：目标市场国内，Cloudflare Workers 国内不带 VPN 不可靠。复用 ai-baby 同一台 ECS。
> 迁移已完成并本地验证：gateway 51 tests + ota-backend 73 tests 全过，Node 入口 curl 验证合规/安全护栏保留。

---

## 架构

```
国内用户（无需 VPN）
   │  HTTPS  api-mvp.<你的已备案域名>
   ▼
阿里云 ECS（与 ai-baby 共用同一台）
   ├─ Nginx（443 TLS 终止 + 反代，配置 deploy/nginx/mvp-api.conf）
   │    ├─ /gateway/* → 127.0.0.1:8400  (mvp-gateway, Node)
   │    └─ /ota/*     → 127.0.0.1:8401  (mvp-ota, Node)
   └─ systemd 管理 3 个服务（端口不冲突）
        ├─ ai-baby (Java)      :8300   ← 已有，不动
        ├─ mvp-gateway (Node)  :8400   ← 新增
        └─ mvp-ota (Node)      :8401   ← 新增
OTA bundle → 阿里云 OSS（mvp-ota/<appId>/<version>.zip，签名 URL 下发）
```

---

## 一、前置清单（需要你准备）

| 项 | 说明 | 耗时 |
|---|---|---|
| 阿里云 ECS | 可复用 ai-baby 同一台（端口 8400/8401 空闲）；安全组放行 443/80 | 已有 |
| **域名 ICP 备案** | `api-mvp.<域名>` 子域名指向 ECS 公网 IP。国内域名指向国内服务器**必须备案** | **7-20 天** ⚠️ |
| 阿里云免费 SSL 证书 | 控制台申请，绑定 `api-mvp.<域名>`；或用 certbot Let's Encrypt | 当天 |
| OSS bucket + AK/SK | 可复用 ai-baby OSS（用 `mvp-ota/` 前缀区分）；准备 RAM 子账号 AK/SK | 当天 |
| LLM API key | DeepSeek（最便宜，01/04/05 文本）+ 智谱 GLM-4V（03 视觉） | 当天 |

> **备案是最大瓶颈**。如果等不及，可临时用 ECS 公网 IP + HTTP 验证，但需临时重开客户端 cleartext（牺牲安全），不推荐。

---

## 二、ECS 上准备密钥文件 `/etc/mvp/`

部署脚本会创建 `/etc/mvp/` 目录。手动写两个 EnvironmentFile（systemd 读取，不入 git）：

```bash
ssh root@<ECS_IP>
mkdir -p /etc/mvp && chmod 750 /etc/mvp

# gateway 的 env（LLM key）
cat > /etc/mvp/gateway.env <<'EOF'
DEEPSEEK_API_KEY=sk-你的deepseek
ZHIPU_API_KEY=你的智谱key
# OPENAI_API_KEY=（可选）
EOF

# ota-backend 的 env（OSS + per-app OTA token）
cat > /etc/mvp/ota.env <<'EOF'
DATA_DIR=/var/lib/mvp-ota
ALIYUN_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
ALIYUN_OSS_BUCKET=你的bucket
ALIYUN_OSS_ACCESS_KEY_ID=你的AK
ALIYUN_OSS_ACCESS_KEY_SECRET=你的SK
# 每个产品一个 token（≥32 字符，openssl rand -hex 32 生成）
OTA_TOKEN_SHIJINGNAMING=...
OTA_TOKEN_COUNTDOWNPRO=...
OTA_TOKEN_PLANTDOCTOR=...
OTA_TOKEN_DREAMJOURNAL=...
OTA_TOKEN_PETCARDS=...
EOF

chmod 640 /etc/mvp/*.env
```

---

## 三、部署

```bash
# 本地，从 mvp/ 目录
ECS_HOST=<ECS_IP> SSH_KEY=~/.ssh/aliyun.pem scripts/deploy-aliyun-ecs.sh
```

脚本会：本地 build gateway + ota-backend → rsync 到 `/opt/mvp-gateway`、`/opt/mvp-ota` → 装 Node 20 + 建 `mvpapp` 用户 → 装 systemd unit → 重启 → 健康检查 `:8400/health` `:8401/health`。

---

## 四、Nginx + HTTPS

```bash
# ECS 上
cp deploy/nginx/mvp-api.conf /etc/nginx/conf.d/
# 编辑：把 <YOUR_DOMAIN> 替换为真实域名，填证书路径
nano /etc/nginx/conf.d/mvp-api.conf
#   ssl_certificate     /etc/nginx/ssl/api-mvp.<域名>.pem;
#   ssl_certificate_key /etc/nginx/ssl/api-mvp.<域名>.key;
nginx -t && systemctl reload nginx
```

Nginx 关键安全点（M3 已配）：`proxy_set_header X-Real-IP $remote_addr`（真实 peer，gateway 限速信这个），不透传客户端伪造的 X-Forwarded-For。

---

## 五、客户端指向真实域名 + 重新构建

5 个产品 `.env` 当前是占位 `https://api-mvp.<YOUR_DOMAIN>/gateway`。替换为真实域名后重建：

```bash
cd mvp/products/02-countdown
# 编辑 .env：VITE_GATEWAY_URL / VITE_OTA_BACKEND_URL 填真实域名
npm run build && npx cap sync ios
# 重新装真机（见各产品 README）
```

---

## 六、发布 OTA 更新（部署后）

```bash
cd mvp/products/02-countdown
npm version patch                                  # 0.0.1 → 0.0.2
npm run build
OTA_BACKEND_URL=https://api-mvp.<域名>/ota \
  ../../scripts/publish-bundle.sh 02-countdown 0.0.2 dist
# → 上传 bundle 到 OSS mvp-ota/io.countdownpro.app/0.0.2.zip + 写 manifest
# 客户端启动 2.5s 后自动 check → 下载 → 下次冷启动生效
```

---

## 七、验证 + 运维

```bash
# 健康检查（ECS 本地）
curl localhost:8400/health
curl localhost:8401/health
# 公网（备案+nginx 后）
curl https://api-mvp.<域名>/healthz

# 日志
ssh root@<ECS_IP> 'journalctl -u mvp-gateway -f'
ssh root@<ECS_IP> 'journalctl -u mvp-ota -f'

# 重启
ssh root@<ECS_IP> 'systemctl restart mvp-gateway mvp-ota'
```

数据备份：`/var/lib/mvp-ota`（OTA manifest JSON）。

---

## 八、与 ai-baby 共存 checklist

- [x] 端口不冲突：ai-baby 8300 / mvp-gateway 8400 / mvp-ota 8401
- [x] systemd 服务名不冲突：`ai-baby-growth-companion` / `mvp-gateway` / `mvp-ota`
- [x] /etc 隔离：`/etc/ai-baby-growth-companion` / `/etc/mvp`
- [x] /opt 隔离：`/opt/ai-baby-growth-companion` / `/opt/mvp-gateway` / `/opt/mvp-ota`
- [x] OSS 前缀隔离：`baby-companion/` / `mvp-ota/`
- [ ] Nginx：ai-baby 如也要上 HTTPS，各自独立 server_name

---

*迁移与文档：2026-05-29。gateway/ota-backend 已从 Cloudflare Workers 迁到 Node，本地验证全过；部署需你提供 ECS + 备案域名 + OSS AK/SK + LLM key。*
