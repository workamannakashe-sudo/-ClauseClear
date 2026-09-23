import { describe, it, expect } from 'vitest';
import { runGroundingVerifier, verifySnippetGrounding } from '../../backend/src/engine/groundingVerifier.js';
import { Clause } from '../../backend/src/types/index.js';

describe('Grounding Verifier Engine', () => {
  const documentText = `
    LEAVE AND LICENSE AGREEMENT
    The Licensee shall pay a monthly license fee of ₹35,000 payable on or before the 5th day of each month.
    The interest-free refundable security deposit of ₹70,000 shall be refunded within seven (7) banking days.
    Licensor shall provide twenty-four (24) hours advance written notice before inspection.
  `;

  it('validates verbatim exact substring quotes with 100% grounding', () => {
    const verified = verifySnippetGrounding(
      documentText,
      'The Licensee shall pay a monthly license fee of ₹35,000'
    );
    expect(verified).toBe(true);
  });

  it('handles minor whitespace and Unicode normalization differences', () => {
    const quoteWithExtraSpace = 'The   Licensee shall pay   a monthly license fee of ₹35,000';
    const verified = verifySnippetGrounding(documentText, quoteWithExtraSpace);
    expect(verified).toBe(true);
  });

  it('rejects fabricated or hallucinated quotes not present in document', () => {
    const fakeQuote = 'Tenant must paint all walls purple upon vacating the premises.';
    const verified = verifySnippetGrounding(documentText, fakeQuote);
    expect(verified).toBe(false);
  });

  it('computes overall grounding score across multiple clauses', () => {
    const testClauses: Clause[] = [
      {
        id: 'c1',
        title: 'Rent',
        category: 'tenant_obligation',
        originalSnippet: 'monthly license fee of ₹35,000',
        plainEnglish: 'Rent is 35k',
        whyItMatters: 'Payment',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation: 'Pay on time'
      },
      {
        id: 'c2',
        title: 'Hallucination',
        category: 'risk_flag',
        originalSnippet: 'Landlord may confiscate pets on Tuesday',
        plainEnglish: 'Fake rule',
        whyItMatters: 'None',
        riskLevel: 'HIGH',
        isUnusual: true,
        recommendation: 'Ignore'
      }
    ];

    const result = runGroundingVerifier(documentText, testClauses);
    expect(result.groundingScore).toBe(50);
    expect(result.clauses[0].isVerified).toBe(true);
    expect(result.clauses[1].isVerified).toBe(false);
    expect(result.clauses[1].confidence).toBe('UNVERIFIED');
  });
});
