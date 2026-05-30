import Foundation

/// 一条自定义词典项：把听写常错的 `wrong` 纠正成 `right`。
///
/// 这是产品差异化的具体抓手之一：开发者抱怨"GraphQL 被打成 graph cool"、
/// 技术术语准确率只有 60–70%，词典让用户把自己领域的词一次性教给工具。
struct VocabularyEntry: Codable, Equatable, Identifiable {
    var id = UUID()
    var wrong: String       // 听写易错写法（大小写不敏感匹配）
    var right: String       // 期望的正确写法
    var caseSensitive: Bool = false

    /// 内置默认词典：覆盖最高频的技术词错听 + 中英混说常见场景。
    static let defaults: [VocabularyEntry] = [
        VocabularyEntry(wrong: "graph cool", right: "GraphQL"),
        VocabularyEntry(wrong: "kubernet", right: "Kubernetes"),
        VocabularyEntry(wrong: "kuber netes", right: "Kubernetes"),
        VocabularyEntry(wrong: "java script", right: "JavaScript"),
        VocabularyEntry(wrong: "type script", right: "TypeScript"),
        VocabularyEntry(wrong: "git hub", right: "GitHub"),
        VocabularyEntry(wrong: "pull request", right: "PR"),
        VocabularyEntry(wrong: "api", right: "API", caseSensitive: false)
    ]
}

/// 词典纠错器 —— **完整逻辑**（非占位）。
///
/// 在转写文本注入前跑一遍替换。当前实现是"大小写不敏感的整词/子串替换"，
/// 足够 MVP；P1 可升级为带词边界、拼音相似度、上下文感知的纠错。
final class Vocabulary {
    private let entries: [VocabularyEntry]

    init(entries: [VocabularyEntry]) {
        // 按 wrong 长度降序：先替换更长的短语，避免短词先替导致长短语错配。
        self.entries = entries.sorted { $0.wrong.count > $1.wrong.count }
    }

    /// 对一段转写文本做词典纠错，返回纠正后的文本。
    func correct(_ text: String) -> String {
        var result = text
        for entry in entries where !entry.wrong.isEmpty {
            let options: String.CompareOptions = entry.caseSensitive ? [] : [.caseInsensitive]
            result = result.replacingOccurrences(
                of: entry.wrong,
                with: entry.right,
                options: options,
                range: nil
            )
        }
        return result
    }
}
