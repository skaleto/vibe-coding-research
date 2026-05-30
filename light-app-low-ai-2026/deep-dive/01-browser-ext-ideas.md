# 浏览器插件深挖：当前痛点最集中、最值得个人开发者用 vibe coding 做的方向

> 调研时间：2026-05-29　|　范围：Chrome / Edge 插件生态（欧美 + 中文社区）
> 目标：在上一轮（`01-foreign-browser-ext.md`）甜点公式基础上**深挖到可落地的产品方案**
> 硬约束：运行时纯本地/零或极低 AI 成本 + 一次性买断为主 + 痛点真实有付费数据 + 1-2 周可 ship + 开发者刚需/寄生大平台
> 证据强度：【官方】店/官网披露；【自报】IH/HN/博客本人；【第三方】媒体/chrome-stats/分析站；缺失则写"未公开"+traction

---

## 〇、本轮新增的关键判断（不要再重复上一轮的结论）

上一轮已证明"寄生平台 + 纯本地 + 买断"模板可行（CSS Scan / Spider / Easy Folders / GoFullPage）。本轮深挖后，我对**机会窗口**有四条新的、更尖锐的判断：

1. **"纯本地/离线"在 2026 已是开发者工具的标配，不再是差异化卖点。** JSON 格式化、JWT/正则/Base64 工具箱、API 抓包、Tailwind 取色——每个细分都已有**多个免费、零数据收集**的离线插件（如 DevTools 40+ 工具集、NexusLabs DevKit、Rest API Inspector "zero data collection"）。光打"我也离线"没有护城河。**真正的护城河来自：①蹭一个新鲜的"信任真空"事件；②攻击付费龙头被公开吐槽的质量缺陷；③服务一个有"悬赏级"未满足需求的细分。**

2. **2026 出现了一个罕见的"信任真空"事件——可直接抢量。** 2026-1 至 4 月，装机 **200 万+** 的明星插件 **JSON Formatter（Callum Locke）** 被曝**转闭源 + 注入 GiveFreely 捐款弹窗（在结账页弹）+ 用 MaxMind 硬编码 key 做地理定位追踪 + 向 givefreely.com 上报行为数据**，在 HN / Reddit / DEV 上引爆，大量开发者卸载并找替代品【第三方：DEV、thepixelspulse、chrome-stats 多源交叉】。这不是孤例：2025-07 曝出 **18 个"可信"插件偷数据**、RedDirection 劫持campaign 波及 **1630 万**用户、一个"Color Picker/Geco colorpick"恶意取色插件波及 **230 万**用户【第三方：ISPreview、Spin.AI】。**开发者对插件的信任跌到谷底——"开源 + 极简权限 + 离线 + 可审计"此刻是能直接转化的购买理由。**

3. **买断模型在 2026 不仅活着，而且是开发者工具的主流定价。** 实证价格带：Tailscan **$89 lifetime**、Tail Lens **$30→$49 lifetime**、Inspect Flow lifetime、CSS Scan **$69**、WebHarvy **$139 lifetime**、Ultimate Web Scraper lifetime【官方/第三方】。ExtensionPay（~5% 抽成）/ Gumroad license key 收款链路已验证。**$29-89 是开发者工具买断的健康区间。**

4. **平台增强类的"组织/文件夹"赛道正在收口，新人难进；但"导出/可携带/拥有数据"仍有缝。** ChatGPT 文件夹赛道已被 AI Toolbox、Superpower（40 万用户）、Easy Folders（5 万用户）占住且在整合【第三方 ai-toolbox.co】。而 **AIPRM 的塌房**（用户怒斥：付了费连自己用的 prompt 源码都不让看/复制，要升到 **$79/月 Elite** 才给"基本透明"；prompt 卡片霸屏还把"隐藏"功能锁进付费）催生了一批"本地优先、无账号、你拥有你的数据"的替代品【第三方：techinnovate360、LinkedIn 控诉文、flashprompt 评测】。**"你的数据归你、本地存、能导出"是 2026 的情绪刚需。**

> **要主动避开的新陷阱**：LinkedIn/Twitter 自动化插件正被平台封杀（**Kleo 的 Chrome 插件 2025 年被 LinkedIn 关停**，自动评论违反 ToS 致账号受限）【第三方 cotera.co/phantombuster】——凡"替用户在大平台上自动操作 UI"的方向，平台风险极高，不做。

---

## 一、痛点扫描结果（按信号强度排序）

| 方向 | 痛点信号强度 | 关键证据 | 竞争态势 |
|---|---|---|---|
| **开发者工具的"信任真空"替代**（JSON/数据查看器等） | ★★★★★ 新鲜+海量 | JSON Formatter 200万用户塌房（2026-1~4）；18插件偷数据；多起千万级劫持 | 免费替代多，但**"可信+精品"位置空着** |
| **CSS/Tailwind 取色与"干净导出"** | ★★★★ 强 | CSS Scan 被吐槽"复制出多余/脏 CSS、移动端不稳、无 Tailwind"；Tailwind 取色赛道 2025 年才爆发 | 已有 6+ 玩家，但**"干净/框架感知输出"仍弱** |
| **大 JSON/API 响应查看（>20MB 不卡）** | ★★★★ 强 | 20MB JSON 让浏览器冻结 4 秒+；50MB 普遍崩溃；DevTools 预览慢 | 通用工具普遍在大文件上崩，**性能位空着** |
| **本地优先的 Prompt/数据管家（拥有你的数据）** | ★★★ 中（情绪强、赛道挤） | AIPRM 塌房；用户要"无账号、本地、可导出" | 已有 Open Prompt Manager 等免费开源，需找差异 |
| **Feishu/网页 → 可携带文档（带格式+可搜索+绕权限）** | ★★★ 中（窄但真实，字节相关） | V2EX **100 元悬赏**无人给出干净方案；现有剪藏只截首屏 | 几乎空白，但天花板低、维护随平台改版 |
| 截图/深色模式/标签管理 | ★ 低（饱和） | GoFullPage 8.6 版仍在勤更（2026-1）、900万用户把住 | **不做**，正面打不过 |
| LinkedIn/Twitter 自动化 | ✗ 负 | Kleo 被封 | **不做**，平台封杀风险 |

下面深挖信号最强的 **5 个具体方案**（要求 ≥3，给到 5 个并排序）。

---

## 二、方案深挖

### 方案 A：TrustJSON —「可审计、离线、能扛大文件」的开发者 JSON/数据查看器
> 一句话定位：在 JSON Formatter 塌房后，做那个"权限最小、开源可审计、50MB 不卡、零追踪"的可信替代——并把"diff / JWT 自动解码 / jq 查询"做成 Pro 买断。

**解决的具体痛点 + 真实证据**
- **信任真空（核心）**：200 万用户的 JSON Formatter 在 2026-1~4 转闭源 + 注入 GiveFreely 捐款弹窗（结账页弹）+ MaxMind 地理追踪 + 上报行为数据，开发者大规模卸载找替代【第三方：DEV "JSON-Formatter turns closed-source…"、thepixelspulse adware incident、HN item 47721946 讨论标题"now closed and injecting adware"】。已有人（Valentin Conan）愤而做了 JSONVault Pro，自述"Zero tracking on both tiers. No analytics, no telemetry"，但**刚上线、无 traction 数据**【作者博客自报】——**说明需求已被验证，但精品位置仍空，窗口期在 NOW**。
- **大文件性能痛点**：~20MB JSON 让浏览器主线程冻结 4 秒+；50MB 文件多数工具直接崩/OOM【第三方 Bugzilla 1363222、Dadroit "Open Big JSON" 指南、Notepad++ 社区】。
- **功能缺口**：现有对比分析指出主流 JSON 插件**普遍缺 jq、diff、强搜索**，仅做基础高亮【第三方 offlinetools.org 对比文】。

**目标用户 + 市场规模信号**
- 全体后端/前端/QA/数据工程师。仅原 JSON Formatter 就 **200 万装机**，整个"JSON viewer"品类在 chrome-stats 上有几十个条目、头部累计千万级。这是开发者**每天多次**触发的高频工具。

**竞品 + 真实数据 + 差异化**
- 原 JSON Formatter：**200 万+ 装机**【第三方 chrome-stats/whathappen.ai】，现因丑闻在掉量。
- 免费离线替代一堆：JSON Viewer Plus、各类 "Auto-Format JSON (Open Source)"、JSONVault Pro（新、无数据）。
- **差异化三件套**：①**开源 + 单一 `activeTab`/最小权限**（直接戳信任痛点，README 顶部放"我们绝不做 GiveFreely 那套"）；②**虚拟渲染扛 50MB+**（用 web worker 解析 + 虚拟列表，别人崩的地方你不崩）；③**Pro 买断功能**：side-by-side diff、JWT/Base64 自动识别解码、jq/JSONPath 查询、超大文件流式加载。免费层够用、付费层是"专业重度"功能。

**为什么运行时零/低 AI 成本（技术实现）**
- **100% 纯本地**：content script 把 `application/json` 响应或粘贴内容用本地 JS 解析 → 树渲染（虚拟滚动）→ diff 用 LCS 算法本地算 → JWT/Base64 本地解码 → jq 用 WASM 版本地跑。**零后端、零 LLM、零追踪**，边际成本 = 0。这正是"信任"卖点的技术底座。

**定价 + 收款**
- Freemium：核心查看/格式化/折叠/搜索**永久免费**（抢量、建信任）；**Pro 一次性 $19-29**（diff + JWT + jq + 50MB+ 大文件）。收款 ExtensionPay 或 Gumroad license key。

**冷启动渠道**
- **HN（Show HN：" I built an open-source, zero-tracking JSON viewer after JSON Formatter started injecting adware"）**——这个 angle 本身就是 HN 头条体质；DEV.to / Reddit r/webdev、r/programming（蹭丑闻讨论）；掘金/V2EX（中文开发者）；在原插件差评区和相关 HN 讨论串里"软露出"。

**业余可行性评分（1-5，越高越好）**
- 开发难度 **3**（树渲染+虚拟滚动+diff+jq-wasm 有工作量，但 vibe coding 可压到 1-2 周做出 MVP）
- 冷启动难度 **4**（有现成丑闻东风 + HN 体质，初始流量好拿）
- 天花板 **3**（高频刚需、装机天花板高；但买断单价低，需靠量+口碑，且免费替代多压价）

**1 周 MVP 范围（砍到最小可验证）**
- 只做：拦截 `application/json` 页面 → 本地树视图（折叠/展开/复制 path/复制 value）+ 关键词搜索 + 暗色主题 + **开源 + 最小权限**。先免费上架抢"可信替代"心智、跑装机和留存；diff/JWT/jq 作为 Pro 第二周加。

---

### 方案 B：CleanCSS —「复制出干净、可直接用」的元素样式提取器（攻击 CSS Scan 的软肋）
> 一句话定位：CSS Scan 让人吐槽"复制出一堆多余脏 CSS、移动端不稳、不支持 Tailwind"——做那个**默认输出干净、可选 Tailwind/原生/SCSS、移动端也稳**的精品买断版。

**解决的具体痛点 + 真实证据**
- CSS Scan 的公开短板：评测明确写"main drawbacks are its **price and output quality (copying extra CSS)**, plus occasional reliability issues (notably with **mobile view**)"，且**不支持 Tailwind**【第三方 csspeek 对比、uneed 评测】。
- Tailwind 取色赛道 **2025 年才集中爆发**（Tail Lens、Inspect Flow、Tailscan、Windy、Tailware、TailSnap、Tailwind Inspector），证明"从任意网页扒样式/类名"是真需求、且都走**买断**——但反过来说**通用 CSS 复制里"干净输出"这件事仍没人做好**。

**目标用户 + 市场规模信号**
- 前端工程师 + 独立开发者 + 设计转码者。CSS Scan 累计 **$100K+** 收入、7000+ 付费用户【创始人自报】；Tailwind 系全是 lifetime 定价说明这群人**愿意一次性付钱买省时**。

**竞品 + 真实数据 + 差异化**
- CSS Scan：**$69 买断**，累计 **$100K+**【自报】，短板=脏输出/移动端/无 Tailwind。
- Tailwind 系：Tailscan **$89 lifetime**、Tail Lens **$30→$49 lifetime**、Inspect Flow lifetime【官方/第三方 tailkits/taillens/gumroad】；但它们**只输出 Tailwind 类**，不覆盖"我要干净的原生 CSS / SCSS / CSS-in-JS"。
- **差异化**：①**输出质量优先**——内置规则裁掉浏览器默认值/继承冗余/厂商前缀重复，给"刚好够用"的最小 CSS；②**多目标导出切换**（原生 CSS / SCSS / Tailwind 类 / styled-components）；③**移动端断点稳**。把"复制即可用、不用再手删"做成口号。

**为什么运行时零/低 AI 成本**
- **纯本地**：读 `getComputedStyle` + 与默认样式表 diff 出"有意义的声明" + 本地映射到 Tailwind/SCSS（用内置的 token→class 查表，非 LLM）。零后端、零 AI。"框架感知"靠**规则表**不靠模型。

**定价 + 收款**
- **一次性 $39-49 lifetime**（卡在 CSS Scan $69 之下、Tail Lens $49 一线，用"更干净 + 多框架"打性价比）。ExtensionPay / Gumroad。

**冷启动渠道**
- Product Hunt（CSS Scan 当年靠 PH 两次发布起家）；前端社区 r/Frontend、DEV.to、掘金；Twitter/X 前端圈做"CSS Scan vs CleanCSS 输出对比"短视频（直观展示"少删 20 行"）。

**业余可行性评分**
- 开发难度 **3**（取样式不难，难在"干净裁剪"的规则打磨和各框架映射边界）
- 冷启动难度 **3**（赛道已热、有对标，但也意味着要正面卷，得靠"输出质量"这一个尖刀打透）
- 天花板 **3**（买断单价不错、人群付费意愿强；但竞品多，需要持续打磨保持领先）

**1 周 MVP 范围**
- 只做：悬停/点选元素 → 复制**干净原生 CSS**（先把"裁掉默认值+冗余"这一个核心价值做到位）+ 一键复制。**先只支持原生 CSS 输出**，把"比 CSS Scan 干净"验证了，再加 Tailwind/SCSS 切换。

---

### 方案 C：MyPrompts —「本地优先、你拥有你的 prompt」的跨 LLM Prompt 管家（吃 AIPRM 塌房红利）
> 一句话定位：AIPRM 让用户连自己的 prompt 都看不了还霸屏——做那个**无账号、本地存、随时导出、跨 ChatGPT/Claude/Gemini/Grok 通用**的轻量 prompt 库 + 文本展开器，买断解锁高级整理。

**解决的具体痛点 + 真实证据**
- AIPRM 塌房控诉：①付费用户**仍无法查看/复制 prompt 源码**，要升 **$79/月 Elite** 才给"基本透明"；②免费层 prompt 卡片**霸屏**搞乱 ChatGPT/Claude 界面，连"隐藏"都锁进付费；③**自动续费无预警直接扣款**；④prompt 贡献者无报酬【第三方 techinnovate360、LinkedIn"The Great AIPRM Controversy"、aiprm 评测/Trustpilot】。
- 2026 共识转向："users are abandoning 'move fast and break things' tools for **stable, private, and efficient** utilities"；多款主打**本地存（chrome.storage.local）、无账号、零遥测**的 prompt 管家被推荐（Open Prompt Manager、SyntaxAI、FlashPrompt）【第三方 flashprompt/spaceprompts 评测】。

**目标用户 + 市场规模信号**
- 所有重度 LLM 用户（开发者 + 知识工作者）。AIPRM 巅峰是 ChatGPT 周边头部插件；其塌房直接外溢出一整批替代品需求，说明**人群庞大且正在迁移**。

**竞品 + 真实数据 + 差异化**
- AIPRM：现 **$79/月 Elite**【官方定价页】，口碑崩。
- Open Prompt Manager：**免费 + 开源 + 本地 + 无账号 + 支持 15+ LLM**【官方店描述】——**这是最强免费对手，必须正视**。
- FlashPrompt：2026 评测"top spot"，本地存、无账号【第三方】。
- **差异化（难点）**：免费开源的 Open Prompt Manager 已占"本地无账号"心智，单纯做同样的事不行。可走：①**文本展开（type `;fix` → 展开整段 prompt）+ 变量填充 + 跨站统一**做到极致顺手；②**导入/导出 + 本地加密 + 版本历史**作为买断点；③**"从 AIPRM 一键迁移"**导入工具吃存量用户。

**为什么运行时零/低 AI 成本**
- **纯本地**：prompt 存 `chrome.storage.local`；触发靠 content script 在输入框注入文本 + 监听快捷键展开；变量填充是本地字符串替换。**完全不调 LLM**（它只是"喂词器"，不替你生成）。零后端、零 AI。

**定价 + 收款**
- Freemium：基础库 + 展开**免费**；**Pro 一次性 $15-25**（无限 prompt / 加密 / 版本历史 / 跨设备导出包）。ExtensionPay / Gumroad。

**冷启动渠道**
- 蹭 AIPRM 塌房讨论（Reddit r/ChatGPT、r/ClaudeAI、X）；做"AIPRM 迁移指南"SEO 长尾；PH。

**业余可行性评分**
- 开发难度 **2**（技术最简单，纯 storage + DOM 注入，vibe coding 几天能出）
- 冷启动难度 **4**（有塌房东风，但**免费开源强敌**在前，付费转化是最大风险）
- 天花板 **2**（赛道挤、免费替代强、买断单价低，更像"练手 + 小现金流"而非主攻）

**1 周 MVP 范围**
- 只做：保存/搜索/一键插入 prompt 到 ChatGPT+Claude 输入框 + `;关键词`快捷展开 + 本地存储 + **一键导出 JSON**。先免费验证留存，加密/版本/迁移工具作为 Pro。

---

### 方案 D：BigJSON Lab —「专治超大 JSON/NDJSON/日志」的本地查看分析器（性能垂直刀）
> 一句话定位：把方案 A 里"大文件"那一点单独做深做绝——别人 20MB 就冻、50MB 就崩，你用流式 + 虚拟渲染 + 索引把 **几百 MB** 也能丝滑查/搜/筛/导出。

**解决的具体痛点 + 真实证据**
- 大 JSON 痛点确凿：~20MB 冻结浏览器 4 秒+、50MB 普遍崩溃/OOM、文本编辑器打不开【第三方 Bugzilla 1363222、Dadroit、Notepad++ 社区】。后端/数据工程师导出的 API dump、日志、NDJSON 经常就是这个量级。

**目标用户 + 市场规模信号**
- 后端/数据工程师/SRE（处理大响应体、导出、日志）。比通用 JSON 工具人群窄，但**痛感更尖锐、付费意愿更高**（生产环境调试，省时间=省钱）。Dadroit（桌面大 JSON 工具）的存在本身就证明这是个有人买单的垂直。

**竞品 + 真实数据 + 差异化**
- 通用 JSON 插件：大文件**普遍崩**（这就是缺口）。
- Dadroit / 桌面工具：要装桌面软件、脱离浏览器工作流。
- **差异化**：留在浏览器里、本地、**专为大文件优化**（web worker 流式解析 + 虚拟列表 + 轻量索引做秒级搜索/筛选 + 导出子集/转 CSV）。

**为什么运行时零/低 AI 成本**
- **纯本地**：worker 里流式解析、内存里建索引、虚拟渲染只画可视区。**零后端零 AI**，唯一成本是你的算法功力。

**定价 + 收款**：一次性 **$29-39**（垂直专业工具，人群愿付）。ExtensionPay / Gumroad。

**冷启动渠道**：HN（"Show HN: open a 500MB JSON in your browser without crashing"——性能 demo 天生吸 HN）、r/dataengineering、r/programming。

**业余可行性评分**
- 开发难度 **4**（流式解析 + 索引 + 虚拟渲染是本五个方案里最硬的，vibe coding 也要 2 周+ 调性能）
- 冷启动难度 **3**（性能 demo 好传播，但人群窄）
- 天花板 **3**（人群窄但单价/付费意愿高、竞争少）

**1 周 MVP 范围**：只做"拖入一个 >50MB 的 .json 文件 → 不崩 → 虚拟树浏览 + 关键词搜索"。把"不崩 + 能搜"这一个硬核价值跑通，筛选/导出/NDJSON 后续加。

---

### 方案 E：PageKeep —「网页/受限文档 → 带格式可搜索的可携带存档」（字节相关的窄缝）
> 一句话定位：把任意网页（含 Feishu/Notion 等懒加载、受限文档）**完整**存成单文件 HTML/PDF，保留格式、可搜索、可点链接——补 SingleFile 只截首屏、截图不可搜的缺口。

**解决的具体痛点 + 真实证据**
- V2EX **100 元悬赏**求"把 Feishu 页面存成图文版"的方案，核心抱怨：SingleFile/SavePageWe **只截首屏**、截图不可搜且大、很多文档**权限受限不让下载/打印**、手动复制到 Obsidian 太累；**最终无人给出干净免费方案**——明确的未满足需求【第三方 V2EX t/972421】。
- 通用长截图工具也卡在懒加载/`overflow` 区域【第三方 Awesome Screenshot 支持文、Bugzilla 1643719】。

**目标用户 + 市场规模信号**
- 知识工作者 + 研究者 + 重度 Feishu/Notion 用户（字节内部就一大票）。需求真实但**相对小众**。

**竞品 + 差异化**
- SingleFile（开源、强但只到首屏体验）、各类剪藏。**差异化**：先把懒加载区域**自动滚动触发加载再抓全**、保留可搜索文本与链接、对受限文档走"展开视口 + DOM 抓取"路线。

**为什么运行时零/低 AI 成本**
- **纯本地**：自动滚动触发懒加载 → 抓 DOM + 内联资源 → 打包单文件 HTML（或本地 canvas/print 转 PDF）。零后端零 AI。

**定价 + 收款**：一次性 **$19-29**，或免费 + Pro（批量/PDF/特定平台适配）。Gumroad。

**业余可行性评分**
- 开发难度 **3**（懒加载触发 + 资源内联有边界 case）
- 冷启动难度 **4**（小众、靠 V2EX/少数派/Feishu 用户群口碑）
- 天花板 **2**（窄；且强依赖各平台 DOM，平台一改版就要维护，长期负担）

**1 周 MVP 范围**：只做"自动滚到底触发懒加载 → 存为可搜索单文件 HTML"，先在普通长网页跑通，Feishu/Notion 特化作为第二步。

---

## 三、排序、首推与理由

**综合排序（开发可行性 × 痛点新鲜度 × 冷启动东风 × 天花板）：**

| 排名 | 方案 | 一句话理由 | 综合分 |
|---|---|---|---|
| **1（首推）** | **A. TrustJSON** | 唯一同时具备"海量高频刚需 + 新鲜信任真空东风 + HN 天生体质 + 1 周可出免费 MVP"的方案 | ★★★★☆ |
| 2 | B. CleanCSS | 攻击付费龙头公开软肋、买断单价好、付费人群明确；但要正面卷已热赛道 | ★★★★ |
| 3 | D. BigJSON Lab | 垂直性能刀、竞争少、付费意愿高；但开发最硬、人群窄（可与 A 合并为一条产品线的 Pro） | ★★★☆ |
| 4 | C. MyPrompts | 有塌房东风、开发最易；但免费开源强敌当道、买断天花板低 | ★★★ |
| 5 | E. PageKeep | 需求真实且字节相关；但小众、维护随平台改版、天花板低 | ★★☆ |

**首推：方案 A — TrustJSON（可与 D 的"大文件能力"打包成它的 Pro 卖点）。**

**理由（四点）：**
1. **痛点最新鲜、最可转化**：JSON Formatter 200万用户塌房是 **2026 年正在发生**的事件，开发者正在主动找替代品——这是"需求被外力强行创造出来"的稀有窗口，比凭空教育市场容易一个数量级。
2. **冷启动有天生爆点**：Show HN 标题"开源、零追踪的 JSON viewer，因为 JSON Formatter 开始注入广告了"本身就是 HN/Reddit 头条体质，**不需要额外营销创意**，蹭事件即可起量。
3. **完美符合全部硬约束**：100% 本地（解析/diff/JWT/jq 全在浏览器，零后端零 LLM、边际成本为 0）；买断变现清晰（免费抢量 + $19-29 Pro）；1 周能 ship 免费 MVP（先做核心查看器），第二周加 Pro；是纯开发者刚需。
4. **可成长、有 Pro 纵深**：把方案 D 的"大文件不崩"和 diff/JWT/jq 做成 Pro，单一产品就有清晰的"免费→付费"升级路径，且每一项都是别人没做好的真缺口——不是空想的功能堆砌。

**唯一要清醒的风险**：JSON viewer 免费替代极多，买断单价偏低，**它更可能是"稳定的口碑型小现金流 + 个人品牌资产"**，而非一夜 $100K。若目标是更高买断单价，B（CleanCSS，$39-49）和 D（BigJSON，$29-39，竞争更少）是更"值钱"的备选——但它们的冷启动东风不如 A。**最优组合策略：以 A 蹭事件快速建立"可信开发者工具"品牌和装机，把 D 的大文件能力 + diff/JWT/jq 作为 A 的 Pro 变现，一鱼两吃。**

---

## Sources（按主题，含证据强度）

**JSON Formatter 塌房事件（方案 A/D 的核心东风）**
1. DEV — 《JSON-Formatter Extension Turns Closed-Source, Introduces Intrusive Donation Tactics and Tracking Without Consent》 https://dev.to/pavkode/json-formatter-extension-turns-closed-source-introduces-intrusive-donation-tactics-and-tracking-kf8 【第三方，详述 GiveFreely/MaxMind/追踪】
2. Pixels and Pulse — 《JSON Formatter Chrome Plugin Adware: What It Means for Your Browser》 https://thepixelspulse.com/posts/json-formatter-chrome-plugin-adware-incident/ 【第三方，200万用户/结账页弹窗/2026-1】
3. Hacker News 讨论（标题"JSON formatter Chrome plugin now closed and injecting adware"） https://news.ycombinator.com/item?id=47721946 【社区，HN 引爆，正文未取到】
4. DEV — Valentin Conan《I built a JSON viewer because the most popular one betrayed its users》（JSONVault Pro，"Zero tracking…"，无 traction） https://dev.to/valentinconan/i-built-a-json-viewer-because-the-most-popular-one-betrayed-its-users-5e6e 【作者自报，证明需求已验证】
5. chrome-stats — JSON Formatter（开源版条目，品类规模参考） https://chrome-stats.com/d/json_formatter 【第三方，装机统计站】

**大 JSON 性能痛点（方案 D）**
6. Bugzilla@Mozilla — 《JSON Viewer is slow for large JSON》（20MB 冻结 4 秒+） https://bugzilla.mozilla.org/show_bug.cgi?id=1363222 【官方 bug 库】
7. Dadroit — 《How to Open Large JSON Files Fast (2026 Guide)》（50MB 崩溃/OOM） https://dadroit.com/blog/open-big-json/ 【第三方/厂商】
8. offlinetools.org — JSON formatter 浏览器插件横评（缺 jq/diff/搜索） https://offlinetools.org/a/json-formatter/json-formatter-browser-extensions-a-comparative-analysis 【第三方对比】

**插件信任危机大背景**
9. ISPreview — 《18 Trusted Web Browser Extensions Discovered Stealing Your Data》(2025-07) https://www.ispreview.co.uk/index.php/2025/07/check-now-18-trusted-web-browser-extensions-discovered-stealing-your-data.html 【第三方/媒体】
10. Spin.AI — 《RedDirection … 16.3M Victims》（含"Color Picker/Geco colorpick"恶意取色插件 230万受害） https://spin.ai/blog/how-spinai-researchers-uncovered-142-million-more-victims-in-the-reddirection-browser-extension-attack-campaign/ 【第三方安全厂商】
11. Chrome for Developers — Permissions list（"read and change all data"权限语义） https://developer.chrome.com/docs/extensions/reference/permissions-list 【官方】

**CSS/Tailwind 取色赛道（方案 B）**
12. csspeek — 《CSS Viewer vs CSS Peeper vs CSS Scan: Best in 2026》（CSS Scan 短板：脏输出/移动端/价格） https://csspeek.com/blog/css-viewer-vs-peeper-vs-scan 【第三方对比】
13. Uneed — 《CSS Scan Review》 https://www.uneed.best/blog/css-scan-review 【第三方评测】
14. Tailkits — Tailscan（$89 lifetime） https://tailkits.com/tools/tailscan/ 【第三方/官方价】
15. Tail Lens 官网（$30→$49 lifetime，7 天试用） https://www.taillens.io/ 【官方】
16. Inspect Flow 官网（lifetime） https://www.inspectflow.io/ 【官方】
17. Tailscan 官网 https://tailscan.com/ 【官方，未取到正文，价格来自 Tailkits】
18. CSS Scan Chrome Web Store https://chromewebstore.google.com/detail/css-scan/gieabiemggnpnminflinemaickipbebg 【官方】

**Prompt 管家 / AIPRM 塌房（方案 C）**
19. techinnovate360 — 《AIPRM Is Dangerous … And How To Uninstall In 2024》 https://techinnovate360.com/most-asked-aiprm-question-answered/ 【第三方】
20. LinkedIn — Keith Carpenter Jr《The Great AIPRM Controversy》 https://www.linkedin.com/pulse/great-aiprm-controversy-keith-carpenter-jr 【个人观点/控诉】
21. flashprompt — 《Best Chrome Extension Prompt Manager 2026》（本地存/无账号趋势、Open Prompt Manager/FlashPrompt） https://www.flashprompt.app/blog/chrome-extension-prompt-manager-2026 【第三方/竞品自评，谨慎】
22. AIPRM 官方定价（Elite $79/月） https://app.aiprm.com/pricing 【官方】
23. ai-toolbox.co — ChatGPT 文件夹赛道竞品对比（Easy Folders 5万、Superpower 40万、整合趋势） https://www.ai-toolbox.co/chatgpt-toolbox-competitors/chatgpt-toolbox-vs-superpower-chatgpt-vs-easy-folders-vs-foldermate 【第三方/竞品自评，谨慎】

**网页/Feishu 存档（方案 E）**
24. V2EX — 《100 元求一个能保存飞书页面为图文版本的方案》（悬赏未解，未满足需求实证） https://v2ex.com/t/972421 【社区原帖】
25. Bugzilla@Mozilla — 全页截图对可滚动子元素截断（长截图痛点） https://bugzilla.mozilla.org/show_bug.cgi?id=1643719 【官方 bug 库】

**买断/收款与赛道背景（通用）**
26. ExtensionPay — 《8 Chrome Extensions with Impressive Revenue》（GMass $130K/mo、Closet Tools $42K/mo、CSS Scan $100K+/$69 买断、Spider $10K/2月/$38、Night Eye $3.1K/mo 等） https://extensionpay.com/articles/browser-extensions-make-money 【第三方汇编，含多家收入数】
27. cotera.co — 《LinkedIn Automation in 2026》（Kleo 插件 2025 被 LinkedIn 关停——自动化陷阱实证） https://cotera.co/articles/linkedin-automation-ai-agents 【第三方/媒体】
28. PromptCloud / Thunderbit / Clay — 点选爬虫竞品数据（Instant Data Scraper 100万用户、Web Scraper 80万、WebHarvy $139 lifetime——对照） https://thunderbit.com/blog/best-web-scraper-chrome-extensions 【第三方/竞品自评，谨慎】
29. dev.to/anmolbaranwal — 《Best Chrome extensions for API development & testing in 2025》（Rest API Inspector "zero data collection"、copy as cURL——离线已标配的佐证） https://dev.to/anmolbaranwal/best-chrome-extensions-for-api-development-testing-in-2025-4f27 【第三方】

> **数据诚信声明**：本文所有金额/装机数均标来源与证据强度。JSON Formatter "200万+用户"经 DEV/thepixelspulse/chrome-stats 多源交叉；HN 原帖正文因 WebFetch 受限未取到，仅引用其公开标题与多篇二手转述。JSONVault Pro、各 Tailwind 工具的 traction 多为"未公开"，已如实标注并仅引用其官方价格。竞品自评类来源（flashprompt、ai-toolbox、thunderbit 等）已标"谨慎"。未编造任何数字。
