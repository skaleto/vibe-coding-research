/**
 * 典故白名单校验
 *
 * MVP 硬门槛：每个 LLM 返回的名字必须能在本地典故库中校验出处。
 * 校验失败的名字会被标记 verified=false，结果页显示橙色警告。
 *
 * 数据库结构：lib/classics-db.json
 *   entries: [{ book, chapter, verses: string[] }]
 */

import classicsDb from './classics-db.json';

type ClassicEntry = {
  book: string;
  chapter: string;
  verses: string[];
};

type ClassicsDb = {
  version: string;
  updated_at: string;
  note: string;
  entries: ClassicEntry[];
};

const db = classicsDb as ClassicsDb;

/**
 * 把中文文本标准化：去除空白、标点、半角全角差异
 * 这样 "知微知章" 能匹配到 "知微知章，唯思唯念"
 */
function normalize(text: string): string {
  return text
    .replace(/[\s　]/g, '') // 去空白
    .replace(/[，。、；：！？""''「」『』《》（）()【】\[\]·…—-]/g, '') // 去标点
    .toLowerCase();
}

/**
 * 标准化书名匹配：去除书名号、空格、版本前缀
 * "《诗经·小雅·节南山》" → "诗经"
 * "诗经·小雅·节南山" → "诗经"
 */
function extractBookName(input: string): string {
  const cleaned = input.replace(/[《》]/g, '').trim();
  // 取第一段（用 · 或 . 或 - 分隔）
  const first = cleaned.split(/[·.\-_]/)[0];
  return first?.trim() ?? cleaned;
}

/**
 * 标准化章节：去除前缀的书名、书名号
 * "《诗经·小雅·节南山》" → "小雅·节南山"
 * "小雅·节南山" → "小雅·节南山"
 */
function extractChapter(input: string): string {
  const cleaned = input.replace(/[《》]/g, '').trim();
  // 如果含 ·，先尝试去掉第一段（书名）
  if (cleaned.includes('·')) {
    const parts = cleaned.split('·');
    // 第一段如果是已知书名，去掉
    const firstPart = parts[0];
    if (firstPart && ['诗经', '楚辞', '唐诗', '宋词', '论语', '周易', '尚书', '礼记'].includes(firstPart)) {
      return parts.slice(1).join('·');
    }
  }
  return cleaned;
}

export type VerifyResult = {
  verified: boolean;
  matched_book?: string;
  matched_chapter?: string;
  matched_verse?: string;
  reason?: string;
};

/**
 * 校验某段引文是否真实出处。
 *
 * @param book 书名（如 "诗经" 或 "《诗经·小雅·节南山》"）
 * @param chapter 章节（如 "小雅·节南山"）
 * @param quote 原文句子（10-30 字，如 "知微知章"）
 */
export function verifyQuote(book: string, chapter: string, quote: string): VerifyResult {
  if (!quote || quote.trim().length === 0) {
    return { verified: false, reason: '引文为空' };
  }

  const bookNorm = extractBookName(book);
  const chapterNorm = extractChapter(chapter);
  const quoteNorm = normalize(quote);

  if (quoteNorm.length < 2) {
    return { verified: false, reason: '引文太短' };
  }

  // Step 1: 先按 book + chapter 精确匹配
  const exactMatches = db.entries.filter((entry) => {
    const eBook = normalize(entry.book);
    const eChapter = normalize(entry.chapter);
    return (
      eBook === normalize(bookNorm) &&
      (normalize(chapterNorm) === eChapter ||
        eChapter.includes(normalize(chapterNorm)) ||
        normalize(chapterNorm).includes(eChapter))
    );
  });

  for (const entry of exactMatches) {
    for (const verse of entry.verses) {
      const verseNorm = normalize(verse);
      if (verseNorm.includes(quoteNorm) || quoteNorm.includes(verseNorm)) {
        return {
          verified: true,
          matched_book: entry.book,
          matched_chapter: entry.chapter,
          matched_verse: verse,
        };
      }
    }
  }

  // Step 2: 仅按 book 匹配（用于 chapter 写错的情况）
  const bookMatches = db.entries.filter(
    (entry) => normalize(entry.book) === normalize(bookNorm),
  );

  for (const entry of bookMatches) {
    for (const verse of entry.verses) {
      const verseNorm = normalize(verse);
      // 要求 quote 与 verse 至少 4 字重合（避免 1-2 字误匹配）
      if (quoteNorm.length >= 4 && verseNorm.includes(quoteNorm)) {
        return {
          verified: true,
          matched_book: entry.book,
          matched_chapter: entry.chapter,
          matched_verse: verse,
          reason: '章节信息不匹配，但已在该典籍中找到原句',
        };
      }
    }
  }

  // Step 3: 全库模糊匹配（最后兜底，要求 6 字以上完全包含）
  if (quoteNorm.length >= 6) {
    for (const entry of db.entries) {
      for (const verse of entry.verses) {
        if (normalize(verse).includes(quoteNorm)) {
          return {
            verified: true,
            matched_book: entry.book,
            matched_chapter: entry.chapter,
            matched_verse: verse,
            reason: '书名章节均不匹配，但已在数据库中找到该引文',
          };
        }
      }
    }
  }

  return {
    verified: false,
    reason: `未在典故库中找到 "${quote}" 的出处（book=${bookNorm}, chapter=${chapterNorm}）`,
  };
}

/**
 * 获取数据库元信息（用于结果页底部展示）
 */
export function getClassicsDbStats() {
  const totalEntries = db.entries.length;
  const totalVerses = db.entries.reduce((acc, e) => acc + e.verses.length, 0);
  const byBook = db.entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.book] = (acc[e.book] ?? 0) + 1;
    return acc;
  }, {});

  return {
    version: db.version,
    updated_at: db.updated_at,
    total_entries: totalEntries,
    total_verses: totalVerses,
    by_book: byBook,
  };
}
