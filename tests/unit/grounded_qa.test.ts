import { describe, it, expect } from 'vitest';
import {
  checkGroundingRelevance,
  generateSilentDocumentRefusal
} from '../../backend/src/engine/groundedQAEvaluator.js';
import { MockService } from '../../backend/src/services/mockService.js';

describe('Grounded Q&A & Hallucination Prevention', () => {
  const leaseDocument = `
    RESIDENTIAL LEASE AGREEMENT
    Section 3: Rent is $1,800.00 per month.
    Section 4: Security deposit is $1,800.00 returned within 30 days.
    Section 5: Landlord shall provide at least twenty-four (24) hours advance notice of entry.
    Section 8: One domestic cat or dog under 35 lbs is permitted with a $250 pet deposit.
  `;

  it('recognizes relevant keywords present in the document', () => {
    const question = 'Are pets allowed in this apartment?';
    const relevance = checkGroundingRelevance(leaseDocument, question);
    expect(relevance.isDocumentSilent).toBe(false);
    expect(relevance.relevantTerms).toContain('pets');
  });

  it('detects when the document is completely silent on a topic', () => {
    const question = 'Is there an electric vehicle charging station or garage parking spot included?';
    const relevance = checkGroundingRelevance(leaseDocument, question);
    expect(relevance.isDocumentSilent).toBe(true);
    expect(relevance.relevantTerms.length).toBe(0);
  });

  it('generates an explicit refusal response when question is unaddressed', () => {
    const question = 'Can I install a satellite dish on the balcony?';
    const refusal = generateSilentDocumentRefusal(question);
    expect(refusal.isAddressedInDocument).toBe(false);
    expect(refusal.confidence).toBe('UNADDRESSED');
    expect(refusal.directQuote).toBeNull();
    expect(refusal.answer).toContain('does not address or mention');
  });

  it('answers pet policy with direct quote when present', () => {
    const qaResult = MockService.answerQuestion(leaseDocument, 'Can I have a pet dog?');
    expect(qaResult.isAddressedInDocument).toBe(true);
    expect(qaResult.directQuote).toContain('One domestic cat or dog under 35 lbs');
    expect(qaResult.confidence).toBe('HIGH');
  });

  it('refuses unaddressed question via MockService without hallucination', () => {
    const qaResult = MockService.answerQuestion(leaseDocument, 'What is the policy for smoking cannabis?');
    expect(qaResult.isAddressedInDocument).toBe(false);
    expect(qaResult.answer).toContain('does NOT address or mention');
    expect(qaResult.directQuote).toBeNull();
  });
});
