import { describe, expect, it } from 'vitest';

import { verifyQuote } from './verifyQuote';

/**
 * verifyQuote 三级匹配 + 校验失败 + 边界覆盖。
 * 所有引文均取自真实 classics-db.json，以保证测试与库同步。
 */
describe('verifyQuote', () => {
  // Step 1: 书名 + 章节都正确，精确命中（无 reason）
  it('matches exactly when book and chapter are both correct', () => {
    const result = verifyQuote('诗经', '小雅·节南山', '知微知章');
    expect(result.verified).toBe(true);
    expect(result.matched_book).toBe('诗经');
    expect(result.matched_chapter).toBe('小雅·节南山');
    expect(result.matched_verse).toContain('知微知章');
    // 精确命中不应携带降级提示
    expect(result.reason).toBeUndefined();
  });

  // Step 1: 书名带《》、章节含书名前缀也应被 normalize / extract 后精确命中
  it('normalizes 《》 wrappers and chapter prefixes before exact match', () => {
    const result = verifyQuote('《诗经·小雅·节南山》', '诗经·小雅·节南山', '节彼南山');
    expect(result.verified).toBe(true);
    expect(result.matched_book).toBe('诗经');
    expect(result.matched_chapter).toBe('小雅·节南山');
  });

  // Step 2: 书名对、章节错 —— 仅按书名命中，带「章节信息不匹配」提示
  it('falls back to book-only match when chapter is wrong (Step 2)', () => {
    const result = verifyQuote('诗经', '完全不存在的章节', '窈窕淑女，君子好逑');
    expect(result.verified).toBe(true);
    expect(result.matched_book).toBe('诗经');
    expect(result.matched_chapter).toBe('周南·关雎');
    expect(result.reason).toContain('章节信息不匹配');
  });

  // Step 3: 书名、章节都错，但引文 >=6 字 —— 全库模糊命中
  it('falls back to whole-db fuzzy match when book and chapter are both wrong (Step 3)', () => {
    const result = verifyQuote('查无此书', '查无此章', '桃之夭夭，灼灼其华');
    expect(result.verified).toBe(true);
    expect(result.matched_book).toBe('诗经');
    expect(result.matched_chapter).toBe('周南·桃夭');
    expect(result.reason).toContain('书名章节均不匹配');
  });

  // Step 3 跨书：错误书名下仍能在另一典籍（楚辞）找到原句
  it('finds a verse in a different book than the one claimed (Step 3 cross-book)', () => {
    const result = verifyQuote('诗经', '小雅', '帝高阳之苗裔兮，朕皇考曰伯庸');
    expect(result.verified).toBe(true);
    expect(result.matched_book).toBe('楚辞');
    expect(result.matched_chapter).toBe('离骚');
  });

  // 校验失败：引文不在库中任何典籍，verified=false
  it('returns verified=false when the quote is not in the database at all', () => {
    const result = verifyQuote('诗经', '小雅·节南山', '飞流直下三千万尺胡说八道');
    expect(result.verified).toBe(false);
    expect(result.reason).toContain('未在典故库中找到');
  });

  // 边界：空引文直接判失败
  it('returns verified=false with "引文为空" for an empty quote', () => {
    const result = verifyQuote('诗经', '小雅·节南山', '   ');
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('引文为空');
  });

  // 边界：normalize 后长度 < 2 判「引文太短」
  it('returns verified=false with "引文太短" for a single-character quote', () => {
    const result = verifyQuote('诗经', '周南·关雎', '知');
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('引文太短');
  });

  // 边界：书名对但引文只有 2 字（< Step2 的 4 字、< Step3 的 6 字门槛）不应误命中
  it('does not false-positive on a 2-char fragment below the Step 2/3 length thresholds', () => {
    const result = verifyQuote('诗经', '完全不存在的章节', '关关');
    expect(result.verified).toBe(false);
    expect(result.reason).toContain('未在典故库中找到');
  });
});
