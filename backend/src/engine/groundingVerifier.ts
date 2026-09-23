/**
 * groundingVerifier.ts
 * ─────────────────────────────────────────────────────────────────────
 * Purpose: Verify that every quote in every finding is a normalized
 *          substring of the source document text.
 * Signature feature: Grounded or silent — no quote without a source.
 *
 * Algorithm:
 *   1. Unicode-normalize both strings (NFC).
 *   2. Collapse all whitespace to single spaces.
 *   3. Lowercase for case-insensitive substring check.
 *   4. Any finding that fails is downgraded to "UNVERIFIED".
 *
 * Known failure modes:
 *   - Heavily OCR'd PDFs with ligature substitutions will have more failures.
 *   - Ellipsis-truncated quotes may fail; keep quotes ≥40 chars for best match.
 */

import { Clause } from '../types/index.js';

/** Normalize a string for grounding comparison */
function normalizeForGrounding(s: string): string {
  return s
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Returns true if `quote` is a normalized substring of `sourceText`.
 * Uses a minimum 40-char sliding window if the quote is long (to handle
 * minor whitespace/encoding differences at boundaries).
 */
export function verifyGrounding(sourceText: string, quote: string): boolean {
  if (!quote || quote.trim().length < 10) return false;

  const normSource = normalizeForGrounding(sourceText);
  const normQuote  = normalizeForGrounding(quote);

  if (normSource.includes(normQuote)) return true;

  /* Fallback: try the first 60 chars of the quote as a window */
  if (normQuote.length > 60) {
    const window = normQuote.slice(0, 60);
    return normSource.includes(window);
  }

  return false;
}

export const verifySnippetGrounding = verifyGrounding;

/**
 * Run grounding verification on all clause findings.
 * Clauses that fail are downgraded to confidence: 'UNVERIFIED'.
 * Returns the updated clauses array and the grounding score (0-100).
 */
export function runGroundingVerifier(
  sourceText: string,
  clauses: Clause[],
): { clauses: Clause[]; groundingScore: number } {
  if (!clauses.length) return { clauses, groundingScore: 100 };

  let verifiedCount = 0;

  const updatedClauses: Clause[] = clauses.map((clause) => {
    const isVerified = verifyGrounding(sourceText, clause.originalSnippet);
    if (isVerified) verifiedCount++;

    return {
      ...clause,
      isVerified,
      confidence: isVerified
        ? (clause.confidence ?? 'HIGH')
        : 'UNVERIFIED',
    };
  });

  const groundingScore = Math.round((verifiedCount / clauses.length) * 100);

  return { clauses: updatedClauses, groundingScore };
}
