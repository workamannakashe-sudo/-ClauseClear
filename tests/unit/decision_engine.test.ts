import { describe, it, expect } from 'vitest';
import { detectDocumentMismatch } from '../../backend/src/engine/mismatchDetector.js';
import {
  evaluateLeaseRisk,
  identifyPredatoryHeuristics
} from '../../backend/src/engine/riskEvaluator.js';
import { assessDocumentComplexity } from '../../backend/src/engine/toneComplexity.js';
import { Clause } from '../../backend/src/types/index.js';

describe('Document Mismatch Detector', () => {
  it('identifies residential lease text as valid', () => {
    const leaseSample = `
      RESIDENTIAL LEASE AGREEMENT
      Landlord agrees to rent the premises to Tenant for $1,500 per month.
      A security deposit of $1,500 is due upon signing.
      Tenant shall keep premises clean and report habitability defects.
    `;
    const result = detectDocumentMismatch(leaseSample);
    expect(result.isResidentialLease).toBe(true);
    expect(result.detectedDocumentType).toBe('Residential Lease Agreement');
    expect(result.confidenceScore).toBeGreaterThan(0.7);
  });

  it('detects a resume/CV as a document mismatch', () => {
    const resumeSample = `
      ALEX RIVERA - RESUME
      Education: Bachelor of Science in Computer Science
      Skills: TypeScript, Python, React, Kubernetes
      Work Experience: Software Engineer building backend APIs
    `;
    const result = detectDocumentMismatch(resumeSample);
    expect(result.isResidentialLease).toBe(false);
    expect(result.detectedDocumentType).toBe('Resume / Curriculum Vitae');
    expect(result.mismatchReason).toContain('Resume');
  });

  it('detects an invoice as a document mismatch', () => {
    const invoiceSample = `
      COMMERCIAL INVOICE
      Invoice Number: INV-9821
      Bill To: Acme Corp
      Unit Price: $500.00
      Subtotal: $1,500.00
      Due upon receipt. Wire transfer instructions enclosed.
    `;
    const result = detectDocumentMismatch(invoiceSample);
    expect(result.isResidentialLease).toBe(false);
    expect(result.detectedDocumentType).toBe('Commercial Invoice / Receipt');
  });

  it('flags text with fewer than 20 words as insufficient', () => {
    const shortText = 'Hi this is too short';
    const result = detectDocumentMismatch(shortText);
    expect(result.isResidentialLease).toBe(false);
    expect(result.detectedDocumentType).toContain('Insufficient');
  });
});

describe('Risk Evaluator & Escalation Engine', () => {
  it('escalates risk to CRITICAL when critical clauses exist', () => {
    const clauses: Clause[] = [
      {
        id: '1',
        title: 'Unrestricted Landlord Entry',
        category: 'unusual_clause',
        originalSnippet: 'Landlord may enter without prior notice at any hour.',
        plainEnglish: 'Landlord can enter anytime unannounced.',
        whyItMatters: 'Violates quiet enjoyment and privacy.',
        riskLevel: 'CRITICAL',
        isUnusual: true,
        recommendation: 'Do not sign.'
      },
      {
        id: '2',
        title: 'Rent Due Date',
        category: 'tenant_obligation',
        originalSnippet: 'Rent is due on the 1st.',
        plainEnglish: 'Pay on the 1st.',
        whyItMatters: 'Standard due date.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation: 'Pay on time.'
      }
    ];

    const evaluation = evaluateLeaseRisk(clauses);
    expect(evaluation.overallRiskLevel).toBe('CRITICAL');
    expect(evaluation.escalatedProfessionalReviewRecommended).toBe(true);
    expect(evaluation.criticalFlagsCount).toBe(1);
  });

  it('rates balanced leases as LOW risk', () => {
    const clauses: Clause[] = [
      {
        id: '1',
        title: '24hr Entry Notice',
        category: 'landlord_obligation',
        originalSnippet: '24 hours notice required.',
        plainEnglish: 'Notice before visits.',
        whyItMatters: 'Privacy.',
        riskLevel: 'STANDARD',
        isUnusual: false,
        recommendation: 'Standard.'
      }
    ];

    const evaluation = evaluateLeaseRisk(clauses);
    expect(evaluation.overallRiskLevel).toBe('LOW');
    expect(evaluation.escalatedProfessionalReviewRecommended).toBe(false);
  });

  it('flags predatory text heuristics for habitability and unannounced entry', () => {
    const predatoryText = `
      Landlord may enter premises without prior notice.
      Tenant accepts property AS-IS and agrees to waive all statutory warranties of habitability.
    `;
    const flags = identifyPredatoryHeuristics(predatoryText);
    expect(flags.length).toBe(2);
    expect(flags.some((f) => f.patternName.includes('Unrestricted Landlord Entry'))).toBe(true);
    expect(flags.some((f) => f.patternName.includes('Habitability'))).toBe(true);
  });
});

describe('Tone & Complexity Analyzer', () => {
  it('correctly classifies a short lease as SIMPLE', () => {
    const shortLease = 'Standard lease agreement. Monthly rent is $1200. Paid on 1st.';
    const assessment = assessDocumentComplexity(shortLease);
    expect(assessment.complexityLevel).toBe('SIMPLE');
    expect(assessment.recommendedDetailLevel).toBe('concise');
  });

  it('correctly flags dense legal terminology', () => {
    const denseLease = `
      Tenant shall indemnify and hold harmless the Lessor, notwithstanding any prior representations.
      The covenants herein shall be deemed liquidated damages and exculpate the landlord completely.
      Severability applies hereto.
    `;
    const assessment = assessDocumentComplexity(denseLease);
    expect(assessment.toneDirective).toContain('formal legal covenants');
  });
});
