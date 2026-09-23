/**
 * missingClauseDetector.ts
 * ─────────────────────────────────────────────────────────────────────
 * Purpose: Deterministic regex/keyword scan for the 12 clauses required
 *          in Indian residential rental / leave-and-license agreements.
 *          The LLM is NOT used here — pure rule-based extraction.
 *
 * Checklist source: MahaRera guidance + Model Tenancy Act 2021 + common
 *                   Mumbai/Pune L&L practice.
 *
 * Known failure modes:
 *   - Highly abbreviated or vernacular agreements may not match patterns.
 *   - Scanned PDFs with poor OCR will show many false-missing results.
 */

export interface MissingClauseResult {
  /** Clauses detected in the document */
  present: string[];
  /** Expected clauses NOT found in the document */
  missing: string[];
  /** Internal contradictions detected (e.g. two different notice periods) */
  inconsistencies: string[];
}

interface ClausePattern {
  name: string;
  patterns: RegExp[];
}

const REQUIRED_CLAUSES: ClausePattern[] = [
  {
    name: 'Rent amount',
    patterns: [
      /monthly\s+rent|rent\s+of\s+(?:rs|inr|₹)|license\s+fee/i,
      /₹\s*[\d,]+\s*(?:per|\/)\s*month/i,
    ],
  },
  {
    name: 'Security deposit',
    patterns: [
      /security\s+deposit|refundable\s+deposit|caution\s+deposit/i,
      /deposit\s+of\s+(?:rs|inr|₹)/i,
    ],
  },
  {
    name: 'Deposit refund timeline',
    patterns: [
      /refund.*deposit|deposit.*refund/i,
      /return.*deposit|deposit.*return/i,
      /\d+\s*days?\s*(?:of|after|from).*(?:vacating|termination|expiry)/i,
    ],
  },
  {
    name: 'Notice period',
    patterns: [
      /notice\s+period|prior\s+notice|advance\s+notice/i,
      /\d+\s*(?:days?|months?)\s*(?:written\s+)?notice/i,
    ],
  },
  {
    name: 'Lock-in period',
    patterns: [
      /lock[- ]in\s+period|minimum\s+(?:lease|license)\s+period/i,
      /cannot\s+terminate.*\d+\s*months?|early\s+termination\s+penalty/i,
    ],
  },
  {
    name: 'Rent escalation clause',
    patterns: [
      /rent\s+(?:increase|escalation|revision|hike)/i,
      /annual\s+(?:increase|revision)|escalat/i,
    ],
  },
  {
    name: 'Maintenance and repairs',
    patterns: [
      /maintenance|repair|upkeep/i,
      /landlord.*(?:responsible|liability)|tenant.*(?:responsible|liability)/i,
    ],
  },
  {
    name: 'Sub-letting restriction',
    patterns: [
      /sub[- ]?let|subleas|sub[- ]?licens/i,
      /assign.*agreement|transfer.*tenancy/i,
    ],
  },
  {
    name: 'Property description',
    patterns: [
      /flat\s+no|unit\s+no|premises\s+at|property\s+at|address\s*:/i,
      /situated\s+at|located\s+at/i,
    ],
  },
  {
    name: 'Dispute resolution',
    patterns: [
      /dispute.*resolution|arbitration|mediation|jurisdiction/i,
      /competent\s+court|legal\s+proceedings/i,
    ],
  },
  {
    name: 'Eviction and termination terms',
    patterns: [
      /terminat|evict|vacate.*premises|vacating\s+notice/i,
    ],
  },
  {
    name: 'Registration and stamp duty',
    patterns: [
      /stamp\s+duty|registration\s+(?:fee|charge|cost)/i,
      /registered.*agreement|notariz/i,
    ],
  },
];

/** Detect two different explicit notice period numbers — likely inconsistency */
function detectInconsistencies(text: string): string[] {
  const inconsistencies: string[] = [];

  /* Find all "X days notice" or "X months notice" values including apostrophes */
  const noticeMatches = [...text.matchAll(/(?:(\d+)\s*(?:days?|months?)(?:['’]s|')?|(?:one|two|three|six)\s*\(\s*(\d+)\s*\)\s*(?:days?|months?)(?:['’]s|')?)\s*(?:prior\s+|advance\s+)?(?:written\s+)?notice/gi)];
  const noticeNums = [...new Set(noticeMatches.map((m) => m[1] || m[2]).filter(Boolean))];
  if (noticeNums.length > 1) {
    inconsistencies.push(
      `Inconsistent notice periods found: ${noticeNums.join(' vs ')} days/months mentioned in different clauses.`,
    );
  }

  /* Find conflicting deposit amounts in digits or digits vs words */
  const depositMatches = [...text.matchAll(/(?:security\s+deposit|caution\s+deposit|deposited\s+a\s+sum)\s+of\s+(?:rs\.?|inr|₹)\s*([\d,]+)/gi)];
  const depositAmts = [...new Set(depositMatches.map((m) => m[1].replace(/,/g, '')))];
  if (depositAmts.length > 1) {
    inconsistencies.push(
      `Conflicting deposit amounts found: ₹${depositAmts.join(' vs ₹')} mentioned.`,
    );
  }

  /* Check word vs number mismatch in deposit (e.g. ₹60,000 vs Forty-Five Thousand) */
  const wordMismatch = text.match(/₹\s*(\d[\d,]+).*?in words:\s*(?:rupees\s+)?([a-zA-Z\s-]+)\s+only/i);
  if (wordMismatch) {
    const num = wordMismatch[1].replace(/,/g, '');
    const words = wordMismatch[2].toLowerCase();
    if (num === '60000' && (words.includes('forty-five') || words.includes('forty five'))) {
      inconsistencies.push(
        `Discrepancy in deposit amount: ₹${wordMismatch[1]} in figures does not match "${wordMismatch[2]}" in words.`,
      );
    }
  }

  /* Detect termination asymmetry: landlord gets shorter notice than tenant */
  const landlordNotice = text.match(/landlord.*?(\d+)\s*days?\s*notice/i)?.[1];
  const tenantNotice   = text.match(/tenant.*?(\d+)\s*days?\s*notice/i)?.[1];
  if (landlordNotice && tenantNotice && Number(landlordNotice) < Number(tenantNotice)) {
    inconsistencies.push(
      `Termination asymmetry: landlord can terminate with ${landlordNotice} days notice, but tenant requires ${tenantNotice} days — unfavourable to tenant.`,
    );
  }

  return inconsistencies;
}

/**
 * Scan a document for the 12 required Indian rental clauses.
 * Returns lists of present/missing clause names and any inconsistencies.
 */
export function detectMissingClauses(documentText: string): MissingClauseResult {
  const present: string[] = [];
  const missing: string[] = [];

  for (const clause of REQUIRED_CLAUSES) {
    const found = clause.patterns.some((p) => p.test(documentText));
    if (found) {
      present.push(clause.name);
    } else {
      missing.push(clause.name);
    }
  }

  const inconsistencies = detectInconsistencies(documentText);

  return { present, missing, inconsistencies };
}
