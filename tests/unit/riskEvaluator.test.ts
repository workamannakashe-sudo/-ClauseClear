import { describe, it, expect } from 'vitest';
import { evaluateLeaseRisk, identifyPredatoryHeuristics } from '../../backend/src/engine/riskEvaluator.js';
import { Clause } from '../../backend/src/types/index.js';

describe('Risk Evaluator Engine', () => {
  it('correctly calculates transparent score breakdown', () => {
    const clauses: Clause[] = [
      {
        id: 'c1',
        title: 'Forfeiture',
        category: 'risk_flag',
        originalSnippet: 'Deposit forfeited 100%',
        plainEnglish: 'Lose deposit',
        whyItMatters: 'Financial penalty',
        riskLevel: 'CRITICAL',
        isUnusual: true,
        recommendation: 'Delete'
      }
    ];

    const profile = evaluateLeaseRisk(clauses, { depositMonths: 6, lockInMonths: 10 });
    expect(profile.overallRiskLevel).toBe('CRITICAL');
    expect(profile.breakdown.criticalClauses).toBe(1);
    expect(profile.breakdown.depositMonths).toBe(6);
    expect(profile.breakdown.lockInMonths).toBe(10);
    expect(profile.breakdown.baseScore).toBeGreaterThanOrEqual(40);
  });

  it('identifies predatory heuristics in raw agreement text', () => {
    const text = `
      Landlord may enter without prior notice at any hour.
      Premises taken as-is and tenant waives habitability.
      Security deposit forfeited unconditionally.
    `;
    const flags = identifyPredatoryHeuristics(text);
    expect(flags.length).toBeGreaterThanOrEqual(2);
    expect(flags.some((f) => f.patternName.includes('Unrestricted Landlord Entry'))).toBe(true);
    expect(flags.some((f) => f.patternName.includes('Habitability'))).toBe(true);
  });

  it('assigns LOW risk to customary fair clauses', () => {
    const fairClauses: Clause[] = [
      {
        id: 'c1',
        title: 'Rent',
        category: 'tenant_obligation',
        originalSnippet: 'Pay rent on 1st',
        plainEnglish: 'Rent on 1st',
        whyItMatters: 'Standard',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation: 'None'
      }
    ];
    const profile = evaluateLeaseRisk(fairClauses, { depositMonths: 2 });
    expect(profile.overallRiskLevel).toBe('LOW');
    expect(profile.overallRiskScore).toBeLessThanOrEqual(25);
  });
});
