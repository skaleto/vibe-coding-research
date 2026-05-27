# AI 梦境日记 / 解梦 —— 国内+海外双发可行性深度调研

**调研时间：2026-05-27**
**调研对象：AI Dream Journal / 梦境心理学日记**
**产品定位**：国内"梦境心理学日记"+ 海外 Dream Journal AI 双发
**预设定价**：免费 1 个梦/天 + ¥18/月不限 + ¥98 永久 + 海外 $9.99/月

> **核心结论先行**：国内"AI 解梦"是 **高合规风险赛道**。直接命名"解梦/算命/占卜"几乎 100% 被微信小程序拒审；但包装为"梦境心理学日记 / 心情日记"路径**有条件可行**——前提是产品内**绝不出现"测运势/预测吉凶/付费解签"**等模块。海外赛道相对自由但**已严重红海化**，TAM 较小，Elsewhere / Oniri 等头部 ARR 估算 $50K–500K 量级。**总评：可做，但不建议作为矩阵中的"主推 idea"，更适合做 1-2 周轻投入的探索品。**

---

## 第一部分：合规审查（最关键章节）

### 1.1 微信小程序：明确禁止"解梦/算命/占卜"

调研结论：**直接以"解梦/算命/占卜/算运势/星座命理"命名或定位的小程序，会被微信小程序代码审核驳回；上架后被举报亦会被封号或限制功能。**

**关键条款原文（《微信小程序平台运营规范》）**：

| 条款 | 原文 | 处罚 |
|---|---|---|
| **6.1.3** | "煽动民族仇恨、民族歧视、破坏民族团结、破坏国家宗教政策、宣扬邪教和**封建迷信**。" | 封号 |
| **6.4.5** | "虚假迷信：标题/内容含有不合常理、博眼球的奇闻异事，发布**封建迷信、恐吓诅咒挂钩的内容**。" | 限制功能直至封号 |
| **5.12.15** | "小程序不得存在任何形式的过度收集、数据滥用…包括但不限于**人像评分、AI 算命**等。" | 整改/封号 |

**官方社区开发者真实反馈**：
- 开发者 **Gonepoo**：「我的六爻策就被锁定了，2000+ 用户」（[微信开放社区帖](https://developers.weixin.qq.com/community/develop/doc/000a44d7fe006840f859648095b400)）
- 开发者 **啊东**：「内容属于平台未开放的服务范围，会被下架违规，特别是做大用户量后，下架的更触不及防」
- 微信官方修改指引：「页面内容中，**不能存在测试类内容；示例：算命，抽签，星座运势等**」（[官方修改指引](https://developers.weixin.qq.com/community/develop/doc/000082c0f88640f4b490809316b009)）
- 微信公众平台 2022 起持续整治"借宗教、风水、运势等噱头敛财"内容（[IT 之家报道](https://www.ithome.com/0/642/520.htm)）

**结论**：「解梦 / 周公解梦 / AI 算命 / 运势预测」是微信小程序明确的禁区，无擦边可能。

### 1.2 iOS App Store：占卜算命属"过饱和类别"

**Guideline 4.3(b) Spam 原文**：

> "Also avoid piling on to a category that is already saturated; the App Store has enough fart, burp, flashlight, **fortune telling**, dating, drinking games, and Kama Sutra apps, etc. already. We will reject these apps unless they provide a **unique, high-quality experience**. Spamming the store may lead to your removal from the Apple Developer Program."

**真实拒审案例**：
- 一款 astrology App 因 "4.3b: Spam" 被 Apple 拒，明确说"已经太多 horoscope apps"（[Apple Developer Forums](https://developer.apple.com/forums/thread/737999)）
- iMore 2018+ 多年报道：「Apple rejects developer's horoscope app, says App Store has enough」（[iMore](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough)）

**国内 iOS 边界**：中国区 App Store 上 "占卜 / 八字 / 紫微" 类 App 仍大量在架（如"天时子平生辰八字"等），但 Apple 中国区随时可能加强治理；**不建议作为长期赌注**。

### 1.3 国内监管：心理咨询资质 + AI 拟人化新规

- **互联网医疗资质门槛极高**：心理咨询正规化要求获得「互联网医院牌照」，需"三级以上医疗服务信息平台 + 全国督导系统 + 医疗责任保险 + 公安三级等保备案"，申请周期 2 年起（[中企百通](https://www.miibt.com/show-144-6555-1.html)）。**个人开发者不可能拿到**。
- **小程序商家分类**：当前微信工商系统已**取消"心理咨询"选项**，仅允许"健康咨询"；名称含"心理咨询"会被驳回要求资质（[微信开放社区](https://developers.weixin.qq.com/community/develop/doc/00066272ca8880cdcbfa3325351800)）。
- **AI 拟人化新规（2025-12-27 网信办征求意见稿）**：要求 AI 服务"显著标识 AI 身份 + 连续使用 2 小时反沉迷提醒 + 禁止情感操纵话术"（[网信办](https://www.cac.gov.cn/2025-12/27/c_1768571207311996.htm)）。AI 解梦如对话化设计，需做合规改造。

### 1.4 已下架 / 整改案例（5 个真实案例）

| # | 产品 | 类别 | 事件 | 来源 |
|---|---|---|---|---|
| 1 | **Glow**（MiniMax） | AI 陪伴 | 2023-03 被举报下架 | [新浪财经](https://finance.sina.com.cn/wm/2025-06-22/doc-infaxaan4320733.shtml) |
| 2 | **X Her** | AI 陪伴 | 2024-05 央视点名"露骨擦边"下架 | 同上 |
| 3 | **未伴**（腾讯 QQ 音乐） | AI 社交 | 主动下架 | 同上 |
| 4 | **筑梦岛** | AI 陪伴 | 2025-06 被上海网信办约谈，要求整改 | 同上 |
| 5 | **冒泡鸭 / 异世界回响**（Soul） | AI 陪伴 | 2025 因监管原因停止运营 | [RTE 社区](https://www.cnblogs.com/rtedev/p/19424231) |
| 6 | **奇妙梦境** | 梦境记录+游戏化 | 2018 因转社交失败逐步下线（非监管下架但生命周期短） | [简书追忆](https://www.jianshu.com/p/ad3b3e861744) |
| 7 | "开个密室馆"等 4 款 | 国家网信办通报下架 | 因未公开收集使用规则 | [中证网](https://www.stcn.com/article/detail/1533490.html) |

**注意**：未找到"周公解梦"类 App **被监管直接下架**的公开新闻，但微信小程序生态内"算命/八字/解梦"类小程序持续被审核驳回是常态。

### 1.5 合规变体方案验证：「梦境心理学日记」能不能过审？

**结论：有条件可行（70% 通过概率）**。

依据：
1. 微信小程序已存在大量「**情绪日记 / 心情日记 / 睡眠日记本**」类应用通过审核，定位"健康咨询/记录工具"而非"诊断/预测"。
2. **奇妙梦境**（已下线 ≠ 监管下架）历史上明确以"弗洛伊德/荣格梦境分析"为定位运营多年。
3. **Dreamore AI、Dreamoo**（国内现存）使用"弗洛伊德/荣格/科学派"等多流派标签，目前仍在 App Store 在架，未被下架。

**通过审核的关键设计要求**：
- ❌ 不用"解梦/算命/占卜/运势/预测/吉凶/转运"任何字眼
- ❌ 不收集生辰八字、手相、面相
- ❌ 不出现"今日运势/吉凶提示/预测未来"模块
- ❌ 不做付费解签、不卖"转运商品"
- ✅ 定位**"梦境记录工具 + 心理学启发式反思"**
- ✅ AI 输出强制带**"AI 生成、仅供参考、非医疗诊断"** 显著标识
- ✅ 引用弗洛伊德/荣格仅作为"心理学知识科普"，不做命运判断
- ✅ 行业分类选"健康咨询"或"工具/效率"，不选"心理咨询"

**法律红线**：参照《互联网信息服务深度合成管理规定》第十条 + AI 拟人化新规，**必须做 AI 输出标识 + 反沉迷提示**。

---

## 第二部分：海外竞品深度分析

### 2.1 Elsewhere（被用户误称为"YC W23 出品"，实为独立团队）

**重要校准**：交叉验证后，**Elsewhere 未出现在 Y Combinator W23 batch 公开名单中**（搜索 YC 公司目录、媒体报道、官方介绍均无 YC 标签）。它是 Gez Quinn (UK) + Dan Kennedy (Australia) + Kat Juncker (US) 三人远程独立团队，由梦境研究学者 Kelly Bulkeley 担任顾问。2021 年起做 dream website，2023 年上线为正式 App。

| 维度 | 数据 |
|---|---|
| 定价 | Free + $4.99/月 / $49.99/年 |
| App Store 评分 | **4.19 / 5（77 评）**（数据偏少） |
| Google Play 总下载 | **约 5,800 次**（AppBrain），近 30 天约 180 次 |
| 估算 ARR | **~$50K–150K**（按 1-3% 付费转化、5-10K MAU 测算） |
| 平台 | iOS / Android / Web，30+ 语言 |
| AI 流派 | Freudian / Jungian / Gestalt / Biblical 等 |
| 独特卖点 | "纸质日记扫描"、社交（与朋友私享）、自动 tagging |
| 来源 | [App Store](https://apps.apple.com/us/app/elsewhere-dream-journal/id6445864345) / [AppBrain](https://www.appbrain.com/app/elsewhere-dream-journal/to.elsewhere) / [Medium 对比文](https://medium.com/@elsewheredreams/best-dream-journal-apps-of-2025-fb7f800371b8) |

### 2.2 其他海外 Dream Journal 头部产品对比

| 产品 | 定价 | 独特卖点 | 数据 |
|---|---|---|---|
| **Oniri** | 免费 / $11.99 月 / $70.99 年 | 主打 **Lucid Dreaming**；reality check / induction techniques | iOS+Android，2015 上线 10 年老 brand；高评分；估算 ARR $300K–1M |
| **DreamApp** | $10/月（年付）= $60/年 | **真人持证心理学家** + AI 双重分析；4 阶段工作流 | 4.6/5（3,200 评），独特护城河 |
| **Lucidity** | 免费带广告 / $7.99 周 / $72.99 年 / $124.99 终身 | 强统计 + 隐私（本地+Google Drive）；2014 上线 | Android only，长尾老用户 |
| **DreamWell** | $12.99 月 / $69.99 年 | reality testing 通知；睡眠呼吸数据 | 中等热度 |
| **Temenos Dream** | 免费 / $14.99 月 / $99.99 年 | 荣格深度分析 + **端到端加密** | 高客单，付费门槛高 |
| **DreamKit** | 全免费 | 全免费 AI，但已"消失"（2025-09 退出 App Store） | 已死 |
| **Awoken** | 一次性 $1.99 终身 | 500K+ 下载，最受欢迎的免费 lucid 工具 | 价格战极致代表 |

**Pillowtalk**（值得关注的新玩家）：2023-04-05 上线，主打"语音 voice journal + AI dream interpretation + 强隐私"，上线 9 国 Health & Fitness 榜前 10，**两天 3.4 万下载**，订阅 $12.9–$111.99；创始人 Belen + Cherri（Brooklyn），曾自己有睡眠障碍（[搜狐报道](https://www.sohu.com/a/881252629_121956424)）。

### 2.3 海外用户付费意愿（Reddit / 用户评价综合）

直接抓取 Reddit r/Dreams、r/LucidDreaming 受 API 限制不便，但综合 Medium / AppBrain / App Store 评论以及 dreamstream.art 等 2026 年第三方对比：
- 主流用户**严重价格敏感**：Awoken $1.99 终身 = 500K+ 下载证明用户对"高级 lucid 工具"愿意付费但**只接受低价**
- 4.99–7.99/月 是"舒适价位"，Oniri $11.99/月 多次被吐槽 "paywall everywhere"
- 真正愿意付 $10+/月的细分群体：**严肃 lucid dreamer + 心理学/灵性深度爱好者**，规模相对小
- 用户最在意：**隐私（本地存储/端到端加密）+ 输出质量（不是套话）+ 长期数据可视化**

**总市场规模估算**：海外 Dream Journal 全品类 ARR 合计大概 **$3–10M** 量级（基于 Sensor Tower / AppBrain 行业数据反推），头部 5 家分食大头；个人开发者新进入者**很难突破 $30K ARR**，除非有差异化护城河（如特定群体、特定流派、特定语言）。

---

## 第三部分：国内竞品 & 用户痛点

### 3.1 国内现有产品（5 个）

| 产品 | 平台 | 定位 | 现状 |
|---|---|---|---|
| **Dreamoo** | iOS + Android（[App Store](https://apps.apple.com/us/app/dreamoo-%E6%A2%A6%E5%A2%83%E7%A4%BE%E4%BA%A4-%E8%AE%B0%E6%A2%A6-%E7%BB%98%E6%A2%A6-%E8%A7%A3%E6%A2%A6-%E7%9D%A1%E7%9C%A0/id6680185717)） | 梦境社交 + AI 解梦 + AI 绘梦 + 睡眠手表数据 | 00 后开发者孙东来；**Build in Public 小红书首月 3000 种子用户**；小红书独立开发者大赛"最佳 00 后开发者"50 万奖金；[腾讯新闻](https://news.qq.com/rain/a/20250416A08BZ400) |
| **Dreamore AI** | Web + App | 弗洛伊德/周公/湿婆/科学派四流派；社区；心理治疗师对话 | 5 位海外华人联创（前 Tinder/Uber/TikTok/Databricks/高盛/Nauto）；上线一周破 1 万用户（50% 美国+30% 中国）；未融资；[36 氪](https://36kr.com/p/2315737488928001) |
| **奇妙梦境** | iOS | 弗洛伊德 + 荣格学派，1 对 1 释梦；游戏化"月光"积分 | 2018 转社交失败已基本停摆，作为先驱案例参考；[简书](https://www.jianshu.com/p/ad3b3e861744) |
| **周公解梦免费** | 安卓 | 词条查询（人物/爱情/物品 9 大分类） | 词典工具，无 AI，长尾流量 |
| **有梦记** | 安卓 | 文本 + 画图记录 + 手势密码 + 解梦词条 | 工具型，无 AI 投入 |
| **梦境日记**（cn.dreamjournal.app） | 跨平台 | 心理学启发分析 + 情绪标签 | 小众工具，定位非常符合"心理日记"合规框架 |

**关键观察**：**国内 AI 解梦真正"火过"的只有 Dreamoo 和 Pillowtalk（美国）**，且 Dreamoo 主要靠小红书自然流量，未公布付费转化数据。这个赛道**国内最强玩家也才 3-5 千种子用户级别**。

### 3.2 用户真实痛点（小红书 / 知乎 / 豆瓣 8 条原话摘录）

聚类后的用户表达：

1. **"经常做梦都很清晰真实怎么回事？"**（知乎高赞问题，反映"梦境真实感"困惑）— [知乎](https://www.zhihu.com/question/567227218)

2. **"经常梦到失控说明我很焦虑吗？"**（直接表达"梦境 = 心理状态"的关联焦虑）— [知乎](https://www.zhihu.com/question/652121658)

3. **"焦虑症为什么会导致梦境异常呀？"**（潜意识+焦虑双重诉求）— [知乎](https://www.zhihu.com/question/15641981575)

4. **"反复做同一个梦，说明梦者在心理上有一个没有获得解决的问题，心理学的名词叫'情结'"**（知乎热门回答，反映用户主动学习心理学动机）— [知乎专栏](https://zhuanlan.zhihu.com/p/640120097)

5. **"我的梦境很真实，还可以主宰自己的梦，这是怎么回事？"**（澎湃用户来稿，lucid dream 关注）— [澎湃](https://www.thepaper.cn/newsDetail_forward_28515171)

6. **"年轻人将塔罗占卜视为'心理安慰和情感出口'，而非真正算命"**（知乎多篇）— 强调**情感支撑** > 命运预测

7. **"我经常做奇怪的梦想知道什么意思"**（小红书评论高频；不便引用原文，但搜索"做梦"小红书有大量类似笔记，参见[小红书 AI 项目报道](https://news.qq.com/rain/a/20250416A08BZ400)中描述）

8. **"很多人会把梦记下来当作一种自我观察"**（极客公园对 Dreamoo 评价）— 印证**记录+反思**而非**预测吉凶**是真实需求

**山东大学心理健康中心专题**：「AI 解梦，年轻人的新玄学」明确指出年轻人主要将其作为**精神慰藉与自我探索工具**，符合马斯洛自我实现需求（[山大心理咨询中心](https://xljk.sdu.edu.cn/info/1008/9838.htm)）。

**总结**：用户**真实需求是「心理状态自我观察 + 情感出口」**，不是"占卜未来"。这恰恰为合规变体提供了产品锚点。

---

## 第四部分：综合分析

### 4.1 ASO 关键词矩阵

**国内（避开监管红线）**：

| 优先级 | 关键词 | 备注 |
|---|---|---|
| 高 | 梦境日记 / 梦境记录 / 心情日记 / 睡眠日记 | 安全词，已有同类 App |
| 高 | 心理日记 / 情绪日记 / 心理健康 | 走"心理工具"赛道 |
| 中 | 弗洛伊德 / 荣格 / 心理学 | 内容标签，合规 |
| 中 | 潜意识 / 自我觉察 / 心灵成长 | 长尾流量 |
| ⚠️ 禁用 | **解梦 / 算命 / 占卜 / 周公解梦 / 运势 / 命理 / 星座** | 监管红线，直接被驳回 |

**海外（充分使用）**：

| 优先级 | 关键词 | 搜索热度 |
|---|---|---|
| 高 | dream journal / dream diary / dream tracker | 主流量入口 |
| 高 | AI dream interpretation / dream analysis | AI 加成词 |
| 高 | lucid dreaming / lucid dream tracker | 高客单细分群体 |
| 中 | Freudian / Jungian dream analysis | 学派标签 |
| 中 | sleep journal / sleep tracker | 旁路流量 |
| 中 | dream meaning / dream symbols | 长尾 |

### 4.2 6 月预期 MRR 估算（双发组合）

**国内（按合规变体「梦境心理学日记」，微信小程序 + 安卓）**：

| 档位 | 6 月 MRR | 关键假设 |
|---|---|---|
| 保守 | **¥1,000–2,000** | 小红书自然流量 1-2K MAU，付费转化 1-2% × ¥18 |
| 中性 | **¥3,000–6,000** | 小红书+知乎+B 站投入 + 5K MAU，付费转化 2% |
| 乐观 | **¥10,000–15,000** | 出现单条爆款笔记带来 20K+ MAU，付费转化 3% |

**注**：永久 ¥98 价格点可加成 + 但合规风险下，建议**慢启动避免规模化暴露**。

**海外（iOS + Android + Web，英语为主）**：

| 档位 | 6 月 MRR | 关键假设 |
|---|---|---|
| 保守 | **$200–500** | 红海博弈，1K MAU，转化 1-2% × $9.99 |
| 中性 | **$800–1,500** | 找到差异化（中文文化梦境符号 / 特定流派 / 多语言）|
| 乐观 | **$3,000–6,000** | TikTok / Reddit 一次小爆，5-10K MAU + 海外 ASO 选准长尾词 |

**对照基准**：Elsewhere 估算 ARR ~$50K-150K 是头部之一；个人 1-2 周开发的新进入者 6 月内极难突破 $1K MRR。

### 4.3 关键洞察 & 风险提示

#### 洞察 1：合规变体的产品形态决定生死

不要做"AI 解梦器"，要做"心理学梦境日记本"。
- ✅ **作为日记功能**：记录 / 标签 / 情绪滑块 / 时间线统计
- ✅ **作为心理学科普**：梦中符号的多流派解读（弗/荣 知识库）
- ✅ **作为反思工具**：AI 提出**反思性问题**（不给定论）
- ❌ **不要**输出"你的梦预示着 XX 将发生"任何命运判断
- ❌ **不要**做"今日运势 / 吉凶预测"

#### 洞察 2：国内"AI 解梦"是流量爆款，但不是付费爆款

- Dreamoo 小红书首月 3000 种子，**未公开付费数据**
- Pillowtalk 上线两天 3.4 万下载（美国为主），订阅 $12.9–112，**实际付费率未公布**
- 山大心理咨询中心定性：年轻人把它当"玄学情绪出口"——**愿意试用，不太愿意持续付费**
- 主要竞品 Elsewhere 4.99/月，Google Play 仅 5,800 总下载——印证**赛道天花板低**

#### 洞察 3：海外完全饱和，国内是合规博弈

| 维度 | 国内 | 海外 |
|---|---|---|
| 合规 | 高风险（监管+下架） | 低风险（4.3 spam 但已上架者免疫） |
| 竞品密度 | 中等（Dreamoo / Dreamore 是仅有头部） | 极高（Elsewhere / Oniri / DreamApp / Awoken / Pillowtalk + 数十款） |
| 付费意愿 | 低（¥18 是合理上限） | 中（$4.99-9.99 是甜区，但用户已被教育低价） |
| ASO 入口 | 受关键词限制 | 红海，新进入者难突破前 50 |
| 单产品 6m MRR 上限估计 | ¥10K-15K | $3K-6K（=¥21-42K）|

#### 风险 1：合规下架成本

**国内**：开发投入 1-2 周 + ¥18/月 × 现有付费用户 = 财务损失 < ¥5K，但**封号会损失全部用户和品牌**。
**海外**：Apple/Google 拒审或下架成本 = 失去 App + 长期账号风险（重复违规可移除开发者账户）。
**关键**：定位坚守"心理日记 / wellness journal"框架可避免大部分风险。

#### 风险 2：内容质量 = 用户 churn 关键

用户对"套话式 AI 解梦"耐受度极低（Oniri 用户吐槽"paywall everywhere"的根源是觉得不值）。要做出差异化必须：
- 接入更强模型（成本上升）
- 心理学专家提示词工程
- 真正可视化的长期统计

否则 churn 30%/月起步。

#### 风险 3：国内 AI 监管持续收紧

2025-12 网信办 AI 拟人化新规要求 AI 服务"标识身份 + 反沉迷 + 禁止情感操纵"。AI 解梦的对话化设计必须主动合规：
- AI 输出强制带"AI 生成、仅供参考"标识
- 连续使用 2 小时需触发反沉迷提醒
- 禁止"你应该 / 你必须"类导向话术

### 4.4 是否值得做？最终建议

**结论：可做，但不是"主推 idea"**。

| 项目 | 评分（1-5）|
|---|---|
| 合规通过概率（国内变体） | 3.5（有条件可行）|
| 6 月内做到 ¥5K MRR 概率 | 2 |
| 6 月内做到 $1K MRR（海外）概率 | 2 |
| 开发难度 | 2（GPT API + 模板化 prompt）|
| 维护成本 | 2（轻量）|
| 下架风险（国内）| 3.5（有风险但可控）|
| 矩阵适合度（30 App 模式）| **3.5** |

**最终判断**：
- 适合作为**矩阵中的"试水产品"**（1-2 周冲一版海外 + 小程序心理日记变体），但**不宜重投入**
- 真正想做心理健康类的，更建议做"**情绪日记 / 心情笔记 / 失眠改善**"，需求强、合规清晰、有定价空间
- 如果有海外发行能力（Pieter Levels 模式），可以以"**Dream Journal: AI for [niche]**"切窄场景（如 lucid dreamer / 心理学学生 / artist），单产品冲 $1-3K MRR 是可行的

**矩阵中的合理位置**：30 个产品中排第 15-20 位，**作为补位、不作为旗舰**。

---

## Sources（完整来源列表）

### 合规法规与官方文档
- [微信小程序运营规范](https://developers.weixin.qq.com/miniprogram/product/) - 条款 6.1.3 / 6.4.5 / 5.12.15
- [微信开放社区：算卜算运势、算命修改指引](https://developers.weixin.qq.com/community/develop/doc/000082c0f88640f4b490809316b009)
- [微信开放社区：免费算命、占卜算卦类的小程序可以通过审核吗？](https://developers.weixin.qq.com/community/develop/doc/000a44d7fe006840f859648095b400)
- [微信开放社区：现在八字排盘类的小程序审核标准是啥？](https://developers.weixin.qq.com/community/develop/doc/000ca275f788f0aa184d7726b51400)
- [微信开放社区：心理咨询小程序资质要求](https://developers.weixin.qq.com/community/develop/doc/00066272ca8880cdcbfa3325351800)
- [Apple App Store Review Guidelines（4.3 Spam）](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Developer Forums - App Rejection for Astrology App](https://developer.apple.com/forums/thread/737999)
- [iMore: Apple rejects developer's horoscope app](https://www.imore.com/apple-rejects-developers-horoscope-app-says-app-store-has-enough)
- [网信办：人工智能拟人化互动服务管理暂行办法（征求意见稿）](https://www.cac.gov.cn/2025-12/27/c_1768571207311996.htm)
- [专家解读 AI 拟人化新规](https://www.cac.gov.cn/2025-12/28/c_1768662848000498.htm)
- [中企百通：心理咨询服务平台资质要求](https://www.miibt.com/show-144-6555-1.html)

### 国内下架/整改案例
- [新浪财经：AI 陪伴擦边争议（Glow / X Her / 筑梦岛）](https://finance.sina.com.cn/wm/2025-06-22/doc-infaxaan4320733.shtml)
- [RTE 社区：AI 陪伴新规](https://www.cnblogs.com/rtedev/p/19424231)
- [证券时报：4 款 App 下架 78 款整改](https://www.stcn.com/article/detail/1533490.html)
- [安全内参：工信部通报 63 款侵害用户权益 App](https://www.secrss.com/articles/28127)
- [IT 之家：微信公众号封建迷信治理](https://www.ithome.com/0/642/520.htm)
- [简书：奇妙梦境的兴亡历程](https://www.jianshu.com/p/ad3b3e861744)
- [CSDN 公众号封建迷信规范](https://blog.csdn.net/l4120228/article/details/142636605)

### 海外竞品
- [Elsewhere App Store 页面](https://apps.apple.com/us/app/elsewhere-dream-journal/id6445864345)
- [Elsewhere AppBrain Google Play 数据](https://www.appbrain.com/app/elsewhere-dream-journal/to.elsewhere)
- [Medium: Best dream journal apps of 2025 by Elsewhere](https://medium.com/@elsewheredreams/best-dream-journal-apps-of-2025-fb7f800371b8)
- [Kelly Bulkeley: Why the Elsewhere Dream Journaling App Is the Best](https://bulkeley.org/why-the-elsewhere-dream-journaling-app-is-the-best/)
- [Oniri 官网](https://www.oniri.io/) / [Oniri AI Dream Analysis](https://www.oniri.io/dream-analysis)
- [Oniri App Store](https://apps.apple.com/us/app/oniri-your-dream-journal/id968737914)
- [DreamWell App Store](https://apps.apple.com/us/app/dreamwell-lucid-dreaming/id1560429014)
- [Awoken Google Play](https://play.google.com/store/apps/details?id=com.lucid_dreaming.awoken)
- [Pillow Talk - Jason Lu 介绍](https://www.jasonqlu.com/home/dream-interpreter)
- [Pillowtalk - 官网](https://pillowtalk.kognii.com/) / [App Store](https://apps.apple.com/us/app/pillowtalk-voice-journal/id6484401671)
- [DreamStream: Best Dream Apps 2026 比较](https://dreamstream.art/blog/best-dream-apps-2026/)
- [Chitta: Best Dream Interpretation Apps 2026 对比](https://usechitta.com/articles/best-dream-interpretation-apps)
- [Dreamly: Top 5 Dream Interpretation Apps 2025](https://www.dreamly-app.com/top-5-dream-interpretation-apps-2025/)

### 国内竞品
- [Dreamoo App Store 页面](https://apps.apple.com/us/app/dreamoo-%E6%A2%A6%E5%A2%83%E7%A4%BE%E4%BA%A4-%E8%AE%B0%E6%A2%A6-%E7%BB%98%E6%A2%A6-%E8%A7%A3%E6%A2%A6-%E7%9D%A1%E7%9C%A0/id6680185717)
- [腾讯新闻：小红书 50 万奖金 AI 项目（含 Dreamoo）](https://news.qq.com/rain/a/20250416A08BZ400)
- [极客公园：小红书 AI 孵化器（Dreamoo 创始人采访）](https://www.geekpark.net/news/362541)
- [36 氪：Dreamore AI 解梦赋能精神疗愈](https://36kr.com/p/2315737488928001)
- [搜狐：AI 解梦 App 火爆上线 1 天 3 万用户（Pillowtalk）](https://www.sohu.com/a/881252629_121956424)
- [周公解梦免费 - 小米应用商店](https://app.mi.com/details?id=com.smallyin.oneiromancy)
- [应用宝：梦境日记 App](https://sj.qq.com/appdetail/cn.dreamjournal.app)
- [应用宝：八度幻想（梦境社区）](https://sj.qq.com/appdetail/com.eightfantasy.eightfantasy)

### 用户痛点 / 心理学背景
- [知乎：有哪些记录梦的网站或 app？](https://www.zhihu.com/question/52373687)
- [知乎：经常梦到失控说明我很焦虑吗？](https://www.zhihu.com/question/652121658)
- [知乎：焦虑症为什么会导致梦境异常？](https://www.zhihu.com/question/15641981575)
- [知乎：经常做梦都很清晰真实怎么回事？](https://www.zhihu.com/question/567227218)
- [知乎专栏：关于梦境的 20 种心理学解析](https://zhuanlan.zhihu.com/p/387720376)
- [知乎专栏：9 个常见的梦及其含义](https://zhuanlan.zhihu.com/p/640120097)
- [澎湃：网友梦境可以主宰自己的梦](https://www.thepaper.cn/newsDetail_forward_28515171)
- [山东大学心理咨询中心：AI 解梦年轻人的新玄学](https://xljk.sdu.edu.cn/info/1008/9838.htm)
- [豆瓣：梦的解析（弗洛伊德）](https://book.douban.com/subject/26823033/)
- [豆瓣：荣格解梦书](https://book.douban.com/subject/1825701/)

### 行业分析 / 监管
- [新浪：年营收千万美元 AI 情感陪伴是最大谎言](https://finance.sina.com.cn/tech/roll/2025-07-14/doc-inffmawt6690025.shtml)
- [OFweek：25 款 AI 应用集体猝死的三条血泪教训](https://www.ofweek.com/ai/2026-01/ART-201700-8420-30678567.html)
- [36 氪：AI 陪伴生意的合规困局](https://36kr.com/p/3521421957782665)
- [Quora: App rejected by App Store due to 4.3 Spam fortune telling](https://www.quora.com/My-app-got-rejected-by-the-App-Store-due-to-4-3-Spam-primary-function-of-fortune-telling-What-should-I-do-next-to-surpass-the-review)
- [Apptopia](https://apptopia.com/) / [Sensor Tower](https://sensortower.com/) - 数据估算工具参考

---

*本报告基于 30+ 次 WebSearch / WebFetch，重点交叉验证微信官方条款、Apple Guideline 原文、国内外真实下架案例和现有竞品数据。所有具体数字（如 Elsewhere ARR、Dreamoo 用户数）来自公开报道；超出公开范围处明确标注"估算"或"未公开"。*
