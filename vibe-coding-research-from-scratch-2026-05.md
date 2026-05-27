# Vibe Coding 个人/小团队产品调研（从零研究版）

调研时间：2026-05-27  
口径：不沿用既有 Claude 报告的候选清单；仅借用“背景-产品矩阵-场景聚类-盈利模式-机会判断”的结构。产品和数据来自本轮重新检索的公开来源。  
注意：公开资料多数披露的是 revenue / MRR / ARR，不是净利润。除非来源明确写 profit margin，本报告一律按收入处理。

## 1. 研究口径与可信度

我把证据分成四档：

| 等级 | 证据 | 使用方式 |
|---|---|---|
| A | Stripe/API 验证、并购公告、公司官方披露 | 核心数据，可参与评分 |
| B | TechCrunch、Indie Hackers、Sina/中新经纬、Latka 等媒体/访谈 | 可参与判断，但注明是访谈或媒体口径 |
| C | 平台客户故事、创始人自报、产品官网战报 | 作为趋势与线索，收入降权 |
| D | 匿名截图、Reddit 传闻、二手自媒体搬运 | 不作为核心收入依据 |

## 2. 独立搜集到的代表产品矩阵

### 2.1 消费移动订阅 / 健康习惯类

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| Cal AI | https://calai.app | 拍照识别食物、卡路里记录 | 两位高中生起步，收购时团队约 7 人 | TechCrunch 2026-03 报道：15M+ 下载、$30M+ annual revenue；2026-04 报道提到创始人披露 $50M ARR；2026-03 被 MyFitnessPal 收购 | App 订阅/IAP/曾尝试外部支付 | B |
| STOPPR | https://stoppr.app | 戒糖/减少 processed sugar cravings | David Attias，一人/小团队，Cursor + Figma + Claude + Firebase | Indie Hackers 2026-05：小 App portfolio $10K/月；创始人称当前总收入 $15K/月，约 70% 来自 App；曾在 $14K 月收入附近只有 20% profit margin | App 订阅 + influencer 增长 | B |
| 小猫补光灯 / Luma | App Store: https://apps.apple.com/cn/app/id6738938927 | 自拍补光灯/氛围灯 | 陈云飞，无编程经验，用 AI 工具快速开发 | 中新经纬/新浪 2026-05：两款应用各 30-50 万下载；Pro 版定价 1 元，累计收入约三四十万元 | 一次性低价付费 App | B |

结论：这类收入天花板最高，但它不是“代码快”就能赢，核心是 App Store 转化、短视频/达人、paywall、退款控制。STOPPR 的 20% 利润率口径尤其说明：消费 App 的 revenue 很漂亮，cashflow 未必舒服。

### 2.2 营销、获客、销售增长工具

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| Kleo | https://kleo.so | LinkedIn 内容增长/创作 | Cameron Trew 与小团队；早期有 60K 免费用户基础 | Indie Hackers 2025-12：Kleo $62K MRR，三个月达成 | 订阅，面向 LinkedIn 创作者/团队 | B |
| Mentions | https://mentions.so | 监控品牌在 ChatGPT/Perplexity 等 AI 回答里的出现 | Kleo 同团队 | Indie Hackers 2025-12：$20K MRR | 订阅 | B |
| Leadmore AI | https://leadmore.ai | Reddit 营销、线索发现、发帖/评论工作流 | Richard Wang，独立创始人 | Indie Hackers 2025-12：>$30K MRR | credit-based，用 credit 执行帖子、评论、发现 subreddit 等动作 | B |
| DataFast | https://datafa.st | Revenue-first analytics，渠道收入归因 | Marc Lou，solo/portfolio | TrustMRR 2026-05-27：$20,372 last 30 days；$22,768 MRR；$185,347 all-time；1174 active subscriptions；Stripe verified | SaaS 订阅 | A |
| TrustMRR | https://trustmrr.com | 创业收入验证数据库/项目市场 | Marc Lou | TrustMRR 2026-05-27：$26,552 last 30 days；$13,339 MRR；$194,737 all-time；Stripe verified | 订阅 + marketplace/distribution | A |
| PROSP | https://www.prosp.ai | AI LinkedIn outbound / 销售外联 | Yann / Prosp.ai | TrustMRR leaderboard 2026-05：约 $128K MRR；页面标注 FOR SALE | 订阅/服务化外联工具 | A |

结论：这是当前最强的个人/小团队赚钱带。共同点是“客户能直接算 ROI”：多拿 lead、多转化客户、多知道哪个渠道带来收入。

### 2.3 AI SEO / AEO / GEO / LLM 可见性

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| SEOBOT | https://seobotai.com | AI SEO agent，自动关键词、内容、pSEO、小工具 | John Rush | TrustMRR 2026-05 leaderboard：约 $61K MRR；官网称订阅从 $49/月起 | SaaS 订阅 | A |
| SEO STACK | TrustMRR: https://trustmrr.com/startup/seo-stack | SEO/PPC 数据仓库 + AI + LLM visibility tracking | Daniel Foley Carter | TrustMRR：$16,850 last 30 days；估算 $60K+ MRR；510 active subscriptions；Stripe verified | $69.99-$489.99/月订阅 | A |
| AEO Engine | https://aeoengine.ai | Answer Engine Optimization，帮品牌出现在 ChatGPT/Perplexity/Google AI Overviews | Vijay C. Jacob | TrustMRR：$82,838 last 30 days；估算 $55,688 MRR；30 active subscriptions；Stripe verified | 高客单价订阅/服务化交付，$797-$2,997/月起 | A |
| LocalRank | https://localrank.so | Local SEO + AI recommendation monitor | Jacky Chou 相关资产 | TrustMRR leaderboard：约 $47K MRR；官网显示 $57/$297/$497/$2997 月费层级 | 本地商家/代理商订阅 | A/C |
| Launch Club | TrustMRR leaderboard | Reddit marketing to improve AI search | Ken Savage | TrustMRR leaderboard：约 $46K MRR | SaaS + 内容/社区/服务 | A |

结论：这是 2026 特别值得关注的新簇。原因不是 SEO 旧瓶新酒，而是 AI 搜索改变了“品牌被发现”的路径。小团队容易切入，因为客户还没形成固定采购标准，愿意买“结果”。

### 2.4 内容生产、短视频、设计工具

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| Vid.AI | https://vid.ai | 脚本到可发布视频，AI 生成 voiceover/visual/edit | Priyam Raj / Matt Par 小团队 | TrustMRR 搜索结果 2026-05：约 $80K-$82K last 30 days，约 $95K MRR，$1.3M+ all-time；Stripe verified | 订阅，无免费试用以控制生成成本 | A |
| StoryShort | https://storyshort.ai | 文本生成 faceless TikTok/YouTube Shorts | Samuel Rondot，法国 | TrustMRR 2026-05：$25,417 last 30 days；$24,266 MRR；$483,010 all-time；424 active subscriptions | $39-$199/月订阅 | A |
| Sleek | https://sleek.design | AI mobile app design / app mockup | Mattia Pomelli + Stefano + Niccolò Diana | Indie Hackers 2026-01：约 6 周/2 个月到 $10K MRR；TrustMRR 2026-05：$29,586 last 30 days；$25,399 MRR；Stripe verified | $20-$40/月订阅 + AI credits | A/B |
| Speel.co | TrustMRR leaderboard | AI 生成 UGC-style 广告视频/图片 | Yann | TrustMRR leaderboard：约 $65K MRR；描述称 3 个月到 $1M ARR | 订阅/创意生成 | A |
| Marky | TrustMRR marketplace | 作者社媒管理/内容发布 | 未展开 | TrustMRR recently listed：约 $24K revenue 30d，asking $495K | 订阅/内容工具 | A |

结论：内容工具很容易展示、传播、收费，但通用生成器竞争极强。能长期做下去的通常要绑定垂直工作流，例如“作者营销”“短视频账号批量生产”“UGC 广告素材”“移动 App mockup”。

### 2.5 垂直 B2B workflow / 行业 SaaS / AI agent 执行层

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| Lumoo | https://www.lumoostudio.com | Fashion/retail AI-native content workflow，虚拟试衣、B2B sell-in、品牌内容 | 瑞典两位创始人，强行业背景 | Lovable 2025-10 客户故事：9 个月 €700K ARR，15+ 品牌客户，目标 €1M ARR | B2B SaaS/企业订阅 | C |
| Plinq | https://www.plinq.com.br | 巴西女性安全 App，犯罪/法律记录快速查询 | Sabrine Matos，growth marketer，非技术创始人 | Lovable 2025-09 客户故事：3 个月 10K+ 用户，R$2.2M ARR，约 $456K | B2C/B2B 混合，安全数据查询/订阅 | C |
| ShiftNex | https://shiftnex.com | 医疗 staffing/workforce platform | 医疗 staffing 垂直团队 | Dealroom 2026：4 个月跨过 $1M revenue，built atop Lovable | B2B 平台/交易/订阅 | C |
| BookedIn | TrustMRR sales category | no-code AI receptionists / sales agents，语音、SMS、邮件、Instagram | Samin Yasar | TrustMRR sales category：约 $48K MRR，$278K total；for sale | 面向 agencies 的订阅/white-label | A |
| DM Champ | https://dmchamp.com/w | WhatsApp/Instagram AI sales agent，white-label 给 agency | Sohaib Ahmad | TrustMRR leaderboard：约 $179K MRR；官网强调 agency white-label | SaaS + white-label / agency resale | A/C |

结论：这是我认为风险调整后最好的方向。它通常不是纯 AI wrapper，而是“行业流程 + AI 执行 + 现有系统/渠道集成”。客户买的不是模型能力，而是少雇人、多接单、少漏单。

### 2.6 开发者/创业者工具、课程、卖铲子

| 产品 | 访问地址 | 场景 | 团队/背景 | 收入与近半年状态 | 盈利模式 | 证据等级 |
|---|---|---|---|---|---|---|
| ShipFast | https://shipfa.st | Next.js SaaS boilerplate | Marc Lou | TrustMRR 2026-05：$7,622 last 30 days；$1,258,246 all-time；无 active subscriptions；Stripe verified | 一次性 license，$199-$299 | A |
| CodeFast | https://codefa.st | 面向创业者的快速编程课程 | Marc Lou | TrustMRR 2026-05：$8,697 last 30 days；$801,634 all-time；无 active subscriptions；Stripe verified | 一次性课程/Bundle | A |
| Base44 | https://base44.com | AI app builder / vibe coding 平台 | Maor Shlomo 起步，出售时约 8 人 | Wix 官方 2025-06 宣布收购，初始对价约 $80M | 订阅/usage；并购退出 | A |

结论：卖铲子高毛利，但强依赖信任。没有个人品牌、社区影响力或很强的具体工具切口，不建议做第 N 个 boilerplate。

## 3. 近半年盈利情况的关键观察

1. 消费 App 的高收入样本成立，但利润波动大。Cal AI 是极强样本，STOPPR 则展示了中小消费 App 的真实压力：$14K 月收入时利润率可能只有 20%。
2. TrustMRR 验证数据里，AI/营销/内容/SEO 项目密度很高，且 $20K-$100K MRR 的小团队项目非常多。
3. AI SEO/AEO/GEO 是新增高热场景：SEOBOT、SEO STACK、AEO Engine、LocalRank、Launch Club 都围绕“Google + AI search + ChatGPT/Perplexity 可见性”收费。
4. 垂直行业 workflow 的公开收入少于内容工具，但单客价值更高，留存潜力更好。Lumoo、BookedIn、DM Champ、ShiftNex 都指向这一点。
5. “vibe coding 成功”的真实公式不是 `AI 写代码 = 赚钱`，而是 `已有需求/行业入口 + 快速产品化 + 可计量 ROI + 分发能力`。

## 4. 场景聚类与机会评分

评分权重：

- 付费痛感：25%
- 变现清晰度：20%
- 分发可获得性：20%
- 个人开发可交付性：15%
- 留存/防御力：10%
- 风险低：10%，分数越高表示风险越低

| 场景 | 代表产品 | 付费痛感 | 变现 | 分发 | 可交付 | 留存 | 风险低 | 加权分 | 判断 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| 垂直 B2B workflow / AI agent 执行层 | BookedIn、DM Champ、Lumoo、ShiftNex | 5 | 5 | 3 | 4 | 5 | 4 | 4.35 | 最值得长期做 |
| AI SEO / AEO / GEO / LLM visibility | SEOBOT、SEO STACK、AEO Engine、LocalRank | 5 | 5 | 4 | 4 | 3 | 3 | 4.20 | 2026 最热、最有窗口期 |
| 营销/获客/销售增长工具 | Kleo、Mentions、Leadmore、DataFast、PROSP | 5 | 5 | 4 | 4 | 3 | 2 | 4.10 | 高 ROI，但平台政策风险高 |
| 内容生产/短视频/设计工具 | Vid.AI、StoryShort、Sleek、Speel | 4 | 4 | 4 | 4 | 3 | 3 | 3.85 | 容易起量，但同质化快 |
| 消费移动订阅 | Cal AI、STOPPR、小猫补光灯 | 5 | 5 | 3 | 3 | 3 | 2 | 3.85 | 上限最高，普通开发者风险也最大 |
| 开发者/创业者工具和课程 | ShipFast、CodeFast、Base44 | 4 | 4 | 3 | 4 | 3 | 4 | 3.65 | 高毛利，但吃品牌/信任 |
| 游戏/纯娱乐 novelty | game jam / AI 小游戏 | 3 | 2 | 3 | 4 | 1 | 3 | 2.75 | 适合练手和流量实验，不适合作主赛道 |

## 5. 我认为最值得个人开发者做的方向

### 第一名：垂直 B2B workflow + AI agent 执行层

最优形态不是“万能 agent”，而是：

- 面向一个具体行业/岗位；
- 接一个明确的入口，比如网站表单、来电、WhatsApp、Instagram、Reddit、LinkedIn、CRM；
- 自动做一个高频业务动作，比如响应线索、补全资料、生成报价、跟进客户、安排会议、产出合规内容；
- 最后用真实业务指标证明价值：少漏单、多预约、多成交、少雇人。

为什么它最值得做：

1. 客单价可以做到 $99-$999/月，不需要海量用户。
2. AI coding 能快速做 MVP，但行业理解和集成细节能形成壁垒。
3. 比消费 App 少受投放、退款、App Store 政策影响。
4. 比通用 AI wrapper 更容易守住，因为每个行业的数据、术语、流程、合规都不同。

### 第二名：AI SEO / AEO / GEO 工具

2026 年非常明显的新增机会是：客户不只关心 Google 排名，还关心 ChatGPT、Perplexity、Gemini、AI Overviews 里有没有推荐自己。

适合个人开发者切的不是“全套 SEO 平台”，而是更窄的：

- AI visibility monitor：每天跑固定 prompts，记录品牌/竞品出现率；
- citation gap report：告诉客户缺哪些第三方证明；
- local business AI visibility：面向律师、牙医、装修、房产经纪、本地服务商；
- Reddit/Quora/LinkedIn/目录站 authority workflow：发现能被 AI 引用的公开讨论和资料缺口；
- 把“建议”变成可执行任务，而不是只做 dashboard。

### 第三名：营销/获客/归因工具

Leadmore、Kleo、PROSP、DataFast 的共同点是都贴近收入。最适合个人开发者做的变体是：

> 高意图机会雷达：监控 Reddit/HN/LinkedIn/行业论坛/AI 搜索，发现正在表达购买意图的问题，结合客户产品资料生成可人工审核的回复，再把 UTM/Stripe/CRM 归因接上，显示每条内容带来的 trial、付费和 MRR。

关键边界：不要做全自动垃圾评论机器人。应该做 human-in-the-loop，否则平台封号和品牌风险会压死产品。

## 6. 不建议优先做的方向

1. 通用 chatbot / PDF 对话 / meeting notes：太拥挤，除非强垂直。
2. 通用短视频生成器：容易 demo，但模型和模板商品化很快。
3. 第 N 个 AI headshot / avatar：历史上赚过钱，但 2026 新进入性价比下降。
4. 通用 app builder / Lovable clone：平台级竞争，安全、部署、状态管理、支付、数据库都复杂。
5. 纯靠“我用 AI 1 小时做了 App”的一次性爆款：能赚钱，但不可复利，且抄袭速度极快。

## 7. 核心来源

- TrustMRR homepage / leaderboard: https://trustmrr.com/
- StoryShort TrustMRR: https://trustmrr.com/startup/storyshort
- DataFast TrustMRR: https://trustmrr.com/startup/datafast
- TrustMRR startup page: https://trustmrr.com/startup/trustmrr
- ShipFast TrustMRR: https://trustmrr.com/startup/shipfast
- CodeFast TrustMRR: https://trustmrr.com/startup/codefast
- Sleek TrustMRR: https://trustmrr.com/startup/sleek
- SEO STACK TrustMRR: https://trustmrr.com/startup/seo-stack
- AEO Engine TrustMRR: https://trustmrr.com/startup/aeo-engine
- Vid.AI TrustMRR search result / product site: https://trustmrr.com/startup/vidai-llc and https://vid.ai/
- Cal AI TechCrunch acquisition: https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens/
- Cal AI App Store issue: https://techcrunch.com/2026/04/21/apples-cal-ai-crackdown-signals-its-still-policing-the-app-store/
- STOPPR Indie Hackers: https://www.indiehackers.com/post/tech/from-zero-to-10k-mo-app-portfolio-in-a-year-71h2PPGYn1VnPOkj9qi6
- Kleo / Mentions Indie Hackers: https://www.indiehackers.com/post/tech/from-0-to-62k-mrr-in-three-months-mUPVSYOlJAC2iogGK7d4
- Leadmore AI Indie Hackers: https://www.indiehackers.com/post/tech/hitting-30k-mrr-with-an-ai-marketing-product-n59ORJCYjnZC61Q096UL
- Sleek Indie Hackers: https://www.indiehackers.com/post/tech/hitting-10k-mrr-in-six-weeks-with-an-ai-design-tool-pEvmU5qkWS6ny0AR9SUv
- Lovable Plinq story: https://lovable.dev/blog/how-sabrine-matos-built-plinq
- Lovable Lumoo story: https://lovable.dev/blog/lumoo-ai-fashion-platform
- Dealroom ShiftNex note: https://app.dealroom.co/news/note/1m-in-4-months-built-on-ai-disguised-as-a-simple-app
- Wix/Base44 acquisition: https://www.nasdaq.com/press-release/wix-further-expands-vibe-coding-acquisition-base44-hyper-growth-startup-simplifies
- SEOBOT official: https://seobotai.com/
- AEO Engine official: https://aeoengine.ai/
- LocalRank official: https://localrank.so/
- 小猫补光灯/手搓 App 中新经纬/新浪: https://finance.sina.cn/stock/jdts/2026-05-22/detail-inhytyyr7742585.d.html
