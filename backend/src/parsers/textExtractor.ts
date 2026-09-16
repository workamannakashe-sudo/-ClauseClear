import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedDocument {
  text: string;
  charCount: number;
  wordCount: number;
  fileType: 'txt' | 'pdf' | 'docx';
  sanitized: boolean;
}

/**
 * Sanitizes input text by removing null bytes, normalizing line breaks, and collapsing excessive whitespace.
 */
export function sanitizeText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\0/g, '') // remove null bytes
    .replace(/\r\n/g, '\n') // normalize Windows CRLF to LF
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width characters
    .replace(/[ \t]+/g, ' ') // collapse repeated spaces/tabs
    .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines
    .trim();
}

/**
 * Parses file buffer based on MIME type / extension.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<ExtractedDocument> {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || '';

  let rawText = '';
  let fileType: 'txt' | 'pdf' | 'docx' = 'txt';

  if (ext === 'pdf' || mimetype === 'application/pdf') {
    fileType = 'pdf';
    try {
      const pdfData = await (pdf as any)(buffer);
      rawText = pdfData.text || '';
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  } else if (
    ext === 'docx' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    fileType = 'docx';
    try {
      const docxResult = await mammoth.extractRawText({ buffer });
      rawText = docxResult.value || '';
    } catch (err: any) {
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  } else {
    // Treat as plain text
    fileType = 'txt';
    rawText = buffer.toString('utf-8');
  }

  const sanitized = sanitizeText(rawText);
  const words = sanitized.split(/\s+/).filter(Boolean);

  return {
    text: sanitized,
    charCount: sanitized.length,
    wordCount: words.length,
    fileType,
    sanitized: true
  };
}
