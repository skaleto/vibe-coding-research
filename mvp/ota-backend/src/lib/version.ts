/**
 * Version comparison helpers.
 *
 * Ported from `ai-baby-growth-companion/backend/.../MobileUpdateService.java::compareVersions()`.
 * Splits on non-digit separators and compares numeric segments.
 * Non-strict: "0.1.0-rc1" vs "0.1.0" → segments [0,1,0,1] vs [0,1,0], the longer wins by 1.
 *
 * Used for `minNativeVersion` gating only.
 * Bundle version equality uses raw string equals (contract §6).
 */
export function compareVersions(a: string | undefined, b: string | undefined): number {
  const sa = a ?? '';
  const sb = b ?? '';
  if (sa === sb) return 0;
  const partsA = splitVersion(sa);
  const partsB = splitVersion(sb);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const x = partsA[i] ?? 0;
    const y = partsB[i] ?? 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function splitVersion(version: string): number[] {
  if (!version) return [];
  return version
    .split(/[^0-9]+/)
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const n = parseInt(segment, 10);
      return Number.isNaN(n) ? 0 : n;
    });
}
