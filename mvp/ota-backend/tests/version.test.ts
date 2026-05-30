import { describe, it, expect } from 'vitest';
import { compareVersions } from '../src/lib/version';

describe('compareVersions', () => {
  it('returns 0 for equal strings', () => {
    expect(compareVersions('0.0.1', '0.0.1')).toBe(0);
  });

  it('returns -1 when left is lower', () => {
    expect(compareVersions('0.0.1', '0.0.2')).toBe(-1);
    expect(compareVersions('0.1.0', '0.2.0')).toBe(-1);
    expect(compareVersions('0.0.9', '0.0.10')).toBe(-1);
  });

  it('returns 1 when left is higher', () => {
    expect(compareVersions('1.0.0', '0.9.9')).toBe(1);
    expect(compareVersions('0.0.10', '0.0.9')).toBe(1);
  });

  it('handles timestamp-suffixed versions (string equality unaffected)', () => {
    // For minNativeVersion gate: nativeVersion '0.0.1' >= minNative '0.0.1-something' is unusual
    // but should not crash.
    expect(compareVersions('0.0.1', '0.0.1-20260528')).toBeLessThanOrEqual(0);
  });

  it('treats missing segments as 0', () => {
    expect(compareVersions('1', '1.0.0')).toBe(0);
    expect(compareVersions('1.2', '1.2.0')).toBe(0);
  });

  it('handles undefined / empty inputs', () => {
    expect(compareVersions(undefined, undefined)).toBe(0);
    expect(compareVersions('', '')).toBe(0);
    expect(compareVersions('1.0.0', '')).toBe(1);
    expect(compareVersions('', '1.0.0')).toBe(-1);
  });
});
