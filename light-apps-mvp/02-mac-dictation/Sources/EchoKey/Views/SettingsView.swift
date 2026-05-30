import SwiftUI

/// 设置面板：引擎/模型选择、语言（中/英/中英混）、热键、注入策略、词典。
///
/// 改动后调用 `appState.applySettings()` 重建依赖设置的子系统（引擎/词典/热键）。
struct SettingsView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        TabView {
            generalTab
                .tabItem { Label("通用", systemImage: "gearshape") }
            vocabularyTab
                .tabItem { Label("词典", systemImage: "character.book.closed") }
        }
        .frame(width: 460, height: 420)
        .padding()
    }

    // MARK: - 通用

    private var generalTab: some View {
        Form {
            Section("转写引擎") {
                Picker("引擎", selection: $appState.settings.engineKind) {
                    ForEach(EngineKind.allCases) { Text($0.displayName).tag($0) }
                }
                if appState.settings.engineKind == .whisperKit {
                    Picker("模型", selection: $appState.settings.whisperModel) {
                        ForEach(WhisperModel.allCases) {
                            Text("\($0.displayName)（\($0.approxSize)）").tag($0)
                        }
                    }
                    Text("首次使用会下载模型，之后永久离线。")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }

            Section("语言") {
                // 中英混说是核心卖点，放在最显眼处。
                Picker("听写语言", selection: $appState.settings.language) {
                    ForEach(DictationLanguage.allCases) { Text($0.displayName).tag($0) }
                }
                Text("「中英混说」让模型在中/英文之间自动切换，专为中文开发者口述技术内容设计。")
                    .font(.caption).foregroundStyle(.secondary)
            }

            Section("热键") {
                HStack {
                    Text("听写热键")
                    Spacer()
                    Text(appState.settings.hotkey.displayString)
                        .foregroundStyle(.secondary)
                    // 真机：点击进入"录制热键"模式，捕获下一个组合键写回 settings.hotkey。
                    // 骨架先展示当前值；录制 UI 留作实现点。
                    Button("更改…") { /* TODO(真机)：弹出热键录制器 */ }
                        .disabled(true)
                        .help("热键录制器需真机实现")
                }
                Text("按住该键说话，松开停止并转写。")
                    .font(.caption).foregroundStyle(.secondary)
            }

            Section("文本注入方式") {
                Picker("注入", selection: $appState.settings.injectionStrategy) {
                    ForEach(InjectionStrategy.allCases) { Text($0.displayName).tag($0) }
                }
                Text("需在『系统设置 ▸ 隐私与安全性 ▸ 辅助功能』授权 EchoKey。")
                    .font(.caption).foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .onChange(of: appState.settings) { _ in
            appState.applySettings()
        }
    }

    // MARK: - 词典

    private var vocabularyTab: some View {
        VStack(alignment: .leading) {
            Text("自定义词典")
                .font(.headline)
            Text("把听写常错的技术词/术语教给 EchoKey，例如 graph cool → GraphQL。")
                .font(.caption).foregroundStyle(.secondary)

            List {
                ForEach($appState.settings.vocabularyEntries) { $entry in
                    HStack {
                        TextField("听错的写法", text: $entry.wrong)
                        Image(systemName: "arrow.right")
                        TextField("正确写法", text: $entry.right)
                    }
                }
                .onDelete { appState.settings.vocabularyEntries.remove(atOffsets: $0) }
            }

            HStack {
                Button {
                    appState.settings.vocabularyEntries.append(
                        VocabularyEntry(wrong: "", right: "")
                    )
                } label: { Label("添加词条", systemImage: "plus") }
                Spacer()
            }
        }
        .padding(.top)
        .onChange(of: appState.settings) { _ in
            appState.applySettings()
        }
    }
}
