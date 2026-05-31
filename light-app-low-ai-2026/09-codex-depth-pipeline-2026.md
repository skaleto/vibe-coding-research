# Codex 纵深调研 Pipeline · 低 AI 成本轻应用法证拆解

**调研日期**：2026-05-30  
**方法**：启动独立“深度”subagent，并由主控二次核对关键来源。项目内旧报告仅用于学习组织模式；本文件不复用旧报告的数据，所有判断按本轮重新打开的公开来源降权。  
**定位**：不铺新赛道，而是把少数更适合个人/小团队的方向拆到定价、运行时成本、冷启动、护城河、风险和 kill 标准。

---

## 0. 证据分级

| 等级 | 证据类型 | 使用方式 |
|---|---|---|
| A | 官方页面、平台文档、官方商店、官方定价、平台一手统计 | 可作为核心依据 |
| B | 知名媒体、研究机构、安全公司、第三方数据库 | 可作方向验证，数字不当精确收入 |
| C | 创始人自报、Indie Hackers、Reddit、社区帖 | 只作弱信号或早期假设 |
| D | 二手搬运、匿名截图、无法追溯来源 | 不进入核心判断 |

**口径**：公开资料里多数是 price / installs / users / gross revenue / MRR 线索，不等于 net profit。本文未找到净利润的地方，一律写“净利润未披露”。

---

## 1. 总判断

> 最适合这轮约束的，不是“低价 AI wrapper”，而是“本地/端侧/宿主承担计算的确定性工具”：AI 可以用于开发阶段提速，但运行时尽量不产生模型 API 成本。

| 排名 | 方向 | 适配度 | 推荐变现 | 一句话判断 |
|---|---:|---:|---|---|
| 1 | 浏览器扩展：网页捕获、导出、标注、脱敏、平台增强 | 高 | $19-39 lifetime 或 $1-3/月 Pro | 首选，MVP 最快，但分发和维护是真难点 |
| 2 | 本地媒体/文档批处理 Mac 工具 | 高 | $29-59 买断 + 更新续费 | 运行时成本最干净，适合官网分发 |
| 3 | 作者/自出版本地校验与排版周边工具 | 中高 | $29-79 买断 | 小众但付费意愿比普通 C 端更真实 |
| 4 | Google Sheets/Workspace 确定性 add-on | 中 | $19-49/年或 $49 lifetime | 适合窄行业，OAuth 和审核是门槛 |
| 5 | 本地 MCP/Agent 工具包 | 中 | $39-99 developer license | 2026 窗口期，但安全与标准变化风险高 |

**暂不优先**：消费健康 App、通用 AI 写作/总结、AI 视频、订阅型聊天/陪伴、纯免费 SEO converter 矩阵。它们往往获客贵、留存弱、平台抽成重，或运行时成本与低价买断冲突。

---

# 第 1 组 · 浏览器扩展：网页工作流里的确定性增强

## 1.1 市场信号

| 信号 | 证据 | 降权说明 |
|---|---|---|
| GoFullPage Chrome Web Store 显示 11M users、84K ratings，且仍维护 | A：Chrome Web Store | 这是需求和分发信号，不是收入信号；收入/净利润未披露 |
| GoFullPage Premium 页面显示 $1/month | A：GoFullPage 定价页 | 只能说明低价 premium 能成立，不能推导付费率 |
| Chrome Web Store 原生付费系统已废弃 | A：Google Chrome developer 文档 | 扩展必须外接支付/license，增加转化摩擦 |
| Chrome 扩展生态安全审查趋严 | A：arXiv 扩展安全研究 | 权限、隐私、更新审查会直接影响转化 |

## 1.2 适合做什么

不要做“又一个截图工具”。更好的切口是一个明确工作流：

- **LLM 聊天记录导出**：ChatGPT / Claude / Gemini 页面转 Markdown / PDF，自动去头像、按钮、浮层。
- **Bug report 捕获**：整页截图 + DOM 片段 + console error + network HAR 摘要，本地打包。
- **网页脱敏导出**：批量遮盖邮箱、手机号、token、内部域名，再导出给客户/外包/法务。
- **Web QA 对比**：同一 URL 的 before / after 截图差异，全部在浏览器本地处理。

## 1.3 定价机制

- Free：每月 10 次导出或单站点支持。
- Lifetime：$19-29 解锁本地功能。
- Pro：$1-3/月，用于同步配置、团队模板、云分享；核心功能仍本地可用。
- 收入口径：早期只能看 gross revenue；Stripe/Paddle/Lemon Squeezy 手续费和税务服务费需另扣。

## 1.4 运行时成本

几乎为零。主要成本是支付手续费、少量 license 校验、客服、浏览器和目标网站改版维护。不要把“总结截图内容”“自动写报告”放进核心付费点，否则会从本地工具变成持续 API 成本产品。

## 1.5 冷启动路径

- Chrome Web Store 关键词：`screenshot`、`export`、`chatgpt export`、`redact`、`bug report`。
- 垂直社区：Web QA、前端、产品经理、AI power user。
- 内容打法：每个支持平台写一页“如何导出/脱敏 XXX 聊天记录/网页证据”。

## 1.6 护城河

弱护城河。真正壁垒来自：

- 兼容复杂页面的 bug 修复库；
- 用户模板和导出格式积累；
- 低权限、隐私、本地处理的信任；
- 多浏览器覆盖。

## 1.7 风险与 kill 标准

- Chrome 政策、Manifest 变更、目标网站 DOM 改版、隐私权限说明是核心风险。
- 2 周内必须做出一个平台的稳定导出。
- 发布 14 天内没有 200 安装或 5 个真实付费/预购，换切口。
- 60 天内低于 $100 gross revenue 且没有高频用户反馈，kill。
- 每周修目标网站 DOM 超过 3 小时，除非收入已覆盖维护，否则 kill。

---

# 第 2 组 · 本地媒体/文档批处理 Mac 工具

## 2.1 市场信号

| 信号 | 证据 | 降权说明 |
|---|---|---|
| CleanShot X：$29 one-time，含 1 年更新，可 $19/年续更新 | A：CleanShot 官方定价 | 买断 + 更新续费模型成立，但收入/净利润未披露 |
| Compresto 主打 Mac 本地批量压缩 video / image / PDF / GIF | A：Compresto 官网 | 证明本地隐私定位清晰，收入/净利润未披露 |
| MacWhisper 主打本地转录，音频默认不上传云 | A：MacWhisper 官网 | 证明端侧/本地 AI 可做买断或低成本路线，收入/净利润未披露 |

## 2.2 适合做什么

不要做泛压缩。要做“一个人真的会反复批处理”的窄工具：

- HEIC / JPEG / PNG / WebP / AVIF 批量转换 + 尺寸预设 + 保留/删除 EXIF。
- PDF 图片压缩 + 发票/合同附件瘦身，离线处理。
- IPTC / EXIF / C2PA 元数据批量注入，给摄影师/设计师交付前确权。
- 给小红书/公众号/电商详情页的图片尺寸和体积预设。

## 2.3 定价机制

- $29-49 买断，含 1 年更新。
- 更新续费 $15-25/年，可继续用旧版本。
- 团队 license $99-199，按 seat 或设备数。
- 收入口径：gross revenue；支付和税务服务费另扣；公开净利润样本不足。

## 2.4 运行时成本

本地处理，接近零。云同步、分享链接、团队管理都会引入服务器成本，应后置。

## 2.5 冷启动路径

- Product Hunt、Mac app directories、Setapp 申请。
- SEO 长尾：`compress HEIC batch Mac`、`remove EXIF batch`、`PDF too large email Mac`。
- 视觉类内容可在小红书/B 站做前后对比，但不把单条爆款当基线。

## 2.6 护城河

中低。核心不是算法，而是：

- 预设库；
- 批处理稳定性；
- 文件格式边角兼容；
- Finder / Raycast / Shortcuts 集成；
- 用户相信“文件不出本机”。

## 2.7 风险与 kill 标准

- macOS 权限、App Store 沙盒、格式专利/系统 API 变化是主要风险。
- 建议先官网分发 + MoR 收款，App Store 后置。
- 7 天内 MVP 必须稳定处理 500 张图片或 100 个 PDF。
- 发布 30 天内没有 10 个付费用户，说明痛点或渠道不对。
- 如果用户只要免费替代品，不愿为批量/隐私/预设付费，kill 或转更专业人群。

---

# 第 3 组 · 作者/自出版本地校验与排版周边

## 3.1 市场信号

| 信号 | 证据 | 降权说明 |
|---|---|---|
| Atticus 官方显示 $147 one-time，无月费，跨平台 | A：Atticus 官网 | 高客单买断心智存在，收入/净利润未披露 |
| Plottr 官方显示 40,000+ writers，lifetime 档，强调 offline / No AI | A：Plottr 官网 | 用户数和定位可信，收入/净利润未披露 |
| Vellum 第三方整理显示 ebook+print $249.99 one-time、Mac-only | B：Cambric pricing 整理 | 可作定价参照，不作收入证据 |

## 3.2 适合做什么

不要正面做“下一个 Atticus / Vellum”。1-2 周 MVP 应切周边痛点：

- **KDP / IngramSpark 上传前 preflight checker**：页边距、出血、图片 DPI、目录、ISBN、元数据。
- EPUB / print PDF 差错扫描：断章、孤行、标题层级、图片超界、链接失效。
- Series bible 本地数据库：角色、地点、时间线、一致性校验，不生成正文。
- 非虚构/菜谱/教材固定版式模板校验，避开小说排版主战场。

## 3.3 定价机制

- $29-79 买断，按“每本书省一次返工/外包费”定价。
- 模板包/规则包：$9-19/包。
- 不建议低价订阅，作者群体对一次性工具接受度更高。

## 3.4 运行时成本

本地规则引擎，接近零。AI 文风建议只能作为 BYOK 或本地模型实验功能，不进入核心承诺。

## 3.5 冷启动路径

- Kindlepreneur、Reedsy、r/selfpublish、自出版 Facebook/Discord 社群。
- SEO：`KDP print PDF rejected`、`IngramSpark bleed error`、`EPUB validation`。
- 找 10 位独立作者免费跑真实稿件，拿错误截图做案例。

## 3.6 护城河

中等。规则库、平台上传错误经验、模板兼容性会积累成专家系统壁垒，比纯 UI 工具更难被一晚复制。

## 3.7 风险与 kill 标准

- Amazon KDP / IngramSpark 规则变化；
- 不同语言排版规则；
- 用户把校验结果误当法律/出版保证。

Kill 标准：

1. 2 周内必须能对真实 PDF/EPUB 输出可执行错误报告。
2. 10 位作者测试中，少于 3 人愿意为修错付费，kill。
3. 若每个平台规则变化都要大量人工维护，而付费不足，缩到一个平台。

---

# 第 4 组 · Google Sheets / Workspace 确定性 Add-on

## 4.1 市场信号

| 信号 | 证据 | 降权说明 |
|---|---|---|
| YAMM 在 Google Workspace Marketplace 显示 16M+ installs | A：Google Marketplace | 安装量是需求信号，收入/净利润未披露 |
| Sync2Sheets 官方定价为 $12 / $19 / $40 月付年结档位 | A：Sync2Sheets 官网 | 定价可信，收入需另证 |
| Sync2Sheets Indie Hackers 页面显示 revenue $9K/mo | C：Indie Hackers | 创始人/社区口径，非净利润 |
| Google 官方说明敏感/受限 scope 需要 OAuth verification review | A：Google docs | 审核是 MVP 速度风险 |

## 4.2 适合做什么

不要做通用 Notion / CRM / 营销连接器。更适合：

- Sheets -> PDF 发票/报价单/收据生成器，只读当前表格，少 scope。
- CSV / Excel 清洗：去重、地址规范、SKU 拆分、列校验。
- 固定行业报表：培训机构课时、健身教练排课、小型外贸报价。
- Sheets -> 定时邮件快照，但避开 Gmail restricted scope；先让用户下载或用简单链接分享。

## 4.3 定价机制

- Solo：$29-49 lifetime。
- Team：$49-99/year。
- 如果需要持续同步外部 API，改订阅，不要 lifetime。
- 收入口径：gross MRR/ARR；没有公开净利润时不推算净利。

## 4.4 运行时成本

Apps Script / Google API 为主，无 AI 成本。但 OAuth 审核、支持、API quota、边界兼容会消耗时间。

## 4.5 冷启动路径

- Marketplace 搜索词 + YouTube 教程 + 模板下载。
- 用 Google Sheet 模板作为免费入口，add-on 只解锁自动化。
- 找 20 个目标行业用户，用他们现有表格改造成模板。

## 4.6 护城河

中低。模板库、行业字段、错误处理、长期兼容性是护城河。通用功能很容易被复制。

## 4.7 风险与 kill 标准

- OAuth 审核、CASA/安全评估、Google API 变更、数据权限信任。
- MVP 严格避免 Gmail/Drive 全盘权限。
- 7 天内必须用真实用户表格完成一个端到端输出。
- Marketplace 上线/审核超过 30 天仍卡住，先转 Web app/模板售卖验证。
- 60 天内少于 5 个团队/个人付费，kill 或收窄行业。

---

# 第 5 组 · 本地 MCP / Agent 工具包

## 5.1 市场信号

| 信号 | 证据 | 降权说明 |
|---|---|---|
| OpenAI Apps SDK 建立在 MCP 上，monetization 细节未来再公布 | A：OpenAI Help | 平台窗口真实，但直接变现机制未成熟 |
| MCP 官方规范显示 stdio transport 是客户端启动本地 subprocess | A：MCP spec | 本地工具有零云成本路径 |
| Censys 2026 报告称数据集中已有 over 21,000 MCP servers，并指出默认认证/授权风险 | B：Censys | 用作热度与风险信号 |
| 2026 年已有 MCP 相关 RCE / 安全风险报道 | B：Tom's Hardware / OX Security 报道 | 安全是生死线 |

## 5.2 适合做什么

适合做“宿主模型付推理费，我只卖本地工具”的产品：

- Read-only repo intelligence MCP：本地代码库索引、依赖图、ADR/README 查询。
- Local data MCP：CSV / SQLite / Parquet 查询、脱敏预览、schema 解释。
- Git history forensic MCP：谁改了什么、发布前风险清单。
- Compliance calculator MCP：确定性规则计算，不联网、不跑云 LLM。

## 5.3 定价机制

- $39-99 per developer license。
- Team license $199-499。
- 不承诺云端托管；让用户在 Claude / Cursor / ChatGPT 等宿主里使用，推理成本由用户已有订阅或 key 承担。
- 该方向公开可验证收入样本不足，只按窗口期处理。

## 5.4 运行时成本

本地进程 + 本地索引，接近零。远程 MCP server 会立即引入认证、托管和安全成本，不适合 1-2 周 MVP。

## 5.5 冷启动路径

- GitHub + awesome-mcp/目录提交。
- Cursor / Claude Desktop / ChatGPT developer 社区。
- 定位“安全、只读、可审计”，而不是“更聪明的 agent”。

## 5.6 护城河

早期较弱，但可通过：

- 安全默认值；
- 只读权限；
- 高质量 schema/index；
- 和真实开发工作流绑定；
- 本地 license 激活体验。

## 5.7 风险与 kill 标准

- 协议变更、宿主客户端行为变化、安全漏洞、用户不信任本地工具执行。
- 所有 destructive tool 默认关闭。
- 2 周内必须支持一个宿主客户端和一个明确任务。
- 安装配置超过 5 分钟，转化会很差，必须砍复杂度。
- 30 天内没有 100 GitHub stars 或 10 个付费开发者，换具体场景。
- 出现任何命令执行/凭据读取安全争议，立即冻结发布。

---

# 观察方向 · Self-hosted license / admin helper

## 证据

- Cloudron 官方定价显示 Pro 15 欧元/月，并强调完全 self-hosted。
- Plausible README 表示项目由用户付费支持，托管版收入用于维护开源项目。
- Immich 文档允许购买个人/服务器支持 license，同时声明功能不会放到 paywall 后。

## 判断

这个方向适合做“卖给已有 self-hosted 项目/indie SaaS 开发者的 license、更新、备份、状态页组件”，但不建议作为第一优先级。原因是 self-hosted 用户免费心智强，分发慢，很多项目的真正收入来自云托管而非 license。

可做小 MVP：Docker app 的离线 license server + update channel + seat activation，一次性 $49-99 卖给 indie 开发者。

---

# 统一失败基线与 Kill 标准

## 失败基线

- 不要把头部产品的用户数当收入。GoFullPage 有千万级用户，YAMM 有千万级安装，但收入和净利润均未披露。
- RevenueCat 2026 数据集覆盖 115,000+ apps、$16B+ revenue，报告显示订阅 App 市场更残酷：头部增长更快，底部更萎缩；AI app 也存在留存和退款压力。
- 所以本文只把用户数、安装数、价格当需求信号，不把它们推导成收入。

## 统一 kill 标准

1. MVP 开发预算最多 10 个工作日。
2. 预售页或下载页上线前写清楚价格，不做永久免费幻觉。
3. 14 天内没有 5 个付费/预购，必须换定位或换渠道。
4. 60 天内没有 $100 gross revenue 或 10 个愿意付费用户，kill。
5. 任何方向一旦需要持续云 LLM 调用，就必须从 lifetime 改订阅/BYOK，否则 kill。
6. 每周维护超过 3 小时且 gross revenue 低于 $200/月，停止加功能，只保留长尾。

---

# 最强可落地点子

| 点子 | MVP | 定价 | 为什么强 | 反例警告 |
|---|---|---:|---|---|
| LLM 聊天/网页证据导出与脱敏扩展 | 先支持 1 个站点 + 本地脱敏 + PDF/Markdown | $19 lifetime，团队模板 $49 | 零运行成本，AI 用户天然有导出和归档痛点 | DOM 变化和权限说明会影响信任 |
| Mac 本地 HEIC/PDF/图片批处理工具 | HEIC->JPG/WebP、PDF 压缩、EXIF 删除、批量重命名 | $29-39 买断 | 本地零成本，视觉结果容易传播 | 免费工具多，必须靠批量/预设/可靠/隐私差异化 |
| KDP/自出版上传前 Preflight Checker | PDF 尺寸、出血、DPI、目录链接、元数据清单 | $49 买断，规则包 $9 | 作者愿为避免返工付费，规则引擎无 AI 成本 | 不要做全套写作软件 |
| Sheets 行业小工具 | 外贸报价单/培训课时报表/自由职业发票三选一 | $29 lifetime solo，$99/year team | 用户已有数据在 Sheets，确定性自动化能省时间 | 避开 Gmail/Drive 全权限 |
| Read-only Local MCP for Developers | repo index + README/ADR/search + dependency graph | $49 developer license | MCP 是 2026 窗口，推理成本由宿主承担 | 安全是生死线，只读、透明日志、最小权限 |

---

# Sources

- GoFullPage Chrome Web Store: https://chromewebstore.google.com/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl
- GoFullPage Premium: https://gofullpage.com/premium/1000
- Chrome Web Store payments deprecation: https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/docs/webstore/cws-payments-deprecation/index.md
- Chrome extension security paper: https://arxiv.org/abs/2406.12710
- CleanShot X pricing: https://cleanshot.com/pricing
- Compresto: https://compresto.app/
- MacWhisper: https://www.macwhisper.net/
- YAMM Google Workspace Marketplace: https://workspace.google.com/marketplace/app/yet_another_mail_merge_mail_merge_for_gm/52669349336
- Sync2Sheets pricing: https://sync2sheets.com/pricing/
- Sync2Sheets Indie Hackers revenue page: https://www.indiehackers.com/product/notion2sheets/revenue
- Google OAuth verification: https://developers.google.com/workspace/marketplace/configure-oauth-consent-screen
- Atticus: https://www.atticus.io/
- Plottr pricing: https://plottr.com/pricing/
- Vellum pricing reference: https://cambric.pub/compare/vellum-pricing/
- OpenAI Apps SDK: https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk
- MCP transports specification: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- MCP authorization specification: https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
- Censys MCP servers report: https://censys.com/blog/mcp-servers-on-the-internet/
- MCP RCE coverage: https://www.tomshardware.com/tech-industry/artificial-intelligence/anthropics-model-context-protocol-has-critical-security-flaw-exposed
- Cloudron pricing: https://www.cloudron.io/pricing.html
- Plausible Analytics README: https://github.com/plausible/analytics
- Immich support license docs: https://immich.app/docs/overview/support-the-project/
- RevenueCat State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps-2026-productivity/
