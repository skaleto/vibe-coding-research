# 轻应用广度扩充 · 18 个全新场景簇（3 轮并发研究）

**调研日期**：2026-05-30
**定位**：在 `06-scenario-expansion-2026.md` 之上**继续开拓全新领域**——本目录前序文档完全没碰过的平台/形态/人群/变现模型。
**方法**：3 轮并发工作流，每轮 6 个 general-purpose agent（共 18 个），多轮 WebSearch+WebFetch，逐条标证据强度。
**硬约束**：运行时零/极低 AI 成本 + 一次性买断/license/低价解锁 + 个人 1-2 周可 ship；分发是真壁垒，诚实区分"小钱生意"vs"真有空间"。
**证据分级**：A=官方/支付验证/并购；B=媒体/Latka/IndieHackers/Sensor Tower；C=创始人自报/社区；D=匿名/仅产品页。

> ⚠️ 贯穿 18 份报告的最强共识：**技术与运行成本都不是壁垒，分发是。** 且"高 star/高装机 ≠ 收入"反复出现（fzf 70k★、Uptime Kuma 70k★、ShareX 18 年，全是纯赞助小钱）。收入数据严重幂律分布，头部样本（Sensor Tower/创始人自报）有幸存者偏差，不要当预期锚点。

---

# 第 1 轮 · 新平台与形态

## 1.1 CLI / 终端 / TUI 工具
**定性**：能赚钱但天花板诚实——纯本地确定性 CLI 基本是 **$0.5–5K MRR 的精品买断生意**（imapsync/PHPStan Pro/Sublime 量级）；唯一大空间在 AI 终端（Warp $16M ARR）但必须烧云，绕开的唯一办法是 **BYOK 转嫁成本**。无应用商店，靠 Homebrew/npm/cargo + GitHub star + HN 冷启动，转化率低到 ~1%。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| imapsync | IMAP 邮箱迁移 | 92k 用户/年、付费占 1%≈900 买家/年，€72 买断(B/D [site](https://imapsync.lamiral.info/)) | 买断+支持费 |
| PHPStan Pro | PHP 静态分析 Web UI | core 13.9k★，Pro €7/月，**CLI 内置支付跳转 license**(A [blog](https://phpstan.org/blog/introducing-phpstan-pro)) | 开源+订阅 |
| HTTPie | API 测试 | $550K 累计/5 年/5 人自举(B [Latka](https://getlatka.com/companies/httpie.io/vs/rowy.io)) | freemium |
| Sublime Merge | Git GUI | $99 永久 license，HQ 仅 3 人(B/A [site](https://www.sublimemerge.com/)) | 买断 |
| Warp | AI 终端 | **$16M ARR，每 10 天+$1M**(B [Latka](https://getlatka.com/companies/warp.dev)) | 订阅(反例·烧云) |
| Charm/Crush | TUI + AI agent | BYOK 免费(D [charm.sh](https://charm.sh/)) | **BYOK 把 AI 成本转给用户(符合约束)** |

**点子**：① **「license-key-in-CLI」变现脚手架**卖给做 CLI 的开发者($49 买断)；② 确定性**本地数据/日志 TUI 分析器**(巨型 CSV/JSONL，隐私卖点，$39-79)；③ **BYOK 的 AI 终端工具**(接用户自己 key/本地 Ollama，自己只收 license)；④ **离线合规/隐私迁移 CLI**(imapsync 模式复刻到新领域)。

## 1.2 单一用途 Micro-API 产品
**定性**：能赚中等钱（头部个人 $5K-22K MRR），确定性 API（截图/HTML转PDF/IP地理/校验）运行无 LLM、毛利 60-90%；但冷启动以**季度/年计**（靠 SEO 长尾复利），**绝不碰"每次调 LLM"的**（成本随量线性烧）。

| 产品 | 痛点 | 收入(证据级+URL) | 运行时AI |
|---|---|---|---|
| ScreenshotOne | 网页截图 API | $13K→$37.4K MRR(B [Latka](https://getlatka.com/companies/screenshotone/vs/apiflash)) | 零 |
| PDFShift | HTML→PDF | $8.5K MRR(B [Superframeworks](https://superframeworks.com/blog/pdfshift)) | 零 |
| IPinfo | IP→地理/ASN | $3.7M 营收(B [Latka](https://getlatka.com/companies/ipinfo.io)) | 零(查本地库) |
| Screenshotapi | 截图 | $550 MRR 时被并购 $23K(A/B) | 零 |
| Restpack | 截图+PDF | 2021 退出 ~$500K(A) | 零 |

**点子**：① **文档锚定的确定性数据提取 API**(固定版式发票/账单→JSON，规则版非 LLM)；② **合规/格式校验组合 API**(IBAN/VAT/电话/地址，查官方数据集，churn 极低)；③ **设计资产生成 API**(OG image/证书 PDF/二维码海报，模板渲染)；④ **面向 AI agent 的 x402 可计费工具端点**(MCP/微支付，2026 新需求)。

## 1.3 Self-hosted / Docker / Homelab 付费工具
**定性**：变现机制对个人最友好（用户自托管=开发者运行成本≈0）。**真正赚钱全是"卖云托管/省运维"**（Plausible $1M ARR、Ghost $7.2M、Papermark $45K MRR），靠纯 license/赞助是小钱（Uptime Kuma 70k★ 仅捐赠）。冷启动有现成漏斗：`awesome-selfhosted`(296k★)/`r/selfhosted`(758k)/HN/selfh.st，但免费→付费转化常 <1-3%。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Plausible | 隐私分析(GA替代) | $1M ARR，7000+付费(B [blog](https://plausible.io/blog/open-source-saas)) | 云托管版 |
| Papermark | DocSend替代 | ~$45K MRR(B [StarterStory](https://www.starterstory.com/papermark-breakdown)) | 云SaaS+开源引流 |
| Postiz | 社媒排期 | ~$14K→$17K MRR，**单人**(C [IH](https://www.indiehackers.com/post/i-did-it-my-open-source-company-now-makes-14-2k-monthly-as-a-single-developer-f2fec088a4)) | 云版订阅 |
| Cloudron | 自托管面板 | Pro €15/月，**source-available+订阅 license**(A [pricing](https://www.cloudron.io/pricing.html)) | license |
| Immich | 自托管相册 | license $25个人/$100 server，**自愿"良心徽章"不锁功能**(A [discussion](https://github.com/immich-app/immich/discussions/11186)) | 自愿 license |
| Uptime Kuma | 自托管监控 | 70k★ **纯捐赠**(A [OpenCollective](https://opencollective.com/uptime-kuma)) | 捐赠(反例) |

**点子**：① 自托管 **license/付费墙服务器**(给 indie 用的 Keygen 极简版)；② Uptime Kuma 周边的**企业级状态页+告警排班**付费插件(填它放弃的商业化真空)；③ Homelab **备份+一键灾难恢复**工具(容器栈级 DR)；④ 给 indie 的**「企业自托管版」打包器**(离线 license+安全分发，把分发壁垒做成产品)。

## 1.4 Google Workspace Marketplace (Gmail/Docs/Drive add-ons)
**定性**：indie 友好的真壁垒分发渠道（内嵌 30 亿用户工作流），Apps Script 让一人 1-2 周 ship 确定性 add-on。**隐性税=OAuth 验证 + CASA 年度安全审计 $500-4500（用 restricted scope 时）**；规避法=只用 `drive.file`/non-sensitive scope。无原生订阅计费，靠 Stripe/license 自管。商店内搜索 SEO 是头号渠道但大词被巨头垄断。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| YAMM(Talarian) | Gmail 群发 | 母公司 $3.1M(B [Latka](https://getlatka.com/companies/talarian.io))，17M+安装 | 订阅 |
| Notion2Sheets | Notion↔Sheets 同步 | **$9K MRR/400+付费，单人0员工0营销**(C [StarterStory](https://www.starterstory.com/stories/sync2sheets-give-notion-the-superpowers-of-google-sheets)) | 订阅 |
| BudgetSheet | 银行→预算表 | $1.6K MRR/2年(C [IH](https://www.indiehackers.com/post/how-i-built-a-google-sheets-extension-making-1-6k-mrr-b42d845e6a)) | freemium |
| cloudHQ | Gmail 碎片刚需(65+扩展) | ~$140K/月、14万付费(C/B) | freemium，每月上 2-4 个新扩展 |

**点子**：① Sheets-only **确定性发票/收据 PDF 生成器**(只用 current-doc scope 免 CASA)；② Gmail **团队共享回复模板+变量片段**(无 AI)；③ Calendar **确定性 buffer/会议规则强制器**；④ 签名**活动 banner 轮播**窄缝(避开签名管理红海)。

## 1.5 Google Sheets / Excel (Office add-in) 插件市场
**定性**：少数"运行时可零云"的真生意。**纯本地确定性工具(Ablebits/ASAP/XLTools)清一色买断 $49-149 且活很多年**；连接器类(Supermetrics €50M ARR)有规模但要持续维护外部 API、个人难扛。Google Sheets 明显比 Excel/AppSource 友好(后者商店本身几乎不能直接变现，成熟玩家全走官网买断)。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Supermetrics | 170+营销源→表格 | €50M+ ARR(B [growthunhinged](https://www.growthunhinged.com/p/how-supermetrics-grew-to-50m-and)) | 订阅(极卷) |
| Sync2Sheets | Notion→Sheets | $9K MRR/400+付费(C [StarterStory](https://www.starterstory.com/stories/sync2sheets-give-notion-the-superpowers-of-google-sheets)) | 订阅 |
| Ablebits Ultimate Suite | Excel 70+确定性工具 | 150K+用户(C [site](https://www.ablebits.com/))，**买断 $99-149** | 买断 |
| ASAP Utilities | Excel 300+批量操作 | 长青(D)，**买断 $49** | 买断 |

**点子**：① Sheets **确定性数据清洗/去重套件**(只用 `drive.file` scope 绕 CASA)；② **单数据源垂直连接器**(避开通用连接器红海)；③ Excel **批量操作/模板化报表生成器**(AppSource 引流、官网卖买断)；④ 表格→**定时邮件/Slack 报表快照**工具。

## 1.6 Discord / Telegram / Slack 实用(非AI) bot
**定性**：Discord 纯功能 bot 多是 $1-10K MRR 小钱(被 MEE6/Dyno/Carl 挤压)；**真有空间的是"帮别人收钱"的工具**(Sublaunch 一人 $62K MRR/97% 净利)和 **Slack B2B 工具**(单价高、Marketplace 分发公平)。全簇运行时零 AI/零云，壁垒是分发(top.gg/官方 Directory/HN)。

| 产品 | 平台 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Sublaunch | TG/Discord 私域付费墙 | **$62K MRR/97%净利**(C [LinkedIn/StarterStory]) | 抽成+SaaS |
| Standuply | Slack 异步站会 | 峰值 **$80K/月**(B [IH](https://www.indiehackers.com/post/from-7k-to-80k-per-month-with-a-slack-app)) | $2-4/user/月 |
| Polly | Slack 投票 | **$9.7M ARR，20人**(B) | freemium |
| Abot | Slack 匿名消息 | 累计 $50K 利润/一人(C [pawelurbanek](https://pawelurbanek.com/anonymous-slack-bot-income)) | 分层订阅 |
| MEE6 | Discord 全家桶 | 21M+服务器，Premium $11.95/月(B/D) | per-server premium |

**点子**：① **Telegram 私域付费墙的垂直版**(交易/健身/考研群，自动踢过期成员，对标 Sublaunch 但更窄)；② Discord **服务器迁移/备份/角色快照**一次性买断 bot；③ Slack-first **确定性轮班/on-call 排班** bot(对标 Standuply，字节工程团队最懂)；④ **可验证公平的抽奖** bot(commit-reveal，crypto/电商带货社区)。

---

# 第 2 轮 · 未挖掘的垂直人群

## 2.1 教师/学生（避 K12 学科红线）
**定性**：真有空间的是"**高付费意愿窄人群(医学/资格考考生、特定学科教师) + 工具捆绑可售内容**"——FeedbackPanda 黄金范本(2 人/$55K MRR/**纯模板拼接零 AI**/七位数退出)。纯免费课堂小工具是流量生意非软件生意(Anki 单插件 15 万下载仅 191 付费 patron)。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| FeedbackPanda | 在线英语师写学生反馈 | $55K MRR/2 年七位数退出(B [theygotacquired](https://theygotacquired.com/saas/feedback-panda-acquired-by-sureswift-capital/)) | 订阅(零 AI 模板) |
| AnkiHub | 医学生协作卡组 | $5/月，服务 USMLE 大群(A [faq](https://www.ankihub.net/faq)) | 月订阅 |
| AnkiMobile | Anki iOS 端 | $24.99 买断养活全项目(A) | 买断 |
| Classroomscreen | 课堂多功能屏 | 200 万课堂，Pro $36/年(A) | 廉价订阅 |
| Twinkl | 教师资源(天花板参照) | £98.9M 营收(A/B) | 订阅 |
| TPT 头部卖家 | 卖教案/印刷品 | 平台累计返 $1.5B，2024 头部 ~$77 万(B [edsurge](https://www.edsurge.com/news/2022-11-28-why-did-we-stop-hearing-about-the-teachers-making-millions-on-teachers-pay-teachers)) | 数字商品 |

**点子**：① **资格考(CFA/CPA/PMP/AWS/NCLEX/JLPT)本地卡片+预制卡组买断包**(Anki 医学已垄断、其它考种空)；② **确定性练习册生成器**(数学/字帖/五线谱，零 AI 比 LLM 更准)；③ **评分 rubric+反馈短语库**本地确定性工具(FeedbackPanda 模式，AI 化浪潮反而让"离线+隐私+买断"成差异点)；④ 课堂工具做成**离线买断桌面 app**(讲台电脑常受网络限制)。

## 2.2 桌游/TTRPG/游戏爱好者
**定性**：高热情高付费但**被官方 IP 绞杀**——Gloomhaven Helper 服务 15 万用户却被 10% 抽成逼到下架。变现=买断$20-50+数字内容+薄订阅；运行几乎全是确定性(掷骰/算分/校验/地图)零云。最安全=**纯逻辑层+用户自带实体卡**或押注开放 SRD/开源系统。壁垒=在某个具体游戏社区被奉为事实标准(跨游戏无法迁移)。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Foundry VTT | 自托管 VTT | $50 买断永久，license YoY+22%(B/A [year-in-review](https://foundryvtt.com/article/year-in-review-2025/)) | 买断+模组生态 |
| Dungeon Alchemist | 3D 战斗地图 | **Kickstarter $1M+**(A [techraptor](https://techraptor.net/tabletop/news/ai-powered-map-making-tool-dungeon-alchemist-hits-over-1-million-on-kickstarter)) | 买断 |
| Dungeondraft/Wonderdraft | 地图制作 | $30 买断单人维护多年(B/D) | 买断 |
| Moxfield | MTG 卡组校验 | 事实标准，$3-5/月薄订阅(B/D) | 免费+订阅+卡价分佣 |
| D&D Beyond | 官方工具(天花板) | 被 Hasbro **$146.3M 收购**(A) | 订阅 |
| Gloomhaven Helper | 桌游状态追踪 | 15万用户，**被 IP 方 10% 抽成逼死**(B/C) | 死于授权(反例) |

**点子**：① 某重数值桌游(Frosthaven/Oathsworn)的**非侵权纯逻辑 Companion**(只做规则/计时/状态，不嵌美术)；② speedrun **战绩自动追踪+可分享卡片**(本地 OCR，LiveSplit 只解决计时)；③ 新兴 TCG(SW Unlimited/Lorcana/One Piece)的**离线卡组构建器**(首发 6 月抢事实标准)；④ GM **本地化随机内容+战役笔记**(对标 Perchance 但买断离线)。

## 2.3 健身/健康/Quantified-Self（本地零云）
**定性**：训练日志/HealthKit 可视化真有空间，纯本地 SQLite 零 AI。但**头部"月入"是 Sensor Tower 估算的毛收入，扣 30% 抽成后净利低很多**；单人新进者真实分布是 Habit Pixel 的 $1K MRR 量级。隐私(数据不出设备)是差异化卖点。规避医疗合规(只做记录/计算，不给建议)。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Hevy | 极简训练日志 | 估 ~$400-600K/月毛收(B [SensorTower](https://app.sensortower.com/overview/1458862350?country=US)) | freemium |
| Streaks | 习惯打卡 | 估 ~$480K/月，**买断 $4.99**(B [rev.now](https://rev.now/app/ios/streaks-34692/)) | 买断 |
| Gentler Streak | HealthKit"善意"可视化 | 2 年 $1M 营收/$400K 利润，lifetime $139.99(B [ideausher](https://ideausher.com/blog/wellness-tracking-app-like-gentler-streak/)) | 订阅+lifetime |
| FoodNoms | 隐私优先卡路里 | 单人 indie 持续维护(C [site](https://foodnoms.com/)) | 订阅 |
| Habit Pixel | 像素风习惯(新进者真实样本) | 8 月 $1K MRR/341 订阅(C [IH](https://www.indiehackers.com/post/from-0-to-1k-mrr-in-8-months-bootstrapping-habit-pixel-as-a-solo-dev-684b6c056d)) | 订阅 |

**点子**：① **HealthKit 年度/周期复盘可视化器**(长周期对比，纯读+画图，Gentler Streak 是直接 proof)；② **特定训练流派(GZCL/5/3/1/nSuns)确定性 progression 计算器+记录**；③ **隐私优先本地食物库**(打包 USDA FDC，全文检索零 AI)；④ **极简组间计时+训练量统计** Apple Watch 独立 app。

## 2.4 音乐人/音频爱好者
**定性**：买断变现最现实落点是**谱面/和弦阅读器(forScore 80 万下载)和扒歌工作台(Anytune)**，缝在"买断对抗订阅+隐私本地"。调音器/节拍器红海(除非极独特角度)。DAW utility 几乎全免费打赏文化，真正赚钱的是**预设/模板数字商品**(被低估真空间)。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| forScore | iPad 谱面阅读器 | 80 万+下载，个人开发者(B [about](https://forscore.co/about-music/)) | 买断+可选 Pro |
| Sononym | 采样相似度管理 | **$99 永久授权**(B [purchase](https://www.sononym.net/purchase/)) | 买断 |
| JustinGuitar Note Trainer | 指板记音 | 用户赞"**$2 终身无订阅**"(C [AppStore](https://apps.apple.com/us/app/guitar-fretboard-note-trainer/id559758702)) | $2 买断 |
| ADSR Sample Manager | 采样管理 | KVR 838 收藏，**评分仅 3.14**(头部体验差=缝)(B [KVR](https://www.kvraudio.com/product/adsr-sample-manager-by-adsr)) | 低价 |
| LivePlayRock 预设 | QuadCortex/Helix 调音 | 1500+ patch，数千吉他手用(D [site](https://liveplayrock.com/)) | 预设包买断 |

**点子**：① 乐队现场 **Nashville Number/和弦图阅读器+蓝牙踏板翻页**(OnSong 转订阅惹怒老用户=机会)；② 桌面**扒歌工作台**(慢放+变调+循环，离线 DSP，隐私买断)；③ 采样库**本地索引+标签**轻量工具(避开音频相似度复杂度，ADSR 评分差就是缝)；④ **预设/模板批量生成+打包工具**(自己同时是 Gumroad 商家)。

## 2.5 作家/自出版
**定性**：少数"买断+零成本+高客单"被反复验证的垂直——**排版是金矿**(Vellum $249.99/2 人 10 年盈利、Atticus $147、Plottr 无融资 4 万用户)，但被 Vellum/Atticus 双寡头占主流小说场景。写作/大纲/世界观红海多订阅小钱。圈子封闭、口碑驱动(Kindlepreneur/Reedsy/r/selfpublishing/20BooksTo50K)，冷启动慢但忠诚度极高。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| Vellum | EPUB/print 排版 | 2 人 10 年盈利、事实标准，$249.99 买断(C [podcast](https://www.mindymcginnis.com/podcast/vellum)) | 买断 |
| Atticus | 跨平台排版 | Kindlepreneur 主推，$147 终身(A [site](https://www.atticus.io/)) | 买断 |
| Plottr | 可视化大纲 | **40,000+作家，无融资**，离线买断 $199(B [reedsy](https://reedsy.com/blog/guide/book-writing-software/plottr-review/)) | 买断/订阅 |
| Scrivener | 长稿写作 | 20+年标杆，$59.99 买断(A) | 买断 |

**点子**：① **EPUB3 固定版式排版工具**(菜谱/绘本/漫画/复杂非虚构，Vellum 的盲区)；② 出版前**本地写作分析/体检工具**(重复词/对话占比/节奏曲线，确定性非 LLM，隐私不上传手稿)；③ 系列书**世界观一致性本地数据库**(series bible，高产 litRPG/romance 作家)；④ **KDP/IngramSpark 上传前格式+元数据校验器**(纯规则，治"打样才发现出血错"焦虑)。

## 2.6 摄影师/设计师 prosumer
**定性**：卖预设对工程师是错配(壁垒是个人 IG/YouTube 受众)。工程师最佳切口=**确定性/离线/买断的 culling/metadata/contact-sheet/打包窄工具**——Photo Mechanic($299 买断仍活)、AfterShoot($7.5M/端侧 AI)验证 prosumer 愿为"快+离线+隐私"付钱。冷启动靠摄影师社区+YouTube workflow。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| LRTimelapse | 延时去闪烁 | Pro €285 买断(A [buy](https://lrtimelapse.com/buy/)) | 买断 |
| Photo Mechanic | 极速选片/写版权 | 买断 $299(A [pricing](https://camerabits.freshdesk.com/support/solutions/articles/48001252734-photo-mechanic-pricing-and-information)) | 买断+订阅 |
| AfterShoot | 离线 AI 选片 | **$7.5M 年收入**(B [tracxn](https://tracxn.com/d/companies/aftershoot/__k88SRKheXqHtiz5BgkixpWtAl0wjeZTdsI4kaaBt9vw)) | 端侧 AI 订阅 |
| FilterGrade | 预设市场 | 平台 ~$30K/月(B [StarterStory](https://www.starterstory.com/marketplace-photo-filters-digital-assets-creatives)) | 抽佣 |
| Oliur | 个人卖预设 | 累计 $200K+(C [oliur](https://www.oliur.com/selling-lightroom-presets)) | 买断 |

**点子**：① 端侧**版权/IPTC 批量注入+C2PA 内容凭证**(ExifTool 傻瓜化，AI 时代确权新需求)；② 确定性**选片交付 contact-sheet PDF 生成器**(Photo Mechanic 太重太贵)；③ RAW 预设**跨平台打包+分发工具**(卖铲子给预设创作者，绕开"自己要有粉丝")；④ 一组照片**批量白平衡/色调一致性**对齐(参考帧确定性对齐)。

---

# 第 3 轮 · 变现模型与新兴 surface

## 3.1 多 App 组合 / SKU 工厂模型
**定性**：本质是"**分发套利+数量对冲**"不是产品胜利。组合层 $10-60K/mo 真实可达(Artemov $22K/30app、Seraleev $60K/mo)，但**单 app 中位收入≈0**(幂律，少数 app 扛 35-50% 收入)，维护需外包，**平台封号是归零级单点**(Seraleev 被 Apple 封 8 个月)。行业基线残酷：90% app 是僵尸、订阅头尾收入差从 200x 扩到 **400x**、Y1 人均 LTV 仅 **$23**(RevenueCat 2026)。对"零 runtime+买断"约束，**订阅 mobile 工厂反而不是最优 fit**(它要广告 SDK/订阅后端/客服)。

| 案例 | 收入(证据级+URL) | 关键 |
|---|---|---|
| Max Artemov(30 app) | $22K/mo，~$733/app 均值(C/B [IH](https://www.indiehackers.com/post/tech/from-failed-app-to-30-app-portfolio-making-22k-mo-in-less-than-a-year-myy3U7K9evxGOVOHti8s)) | ASO 选词+广告中介 |
| Seraleev(30+ app) | $60K/mo 净(B/C [IH](https://www.indiehackers.com/post/tech/building-an-app-portfolio-to-60k-mo-after-apple-froze-his-developer-account-LD7oNYzKSmWucRfKV1AO)) | 被 Apple 封号 8 月 |
| 行业基线 | 90% 僵尸、订阅头尾差 400x(B [RevenueCat](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/)) | 幂律+封号风险 |

**点子(把工厂化搬到买断本地工具)**：① 确定性**格式/协议转换器 license 矩阵**(共享 Rust/Go 内核+各平台薄壳)；② 开发者本地工具**同核多壳 SKU 工厂**(env diff/日志脱敏/API mock，team license)；③ 垂直**离线计算器/合规器 app 群**(ASO 选词法+买断)；④ **game-asset/创作素材生成快照包**(一次性生成、runtime 零，itch.io/Unity Asset Store)。

## 3.2 Micro-Acquisition 退出
**定性**：**真实但被高估**——"1-2 周 ship 然后卖掉发财"基本是幸存者偏差。估值锚定**利润倍数非代码**：个人能 ship 的 $1k-30k/年利润盘子在 Flippa 仅 **1.7-2x**，Acquire.com 有 MRR/留存的能到 4-5x。$1K MRR 工具现实退出价 ~$20K-60K(非改变人生)。**纯一次性买断无 MRR 的工具几乎卖不掉**。唯一真正绕过分发壁垒的玩法=**收购-改良-翻卖**。

| 案例 | 成交价(证据级+URL) | 倍数 |
|---|---|---|
| Acquire.com 平均 | 利润 **4.3x TTM**(A [报告](https://blog.acquire.com/acquire-biannual-acquisition-multiples-report-2024/)) | 全现金多 |
| Flippa $10-100K 盘 | 仅 **1.68x 利润**(A/B [M&A](https://flippa.com/blog/online-business-ma-analysis-on-flippa-navigating-the-new-digital-ma-landscape/)) | 越小倍数越低 |
| HN 扩展收购案 | 前主 2 年 $5K→新主 3 月 $18K(C [HN](https://news.ycombinator.com/item?id=46054788)) | buy-improve-flip |

**点子**：① 利基 **B2B 数据/告警 micro-SaaS**(低 AI 成本拿最高营收倍数)；② 单一痛点**订阅型浏览器扩展**(24-40x MRR)；③ 刻意为退出设计的**「可转移资产包」架构**(独立域名+自有 Stripe+无个人密钥依赖+运维 SOP，把 1.7x 拉到 4-5x)；④ **收购-改良-翻卖**(用工程力当 alpha，绕过冷启动；但小平台流动性极差)。

## 3.3 AppSumo / Lifetime Deal (LTD) 渠道
**定性**：对**纯本地/确定性/零云成本**工具，LTD 接近天作之合(LTD 唯一结构风险是"永久边际成本"，而你≈0，卖断即净现金)；对任何带服务器/AI 成本的产品是**把 10 年成本一次性贱卖的陷阱**(Heyzine 实测 1% 用户吃掉 50%+ 成本)。AppSumo 替你解决冷启动(200 万买家)，代价是 50-70% 抽成+高退款率(16%)+只给 1-2 周能见度。单产品单次净 **$30K-80K** 是常态，当引擎别当终局。

| 产品 | 收入(证据级+URL) | 运行成本 |
|---|---|---|
| Heyzine(PDF flipbook) | **$60K 净/15 月**，退款 16%，拿 ~75%(C [IH](https://www.indiehackers.com/post/what-i-learned-making-60k-on-appsumo-d14a3ff92a)) | 低(确定性) |
| Auto Affiliate Links(WP) | ~$30K/3 年长尾被动，拿 70%(C [IH](https://www.indiehackers.com/post/my-experience-with-appsumo-marketplace-d51801fe5e)) | 近零 |
| HeyReach | $190K/4 天，谈成 50/50(C [IH](https://www.indiehackers.com/post/how-we-made-200-000-in-sales-in-just-4-days-appsumo-launch-73c4a7732b)) | 高(席位·LTD当种子) |

**点子(均零成本买断型，天然适配 LTD)**：① 确定性**批量文档/媒体转换器**(WASM/本地)；② **WordPress/WooCommerce 本地插件**(零云、支持极轻、长尾被动)；③ **数据清洗/正则/CSV/JSON 开发者工具桌面版**；④ 端侧**一次性生成的模板/资产包+离线生成器**。

## 3.4 模板/数字商品平台（Framer/Webflow/Canva/Gumroad/UI8）
**定性**：对工程师 ROI 排序=**垂直 SaaS Boilerplate(客单最高$199-299+纯代码) > Framer 0% 抽成垂直模板 > 开发者向 UI Kit**。Framer **0% 抽成**+订阅返佣最划算；Webflow 95% 分成；Gumroad/Lemon Squeezy 不是流量平台是收单后端(LS 是 MoR 自动报税)。**中位现实惨淡**(Creative Market ~$465/月)，头部破百万是幸存者偏差，真壁垒是分发(头部都自带 audience)。

| 案例 | 平台 | 收入(证据级+URL) | 机制 |
|---|---|---|---|
| ShipFast(Marc Lou) | 自建+LS | 曾 $141K MRR，2025 全年 $1.03M(C/B [newsletter](https://newsletter.marclou.com/p/i-made-1-032-000-in-2025)) | 买断 $199-299 |
| Framer 创作者 | Framer | 单月 $36,735(C [recap](https://www.hxmzaehsan.com/blog/make-money-with-framer-templates)) | **0% 抽成**+返佣 |
| Webflow 头部 | Webflow | $3K-9K/月，一人 12 月破 $1M(B) | **95% 给创作者** |
| Katya Varbanova | Etsy(Canva) | ~3 年 $1.4M(C) | Canva 模板 |
| Nicky Laatz | Creative Market | 首个破 $1M 创作者(字体)(B) | 50/50 |

**点子**：① **垂直 SaaS Boilerplate**(AI 语音 Agent/Chrome 扩展+后端/出海多币种税务，非通用)；② Framer/Webflow **细分行业落地页模板包**(AI 工具/牙医/跨境/文档站，0% 抽成)；③ 开发者向 **Tailwind/shadcn UI Kit**(Figma+可复制 React 代码双交付，设计师做不了)；④ 确定性**预设/资产批量生成器**(脚本产 100 变体人工精选)。

## 3.5 2026 新兴 Surface 窗口期
**定性**：**真窗口期=MCP(尤其本地 stdio server)**——协议成事实标准 + 目录爆发(1.6 万+ server)+ 商业化基础设施真空，个人零云确定性 server + 外部 license 买断。**ChatGPT Apps 是巨流量(8 亿周活)但变现未通**(只外部结账、无分成、须 remote)，只适合占坑引流。**AI 浏览器(Comet/Atlas)无新分发红利**(复用 Chrome)。**Raycast 仍不能 store 内收钱**。**visionOS 装机量瓶颈**(独立开发者 17 app 三月仅 $4K)，不建议押注。

| Surface | 收入/规模(证据级+URL) | 个人机会 |
|---|---|---|
| MCP 目录 | Glama 21,000+ server、PulseMCP 16,330+(B [stats](https://www.digitalapplied.com/blog/mcp-adoption-statistics-2026-model-context-protocol)) | **真窗口·本地 stdio+外部 license** |
| ChatGPT Apps | 8 亿周活，**无收入分成、仅外部结账**(A [monetization](https://developers.openai.com/apps-sdk/build/monetization)) | 占坑引流漏斗 |
| Raycast | 2000+扩展，**store 无付费**，Pro $8/月(A [pricing](https://www.raycast.com/pricing)) | 引流非直接卖 |
| visionOS | 独立者 17 app 三月 $4K(B/C [CNBC](https://www.cnbc.com/2025/02/21/apples-vision-pro-has-a-problem-a-year-into-existence-too-few-apps.html)) | 不建议押注 |

**点子**：① **本地 stdio MCP server 卖一次性 license**(给 Claude Desktop/Cursor，做本地代码库语义索引/本地数据集 query/git 历史问答，推理用宿主模型=你零云成本)；② ChatGPT App **免费占坑+外部 license 解锁**引流漏斗；③ **垂直确定性 MCP 工具包**(发票校验/行业法规换算，规则资产+本地执行)；④ Raycast 扩展**免费引流+官网买断 Pro**。

## 3.6 极窄 boring B2B 行业工具
**定性**：能赚中等钱、天然适合零 AI 本地化(确定性 CRUD+PDF+提醒)，但分发是真壁垒。这些客户不上 PH/Twitter，只信**行业 Facebook 群/同行口碑/展会/Google "[trade]+software" SEO**，冷启动慢但 **churn 极低**(换软件=迁移全部客户历史)。$15-49/月订阅主流，桌面端买断仍可行。慢热高粘性小钱到中钱生意。

| 产品 | 痛点 | 收入(证据级+URL) | 变现 |
|---|---|---|---|
| DoggieDashboard | 犬舍/美容/疫苗记录 | ~$9K MRR，周 10 小时(C，官网 $40/月 A [site](https://doggiedashboard.com/)) | 订阅 |
| MassageBook | 按摩师排班+SOAP | ~$4.7M 年收/25 人(B [Growjo](https://growjo.com/company/MassageBook)) | $20-30/月 |
| Contractor Estimate & Invoice | 承包商离线估价发票 | App Store 长青(D)，**一次性买断** | 买断 |
| NotaryGadget | 公证员记账/里程/报税 | 运营 10+ 年，tens of thousands users(C/D [site](https://www.notarygadget.com/)) | 低价订阅 |

**点子**：① 单工种**现场出单离线 app**(电工/水管工，地下室无信号也能报价签字，买断 $39-59)；② trade 专属**合规台账/巡检记录**(消防年检/HACCP 温度/电气测试证书，法规倒逼=强刚需、字段固定零 AI——**最契合约束**)；③ "**从 Excel/纸质迁移**"为卖点的极轻排班+提醒(狗美容/理发/小诊所)；④ 单行业**对账+报税导出**记账(IFTA 里程税/司机/农场，复刻 NotaryGadget)。

---

# 横向总判断（广度收口）

把 18 簇放在一起，几条贯穿性结论：

1. **"运行时零成本 × 买断"在多数新场景都成立**，但天花板分两层：纯本地确定性工具/CLI/插件多是 **$0.5-10K MRR 精品小钱生意**；要上 $10K+ 几乎都需要"卖云托管/省运维"(self-host)或多年 SEO 复利(micro-API)或被并购退出。
2. **分发是唯一壁垒，且每个生态有固定的、慢的、可识别的渠道**——没有任何一个是即时的：开发者(HN/Marketplace/掘金)、自托管(r/selfhosted/awesome 列表)、桌游(BGG/游戏 Discord)、作家(Kindlepreneur/20BooksTo50K)、boring B2B(行业 FB 群/展会/trade SEO)、移动定制(病毒短视频)。**先选你能直接触达社区的方向。**
3. **变现模型本身可以是杠杆**：AppSumo LTD 对零成本买断是天作之合(单次净 $30-80K)；SKU 工厂用数量对冲(但封号风险)；micro-acquisition 退出真实但被高估(buy-improve-flip 才是绕过分发的真捷径)；Framer 0% 抽成是模板里对工程师最划算的。
4. **2026 真正的早期窗口是 MCP 本地 server**(协议成标准+目录爆发+商业化真空)——这是唯一一个"新 surface 红利"且天然零云、天然契合字节工程师。

## 给字节工程师的广度优先级（结合 06 文档第一梯队）

| 档 | 方向 | 为什么 |
|---|---|---|
| 🥇 | **MCP 本地 stdio server + 外部 license**(3.5①) | 2026 唯一新 surface 红利，零云，你最懂的工具场景，目录分发现成 |
| 🥇 | **垂直 SaaS Boilerplate**(3.4①) + **JetBrains/VSCode 重型插件**(06) | 客单最高、纯代码、运行零成本、你的工程深度是护城河 |
| 🥈 | **self-host open-core 卖云托管/license**(1.3) | 个人可达 $500K-7M ARR 上限的少数方向(Plausible/Papermark)，但要做托管才有天花板 |
| 🥈 | **确定性工具 + AppSumo LTD 首发**(3.3) | 零成本买断 + LTD 解决冷启动 + 单次 $30-80K 现金 |
| 🥉 | **boring B2B 合规台账**(3.6②) / **资格考卡组包**(2.1①) / **健身 HealthKit 复盘**(2.3①) | 各有明确社区分发 + 真付费人群，但天花板偏小钱，适合先验证分发能力 |

**不建议**：visionOS、AI 浏览器扩展(无红利)、Raycast/Obsidian 直接变现(无原生支付)、纯免费课堂/调音器红海、纯一次性买断指望退出(卖不掉)。

---

*本文整合自 3 轮并发工作流共 18 个 research agent，累计 51 万 token、270+ 次 WebSearch/WebFetch。所有收入按 A/B/C/D 降权，头部数据有幸存者偏差，引用务必看证据级。横向优先级为基于全部数据的当前时点判断。深度向拆解见同期 `07-deep-dive-rounds.md`。*
