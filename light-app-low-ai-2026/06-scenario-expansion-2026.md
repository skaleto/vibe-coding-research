# 轻应用场景扩充 · 6 个新场景簇 + 案例库 + 可投入点子

**调研日期**：2026-05-30
**定位**：对本目录 `01~05` 与 `deep-dive/` 的**补充**，不重复已覆盖案例（GoFullPage / CSS Scan / Spider / Easy Folders / Rectangle / Maccy / CleanShot / Magnet / TrustJSON / EchoKey / 简历模板 / 补光灯 / 证件照等）。
**方法**：6 个并行 research agent，多轮 WebSearch+WebFetch，逐条标证据强度。
**硬约束（贯穿）**：运行时零/极低 AI 成本（纯本地逻辑 / 端侧确定性模型 / 一次性生成）+ 一次性买断或低价解锁 + 个人 1-2 周可 ship + 诚实标注分发现实。
**证据分级**：A=官方/支付验证/并购公告；B=媒体/Latka/IndieHackers 访谈/Sensor Tower；C=创始人自报/社区爆款；D=匿名传闻/仅产品页。

---

## 0. 三条贯穿全部新场景的硬结论（先看这个）

1. **分发是唯一壁垒，且对每个生态形态各异**——平台只给"曝光"不给"客户"，所有赚到钱的案例付费转化几乎都靠创始人自建受众（技术博客 / X / Product Hunt / 垂直社区 / 短视频）兜底。技术与运行成本都不是壁垒。
2. **"高 star / 高装机 ≠ 收入"反复出现**：ShareX(18 年)、Flow Launcher(13.9K star)、Ditto 全是"叫好不叫座"；真正赚钱的要么有**清晰商用授权墙**，要么**开源引流 + 终身买断**，要么**寄生大平台的细分缺口**。第一天就要想清楚"谁付费、为什么付费、怎么收"。
3. **政策利好校准（重要更新）**：现有研究里"微信小程序 iOS 虚拟支付总费率 ~17%"是旧口径。**2026-03-15 苹果新政生效后，iOS 小程序虚拟支付费率已降至 12%**（全部为苹果抽成，腾讯 5% 技术服务费 2026 已取消）。9.9/19.9 元买断扣 12% 后到手 8.7/17.5 元——iOS 一次性买断对个人开发者**首次成为合规光明路径**。证据 A：[微信开放社区费率调整通知](https://developers.weixin.qq.com/community/minihome/doc/000a04a261c0f0d5edc4972a96f401)。

---

## 一、开发者生态 / SaaS 插件市场（字节工程师匹配度最高）

### 一句话定性（按变现干净度）

| 生态 | 能赚钱？ | 变现机制 | 获客现实 |
|---|---|---|---|
| **JetBrains Marketplace** | **能，最干净** | 唯一原生支持付费插件的 IDE 市场，抽 15%（封顶 25%）；2025-01 新增**永久买断 license**（过去仅订阅） | 受众小但付费意愿极高；靠 Marketplace 搜索 + 专业窄缝 |
| **VS Code 扩展** | 能，但**赚钱的都靠平台外收款** | Marketplace 零原生支付；Pro 功能用 Lemon Squeezy/Gumroad license key 激活 | 装机量最大=漏斗顶，但收款转化靠自建受众；免费工具内卷 |
| **Shopify App Store** | **能，天花板最高（个人可 6 位数 MRR）** | 原生计费，**前 $1M 收入 0 抽成**，之后 15% | 最卷（11000+ app，每周新增 40-90 个）；靠新应用算法扶持窗口 + 细分 SEO + FB 社群外推 |
| **WordPress 插件** | 能（老牌现金牛，单插件可 $10k-100k+/mo） | freemium + Freemius；**无免费层直接收费反而 3-6 月回本**（freemium 需 12-18 月养） | wordpress.org 仓库=免费分发引擎；竞争比 Shopify 温和 |
| **Figma 插件** | 能（教育/资产类最好卖） | 原生支付 $2 起 + 抽 15%，但头部仍走 Gumroad 外部收款 | Community 是发现渠道，爆款靠 Product Hunt 当日第一 + 邮件预热 |
| **Obsidian / Raycast** | **基本不能当主业** | 均无原生支付市场；社区反硬付费、亲捐赠 | 只宜做**引流到付费 SaaS 的钩子**，不宜直接卖 |

### 案例库

| 产品 | 平台 | 痛点 | 收入（证据级+URL） | 运行时AI | 变现 |
|---|---|---|---|---|---|
| **Quokka.js / Wallaby.js / Console Ninja**（Artem Govorov 个人起家） | VS Code/JetBrains 等 | 编辑器内即时测试反馈 + inline playground | 首年即现金流为正，10000+ 企业含财富 500（B [infoq](https://www.infoq.com/articles/wallabyjs-quokkajs-js-productivity-interview/)） | 零（本地运行时分析） | 永久 license $50-100（Paddle），跨 IDE 通用 |
| **BashSupport Pro**（jansorg 个人） | JetBrains | Bash 脚本专业支持 | 96% 收入来自年订阅，73% 销售来自个人买家（C [plugin-dev](https://www.plugin-dev.com/intellij/general/marketplace-stats/)） | 零 | JetBrains 原生订阅插件 |
| **Figmaster**（Matt Wierzbicki，外包开发不写代码） | Figma | 交互式教 design system | 累计 **$33,000+**，预售 2 周 191 单（C [prototypr](https://blog.prototypr.io/how-i-made-over-33-000-on-the-figma-plugin-without-writing-a-single-line-of-code-9a5ca50f2cc8)） | 零 | Gumroad 买断 + Product Hunt #1 引流 |
| **FORSBERG+two**（Björn Forsberg 单人→小团队） | Shopify | 发票/打印/订单管理（5 个 app，3 个一次性付费） | 达 **$100k/mo**，年利润 ~$275k，服务 10 万+ 商家（B [justinjackson](https://justinjackson.ca/how-to-build-a-shopify-app)） | 零 | 一次性买断 + 订阅混合 |
| **Kaching Appz**（Erikas Mališauskas 个人） | Shopify | 捆绑销售/数量折扣转化类 | 首个 app $6.5k MRR 后 **$250k 出售**，新 app 6 位数 MRR（B [IH](https://www.indiehackers.com/post/tech/getting-out-of-the-freelancing-game-by-building-a-100k-mrr-shopify-app-portfolio-qdReVAgLjz6EpW4OrJSI)） | 零 | 订阅 |
| **Content Aware Sidebars**（Joachim Jensen 一人） | WordPress | 按条件显示侧边栏 | Freemius 官方背书单人成功故事（B/C [freemius](https://freemius.com/blog/wordpress-plugin-content-aware-sidebars/)） | 零 | freemium + Freemius license |
| Shopify 个人开发者基准 | Shopify | — | 均值 ~$93k/yr 但**中位数仅 $725/mo**，幂律分布（B [mktclarity](https://mktclarity.com/blogs/news/shopify-app-worth-it)） | — | — |

### 脑暴点子（★ = 字节工程师不公平优势最大）

- **★ A. JetBrains 永久买断的"专业语言/框架支持"插件**：选窄缝（Zig/Gleam/Mojo 支持、Terraform 高级重构、Protobuf/gRPC 导航，或内部 DSL/IaC/RPC 工具链）。纯本地语言分析零 AI 成本，用 2025 新上线的永久 license 卖 $30-60。冷启动靠 Marketplace 搜索 + 语言社区。**字节内部大量自研 DSL/IaC/RPC 工具链痛点你最懂，写 IntelliJ PSI 语言支持是硬核工程活=护城河。** 风险：单语言天花板低、JetBrains 可能官方内置。
- **★ B. VS Code 扩展 + Lemon Squeezy license 的"本地化重型工具"**：免费版引流（吃 Marketplace 曝光）+ Pro 用 license key 激活。做纯本地重计算工具（离线 SQL/正则 playground、本地 trace/profiling 可视化、monorepo 依赖图）。**用工程深度对抗免费内卷**。风险：免费工具内卷、Pro 转化低、需自建受众收款。
- **C. Shopify 一次性买断的"零 AI 运营小工具"组合**：做 2-3 个小而专纯业务逻辑 app（发票/打印模板、批量改价、订单标签自动化）。天花板最高 + 前 $100 万 0 抽成。风险：竞争最惨烈、中位数仅 $725/mo、必须找无强竞品窄缝。
- **D. Figma 的 design-to-code / token 工程化插件**：切设计师做不了、纯设计创作者做不深的工程缝隙，Gumroad 买断 + Product Hunt 打法（复制 Figmaster $33k 路径）。

---

## 二、Windows + 跨平台桌面工具（现有研究只覆盖 Mac，这是空白）

### 一句话定性

**能赚钱，但逻辑和 Mac 完全不同——靠"量 + 刚需 + 商用授权"，不靠"客单价 × 审美溢价"。**

- 付费意愿确实低于 Mac，但 Windows 装机量是 Mac 的 4-5 倍；**"个人免费 / 商用收费"是 Windows 独有的现金流结构**（Listary/Snipaste/XYplorer/Total Commander 全走这条路，赌公司 IT 合规采购）。
- 一次性买断仍是主流且被偏好；订阅在 Windows 工具圈口碑很差（Directory Opus 转订阅遭强烈反弹）。
- **政策利好（A 级）**：2025-06 起 Microsoft Store 个人开发者注册费全免，**非游戏应用可用自有支付系统留 100% 收入**——比 Apple/Google 15-30% 抽成宽松得多。
- **获客是真壁垒（比开发难 10 倍）**：靠科技媒体横评（XDA/How-To Geek/MakeUseOf/Windows Central）+ 论坛长期沉淀（elevenforum/AskWoody）+ Store 榜单 + GitHub star→商业版。全部需数月口碑积累，没有即时渠道。

### 案例库

| 产品 | 平台 | 痛点 | 收入（证据级+URL） | 运行时AI | 变现 |
|---|---|---|---|---|---|
| **Stardock Fences** | Win | 桌面图标自动分组围栏 | 20M+ 下载，$9.99 档，公司 1991 至今盈利（A [stardock PR](https://www.prnewswire.com/news-releases/stardock-releases-fences-6-302467387.html)） | 零 | 买断 + 套件 |
| **Listary Pro** | Win | 文件搜索+启动器（"Win 版 Alfred"） | $19.95 终身，2018 起独立运营至今（C/B [listary](https://www.listary.com/pro)） | 零 | **个人免费 / 商用必须买** |
| **Snipaste Pro** | Win+Mac | 截图+贴图钉屏+取色 | $19.99 起，2.x 起新功能仅 Pro（B/C [snipaste](https://www.snipaste.com/)） | 零 | 个人免费 / 商用 Pro |
| **XYplorer** | Win | 双栏标签文件管理器 | Std $34.95 / 终身 $69.95，含企业站点授权（B [xyplorer](https://www.xyplorer.com/)） | 零 | 买断 + 终身升级档 |
| **Cap**（疑 Tauri） | Win+Mac | 开源 Loom 替代（截录屏） | 17K+ star，桌面 **$58 终身/$29 年**，云功能 $8-12/mo（A/B [cap.so](https://cap.so/pricing)） | 本地录制零成本 | 开源 + 终身买断 + Pro 云订阅 |
| **Yaak** | Win+Mac+Linux | API 客户端（Tauri） | ~18K star，个人 $79/年（B [devtune](https://devtune.ai/verticals/open-source-commercial-oss-infrastructure/tauri)） | 零 | 开源 + 付费授权 |
| **ShareX / Flow Launcher / Ditto** | Win | 截图/启动器/剪贴板（开源） | **反面教材**：18 年/13.9K star 仍纯捐赠、零收入（C [getsharex](https://getsharex.com/donate)） | 零 | 仅捐赠（叫好不叫座陷阱） |

### 脑暴点子

- **A. "商用授权"型 Windows 启动器/剪贴板增强**（Tauri，<10MB 单二进制）：填 Ditto+Flow 的商业化缺口（两者把市场教育做完了却放弃收费）。靠"个人免费 / 商用 $19.95 一次性"赌公司采购。冷启动：开源攒 star → XDA/How-To Geek 横评 → Store "Top paid" → 论坛长贴。风险：最强对手是免费的 PowerToys Run。
- **★ B. 跨平台（Win+Mac）一次性买断小工具，Tauri 同码双卖**：单一痛点（批量重命名 / 截图标注钉屏 / 窗口布局），Tauri 一套代码出双安装包，Gumroad/Lemon Squeezy 卖 $19-29 终身。**Mac 端吃溢价、Win 端吃装机量，对冲单平台风险**。风险：双平台双倍 QA/签名/公证成本。
- **C. Microsoft Store 系统美化/任务栏/窗口管理付费 app**：Win11 任务栏阉割持续制造需求，$4.99-9.99 一次性 + 自有支付留 100%。风险：与免费 PowerToys 正面竞争（微软自己在蚕食该品类）。

> 数据短板诚实标注：Windows 独立开发者远不如 Mac/IndieHackers 圈层公开收入，本簇 A 级硬证据集中在官方政策/定价，个人 Windows 工具 MRR 几乎无可靠 A 级披露。

---

## 三、移动端"系统增强 / 个性化定制"经济（Widget / 锁屏 / 壁纸 / 表盘）

### 一句话定性

**经济模型对个人近乎完美（零运行成本、毛利极高、本地渲染、买断/低价订阅），技术与成本都不是壁垒——真正的壁垒和淘汰线都在"能否拿到一条免费的病毒短视频"。**

- 甜点：①"单一极致功能 + 强情绪/审美钩子"的轻 App（学 Locket/Dumbphone，不学全家桶）；② 审美细分垂类（dark academia / Y2K / 二次元 / 国风，头部通用 App 吃不下）；③ 被忽略设备面（Apple Watch 表盘竞争极低）。
- 红海：通用"图标+Widget+壁纸"全家桶（WidgetClub/Top Widgets/Themify 一大批同质）、自定义键盘/emoji（大厂级 + 70M 下载老玩家占满）。
- **revenue ≠ 净利（必须警惕）**：Apple/Google 抽 15-30%；一旦靠投放获客 CAC 吃掉大头。Zedge $29.4M TTM 但"巨额营销换零增长"、MAU 还在跌——这个品类**留存差、需持续买量喂养**。外部估算的月流水须默认先打 7 折（抽成）再扣投放才是净利。
- 苹果政策风险真实：持续限制自定义图标体验（走 Shortcuts 跳转、无角标、锁屏显示通用图标），图标主题类长期被掐脖子。

### 案例库

| 产品 | 平台 | 品类 | 收入（证据级+URL） | 运行时AI | 变现 |
|---|---|---|---|---|---|
| **Widgetsmith**（David Smith 单人） | iOS | Widget/锁屏 | 累计 1.31 亿下载，近月估 ~$200k/mo；**零营销预算、TikTok 病毒起家**（A [david-smith](https://www.david-smith.org/blog/2025/09/18/widgetsmith-at-five/)） | 零 | 订阅 |
| **Locket Widget** | iOS/Android | 照片 Widget（社交） | 年化 ~$13.5M 盈利，累计 8000 万下载，融资 $12.5M（B [TechCrunch](https://techcrunch.com/2022/08/02/locket-app-that-lets-yor-post-photos-to-your-loved-ones-homescreens-raises-12-5m/)） | 零 | 起步免费病毒，后期订阅；留存是软肋 |
| **Dumbphone** | iOS | 极简启动器 | **78 天 20k 下载 / $9k MRR**，9 天开发，纯 TikTok 冷启动（B [Shortimize](https://www.shortimize.com/blog/20k-downloads-and-9k-mrr-in-78-days-how-this-indie-app-turned-minimalism-into-millions-of-views)） | 零 | 订阅 |
| **KWGT Kustom Widget** | Android | Widget 制作引擎 | Pro Key **一次性 $6.99**，累计 ~82 万次付费下载（B [Play](https://play.google.com/store/apps/details?id=org.kustom.widget.pro)） | 零 | 一次性买断 + UGC 模板生态 |
| **Zedge** | iOS/Android | 壁纸/铃声市场 | TTM $29.4M，毛利 **93.7%**，但 MAU 26.1M→23.2M（B [nerdoutonbusiness](https://www.nerdoutonbusiness.com/p/the-wallpaper-app-that-can-t-break-its-revenue-ceiling)） | 近零 | 广告+订阅+数字商品；**买量陷阱反面教材** |
| **Colorful Widgets / Top Widgets⁺** | iOS/Android 中国区 | Widget/桌面主题 | 数百万日活，冲中国区免费榜 #1（超豆包/夸克）（B [澎湃](https://www.thepaper.cn/newsDetail_forward_27958639)） | 零 | 内购引流 + 订阅；二次元/Z 世代分享 |
| **Facer / Buddywatch** | watchOS | Apple Watch 表盘 | Facer 50 万+ 表盘，订阅 $39.99/年（C 商店页） | 零 | 订阅 + UGC 创作者市场 |

### 脑暴点子

- **A. 审美垂类"单一调性"锁屏/Widget 包**：不做通用全家桶，只做一种强调性完整方案（dark academia / 国风水墨 / 二次元单作品向），¥6-18 一次性买断，验证后批量复制 SKU。冷启动：小红书/TikTok 该调性兴趣社群"我的手机长这样"展示视频。风险：单调性天花板低、潮流速朽、苹果图标限制拉低口碑。
- **★ B. "一个钩子"型情绪/社交 Widget**（学 Locket/Dumbphone）：极窄单点 + 强情绪钩子（异地恋纪念日 Widget、考研/减脂进度条 Widget、每日一句+自定义照片），1 周可做，快速试错多个钩子。风险：留存陷阱、钩子命中率低需组合下注。
- **C. Apple Watch 表盘工具**：被忽略的低竞争设备面，纯静态/动效素材零成本。风险：苹果表盘技术限制多（需走分享/引导，体验摩擦）。
- **D. Android KWGT/KLWP 一次性买断模板包**：寄生已有引擎和社区流量，省掉自建 App 冷启动（KWGT Pro $6.99 × 82 万付费验证模型成立）。

---

## 四、垂直受众浏览器插件（非开发者高付费人群）

### 一句话定性（付费意愿排序）

**电商卖家/转卖者 ≈ 高 > 房产投资者/创作者 > 求职者 > 交易加密(获客难) > 学术(基本不付费)。**
最佳个人切口：从 Helium 10 / vidIQ / Vendoo 这类**重产品里抠出单一尖锐痛点**，做成纯本地 DOM 抓取+计算的浮层，在对应垂直社区冷启动。

- **电商卖家最强**：把工具视为成本而非支出（一个选品决策值几千美元），$30-99/月毫不犹豫。
- **创作者基数大单价低**：$3-10/月 freemium，转化高、量大。
- **求职者消费窗口短**（找到工作就退订），且**务必避开 LinkedIn 页面抓取**（ToS 禁止、封号，Hunter 已因此放弃）。
- 学术人群主力工具免费或机构买单，**不推荐作主攻**。

### 案例库

| 产品 | 垂直人群 | 痛点 | 收入（证据级+URL） | 运行时AI | 变现/客单价 |
|---|---|---|---|---|---|
| **Closet Tools**（Jordan O'Connor 单人无员工） | Poshmark 转卖者 | 手动 share 耗时 | **$41k MRR 单人**（B/C [IH podcast](https://www.indiehackers.com/podcast/187-jordan-oconnor-of-closet-tools)） | 零（本地按键自动化） | $30/月 |
| **DS Amazon Quick View Extended** | Amazon 选品 | 搜索页看不到 BSR/价格史 | 装机量大，$25 买断（A [chromewebstore](https://chromewebstore.google.com/detail/ds-amazon-quick-view-exte/ilpimgbmpmhfhdaaeepjokoigelkfbee)） | 零（DOM 抓取+悬停） | $25 一次性 |
| **vidIQ** | YouTube 创作者 | SEO/标签/竞品分析 | $8.9M ARR(2024,偏旧)，20M+ 用户（B [getLatka](https://getlatka.com/companies/vidiq)） | 部分（核心本地浮层） | $7.5/月起 freemium |
| **Vendoo** | 多平台转卖者 | 跨平台 listing/防双卖 | 81,000+ 付费转卖者（B [vendoo](https://vendoo.co/)） | 低 | $8.99/月起 |
| **Cashflow Calculator (daattali)** | 房产投资者 | Zillow/Redfin 上算现金流 | 开源口碑（A [github](https://github.com/daattali/cashflow-calculation-extension)） | 零（本地公式） | 免费（可商用化） |
| **GMass** | 邮件营销者 | Gmail 群发 | **$130k/月 MRR**（B/C [extensionpay](https://extensionpay.com/articles/browser-extensions-make-money)） | 低（云发件） | $8-20/月 |

### 脑暴点子

- **A. eBay "已售数据 + 标题关键词构建器"**（纯本地 DOM 抓取+词频）：Terapeak 僵化、ZIK $39.9/月偏重，卖家只要"这词好不好卖"。$15-25/月或 $39 买断。冷启动 r/Flipping、Reseller YouTube。
- **B. 转卖者"防双卖 + 批量下架"轻浮层**：只做"一处售出→其它平台提醒/下架"这一个尖锐痛点（复刻 Closet Tools $41k MRR 打法），$15-30/月。风险：平台对自动化的 ToS 容忍度变化。
- **C. Zillow/Redfin 房产"现金流 + 评分"浮层**（纯本地公式）：在 daattali 开源版上加自定义假设+批量对比+导出做付费层，$29 买断。冷启动 BiggerPockets 论坛。
- **D. YouTube 缩略图/标签"竞品并排分析"浮层**（本地词频）：只做 vidIQ/TubeBuddy 没做好的单功能，freemium $4-8/月。

---

## 五、确定性本地处理工具（文件/PDF/数据/媒体/隐私）

### 一句话定性

- **端侧 Whisper 字幕/转录是当前最肥的"确定性+隐私"赛道**（Whisper 是固定权重模型、推理可复现，**不是每次调云 LLM**，运行时边际成本=0，完美契合硬约束）。
- **桌面开发者工具箱（DevUtils 模式）已被验证可单人养活**；**截图美化是"小而美一次性买断"成熟剧本，且有并购退出通道**。
- **SEO 工具站的现实判断**："xxx converter"长尾词流量巨大且纯本地 WASM 可做，但**纯一次性买断在 web 端难收费**——TinyWow 至今无变现、CloudConvert 跑 10 年 ARR 才 $440K（靠 API/按量而非买断）。**正确组合**：免费 web 站（WASM 处理，零服务器）做 SEO 漏斗 + 广告，导流到**桌面/插件 Pro 买断**（隐私+离线+批处理才是付费理由），最差也能在 Flippa 按流量卖掉资产。
- 隐私"文件永不离开本机"是 PDF/医疗法务文档/含 EXIF 照片的硬付费理由，但**隐私单独不足以收费**，必须叠加批处理/离线/无水印/原生体验才转化。

### 案例库

| 产品 | 类型 | 痛点 | 收入（证据级+URL） | 运行时AI | 变现 |
|---|---|---|---|---|---|
| **MacWhisper**（Goodsnooze 独立开发者） | 端侧字幕/转录 | 音频转录怕上传云 | **~30 万份 × €59**，无融资（A [macwhisper](https://macwhisper.com/)） | 端侧 Whisper，边际=0 | €59 一次性买断 + 订阅 |
| **DevUtils**（Tony Dinh） | 开发者工具箱(正则/JSON/CSV/diff 47+) | 在线工具泄露代码、要离线 | 峰值 ~$20K/mo，长期 ~$5.5-8K/mo（C/B [IH](https://www.indiehackers.com/post/he-made-45k-month-with-chatgpt-tony-dinh-s-story-c40283745c)） | 零 | $29 永久授权 |
| **Xnapper**（Tony Dinh，已售） | 截图美化 | 快速出好看截图 | ~$4-6K/mo，2024 **$150K 售出**（B [tonydinh](https://news.tonydinh.com/p/another-6-figure-exit-and-the-future)） | 零 | $29/设备；并购退出 |
| **Stirling-PDF** | PDF 60+ 操作自托管 | iLovePDF 上传云隐私 | 融资 **$2M**，30M+ 下载（A [PitchBook](https://pitchbook.com/profiles/company/641793-25)） | 零 | 开源 + Server/Enterprise |
| **CloudConvert** | 文件转换 web/API | 200+ 格式转换 | 2025 ARR **$440K**，81% 自然搜索，bootstrapped（B [getLatka](https://getlatka.com/companies/cloudconvert.co.za)） | 服务器端确定性 | 按量 credits + API |
| **Jpeg.to / Dirpy.com** | 图片/YT 转换站 | SEO 长尾流量 | 在 **Flippa 成交**（按流量估值）（A [flippa](https://flippa.com/5336073-jpeg-to)） | WASM/服务器端 | 广告；资产出售退出 |

### 脑暴点子

- **★ A. 端侧字幕/转录 + 本地翻译的垂直缝隙**：MacWhisper 验证 30 万付费但偏通用，缝隙在职业垂直（播客剪辑师按句导出+删填充词、法务/医疗合规听写、字幕组多轨翻译对照）。模型固定→零运行时云成本。SEO 长尾："whisper srt export"、"transcribe without uploading"。
- **★ B. 纯本地 PDF 隐私工具桌面版**（Stirling-PDF 消费者轻量化）：合并/拆分/压缩/OCR(端侧 Tesseract)/去 EXIF，"文件永不离开电脑"，$30-80 买断。SEO："merge pdf offline"、"compress pdf without uploading"。
- **★ C. SEO 转换工具站漏斗 → 桌面 Pro 买断 + 资产可售**：一个域名 50+ 个 "X to Y converter" 页（全 WASM 浏览器内处理零服务器），底部推桌面批处理 Pro。**纯 SEO 复利、无需社交冷启动**（CloudConvert 81% 自然搜索验证）。风险：长尾词白热化、域名权重需 6-12 月。
- **D. DevUtils 的 VS Code/浏览器插件形态**：开发者工具箱不切换上下文版，license key 解锁高级，零 AI 纯确定性。

---

## 六、国内新增场景（飞书插件 / 创作者产出工具 / 油猴 / 数字商品 / 小程序买断）

### 一句话定性

国内个人轻应用，**产品形态从不是壁垒，分发是唯一壁垒**：

| 生态 | 判断 |
|---|---|
| **小红书"产品即内容"** | **当前最现实的免费获客路径**（红利真实但已进入第二波竞争）——本研究最强结论 |
| **iOS 小程序 12% 买断窗口 + 数字模板** | 当下最干净组合（零 AI 备案、零爬虫合规、买断天然） |
| **飞书多维表格纯计算插件** | 中等天花板 ToB 小生意，**个人版应用免审核**，真有空间非纯小钱 |
| **抖音/B站/小红书数据看板** | 别碰（爬虫合规灰区 + 蝉妈妈/飞瓜/新榜巨头占满）；改做**创作产出工具/模板** |
| **钉钉/企微** | 对个人不友好（ISV 交付重活、服务商门槛），跳过 |
| **油猴脚本/国内浏览器插件** | 优质免费流量入口，但**是获客渠道而非变现渠道** |

### 案例库

| 产品/案例 | 平台 | 痛点 | 收入（证据级+URL） | 运行时AI | 变现 |
|---|---|---|---|---|---|
| 演界网 PPT 模板卖家 | 演界网/PPTstore | 找优质模板 | 自报销售超 100 万（C [xspzq](https://www.xspzq.com/post/5239.html)） | 零 | 独家授权佣金/买断 |
| 小红书虚拟商品卖家 | 小红书 | PPT/壁纸/模板 | 自报月入过万（C [知乎](https://zhuanlan.zhihu.com/p/1889995347285234296)） | 零 | 一次性买断 |
| RoboNeo 类工具 | 小红书引流 | 工具 App 冷启动 | **日均 2 万下载无投流**（C [抖查查](https://www.douchacha.com/article/details/rss4emve.html)） | 视产品 | 下载/内购 |
| 飞书多维表格插件 | 飞书插件市场 | 表格增强 | 官方激励，个人月入数千-万级（A [开放平台](https://open.feishu.cn/community/articles/7298180622756659203)） | 可零 | 订阅/买断 |
| 工具小程序（被动流量） | 微信小程序 | 无推广 | **3 个月 6.18 元**（C [少数派](https://sspai.com/post/82448)）——分发死穴反面教材 | 零 | 流量主广告（极低） |
| Greasy Fork 脚本作者 | 油猴/浏览器 | 网页增强 | 无内建付费，靠捐赠/导流（A [greasyfork](https://greasyfork.org/)） | 零 | 引流为主 |

### 脑暴点子

- **A. 小红书封面/图文版式工具**（纯前端 Canvas，Web+小程序双端）：零 AI、零爬虫、零合规风险；必须极度垂直（"知识博主九宫格""测评对比图"），产品产出的封面本身发笔记自循环引流。iOS 小程序 12% 买断已合规。小钱生意（月入数千-1~2 万现实）。
- **★ B. 飞书多维表格"纯计算"字段捷径/插件包**：条码/二维码生成、批量正则提取、中文金额大写、甘特图美化、表格转长图，**个人版免审核**，明确规避调大模型的备案门槛。冷启动靠知乎/小红书"多维表格教程"高流量品类带货。
- **C. 油猴脚本铺量 → 买断小程序的免费引流漏斗**：Greasy Fork 日活 10 万+ 是稀缺的非投流非个人 IP 获客入口，脚本零成本，引导到功能更强的买断小程序。
- **D. iOS 买断窗口下的单一痛点工具小程序**（噪音分贝计/装修测量/亲属称呼计算器/择吉/单位换算合集）+ 小红书内容获客，6-12 元解锁。成败 100% 取决于内容获客。

---

## 七、横向汇总：我的优先级判断（脑暴收敛）

把 6 簇放在一起，按**"运行时零成本 × 一次性买断/license × 分发现实可达 × 你的不公平优势（字节工程师）× 1-2 周可 ship"**排序：

### 🥇 第一梯队（强烈建议先试，技术护城河深 + 你最懂）
1. **JetBrains/VS Code 的本地化重型开发者插件**（簇一 A/B）——付费转化最干净、运行零 AI、Marketplace 自带曝光 + 你的技术博客/HN 受众。**字节工程师做这个是降维打击**，别人做不出你的工程深度（PSI 语言支持、profiling 可视化、大仓依赖图）。
2. **端侧字幕/转录 or 本地 PDF 隐私工具的垂直缝隙**（簇五 A/B）——MacWhisper/DevUtils 已证明买断可单人养活，隐私是硬付费理由，端侧模型零运行成本，SEO 长尾可冷启动。

### 🥈 第二梯队（天花板高或冷启动便宜，但有明显风险）
3. **跨平台（Win+Mac）Tauri 单一痛点买断工具**（簇二 B）——一套代码双卖、对冲单平台风险，但双倍 QA/签名成本。
4. **SEO 转换工具站漏斗 + 桌面 Pro**（簇五 C）——纯 SEO 复利不需社交冷启动，但需 6-12 月养域名 + 长尾白热化。
5. **Shopify 零 AI 运营小工具组合**（簇一 C）——个人天花板最高（6 位数 MRR），但分发最卷、需运营外推。

### 🥉 第三梯队（小钱/高风险，作为流量实验或副线）
6. **"一个钩子"情绪/社交 Widget**（簇三 B）——成本极低可快速试错，但成败 100% 押在病毒短视频上、留存差。
7. **国内：飞书纯计算插件 / 小红书产出工具 + 油猴引流**（簇六 B/C）——最适合国内启动且合规干净，但都是小钱生意，分发靠"产品即内容"。

### 不建议主攻
- Obsidian/Raycast 直接变现（无原生支付 + 社区反付费）
- 求职插件（消费窗口短 + LinkedIn 抓取封号雷）/ 学术工具（基本不付费）
- 通用美化全家桶 / 自定义键盘 emoji（红海，大厂级竞争）
- 抖音数据看板 / 钉钉企微 ToB（爬虫合规 / 个人玩不动）

### 一句话收口
**对你（字节工程师）而言，最高 ROI 的不是再做一个 C 端 AI 轻应用，而是把"开发者工具 + 端侧/本地确定性处理 + 一次性买断/license"这条线吃透**——它运行时零成本、付费转化干净、你有别人没有的工程护城河、且 Marketplace/SEO/HN 能冷启动。先挑一个**你自己日常开发就缺的工具**（你即目标用户），1-2 周 vibe code 出来，免费发 HN/掘金/V2EX 验证，有人要再加买断。这与现有研究"02 倒数日（运行时零 AI）才是对的商业模型"一脉相承。

---

*本文整合自 6 个并行 research agent，累计 130+ 次 WebSearch/WebFetch；横向汇总与优先级判断为基于全部数据的当前时点脑暴。所有收入数据按 A/B/C/D 证据强度降权，引用时务必同时看证据级别。*
