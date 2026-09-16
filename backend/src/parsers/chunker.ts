export interface DocumentChunk {
  index: number;
  title: string;
  content: string;
  wordCount: number;
}

/**
 * Splits large lease agreements into section-aware chunks based on numbered sections, headers, or paragraphs.
 */
export function chunkLeaseDocument(text: string, maxWordsPerChunk = 1200): DocumentChunk[] {
  // First attempt: Split by numbered sections (e.g., "1. PARTIES", "Section 2", "Clause 3", "ARTICLE IV")
  const sectionRegex = /(?=(?:^|\n\s*)(?:\d+[\.\)]|[A-Z\s]{4,}:|Section\s+\d+|Article\s+[IVXLCDM\d]+))/im;
  const sections = text.split(sectionRegex).map((s) => s.trim()).filter(Boolean);

  if (sections.length >= 3) {
    const chunks: DocumentChunk[] = [];
    let currentChunkText = '';
    let chunkIndex = 1;

    for (const section of sections) {
      const sectionWords = section.split(/\s+/).length;
      const currentWords = currentChunkText.split(/\s+/).length;

      if (currentChunkText && currentWords + sectionWords > maxWordsPerChunk) {
        chunks.push({
          index: chunkIndex++,
          title: extractSectionTitle(currentChunkText, chunkIndex - 1),
          content: currentChunkText.trim(),
          wordCount: currentWords
        });
        currentChunkText = section;
      } else {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${section}` : section;
      }
    }

    if (currentChunkText.trim()) {
      chunks.push({
        index: chunkIndex,
        title: extractSectionTitle(currentChunkText, chunkIndex),
        content: currentChunkText.trim(),
        wordCount: currentChunkText.split(/\s+/).length
      });
    }

    return chunks;
  }

  // Fallback: Split by double newlines or paragraph blocks
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: DocumentChunk[] = [];
  let buffer = '';
  let chunkIdx = 1;

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).length;
    const bufWords = buffer.split(/\s+/).length;

    if (buffer && bufWords + paraWords > maxWordsPerChunk) {
      chunks.push({
        index: chunkIdx++,
        title: `Section Part ${chunkIdx - 1}`,
        content: buffer.trim(),
        wordCount: bufWords
      });
      buffer = para;
    } else {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    }
  }

  if (buffer.trim()) {
    chunks.push({
      index: chunkIdx,
      title: `Section Part ${chunkIdx}`,
      content: buffer.trim(),
      wordCount: buffer.split(/\s+/).length
    });
  }

  return chunks;
}

function extractSectionTitle(chunkText: string, fallbackIdx: number): string {
  const firstLine = chunkText.split('\n')[0].trim().replace(/^[\d\.\s\-\#]+/, '');
  if (firstLine.length > 3 && firstLine.length < 60) {
    return firstLine;
  }
  return `Clause Section ${fallbackIdx}`;
}
