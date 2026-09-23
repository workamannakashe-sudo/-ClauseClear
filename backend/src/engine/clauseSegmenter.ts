/**
 * clauseSegmenter.ts
 * ─────────────────────────────────────────────────────────────────────
 * Purpose: Split a document into logical clause segments by detecting
 *          headings and numbered clause patterns common in Indian
 *          rental / leave-and-license agreements.
 *
 * Design: Deterministic regex — no LLM involvement.
 * The LLM receives pre-segmented clauses, not the full wall of text.
 *
 * Known failure modes:
 *   - Agreements with no headings (pure paragraph format) will produce
 *     fewer, larger segments — acceptable; the LLM handles interpretation.
 *   - Very short documents (<200 chars) returned as a single segment.
 */

export interface ClauseSegment {
  id: string;
  heading: string;
  text: string;
  startIndex: number;
}

/** Heading patterns for Indian rental agreements */
const HEADING_PATTERNS = [
  /^(?:CLAUSE|SECTION|ARTICLE|PARA(?:GRAPH)?)\s+(?:\d+|[IVXLCDM]+)[\s.:)]/im,
  /^(?:\d+\.|\d+\)|\d+\s*[-–—])\s+[^\n]{2,60}$/im, // "1. Rent and Payment" or "1) Term"
  /^[A-Z][A-Z\s&/-]{4,50}:?\s*$/im, // "SECURITY DEPOSIT:"
  /^(?:Clause|Section)\s+(?:\d+|[IVXLCDM]+)/im,
];

/** Check if a line looks like a clause heading */
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 120) return false;
  return HEADING_PATTERNS.some((p) => p.test(trimmed));
}

/**
 * Segment a document into clause blocks.
 * Returns an array ordered by appearance in the document.
 * Each segment includes the heading text and the clause body text.
 */
export function segmentClauses(documentText: string): ClauseSegment[] {
  if (!documentText || documentText.trim().length < 50) {
    return [
      {
        id: 'seg-0',
        heading: 'Full Document',
        text: documentText.trim(),
        startIndex: 0,
      },
    ];
  }

  const lines = documentText.split('\n');
  const segments: ClauseSegment[] = [];
  let currentHeading = 'Preamble';
  let currentLines: string[] = [];
  let currentStart = 0;
  let charOffset = 0;
  let segIdx = 0;

  for (const line of lines) {
    if (isHeading(line)) {
      /* Flush current segment */
      const body = currentLines.join('\n').trim();
      if (body.length > 10) {
        segments.push({
          id: `seg-${segIdx++}`,
          heading: currentHeading,
          text: body,
          startIndex: currentStart,
        });
      }
      currentHeading = line.trim();
      currentLines   = [];
      currentStart   = charOffset;
    } else {
      currentLines.push(line);
    }
    charOffset += line.length + 1; // +1 for the \n
  }

  /* Flush last segment */
  const finalBody = currentLines.join('\n').trim();
  if (finalBody.length > 10) {
    segments.push({
      id: `seg-${segIdx}`,
      heading: currentHeading,
      text: finalBody,
      startIndex: currentStart,
    });
  }

  return segments.length > 0
    ? segments
    : [{ id: 'seg-0', heading: 'Full Document', text: documentText.trim(), startIndex: 0 }];
}
