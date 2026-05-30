/**
 * Client-side LLM call wrapper.
 *
 * Real LLM calls happen in the shared Cloudflare Workers gateway
 * (mvp/gateway/, see openspec migrate-to-vite-capacitor-ota § Gateway).
 * The client just POSTs to `${__GATEWAY_URL__}/generate-names` and, on
 * any network/transport failure, falls back to a local mock so the
 * UI never reaches a hard 500 state — same contract as the legacy
 * Next.js API route (`fallback_to_mock` warning).
 */

import { filterByBlacklist, SOFT_BLACKLIST_CHARS } from './blacklist';
import { buildMockNames } from './mockNames';
import {
  GenerateNamesResponseSchema,
  type GenerateNamesRequest,
  type GenerateNamesResponse,
  type VerifiedName,
} from './schema';
import { getClassicsDbStats, verifyQuote } from './verifyQuote';

const gatewayUrl = __GATEWAY_URL__;
const FETCH_TIMEOUT_MS = 30_000;

/**
 * Call the shared gateway and return a verified-names response.
 *
 * Errors are *not* thrown — on any failure we synthesize a mock-fallback
 * response (`provider: 'mock'`, `warning: '...'`) so the UI can render
 * something reasonable. Callers should still check `provider === 'mock'`
 * and `warning` to surface the situation to the user.
 */
export async function callGenerateNames(
  request: GenerateNamesRequest,
): Promise<GenerateNamesResponse> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${gatewayUrl}/generate-names`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn('[gateway] non-ok response', response.status, text.slice(0, 200));
      return buildLocalMockResponse(request, `gateway_${response.status}`);
    }

    const json = (await response.json()) as unknown;
    const parsed = GenerateNamesResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.warn('[gateway] schema validation failed', parsed.error.flatten());
      return buildLocalMockResponse(request, 'gateway_schema_invalid');
    }
    return parsed.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[gateway] fetch failed, using local mock', message);
    return buildLocalMockResponse(request, `gateway_failed: ${message.slice(0, 120)}`);
  }
}

/**
 * Build a self-contained mock response client-side. Mirrors the gateway's
 * mock fallback shape so the result-page UI can be agnostic of provider.
 *
 * Pipeline (matches former Next.js route in spirit):
 *   1. Generate mock candidates by surname/gender
 *   2. Run blacklist filter (HARD + SOFT + bad-meaning + overweight)
 *   3. Run client verifyQuote to mark verified=true/false
 *   4. Wrap with meta + warning
 */
function buildLocalMockResponse(
  request: GenerateNamesRequest,
  warning: string,
): GenerateNamesResponse {
  const candidates = buildMockNames(request.surname, request.gender);
  const { kept, report } = filterByBlacklist(candidates);

  const verified: VerifiedName[] = kept.map((n) => {
    const v = verifyQuote(n.source_book, n.source_chapter, n.original_quote);
    const warningChars = [...n.given_name].filter((c) =>
      SOFT_BLACKLIST_CHARS.has(c),
    );
    return {
      ...n,
      verified: v.verified,
      verify_reason: v.reason,
      matched_verse: v.matched_verse,
      warning_chars: warningChars.length > 0 ? warningChars : undefined,
    };
  });

  const stats = getClassicsDbStats();

  return {
    names: verified,
    provider: 'mock',
    warning,
    meta: {
      total_returned: verified.length,
      verified_count: verified.filter((n) => n.verified).length,
      filtered_count: report.removed.length,
      db_version: stats.version,
    },
  };
}
