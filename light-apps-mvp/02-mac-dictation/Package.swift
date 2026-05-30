// swift-tools-version: 5.9
// EchoKey — 本地语音听写（菜单栏 MVP 骨架）
//
// 这是一个 SwiftPM 可执行包，方便"不开 Xcode 也能看清结构 + 直接 swift build"。
// 真正发布产品时，建议用 Xcode 工程 (.xcodeproj) 以便配置：
//   - Info.plist（麦克风/语音识别权限说明，本仓库已附 Info.plist 供参考）
//   - App Sandbox / Hardened Runtime / 代码签名
//   - WhisperKit 的 CoreML 模型打包
//
// 关于 WhisperKit 依赖（端侧转写真实实现）：
//   默认 **不** 在依赖图里引入 WhisperKit，原因是它会触发网络拉取 + 较重的
//   CoreML 编译，离线/CI 环境会失败。MVP 用 MockEngine 即可跑通全链路。
//   要接真实转写时，取消下面注释即可（详见 README「接入 WhisperKit」一节）。

import PackageDescription

let package = Package(
    name: "EchoKey",
    platforms: [
        // MenuBarExtra 需要 macOS 13+；端侧后处理（Apple Foundation Models）需更高版本。
        .macOS(.v13)
    ],
    products: [
        .executable(name: "EchoKey", targets: ["EchoKey"])
    ],
    dependencies: [
        // 取消注释以接入真实端侧转写引擎（中英混说核心卖点靠 multilingual 模型）：
        // .package(url: "https://github.com/argmaxinc/WhisperKit.git", from: "0.9.0"),
    ],
    targets: [
        .executableTarget(
            name: "EchoKey",
            dependencies: [
                // 取消注释以把 WhisperKit 链接进 EchoKey（同时取消 WhisperKitEngine.swift 顶部的实现宏）：
                // .product(name: "WhisperKit", package: "WhisperKit"),
            ],
            path: "Sources/EchoKey",
            // 把 Info.plist 作为资源参考（SwiftPM 可执行包不会真正把它当作 bundle Info.plist 注入，
            // 真机请在 Xcode 工程里设置 INFOPLIST_FILE = Info.plist）。
            linkerSettings: [
                // Carbon：全局热键 RegisterEventHotKey 所在框架。
                .linkedFramework("Carbon"),
                // AppKit：NSWorkspace / NSPasteboard 等系统集成。
                .linkedFramework("AppKit")
            ]
        )
    ]
)
