import { Clause, RiskLevel } from '../types/index.js';

export interface EvaluatedRiskProfile {
  overallRiskScore: number; // 0 - 100
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  criticalFlagsCount: number;
  highFlagsCount: number;
  unusualClausesCount: number;
  escalatedProfessionalReviewRecommended: boolean;
  advisorySummary: string;
}

export function evaluateLeaseRisk(clauses: Clause[]): EvaluatedRiskProfile {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let unusualCount = 0;

  for (const clause of clauses) {
    if (clause.isUnusual) unusualCount++;

    switch (clause.riskLevel) {
      case 'CRITICAL':
        criticalCount++;
        break;
      case 'HIGH':
        highCount++;
        break;
      case 'MEDIUM':
        mediumCount++;
        break;
      default:
        break;
    }
  }

  // Calculate weighted risk score (0 to 100)
  const baseScore = criticalCount * 30 + highCount * 15 + mediumCount * 5 + unusualCount * 5;
  const overallRiskScore = Math.min(100, Math.max(10, baseScore));

  let overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  if (criticalCount > 0 || overallRiskScore >= 75) {
    overallRiskLevel = 'CRITICAL';
  } else if (highCount >= 2 || overallRiskScore >= 50) {
    overallRiskLevel = 'HIGH';
  } else if (highCount === 1 || mediumCount >= 2 || overallRiskScore >= 30) {
    overallRiskLevel = 'MODERATE';
  } else {
    overallRiskLevel = 'LOW';
  }

  const escalatedProfessionalReviewRecommended = criticalCount > 0 || highCount >= 2;

  let advisorySummary = '';
  if (overallRiskLevel === 'CRITICAL') {
    advisorySummary = `CRITICAL WARNING: This agreement contains ${criticalCount} potentially unlawful or severely predatory provisions that jeopardize fundamental tenant rights. We strongly recommend having a licensed tenant attorney or local legal aid organization review these terms before signing.`;
  } else if (overallRiskLevel === 'HIGH') {
    advisorySummary = `ATTENTION: Several clauses impose heavy one-sided liabilities or financial penalties on the tenant. Review the highlighted clauses carefully and request amendments in writing.`;
  } else if (overallRiskLevel === 'MODERATE') {
    advisorySummary = `MODERATE RISK: This lease includes standard commercial provisions with a few notable obligations. Review the maintenance and fee requirements.`;
  } else {
    advisorySummary = `FAIR / BALANCED: Terms appear customary for residential tenancies with standard rights protections.`;
  }

  return {
    overallRiskScore,
    overallRiskLevel,
    criticalFlagsCount: criticalCount,
    highFlagsCount: highCount,
    unusualClausesCount: unusualCount,
    escalatedProfessionalReviewRecommended,
    advisorySummary
  };
}

/**
 * Deterministic heuristic checks for predatory patterns in raw text.
 * Used by rule engine to validate and enrich LLM or mock outputs.
 */
export function identifyPredatoryHeuristics(rawText: string): Array<{
  patternName: string;
  risk: RiskLevel;
  explanation: string;
}> {
  const lower = rawText.toLowerCase();
  const flags: Array<{ patternName: string; risk: RiskLevel; explanation: string }> = [];

  // 1. Landlord entry without notice
  if (
    lower.includes('enter') &&
    (lower.includes('without prior notice') ||
      lower.includes('without notice') ||
      lower.includes('any hour') ||
      lower.includes('no notice required'))
  ) {
    flags.push({
      patternName: 'Unrestricted Landlord Entry',
      risk: 'CRITICAL',
      explanation: 'Most jurisdictions legally mandate 24 to 48 hours advance notice before non-emergency landlord entry.'
    });
  }

  // 2. Waiver of habitability / maintenance reversal
  if (
    lower.includes('as-is') &&
    (lower.includes('waive') || lower.includes('habitability') || lower.includes('sole responsibility for all repairs'))
  ) {
    flags.push({
      patternName: 'Waiver of Implied Warranty of Habitability',
      risk: 'CRITICAL',
      explanation: 'Landlords are legally obligated to maintain habitable premises (plumbing, heat, structural safety). Waivers of habitability are generally void as public policy.'
    });
  }

  // 3. Unconditional deposit forfeiture
  if (
    lower.includes('security deposit') &&
    (lower.includes('forfeited') || lower.includes('liquidated damages'))
  ) {
    flags.push({
      patternName: 'Automatic Security Deposit Forfeiture',
      risk: 'HIGH',
      explanation: 'Security deposits may only be deducted for actual physical damage beyond normal wear-and-tear or unpaid rent, not as arbitrary punitive forfeiture.'
    });
  }

  // 4. Jury trial waiver / landlord unilateral arbitration
  if (lower.includes('waive') && lower.includes('jury trial')) {
    flags.push({
      patternName: 'Waiver of Jury Trial',
      risk: 'HIGH',
      explanation: 'Deprives tenant of right to judicial determination in civil court dispute.'
    });
  }

  return flags;
}
