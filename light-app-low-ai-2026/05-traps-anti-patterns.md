# 05 · 反例与成本陷阱：哪些"轻应用"其实在持续烧 AI 钱 / 没人愿付费

**版本**：v1.0 / 2026-05-29
**视角**：市场调研 + 风险分析（专找反面教材，给个人开发者避坑）
**目标用户假设**：想做"运行时低 AI 成本 + 一次性买断 + 真实付费"的个人开发者
**证据强度标注**：🟢强（多源 / 一手数据）｜🟡中（单源 / 行业测算）｜🔴弱（轶事 / 需进一步验证）

> 一句话结论：**真正的杀手不是"做不出来"，而是"做出来之后每个活跃用户都在替你烧云 API 钱，而用户两个月后就走、还不愿持续付费"。** AI 让"让人付一次钱"变容易了，但没让"让人留下来"变容易（RevenueCat：AI 应用流失比非 AI 应用快 30%）。

---

## 一、AI 成本陷阱：哪些方向每个活跃用户都在持续烧钱

### 底层算账：AI wrapper 的毛利天然比 SaaS 低一大截 🟢

- 传统 SaaS 毛利 **80–90%**；AI wrapper 平均毛利只有 **25–60%**，相当一部分快速起量的 AI 应用早期甚至是**负毛利**。（Market Clarity；SoftwareSeni）
- 推理 / API 成本在规模化 AI B2B 公司里平均吃掉 **约 23% 营收**；"成功"的 wrapper API 成本也占营收 **15–30%**。换算：每 100 万营收，约 23 万先被推理吃掉，工程、获客、客服都还没付。（Bain Capital Ventures；Tanay Jaipuria；多源转述）
- 行业测算：**60–70% 的 AI wrapper 零营收，只有 3–5% 月入过 1 万美元**，并有"90% 的 AI wrapper 会在 2026 年因经济模型不可持续而死"的判断。（多篇 2026 年初行业分析转述，🟡中：属预测性结论）

### 标杆反例：连巨头都在亏 —— GitHub Copilot 🟢

- Copilot 在 $10/月 定价下，曾被广泛援引为**平均每用户每月净亏 >$20**（算力成本约 $30/用户·月，负毛利）。
- 直接后果：**2026 年 6 月 1 日 Copilot 改为按量计费（usage-based）**，把固定订阅 + 高级请求额度换成 AI credits（1 credit = $0.01）。媒体直言 agentic 编码场景把 token 费用推高 **10×–100×**，固定价模型撑不住。（DevOps.com；pivot-to-ai.com；GitHub Docs）
- **避坑含义**：连微软都补不动的"固定价 + 重推理"，个人开发者更别想用一次性买断扛住。

### 按方向逐个排雷

| 方向 | 运行时成本特征 | 危险度 | 关键数据 / 来源 |
|---|---|---|---|
| **AI 聊天 / 陪伴** | 多轮长上下文、用户重度使用、为留存还要堆"记忆"= token 单调上涨 | 🔴极高 | 越受欢迎死得越快；陪伴类用户 1–2 个月后过新鲜劲（HN / Creem） |
| **AI 视频生成** | 按秒计费 $0.05–0.75/秒，一条 10 秒 premium 片可达 $7.5 | 🟠高（但在降） | 价格每年降约 30%，预计 2027 中有 $0.01/秒（buildmvpfast；soloa.ai）——单价虽降，但用户"再生成一次"的冲动无上限，单用户成本不可控 |
| **AI 图像生成** | $0.008–0.20/图，自托管可 <$0.01 | 🟡中 | 单价不致命，**致命的是免费额度白嫖 + 一张不满意连点 10 次**（Digital Applied；Apatero） |
| **实时 AI 翻译 / 语音** | 流式 ASR+LLM+TTS 三段叠加，按时长持续计费 | 🟠高 | 见第二节：还叠加"免费替代品太多"双重打击 |
| **AI 写作助手** | 文本最便宜（$5–30/百万 token），但重度用户/长文吃量 | 🟡中 | 单价低，但与 ChatGPT 免费版正面竞争（见付费意愿陷阱） |
| **AI 客服** | 按对话 / 按解决计费 | 🟡中 | ROI 存疑：账单争议类只解决 17%（CNBC）；Zendesk 2024 改"按解决"计费=变相承认"发起≠解决" |

**成本陷阱的共同结构**：① 成本随使用量线性增长且**用户侧无任何摩擦**（多聊一句、多生成一张都不要钱，对你都要钱）；② "记忆 / 上下文 / 高清 / 重做"这些提升体验的功能**全都加 token**；③ 重度用户（power user）单方面把你的预算烧穿——AppSumo 官方都承认"power users can burn through vendor budgets"。

---

## 二、付费意愿陷阱：哪些方向用户不愿付费 / 留存极差

### 核心数据：AI 应用"好转化、坏留存"悖论 🟢
来自 RevenueCat《2026 State of Subscription Apps》（11.5 万+ App、$16B+ 营收）：

| 指标 | AI 应用 | 非 AI 应用 | 含义 |
|---|---|---|---|
| 年订阅留存 | **21.1%** | 30.7% | AI 流失快约 **30%** |
| 月订阅留存 | 6.1% | 9.5% | AI 更不"黏" |
| 试用转付费 | 8.5% | 5.6% | AI 转化更好（"骗"你付第一次容易） |
| 退款率 | **4.2%** | 3.5% | AI 退款高 20% |

> 结论被反复引用为一句话：**"AI makes it easy to get people to pay, but it does not make them stay."**（TechCrunch / Creem / ChartMogul）

### 三类高危付费意愿陷阱

**1. 一次性爆款、零复购的 novelty 工具** 🟢
- "新鲜感悬崖（novelty cliff）"：首用 wow，但 wow 会褪色；不嵌入日常工作流就被弃用。AI 陪伴 / AI 女友类**典型 1–2 个月**新鲜劲过去（HN id=44650450；Creem）。
- **真实反例 STOPPR**：靠网红视频两周做到 $5k、三个月到 $14k/月营收，但**利润率仅 20%**，且创始人 3/4 时间在管网红；到 2026-05 已跌到 **$2,144 MRR / 837 订阅**——爆款不等于可持续。（Indie Hackers；whatsthe.app，🟡中：MRR 为第三方估算）

**2. 免费替代品太强、无法变现的方向** 🟢
- **AI 写作 / 通用问答**：直接对撞 ChatGPT 免费版（GPT-5.x，7 亿周活，多数是免费用户）。用户会问"我为什么要为一个 wrapper 付 $20/月？"——这是 wrapper 死亡的标准心理。（OpenAI；Creem）
- **AI 翻译**：Google Translate 免费且语言最全，DeepL 免费档已覆盖轻度需求。消费者侧愿付费极弱，能赚钱的几乎只剩 B2B API / 企业本地化，不是个人轻应用能吃的。（Smartling；Taia；Elite Asia）

**3. 订阅 churn 极高 / 价格越低越留不住的品类** 🟢
- AI-native 产品**售价 <$250/月时 GRR 仅 45%、NRR 61%**；售价 >$250/月才接近 B2B SaaS 的 70%/85%。**个人轻应用主打的恰恰是低客单（$5–30）区间，正是留存最差的一档。**（getmonetizely）
- 近 **30% 的年订阅在第一个月内被取消**（RevenueCat）。

---

## 三、"一次性买断"的反面：哪些产品做买断会死

**铁律：只要运行时有持续的边际成本（每次调用都烧 API），就绝对不能做一次性买断。** 一次性买断 = 收一次钱、却要无限期替用户付推理费，用户用得越狠你越亏。

### 真实尸体 🟢
- **ChatPlayground AI**：在 AppSumo 卖了终身买断，2025 年**单方面撤销所有终身权益**，理由明说"AI API 成本不可持续"，要求用户**以 $875 重新购买**（原价只是零头）。
- **Gyana**（数据分析）：AppSumo 卖终身 deal，**部分用户买后 3 个月平台关停**。
- 社区统计：**约 40% 的 AppSumo 终身 deal 三年内失败**；AppSumo 抽走最高 **70%**，$59 的 deal 开发者到手 **约 $18**，却要为该用户**无限期**承担服务器 + API + 支持。（dev.to；AIonX；ppc.land：AppSumo 营收同比腰斩 50%，终身 deal 模式陷生存危机）

### 间接旁证 🟡
- **Builder.ai**：融资 $4.45 亿、估值 $15 亿，2025-05 仍因烧光现金破产（并涉营收"对敲"造假指控）；多源称欠 AWS $85M、欠微软 $30M。重资源 + 收不回对应钱 = 再大也撑不住。（Rest of World；techstartups 转述云欠款）

### 什么能做买断（正面对照）
- **无运行时 AI 成本**或**AI 只在本地 / 一次性算完**的：本地推理、买断后不再调云、纯素材 / 模板 / 工具型功能。
- 本目录 detail-02「AI 倒数日 Pro」即属此类（主题买断 + 无持续云推理），被自评为"唯一干净的 idea"。
- 折中：**买断壳子 + AI 功能单独按量 credits / 小额订阅**（即 Copilot 的转向方向）。

---

## 四、平台政策陷阱（个人开发者高频踩坑）

### App Store（iOS）🟢
- **4.2 最低功能 / 4.2.6 设计垃圾**："包网站、基础 AI prompt 工具、模板克隆"被列为 AI 应用被拒**第 1 大原因**；用生成器 / 模板 / 克隆脚本批量产出 = design spam。（appnatively；OpenForge）
- **4.3 Spam**：与他人 App"二进制 / 元数据 / 概念高度雷同、仅小改"会被判垃圾——AI 批量做同质小应用的标准死法。算命类还会因 primary function 直接被 4.3 拒（开发者论坛实例）。
- **5.1.2 数据**：把用户 prompt 发给第三方 AI（OpenAI/Gemini）**必须显著披露并取得同意**；缺内容审核 / 举报机制的 AIGC 易被拒。
- **动态代码执行禁令**：禁止下载新代码 / 审核后改功能 / 应用内生成应用——"vibe coding 生成 App"类已被 Apple 拦更新。

### Chrome Web Store 🟢
- **单一用途（single purpose）**：扩展必须单一目的，杂糅功能高危。
- **联盟广告新政（2025-06-10 起强制执行）**：未给用户"直接、透明利益"就注入联盟链接 / cookie 会被下架（Honey 事件后收紧）。靠 AI 工具偷塞返利链接变现=直接违规。（Chrome for Developers）
- 通用：15 类常见被拒原因里，权限过度、描述与功能不符、隐私政策缺失最常见。

### 微信小程序（个人开发者最硬的墙）🟢
- **个人主体小程序未开放"深度合成"类目**（AI 问答 / AI 绘画 / AI 换脸等）——**必须企业主体**，且要技术方完成《互联网信息服务算法备案》（"生成合成类(深度合成)"）+ 主体合作协议。个人开发者做 AI 小程序基本被劝退（官方建议改走 H5 / 公众号 / 客服消息）。（微信开放社区；Apiyi 指南）
- **算命 / 昵称测试类 UGC**：无安全过滤会阶梯封禁分享能力。
- **虚拟支付（2025 新动向）**：微信小程序已官宣 **iOS 端接入虚拟支付、苹果抽成 15%**（中小开发者口径）；但虚拟支付能力本身有类目门槛、且历史上 iOS 长期受限——别把"能收钱"当默认。（IT之家；21世纪经济报道）

> 跨平台共性陷阱：**虚拟商品 / AI 付费内容的支付**几乎都要走平台内购并被抽成（App Store 15–30%、微信 iOS 15%），引导外部支付 = 被拒 / 封禁；这进一步压薄本就被 API 吃掉的毛利。

---

## 五、避坑清单：8 个"不要做"的方向 + 理由 + 真实失败案例

> 优先级：🔴 = 重度烧钱且付费意愿弱，强烈劝退；🟠 = 有条件可做但坑深。

1. **🔴 AI 聊天 / 陪伴 / AI 女友（按订阅）**
   理由：长上下文 + 重度使用持续烧 token，"越受欢迎越亏"；1–2 个月新鲜劲过、churn 极高。**案例**：Soulmate / Forever Voices / Dot 等 2025 集中关停（资金缺口为主因之一）；HN 公认"churn is brutal"。

2. **🔴 任何"运行时有 AI 成本"的一次性买断 / 终身 deal**
   理由：收一次钱、无限期付推理费，power user 烧穿预算。**案例**：ChatPlayground AI 撤销终身权益要求 $875 重购；Gyana 买后 3 个月关停；约 40% AppSumo LTD 三年内失败。

3. **🔴 AI 写作助手 / 通用 AI 问答（直撞 ChatGPT 免费版）**
   理由：免费替代太强，用户问"凭什么付 $20 给 wrapper"；低客单订阅留存最差（<$250/月 GRR 仅 45%）。**案例**：SimpleClosure 报告"copilots/assistants/generators"是 2025 关停主导模式，AI 占关停约 16%。

4. **🔴 AI 翻译 / 实时语音翻译（消费者端）**
   理由：Google Translate 免费且语言最全、DeepL 免费档够用，消费者付费意愿极弱；而实时语音 ASR+LLM+TTS 三段叠加按时长烧钱。能赚的只剩 B2B，不是个人轻应用赛道。

5. **🟠 AI 视频生成（面向 C 端、无成本上限）**
   理由：按秒计费、用户"再来一条"无上限，单用户成本不可控；虽单价每年降 ~30%，但定价权 / 体验在大模型方。**案例**：行业普遍把高算力消费级 AI 列为负毛利重灾区（参照 Copilot 改按量计费、10×–100× token 涨幅）。

6. **🟠 AI 图像生成（重免费白嫖型）**
   理由：单价不致命，但"免费额度 + 一张不满意连点 10 次"把成本放大；同质化严重、易被 App Store 4.3 判垃圾。**对策**：必须严格限免费额度 + 用最便宜的自托管 / 聚合模型。

7. **🔴 在微信小程序上做 AI（个人主体）/ 算命昵称测试类**
   理由：个人主体无"深度合成"类目，必须企业 + 算法备案；算命类封分享。**案例**：微信官方明确建议个人开发者改走 H5 / 公众号。

8. **🟠 靠"模板批量生成同质 AI 小应用"刷量 / 靠偷塞联盟链接变现**
   理由：App Store 4.2.6 / 4.3 判 design spam；Chrome 单一用途 + 2025 联盟广告新政下架。**案例**：Honey 事件后 Chrome 收紧、Apple 拦截"生成 App 的 App"。

### 反向"相对安全"的特征（正面对照，给方向校准）
- 运行时 **AI 成本趋近于零**（本地推理 / 一次性算完不再调云 / AI 仅锦上添花）。
- 卖的是**结果 / 工具 / 素材 / 模板**而非"无限对话"，单用户边际成本可封顶。
- **真实刚需 + 嵌入日常工作流**（越过 novelty cliff），而非一次性 wow。
- 若必须有持续 AI 成本：**走按量 credits / 小额订阅 + 成本上限 monitor**，绝不一次性买断；并优先 DeepSeek / 智谱 GLM-Flash 等低价文本模型（参照本目录 detail-05 成本口径）。

---

## 关键结论（给个人开发者）
1. **先问"每个活跃用户每天替我烧多少 API 钱"**，再问能不能做。运行时边际成本 > 0 的方向，一次性买断一律否决。
2. **AI 转化好≠生意好**。RevenueCat 数据钉死：AI 应用流失快 30%、退款高 20%，低客单订阅是留存最差的一档。
3. **避开与免费大模型正面竞争的通用方向**（聊天 / 写作 / 翻译 / 问答）——你打不过 ChatGPT 免费版和 Google Translate。
4. **平台抽成 + API 成本是双重夹击**：毛利先被推理吃 15–30%，再被平台抽 15–30%，低客单几乎不剩。
5. **微信小程序对个人 AI 开发者基本关门**（深度合成需企业 + 备案），别把它当默认渠道。

---

## Sources（按主题）

**AI wrapper 经济 / 毛利 / 倒闭潮**
- The End of the AI Wrapper Era — https://developia.substack.com/p/the-end-of-the-ai-wrapper-era
- Google VP warns two types of AI startups may not survive — TechCrunch — https://techcrunch.com/2026/02/21/google-vp-warns-that-two-types-of-ai-startups-may-not-survive/
- What Are the (Realistic) Margins of an AI Wrapper? — Market Clarity — https://mktclarity.com/blogs/news/margins-ai-wrapper
- Why AI Gross Margins Are So Much Lower Than SaaS — SoftwareSeni — https://www.softwareseni.com/why-ai-gross-margins-are-so-much-lower-than-saas-and-what-that-means-for-your-business/
- Gross Margin Is a BS Metric — Bain Capital Ventures — https://baincapitalventures.com/insight/gross-margin-is-a-bs-metric/
- The State of AI Gross Margins — Tanay Jaipuria — https://www.tanayj.com/p/the-gross-margin-debate-in-ai
- State of Startup Shutdowns 2025 — SimpleClosure — https://simpleclosure.com/blog/posts/state-of-startup-shutdowns-2025/
- Top AI Startups That Shut Down in 2025 — Tech Startups — https://techstartups.com/2025/12/09/top-ai-startups-that-shut-down-in-2025-what-founders-can-learn/

**GitHub Copilot 成本 / 改按量计费**
- GitHub Resets Copilot Pricing as AI Compute Costs Surge — DevOps.com — https://devops.com/github-resets-copilot-pricing-as-ai-compute-costs-surge/
- GitHub Copilot AI token charges to go up 10×–100× — pivot-to-ai — https://pivot-to-ai.com/2026/05/18/github-copilot-ai-token-charges-to-go-up-10x-100x/
- Models and pricing for GitHub Copilot — GitHub Docs — https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing

**留存 / churn / 付费意愿**
- AI App Retention Paradox (RevenueCat 数据) — Creem — https://www.creem.io/blog/ai-app-retention-paradox-churn-2026
- State of Subscription Apps 2025 — RevenueCat — https://www.revenuecat.com/state-of-subscription-apps-2025/
- AI-powered apps struggle with long-term retention — TechCrunch — https://techcrunch.com/2026/03/10/ai-powered-apps-struggle-with-long-term-retention-new-report-shows/
- The SaaS Retention Report: The AI churn wave — ChartMogul — https://chartmogul.com/reports/saas-retention-the-ai-churn-wave/
- The Economics of AI-First B2B SaaS in 2026 (GRR/NRR by 价位) — Monetizely — https://www.getmonetizely.com/blogs/the-economics-of-ai-first-b2b-saas-in-2026
- "The churn is brutal…" — Hacker News — https://news.ycombinator.com/item?id=44650450

**陪伴类成本 / 关停**
- The AI Companion Market in 2025 — Market Clarity — https://mktclarity.com/blogs/news/ai-companion-market
- AI Companion Apps That Shut Down in 2025 — https://aicompanionguides.com/blog/the-platforms-that-died-rip-2025-shutdowns/
- AI companion Soulmate shuts down — Futurism — https://futurism.com/the-byte/soulmate-ai-companion-chatbot

**STOPPR 案例**
- From zero to $10k/mo app portfolio in a year — Indie Hackers — https://www.indiehackers.com/post/tech/from-zero-to-10k-mo-app-portfolio-in-a-year-71h2PPGYn1VnPOkj9qi6
- Stoppr MRR — whatsthe.app — https://www.whatsthe.app/com.stoppr.app

**图像 / 视频 / 翻译成本**
- AI Image Generation API Pricing — Digital Applied — https://www.digitalapplied.com/blog/ai-image-generation-api-pricing-comparison-2026
- AI Video Generation API Pricing — buildmvpfast — https://www.buildmvpfast.com/api-costs/ai-video
- AI Video Generation Cost Per Second — soloa.ai — https://soloa.ai/blog/ai-video-generation-cost-per-second-2026
- Google Translate Alternatives — Smartling — https://www.smartling.com/blog/google-translate-alternative

**一次性买断 / 终身 deal 反例**
- Lifetime subscriptions don't mean what you think — DEV — https://dev.to/productimpossible/lifetime-subscriptions-dont-mean-what-you-think-they-mean-1hg7
- Lifetime AI Tool Deals: Are They Worth It? — AIonX — https://aionx.co/cost-budget/lifetime-ai-tool-deals-worth-it/
- AppSumo's revenue crashes 50% as lifetime deal model faces crisis — PPC Land — https://ppc.land/appsumos-revenue-crashes-50-as-lifetime-deal-model-faces-existential-crisis/
- What was Builder.ai and why did it shut down — Rest of World — https://restofworld.org/2025/builderai-ai-explainer-bankrupt/

**AI 客服 ROI**
- 'I hate customer-service chatbots' — CNBC — https://www.cnbc.com/2026/04/01/ai-chatbot-customer-service-complaints-refunds.html

**平台政策**
- App Store Review Guidelines 2025: Essential AI App Rules — OpenForge — https://openforge.io/app-store-review-guidelines-2025-essential-ai-app-rules/
- Apple Is Rejecting AI-Generated Apps — appnatively — https://appnatively.com/blog/apple-is-rejecting-ai-generated-apps
- App Review Guidelines — Apple — https://developer.apple.com/app-store/review/guidelines/
- Chrome Web Store policy update: Affiliate programs — Chrome for Developers — https://developer.chrome.com/blog/cws-policy-update-affiliate-ads-2025
- Why Chrome Extensions Get Rejected — Extension Radar — https://www.extensionradar.com/blog/chrome-extension-rejected
- 微信小程序 AI 功能上架完全指南（2025） — Apiyi — https://help.apiyi.com/wechat-mini-program-ai-requirements-guide.html
- 微信小程序深度合成-AI问答类目获取指引 — 微信开放社区 — https://developers.weixin.qq.com/community/develop/article/doc/0004e2c3cf8ac84c50521925b66413
- 微信小程序官宣 iOS 端支持虚拟支付，苹果抽成 15% — IT之家 — https://www.ithome.com/0/897/349.htm

*证据强度：成本/毛利/churn 多为多源一手数据（🟢）；"90% wrapper 会死""40% LTD 失败"等为预测/社区统计（🟡）；个别 MRR 数字为第三方估算（🟡）。严禁据本文单一数字下投资决策，关键数字建议复核原始来源。*
