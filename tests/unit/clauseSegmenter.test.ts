import { describe, it, expect } from 'vitest';
import { segmentClauses } from '../../backend/src/engine/clauseSegmenter.js';

describe('Clause Segmenter Engine', () => {
  it('segments text by numeric numbered clauses', () => {
    const rawText = `
      1. RENT AND PAYMENT
      Tenant shall pay rent of ₹25,000 per month.

      2. SECURITY DEPOSIT
      Tenant deposits ₹50,000 refundable upon exit.

      3. NOTICE PERIOD
      Either party may terminate with 30 days notice.
    `;

    const segments = segmentClauses(rawText);
    expect(segments.length).toBeGreaterThanOrEqual(3);
    expect(segments[0].heading).toContain('RENT');
    expect(segments[1].heading).toContain('SECURITY DEPOSIT');
  });

  it('handles Roman numerals and keyword headings', () => {
    const rawText = `
      CLAUSE I: TERM OF LICENSE
      11 months from start date.

      CLAUSE II: UTILITIES
      Electricity paid by tenant.
    `;

    const segments = segmentClauses(rawText);
    expect(segments.length).toBeGreaterThanOrEqual(2);
    expect(segments[0].heading).toContain('TERM OF LICENSE');
  });
});
