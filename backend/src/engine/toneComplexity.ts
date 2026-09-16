export interface ComplexityAssessment {
  wordCount: number;
  estimatedPages: number;
  complexityLevel: 'SIMPLE' | 'MODERATE' | 'COMPLEX_DENSE';
  recommendedDetailLevel: 'concise' | 'balanced' | 'comprehensive';
  toneDirective: string;
}

export function assessDocumentComplexity(text: string): ComplexityAssessment {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedPages = Math.max(1, Math.round(wordCount / 450));

  // Legal density markers (archaic formal terms)
  const legaleseMarkers = [
    'indemnify',
    'hold harmless',
    'heretofore',
    'notwithstanding',
    'exculpate',
    'liquidated damages',
    'severability',
    'subrogation',
    'covenant'
  ];

  const lower = text.toLowerCase();
  let legaleseCount = 0;
  for (const marker of legaleseMarkers) {
    const matches = lower.split(marker).length - 1;
    legaleseCount += matches;
  }

  if (wordCount > 2500 || legaleseCount >= 5) {
    return {
      wordCount,
      estimatedPages,
      complexityLevel: 'COMPLEX_DENSE',
      recommendedDetailLevel: 'comprehensive',
      toneDirective:
        'This agreement is extensive and dense with formal legal covenants. Provide exhaustive breakdown of sub-clauses, unbundle compounded obligations, and highlight cross-referencing liabilities.'
    };
  } else if (wordCount > 1000 || legaleseCount >= 3) {
    return {
      wordCount,
      estimatedPages,
      complexityLevel: 'MODERATE',
      recommendedDetailLevel: 'balanced',
      toneDirective:
        'This agreement contains standard residential boilerplate with moderate complexity. Highlight critical variances while keeping clause summaries direct and accessible.'
    };
  } else {
    return {
      wordCount,
      estimatedPages,
      complexityLevel: 'SIMPLE',
      recommendedDetailLevel: 'concise',
      toneDirective:
        'This agreement is compact. Focus on plain-English bullet points, essential dates, and key financial checkpoints.'
    };
  }
}
