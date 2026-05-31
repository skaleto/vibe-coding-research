# Codex 广度调研 Pipeline · 轻应用机会地图补充

**调研日期**：2026-05-30  
**方法**：启动独立“广度”subagent，并由主控二次核对可用来源。项目内旧报告仅用于学习组织方式；本文件优先补充旧报告覆盖较浅的新 surface / 新人群 / 新平台 / 新变现模型，不复用旧报告数据。  
**硬约束**：运行时零/低 AI 成本；个人/小团队 1-2 周可做 MVP；优先买断/license/低价解锁/BYOK；所有收入类数字降权处理。

---

## 0. 一句话结论

> 本轮最值得补进机会地图的，不是又一批通用 AI wrapper，而是“平台内工作流小插件 + 高摩擦专业人群 + 运行时零云/BYOK”的组合。

优先看 Canva / Figma / Shopify 这类有内生工作流和 marketplace 的平台，以及 accessibility、prompt eval、创作者卖家工具、Roblox/UEFN 创作者工具这类 2025-2026 仍在变化的新 surface。

---

## 1. 值得继续深挖

### 1.1 Canva Apps：给非设计师的批量设计工作流插件

**用户/痛点**：中小商家、教师、社媒运营在 Canva 内批量做海报、证书、菜单、活动物料。痛点不是“生成一张图”，而是重复排版、品牌一致性、批量导出、尺寸适配。

**代表信号**：

- Canva 官方 Apps SDK 有 monetization 文档；
- Premium Apps Program 支持开发者按 app 使用获得 recurring revenue；
- Canva 也支持 adoption awards、developer grants、external payment links。

证据等级：A。单个 app revenue / MRR / ARR 未披露；net profit 未披露。

**运行时 AI 成本**：可做到零。做模板校验、批量 resize、导出命名、品牌色检查即可。若做文案/图像生成，应优先 BYOK 或用平台侧能力。

**1-2 周 MVP**：可行。先做“品牌一致性检查 + 批量导出命名 + 多尺寸社媒包生成”。

**主要风险**：Canva 审核与平台政策；平台变现路径不如 App Store 成熟；用户是否愿为第三方 app 单独付费需要验证。

**可落地点子**：`Canva Brand QA`，一键检查字体、颜色、logo 安全区、导出尺寸，面向 agency 和小商家。

---

### 1.2 Figma 设计 QA / Dev Handoff 插件

**用户/痛点**：设计系统团队、前端团队、外包 agency，需要交付前检查组件命名、颜色 token、间距、无障碍对比度、导出规范。

**代表信号**：

- Figma 有官方 plugin runtime / Community 生态；
- Figma 帮助文档说明 paid resource / paid plugin 的规则，但也注明当前不批准新的 paid file creators；
- plugin 或 widget 可包含付费能力，但必须有免费功能。

证据等级：A。单插件收入通常未公开；net profit 未披露。

**运行时 AI 成本**：零，绝大多数是确定性 lint / token diff / WCAG contrast。

**1-2 周 MVP**：可行。先做 8-10 条设计系统规则检查。

**主要风险**：Figma 用户对付费插件敏感；大团队已有内部 lint；需要真实设计系统样本。

**可落地点子**：`Design System Doctor`，读取 Figma file，输出 token drift、未命名 layer、contrast fail、组件脱链清单。

---

### 1.3 Shopify 微型垂直商家 App

**用户/痛点**：Shopify 商家有很多窄而刚性的运营问题，如尺码表、保修登记、退换货理由归因、B2B 报价单、订阅盒装清单、礼品留言审核。

**代表信号**：

- Shopify 官方文档显示，开发者从 2025-01-01 起 first $1,000,000 USD gross app revenue 可保留 100%，超过部分保留 85%；
- 需要一次性 $19 Partner account registration fee；
- 2.9% processing fee 和适用税费另算。

证据等级：A。单个 app MRR / ARR 未披露；net profit 未披露。

**运行时 AI 成本**：零或极低。优先做规则、表单、PDF、商店后台 workflow。

**1-2 周 MVP**：中等可行。需要 Shopify app OAuth 和审核，但单功能可做。

**主要风险**：审核周期、商家支持成本、Shopify API 变化、差评影响 App Store 转化。

**可落地点子**：`Warranty Card for Shopify`，商品序列号/保修登记/自动 PDF 凭证，按店铺月订阅。

---

### 1.4 Accessibility / WCAG / PDF 合规轻工具

**用户/痛点**：小型 agency、独立站站长、地方机构、教育机构需要 WCAG、PDF/UA、色彩对比、alt text、表单 label 检查，但不想买重型 enterprise 工具。

**代表信号**：

- 浏览器扩展、Lighthouse、axe 等说明网页 accessibility 检查有稳定工作流；
- 市面已有一次性 license / 扩展类 accessibility 工具，但收入多未公开。

证据等级：B/C。可见的是产品和定价，不是收入；net profit 未披露。

**运行时 AI 成本**：零；规则扫描即可。alt text 可选 BYOK。

**1-2 周 MVP**：可行。做 Chrome extension：扫描当前页 WCAG 快速问题并导出客户报告。

**主要风险**：法律合规表述不能过度承诺；axe/Lighthouse 免费工具强。

**可落地点子**：`WCAG Client Report Lite`，面向自由职业前端，一键生成带截图和修复建议的客户 PDF。

---

### 1.5 Prompt / Agent 回归测试工具：面向小团队 BYOK

**用户/痛点**：小团队把客服、销售、数据查询接到 LLM 后，缺少“改 prompt 后有没有变差”的回归测试。

**代表信号**：

- promptfoo 官方定位为 open-source CLI and library，用于 evaluating and red-teaming LLM apps；
- pricing 页显示 Community 免费，Enterprise / On-Premise custom pricing；
- 官方定价页也写明某些 red teaming 插件需要 inference 进行动态测试生成和评分。

证据等级：A/C。开源 + 企业版机制清晰；promptfoo 自身 revenue / MRR / ARR 未披露。

**运行时 AI 成本**：BYOK，把模型调用成本转给用户；产品只收 license/seat。

**1-2 周 MVP**：可行。做“非工程用户也能配置的 prompt regression sheet”。

**主要风险**：开发者工具红海；需要可信评测模板；企业采购慢；eval 本身也会产生用户侧模型成本。

**可落地点子**：`Prompt QA Pack for Support Bots`，内置 50 个客服场景测试、CSV 上传、CI 报告、BYOK。

---

### 1.6 Roblox / UEFN 创作者工具，而不是做游戏本身

**用户/痛点**：Roblox、UEFN 创作者需要素材管理、经济数值表、版本发布 checklist、收入/转化看板、素材合规检查。

**代表信号**：

- Roblox 官方 2025 Economic Impact Report 称 2024-03 到 2025-03 创作者通过 DevEx Program 全球赚取 over $1B；
- Roblox Creator Hub 文档写明 2025 年已有 132M DAUs，Creator Store 的 models/plugins 可获得 100% net proceeds；
- Fortnite 官方开发者页面称 UEFN launch 以来第三方开发者已获得 over $900M engagement payouts；
- Epic 2025-2026 推动创作者在 Fortnite island 内出售自有物品。

证据等级：A/B。平台经济规模强；单工具收入未披露；net profit 未披露。

**运行时 AI 成本**：零。做数据表、清单、资产校验、版本管理即可。

**1-2 周 MVP**：可行，先做外部 Web 工具，不碰平台内插件审核。

**主要风险**：用户年轻、付费能力参差；平台规则和 IP/儿童合规敏感。

**可落地点子**：`UEFN Release Checklist + Economy Sheet`，给小型 UEFN 团队做发布前数值/素材/权限检查。

---

## 2. 小注试验

### 2.1 Etsy / POD / KDP 卖家运营小工具

**用户/痛点**：Etsy、Print-on-Demand、KDP 卖家需要选品、利润计算、listing QA、图片尺寸、关键词覆盖、库存/变体表。

**代表信号**：

- EverBee Chrome Web Store 页面称其服务 600,000+ entrepreneurs and top Etsy sellers；
- EverBee 产品页强调在 Etsy 内揭示 sales、revenue 等 metrics。

证据等级：C。用户和定位是产品页口径；revenue / MRR / ARR / net profit 未披露。

**运行时 AI 成本**：零或 BYOK。优先做利润表、listing checklist、图片/尺寸检查。

**1-2 周 MVP**：可行。Chrome extension 或 Google Sheets 模板 + 插件。

**主要风险**：平台爬取限制；卖家工具很多；“选爆品”容易变成投机红海；第三方销售估算不一定准确。

**可落地点子**：`Etsy Profit Guard`，listing 旁边显示材料、运费、广告、平台费后的真实净利。

---

### 2.2 Zotero / 学术文献工作流插件

**用户/痛点**：研究生、医生、咨询顾问做系统综述、文献卡片、引用去重、PDF 标注同步、PRISMA 流程记录。

**代表信号**：

- Covidence 官方定价页面显示其支持 Zotero、EndNote、RefWorks、Mendeley 等 workflow；
- Rayyan / Covidence 等说明系统综述工作流存在付费软件需求；
- Zotero 插件生态活跃，但单插件收入通常不公开。

证据等级：B/C。市场/产品信号存在；单插件 revenue / MRR / ARR 未披露；net profit 未披露。

**运行时 AI 成本**：零到 BYOK。摘要/筛选可让用户填 Gemini/OpenAI key。

**1-2 周 MVP**：可行。Zotero 插件或独立 PDF/CSV 工具。

**主要风险**：学术用户付费弱；高校采购慢；AI 摘要准确性风险。

**可落地点子**：`PRISMA Helper for Zotero`，本地记录 inclusion/exclusion reason，导出 PRISMA 表和审稿追踪。

---

### 2.3 Home Assistant 家庭本地化“成品层”

**用户/痛点**：智能家居玩家会搭 Home Assistant，但非技术家庭成员需要更稳定的 dashboard、备份恢复、权限隔离、设备说明卡。

**代表信号**：

- Home Assistant Cloud 是 Nabu Casa 提供的可选订阅服务；
- Home Assistant / Nabu Casa 生态体现出本地、隐私、离线和付费支持并存；
- 第三方 add-on 直接收入通常不公开。

证据等级：A/C。生态和订阅路径清晰；第三方插件 revenue / net profit 未披露。

**运行时 AI 成本**：零。

**1-2 周 MVP**：中等可行。做 add-on 或外部配置打包器。

**主要风险**：开源文化付费弱；支持成本高；不同家庭设备差异大。

**可落地点子**：`HA Family Dashboard Kit`，把老人/孩子/访客视角的卡片和备份恢复流程产品化。

---

### 2.4 家庭照护 / Eldercare Admin 工具

**用户/痛点**：成年子女照护老人，需要用药、预约、保险文件、护理交接、紧急联系人、费用分摊。

**代表信号**：

- AARP / National Alliance for Caregiving 2025 报告显示，美国 63M adults 为成人或有复杂健康状况/残疾的儿童提供照护，约 1 in 4 adults；
- 家庭照护已从情绪问题变成复杂行政/文件/协作问题。

证据等级：B。市场/人群信号强；具体软件收入未披露。

**运行时 AI 成本**：零。文档整理可选端侧 OCR。

**1-2 周 MVP**：可行。先做“家庭照护 binder + 分享链接 + PDF 导出”。

**主要风险**：隐私/医疗数据敏感；用户信任和获客难；不能做医疗建议。

**可落地点子**：`Care Binder`，本地优先的老人照护文件夹，输出急诊信息卡和交接 PDF。

---

### 2.5 小额法律/政务表单自动化

**用户/痛点**：小额诉讼、租房押金、简单移民/签证 checklist、地方许可申请，用户痛点是“表格多、规则死、怕填错”。

**代表信号**：

- USCIS 官方支持在线填表、在线付费和案件追踪；
- 美国州法院、地方政府、移民服务存在大量公开表单和 checklist；
- DIY legal forms 有需求，但法律服务边界敏感。

证据等级：A/C。公共表单需求真实；产品收入未披露。

**运行时 AI 成本**：零，规则 + PDF 填充。

**1-2 周 MVP**：只做一个州/一个表单类型可行。

**主要风险**：Unauthorized practice of law；规则更新；客服压力。

**可落地点子**：`Deposit Demand Letter + Small Claims Packet`，只做某州租客押金追回材料包，明确非法律意见。

---

### 2.6 本地活动 / 社群售票的运营侧工具

**用户/痛点**：小型 meetup、工作坊、线下课、独立展会需要签到、候补、志愿者排班、摊位地图、收据和邮件，而不是完整 Eventbrite 替代。

**代表信号**：

- Partiful 被 Time 评为 2025 年 100 Most Influential Companies 之一，说明轻量活动组织工具仍受关注；
- Luma、Partiful、Eventbrite 主平台已强，机会在运营补丁。

证据等级：B/C。平台热度强；单个运营工具收入未披露。

**运行时 AI 成本**：零。

**1-2 周 MVP**：可行。做 CSV 导入 + QR 签到 + 候补通知。

**主要风险**：支付、退款、欺诈如果自己做会变重；活动主办者付费不稳定。

**可落地点子**：`Tiny Check-in Ops`，给 Luma / Partiful / Eventbrite 导出的名单做离线签到和志愿者任务板。

---

## 3. 暂不建议主押，但可观察

### 3.1 Apple Shortcuts / Action Button 付费模板包

- **痛点**：iPhone power user 想要自动化模板，但不会自己写 Shortcuts。
- **证据**：RoutineHub 等社区存在，但独立 paid shortcuts 的收入信号弱。
- **AI 成本**：零。
- **问题**：可复制性极强、用户付费意愿低、系统更新易打断。
- **判断**：适合作为内容/流量品，不适合作为核心产品线。

### 3.2 通用 Webflow / Framer App

- **痛点**：无代码站点运营者需要 CMS、SEO、表单、迁移、翻译、备份。
- **证据**：Webflow Apps / Marketplace 有官方分发入口。
- **AI 成本**：可为零。
- **问题**：SEO / 表单 / 翻译大词被成熟工具占据；平台内购买心智不强。
- **判断**：别做通用 SEO app，做“Webflow 客户交付前 QA checklist”这类窄补丁。

### 3.3 通用 AI Canva / Figma / Shopify 生成器

- **痛点**：看似所有人都想一键生成图、文案、listing。
- **问题**：平台原生 AI 能力越来越强，第三方 wrapper 缺少差异化。
- **AI 成本**：高，除非 BYOK。
- **判断**：不建议做“生成器”，建议转成确定性 QA / 导出 / 合规 / 批处理。

---

## 4. 横向优先级矩阵

| 层级 | 场景簇 | 证据强度 | 收入质量 | AI 成本 | 1-2 周 MVP | 分发入口 | 主要风险 | 结论 |
|---|---:|---:|---|---|---|---|---|---|
| 深挖 | Canva Apps 批量工作流 | A | 平台分成，单品未披露 | 零/低 | 高 | Canva marketplace | 变现不透明 | 新 surface，值得 |
| 深挖 | Figma 设计 QA 插件 | A/C | 单品未披露 | 零 | 高 | Figma Community | 付费转化 | 工程师优势明显 |
| 深挖 | Shopify 垂直微 app | A | gross revenue 规则清晰，利润未披露 | 零 | 中 | Shopify App Store | 审核/客服 | B2B 付费更好 |
| 深挖 | Accessibility 报告工具 | B/C | 定价可见，收入未披露 | 零 | 高 | Chrome/SEO/agency | 法务承诺 | 可做小而贵 |
| 深挖 | Prompt/Agent 回归测试 BYOK | A/C | 企业版潜力，收入未披露 | BYOK | 高 | GitHub/HN/LLM 社区 | 红海 | 适合工程背景 |
| 深挖 | Roblox/UEFN 创作者工具 | A/B | 平台经济强，工具收入未披露 | 零 | 中 | 创作者社区 | 平台/未成年合规 | 新窗口可观察 |
| 小注 | Etsy/POD/KDP 卖家工具 | C | 收入未披露 | 零/低 | 高 | Chrome/SEO/卖家社区 | 红海/平台限制 | 做利润/QA 切口 |
| 小注 | Zotero/系统综述插件 | B/C | 付费弱，收入未披露 | 零/BYOK | 高 | 学术社区 | 采购慢 | 专业但小 |
| 小注 | Home Assistant 成品层 | A/C | 第三方收入未披露 | 零 | 中 | HA 社区 | 开源付费弱 | 适合爱好者先验 |
| 小注 | 家庭照护 admin | B | 收入未披露 | 零 | 高 | SEO/照护社区 | 信任/隐私 | 痛点强但获客慢 |
| 小注 | 小额法律/政务表单 | A/C | 单次付费可能，利润未披露 | 零 | 中 | SEO/地方关键词 | 法律风险 | 只做窄州窄表单 |
| 小注 | 活动签到运营补丁 | B/C | 收入未披露 | 零 | 高 | Luma/Partiful 周边 | 支付/低频 | 别做完整平台 |
| 不主押 | Apple Shortcuts 包 | C/D | 弱收入 | 零 | 很高 | RoutineHub/内容 | 低付费/易复制 | 当流量品 |
| 不主押 | 通用 Webflow/Framer App | A | 收入未披露 | 零 | 中 | Marketplace | 大词拥挤 | 只做交付 QA |
| 不主押 | 通用 AI 生成器 | C/D | revenue 不稳，profit 低 | 高 | 高 | 各平台 | 原生 AI 吞噬 | 避免 |

---

## 5. 广度收口

第一梯队新增机会：

1. **Figma / Canva / Shopify 的工作流 QA 插件**：不是生成内容，而是检查、导出、合规、批处理。
2. **Prompt / Agent 回归测试 BYOK 工具**：模型成本由用户承担，产品卖流程和测试模板。
3. **Roblox / UEFN 创作者工具**：不做游戏，做创作者经济里的运营、数值、发布、素材管理。
4. **Accessibility client report 工具**：用确定性规则给小 agency 提供可交付报告。

第二梯队小注：

- Etsy/POD/KDP 利润和 listing QA；
- Zotero 系统综述工作流；
- Home Assistant 家庭成品层；
- Eldercare admin；
- 小额法律/政务表单；
- 活动运营补丁。

避免主押：

- 纯 Shortcuts 模板包；
- 通用 Webflow / Framer App；
- 通用 AI 生成器。

---

# Sources

- Canva monetizing apps: https://www.canva.dev/docs/apps/monetization/
- Canva Premium Apps Program: https://www.canva.dev/docs/apps/premium-apps/
- Figma paid Community resources: https://help.figma.com/hc/en-us/articles/12067637274519-About-selling-Community-resources
- Figma plugin runtime docs: https://developers.figma.com/docs/plugins/how-plugins-run/
- Shopify App Store revenue share: https://shopify.dev/apps/launch/distribution/revenue-share
- Shopify Partner earnings: https://help.shopify.com/en/partners/how-to-earn
- promptfoo pricing: https://www.promptfoo.dev/pricing/
- promptfoo docs intro: https://www.promptfoo.dev/docs/intro/
- Roblox 2025 Economic Impact Report: https://corp.roblox.com/newsroom/2025/09/roblox-annual-economic-impact-report
- Roblox Creator Hub earning docs: https://create.roblox.com/docs/production/earning-on-roblox
- Fortnite platform and economy: https://www.fortnite.com/developer/platform-and-economy
- EverBee Chrome Web Store: https://chromewebstore.google.com/detail/everbee-find-best-selling/oeicpkgdngoghobnbjngekclpcmpgpij
- EverBee install page: https://everbee.io/install/
- Covidence pricing: https://www.covidence.org/pricing/
- Home Assistant Cloud: https://www.home-assistant.io/cloud/
- Nabu Casa subscription FAQ: https://support.nabucasa.com/hc/en-us/articles/26179725282461-Do-you-offer-a-lifetime-subscription-or-a-one-time-fee
- AARP caregiving 2025 release: https://www.aarp.org/press/releases/2025-07-24-new-report-reveals-crisis-point-for-americas-63-million-family-caregivers.html
- Caregiving in the US 2025: https://www.caregiving.org/research/caregiving-in-the-us/
- USCIS file online: https://www.uscis.gov/file-online
- USCIS forms: https://www.uscis.gov/forms/forms
- Partiful company profile: https://en.wikipedia.org/wiki/Partiful
- Webflow Apps marketplace: https://webflow.com/apps
- Webflow developer docs: https://developers.webflow.com/
