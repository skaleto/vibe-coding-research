# OTA Contract（提取自 ai-baby-growth-companion）

源仓库：`/Users/bytedance/Documents/ai-baby-growth-companion/`，所有 file:line 引用以该仓库为基准。

## 1. 客户端时序契约

入口：`frontend/src/mobileUpdates.ts:39 startMobileUpdateRuntime()`。

1. **守卫**：`Capacitor.isNativePlatform() && isPluginAvailable("CapacitorUpdater")`（line 40），Web 端直接 return。
2. **notifyAppReady**（line 42）：立即调用，承诺当前 bundle 启动成功，避免被 native 端 5/15 秒看门狗回滚（见 §7）。失败仅 warn，不中断流程。
3. **延时 check**：`setTimeout 2500ms` 后跑 `checkAndQueueMobileUpdate()`（line 46-48）。
4. **频控**：`localStorage["xiaobao-mobile-update-last-check-at"]`，60s 内不重复 check（line 5-7, 150-157）。
5. **check**：`CapacitorUpdater.current()` 拿 `current.native` + `current.bundle.{id, version}`，POST `/api/mobile-updates/check`（line 56-68）。
6. **去重下载**：`CapacitorUpdater.list()` 找 `status === "success" || "pending"` 且 version 匹配的 bundle，命中则跳过 download（line 87, 141-148）。
7. **download**：`CapacitorUpdater.download({ version, url, checksum? })`，监听 `download` 事件汇报进度（line 104-139）。
8. **set**：`CapacitorUpdater.set({ id: bundle.id })` 立即切换（line 97）——注意不是文档里写的 `next()`，是 `set()`，应用层马上重载。
9. 全程通过 `MOBILE_UPDATE_NOTICE_EVENT` CustomEvent 给 UI 推 toast。

## 2. POST /api/mobile-updates/check

Controller：`backend/.../controller/MobileUpdateController.java:29-38`。Service：`MobileUpdateService.java:51-100`。

### 入参（`MobileUpdateCheckRequest.java:3-10`）
```json
{
  "appId": "com.xiaobao.growthcompanion",
  "platform": "android" | "ios" | "web",
  "nativeVersion": "0.1.0",
  "currentBundleId": "<capgo bundle id>",
  "currentBundleVersion": "0.1.0-20260526..."
}
```
全部可为 null；body 整体可缺省（controller line 34-36 容错）。

### 出参（`MobileUpdateCheckResponse.java:3-20`）
```json
{
  "enabled": boolean,           // 服务端总开关或 manifest.enabled
  "updateAvailable": boolean,   // 有新版本可下载
  "version": "0.1.0-20260526205651" | null,
  "url": "<download url>" | null,   // 直链或 OSS 预签名
  "checksum": "<sha256 hex>" | null,
  "minNativeVersion": "0.1.0" | null,  // 客户端 native < 此版本时禁更新
  "message": "中文提示" | null
}
```

字段语义（MobileUpdateService.java:51-100）：
- `enabled=false`：模块关或 manifest 缺失/不全（`disabled()` 工厂）。
- `updateAvailable=false` + 有 `version`：已是最新，或 native 版本过低（`upToDate()` line 81 / line 67-77）。
- `minNativeVersion` 比较走 `compareVersions()`（line 250-271）：按非数字分隔切片做整数比较，不严格语义化。

## 3. manifest.json 结构

存档于 `backend/data/mobile-updates/manifest.json`，由 build 脚本生成，OSS 上传后被改写。Java 解析：`MobileUpdateService.Manifest`（line 273-284）。

```json
{
  "enabled": true,
  "version": "0.1.0-20260526205651",
  "fileName": "app-0.1.0-20260526205651.zip",
  "url": "",                     // 直链；OSS 模式下为空
  "ossObjectKey": "baby-companion/mobile-updates/app-...zip",
  "checksum": "<sha256 hex>",
  "minNativeVersion": "",
  "message": "本次更新说明"
}
```

`@JsonIgnoreProperties(ignoreUnknown=true)`，向后兼容加字段。`url` 支持 `oss://<objectKey>` 前缀写法（line 121-123）。

## 4. bundle zip 格式

- 命名：`app-<version>.zip`（`build-mobile-update.sh:12`）。
- **必须 index.html 在 zip 根**（docs/mobile-updates.md:37）——脚本是 `cd dist && zip -qr ...` 实现的（build line 38-41），不带顶层目录。
- 构建命令：`MOBILE_UPDATE_VERSION=0.1.1 npm run build:mobile:update`，内部 `VITE_BUILD_TARGET=mobile VITE_MOBILE_UPDATE_VERSION=$VERSION npm run build`（build line 29-32）——去 web-only 路由减小体积。
- checksum：`shasum -a 256`（build line 43），sha256 hex 字符串，写入 manifest。

## 5. OSS 签名 URL

生成机制：`MobileUpdateService.signedOssBundleUrl()`（line 133-156）。

- 每次 `/check` 都现签：`new OSSClientBuilder().build(endpoint, ak, sk)`，`GeneratePresignedUrlRequest GET`，过期时间 `Instant.now() + ttlSeconds`。
- TTL：`storageProperties.getOss().getSignedUrlTtlSeconds()`，默认 **86400 秒（24h）**（`AppStorageProperties.java:58`），下限 60s（service line 144）。
- AK/SK：来自 inline env 或 `*_FILE` 路径（service line 232-244），桶可保持私有。
- objectKey 防注入：`safeOssObjectKey()` 去前缀斜杠 + normalize 拒 `..`（line 200-213）。
- 备份链路：若 manifest 既无 `ossObjectKey` 也无 `url`，回落到 `GET /api/mobile-updates/bundles/{fileName}`（`MobileUpdateController.java:40-48`，本地 file resource）。

## 6. 版本号策略 + checksum

- 默认版本：`MOBILE_UPDATE_VERSION` env，否则 `package.json#version + '-' + YYYYMMDDHHmmss`（build line 9-10）。
- 服务端比较：`Objects.equals(normalizedVersion(req.currentBundleVersion), normalizedVersion(manifest.version))` 命中即 upToDate（service line 79-82）——**字符串相等，不做语义比较**。
- minNativeVersion 才走 `compareVersions()`（弱语义化，line 250-271）。
- checksum：sha256 hex，由客户端 `CapacitorUpdater.download({ checksum })` 在下载完成后校验（mobileUpdates.ts:127-131），失败抛 checksum error → toast "更新包校验失败"。

## 7. 失败模式 + 回滚

- **未 notifyAppReady 自动回滚**：`capacitor.config.ts:25` `appReadyTimeout: 15000`（毫秒）。新 bundle 启动后 15s 内没调 `notifyAppReady()`，CapacitorUpdater 自动回滚到上一个可用 bundle。文档 docs/mobile-updates.md:5 提到这一点。
- **autoUpdate: false**（config line 24）：禁用插件自带自动 check，全走业务侧 `/check`。
- **responseTimeout: 120 秒**（config line 26）：单次 http 请求超时。
- **autoDeleteFailed / autoDeletePrevious: true**（config line 27-28）：失败 bundle 与上一版自动清理。
- **resetWhenUpdate: true**（config line 29）：装新原生包后清空已下载 bundle，避免老 OTA 包污染。
- 客户端错误归类：`readUpdateFailureMessage()`（mobileUpdates.ts:204-216）匹配 `timeout/checksum/unzip` 关键词转中文 toast。

## 8. 部署 / 上线流程

`docs/mobile-updates.md:24-75`。

1. `MOBILE_UPDATE_VERSION=0.1.1 npm run build:mobile:update` —— 产出 zip + manifest 到 `backend/data/mobile-updates/`。
2. **本地服务模式**：`SYNC_MOBILE_UPDATES=1 scripts/deploy-aliyun-ecs.sh`，把 zip + manifest rsync 到 ECS `/var/lib/ai-baby-growth-companion/mobile-updates`，Spring Boot 直接吐文件。
3. **OSS 模式**（生产）：
   - `MOBILE_UPDATE_OSS_SSH_TARGET=ai-baby-aliyun scripts/upload-mobile-update-oss.sh`：通过 SSH 拉远端 systemd Environment 拿 OSS 配置 → `mvn dependency:build-classpath` 临时编译 `MobileUpdateOssUploader.java` → `PutObject` 到 `baby-companion/mobile-updates/<file>.zip`（content-type `application/zip`, cache-control `public, max-age=31536000, immutable`）→ Node 改写本地 manifest 把 `ossObjectKey` 注入、`url` 清空（upload-mobile-update-oss.sh:220-232）。
   - 再 `SYNC_MOBILE_UPDATE_MANIFEST_ONLY=1` rsync 仅 manifest 到 ECS。
4. `MOBILE_UPDATE_OSS_MANIFEST_MODE=public` 模式则反过来：manifest 写死直链 `url`，删 `ossObjectKey`（适合公开桶/CDN）。

环境变量：`MOBILE_UPDATE_VERSION`、`MOBILE_UPDATE_MIN_NATIVE_VERSION`、`MOBILE_UPDATE_MESSAGE`、`MOBILE_UPDATE_ENABLED`、`APP_MOBILE_UPDATES_PUBLIC_BASE_URL`、`ALIYUN_OSS_*` 系列、`MOBILE_UPDATE_OSS_PREFIX`、`MOBILE_UPDATE_OSS_PUBLIC_BASE_URL`、`MOBILE_UPDATE_OSS_MANIFEST_MODE`。Spring 侧 `app.mobile-updates.{enabled,directory,public-base-url}`（`MobileUpdateProperties.java`）。

## 9. 下游 architect 需要决策的开放问题

1. **OSS → R2 签名**：阿里云 OSS SDK 的 `GeneratePresignedUrlRequest` 换成 Cloudflare R2 的 S3 兼容 `aws4fetch` / `@aws-sdk/s3-request-presigner`（Workers 不能跑 Java SDK，要纯 JS 实现），TTL 仍取 24h 是否合适需 confirm。
2. **后端框架**：Spring Boot Controller + Service → Hono on Cloudflare Workers，manifest 存哪？KV / R2 object / D1？当前 manifest 是单文件可写，Workers 无本地文件系统。
3. **manifest 写入**：当前 upload 脚本本地改写 manifest 后 rsync，新架构是脚本直接调一个 admin API 把 manifest 写进 KV/R2，还是脚本本身上传到 R2 + 写 KV？
4. **多产品复用**：5 个 MVP 共享一个 ota-backend，路由要带 `appId` 隔离（`/api/mobile-updates/check?appId=...` 或路径 prefix），当前 manifest 单一全局，需改成 per-app。
5. **bundle URL 生成**：当前回落 `buildBundleUrl()` 依赖 `HttpServletRequest`，Workers 用 `Request` 对象，逻辑需重写；要不要保留本地直链 fallback？
6. **upload-mobile-update-oss.sh 重写**：去掉 Java + Maven 依赖（当前要 IntelliJ Maven），换成 Node + `@aws-sdk/client-s3` 直传 R2。
7. **版本比较**：当前服务端字符串相等判断，timestamp 命名天然单调，迁移后是否要换 semver？影响 minNativeVersion 比较逻辑。
8. **CapacitorUpdater 配置不变**：`autoUpdate:false / appReadyTimeout:15000 / responseTimeout:120 / autoDeleteFailed / autoDeletePrevious / resetWhenUpdate:true` 这套客户端配置可直接复用，不依赖后端实现。
9. **频控 & 进度事件**：客户端 `mobileUpdates.ts` 业务无关，可整体复制成 shared-mobile-template 模块，只需把 `apiBaseUrl` 和 `appId` 参数化。
