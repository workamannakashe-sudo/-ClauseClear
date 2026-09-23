import { DocumentMismatchResult } from '../types/index.js';

// Keywords that indicate a residential lease or tenancy agreement
const LEASE_POSITIVE_KEYWORDS = [
  'lease',
  'tenant',
  'landlord',
  'licensor',
  'licensee',
  'leave and license',
  'license fee',
  'premises',
  'rent',
  'security deposit',
  'lessor',
  'lessee',
  'dwelling',
  'apartment',
  'flat',
  'sublet',
  'occupancy',
  'habitability',
  'eviction',
  'utilities'
];

// Keywords that strongly suggest an unrelated document type
const NON_LEASE_PATTERNS = [
  {
    type: 'Resume / Curriculum Vitae',
    patterns: ['curriculum vitae', 'resume', 'work experience', 'education', 'skills', 'bachelor of', 'master of', 'gpa', 'certifications']
  },
  {
    type: 'Employment Contract / Offer Letter',
    patterns: ['offer of employment', 'base salary', 'annual bonus', 'stock options', 'job title', 'reporting to', 'at-will employment', 'non-disclosure agreement']
  },
  {
    type: 'Commercial Invoice / Receipt',
    patterns: ['invoice number', 'bill to', 'tax invoice', 'unit price', 'subtotal', 'due upon receipt', 'wire transfer instructions']
  },
  {
    type: 'Software License / Terms of Service',
    patterns: ['software license', 'end user license agreement', 'eula', 'api terms', 'open source', 'intellectual property rights', 'github repository']
  },
  {
    type: 'Medical / Healthcare Record',
    patterns: ['medical history', 'diagnosis', 'prescription', 'physician', 'patient name', 'hipaa disclosure']
  }
];

export function detectDocumentMismatch(text: string): DocumentMismatchResult {
  const lower = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  if (wordCount < 20) {
    return {
      isResidentialLease: false,
      detectedDocumentType: 'Fragment / Insufficient Text',
      confidenceScore: 0.95,
      mismatchReason: 'The provided document is too brief to contain legal lease clauses (fewer than 20 words).',
      guidanceMessage: 'Please paste the full text of your residential lease or upload a complete contract document.'
    };
  }

  // Count positive lease keywords
  let positiveScore = 0;
  for (const keyword of LEASE_POSITIVE_KEYWORDS) {
    if (lower.includes(keyword)) {
      positiveScore += 1;
    }
  }

  // Check against mismatch patterns
  for (const candidate of NON_LEASE_PATTERNS) {
    let matchCount = 0;
    for (const pattern of candidate.patterns) {
      if (lower.includes(pattern)) {
        matchCount += 1;
      }
    }
    if (matchCount >= 2 && positiveScore < 3) {
      return {
        isResidentialLease: false,
        detectedDocumentType: candidate.type,
        confidenceScore: Math.min(0.98, 0.6 + matchCount * 0.1),
        mismatchReason: `Document appears to be a ${candidate.type} rather than a residential lease agreement.`,
        guidanceMessage: `LeaseGuard AI is specialized exclusively for residential rental agreements, lease addendums, and sublease contracts. Please upload your lease agreement to receive an accurate tenant risk review.`
      };
    }
  }

  // If very few lease keywords are present
  if (positiveScore < 2) {
    return {
      isResidentialLease: false,
      detectedDocumentType: 'Unrecognized / Non-Lease Document',
      confidenceScore: 0.82,
      mismatchReason: 'Key residential lease terms (such as Landlord, Tenant, Rent, Premises, or Security Deposit) were not found.',
      guidanceMessage: 'This tool is optimized for residential rental agreements. Please verify you have uploaded a valid lease or rental contract.'
    };
  }

  return {
    isResidentialLease: true,
    detectedDocumentType: 'Residential Lease Agreement',
    confidenceScore: Math.min(0.99, 0.7 + positiveScore * 0.04),
    mismatchReason: null,
    guidanceMessage: 'Valid residential lease identified.'
  };
}
