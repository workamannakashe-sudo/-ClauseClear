import { GroundedQAResult } from '../types/index.js';

export interface KeywordRelevance {
  relevantTerms: string[];
  foundSnippets: string[];
  isDocumentSilent: boolean;
}

/**
 * Validates whether the document contains context related to the user's inquiry.
 */
export function checkGroundingRelevance(
  documentText: string,
  question: string
): KeywordRelevance {
  // Extract meaningful words (length >= 4, ignoring common stop words)
  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
    'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now',
    'tell', 'does', 'lease', 'agreement'
  ]);

  const rawTokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const uniqueTokens = Array.from(new Set(rawTokens));
  const docLower = documentText.toLowerCase();

  const foundTerms: string[] = [];
  const foundSnippets: string[] = [];

  for (const token of uniqueTokens) {
    // Check token directly, and also check singular stem if ending in 's'
    const stems = [token];
    if (token.endsWith('s') && token.length > 3) {
      stems.push(token.slice(0, -1));
    } else if (token.endsWith('es') && token.length > 4) {
      stems.push(token.slice(0, -2));
    }

    for (const stem of stems) {
      const idx = docLower.indexOf(stem);
      if (idx !== -1) {
        if (!foundTerms.includes(token)) {
          foundTerms.push(token);
        }
        // Grab snippet context around match
        const start = Math.max(0, idx - 40);
        const end = Math.min(documentText.length, idx + stem.length + 80);
        const snippet = documentText.substring(start, end).replace(/\s+/g, ' ').trim();
        if (!foundSnippets.includes(snippet)) {
          foundSnippets.push(snippet);
        }
        break;
      }
    }
  }

  const isDocumentSilent = foundTerms.length === 0;

  return {
    relevantTerms: foundTerms,
    foundSnippets: foundSnippets.slice(0, 3),
    isDocumentSilent
  };
}

/**
 * Creates a deterministic, legally-grounded refusal response when the lease is silent.
 */
export function generateSilentDocumentRefusal(question: string): GroundedQAResult {
  return {
    isAddressedInDocument: false,
    answer: `The provided residential lease does not address or mention "${question}". No provisions, clauses, or restrictions governing this specific question were found in the uploaded text.`,
    directQuote: null,
    relevantSection: 'N/A — Document is Silent',
    confidence: 'UNADDRESSED',
    recommendedFollowUp:
      'When a residential lease is silent on an issue, the matter is typically governed by your state or municipal landlord-tenant statutes (or local rent board regulations). If you require clarification, request written confirmation or an addendum from the landlord before signing.',
    isMockMode: true
  };
}
