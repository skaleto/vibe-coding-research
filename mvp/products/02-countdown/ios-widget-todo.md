# iOS WidgetKit TODO · 倒数日 Pro

> **目的**：Web MVP 只承担"5 主题 + 海报截图分享"的功能验证；真实的桌面 / 锁屏小组件必须由原生 iOS Widget Extension 实现。本文件给后续 Native 工程接力时一份完整路线图。
>
> **配套阅读**：[`light-products/detail-02-countdown.md § C`](../../../light-products/detail-02-countdown.md)（WidgetKit Swift 骨架原文）以及本仓库 [`lib/themes.ts`](./lib/themes.ts)（5 套主题数据）。

---

## 1. 实现优先级

| Phase | 内容 | 估时 | 风险 |
|---|---|---|---|
| P0 | `systemSmall` + `systemMedium`（极简主题保底） | 1 天 | 低，主线必出 |
| P1 | 4 套主题（少女 / 极简 / 胶片 / 国风）覆盖 small + medium | 1 天 | 字体落地、图素材打包 |
| P2 | `systemLarge` 三个尺寸的进度条 + 配图 | 0.5 天 | 用户照片裁切 + 圆角 |
| P3 | `accessoryCircular` + `accessoryRectangular` 锁屏组件 | 0.5 天 | 单色化适配 |
| P4 | 赛博朋克主题（霓虹外发光最难） | 0.5 天 | SwiftUI 阴影叠加性能 |

---

## 2. Widget 五个尺寸

| Family | 像素 (414w) | 主用途 |
|---|---|---|
| `.systemSmall` | 158×158 pt | 单倒数日精确显示 |
| `.systemMedium` | 329×158 pt | 标题 + 数字 + 装饰 |
| `.systemLarge` | 329×345 pt | 完整信息 + 用户照片 + 进度条 |
| `.accessoryCircular` | 72×72 pt | 仅数字（iOS 16+） |
| `.accessoryRectangular` | 172×72 pt | 标题 + 数字 |

`.contentMarginsDisabled()` 让主题全屏铺满，不要让 WidgetKit 自动加上 16pt padding。

---

## 3. Swift 骨架（拷自 detail-02 § C，并已与 web MVP 对齐）

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
        .contentMarginsDisabled()
    }
}
```

```swift
// Theme 协议（与 web 端 lib/themes.ts 中 5 套主题数据 1:1 对齐）
protocol CountdownTheme {
    var id: String { get }
    var name: String { get }
    var colors: ThemeColors { get }
    var fonts: ThemeFonts { get }
    @ViewBuilder func smallView(_ countdown: Countdown) -> some View
    @ViewBuilder func mediumView(_ countdown: Countdown) -> some View
    @ViewBuilder func largeView(_ countdown: Countdown) -> some View
}

struct PinkGirlyTheme: CountdownTheme { /* hex from web themes.ts */ }
struct MinimalTheme: CountdownTheme { ... }
struct VintageFilmTheme: CountdownTheme { ... }
struct InkArtTheme: CountdownTheme { ... }
struct CyberpunkTheme: CountdownTheme { ... }

struct ThemeRegistry {
    static let all: [String: CountdownTheme] = [
        "pink": PinkGirlyTheme(),
        "minimal": MinimalTheme(),
        "film": VintageFilmTheme(),
        "ink": InkArtTheme(),
        "cyber": CyberpunkTheme()
    ]
    static func theme(for id: String) -> CountdownTheme {
        all[id] ?? MinimalTheme()
    }
}
```

```swift
// 锁屏单色适配
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
        .widgetAccentable()

    default:
        ThemedCountdownView(countdown: countdown, theme: theme, family: family)
    }
}
```

---

## 4. 数据同步（App Group + SwiftData / UserDefaults）

| 配置项 | 值 |
|---|---|
| App Group ID | `group.io.countdown-pro.app` |
| Shared Container 文件 | `Countdown.sqlite`（SwiftData） |
| UserDefaults Suite | `group.io.countdown-pro.app` |
| UserDefaults Keys | `cards`, `settings`, `defaultTheme`, `lastSync` |

**关键点**：
- iOS 端把 web localStorage 内容（cards + settings JSON）一次性写入 App Group 的 SwiftData，新增 / 编辑同步写。
- Widget Provider **不写数据**，只读。
- 任何 App 内 mutation 末尾 `WidgetCenter.shared.reloadAllTimelines()`。

```swift
let suite = UserDefaults(suiteName: "group.io.countdown-pro.app")!
if let data = suite.data(forKey: "cards"),
   let decoded = try? JSONDecoder().decode([CountdownDTO].self, from: data) {
    // hydrate Widget state
}
```

---

## 5. Timeline Provider 刷新频率

倒数日数字一天只变一次（凌晨过零点），不要高频刷新。

```swift
struct CountdownProvider: IntentTimelineProvider {
    func getTimeline(for configuration: SelectCountdownIntent,
                     in context: Context,
                     completion: @escaping (Timeline<CountdownEntry>) -> Void) {
        let countdown = fetchSelectedCountdown(id: configuration.countdownID)

        var entries: [CountdownEntry] = []
        let now = Date()
        // 24 个 entries 覆盖未来 24 小时（每小时 1 个），抵御时区变化 / 跨日
        for hourOffset in 0..<24 {
            let date = Calendar.current.date(byAdding: .hour, value: hourOffset, to: now)!
            entries.append(CountdownEntry(date: date, countdown: countdown))
        }

        // 24 小时后刷新一次（节省电量）
        let midnight = Calendar.current.startOfDay(for: now.addingTimeInterval(86400))
        let timeline = Timeline(entries: entries, policy: .after(midnight))
        completion(timeline)
    }
}
```

**避免坑**：
- 禁用 `.atEnd` policy。
- Widget 内禁止网络请求，全部本地数据。
- `TimelineEntryRelevance(score: 1.0)` 让重要倒数日优先显示在 Smart Stack。

---

## 6. 锁屏组件的特殊点（iOS 16+）

- 锁屏组件会被系统单色化。**不要**用渐变 / 多色装饰。
- 只用 SF Symbols + 文字。emoji 在部分锁屏上会被压扁，慎用。
- `widgetAccentable()` 让数字接受锁屏色调。
- 对 `accessoryCircular` 用 `Gauge` 而不是手画进度条 — 系统会自动适配 Smart Stack。

---

## 7. 与 Web MVP 的字段对照

`lib/types.ts` 的 `Countdown` 与 iOS DTO 一一对应：

```swift
struct CountdownDTO: Codable, Identifiable {
    let id: String              // uuid
    let title: String
    let targetDate: String      // ISO yyyy-MM-dd
    let type: String            // "countdown" | "countup"
    let emoji: String
    let theme: String           // "pink" | "minimal" | "film" | "ink" | "cyber"
    let note: String
    let createdAt: String
    let updatedAt: String
    let unit: String            // "day" | "week" | "month" | "year"
    let notify: Bool
}
```

主题色 hex 严格沿用 `lib/themes.ts`：

| ThemeId | primary | secondary | bg | accent |
|---|---|---|---|---|
| pink | `#FF6B9D` | `#FFB3D1` | `#FFE0EC` | `#FFD700` |
| minimal | `#1A1A1A` | `#666666` | `#FAFAFA` | `#FF3B30` |
| film | `#C84B31` | `#8B5A3C` | `#F5E6D3` | `#D4943F` |
| ink | `#1C1C1C` | `#7A1F1F` | `#F4F1E8` | `#5C7A3C` |
| cyber | `#FF006E` | `#00F5FF` | `#0A0E27` | `#FFEE00` |

---

## 8. 集成顺序（M0 第二周）

1. Xcode 新建 iOS App + Widget Extension target
2. 启用 App Group capability + 注册 `group.io.countdown-pro.app`
3. SwiftData schema 同 `CountdownDTO`，跑通 Add / Edit / Delete
4. P0 极简主题 `systemSmall` + `systemMedium` 上真机
5. P1 加 4 套主题 → 真机切换 → 截图测试 ASO 素材
6. P2 大尺寸 + 用户上传照片裁切
7. P3 锁屏组件单色适配测试
8. P4 赛博朋克外发光 + 故障字效（最难，留到最后）
9. WidgetCenter reload 接所有 mutation 点
10. TestFlight 内测 → 应用商店上架

---

## 9. 验收清单

- [ ] 5 套主题 × 3 尺寸 = 15 个 widget view 全部真机渲染正确
- [ ] 锁屏 accessoryCircular / accessoryRectangular 单色化无错位
- [ ] App Group 读写 race condition 测试通过
- [ ] iCloud 同步（CloudKit + SwiftData）在弱网 / 离线 / 冲突场景无数据丢失
- [ ] WidgetCenter.reloadAllTimelines 接到 every mutation 点
- [ ] 5 套主题截图（小尺寸 + 中尺寸 + 大尺寸）全部进 App Store 截图素材包
- [ ] 真机功耗测试：1 小时静置不超过 1% 电量消耗
