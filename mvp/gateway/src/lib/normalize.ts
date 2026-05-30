/**
 * Shared text-normalization utility for compliance keyword matching.
 *
 * Audit refs: A1 F-01/F-02/F-03/F-07, A5-01/A5-02.
 *
 * Naive `toLowerCase().includes(kw)` substring matching is trivially bypassed by:
 *   - inserted ASCII / full-width whitespace      ("自 杀", "自　杀")
 *   - inserted zero-width / invisible code points  ("自​杀", "自⁤杀")
 *   - inserted punctuation / separators            ("自。杀", "多·菌·灵")
 *   - full-width digits / colons                   ("１：１０００")
 *   - traditional-Chinese variants                 ("自殺", "多菌靈")
 *
 * `normalizeForMatch()` collapses all of the above into a canonical form so the
 * SAME normalization can be applied to BOTH the haystack text and each keyword,
 * then matched with a plain `includes`. NFKC handles full-width→half-width and a
 * subset of compatibility folding; a small Trad→Simp map covers the high-risk
 * compliance terms that NFKC does NOT fold (NFKC is not a trad/simp converter).
 *
 * IMPORTANT — false-positive guard:
 *   We only strip whitespace, invisible chars, and *punctuation/symbol* code
 *   points. We do NOT strip letters/ideographs, so non-adjacent keyword chars
 *   separated by real words (e.g. "大自然…从不杀生") stay non-adjacent and do
 *   NOT collapse into a keyword. This keeps "爱护动物从不杀生" at level 0 while
 *   still catching "自。杀".
 */

/**
 * Traditional → Simplified folding map, scoped to characters that appear in the
 * compliance keyword tables (crisis keywords + pesticide names + 05 forbidden
 * terms). NFKC does not perform trad→simp folding, so we do it explicitly.
 *
 * Keep this list tight and reviewable — it is a compliance surface, not a
 * general-purpose converter. Each entry maps a single trad codepoint to its
 * simp form so that, after folding, a traditional phrase becomes byte-identical
 * to the simplified keyword it is meant to evade.
 */
const TRAD_TO_SIMP: Record<string, string> = {
  // --- crisis terms (04) ---
  殺: '杀', // 自殺 / 殺了自己
  結: '结', // 結束生命 / 結束自己
  輕: '轻', // 輕生
  傷: '伤', // 傷害自己
  斷: '断', // 了斷
  劃: '划', // 劃自己
  燒: '烧', // 燒自己
  離: '离', // 永遠離開 / 分離焦慮
  遠: '远', // 永遠離開
  著: '着', // 活著沒意思
  沒: '没', // 沒意思 / 沒人懂 / 沒希望
  絕: '绝', // 絕望
  潰: '溃', // 崩潰
  撐: '撑', // 撐不住 / 撐不下去
  慮: '虑', // 焦慮
  擺: '摆', // 擺爛
  爛: '烂', // 擺爛
  夢: '梦', // 夢裡
  願: '愿',
  // --- pesticide terms (03) ---
  靈: '灵', // 多菌靈
  劑: '剂', // 乳劑 / 粉劑
  鏈: '链', // 鏈霉素
  黴: '霉', // 嘧黴胺
  鋅: '锌', // 代森錳鋅 / 代森鋅 / 丙森鋅
  錳: '锰', // 代森錳鋅
  蟎: '螨', // 哒螨灵 / 螺螨酯 / 炔螨特
  噠: '哒', // 噠螨灵
  醯: '酰', // 氯虫苯甲酰胺
  鹼: '碱',
  // --- forbidden output terms (05) ---
  獸: '兽', // 獸醫
  醫: '医', // 獸醫
};

/**
 * Code points to delete entirely before matching. Written with \u escapes (not
 * literal invisible chars) so the set is auditable in source. Covers:
 *  - all ASCII/Unicode whitespace via \s (full-width space U+3000 also folds to
 *    a normal space under NFKC, then matched by \s)
 *  - zero-width & invisible formatting chars that \s does NOT match:
 *      U+200B ZERO WIDTH SPACE … U+200F (zero-width + bidi marks)
 *      U+202A…U+202E   bidi embedding/override
 *      U+2060…U+2064   word joiner / invisible operators (incl. U+2064)
 *      U+206A…U+206F   deprecated format chars
 *      U+FEFF          zero width no-break space / BOM
 *      U+00AD          soft hyphen
 *      U+180E          Mongolian vowel separator
 */
const STRIP_INVISIBLE =
  /[\s\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\uFEFF\u00AD\u180E]/gu;

/**
 * Fold every Traditional code point present in TRAD_TO_SIMP to its Simplified
 * form. Done char-by-char so it is order-independent and total.
 */
function foldTraditional(s: string): string {
  let out = '';
  for (const ch of s) {
    out += TRAD_TO_SIMP[ch] ?? ch;
  }
  return out;
}

/**
 * NFKC-fold + remove zero-width / invisible formatting chars ONLY (regular
 * whitespace, punctuation and case are preserved). Use this when a downstream
 * regex relies on structural punctuation (":", "%", "/", ".") and its own
 * `\s*`, e.g. the dosage/ratio patterns in lintAction. Full-width digits and
 * colons fold to ASCII so "１：１０００" → "1:1000".
 */
const STRIP_ZERO_WIDTH =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\uFEFF\u00AD\u180E]/gu;

export function nfkcStripZeroWidth(text: string): string {
  if (!text) return '';
  return text.normalize('NFKC').replace(STRIP_ZERO_WIDTH, '');
}

/**
 * Canonicalize text for compliance keyword matching. Apply the SAME function to
 * both the text being scanned and each keyword before comparing.
 *
 * @param text raw input (user text or LLM output, or a keyword)
 * @param opts.stripPunct also strip Unicode punctuation/symbols (default true).
 *   Use for CJK keyword matching where chars can be split by "。", "·", etc.
 *   English phrase keywords with internal spaces still match because whitespace
 *   is always stripped on both sides.
 */
export function normalizeForMatch(
  text: string,
  opts: { stripPunct?: boolean } = {},
): string {
  const stripPunct = opts.stripPunct ?? true;
  if (!text) return '';
  let s = text.normalize('NFKC');
  s = foldTraditional(s);
  s = s.replace(STRIP_INVISIBLE, '');
  if (stripPunct) {
    // Remove Unicode punctuation (P*) and symbols (S*) so inserted separators
    // like 。 · ， - _ * etc. cannot break a keyword apart. Letters/numbers/
    // ideographs (L*, N*, M*) are preserved, so real words still separate
    // non-adjacent keyword chars.
    s = s.replace(/[\p{P}\p{S}]/gu, '');
  }
  return s.toLowerCase();
}
