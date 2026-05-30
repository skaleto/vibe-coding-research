# 国外 Mac 桌面工具 / Raycast / Setapp 生态：运行时零/低 AI 依赖、一次性买断轻应用机会

> 调研时间：2026-05 ｜ 视角：个人开发者用 vibe coding 做"运行时纯本地、不烧云 LLM、一次性买断/终身"的 Mac 轻应用
> 核心结论先说：**Mac 桌面工具是"运行时零云成本 + 一次性买断"最成熟的赛道之一**。窗口管理、剪贴板、菜单栏整理、截图标注这些"native 小工具"几乎全部纯本地运行，Mac 用户也最认"buy once"。但要清醒：**这类工具收入极少公开**（绝大多数是 bootstrapped 私有项目），证据多为间接代理指标（评分数、下载量、GitHub star、被收购）。Raycast 生态**目前不存在"卖付费扩展"的市场**，开发者唯一的官方变现是 Pro 订阅的推荐分成；Setapp 则是按使用比例分 70% 订阅池，适合做"补充收入"而非主收入。

---

## 一、总体格局：为什么 Mac 桌面工具适合"零云 + 买断"

三个结构性事实，决定了这条赛道天然契合需求：

1. **运行时纯本地是常态而非例外**。窗口管理（Rectangle/Magnet/Rectangle Pro）、剪贴板（Maccy/Paste）、菜单栏整理（Bartender）、文本扩展（PopClip）、启动器（Alfred）这些工具的核心逻辑都是调用 macOS 原生 API（AppKit/SwiftUI/Accessibility/NSPasteboard），**根本不需要联网，更不需要云 LLM**。运行时云成本 = 0。即便有"AI 功能"，主流做法也是把它做成可选项（Raycast 明确支持"在设置里完全关掉 AI"），不影响核心工具价值。

2. **Mac 用户最认"buy once"**。独立 Mac 开发者 Oskar Groth（Cindori/Sensei，年入约 30 万美元）在 Indie Hackers 的 AMA 中直言："桌面用户远比移动用户愿意付费"，$9.99 的定价对一个像样的工具是被接受的；他刻意绕开 Mac App Store（沙盒限制太多），改用自有网站 + Paddle 收单发 license（证据强度：中-高，开发者自述）。

3. **定价区间清晰**：菜单栏/窗口类小工具买断价普遍落在 **$2–$16**（Magnet $4.99–8、Maccy $9.99、Rectangle Pro $9.99、PopClip $9.99、Multitouch $15.99），截图/录屏这类"prosumer 内容工具"可以卖到 **$29 一次性 + 可选年费更新**（CleanShot X 模式），录屏精品（Screen Studio）甚至卖到 $89–229 一次性。

下面进入具体案例，按"窗口/菜单栏/剪贴板 → 截图录屏 → Raycast → Setapp"组织。

---

## 二、案例：窗口管理 / 菜单栏 / 剪贴板（纯本地标杆区）

### 1. Rectangle / Rectangle Pro（Ryan Hanson, rxhanson）
- 链接：https://rectangleapp.com/ ｜ Pro：https://rectangleapp.com/pro/ ｜ https://github.com/rxhanson/Rectangle
- **痛点 + 用户**：macOS 原生窗口贴边/分屏能力弱，开发者/重度多窗口用户需要键盘快捷键 + 拖拽贴边快速排布窗口。
- **用户量/收入**：Rectangle（免费开源）GitHub **约 29K star、900+ fork**（证据：GitHub，强）——这是极强的装机量代理指标，社区公认"必装"。Rectangle Pro（闭源增强版）**$9.99 一次性**。Hanson 一人维护一整条 Mac 工具线（Pro、Multitouch $15.99、Superkey $15.99、Hookshot、Middle $7.99、Scroll $9.99 等，**全部一次性买断**）。**具体收入未公开**（证据：无直接财务，靠 GitHub Sponsors + 买断；强度：低，仅能说"规模可观、全职在做"）。
- **变现**：免费开源引流 → Pro 买断 + 多 App 矩阵 + GitHub Sponsors。
- **运行时云 AI**：**零**。纯 Accessibility API 操作窗口，完全本地。
- **个人可行性**：★★★★★。这是个人开发者的最佳模板——"免费开源版做口碑 + 闭源 Pro/姊妹 App 收费 + 工具矩阵复利"，零运行时成本，纯 native。

### 2. Magnet（CrowdCafe）
- 链接：https://magnet.crowdcafe.com/ ｜ App Store：https://apps.apple.com/us/app/magnet/id441258766
- **痛点 + 用户**：同上，窗口贴边分屏；面向不想折腾、要"买了就能用"的普通 Mac 用户。
- **用户量/收入**：Mac App Store **约 13.4 万条评分、4.9 星**（证据：App Store，强）。长期稳居 Mac App Store **付费效率类第一、付费总榜前列**。一次性 **$4.99–8**（区域定价不同）。用 App Store 经验法则反推，13.4 万评分通常对应**数百万次下载量级**，是这条赛道最成功的纯买断小工具之一（收入需估算，强度：中——评分/榜单是硬指标，但绝对收入数字未公开）。
- **变现**：纯 Mac App Store 一次性买断，无订阅、无 DMG/Homebrew。
- **运行时云 AI**：**零**。纯本地。
- **个人可行性**：★★★★☆。证明"一个极聚焦的窗口工具 + App Store 自然流量"能跑出大规模。缺点是 App Store 抽成 30%、且功能已被竞品（含系统自带 Sequoia 贴边）和免费 Rectangle 夹击，**今天再做同质品很难**，需找差异化切口。

### 3. Maccy（Alexey Rodionov, p0deje）—— "开源转可选付费"教科书案例
- 链接：https://maccy.app/ ｜ https://github.com/p0deje/Maccy ｜ App Store：https://apps.apple.com/us/app/maccy/id1527619437
- **痛点 + 用户**：macOS 没有剪贴板历史；几乎所有重度用户都需要"复制过的东西能翻回来"。
- **用户量/收入**：GitHub **logged 超 100 万次下载**（证据：项目自述/GitHub，强）。MIT 开源、永久免费；同时在 **Mac App Store 上架 $9.99**，**付费版功能与免费版完全一致**——付费纯粹是"支持开发者"的捐赠式购买。**具体销售额未公开**（强度：低）。
- **变现**：免费开源 + Mac App Store 同功能"赞助式"$9.99 + 捐赠。
- **运行时云 AI**：**零**，且强调隐私（所有内容只存本地，密码管理器清除剪贴板时 Maccy 同步清除）。
- **个人可行性**：★★★★☆。说明"纯本地隐私小工具"靠开源口碑能积累百万级用户。但"同功能赞助式收费"变现天花板低，要赚钱需做成"免费基础版 + 付费 Pro 功能"的差异分层（见下方 Paste 反例的取舍）。

### 4. Paste（剪贴板，订阅化反例）
- 链接：https://pasteapp.io/ ｜ 定价：https://pasteapp.io/pricing
- **价值在于"反面教材"**：Paste 设计精良，但 2026 年已转为**纯订阅**（$3.99/月或 $29.99/年，$89.99 "终身"），并削减一次性购买选项，引发老用户大量不满，被评价为剪贴板工具定价"离谱"，用户外流到买断/免费替代品（证据：多篇 2026 测评，中）。
- **运行时云 AI**：核心仍本地，但默认 iCloud 同步引发隐私顾虑。
- **个人可行性启示**：剪贴板这类"工具属性"产品，用户对订阅极敏感；**一次性买断 + 可选低价升级**才是这条赛道的情绪安全区。Maccy/Paste 的对比，本身就是"买断 vs 订阅"的天然 A/B。

### 5. Bartender（菜单栏整理，"做成被收购"的退出案例）
- 链接：参考 9to5Mac/TidBITS 报道（2024-06）
- **痛点 + 用户**：菜单栏图标太多太乱，需要隐藏/折叠/重排。
- **用户量/收入**：长期是 Mac 菜单栏整理类**头部付费工具**（一次性买断），**2024 年被 Applause Group 收购**（证据：9to5Mac、TidBITS、MacRumors 多源，强）。原作者 Ben Surtees 自述："发布 Bartender 5 后，一个人已无法支撑全部用户支持与维护，需要一个专职团队"——侧面印证用户基数大到一个人扛不住。**收购金额未披露**（强度：中——收购事实强，金额无）。
- **变现**：一次性买断为主。
- **运行时云 AI**：**零**，纯本地菜单栏操作。
- **个人可行性**：★★★★☆。展示了 Mac 小工具的另一条变现路径——**做大后被收购退出**。也提醒：单人维护"全民级工具"会触到支持/维护的人力天花板。

### 6. PopClip / Alfred（成熟买断工具，提供定价锚点）
- 链接：https://www.popclip.app/ ｜ https://www.alfredapp.com/
- **PopClip**：选中文字弹出操作条（复制/搜索/翻译/几百个扩展），**$9.99 一次性**，纯本地。
- **Alfred + Powerpack**：启动器；免费版 + **Powerpack 一次性买断**解锁 workflow/剪贴板/snippet 等，被公认"macOS 上最值的一次性购买之一"，Mega Supporter license 给终身免费更新。
- **收入**：均未公开（强度：低）；价值在于**坐实了"$9.99 一次性 / Powerpack 买断 + 终身更新"是 Mac 工具被广泛接受的成熟定价模型**。
- **运行时云 AI**：核心**零依赖**（均为本地操作 + 可选扩展）。
- **个人可行性**：★★★★☆。"免费基础 + 一次性买断解锁高级功能 / 终身更新"是可直接照搬的定价结构。

---

## 三、案例：截图 / 录屏（prosumer，价更高、运行时仍基本本地）

### 7. CleanShot X（MakeWith / Luke Oslizlo + Paweł Magiera）—— 买断 + 可选云的混合标杆
- 链接：https://cleanshot.com/ ｜ 定价：https://cleanshot.com/pricing
- **痛点 + 用户**：系统截图太弱——需要标注、滚动截图、隐藏桌面图标、录屏转 GIF、带壁纸背景的窗口截图。面向内容创作者、自由职业者、与客户做可视化沟通的人。
- **用户量/收入**：2019 年创始人受访时"接近跨过 $100K"门槛（证据：BoringCashCow 引用早期采访，但**严重过时**）；此后多年高速增长，是该品类**最知名的 prosumer 截图工具**之一，但**精确 ARR/用户数未公开**（GetLatka/networthspot 等均无实数；强度：中——品牌地位与增长强，绝对数字弱）。
- **变现**：**混合模式**——**$29 一次性买断（含 1 年更新），之后可选 $19/年续更**；**CleanShot Cloud（云存储/团队）单独订阅**；同时上架 Setapp 拿订阅分成。创始人在 Setapp 案例中说"Setapp 带来稳定且持续增长的经常性收入"。
- **运行时云 AI**：**核心截图/标注/录屏全本地**；云存储是**可选**的，且是普通对象存储而非 LLM 调用——**没有"持续调云 LLM 烧钱"的问题**。
- **个人可行性**：★★★★☆。最值得照抄的商业模式：**核心功能买断（本地、零边际成本）+ 可选云作为增值订阅**，把"是否上云、谁付云钱"和核心价值解耦。个人完全可做截图/标注内核（纯本地），云功能等有规模再说。

### 8. Screen Studio（Adam Pietrasiak 等 3 人）—— 高客单买断 + buildinpublic
- 链接：https://screen.studio/
- **痛点 + 用户**：自动给屏幕录制加"丝滑放大/平移/光标动效/漂亮背景"，面向做产品演示、教程、营销视频的人。
- **用户量/收入**：2022 年起步，**9 个月做到 8,000 付费客户**；2023 年初某天单日收入 $3,467；Starter Story 记录其 **MRR 约 $30K** 阶段（证据：Starter Story + 创始人公开发推，中-高，但非最新）。此后被公认是 2024–2025 最受好评的 Mac 应用之一，规模远超上述早期数字（最新精确数字未公开）。
- **变现**：**一次性买断为主**（历史上约 $89–229 区间的 perpetual license + 更新），高客单。
- **运行时云 AI**：核心录制/渲染**本地完成**（Electron + 本地渲染），**无运行时云 LLM 依赖**。
- **个人可行性**：★★★☆☆。证明"高客单、纯本地、聚焦一个会让人惊艳的效果"的录屏工具能由小团队跑到可观规模。门槛：视频渲染/动效工程较重，不是最轻的 vibe coding 切口，但**商业模式（高价买断 + buildinpublic 获客）极具参考性**。

### 9. Xnapper（Tony Dinh）—— 极轻截图美化，单人小工具锚点
- 链接：https://xnapper.com/（Tony Dinh, @tdinh_me）
- **用户量/收入**：截图美化工具，早期 **MRR 约 $6,000**（证据：BoringCashCow 引用，中，偏旧）。
- **变现**：买断 + 订阅混合。**运行时云 AI**：核心美化本地（OCR/排版），无持续云 LLM 依赖。
- **个人可行性**：★★★★☆。**最贴近"vibe coding 轻应用"的体量**——功能极聚焦（把丑截图变好看），单人即可做，本地运行。是"小而美单点工具"的现实锚点。

---

## 四、Raycast 生态：真相是"没有付费扩展市场"

这是本次调研**最需要纠偏的认知**，请务必看清：

- **Raycast 公司体量**：2024-09 完成 **$30M 融资**（带 Pro/Teams 订阅，扩展到 Windows/iOS），**50 万+ 活跃用户**，**1,500+ 扩展、2 万+ 开发者贡献者**；估算年收入约 $5.2M（证据：TechCrunch、TechLila 汇总，中-高）。
- **关键事实：Raycast Store 里的第三方扩展目前没有"卖钱"机制。** 扩展提交到 Store 是免费分享给所有人；Raycast 的收入来自 **Pro 订阅**（$8–10/月，含 AI、无限剪贴板历史、云同步、自定义主题等），AI 是**可选**且可在设置里完全关闭。**不存在开发者向用户出售付费扩展、官方抽成分账的市场**（多源交叉确认；强度：高——多个独立来源都未发现付费扩展市场，且官方页面只讲免费提交）。
- **开发者唯一的官方变现**：**Pro 推荐分成——开发者带来的 Pro 付费用户，可拿 30% 佣金**（证据：2024-09 起的项目，来自搜索汇总；强度：中，建议以 Raycast 官方 developer/affiliate 页为准再核）。这意味着扩展开发者**赚的不是"扩展售价"，而是"把自己的用户导去订 Raycast Pro 的返佣"**。
- **运行时云 AI**：Raycast 平台的 AI 功能是云端的（需 Pro/Advanced AI 付费），**但这是 Raycast 自己在烧；做免费扩展的第三方开发者运行时零成本**——扩展跑在用户本机/用户自己的 API key 上。

**对个人开发者的结论（重要）**：
- **不要指望"在 Raycast Store 卖付费扩展赚钱"——这个商业模式当前不存在。**
- 可行玩法只有两种：① 做免费扩展刷存在感/引流到**自己站外的买断 App 或赞助**；② 参与 Pro 推荐返佣（天花板很低）。
- 个人可行性：作为**"独立买断 App 的获客/引流渠道"** ★★★☆☆；作为**"直接靠扩展变现"** ★☆☆☆☆。

---

## 五、Setapp 生态：按使用比例分 70% 订阅池，适合做"补充收入"

- 官方文档：https://docs.setapp.com/docs/distributing-revenue ｜ https://docs.setapp.com/docs/application-statistics ｜ 开发者入口：https://setapp.com/developers
- **分成机制（官方文档，强证据）**：
  - Setapp 把**每位用户月费的 70%** 分给"该用户当月实际用过的 App"的开发者；
  - 分配按**使用 + 价格档位（price tier）乘数****按比例**切分（不是按时长/打开次数，而是按"用了哪些 App + 各自档位乘数"）；
  - **若用户当月只用了你这一个 App，你拿走全部 70%**；用得越多人分，单 App 越摊薄；
  - 另有 **Partner Program：你带来的用户，其月费的 20% 固定归你**——所以"开发者份额 + 推荐份额"最高可达 **90%**；
  - 月初结算，提现门槛约 **$200**。
- **真实开发者反馈（间接但可信）**：
  - **TripMode**：Setapp 约占其整体收入的 **1/5**，作为 Mac App Store + 直销之外稳定的一块（证据：Setapp 案例引用，中）；
  - **CleanShot X**：自述 Setapp 带来"稳定且持续增长的经常性收入"，用户数持续涨（中）；
  - 早期数据分化很大：有的 App（ChronoSync Express）从 Setapp 拿到的增量 <1%，有的（TaskPaper）约占月收入 5%（证据：早期 TidBITS/Setapp 文档，中，偏旧）。
- **运行时云 AI**：与 Setapp 无关——上不上云取决于 App 本身；纯本地工具完全适配。
- **个人可行性**：★★★★☆（作为补充渠道）。**优点**：现成的付费用户池、被动经常性收入、不用自己处理收单/退款/盗版；**缺点**：① 收入是"分池"的，单个小工具很可能只拿到整体收入的几个百分点；② 需要先做出一个有差异化、能被高频使用的 App 才分得到肉；③ 不能替代主变现。**建议**：把 Setapp 当作"买断/直销之外的第二/第三条腿"，而不是主收入来源。

---

## 六、给个人开发者的可执行结论

1. **最值得照抄的模式 = CleanShot X / Rectangle 式"纯本地核心 + 一次性买断"**：核心功能调 macOS 原生 API、运行时零云成本、$9.99–29 买断（可选低价年费更新或可选云增值）。这是"怕烧云 LLM"诉求的最优解。
2. **变现结构优先级**：自有网站直销（Paddle/Lemon Squeezy 收单发 license，避开 App Store 30% 抽成与沙盒）为主 → Mac App Store 触达普通用户为辅 → Setapp 做补充经常性收入。Raycast 仅作免费引流。
3. **切口选择**：避开已被 Rectangle（免费开源）+ 系统自带挤压的窗口管理红海；优先找"系统做得烂 + 高频 + 纯本地可解 + 还没有免费开源霸主"的缝隙（截图/录屏美化、菜单栏/通知整理、文件/重命名批处理、特定工种的快捷工具）。Xnapper（单人截图美化）是最贴近 vibe coding 体量的现实锚点。
4. **订阅要克制**：Paste 的教训表明，"工具属性"产品强推订阅会激怒用户、催生买断替代品。把"可选云/同步"做成增值订阅、核心永远买断，是情绪安全区。
5. **证据强度的清醒认知**：本赛道**绝大多数收入数字不公开**（bootstrapped 私有），决策要靠 GitHub star、App Store 评分数/榜单、被收购、开发者公开自述等**代理指标**，不要被"具体 ARR"卡住——它们大概率查不到。

---

## Sources（含证据强度标注）

**Mac 工具 / 买断模式**
- Rectangle 官网与 Pro 定价 https://rectangleapp.com/ ｜ https://rectangleapp.com/pro/ （强：定价/开源事实）
- Rectangle GitHub（约 29K star） https://github.com/rxhanson/Rectangle （强：装机量代理）
- Ryan Hanson 开发者档案（全线一次性买断、无云 AI） https://mb.appaddict.app/2026/02/19/developer-spotlight-ryan-hanson.html ｜ https://ryanhanson.dev/ （中：产品线/模式；低：收入）
- Magnet 官网与 App Store（13.4 万评分、$4.99–8 买断） https://magnet.crowdcafe.com/ ｜ https://apps.apple.com/us/app/magnet/id441258766 （强：评分/榜单；中：收入估算）
- Maccy 官网/GitHub/App Store（100 万+ 下载、MIT、$9.99 同功能赞助式） https://maccy.app/ ｜ https://github.com/p0deje/Maccy ｜ https://apps.apple.com/us/app/maccy/id1527619437 （强：下载量/模式；低：收入）
- Paste 定价（订阅化争议） https://pasteapp.io/pricing （中：定价事实/用户情绪）
- Bartender 被 Applause Group 收购 https://9to5mac.com/2024/06/06/bartenders-developer-confirms-apps-acquisition/ ｜ https://tidbits.com/2024/06/05/bartender-developer-explains-and-apologizes-for-quiet-acquisition/ （强：收购事实；中：规模；无：金额）
- PopClip / Alfred Powerpack（一次性买断锚点） https://www.popclip.app/buy ｜ https://www.alfredapp.com/shop/ （强：定价；低：收入）
- Oskar Groth/Cindori 年入约 30 万、买断 + Paddle、绕开 App Store https://www.indiehackers.com/post/i-grew-my-revenue-to-300-000-as-a-solo-indie-mac-developer-ama-c200c97cfc （中-高：开发者自述）

**截图 / 录屏**
- CleanShot X 定价（$29 买断 + $19/年可选 + 云订阅） https://cleanshot.com/pricing （强：定价/混合模式）
- 截图工具 indie 收入综述（CleanShot 2019 接近 $100K、Xnapper MRR ~$6K、Screen Studio 早期数据） https://boringcashcow.com/showcase/indie-founders-make-boring-screen-capture-tools （中：早期数字，已过时）
- Screen Studio 增长拆解（9 个月 8000 客户、MRR ~$30K） https://www.starterstory.com/screen-studio-breakdown （中-高：含付费墙，部分可见）

**Raycast**
- Raycast 定价（Pro 订阅、AI 可关、无付费扩展市场） https://www.raycast.com/pricing （高：定价/无付费扩展）
- Raycast 开发者/扩展（免费提交，无售卖分账） https://www.raycast.com/developers ｜ https://www.raycast.com/developer-program （高：无付费市场）
- Raycast $30M 融资、50 万+ 用户 https://techcrunch.com/2024/09/25/raycast-raises-30m-to-bring-its-mac-productivity-app-to-windows-and-ios/ （中-高：融资/用户）
- Raycast 体量与增长汇总（~$5.2M 估算营收、1500+ 扩展、Pro 推荐 30% 返佣） https://www.techlila.com/raycast-company-growth-funding-and-market-share-statistics/ ｜ https://www.techlila.com/raycast-usage-statistics/ （中：第三方汇总；30% 返佣建议以官方再核）

**Setapp**
- Setapp 分成机制官方文档（70% 池 + 价格档位乘数 + 20% Partner，最高 90%） https://docs.setapp.com/docs/distributing-revenue （强：官方）
- Setapp 统计与结算（月初结算、~$200 门槛） https://docs.setapp.com/docs/application-statistics （强：官方）
- Setapp 开发者价值与案例（TripMode ~1/5 收入、CleanShot 经常性收入、早期 App 分化） https://appleinsider.com/articles/22/06/17/how-setapps-app-service-is-building-value-for-developers-and-users ｜ https://setapp.com/developers （中：案例引用）

**indie 收入横向参照**
- 最赚钱独立 App 榜（Bannerbear ~$50K/月达 $1M ARR、Slopes $1M ARR 等） https://mktclarity.com/blogs/news/indie-apps-top （中：第三方汇总）
