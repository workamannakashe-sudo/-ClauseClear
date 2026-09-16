import { describe, it, expect } from 'vitest';
import { sanitizeText } from '../../backend/src/parsers/textExtractor.js';
import { chunkLeaseDocument } from '../../backend/src/parsers/chunker.js';

describe('Document Text Sanitization & Chunking', () => {
  it('strips null bytes and normalizes CRLF', () => {
    const rawWithNull = 'Line 1\r\nLine 2\0\r\n\r\n\r\n\r\nLine 3';
    const sanitized = sanitizeText(rawWithNull);
    expect(sanitized).not.toContain('\0');
    expect(sanitized).not.toContain('\r');
    expect(sanitized).toContain('Line 1\nLine 2\n\nLine 3');
  });

  it('chunks a multi-section lease into coherent numbered sections', () => {
    const multiSectionLease = `
      1. PARTIES
      This agreement is made between John and Oakwood.

      2. RENT AMOUNT
      Monthly rent shall be $2,000 payable on 1st.

      3. SECURITY DEPOSIT
      Deposit of $2,000 held in escrow.

      4. ENTRY NOTICE
      Notice of 24 hours required before inspections.
    `;

    const chunks = chunkLeaseDocument(multiSectionLease, 50);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].title).toBeDefined();
    expect(chunks[0].content.length).toBeGreaterThan(0);
  });
});
