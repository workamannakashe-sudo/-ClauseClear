import { describe, it, expect } from 'vitest';
import { detectMissingClauses } from '../../backend/src/engine/missingClauseDetector.js';

describe('Missing Clause & Inconsistency Detector Engine', () => {
  it('detects missing essential protections when agreement is sparse', () => {
    const sparseDoc = `
      RENTAL RECEIPT
      Tenant Riya paid ₹20,000 for Flat 101.
      Key handed over on Nov 1.
    `;
    const result = detectMissingClauses(sparseDoc);
    expect(result.missing.length).toBeGreaterThanOrEqual(3);
    expect(result.missing.some((m) => m.toLowerCase().includes('deposit') || m.toLowerCase().includes('notice'))).toBe(true);
  });

  it('detects contradictory notice periods within the same agreement', () => {
    const contradictoryDoc = `
      LEAVE AND LICENSE
      Clause 4: Either party may terminate with 30 days written notice.
      Clause 12: Tenant must provide 90 days notice before vacating the premises.
    `;
    const result = detectMissingClauses(contradictoryDoc);
    expect(result.inconsistencies.length).toBeGreaterThan(0);
    expect(result.inconsistencies[0]).toContain('Inconsistent notice periods');
  });

  it('finds standard clauses satisfied in a comprehensive agreement', () => {
    const fullAgreement = `
      LEAVE AND LICENSE AGREEMENT
      Flat No 102, Palm Grove situated at Bandra.
      Monthly rent of ₹30,000 payable by 5th.
      Security deposit of ₹60,000 refundable within 7 days of vacating.
      Termination notice of 30 days prior written notice.
      Lock-in period of 3 months.
      Licensor will give 24 hours advance written notice before entry.
      Electricity and water bills paid by Licensee. Society maintenance and repair by Licensor.
      Tenant shall not sublet or assign the agreement.
      Rent escalation of 5% annually.
      Stamp duty and registration under Section 55 of Maharashtra Rent Control Act.
      Jurisdiction of courts at Mumbai for dispute resolution.
    `;
    const result = detectMissingClauses(fullAgreement);
    expect(result.missing.length).toBeLessThanOrEqual(2);
    expect(result.inconsistencies.length).toBe(0);
  });
});
