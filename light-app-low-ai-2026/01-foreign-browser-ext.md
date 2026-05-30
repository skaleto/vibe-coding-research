# 国外浏览器插件：开发用 AI、运行时零/低 AI、一次性买断的轻应用机会

> 调研时间：2026-05　|　范围：Chrome / Edge / Firefox 插件生态（欧美为主）
> 目标：为个人开发者找"vibe coding 快速开发 + 运行时纯本地逻辑（零/极低 API 成本）+ 一次性买断/低成本变现 + 有真实付费数据"的机会
> 证据强度标注：【官方】＝官方店/官网披露；【创始人自报】＝Indie Hackers/HN/博客作者本人；【第三方估算】＝Latka/chrome-stats/媒体推算；找不到则写"未公开"

---

## 一、核心结论先讲

浏览器插件是"开发省力 + 运行零成本"甜点的**天然温床**：绝大多数实用插件的运行时逻辑是**纯本地 JS**（操作 DOM、读 storage、生成 URL、本地处理图片/CSV），完全不需要在用户每次使用时去调云 LLM。AI 只用在**开发阶段**（vibe coding 写代码），跑起来后服务器成本可以接近于零。

但要注意一个 2020 年的结构性变化：**Google 已在 2020-2021 年彻底关闭 Chrome Web Store 内置付费**（详见第四节）。今天所有付费插件都靠**第三方收款**（ExtensionPay / Gumroad license key / 自建 Stripe + license server）。这反而对个人开发者更友好——可以自由设计一次性买断价。

下面 11 个案例，按"运行时是否纯本地 + 变现是否轻量"排序，越靠前越贴合需求。

---

## 二、案例库（11 个，含运行时 AI 判断）

### 1. GoFullPage — 整页截图（甜点标杆）
- **链接**：Chrome Web Store `chromewebstore.google.com/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl`；官网 gofullpage.com
- **痛点/用户**：一键截整个网页（含滚动区域），再裁剪/标注。面向所有需要存档网页、做文档、做设计参考的人。
- **数据**：Chrome 端 **900 万+ 用户**【官方/媒体】；年收入约 **$120,000（2023）**【第三方估算，来源 Latka，BoringCashCow 转载】；早期 2021 年另有 "$10k/mo、400 万用户" 的口径【第三方，ExtensionPay 文章】。两个口径冲突，取"6 位数年收入 + 近千万装机"为可信区间。
- **变现**：freemium，**Premium 仅 $1/月**（也有年付）。基础截图永久免费，付费解锁编辑/标注。
- **运行时 AI**：**纯本地**。截图、拼接、裁剪全在浏览器里用 canvas 完成，零 API 成本。
- **可行性**：标杆但天花板已被它占住。启示价值＞抄袭价值——证明"两个人 + 纯本地工具"可做到 6 位数年收入。

### 2. CSS Scan — 悬停查看/复制任意元素 CSS（一次性买断典范）
- **链接**：getcss.io（Indie Hackers product/css-scan）
- **痛点/用户**：鼠标悬停即看到任意元素完整 CSS，一键复制。面向前端、设计师。
- **数据**：累计 **$100,000+ 收入**【创始人自报，Guilherme Rizzo，IH AMA 2020】；IH product 页当前显示约 **$4k/月**【创始人自报，近况】。Product Hunt 两次发布分别 754 / 1917 票。
- **变现**：**一次性买断 $69**（lifetime）。这是最纯粹的"买断小工具"样本。
- **运行时 AI**：**纯本地**。读取 DOM computed style，零后端。
- **可行性**：⭐ 高度可抄的模式（垂直开发者工具 + 一次性买断 + PH/YouTube 冷启动）。难度中（要处理各种 CSS 边界情况）。

### 3. Spider — 可视化点选网页爬虫（一次性买断 + 病毒冷启动）
- **链接**：spider.amie-chen.com；Chrome Store `hhblpocflefpmmfibmajdfcjdkeafpen`
- **痛点/用户**：点选页面元素即可抓数据导出 JSON/表格，无需写代码。面向运营、研究、非技术人员。
- **数据**：上线 **2 个月 $10k+ 收入**【创始人自报，Amie Chen，IH】；上 HN 首页后流量从 53 → 12,000 用户、300+ 试用注册【创始人自报】。
- **变现**：**一次性 $38**（Spider Pro）。
- **运行时 AI**：**纯本地**。DOM 选择器 + 本地数据导出，零后端。
- **可行性**：⭐ 极贴合需求。一人开发、纯本地、买断、HN/PH 冷启动可复制。

### 4. Smart Form Filler — 表单自动填充（★ vibe-coded + 纯本地的活样本）
- **链接**：LogRocket 博客作者 vibe-code 案例（已上架 Chrome Store）
- **痛点/用户**：求职时反复填同样的姓名/邮箱/经历表单，用 CSV 智能匹配字段（"First Name" vs "Name" 也能对上）。
- **数据**：未公开收入（个人小项目，作者侧重演示）。**traction 信号**：作者实测 30+ 种表单后上架。
- **变现**：可做 freemium / 一次性解锁（典型表单类做法）。
- **运行时 AI**：**纯本地**，客户端 CSV 处理，**明确零云调用**。
- **可行性**：⭐⭐ 本报告最贴主题的样本——**用 Cursor（Figma 出图→生成 UI→增量写逻辑）vibe-code 出来，运行时纯本地**。证明"AI 开发 + 零成本运行"的甜点真实可做、门槛低。

### 5. Night Eye — 全网深色模式（lifetime + 隐私卖点）
- **链接**：nighteye.app；Edge/Firefox/Chrome 全平台
- **痛点/用户**：给任意网站加高质量深色模式（带亮度/对比/饱和度调节、本地缓存加速）。面向夜间用户、护眼需求。
- **数据**：收入未公开；**traction**：全平台上架 + 长期登上 StackSocial / XDA / BleepingComputer 等多家 lifetime deal 渠道【官方/媒体】。
- **变现**：免费版（Night Eye Lite）+ 订阅 + **lifetime 买断**。明确宣传"不监控、不存储浏览数据、无广告"。
- **运行时 AI**：**纯本地**。CSS 注入 + 颜色反转算法 + 本地缓存，零后端、零 AI。
- **可行性**：高需求长青品类，但竞争激烈（Dark Reader 等免费强敌）。差异化靠"质量 + 隐私 + lifetime"。

### 6. OneTab — 一键收起所有标签省内存（纯本地、千万级）
- **链接**：one-tab.com；Chrome Store
- **痛点/用户**：把上百个标签一键收进列表，释放内存。面向重度多标签用户。
- **数据**：装机量数百万级（同类 Session Buddy 报 **100 万用户、4.7 分**【官方】）；OneTab 收入未公开（基本免费/捐赠模式）。
- **变现**：主要免费。**列为对照**：说明纯本地工具就算不强变现也能做到巨大装机——若加一次性买断 Pro 功能即有空间。
- **运行时 AI**：**纯本地**，零后端。
- **可行性**：品类已饱和，但"标签/书签管理 + 一次性 Pro"仍有细分缝隙。

### 7. Easy Folders — 给 ChatGPT/Claude 加文件夹（混合：本地为主 + 轻云同步）
- **链接**：easyfolders.io；Chrome Store `gdocioajfidpnaejbgmbnkflgmppibfe`
- **痛点/用户**：把 AI 聊天记录整理进文件夹/子文件夹、搜索、存提示词。面向 ChatGPT/Claude 重度用户。
- **数据**：上线 6 个月 **$42,000+ 累计、$3,700+ MRR**【创始人自报，IH】；自述"唯一持续成本是 Mailgun 发登录邮件"——印证近零运行成本。
- **变现**：freemium，**$9/月订阅 + lifetime 买断**。
- **运行时 AI**：**几乎纯本地**——文件夹/搜索在本地 DOM + storage 完成；**不调 LLM**。仅付费用户的跨设备同步走云（轻量、非 AI）。
- **可行性**：⭐ 极佳样本。骑在大平台（ChatGPT）流量上做"组织增强"，运行不烧 AI 钱。寄生平台是有效冷启动。

### 8. Keepa — 亚马逊比价/价格历史（对照：有后端但非 LLM）
- **链接**：keepa.com；Chrome Store `neebplgakaahbhdphmkckjjcegoiijjo`
- **痛点/用户**：在亚马逊商品页显示历史价格曲线、降价提醒。面向网购党、FBA 卖家。
- **数据**：**Chrome 400 万+ 用户、4.7 分**【官方/媒体】，追踪近 60 亿商品。
- **变现**：freemium，Keepa Pro **€29/月** + API（€49 起）；免费层靠**联盟佣金**。
- **运行时 AI**：**无 LLM**，但**有重后端**（自建价格抓取/存储基础设施，成本不低）。
- **可行性**：作为对照——价格追踪的"价值"在数据库不在前端，个人难复制全网级，但可做**单一站点的轻量价追 + 买断**。

### 9. Tango — 自动生成图文操作指南（对照：已转重 SaaS + 加了云 AI）
- **链接**：tango.ai；Chrome Store `lggdbpblkekjjbobadliahffoaobaknh`
- **痛点/用户**：录制点击流程，自动生成带截图的 step-by-step 教程。面向培训、客服、SOP 文档。
- **数据**：上线 8 个月 **10 万用户**（2021-2022）【媒体/官方】。
- **变现**：freemium，Pro **$16–24/席/月**（已是团队 SaaS）。
- **运行时 AI**：起步是**纯本地截图捕捉**（甜点），但现已加云 AI 写步骤说明并走订阅。
- **可行性**：启示——"录屏/截图捕捉"内核纯本地，**早期就是零成本工具**；个人版可只做本地捕捉 + 一次性买断，不碰云 AI。

### 10. Awesome Screenshot — 截图 + 录屏（freemium 量大）
- **链接**：awesomescreenshot.com；Chrome/Edge
- **痛点/用户**：网页截图、标注、录屏。通用刚需。
- **数据**：**200–300 万用户**【官方/媒体】，最高评分截图工具之一。
- **变现**：freemium，Basic $2 / Pro $6 月（含云存储分享）；收入未公开。
- **运行时 AI**：截图/录屏**纯本地**；只有"云端存储/分享"用后端（非 AI，可选）。
- **可行性**：品类拥挤，纯做截图天花板被 GoFullPage/它占住，需找细分（如特定平台、特定输出格式）。

### 11. EasyGen — AI 写 LinkedIn 帖（★反例：运行时持续烧 AI 钱）
- **链接**：easygen.io；IH 报道 $9K MRR
- **痛点/用户**：一键生成 LinkedIn 帖文。
- **数据**：**$9K MRR**【创始人自报/媒体，IH】；靠 3 个 WhatsApp 群（995 人）免费内测冷启动。
- **变现**：订阅（因为成本是变动的）。
- **运行时 AI**：**每次使用都调云 LLM** → 必须订阅覆盖 token 成本。
- **可行性**：**正是要避开的模型**。列在此处作为强对照：能赚钱，但运行时持续烧钱、被迫订阅、利润被 API 吃掉——与本调研目标相反。

---

## 三、横向洞察（给个人开发者的可操作结论）

1. **"运行时纯本地"在插件里是常态而非例外。** 上面 1–7、10 的核心功能全部是浏览器内 JS：canvas 处理图片（截图）、读 computed style（CSS Scan）、DOM 选择器（Spider）、CSS 注入（Night Eye）、storage + DOM（Easy Folders/OneTab）。这些**每次使用的边际成本 ≈ 0**。AI 只出现在你写代码的那 1–2 周。

2. **甜点公式 = 寄生大平台流量 + 纯本地"组织/增强"功能 + 一次性买断或低价 lifetime。** Easy Folders（骑 ChatGPT）和 CSS Scan / Spider（骑开发者刚需）是最可复制的三个模板。

3. **一次性买断的真实可行性已被验证**：CSS Scan $69 累计 $100k+、Spider $38 两月 $10k——价格点落在 **$29–$69** 区间，配合 Product Hunt（CSS Scan 两次发布）、Hacker News（Spider 上首页起飞）、YouTube、Lifetime-deal FB 群冷启动。

4. **vibe coding 已被实证用于产出纯本地插件**：Smart Form Filler 用 Cursor（Figma 出图 → AI 生成 UI → 增量写逻辑）做出，运行时零云调用。2025–2026 多篇报道指出 Cursor/Claude Code/Lovable/v0 把"能用的插件 MVP"压缩到**数天**——1–2 周 ship 一个买断小工具完全现实。

5. **要主动避开 EasyGen 式陷阱**：凡是"每次点击都生成内容/做推理"的功能，必然持续调云 LLM、被迫订阅、利润被 token 吃掉。若一定要 AI 功能，优先考虑**一次性处理**（用户付费后跑一批就结束）或**本地小模型 / 规则引擎**替代。

6. **天花板与冷启动现实**：截图、深色模式、标签管理等大品类已有近千万级老玩家把住，**别正面硬刚**；机会在**新平台寄生**（如新出的 AI 产品周边）、**垂直细分**（特定网站的价追/填表/导出）、**特定输出格式**。冷启动主战场是 PH + HN + 相关社群（WhatsApp/FB/Discord），SEO 是长尾。

---

## 四、Chrome Web Store 付费机制现状（2026）

**背景：内置付费已死。** Google 于 2020-09-21 宣布弃用 Chrome Web Store Payments API，分阶段关停：2020-09 起不能再建新付费插件/内购；2020-12-01 关闭免费试用与 "Try Now"；**2021-02-01 起所有内购/付费交易彻底停止**（仅保留查询旧 license）。理由：支付生态已成熟，第三方方案足够多。【官方 + The Register / XDA 媒体】

**今天开发者怎么收费（三条主流路径）：**

| 方案 | 机制 | 费用 | 适合 |
|---|---|---|---|
| **ExtensionPay (extensionpay.com)** | 专为插件做的收款 SDK，几行代码接入；支持月/季/年/**一次性买断**、免费试用、freemium。资金直进开发者自己的 Stripe。 | 平台费约 **5%** + Stripe ~2.9%；无月费、无前期成本 | 想最快上线、不想自建 license server 的个人开发者。**首选** |
| **Gumroad + license key** | 用 Gumroad 卖授权，生成/校验 license key，插件里用 Gumroad API 验证后存进 chrome.storage | Gumroad 抽成（约 10%）；需自己处理 hosting | 已有 Gumroad 店、做一次性买断、想顺带外包税务 |
| **自建 Stripe + 自建 license 校验** | 完全自己做收款页 + license 服务器 | 仅 Stripe ~2.9% | 量大、想省平台费、有后端能力 |

**佐证数据**：ExtensionPay 累计已为插件开发者处理 **$500k+**（2023-03 时约 $175k）【创始人 Glen Chiacchieri 自报】；其自身在 IH 显示约 $220/月【创始人自报，注：仅约 5% 抽成口径，不代表流水】。市场上还出现 Addon Pay 等同类（同样 ~5% 抽成）。

**估值参考（若日后想卖掉）**：变现型插件普遍按 **24–40× MRR** 成交；50K+ 活跃用户的免费插件约 $10k–$80k，$2k–$10k MRR 的变现插件约 $60k–$300k。MV3 合规比 MV2 溢价约 15%。【exitbid.io 行业指南】——注意：一次性买断收入不计入 MRR，估值时不如订阅好看，但**现金流前置、无运营负担**，更适合个人。

---

## 五、给本项目的落地建议（一句话）

照着 **CSS Scan / Spider / Easy Folders** 的模板：选一个**寄生大平台或开发者刚需**的、**运行时纯本地**的"组织/增强/导出"小功能，用 **Cursor/Claude Code 1–2 周 vibe-code** 出来，用 **ExtensionPay 接 $29–$69 一次性买断**，PH + HN + 垂直社群冷启动。坚决避开 EasyGen 式"每次点击都调 LLM"的订阅陷阱。

---

## Sources（按引用顺序，含证据强度）

1. ExtensionPay — 《8 Chrome Extensions with Impressive Revenue (by Indie Developers)》 https://extensionpay.com/articles/browser-extensions-make-money 【第三方汇编，含多家收入数】
2. BoringCashCow — 《Browser Extension for Taking Screenshots Generates $120,000 a Year》(GoFullPage / Latka) https://boringcashcow.com/view/browser-extension-for-taking-screenshots-generates-120000-a-year 【第三方估算，源 Latka】
3. GoFullPage 官网 Premium 页 https://gofullpage.com/premium 【官方，$1/月定价】
4. GoFullPage Chrome Web Store https://chromewebstore.google.com/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl 【官方，装机/评分】
5. Indie Hackers — CSS Scan revenue 页 https://www.indiehackers.com/product/css-scan/revenue 【创始人自报】
6. Indie Hackers — 《I made over $100,000 with a browser extension (CSS Scan), AMA!》 https://www.indiehackers.com/post/i-made-over-100-000-with-a-browser-extension-css-scan-ama-04f2bde465 【创始人自报】
7. Indie Hackers — Spider《Over $10k total revenue in 2 months》 https://www.indiehackers.com/product/spider/over-10k-total-revenue-in-2-months--LrsyRc2-ZP27y3W8wVr 【创始人自报】
8. Spider 官网 https://spider.amie-chen.com/ 【官方】
9. LogRocket — 《How I vibe-coded 2 Chrome extensions that save me hours every week》(Smart Form Filler / X Trending Finder, Cursor, 纯本地) https://blog.logrocket.com/ux-design/vibe-coding-micro-apps/ 【作者自述，关键 vibe-coding + 纯本地证据】
10. Night Eye 官网与定价 https://nighteye.app/plans-and-pricing/ 【官方，lifetime + 隐私声明】
11. Indie Hackers — Easy Folders《6 months post-launch … $3,700+ MRR and $42,000+ total revenue》 https://www.indiehackers.com/product/easy-folders/6-months-post-launch-my-chrome-extension-has-hit-3-700-in-mrr-and-42-000-in-total-revenue--O3qs28VAnAkcJw0j--M 【创始人自报】
12. Easy Folders 官网 https://www.easyfolders.io/ 【官方】
13. Keepa Chrome Web Store https://chromewebstore.google.com/detail/keepa-amazon-price-tracke/neebplgakaahbhdphmkckjjcegoiijjo 【官方，装机/评分】
14. Brightdata — Best Amazon Price Trackers 2026（Keepa 用户数/定价） https://brightdata.com/blog/web-data/best-amazon-price-trackers 【媒体】
15. Tango — CanvasBusinessModel《How Tango Works》(10万用户/8个月、定价、商业模式) https://canvasbusinessmodel.com/blogs/how-it-works/tango-how-it-works 【第三方分析】
16. Tango Chrome Web Store https://chromewebstore.google.com/detail/tango-create-how-to-guide/lggdbpblkekjjbobadliahffoaobaknh 【官方】
17. Awesome Screenshot 官网/定价 https://www.awesomescreenshot.com/pricing 【官方】
18. Indie Hackers — 《This week in Micro SaaS — Chrome extension making $9K MRR》(EasyGen, 反例) https://www.indiehackers.com/post/this-week-in-micro-saas-chrome-extension-making-9k-mrr-and-more-ce34f97ab7 【创始人自报/媒体】
19. The Register — 《Chrome Web Store payments shutdown》 https://www.theregister.com/2020/09/23/google_sunsets_chrome_web_store/ 【媒体】
20. Chrome for Developers — Chrome Web Store payments deprecation（官方时间线） https://developer.chrome.com/docs/webstore/cws-payments-deprecation 【官方】
21. ExtensionPay 官网（5% 抽成、Stripe、买断/订阅模型） https://extensionpay.com/ 【官方】
22. Indie Hackers — ExtensionPay revenue 页（累计为开发者处理金额、自身 MRR 口径） https://www.indiehackers.com/product/extensionpay/revenue 【创始人自报】
23. UHD Ed — 《How to use Gumroad to receive payments for a Chrome Extension》(license key 方案) https://uhded.com/gumroad-payment-chrome-extension 【教程/媒体】
24. ExitBid — 《How to Sell a Chrome Extension in 2026 (24–40× MRR Valuation Guide)》 https://exitbid.io/blog/sell-chrome-extension 【行业分析】
25. Session Buddy / OneTab 等标签管理对比 https://supasidebar.com/blog/toby-vs-onetab-vs-supasidebar 【媒体，装机/评分】

> 数据诚信声明：所有金额/装机数均标注来源与证据强度；GoFullPage 存在 "$120k/yr (2023, Latka)" 与 "$10k/mo (2021, ExtensionPay)" 两个不一致口径，已在正文标明并取保守区间。未找到公开收入的（Night Eye、Awesome Screenshot、OneTab、Smart Form Filler）一律写"未公开"并给出 traction 信号，未编造任何数字。
