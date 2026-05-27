# Vibe Coding 全球个人/小团队产品调研（Codex 核验版）

调研时间：2026-05-27  
重点口径：2025-12 至 2026-05 的最新公开收入/交易/增长证据。  
对照说明：本文件不覆盖原 `vibe-coding-research-2026-05.md` 的全部叙述，而是对其中可核验部分做二次核查、补充和机会判断。

## 0. 结论先行

1. 现有 Claude 版文档覆盖面很广，但有一个关键时间错误：`vibe coding` 一词由 Andrej Karpathy 在 2025-02-02 的 X 帖提出，不是 2026-02-02。后续资料、Know Your Meme、Wikipedia 与多家媒体都指向 2025 年。
2. 公开资料里能验证的多数是 `revenue / MRR / ARR`，不是净利润。报告中除非来源明确写了 profit margin，否则都按收入处理。
3. 过去半年最有代表性的盈利小产品，集中在四类：消费移动订阅、营销/增长工具、短视频/内容生产工具、卖给开发者/创业者的工具与课程。
4. 最高的风险调整机会，不是再做通用 AI wrapper，而是做“具体人群 + 具体渠道/工作流 + 能直接带来收入或节省成本”的小型 SaaS。
5. 如果个人开发者没有现成大流量，最值得做的是垂直 B2B workflow 或营销/分发工具；如果有达人/短视频投放能力，消费移动订阅上限更高但波动和合规风险也更高。

## 1. 数据可信度分级

| 等级 | 证据类型 | 本报告使用方式 |
|---|---|---|
| A | 支付处理器/API 验证、公司公告、并购公告 | 可作为核心收入证据 |
| B | TechCrunch / Fortune / Latka / Indie Hackers 访谈等较强二手来源 | 可作为核心案例，但标明是访谈或媒体口径 |
| C | 平台客户故事、创始人自报、X/Reddit 自述 | 作为趋势和线索，不单独作为强结论 |
| D | 匿名截图、自媒体搬运、无法找到原始产品/地址 | 不进入核心矩阵，最多放入风险备注 |

## 2. 核心产品矩阵

### 2.1 消费移动订阅：健康、戒断、习惯、简单情绪价值

| 产品 | 地址 | 场景 | 团队/背景 | 近半年收入/交易状态 | 盈利模式与利润口径 | 可信度与来源 |
|---|---|---|---|---|---|---|
| Cal AI | https://calai.app | 拍照识别食物、卡路里记录 | Zach Yadegari、Henry Langmack 起步，后来小团队 | 2026-03 被 MyFitnessPal 收购；TechCrunch 报道称已做到 15M+ 下载与 $30M+ 年收入，2026-04 TechCrunch 另文提到创始人披露 $50M ARR | 订阅/IAP/曾测试外部支付；净利润未披露，明显有投放、达人、App Store 成本 | B：TechCrunch / Yahoo 转载 TechCrunch；2026-04 App Store 下架事件也由 TechCrunch 报道 |
| STOPPR | https://stoppr.app | 戒糖/减少 processed sugar cravings | David Attias，Cursor + Figma + Claude + Firebase 构建 | 2026-05 Indie Hackers 报道小 App portfolio $10K/月；文中又称当前总月收入 $15K，其中约 70% 来自 App | 订阅；创始人提到曾在 $14K 月收入附近只有约 20% profit margin，主要被达人运营吞噬 | B：Indie Hackers 2026-05-22 |
| QUITTR | https://quitttr.com | 戒色情/成瘾管理 | Alex Slater 等 | $50K/月有 Starter Story 较早资料；$200K/月在多个访谈/转述中出现，但直接可核验证据较弱 | 订阅、强 paywall、达人/UGC 增长；净利润不明 | C：Starter Story/社区转述；作为消费 App 高上限线索，不作为强收入结论 |

**判断：**消费 App 的收入上限最高，Cal AI 是过去半年最强样本。但它更像“产品 + UGC/达人投放 + App Store 运营 + paywall 实验”的增长机器，不是单纯 vibe coding。没有增长能力的人直接冲这个赛道，失败概率很高。

### 2.2 营销/增长/分发工具：目前最强的 indie B2B 赚钱带

| 产品 | 地址 | 场景 | 团队/背景 | 近半年收入状态 | 盈利模式 | 可信度与来源 |
|---|---|---|---|---|---|---|
| Kleo | https://kleo.so | LinkedIn 内容创作与增长 | Cameron Trew + Jake Ward/Lara Acosta/Rob Hoffman；AI coding 加速 | 2025-12 Indie Hackers：3 个月到 $62K MRR | 订阅，beta $59/$79，标准 $99/月，企业计划 | B：Indie Hackers 2025-12-31 |
| Mentions | https://mentions.so | 品牌在 ChatGPT/Perplexity 等 AI 回答中的出现监控 | Kleo 同团队 | 2025-12 Indie Hackers：$20K MRR | 订阅 | B：Indie Hackers 2025-12-31 |
| Leadmore AI | https://leadmore.ai | Reddit 营销/线索发现/自动化 | Richard Wang，独立创始人 | 2025-12 Indie Hackers：>$30K MRR | credit-based，购买 credits 用于发帖、评论、发现 subreddit 等动作 | B：Indie Hackers 2025-12-18 |
| DataFast | https://datafa.st | revenue-first analytics，帮创业者看渠道带来的收入 | Marc Lou，solo/portfolio | TrustMRR 2026-05-27：$20,372 last 30 days，$22,768 MRR，$185,347 all-time，1174 active subscriptions | 订阅；净利润未披露，软件毛利预计高但不等同净利 | A：TrustMRR Stripe API verified |
| TrustMRR | https://trustmrr.com | 收入验证数据库/创业项目市场 | Marc Lou | TrustMRR 2026-05-27：$26,552 last 30 days，$13,339 MRR，$194,737 all-time | 订阅/市场/验证服务；净利润未披露 | A：TrustMRR Stripe API verified |

**判断：**这是最适合个人开发者的核心带之一。共性不是“用了 AI”，而是客户能把产品直接映射到收入：多一个 lead、多一次曝光、多知道一个渠道 ROI，就值得付费。

### 2.3 短视频、设计、内容生产：需求强，但同质化和成本压力明显

| 产品 | 地址 | 场景 | 团队/背景 | 近半年收入状态 | 盈利模式 | 可信度与来源 |
|---|---|---|---|---|---|---|
| StoryShort | https://storyshort.ai | 文本生成 faceless TikTok/YouTube Shorts | Samuel Rondot | TrustMRR 2026-05：$24.7K last 30 days，$24.1K MRR，$479K all-time，420 active subscriptions | $39-$199/月订阅；视频生成 API 成本存在，净利未披露 | A：TrustMRR Stripe API verified |
| Submagic | https://submagic.co | AI 短视频字幕、剪辑、Magic Clips | David Zitoun 等，小团队 | Latka 2026 报道：2025 年已到约 $8M revenue/ARR，约 13 人、2.5K customers | 订阅 + affiliates；10K+ affiliates 被报道贡献约 20% ARR | B：Latka / Superframeworks 案例 |
| Sleek.design | https://sleek.design | AI mobile app design，“vibe design” | Mattia Pomelli + 两位朋友 | 2026-01 Indie Hackers：6 周/2 个月内到 $10K MRR | 订阅 + AI credits；免费额度极小以控制成本 | B：Indie Hackers 2026-01-13 |
| Magnific / Freepik | https://www.magnific.ai | AI 图像/视频/创意平台 | Magnific 起初是小团队 AI upscaler，2024 被 Freepik 收购 | Freepik 2026-04 rebrand 为 Magnific，官方 PR 称 $230M ARR；这是母公司平台收入，不是原两人产品收入 | 订阅/企业；净利润未披露 | A：PRNewswire/Fortune 对 rebrand 与 ARR 的报道；作为边界案例 |

**判断：**内容生产工具非常适合 demo 和短视频传播，能快速获得用户。但模型能力和 UI 模板都在快速商品化，防御力主要来自垂直场景、分发渠道、素材/模板资产和工作流闭环。

### 2.4 卖给开发者/创业者的“铲子”：高毛利，但强依赖个人品牌/信任

| 产品 | 地址 | 场景 | 团队/背景 | 近半年收入状态 | 盈利模式 | 可信度与来源 |
|---|---|---|---|---|---|---|
| ShipFast | https://shipfa.st | Next.js SaaS boilerplate | Marc Lou | TrustMRR 2026-05-27：$7,622 last 30 days，$1.258M all-time，无 active subscriptions；2026-01/02 曾显著更高 | 一次性 license，$199-$299 | A：TrustMRR Stripe API verified |
| CodeFast | https://codefa.st | 面向创业者的快速编程课程 | Marc Lou | TrustMRR 2026-05：$8,528 last 30 days，$801K all-time，无 active subscriptions | 一次性课程/Bundle | A：TrustMRR Stripe API verified |
| Papermark | https://www.papermark.com | 开源 DocSend 替代，资料分享和 deal room | Marc Seitz + Iulia | 2026-05 Reddit AMA 自报 $2M ARR、8.2K GitHub stars、$17B+ deal flow | SaaS 订阅/团队/企业；净利润未披露 | C/B：创始人 AMA，自报但可与产品/GitHub热度交叉看 |
| CodeRabbit | https://www.coderabbit.ai | AI code review，解决 AI 生成代码带来的 review 瓶颈 | Harjot Gill 等，已 VC 化 | TechCrunch 2025-09：>$15M ARR，月增约 20%，$60M Series B，估值 $550M，8000+ customers | $30/月起的订阅/团队/企业 | B：TechCrunch；不是 indie，但说明“AI 代码质量治理”需求真实 |
| Base44 | https://base44.com | 自然语言生成全栈应用/AI app builder | Maor Shlomo 起步，出售时约 8 人 | Wix 官方 2025-06 公告：初始对价约 $80M；Baron/Wix 资料提到收购时 few million ARR / $3.5M ARR 级别 | 订阅/usage；并购后归 Wix | A：Wix/Nasdaq 并购公告；ARR 用 B 级资料 |

**判断：**卖铲子是高毛利路径，但最吃信任和分发。没有技术/内容影响力时，不建议做第 N 个 boilerplate；更建议做某个明确工具链中的“痛点插件”。

### 2.5 AI 图像/头像/headshot：已经被证明能赚钱，但 2026 进入高竞争成熟期

| 产品 | 地址 | 场景 | 团队/背景 | 近半年收入状态 | 盈利模式 | 可信度与来源 |
|---|---|---|---|---|---|---|
| PhotoAI | https://photoai.com | AI photoshoot/AI 自拍 | Pieter Levels，solo | 2025-11 附近多处资料汇总约 $132K-$138K MRR；2026 未见强一手新数 | 订阅；二手案例称 API/infra 后利润率高，但需谨慎 | B/C：Indie Hackers/PPC Land/公开 build-in-public 汇总 |
| HeadshotPro | https://www.headshotpro.com | AI 职业头像 | Danny Postma，solo 起步 | Starter Story 等资料长期引用 $300K/月；近半年未见强支付验证 | 一次性/套餐，约 $29-$59 起；SEO/affiliate | B/C：Starter Story/二手案例；作为历史标杆 |
| FormulaBot | https://www.formulabot.com | Excel/Sheets 公式与数据分析 AI | David Bressler，no-code/solo 起步 | 2026 二手资料称 $226K MRR、750K+ users；历史更保守口径约 $30K-$40K MRR | Freemium + subscription | C：新数来源较弱；作为“办公场景 AI wrapper 长尾仍能赚钱”的线索 |

**判断：**头像、照片、公式、PDF 这类“第一代 AI wrapper”还有存量收入，但新进入者很难靠通用功能突围。除非有垂直渠道，例如 realtor 图片、招聘头像、医生诊所表格、律师文档，否则投入产出比下降。

### 2.6 Lovable/Bolt 等平台客户故事：有启发，但要降权

| 产品 | 地址 | 场景 | 公开收入 | 可信度与备注 |
|---|---|---|---|---|
| Lumoo | https://air.lumoo.ai | fashion/retail AI content workflow | Lovable 官方客户故事：9 个月 €700K ARR、15+ 品牌 | C：平台客户故事，具体到客户和 ARR，值得参考但非独立支付验证 |
| Plinq | https://plinq.app | 安全/服务类 app，非技术创始人案例 | Lovable 官方/传播资料：R$2.2M ARR 级别 | C：平台营销口径，需独立核验后再重仓参考 |

**判断：**这些案例说明非工程背景的人也能用 AI 做出可卖产品，但平台博客天然有 marketing bias。更值得学习的是“创始人有行业入口/客户入口”，而不是“用了 Lovable 所以赚钱”。

## 3. 场景聚类和机会评分

评分权重：

- 需求强度/付费痛感：25%
- 变现清晰度：20%
- 分发可获得性：20%
- 个人开发可交付性：15%
- 留存/防御力：10%
- 风险与成本：10%，这里分数越高代表风险越低

| 场景 | 代表案例 | 需求 | 变现 | 分发 | 可交付 | 留存 | 风险低 | 加权分 | 结论 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 垂直 B2B workflow / 行业运营工具 | Lumoo、Papermark、Base44 的 app-builder 需求侧 | 5 | 5 | 3 | 4 | 4 | 4 | 4.35 | 最稳，适合有行业入口的人 |
| 营销/增长/分发工具 | Kleo、Mentions、Leadmore、DataFast | 5 | 5 | 4 | 4 | 3 | 3 | 4.20 | 最适合 solo 快速验证，但平台政策风险高 |
| 短视频/内容生产工具 | StoryShort、Submagic、Sleek、Magnific | 5 | 4 | 4 | 4 | 3 | 3 | 4.05 | Demo 传播强，需垂直化避免同质化 |
| 消费移动订阅健康/习惯 | Cal AI、STOPPR、QUITTR | 5 | 5 | 3 | 3 | 3 | 2 | 3.85 | 上限最高，但增长/合规/退款风险最大 |
| 卖给开发者/创业者的工具/课程 | ShipFast、CodeFast、TrustMRR、CodeRabbit | 4 | 4 | 3 | 4 | 3 | 4 | 3.65 | 高毛利，但强吃个人品牌 |
| AI 图像/头像/通用办公 wrapper | PhotoAI、HeadshotPro、FormulaBot | 4 | 4 | 2 | 4 | 2 | 3 | 3.25 | 历史证明有效，新项目需更垂直 |
| 游戏/纯娱乐/viral novelty | Fly Pieter、Game Jam 类 | 3 | 3 | 3 | 4 | 1 | 3 | 2.85 | 可做练手和流量实验，不适合作主赛道 |

## 4. 我认为现阶段最值得个人开发者做什么

### 首选：垂直 B2B 的“收入/运营工作流助手”

不是泛泛的“AI agent”，而是一个非常窄的 workflow：

- 一个清楚 ICP：例如 B2B SaaS founder、LinkedIn ghostwriter、DTC performance marketer、本地诊所、移民律师、房产经纪、招聘顾问。
- 一个明确高频任务：找高意向线索、生成报价/报告、处理客户材料、回复评价、整理销售跟进、生成合规内容、做 LLM/SEO/GEO 可见性监控。
- 一个可量化结果：多拿 lead、缩短交付、少花人力、减少漏单、提高转化。

为什么它值得做：

1. AI coding 能把 MVP 成本降到极低，但真正门槛变成 domain insight 和分发。
2. B2B 愿意为省钱/赚钱付 $99-$499/月，个人开发者不需要百万用户。
3. 比消费 App 更少依赖付费广告和 App Store 规则。
4. 比通用 AI wrapper 更容易做差异化，因为每个行业的输入、术语、审批、模板、数据源都不同。

### 第二选择：渠道型增长工具，尤其是 Reddit/LinkedIn/forum/GEO

可落地形态：

> 面向 AI/SaaS 小团队的“高意图机会雷达”：监控 Reddit、HN、LinkedIn、行业论坛和 AI 搜索结果，发现正在表达购买意图的问题；结合客户网站/文档生成合规、像人的回复；自动打 UTM/Stripe 归因，显示每条内容带来的 trial、付费和 MRR。

这是 Leadmore、Kleo、Mentions、DataFast 的交集。它的优势是 dogfood：你自己获客时就能用它。风险是平台反垃圾、账号安全和“AI 垃圾回复”会伤害品牌，所以产品要强调 review-first、human-in-the-loop、合规和归因，而不是全自动刷屏。

### 第三选择：垂直短视频生产，不做通用生成器

不要做“输入一句话生成任意短视频”。可以做：

- 房产经纪 listing video
- DTC 商品广告批量变体
- 本地商家 Google/TikTok/Reels 素材
- 在线课程讲师切片
- B2B SaaS demo clip factory

StoryShort 和 Submagic 证明内容生产愿意付费，但通用视频生成很快卷到模型价格战。个人开发者要把素材来源、模板、发布、测试、归因打通。

## 5. 不建议优先做的方向

1. 通用 PDF/chatbot/meeting notes：已经高度拥挤，除非有独占数据或垂直场景。
2. 第 N 个 AI headshot / avatar：历史成功很强，但新项目获客成本和 SEO 难度都上来了。
3. 通用 app builder / Lovable clone：平台级竞争，安全和基础设施复杂，不适合个人从零硬碰。
4. 只靠 Reddit/X 截图的“我 vibe coded 到 $10K MRR”：匿名收入截图污染很严重，不能当投资依据。
5. 面向“所有创业者”的大而全工具：Marc Lou 的成功背后是多年 build-in-public 信任，不是 boilerplate 本身天然赚钱。

## 6. 机会落地建议

如果你要从现在开始做，我会建议这样筛：

1. 先选你能连续接触 20 个真实用户的行业，不选你只能凭热搜想象的行业。
2. 只做一个会被反复使用的核心动作，别第一版就做 agent platform。
3. 第一版收费不要低于 $49/月；低于这个价格，B2B 支持成本很容易吃掉你。
4. 验证标准：两周内拿到 5 个愿意付费试用的人，比做出完整产品更重要。
5. 技术上优先用现成 API、Supabase/Neon、Stripe、Clerk、Vercel/Cloudflare，不要把时间花在基础设施英雄主义上。
6. 所有 AI 输出默认 human-in-the-loop，尤其是营销、医疗、金融、法律和平台互动类场景。

## 7. 主要来源

- Karpathy/vibe coding 起源：
  - https://knowyourmeme.com/memes/vibe-coding
  - https://en.wikipedia.org/wiki/Vibe_coding
  - https://www.tomsguide.com/ai/vibe-coding
- Cal AI：
  - https://techcrunch.com/2026/04/21/apples-cal-ai-crackdown-signals-its-still-policing-the-app-store/
  - https://finance.yahoo.com/news/myfitnesspal-acquired-cal-ai-viral-140000003.html
- Base44：
  - https://www.nasdaq.com/press-release/wix-further-expands-vibe-coding-acquisition-base44-hyper-growth-startup-simplifies
  - https://techcrunch.com/2025/06/18/six-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/
- Marc Lou / DataFast / ShipFast / CodeFast / TrustMRR：
  - https://trustmrr.com/founder/marclou
  - https://trustmrr.com/startup/datafast
  - https://trustmrr.com/startup/trustmrr
  - https://trustmrr.com/startup/shipfast
  - https://trustmrr.com/startup/codefast
- StoryShort：
  - https://trustmrr.com/startup/storyshort
  - https://trustmrr.com/founder/samuelrdt
- Kleo / Mentions：
  - https://www.indiehackers.com/post/tech/from-0-to-62k-mrr-in-three-months-mUPVSYOlJAC2iogGK7d4
- Leadmore AI：
  - https://www.indiehackers.com/post/tech/hitting-30k-mrr-with-an-ai-marketing-product-n59ORJCYjnZC61Q096UL
- Sleek.design：
  - https://www.indiehackers.com/post/tech/hitting-10k-mrr-in-six-weeks-with-an-ai-design-tool-pEvmU5qkWS6ny0AR9SUv
- STOPPR：
  - https://www.indiehackers.com/post/tech/from-zero-to-10k-mo-app-portfolio-in-a-year-71h2PPGYn1VnPOkj9qi6
- Submagic：
  - https://getlatka.com/companies/submagic.co
  - https://getlatka.com/blog/submagic-revenue-bootstrap-ceo/
- Magnific/Freepik：
  - https://www.prnewswire.com/news-releases/freepik-becomes-magnific-hits-230m-arr-and-introduces-the-no-collar-creative-economy-302755376.html
  - https://fortune.com/2026/04/28/freepik-magnific-joaquin-cuenca-abela-230-million-arr-video-generation-ai-pivot/
- CodeRabbit：
  - https://techcrunch.com/2025/09/16/coderabbit-raises-60m-valuing-the-2-year-old-ai-code-review-startup-at-550m/
- Lumoo / Plinq：
  - https://lovable.dev/blog/customer-stories/lumoo-ai-fashion-platform
  - https://lovable.dev/blog/how-sabrine-matos-built-plinq
- PhotoAI / HeadshotPro / FormulaBot：
  - https://www.indiehackers.com/post/photo-ai-by-pieter-levels-complete-deep-dive-case-study-0-to-132k-mrr-in-18-months-3a9a2b1579
  - https://www.starterstory.com/stories/headshotpro-breakdown
  - https://stormy.ai/blog/building-million-dollar-no-code-micro-saas
