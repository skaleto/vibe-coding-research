# TrustJSON · 产品需求文档（PRD）

> 版本：v1.0（MVP）　|　日期：2026-05-30　|　负责人：独立开发者（个人/全栈）
> 一句话定位：**在 JSON Formatter 塌房后，做那个「权限最小、开源可审计、50MB 不卡、100% 本地零追踪」的可信 JSON 查看/格式化器。**
> 形态：Chrome / Edge 浏览器扩展（Manifest V3）　|　运行时：零 AI、零后端、零网络请求、零边际成本

---

## 1. 背景与痛点证据（引子报告）

> 证据来源：`light-app-low-ai-2026/deep-dive/01-browser-ext-ideas.md`（方案 A）与 `00-MASTER.md`。证据强度标注：【官方】/【第三方】/【社区】/【作者自报】。

### 1.1 核心东风：罕见的「信任真空」事件（2026 年正在发生）

2026 年 1–4 月，装机 **200 万+** 的明星插件 **JSON Formatter（作者 Callum Locke）** 被曝：

- **转闭源**，不再公开源码；
- **注入 GiveFreely 捐款弹窗**（在电商网站结账页弹出）；
- 用 **MaxMind 硬编码 key 做地理定位追踪**；
- 向 `givefreely.com` **上报用户行为数据**。

事件在 **Hacker News（item 47721946，标题"now closed and injecting adware"）/ Reddit r/webdev、r/programming / DEV.to** 上引爆，开发者大规模卸载并寻找替代品【第三方：DEV "JSON-Formatter turns closed-source…"、thepixelspulse adware incident、chrome-stats 多源交叉】。

这不是孤例。同期插件信任危机的大背景：

- 2025-07 曝出 **18 个"可信"插件偷数据**【第三方 ISPreview】；
- **RedDirection 劫持** campaign 波及 **1630 万** 用户【第三方 Spin.AI】；
- 一个 "Color Picker / Geco colorpick" 恶意取色插件波及 **230 万** 用户【第三方 Spin.AI】。

**结论：开发者对插件的信任跌到谷底。「开源 + 极简权限 + 离线 + 可审计」此刻是能直接转化的购买/安装理由——需求被外力强行创造，且有时效。**

### 1.2 已被验证的需求 + 仍空着的精品位

已有开发者（Valentin Conan）愤而做了 **JSONVault Pro**，自述 "Zero tracking on both tiers. No analytics, no telemetry"【作者自报】——**但刚上线、无 traction 数据**。

> 含义：需求已被验证，但「可信 + 精品」的位置仍空着，**窗口期在 NOW**。

### 1.3 第二痛点：大文件性能

- ~20MB JSON 让浏览器主线程 **冻结 4 秒+**【第三方 Bugzilla@Mozilla #1363222】；
- **50MB 文件多数工具直接崩 / OOM**【第三方 Dadroit "Open Big JSON" 指南、Notepad++ 社区】；
- 后端 / 数据工程师导出的 API dump、日志、NDJSON 经常就是这个量级。

**性能位空着——别人崩的地方你不崩，就是差异化尖刀。**

### 1.4 第三痛点：功能缺口

主流 JSON 插件横评指出：**普遍缺 jq、diff、强搜索**，仅做基础高亮【第三方 offlinetools.org 对比文】。

---

## 2. 目标用户

| 用户群 | 场景 | 触发频率 | 痛点 |
|---|---|---|---|
| **后端工程师** | 调试 API 响应、看导出的 JSON dump | 每天多次 | 大响应体卡死、找不到字段、复制路径麻烦 |
| **前端工程师** | 看接口返回、Mock 数据、配置文件 | 每天多次 | 同上 + 想要干净的树视图 |
| **QA / 测试** | 校验接口返回结构、对比预期 | 每天 | diff、搜索、错误定位 |
| **数据工程师 / SRE** | 看大 JSON / NDJSON / 日志 | 高频 | 大文件不崩、能搜、能筛 |
| **安全敏感开发者** | 不愿把数据贴到在线 JSON 网站 | 总是 | 在线工具有隐私风险，要 100% 本地 |

**市场规模信号**：仅原 JSON Formatter 就 200 万装机；整个 "JSON viewer" 品类在 chrome-stats 上有几十个条目、头部累计千万级。这是**每天多次触发的高频开发者刚需**。

---

## 3. 产品原则（护城河）

1. **可信优先（Trust-first）**：开源、最小权限、零网络请求、可审计。README 顶部明示「我们绝不做 GiveFreely 那套」。
2. **性能尖刀（Performance）**：50MB 不卡死。Web Worker 解析 + 虚拟滚动，别人崩的地方我不崩。
3. **零成本运行（Zero-cost）**：纯本地 JS，零后端、零 LLM、零追踪，边际成本 = 0。这是「信任」卖点的技术底座，也让买断定价数学上成立。
4. **够用就好（Lean）**：免费层覆盖 90% 日常；专业重度功能（diff / jq / JWT）放 Pro。
5. **轻量快**：纯 vanilla JS，不引重框架，扩展体积小、加载快。

---

## 4. 功能列表

### 4.1 MVP（第 1 周，免费上架抢「可信替代」心智）

| # | 功能 | 说明 | 优先级 |
|---|---|---|---|
| 1 | **加载 JSON** | 粘贴 / 打开文件 / 拖拽三种入口 | P0 |
| 2 | **树视图** | 折叠/展开节点、缩进、类型着色（string/number/bool/null/object/array），显示数组/对象的子项计数 | P0 |
| 3 | **大文件性能** | Web Worker 解析 + 虚拟滚动（只渲染可视区），10–50MB 不卡死 | P0（差异化尖刀） |
| 4 | **搜索/过滤** | 按 key/value 关键词高亮 + 上一个/下一个定位 | P0 |
| 5 | **复制** | 复制节点值 / 复制 JSON 路径（如 `data.users[0].name`） | P0 |
| 6 | **格式化 / 压缩切换** | 美化（带缩进）⇄ 压缩（单行）原始文本视图 | P0 |
| 7 | **错误定位** | 非法 JSON 指出行/列 + 错误片段 | P0 |
| 8 | **浅色/深色主题** | 跟随系统 + 手动切换，记忆选择 | P0 |
| 9 | **100% 本地标注** | 页面顶部常驻「100% 本地处理，不发送任何数据」徽章 | P0（卖点可见化） |
| 10 | **直接打开 .json 文件**（可选） | content script 接管浏览器里直接打开的 `file://*.json` / `*.json` URL（谨慎权限） | P1 |

### 4.2 V2 / Pro（第 2 周起，一次性买断解锁）

| # | 功能 | Pro 价值 |
|---|---|---|
| 1 | **Side-by-side diff** | 两份 JSON 结构化对比（LCS 算法本地算），高亮增/删/改 |
| 2 | **jq / JSONPath 查询** | jq（WASM 版本地跑）/ JSONPath 表达式过滤、变换 |
| 3 | **JWT / Base64 自动解码** | 检测到 JWT 字符串自动解码 header/payload；Base64 一键解 |
| 4 | **超大文件流式加载** | 几百 MB 级流式解析 + 索引（吸收 BigJSON Lab 能力） |
| 5 | **NDJSON 支持** | 逐行 JSON 文件浏览 |
| 6 | **导出子集 / 转 CSV** | 选中节点导出、数组转 CSV |

> Pro 功能在 MVP 中以**占位入口 + "Pro" 标记**呈现（点击提示「即将推出」），不实现逻辑。MVP 先把查看器做扎实。

---

## 5. 竞品对比

| 维度 | **TrustJSON** | JSON Formatter（原版，塌房） | JSON Viewer Plus / 各免费版 | JSONVault Pro（新） | Dadroit（桌面） |
|---|---|---|---|---|---|
| 开源可审计 | ✅ | ❌（已转闭源） | 部分 | 自述无追踪 | ❌ |
| 零追踪 / 零网络 | ✅ 声明零网络权限 | ❌（注入广告+地理追踪） | 多数是 | ✅自述 | n/a |
| 最小权限 | ✅（无 host_permissions） | ❌ | 不一 | 不详 | n/a |
| 大文件（50MB）不卡 | ✅ Worker+虚拟滚动 | ❌ | ❌ 普遍崩 | 不详 | ✅（但要装桌面软件） |
| 树视图 + 类型着色 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 复制 JSON 路径 | ✅ | 部分 | 部分 | 不详 | ✅ |
| 错误行列定位 | ✅ | 部分 | 部分 | 不详 | ✅ |
| diff / jq / JWT | ✅ Pro | ❌ | ❌ 普遍缺 | 部分 | 部分 |
| 形态 | 浏览器内 | 浏览器内 | 浏览器内 | 浏览器内 | 需装桌面软件 |
| 定价 | 免费 + Pro 买断 $19–29 | 免费（但塞广告） | 免费 | Freemium | 付费 |
| 装机 | 0（新）→蹭事件 | 200 万+（掉量中） | 各几万–几十万 | 新、无数据 | n/a |

**差异化三件套**：
1. **开源 + 单一最小权限** —— 直接戳信任痛点（README 顶部放「我们绝不做 GiveFreely 那套」）；
2. **虚拟渲染扛 50MB+** —— 别人崩的地方你不崩；
3. **Pro 买断纵深** —— diff / JWT / jq / 超大文件，免费层够用、付费层是「专业重度」。

---

## 6. 定价与收款

| 层级 | 价格 | 内容 | 目的 |
|---|---|---|---|
| **Free（核心）** | 永久免费 | 查看 / 格式化 / 折叠 / 搜索 / 复制路径 / 错误定位 / 主题 / 大文件 | **抢量 + 建信任** |
| **Pro** | **一次性 $19–29 买断** | diff + JWT/Base64 解码 + jq/JSONPath + 超大文件流式 + NDJSON + 导出 CSV | 专业重度用户变现 |

- **收款**：ExtensionPay（~5% 抽成，扩展内购体验顺）或 Gumroad license key（一次性买断、可发券）。
- **不做订阅**：与「零边际成本 + 开发者厌订阅」一致，买断是这群人认的模型（实证价格带：Tailscan $89、CSS Scan $69、Tail Lens $49 lifetime）。
- **定价心智**：$19–29 卡在「随手买、不用申请报销」的区间，靠量 + 口碑。

---

## 7. 冷启动渠道

| 渠道 | 动作 | 角度（Angle） |
|---|---|---|
| **Hacker News（Show HN）** | 主战场 | 标题："I built an open-source, zero-tracking JSON viewer after JSON Formatter started injecting adware" —— **HN 头条体质，蹭事件即可起量** |
| **Reddit** | r/webdev、r/programming | 蹭 JSON Formatter 塌房讨论串，软露出 |
| **DEV.to** | 发布文 | "为什么我做了一个开源零追踪的 JSON 查看器" |
| **掘金 / V2EX** | 中文开发者 | 同角度，覆盖中文圈 |
| **软露出** | 原插件差评区 + 相关 HN 讨论串 | 不硬广，提供替代选项 |

**核心打法**：**蹭事件 + Show HN 性能 demo**（「打开 50MB JSON 不崩」demo 天生吸 HN），几乎不需要额外营销创意。

---

## 8. 技术架构

### 8.1 总览（100% 本地）

```
┌─────────────────────────────────────────────┐
│  Chrome Extension (Manifest V3)               │
│                                               │
│  viewer.html  ←─ 用户主入口（独立页面）         │
│    ├─ viewer.js     UI / 树渲染 / 虚拟滚动      │
│    ├─ worker.js     Web Worker：解析大 JSON     │
│    ├─ tree.js       树构建 / 路径 / 扁平化       │
│    └─ styles.css    主题（浅/深）               │
│                                               │
│  content.js  ←─ (P1) 接管直接打开的 *.json URL  │
│  background (service_worker, 极简)             │
└─────────────────────────────────────────────┘
        ↑ 零 fetch / 零 XHR / 零 WebSocket
        ↑ 无 host_permissions / 无 network 权限
```

### 8.2 关键技术决策

| 决策点 | 选择 | 理由 |
|---|---|---|
| 框架 | **纯 vanilla JS** | 扩展体积小、加载快、可审计（无供应链黑盒），契合「信任」卖点 |
| 大文件解析 | **Web Worker** `JSON.parse` | 解析放后台线程，不阻塞 UI；MVP 用原生 `JSON.parse`（V8 极快），V2 再上流式解析器扛几百 MB |
| 大文件渲染 | **虚拟滚动 + 懒展开** | 把整棵树**扁平化为可见行数组**，只渲染视口内 ~50 行；折叠的子树不进可见列表 → 50MB 也只画几十个 DOM 节点 |
| 路径 | 边构建边记录每个节点的 `path` 段 | 复制路径 O(1) |
| 搜索 | 在扁平模型上线性扫描 + 命中索引 | 大文件下仍可秒级；命中自动展开祖先 |
| diff / jq | LCS / jq-wasm（V2） | 全本地、零后端 |
| 主题 | CSS 变量 + `prefers-color-scheme` | 跟随系统，localStorage 记忆 |
| 权限 | **MV3，最小集**：无 `host_permissions`，无 `tabs`，无网络。P1 接管 `.json` 仅在用户主动场景下用最克制的 content script | 最小权限本身就是卖点 |

### 8.3 虚拟滚动 + 懒渲染方案（差异化核心，重点做对）

**问题**：50MB JSON 可能有数百万个节点，全部建 DOM 必崩。

**方案（本 MVP 采用）**：
1. **Worker 解析**：`viewer.js` 把原始文本 `postMessage` 给 `worker.js`，Worker 里 `JSON.parse` 后回传对象（结构化克隆）。解析期间 UI 显示「解析中…」不冻结。
2. **扁平可见模型**：维护一个 `visibleRows: Array<{node, depth, path, ...}>`。根默认展开一层；**折叠的节点其子节点不进数组**。展开/折叠 = 在数组里 splice 插入/删除该子树的可见行。
3. **窗口化渲染（windowing）**：滚动容器用一个撑高的 spacer（`totalRows * rowHeight`）模拟总高度；只为 `[scrollTop/rowHeight - buffer, +viewport]` 区间的行创建/复用 DOM。滚动时按需重绘该窗口。
4. **固定行高**：每行等高 → 滚动位置 ↔ 行索引 O(1) 换算，无需测量。
5. **大数组/大对象保护**：单个容器子项过多（如 >10 万）时，分页/分块展开，避免一次 splice 海量行。

> 结果：DOM 节点数恒定在「视口行数 + buffer」量级（几十个），与文件大小**解耦**。这是别人崩、我不崩的根因。

### 8.4 隐私实现（卖点的技术兑现）

- `manifest.json`：**不申请任何网络相关权限**，无 `host_permissions`，无 `<all_urls>`；CSP 默认禁止远程脚本。
- 代码层：**全程无 `fetch` / `XMLHttpRequest` / `WebSocket` / `navigator.sendBeacon` / 远程 `import`**。
- 无 analytics、无 telemetry、无第三方 SDK、无远程字体/CDN。
- 页面顶部常驻徽章：**「🔒 100% 本地处理 · 不发送任何数据」**。
- README + 商店描述明确：所有处理在你的浏览器内完成，数据永不离开设备。可审计（开源）。

---

## 9. 1 周 MVP 范围（砍到最小可验证）

**做（P0）**：
- 独立 `viewer.html` 页面：粘贴 / 打开文件 / 拖拽 加载 JSON；
- 树视图（折叠/展开 + 类型着色 + 子项计数）；
- **Web Worker 解析 + 虚拟滚动**（50MB 不崩，差异化尖刀）；
- 搜索/过滤 + 命中定位；
- 复制节点值 / 复制 JSON 路径；
- 格式化 ⇄ 压缩 原始文本视图；
- 非法 JSON 错误行列定位；
- 浅色/深色主题；
- 顶部「100% 本地」徽章；最小权限 manifest；开源。

**先免费上架**，跑装机和留存，建立「可信替代」心智。

**不做（留 V2/Pro）**：diff、jq/JSONPath、JWT 解码、几百 MB 流式、NDJSON、导出 CSV、收款集成 —— 第 2 周加。

**验收标准（Definition of Done）**：
- 在 `chrome://extensions` 开发者模式可「加载已解压的扩展程序」并运行；
- 粘贴/打开/拖拽都能加载；
- 喂一个 ~10–50MB 生成的 JSON：**解析不冻结 UI、滚动流畅、不崩**；
- 搜索能高亮 + 跳转；复制路径正确（`a.b[0].c` 格式）；
- 非法 JSON 报出行列；主题可切换并记忆；
- **DevTools Network 面板全程 0 个请求**；manifest 无网络权限。

---

## 10. 隐私声明策略

1. **商店描述置顶三句**：① 100% 本地，数据永不离开浏览器；② 零网络请求、零追踪、零广告（附 manifest 权限截图）；③ 开源可审计（附仓库链接）。
2. **README 顶部**：直接对比事件 —— "Unlike what JSON Formatter did, TrustJSON never injects ads, never tracks gelocation, never phones home. No `host_permissions`, no network access. Read the source."
3. **权限透明**：列出申请的每一项权限及原因（MVP：理想情况下仅 `storage` 存主题偏好；P1 若接管 `.json` 再说明对应权限）。
4. **可验证**：邀请用户自查 Network 面板、读源码、查 manifest。把「可被验证」本身当卖点。
5. **持续承诺**：明示永不转闭源式塞广告；任何数据相关变更走开源 changelog。

---

## 11. 风险与对策

| 风险 | 说明 | 对策 |
|---|---|---|
| 免费替代极多、买断单价低 | 更可能是「口碑型小现金流 + 个人品牌」而非一夜 $100K | 接受定位；靠「可信 + 性能 + Pro 纵深」立口碑；用 D（大文件）做 Pro 抬价值 |
| 时间窗口有限 | 塌房热度会衰减 | **尽快 ship 免费 MVP 蹭 Show HN**，第 2 周补 Pro |
| 信任卖点需「可被验证」 | 空喊没用 | 开源 + 最小权限 + 0 网络请求三件套硬兑现，邀请审计 |
| 大文件性能是硬骨头 | 做不对就和别人一样崩 | 虚拟滚动 + Worker 重点做对（§8.3），自验喂大 JSON |
| content script 接管 .json 引入权限 | 与最小权限卖点冲突 | MVP **默认不接管**，作为 P1 可选项，用最克制的匹配与权限 |

---

## 12. 成功指标（北极星）

- **MVP 阶段**：装机量 + 7 日留存（验证「可信替代」心智是否成立）；Show HN 排名 / 评论质量。
- **Pro 阶段**：免费→Pro 转化率；累计买断收入。
- **品牌**：是否成为塌房讨论里被推荐的默认替代品。

---

> 附：实现见 `light-apps-mvp/01-trustjson/`（可在 `chrome://extensions` 加载运行）。自验脚本与加载说明见该目录 README。
