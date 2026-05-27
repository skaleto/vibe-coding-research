# Detail-02: AI 倒数日 Pro - 实操级细化文档

**版本**：v1.0-detail
**日期**：2026-05-27
**基于**：[`prd-02-countdown.md`](./prd-02-countdown.md)
**目标**：明天开始写代码 + 后天开始 ASO 投放的实操层级
**矩阵角色**：稳定盘 #2 / 监管最低 / 毛利 99%

---

## A. 5 套主题完整设计描述

主题是这个产品的**全部命脉**。Days Matter 输给我们的不是功能，是审美。每套主题的设计目标：**让用户截图发小红书时被朋友追问"这是什么 App"**。

### A.1 主题一：少女心 - 千禧粉色系

**一句话定位**：粉嫩果冻 + 蝴蝶结，2002 年的 MSN Messenger 长大了，2025 年活在 iPhone 桌面上。

**目标用户**：18-25 岁女生，小红书重度，喜欢 hellokitty、初音未来、平成女子风。

**配色 hex**：
- 主色 `#FFB3D1`（樱花粉，主背景渐变上半部）
- 辅色 `#FFE0EC`（雪纺粉，主背景渐变下半部）
- 强调色 `#FF6B9D`（玫瑰粉，剩余天数主数字）
- 文字色 `#5D2A4A`（深莓紫，标题文字）
- 装饰色 `#FFD700` + `#B8E2F2`（金粉 + 薄荷蓝，蝴蝶结/星星点缀）
- 留白色 `#FFFAFC`（牛奶白，卡片底）

**字体推荐**：
- 标题：`PingFang SC Medium` + 字间距 1.2x（系统字体保底）
- 数字：`Caveat Brush` 或思源宋体 ExtraBold（手写质感）+ 渐变金色描边
- 备注：`Snell Roundhand`（iOS 内置花体英文）

**图标风格**：
- 装饰元素：蝴蝶结 SVG（粉色丝带 + 金扣）、五角星、爱心、闪闪 sparkle
- emoji 用法：💕 🎀 ✨ 🌸 🦄 🍰 系列，每个倒数日默认配一个 emoji
- 自定义图标：自绘 SVG 12 个（蝴蝶结、皇冠、独角兽、棒棒糖、信封、戒指、相机、礼物盒、奶瓶、星座、月亮、彩虹）

**小组件 3 种尺寸设计**：

- **小尺寸（systemSmall 158x158pt）**：
  - 背景：粉色径向渐变（中心 #FFE0EC → 边缘 #FFB3D1）
  - 左上角：emoji 🎀 + 标题（思源宋体 12pt）
  - 中央：大数字"32"（手写体 56pt，金色渐变描边）+ "天"字（10pt 右下角）
  - 右下角：迷你日历 icon + 目标日期"2026.06.30"

- **中尺寸（systemMedium 329x158pt）**：
  - 背景：粉白纸张质感（叠加纸张噪点 5%）
  - 左侧：emoji 大图标 🍰（50x50pt）+ 标题"姐姐的婚礼"
  - 右侧：数字"32"（80pt 玫瑰粉 + 金色阴影）+ "天后"
  - 底部装饰：3 颗 sparkle ✨ 散落 + 日期手写花体

- **大尺寸（systemLarge 329x345pt）**：
  - 背景：粉色波浪线条纸（手账质感）
  - 上半：标题大字 + 配图（用户可上传一张照片，圆角 + 粉色边框 + 蝴蝶结小贴纸）
  - 中央：大数字"32"（手写 120pt）
  - 下半：进度条（粉色渐变填充 + 心形端点）+ 起始日期 ─ 目标日期

**2 张种草截图设计**：
1. **iPhone 桌面真实场景**：iOS 锁屏壁纸（粉色云朵）+ 中等尺寸小组件居中 + 标题"距 ❤️ 100 天纪念日"。配文「我和 ta 的 100 天，桌面也要粉粉的」。
2. **小红书 9 宫格风格**：6 个不同标题的小尺寸组件方阵（婚礼 / 旅行 / 生日 / 考试 / 入职 / 见面），背景是粉色格纹布艺。

**设计参考**：
- Pinterest 搜：`y2k aesthetic widget`、`pink coquette ios`、`girly homescreen ideas 2025`
- Dribbble 搜：`pastel pink ui`、`kawaii widget design`
- 直接对标：`小红书 #千禧少女主题` 系列、`#平成女子风桌面`

---

### A.2 主题二：极简 - 莫兰迪灰白

**一句话定位**：删掉所有装饰，只留下日期和数字本身——Things 3 来做倒数日。

**目标用户**：25-35 岁知识工作者、产品经理、设计师，用 Bear / Things 3 / Linear。

**配色 hex**：
- 主色 `#FAFAFA`（纸张白，主背景）
- 辅色 `#1A1A1A`（墨黑，数字）
- 文字色 `#666666`（中灰，正文）
- 弱化色 `#E5E5E5`（极淡灰，分隔线）
- 强调色 `#FF3B30`（iOS 系统红，仅"已过期"标签使用）
- 暗模式主背景：`#0A0A0A` / 数字 `#F5F5F5`

**字体推荐**：
- 数字：`SF Pro Display Ultralight` 或 `New York Medium`（系统衬线）+ 字号 96pt 起
- 标题：`PingFang SC Regular` + 字号小（14pt）+ 字间距 0.05em
- 备注：`SF Mono Regular`（等宽字体，给一丝程序员气质）
- 整体字号阶梯：96 / 24 / 14 / 11，对比强烈

**图标风格**：
- 完全无装饰，**只有一根 0.5pt 分隔线**
- emoji **禁用**（如需图标，用 SF Symbols 黑白线性图标）
- 拐角：永远不用圆角 > 4pt
- 配色限制：**只允许黑白灰 + 一个强调红**

**小组件 3 种尺寸设计**：

- **小尺寸**：
  - 背景：纯白 `#FAFAFA`，**无渐变**
  - 顶部：标题（11pt 灰 #666666）一行省略
  - 中央：数字"32"（SF Pro Ultralight 64pt 墨黑）
  - 底部：0.5pt 横线 + 日期"30 JUN 2026"（10pt 灰）+ 右对齐

- **中尺寸**：
  - 背景：纯白，留白比例极大（左右各 24pt 边距）
  - 左：3 行内容堆叠 → 标题 / 大数字 32 / 单位「天」
  - 右：垂直分隔线 0.5pt 灰 + "目标 30 JUN" + 起始日期小字 + 一个细进度条（高 1pt 黑）

- **大尺寸**：
  - 背景：纯白
  - 上 1/3：标题居中 + 0.5pt 横线下
  - 中 1/3：超大数字"32"（120pt + Ultralight）+ 单位
  - 下 1/3：3 列 mini 时间表→ "今天 / 4 周后 / 目标"，每列 1 个标签 + 1 个日期

**2 张种草截图设计**：
1. **MacBook + iPhone 同框桌面照**：iPhone 上中尺寸极简组件，旁边是开着的 Bear 笔记。配文「极简党的桌面美学，距离年度 Review 还有 45 天」。
2. **iPhone 锁屏特写**：纯黑壁纸 + 锁屏组件「距护照过期 92 天」+ Apple Watch 镜面反射。配文「不打扰，只提醒」。

**设计参考**：
- Pinterest 搜：`minimalist ios widget`、`bear app ui`、`things 3 design`、`muji aesthetic`
- Dribbble 搜：`minimal countdown`、`monochrome widget`
- 直接对标：`Things 3` 任务卡片、`Bear` 笔记列表、`Linear` 主屏

---

### A.3 主题三：复古胶片 - Kodak Gold 200

**一句话定位**：把柯达 Gold 200 胶卷的颜色刻进倒数日，每个日期都是一张老照片。

**目标用户**：25-35 岁文艺青年、摄影爱好者、VSCO / 黄油相机 用户、纪念恋爱周年的人。

**配色 hex**：
- 主背景 `#F5E6D3`（米黄牛皮纸）
- 暗部 `#2D2418`（深咖啡墨色）
- 主色 `#D4943F`（柯达金黄）
- 辅色 `#8B5A3C`（焦糖棕，标题）
- 强调色 `#C84B31`（褪色朱红，重要数字）
- 颗粒：在所有底层叠加 8% 噪点（仿胶片颗粒）+ 1px 划痕 SVG 装饰

**字体推荐**：
- 数字：`Courier New Bold` 或 `IBM Plex Mono Bold`（仿打字机/胶片机底片字）
- 标题：`Noto Serif SC` 思源宋体 + 字号 18pt + 字间距加宽 0.1em
- 日期戳：`Special Elite` Google Fonts 老打字机字体（仿胶卷边缘日期戳）
- 备注：手写体 `Caveat Regular`（仿日记本钢笔字）

**图标风格**：
- 装饰元素：胶片孔（左右两侧黑色矩形齿孔）、底片日期戳"'26 06 30"
- 印章：手工刻章风格的"已过期"红章 / "倒数中"金章
- 老照片素材：贴一张半透明的太阳光斑 / 漏光 / 旧照片角折痕
- emoji 用法：禁用 emoji，全部替换为手绘小图（相机、信封、邮戳、地图针）

**小组件 3 种尺寸设计**：

- **小尺寸**：
  - 背景：米黄牛皮纸 + 颗粒 + 左右胶片齿孔
  - 中央：日期戳"30 JUN '26"（打字机字体 12pt）+ 数字"32"（Courier 48pt 焦糖）
  - 底部："- DAYS LEFT -"全大写 8pt 字间距 0.3em
  - 右上角：小相机图标（线性手绘）

- **中尺寸**：
  - 背景：双联底片设计（左格 + 右格 + 中间齿孔）
  - 左格：用户上传的照片（黑白处理 + 黄色滤镜）+ 圆角胶片框
  - 右格：标题（思源宋体）+ 大数字"32"（48pt 朱红）+ 单位 + 目标日期戳
  - 右上：盖章"COUNTDOWN"红章半透明

- **大尺寸**：
  - 整张设计为"一张老照片 + 相册笔记"
  - 上半：照片 + 漏光效果 + 左上角折角
  - 中央：手写笔迹"距离去东京还有"（仿钢笔字）
  - 大数字"32"（Courier Bold 100pt 焦糖）
  - 下半：日期戳 + 印章 + 一行手写备注

**2 张种草截图设计**：
1. **木质桌面 iPhone 摆拍**：木桌 + 真实柯达胶卷散落 + iPhone 显示倒数日（"距日本旅行 32 天"）。配文「胶片党的日历，旅行倒计时的仪式感」。
2. **桌面拼贴风**：iPhone 桌面用了 3 个不同尺寸胶片主题组件（婚礼/旅行/纪念日），背景是布告板拼贴。配文「我的桌面已经被胶片占领」。

**设计参考**：
- Pinterest 搜：`kodak film aesthetic`、`vintage film camera ui`、`polaroid widget`
- Dribbble 搜：`retro film design`、`vintage countdown`
- 直接对标：`VSCO` 滤镜界面、`Filmm` App、`一闪`（OneTake）App

---

### A.4 主题四：国风 - 水墨节气

**一句话定位**：把宋代山水画的留白带到 iPhone 桌面，倒数日也可以"小寒大雪夏至"。

**目标用户**：25-35 岁文化爱好者、汉服圈、文房四宝爱好者、节气 App 重度用户。

**配色 hex**：
- 主背景 `#F4F1E8`（宣纸米白）
- 主色 `#1C1C1C`（松烟墨）
- 辅色 `#7A1F1F`（朱砂红，印章/落款）
- 强调色 `#5C7A3C`（青苔绿，节气标签）
- 弱化色 `#A89F8C`（淡赭，水墨阴影）
- 留白色 `#FBF9F2`

**字体推荐**：
- 标题：`Noto Serif SC ExtraBold` 思源宋体加粗 + **竖排**支持
- 数字：`霞鹜文楷 LXGW WenKai`（开源中文字体）+ 字号 80pt
- 备注：`方正瘦金体`（仿宋瘦金体）
- 落款：`手书体`（仿名家行书）

**图标风格**：
- 装饰元素：水墨晕染圆形（背景的山影）、印章 SVG（"印"字朱砂方章）
- 不用 emoji，用国画元素：竹叶、梅花、扇形、瓦当、回纹边框
- 二十四节气图标：12+ 节气小图（立春嫩芽、夏至太阳、冬至雪花）

**小组件 3 种尺寸设计**：

- **小尺寸**：
  - 背景：宣纸米白 + 右下角水墨晕染圆 (半透明灰)
  - **竖排**布局：从右到左
  - 右侧：标题竖排（如"赴 京 之 日"）
  - 中央：数字"卅二"（中文大写，或阿拉伯数字 60pt 文楷）
  - 左侧：日期"丙午年五月廿三"（农历显示）
  - 右下：朱砂方印（用户自定义 1 字落款）

- **中尺寸**：
  - 背景：扇形构图，上半部水墨山影
  - 左 1/3：竖排标题 + 农历日期
  - 中 1/3：大数字"32"（文楷 70pt 松烟墨）+ 「日」字 + 朱砂方印
  - 右 1/3：当前节气标签（圆形章："夏 至"）+ 距下一节气 N 天

- **大尺寸**：
  - 完整山水构图：上 60% 留白 + 远山水墨 + 一只孤鸿
  - 中央：超大数字"叁拾贰"（中文大写） + 阿拉伯"32"叠印
  - 下方横款：标题 + 起始日期 + 目标日期 + 朱砂落款印
  - 底部："丙午仲夏 立于桌前" 题款

**2 张种草截图设计**：
1. **茶席摆拍**：iPhone 放在茶席旁，旁边是建盏 + 香炉 + 折扇。配文「文人桌面，倒计时也要有意境」。
2. **水墨海报版**：长图分享卡，竖排文字"距夏至还有 7 天"+ 一只鹤 + 全长印章。配文「二十四节气倒数日，每天都是仪式」。

**设计参考**：
- Pinterest 搜：`chinese ink painting ui`、`zen minimalist app`、`节气海报设计`
- Dribbble 搜：`chinese style app`、`oriental aesthetic ui`
- 直接对标：`节气 App`、`故宫日历`、`微信读书`（部分页面）、`西窗烛`

---

### A.5 主题五：赛博朋克 - Neon Tokyo

**一句话定位**：把 2077 年的霓虹招牌装进 iPhone 桌面，让倒数日成为终端中的脉冲信号。

**目标用户**：18-30 岁极客、Cyberpunk 爱好者、TidByt 用户、追《银翼杀手》/《Edgerunner》的人。

**配色 hex**：
- 主背景 `#0A0E27`（深空蓝紫，几乎黑）
- 强调主色 `#FF006E`（霓虹品红/Magenta）
- 辅强调 `#00F5FF`（电光青/Cyan）
- 第三色 `#FFEE00`（霓虹黄，警告/重要）
- 文字色 `#E0E0FF`（淡蓝白）
- 网格色 `#1A1F4E`（暗紫，背景网格线）

**字体推荐**：
- 数字：`JetBrains Mono Bold` 或 `IBM Plex Mono Bold`（等宽编程字体）
- 装饰文字：`Orbitron Bold`（科幻 sci-fi 字体，Google Fonts）
- 备注：`Share Tech Mono`（终端字体）
- 中文：`Noto Sans Mono CJK` 或思源等宽

**图标风格**：
- 装饰元素：扫描线（CRT 屏幕横线噪点）、故障 RGB 错位效果（glitch 1-2px）、网格透视背景
- 边框：1px 霓虹色 + 外发光 4px blur
- 角标：[ ERROR ] [ DAYS=32 ] [ TIME://OUT ] 等终端风格
- 不用 emoji，用 ASCII 字符：▲ ▼ ► ◄ ▒ ░ █ 等

**小组件 3 种尺寸设计**：

- **小尺寸**：
  - 背景：深空蓝紫 + 网格透视线（往上消失）+ 扫描线动效（静态版本）
  - 顶部：`[ COUNTDOWN.EXE ]`（霓虹青色 8pt Orbitron）
  - 中央：大数字"32"（JetBrains Mono Bold 56pt + 霓虹品红 + 外发光）
  - 数字旁：单位 `DAYS`（等宽 10pt 青色）
  - 底部：`>> 2026.06.30 <<`（霓虹黄 9pt）

- **中尺寸**：
  - 背景：双层网格 + 远处霓虹城市天际线 SVG（紫粉渐变）
  - 左侧：终端窗口风格——`> TASK_TITLE: WEDDING`、`> STATUS: ACTIVE`、`> ETA: 32D`
  - 右侧：大数字方块"32 DAYS"+ 故障 RGB 错位标题
  - 底部：1px 青色霓虹下划线 + 进度条（品红填充 + 黄色端点）

- **大尺寸**：
  - 整体：仿黑客帝国终端
  - 顶部：标题霓虹招牌字 + 故障效果
  - 中央：超大数字"32"（120pt + 霓虹品红 + glow 8px）+ 旁边 ASCII 装饰艺术（||||||）
  - 中下：横向时间轴（起始/今日/目标）+ 节点用霓虹圆点
  - 底部：模拟终端命令：`$ ./countdown --target=20260630 --units=days`

**2 张种草截图设计**：
1. **桌面深夜风**：黑色机械键盘 + iPhone 显示赛博主题大组件 + 旁边一杯雪碧。配文「我的赛博倒计时，距 Notion 大版本上线 32 天」。
2. **多组件方阵**：iPhone 桌面 4 个不同尺寸赛博组件，标题分别是 "DEADLINE", "RELEASE", "PROD_DEPLOY", "INTERVIEW"。配文「程序员的 deadline 也要赛博」。

**设计参考**：
- Pinterest 搜：`cyberpunk ui design`、`neon city widget`、`vaporwave aesthetic`
- Dribbble 搜：`cyberpunk dashboard`、`synthwave ui`、`neon glow ui`
- 直接对标：`TidByt` 像素显示屏、`Cyberpunk 2077` 网络运行界面、`Apple TV+ Edgerunner` 介面

---

## B. 7 屏 UI 详细规格

### B.1 启动引导（首启三屏滑动）

**Navigation**：无导航栏（全屏 cover）。右上角"跳过"灰色 14pt。

**主体组件**：
- 顶部 1/2：动态预览图（一台 iPhone mockup，每屏不同主题的小组件演示）
- 中部：大标题（思源宋体 32pt 黑色）：
  - Page 1：「把你的纪念日 / 挂在桌面上」
  - Page 2：「5 套主题 / 25+ 小组件 / 任你切换」
  - Page 3：「一次买断 ¥18 / 永久解锁全部」
- 中下：小标题（PingFang Regular 15pt 灰色 #666）
- 底部：3 点 page indicator（粉色 active）+ 按钮"开始使用 / 试试看"（圆角 12pt 黑色按钮，全宽减 32pt 边距）

**交互**：
- 左右滑动切换 Page
- 最后一页按钮"开始使用"→ 触发 iCloud / 通知权限弹窗（标准 iOS Sheet）→ 进入首页

**关键 UI 数值**：
- 全屏沉浸式，状态栏白字 / 黑字根据 Page 切换
- 按钮高度 50pt，圆角 12pt
- Page 切换动画 300ms ease-in-out

**设计灵感**：`Headspace` 启动页（柔和插画）+ `Things 3` 上架引导（极简）

---

### B.2 首页 - 列表视图

**Navigation**：
- 大标题（iOS 14+ Large Title）：「我的倒数日」
- 左上：分段控件「列表 / 卡片」（segmented control）
- 右上：「+」按钮 + 「⚙」设置入口

**主体组件**：
- 顶部 16pt 留白
- 列表 cell（每行 80pt 高）：
  - 左侧：emoji 大图标（44pt）或自定义图标
  - 中部上行：标题（PingFang Medium 17pt）
  - 中部下行：目标日期（13pt 灰）+ 是否已过期标签
  - 右侧：大数字「32」（SF Pro 32pt 主题色）+ 单位「天」（11pt）
- Cell 分隔线：极淡灰 #E5E5E5
- 长按 cell：弹出 Context Menu（编辑 / 复制 / 删除 / 分享海报）
- 左滑 cell：「编辑」「删除」标准 iOS 交互

**交互逻辑**：
- 单击 cell → 详情页
- 右上「+」→ 新建页（modal）
- 列表/卡片切换：动画过渡 250ms
- 下拉刷新：触发 iCloud Sync 提示
- 空状态：居中 emoji（🎯）+ 「还没有倒数日，点击 + 创建第一个吧」

**关键 UI 数值**：
- Cell 高度 80pt，左右边距 16pt
- 标题最多 1 行省略
- 数字字号根据剩余天数动态调整（>999 缩小到 24pt）

**设计灵感**：`Apple Reminders` 列表 + `Things 3` 项目页

---

### B.3 首页 - 卡片视图

**Navigation**：同 B.2

**主体组件**：
- 大卡片瀑布流（2 列）或全宽单列（用户在设置中切换）
- 每张卡片即为「小组件中尺寸的预览」
- 卡片包含：当前选中主题的渲染效果 + 标题 + 大数字 + 日期
- 卡片高度根据内容自适应（150-200pt）
- 卡片间距 12pt，左右 padding 16pt
- 每张卡片右上角：3 点菜单 ⋯

**交互逻辑**：
- 单击卡片：放大动画 → 详情页（共享元素动画）
- 长按卡片：进入"拖动排序"模式（卡片轻微抖动）

**关键 UI 数值**：
- 卡片圆角 16pt
- 卡片阴影：y=2, blur=8, opacity=0.06
- 双指 pinch：可在 1 列 / 2 列间切换（隐藏功能）

**设计灵感**：`Pinterest` 瀑布流 + `Apple Photos` 集锦

---

### B.4 新建/编辑页

**Navigation**：
- 顶部：「取消」(左) + 「新建倒数日」(标题) + 「保存」(右，主色)
- Form 风格 modal（iOS sheet 半屏 / 全屏可选）

**主体组件列表**：
1. **图标 + 标题**（首行大输入框，居中）
   - 左侧：圆形 emoji 选择器（默认 🎯，点击弹出 emoji picker）
   - 右侧：标题输入框（24pt 粗体 placeholder「填一件值得期待的事」）
2. **日期选择**
   - "目标日期"标签 + 日期 picker（iOS 内置 DatePicker compact 样式）
   - 副选项："设为农历日期"开关
3. **类型**（segmented control：倒数 / 正数）
4. **时间单位**（chips："天 / 周 / 月 / 年 / 周岁"）
5. **主题选择**
   - 5 个主题缩略圆（横向滚动）
   - 未付费主题显示锁形 🔒 + 「¥3 单买 / ¥18 全部」
   - 点击锁会跳转主题市场
6. **重复提醒**
   - "提前 X 天提醒"多选：1 / 3 / 7 / 30 / 当日
   - 提醒时间：默认 09:00
7. **备注**（多行文本，4 行高度）
8. **图片**（可选，上传一张照片作为大组件背景）

**交互逻辑**：
- 保存校验：标题 ≠ 空、日期 ≠ 空
- iCloud 同步标签（保存后右上角小图标转圈 1 秒）
- 编辑模式时，标题改为「编辑倒数日」，多一个「删除」红色按钮

**关键 UI 数值**：
- Form 字段高度 56pt
- 字段间分隔线 0.5pt
- Modal 内 padding 16pt

**设计灵感**：`Apple Calendar` 新建事件 + `Things 3` 新建任务

---

### B.5 详情页

**Navigation**：
- 透明导航 + 返回 + 右上「⋯」菜单（编辑 / 复制 / 删除 / 分享）

**主体组件**：
- 顶部 Hero 区（占屏幕 40%）：
  - 当前主题的渲染效果（满屏沉浸）
  - 居中超大数字「32」（120pt）+ 单位
  - 标题在数字上方 + 目标日期在下方
- 中部信息区：
  - "今天" → "目标"时间轴
  - 起始日期 / 当前进度 / 已过 X 天 / 剩余 Y 天
  - 进度条（主题色填充）
- 底部操作区：
  - 大按钮「生成海报分享」（圆角 16pt + 主题色背景 + 白字）
  - 副按钮「添加到日历 / 添加到提醒事项」（系统标准灰色）

**交互逻辑**：
- 顶部 Hero 区可下拉拉伸（iOS 标准）
- 点击 Hero 区：进入"全屏壁纸预览模式"，可截图作为壁纸
- 分享按钮 → 海报生成 sheet（5 种海报模板选择）

**关键 UI 数值**：
- Hero 区高度 360pt
- 进度条高度 8pt，圆角 4pt
- 操作按钮高度 54pt

**设计灵感**：`Apple Music` 专辑页 hero + `Spark` 邮件详情

---

### B.6 主题市场

**Navigation**：
- 标题「主题市场」+ 右上「已购」按钮

**主体组件**：
- 顶部 Banner：「¥18 永久解锁全部主题」红色限时角标（仅前 30 天显示）
- 5 个主题大卡（垂直滚动，每卡片占屏幕 55% 高度）：
  - 顶部：3 张主题真实截图轮播（自动 3 秒切换）
  - 中部：主题名 + 一句话定位 + 风格标签 chips
  - 底部：单买按钮 ¥3 / 已购 / 灰色锁
- 底部：CTA「¥18 全部永久解锁」（吸顶按钮）
- 已购买后：CTA 变为「感谢支持，未来更新免费送」

**交互逻辑**：
- 点击主题卡 → 进入"主题预览页"（可在自己倒数日上预览，不付费看不到完整效果）
- 「¥18 全部解锁」→ 触发 IAP 弹窗（Apple 标准流程）
- 购买成功：撒花动画 + 「解锁完成，去切换主题」

**关键 UI 数值**：
- 卡片间距 12pt
- 截图轮播 1:1.6 比例（仿 App Store）
- CTA 按钮 height 54pt + bottom safe area

**设计灵感**：`Apple App Store` Today 卡片 + `Procreate` 笔刷市场

---

### B.7 设置页

**Navigation**：
- 标题「设置」

**主体组件**（iOS 标准 Group Form 样式）：

**Section 1: 同步**
- iCloud 同步（switch + 状态显示「上次同步 3 分钟前」）
- 飞书日历同步（V2，灰色 coming soon）

**Section 2: 提醒**
- 默认提醒时间（09:00）→ time picker
- 提醒方式（声音 / 振动 / 横幅）

**Section 3: 显示**
- 默认主题选择 → 跳转主题市场
- 首页默认视图（列表/卡片）
- 暗黑模式（跟随系统 / 强制开 / 强制关）
- 农历显示（开关）

**Section 4: 关于**
- 评价 App（跳转 App Store）
- 联系作者（mailto: 跳邮件）
- 隐私政策
- 用户协议
- 版本号 + Build

**Section 5: Pro**
- 「升级 Pro / 已购」入口

**交互逻辑**：
- 标准 iOS Settings 风格
- 每个 cell 点击都有 chevron 提示

**关键 UI 数值**：
- 标准 iOS Settings 间距
- Section 间距 24pt

**设计灵感**：`Apple Settings` + `Things 3 Settings`

---

## C. WidgetKit 实现要点

### C.1 五个尺寸支持

| 尺寸 | 名称 | 像素 (414w) | 用途 |
|---|---|---|---|
| systemSmall | 小 | 158x158pt | 单个倒数日精确显示 |
| systemMedium | 中 | 329x158pt | 标题 + 数字 + 装饰 |
| systemLarge | 大 | 329x345pt | 完整信息 + 图片 + 进度条 |
| accessoryCircular | 锁屏圆形 | 72x72pt（iOS 16+） | 仅数字 |
| accessoryRectangular | 锁屏矩形 | 172x72pt | 标题 + 数字 |

```swift
// Widget Configuration
@main
struct CountdownWidget: Widget {
    let kind: String = "CountdownWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(
            kind: kind,
            intent: SelectCountdownIntent.self,
            provider: CountdownProvider()
        ) { entry in
            CountdownWidgetView(entry: entry)
        }
        .configurationDisplayName("倒数日")
        .description("把重要的日子挂在桌面")
        .supportedFamilies([
            .systemSmall, .systemMedium, .systemLarge,
            .accessoryCircular, .accessoryRectangular
        ])
        .contentMarginsDisabled() // 让主题全屏铺满
    }
}
```

### C.2 数据同步机制（App Group + UserDefaults）

```swift
// 1. App 与 Widget 共享数据：必须用 App Group
// Apple Developer → Identifiers → 注册 App Group: "group.io.yourapp.countdown"

// 2. SwiftData 模型使用 App Group container
@Model
class Countdown {
    var id: UUID
    var title: String
    var targetDate: Date
    var emoji: String
    var themeID: String
    var unit: TimeUnit  // .day, .week, .month, .year
    // ...
}

// ModelContainer 配置 App Group
let config = ModelConfiguration(
    "Countdown",
    schema: schema,
    url: URL.applicationGroupURL(forSecurityApplicationGroupIdentifier: "group.io.yourapp.countdown")!
        .appendingPathComponent("Countdown.sqlite")
)

// 3. Widget Provider 读取
struct CountdownProvider: IntentTimelineProvider {
    func getTimeline(for configuration: SelectCountdownIntent,
                     in context: Context,
                     completion: @escaping (Timeline<CountdownEntry>) -> Void) {
        let countdown = fetchSelectedCountdown(id: configuration.countdownID)

        // 关键：生成多个 entry 覆盖未来 24 小时（每小时 1 个）
        var entries: [CountdownEntry] = []
        let now = Date()
        for hourOffset in 0..<24 {
            let date = Calendar.current.date(byAdding: .hour, value: hourOffset, to: now)!
            entries.append(CountdownEntry(date: date, countdown: countdown))
        }

        // 24 小时后刷新一次（节省电量）
        let timeline = Timeline(entries: entries, policy: .after(now.addingTimeInterval(86400)))
        completion(timeline)
    }
}

// 4. 主 App 更新后通知 Widget 刷新
import WidgetKit
func didSaveCountdown() {
    WidgetCenter.shared.reloadAllTimelines()
}
```

### C.3 刷新频率优化（节省电量）

**核心原则**：倒数日的数字一天只变一次（凌晨过零点）→ 不需要高频刷新。

```swift
// Policy 1: 每天凌晨刷新一次
let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
let timeline = Timeline(entries: entries, policy: .after(midnight))

// Policy 2: 只在数据变化时强制刷新（不依赖 timeline policy）
// 用户在 App 内编辑 → WidgetCenter.shared.reloadTimelines(ofKind:)

// Policy 3: 每个 entry 间隔 1 小时（应对时区变化、目标日变化）
```

**避免坑**：
- 不要 `.atEnd` policy，会高频抢资源
- 不要在 Widget 里做网络请求 → 全部本地数据
- relevance 设置：`TimelineEntryRelevance(score: 1.0)` 让重要倒数日优先显示

### C.4 锁屏小组件特殊处理（iOS 16+）

```swift
@ViewBuilder
var body: some View {
    switch family {
    case .accessoryCircular:
        Gauge(value: progress, in: 0...1) {
            Text(countdown.emoji)
        } currentValueLabel: {
            Text("\(daysLeft)")
                .font(.system(size: 16, weight: .bold))
        }
        .gaugeStyle(.accessoryCircular)
        .tint(themeColor)

    case .accessoryRectangular:
        VStack(alignment: .leading, spacing: 2) {
            Text(countdown.title)
                .font(.caption2)
                .lineLimit(1)
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text("\(daysLeft)")
                    .font(.system(size: 28, weight: .bold))
                Text("天")
                    .font(.caption)
            }
        }
        .widgetAccentable() // 让数字接受锁屏色调

    default:
        // systemSmall / Medium / Large 走主题渲染
        ThemedCountdownView(countdown: countdown, theme: theme, family: family)
    }
}
```

**关键点**：
- `widgetAccentable()` 让重要部分跟随锁屏色调
- 锁屏组件**不能有渐变 / 复杂背景**，会被系统单色化
- 只用 SF Symbols + 纯文字，不用 emoji（部分锁屏被压扁）

### C.5 关键代码骨架

```swift
// Theme 系统
protocol CountdownTheme {
    var id: String { get }
    var name: String { get }
    var colors: ThemeColors { get }
    var fonts: ThemeFonts { get }
    @ViewBuilder func smallView(_ countdown: Countdown) -> some View
    @ViewBuilder func mediumView(_ countdown: Countdown) -> some View
    @ViewBuilder func largeView(_ countdown: Countdown) -> some View
}

// 5 套主题各一个 struct 实现
struct PinkGirlyTheme: CountdownTheme { ... }
struct MinimalTheme: CountdownTheme { ... }
struct VintageFilmTheme: CountdownTheme { ... }
struct InkArtTheme: CountdownTheme { ... }
struct CyberpunkTheme: CountdownTheme { ... }

// Theme Registry
struct ThemeRegistry {
    static let all: [String: CountdownTheme] = [
        "pink": PinkGirlyTheme(),
        "minimal": MinimalTheme(),
        "film": VintageFilmTheme(),
        "ink": InkArtTheme(),
        "cyber": CyberpunkTheme()
    ]

    static func theme(for id: String) -> CountdownTheme {
        return all[id] ?? MinimalTheme()
    }
}

// 渲染
struct CountdownWidgetView: View {
    let entry: CountdownEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let theme = ThemeRegistry.theme(for: entry.countdown.themeID)
        switch family {
        case .systemSmall: theme.smallView(entry.countdown)
        case .systemMedium: theme.mediumView(entry.countdown)
        case .systemLarge: theme.largeView(entry.countdown)
        default: theme.smallView(entry.countdown)
        }
    }
}
```

---

## D. ASO 完整配置

### D.1 iOS 国区 App Store

**App 名称（30 字内）**：
- 首选：`倒数日 Pro · 桌面美图小组件`（13 字 + 8 字主键词全覆盖）
- 备选：`倒数日 Pro - 颜值倒计时纪念日`

**副标题（30 字内）**：
- 首选：`5 套主题 25+ 小组件 颜值担当`
- 备选：`高考考研婚礼纪念日 美图桌面`

**关键词字段（100 字）**：
```
倒数日,倒计时,纪念日,考研倒计时,高考倒计时,小组件,桌面美化,日历,日期,提醒,deadline,countdown,简约,胶片,少女风,主题
```
（精确 99 字符，覆盖品类词 + 长尾词 + 美学词）

**App 描述（4000 字以内）**：

```
把你最重要的日子，挂在 iPhone 桌面上。

【为什么我们不一样】
- 5 套精心打磨的主题：少女心 / 极简 / 复古胶片 / 国风 / 赛博朋克
- 25+ 桌面小组件，5 种尺寸（含锁屏组件）
- 一次买断 ¥18，永久使用，无订阅、无广告、无打扰

【适合谁】
- 想要桌面有仪式感的小红书少女
- 追工作 deadline 的极简党
- 纪念恋爱/结婚/旅行的文艺胶片党
- 高考/考研/雅思倒计时的学生
- 喜欢手账感和节气文化的人

【主题预览】
🎀 少女心 · 千禧粉色系
粉嫩果冻 + 蝴蝶结手写字，让你的桌面像 2002 年的 MSN

⬜ 极简 · 莫兰迪灰白
删掉所有装饰，只留日期与数字。Things 3 风格的纯粹美学

📷 复古胶片 · Kodak Gold 200
柯达胶卷的颜色 + 老打字机字体，每天都是一张老照片

🖋 国风 · 水墨节气
宋代山水画的留白 + 竖排宋体 + 朱砂印章。文人桌面就该这样

⚡ 赛博朋克 · Neon Tokyo
霓虹品红 + 电光青色 + 网格透视，把 2077 装进 iPhone

【桌面小组件】
- 小尺寸：单日精确显示，桌面节奏自由穿插
- 中尺寸：标题 + 数字 + 装饰，最适合的"主角位"
- 大尺寸：完整信息 + 用户照片 + 进度条
- 锁屏圆形 / 锁屏矩形（iOS 16+）：解锁前就能看到

【核心功能】
- 倒数 / 正数自由切换
- 天 / 周 / 月 / 年 / 周岁 时间单位
- 农历日期支持
- iCloud 跨设备同步
- 系统提醒（前 1/3/7 天 + 当日）
- 一键生成美图海报 → 分享小红书 / 朋友圈

【定价】
- 免费：3 个倒数日 + 默认主题
- ¥3 单主题永久解锁
- ¥18 全部主题永久解锁（推荐）

【为什么选我们】
- 不订阅：一次买断永久
- 不广告：付费版完全纯净
- 不推荐自家其他 App：菜单纯净
- 5 套主题 = ¥18，平均一套 ¥3.6，比一杯奶茶便宜

【联系作者】
@yourhandle / your.email@example.com
有问题、新主题需求、Bug 反馈，独立开发者本人回复
```

**8 张 App Store 截图设计**：

| # | 主题 | 内容 | 标题文案 |
|---|---|---|---|
| 1 | 少女心 | iPhone 桌面 + 中尺寸粉色组件 + 锁屏壁纸粉云 | 让桌面变成你的仪式感 |
| 2 | 5 主题预览 | 5 张主题卡纵向排列 | 5 套主题 任你切换 |
| 3 | 极简 | 中尺寸黑白组件 + Mac 同款 | 极简党也有专属美学 |
| 4 | 复古胶片 | 大尺寸胶片组件 + 木桌摆拍感 | 把胶卷的颜色挂在桌面 |
| 5 | 国风 | 大尺寸水墨组件 + 茶席背景 | 文人桌面 二十四节气 |
| 6 | 赛博朋克 | 4 个赛博组件方阵 | 程序员的 deadline 也要赛博 |
| 7 | 功能图 | 列表页 + 新建页 + 详情页拼图 | 倒数 正数 天周月年 自由 |
| 8 | 定价图 | ¥18 永久 + 5 套主题 + 无广告 | 一次买断 永久使用 |

### D.2 应用宝 ASO

**App 名称**：`倒数日 Pro - 桌面美图倒计时纪念日`
**一句话简介**：`5 套主题 25+ 小组件，桌面颜值担当`
**应用介绍**：

```
全网最美的倒数日，5 套主题 25+ 桌面小组件。

主打特色：
1. 主题美学：少女心 / 极简 / 复古胶片 / 国风 / 赛博朋克
2. 桌面小组件：5 种尺寸覆盖锁屏 + 主屏
3. 一次买断：¥18 永久解锁，无订阅
4. 跨设备同步：iCloud + 微信小程序（V2）

适合人群：考研考公倒计时、婚礼/纪念日、追 deadline 知识工作者、手账爱好者

零打扰、零推荐、零广告。独立开发者用心打磨。
```

### D.3 华为应用市场

**关键词**：`倒数日, 倒计时, 纪念日, 小组件, 桌面美化, 考研, 高考, 雅思, deadline`

**特色描述**：和应用宝一致，强调华为侧适配（鸿蒙桌面卡片）。

---

## E. 小红书种子内容 10 篇

每篇都以**首图截图为王**——首图必须美到让人想保存。

### E.1 「考研倒数 100 天，我的桌面治愈到哭」
- **图**：iPhone 桌面 + 中尺寸少女心组件「考研 100 天」+ 锁屏粉云壁纸
- **正文**：「考研到了瓶颈期，今天看到这个 App，5 套主题，我选了千禧粉色系，把考研日期挂在桌面正中。每天解锁手机第一眼看到"还剩 100 天"，竟然不慌了？反而有种"我有 100 天可以努力"的感觉。¥18 永久全部主题解锁，比每天一杯瑞幸划算。」
- **hashtag**：`#考研倒计时 #2027考研 #桌面美化 #ios小组件 #千禧少女风`

### E.2 「七夕粉色版倒数日，和他的纪念日要有仪式感」
- **图**：双 iPhone 摆拍（情侣手机）+ 各自主屏都是粉色「在一起 200 天」组件
- **正文**：「七夕来了，发现这个倒数日 App 有粉色专属主题，把我们在一起的天数挂在桌面，他也下载了一起挂。每天醒来第一眼是"在一起 200 天"。仪式感拉满。」
- **hashtag**：`#七夕 #情侣桌面 #倒数日 #小组件美化 #粉色控`

### E.3 「极简党的桌面美学，干净到极致的倒计时」
- **图**：黑白极简主题大尺寸组件 + MacBook + Bear 笔记同框
- **正文**：「试了 10 个倒数日 App，只有这个让我能用下去。极简党的桌面就该这样：纯白 + 数字 + 一根分隔线。¥18 解锁全部，但我只用极简一套。值。」
- **hashtag**：`#极简风 #桌面美化 #ios小组件 #things3 #设计师推荐`

### E.4 「胶片党的桌面诞生了——倒数日也能这么文艺」
- **图**：木桌 + 真实柯达胶卷 + iPhone 显示胶片主题组件「日本旅行 30 天」
- **正文**：「我是 VSCO 重度，桌面以前用各种胶片壁纸。今天发现这个 App 有"复古胶片"主题，柯达色调 + 老打字机字体 + 胶片齿孔，我直接氪了 ¥18。距离日本旅行 30 天，胶片倒计时陪我数。」
- **hashtag**：`#胶片日常 #vsco #复古风 #日本旅行 #桌面美化`

### E.5 「我的国风桌面，倒数日也能水墨味」
- **图**：iPhone 放在茶席旁 + 大尺寸水墨组件「距夏至 15 天」+ 建盏
- **正文**：「文化爱好者的桌面就该有节气感。这个 App 的国风主题，宋体竖排 + 朱砂印章 + 二十四节气标签，每天看心情都好。¥18 解锁，比买一本节气日历划算。」
- **hashtag**：`#国风 #节气 #文人桌面 #ios美化 #小众app`

### E.6 「程序员的赛博 deadline，倒数日也要霓虹」
- **图**：黑色机械键盘 + iPhone 显示赛博主题组件「上线 32 天」
- **正文**：「打工人的 deadline 也可以很赛博。这个 App 的赛博主题，霓虹品红 + 电光青色 + 故障字效，像极了我每天加班时的心情。¥18，5 套主题任选。」
- **hashtag**：`#cyberpunk #程序员 #deadline #ios桌面 #赛博朋克`

### E.7 「教你做出小红书爆款桌面——倒数日组件搭配教程」
- **图**：分屏对比图（before/after 同一桌面，加了组件后颜值倍增）
- **正文**：「桌面颜值博主的秘密武器：倒数日小组件！把生日/纪念日/旅行/考试挂在桌面，远看就是装饰画。教你 3 步搭配出小红书爆款桌面：1) 选主题（少女/极简任选）2) 选尺寸（中尺寸最百搭）3) 配合相应壁纸。」
- **hashtag**：`#桌面美化教程 #ios小组件 #小红书桌面 #改造记`

### E.8 「孕妈倒数：到预产期还有 60 天，每天都激动」
- **图**：iPhone 桌面 + 大尺寸少女心组件 + 婴儿房布置背景
- **正文**：「怀孕 30 周，把预产期挂在桌面，每天数着日子。这个 App 的少女主题特别适合记录"等宝宝"，蝴蝶结 + 粉色，每天看心情都软。」
- **hashtag**：`#孕妈日常 #预产期倒计时 #准妈妈 #桌面美化`

### E.9 「年中盘点：我用这个 App 记录了 8 件重要的事」
- **图**：iPhone 桌面 8 个不同尺寸组件方阵（生日/婚礼/旅行/考试/工作 deadline）
- **正文**：「半年盘点，我用倒数日 Pro 记录了 8 件重要的事，每天扫一眼就知道生活在向哪走。比 Notion 模板省事 100 倍。¥18，永久。」
- **hashtag**：`#年中盘点 #生活管理 #ios工具 #倒数日`

### E.10 「99% 的人不知道的 iOS 锁屏组件玩法」
- **图**：iPhone 锁屏 4 个 accessoryCircular 组件方阵 + 各种倒数日
- **正文**：「iOS 16+ 解锁壁纸前的圆形组件你用了吗？我的锁屏挂了 4 个倒数日：生日 / 旅行 / deadline / 纪念日。每次拿起手机都能看到，比解锁后再看快 1 秒。这个 App 完美支持锁屏组件。」
- **hashtag**：`#ios16 #锁屏组件 #小众玩法 #ios隐藏功能`

---

## F. 用户访谈脚本（30 分钟）

### F.1 招募

**渠道**：小红书私信 + 豆瓣 ios 小组发帖 + 学校群

**条件**：
- 18-30 岁女性 5 人 + 25-35 岁男性 3 人
- iPhone 用户，使用过 Days Matter 或类似 App 加分
- 愿意展示自己的桌面截图

**报酬**：30 元红包 / 一杯瑞幸

### F.2 脚本

**开场（2min）**
- 自我介绍：「我是独立开发者，正在做一个倒数日 App，想了解你们对桌面美化的真实想法，全程录音可以吗？」
- 暖场：「先问下你现在用的桌面壁纸 / 小组件能给我看下吗？」

**Section 1: 现状（5min）**
1. 你用什么 App 记重要日子？（日历 / 备忘录 / Days Matter / 不记）
2. 你的 iPhone 桌面有多少个小组件？分别是什么？
3. 你多久整理一次桌面？换壁纸频率？

**Section 2: 痛点验证（8min）**
4. 你有没有在小红书看过"桌面美化"博主？最喜欢哪种风格？
5. 你截图自己桌面发过小红书/朋友圈/微博吗？为什么发？
6. 现在用过的倒数日 App 有什么不满意？（追问：美观、功能、广告）
7. 你愿意为"好看的桌面组件"付费吗？心理价位？

**Section 3: 主题偏好测试（10min）**
8. 展示 5 套主题大图（不告诉价格）→ 让用户排序最喜欢的 → 追问为什么
9. 展示 ¥18 永久全部 vs ¥3 单买的方案 → 你会选哪个？
10. 假设朋友圈/小红书都在晒同一主题（如少女心），你会下载吗？

**Section 4: 桌面组件使用意愿（4min）**
11. 我刚展示的 5 个尺寸（小/中/大/锁屏圆/锁屏矩形），你会用哪几个？
12. 你的桌面已经被占满了，你会愿意把现有组件挤掉给倒数日吗？
13. 你愿意为了某个特定纪念日（生日/婚礼/考试）单独换一个尺寸吗？

**Section 5: 价格与决策（3min）**
14. ¥18 永久解锁 5 套主题，你的第一反应是？（直接买 / 先试免费 / 太贵 / 便宜）
15. 如果 App Store 评分 4.5（500 评分）、小红书有人晒过，会影响你下载吗？

**收尾（2min）**
- 「我会送一个测试版给你，可以反馈意见吗？」（建立用户池）
- 红包发放 + 加微信

### F.3 关键判断指标

| 维度 | 通过线 | 警示线 |
|---|---|---|
| 5 套主题中至少 1 套被 70% 用户排第 1 或第 2 | 通过 | <50% 需重新设计 |
| ¥18 价格接受度 | ≥60% 直接付 | <40% 需降价 |
| 锁屏组件使用意愿 | ≥40% 会用 | <20% 砍掉 |
| 桌面截图意愿 | ≥50% 会发小红书 | <30% 病毒传播失败 |

---

## G. 数据埋点设计

### G.1 关键事件清单

| 事件 | 时机 | 参数 |
|---|---|---|
| `app_launch` | 启动 | is_first / device / os_version |
| `onboarding_complete` | 引导结束 | page_skipped |
| `countdown_create` | 新建保存 | unit / has_emoji / has_image / theme_id |
| `countdown_edit` | 编辑保存 | countdown_id / changed_fields |
| `countdown_delete` | 删除 | countdown_id / days_since_create |
| `countdown_view` | 详情查看 | countdown_id / source（列表/卡片）|
| `widget_add` | 桌面添加（间接监测：进入"添加小组件指南页" + 24h 后看 widget refresh）| family / theme_id |
| `theme_preview` | 主题市场预览 | theme_id |
| `theme_purchase_start` | 触发 IAP | sku（single / all / premium）|
| `theme_purchase_success` | 付费成功 | sku / amount |
| `theme_purchase_fail` | 付费失败 | sku / reason |
| `poster_generate` | 生成海报 | template_id / theme_id |
| `poster_share` | 分享出去 | channel（小红书 / 朋友圈 / 微信 / Save）|
| `icloud_sync_success` | iCloud 同步成功 | count_synced |
| `notification_received` | 通知送达 | countdown_id / days_before |
| `notification_clicked` | 点击通知 | countdown_id |
| `app_rate` | 评价跳转 | rating（如能拿到）|

### G.2 转化漏斗

```
启动用户 (100%)
  ↓
完成引导 (90%)
  ↓
创建第一个倒数日 (75%)
  ↓
触发添加小组件指南 (50%)
  ↓
桌面添加小组件 (40%) ← 北极星
  ↓
进入主题市场 (35%)
  ↓
触发付费弹窗 (20%)
  ↓
完成付费 (5-8%) ← 商业北极星
  ↓
生成海报 (30%)
  ↓
分享出去 (20%)
```

### G.3 北极星

**主北极星：桌面小组件添加率（D7 内）**
- 目标：60%+
- 监测方式：Widget 第一次刷新事件 + UserDefaults 标记

**辅北极星 1：付费转化率**
- 目标：5-8%
- 路径：免费用户创建第 4 个倒数日触发付费 / 主题市场入口

**辅北极星 2：海报分享率（D30）**
- 目标：20%+
- 这是病毒系数 K，决定能否长出小红书爆款

### G.4 监控工具

- **Apple App Store Connect**：自带分析（保留登 + 留存）
- **Firebase Analytics**：事件 + 漏斗（免费）
- **RevenueCat**：付费数据（每月 < 1 万 MAU 免费）
- **TestFlight**：beta 测试期数据

---

## H. 第一周 Daily Plan

每天 6-8 小时净 coding，主题打磨是大头。

### Day 1（周一）- 项目骨架 + 数据模型

**上午 4h**：
- Xcode 新项目（SwiftUI + iOS 16+ target）
- 注册 App Group `group.io.yourapp.countdown`
- 配置 Bundle ID 多 target（主 App + Widget Extension）
- SwiftData 模型：`Countdown` + `Theme` + `UserSettings`
- 数据 seeding：插入 3 个示例倒数日

**下午 4h**：
- 列表页（B.2）+ 卡片页（B.3）+ TabBar 框架
- 占位 emoji 图标 + 标准 iOS UI 不上主题

**晚上**：浏览 Pinterest/Dribbble 收集 5 套主题灵感图各 20 张，存到 figma 参考板

**输出**：项目能跑，列表展示 3 个 mock 倒数日

### Day 2（周二）- 新建/编辑 + 详情页

**上午 4h**：
- 新建页（B.4）所有 Form 字段
- emoji picker
- DatePicker（含农历切换）

**下午 4h**：
- 详情页（B.5）Hero 区
- iCloud 同步框架（CloudKit + SwiftData，先打通）

**晚上**：开始 5 套主题的**第一套：少女心**主题设计稿（Figma 画 small/medium/large 3 张图）

**输出**：完成单流闭环（新建 → 列表 → 详情 → 编辑 → 删除）

### Day 3（周三）- WidgetKit MVP

**上午 4h**：
- Widget Extension 配置
- Provider 实现（读取共享数据）
- 默认主题（极简）的 small/medium/large 3 个 View

**下午 4h**：
- 锁屏组件 accessoryCircular + accessoryRectangular
- 真机测试：能否添加到桌面 / 锁屏

**晚上**：少女心主题第 2 张设计稿 + 极简主题 3 张设计稿

**输出**：默认主题 5 个尺寸 widget 真机跑通

### Day 4（周四）- 主题系统 + 第一套主题

**上午 4h**：
- 主题协议 `CountdownTheme` 抽象
- 主题注册中心 `ThemeRegistry`
- **少女心主题** small / medium / large 3 个 SwiftUI View 实现

**下午 4h**：
- **极简主题**实现
- 主题切换：新建页 + 主题市场预览

**晚上**：复古胶片主题设计稿 + 国风主题设计稿（设计是重要资产）

**输出**：2 套主题 widget 真机可切换

### Day 5（周五）- 第 3-4 套主题 + 付费

**上午 4h**：
- 复古胶片主题实现（颗粒/齿孔/印章是难点）
- 国风主题实现（竖排支持 + 农历日期）

**下午 4h**：
- 主题市场页（B.6）
- StoreKit 2 集成（一次性 IAP）
- 单主题 ¥3 + 全主题 ¥18 + Pro ¥38 三个 SKU

**晚上**：赛博朋克主题设计稿

**输出**：4 套主题 + 付费流程跑通（沙盒测试）

### Day 6（周六）- 第 5 套主题 + 海报 + 提醒

**上午 4h**：
- 赛博朋克主题实现（霓虹发光 + 网格透视是难点）
- 5 套主题全完成 ✅

**下午 4h**：
- 海报生成（一键截屏 + 5 种海报模板）
- UNNotification 提醒框架

**晚上**：3 张截图拍摄（用 5 套主题在真实桌面摆拍）

**输出**：5 套主题 + 海报 + 提醒 + 真实 ASO 素材

### Day 7（周日）- 打磨 + 真机测试 + ASO 准备

**上午 4h**：
- 设置页（B.7）完整
- 启动引导 3 屏（B.1）
- 暗黑模式适配

**下午 4h**：
- 8 张 App Store 截图制作（用真机截图 + Sketch/Figma 加文案）
- App 描述 4000 字定稿
- 关键词布局复审

**晚上**：
- TestFlight 内测发布
- 小红书 10 篇种子内容素材准备（首图必须美）

**输出**：可上架的完整版本 + ASO 素材包

### Week 1 后展望

- Week 2：TestFlight 内测 50 人 → 修 bug → App Store 提审
- Week 3：审核通过 + 上架 + 小红书 10 篇连发 + 少数派投稿
- Week 4：监控 ASO + 修 bug + 应用宝 / 华为多渠道

---

## 关键资产清单

- 5 套主题 Figma 设计稿
- 8 张 App Store 截图
- 10 张小红书首图（每篇 1 张）
- 主题包 SVG 装饰素材库（蝴蝶结/胶片齿孔/朱砂印章/霓虹边框 各 5-10 个）
- 自绘 emoji 24 个（少女心套）
- ASO 关键词清单
- 用户访谈录音 + 关键判断结论

---

**End of Document**
