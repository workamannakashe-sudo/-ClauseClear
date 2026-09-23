export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD' | 'LOW';

export type ClauseCategory =
  | 'tenant_obligation'
  | 'landlord_obligation'
  | 'risk_flag'
  | 'unusual_clause'
  | 'missing_clause';

export interface Clause {
  id: string;
  title: string;
  category: ClauseCategory;
  originalSnippet: string;
  plainEnglish: string;
  whyItMatters: string;
  riskLevel: RiskLevel;
  isUnusual: boolean;
  recommendation: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  isVerified?: boolean;
}

export interface LeaseSummary {
  headline: string;
  keyDetails: {
    rentAmount: string | null;
    securityDeposit: string | null;
    leaseTerm: string | null;
    lateFee: string | null;
    noticePeriodDays: number | null;
  };
  overallRiskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  criticalNotice: string | null;
  complexityLevel: 'SIMPLE' | 'MODERATE' | 'COMPLEX_DENSE';
  depositMonths?: number;
  lockInMonths?: number;
}

export interface LeaseAnalysisResult {
  summary: LeaseSummary;
  clauses: Clause[];
  mismatch?: DocumentMismatchResult;
  isMockMode?: boolean;
  groundingScore?: number;
  missingClauses?: string[];
  inconsistencies?: string[];
}

export interface DocumentMismatchResult {
  isResidentialLease: boolean;
  detectedDocumentType: string;
  confidenceScore: number;
  mismatchReason: string | null;
  guidanceMessage: string;
}

export interface ComparisonMetric {
  metric: string;
  before: string;
  after: string;
  percentChange: string | null;
}

export interface ComparisonDiff {
  clauseTitle: string;
  changeType: 'MODIFIED' | 'ADDED' | 'REMOVED';
  impactOnTenant: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE';
  severity: RiskLevel;
  versionA_Snippet: string | null;
  versionB_Snippet: string | null;
  plainLanguageAnalysis: string;
  actionRecommendation: string;
}

export interface LeaseComparisonResult {
  summary: {
    headline: string;
    favourabilityShift:
      | 'MORE_FAVORABLE_TO_TENANT'
      | 'NEUTRAL'
      | 'MORE_RESTRICTIVE_ON_TENANT'
      | 'PREDATORY_ESCALATION';
    keyFinancialChanges: ComparisonMetric[];
  };
  differences: ComparisonDiff[];
  isMockMode?: boolean;
}

export interface GroundedQAResult {
  isAddressedInDocument: boolean;
  answer: string;
  directQuote: string | null;
  relevantSection: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'UNADDRESSED';
  recommendedFollowUp: string | null;
  isMockMode?: boolean;
}

export interface ChecklistItem {
  id: string;
  category: 'immediate' | 'negotiate' | 'document' | 'legal_review';
  urgency: RiskLevel;
  title: string;
  actionDetails: string;
  relatedClause: string | null;
}

export interface ActionChecklistResult {
  summary: string;
  checklist: ChecklistItem[];
  questionsForLandlord: Array<{
    question: string;
    context: string;
  }>;
  questionsForLawyer: Array<{
    question: string;
    context: string;
  }>;
  preSignVerification: string[];
  draftNegotiationLetter: {
    subject: string;
    recipient: string;
    body: string;
  };
  isMockMode?: boolean;
}

