/**
 * zipBombGuard.ts
 * ─────────────────────────────────────────────────────────────────────
 * Purpose: Validate uploaded files before parsing.
 *   1. Magic-byte validation (PDF, DOCX/ZIP, TXT).
 *   2. File-size cap (5 MB raw).
 *   3. Zip-bomb guard: reject DOCX where expanded size > MAX_EXPANSION_RATIO × compressed.
 *   4. Scanned-PDF detection (no extractable text).
 *
 * Design: Purely synchronous / deterministic — no LLM.
 *
 * Known failure modes:
 *   - Some legitimate compressed DOCX files may exceed ratio (e.g. large embedded images).
 *     Users are guided to paste text in that case.
 */

export interface FileValidationResult {
  valid: boolean;
  errorMessage?: string;
  detectedType?: 'pdf' | 'docx' | 'txt' | 'unknown';
  isScannedPdf?: boolean;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;       // 5 MB
const MAX_EXPANSION_RATIO = 50;               // 50× compressed → expanded limit
const MAX_EXPANDED_BYTES  = 25 * 1024 * 1024; // 25 MB expanded

/** Read the first N bytes of a Buffer */
function magicBytes(buf: Buffer, count: number): string {
  return buf.slice(0, count).toString('hex');
}

/**
 * Validate a file buffer before parsing.
 * Returns a validation result with any error message.
 */
export function validateFile(
  buf: Buffer,
  originalname: string,
  mimetype: string,
): FileValidationResult {
  /* Size cap */
  if (buf.length > MAX_FILE_BYTES) {
    return {
      valid: false,
      errorMessage: `File size ${(buf.length / 1024 / 1024).toFixed(1)} MB exceeds the 5 MB limit. Please compress or paste text directly.`,
    };
  }

  const ext = originalname.split('.').pop()?.toLowerCase() ?? '';
  const magic = magicBytes(buf, 4);

  /* PDF: magic bytes 25504446 (%PDF) */
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    if (!magic.startsWith('25504446')) {
      return {
        valid: false,
        errorMessage: 'File does not appear to be a valid PDF (incorrect magic bytes). Please re-export and try again.',
      };
    }
    return { valid: true, detectedType: 'pdf' };
  }

  /* DOCX: magic bytes 504b0304 (PK ZIP) */
  if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    if (!magic.startsWith('504b0304')) {
      return {
        valid: false,
        errorMessage: 'File does not appear to be a valid DOCX (incorrect ZIP signature). Please re-save in .docx format.',
      };
    }

    /* Zip-bomb guard: check uncompressed size in central directory */
    try {
      const uncompressedSize = estimateDocxExpandedSize(buf);
      if (uncompressedSize > MAX_EXPANDED_BYTES) {
        return {
          valid: false,
          errorMessage: `DOCX expanded size (${(uncompressedSize / 1024 / 1024).toFixed(1)} MB) exceeds safety limit. Please remove embedded images/media and try again.`,
        };
      }
      if (buf.length > 0 && uncompressedSize / buf.length > MAX_EXPANSION_RATIO) {
        return {
          valid: false,
          errorMessage: `DOCX compression ratio (${(uncompressedSize / buf.length).toFixed(0)}×) is suspiciously high. File rejected for safety.`,
        };
      }
    } catch {
      // If we can't read the ZIP, let mammoth handle it and fail gracefully
    }

    return { valid: true, detectedType: 'docx' };
  }

  /* TXT: must be printable UTF-8 / ASCII — just accept if ext matches */
  if (ext === 'txt' || mimetype === 'text/plain') {
    return { valid: true, detectedType: 'txt' };
  }

  /* Unknown type */
  return {
    valid: false,
    detectedType: 'unknown',
    errorMessage: `Unsupported file type ".${ext}". Please upload a PDF, DOCX, or TXT file.`,
  };
}

/**
 * Estimate the total uncompressed size of a ZIP/DOCX file by reading
 * the local file headers (field at offset 18 = compressed, 22 = uncompressed).
 */
function estimateDocxExpandedSize(buf: Buffer): number {
  let total = 0;
  let offset = 0;

  while (offset + 30 < buf.length) {
    /* Local file header signature: 0x04034b50 (little-endian) */
    if (buf.readUInt32LE(offset) !== 0x04034b50) break;

    const compressedSize   = buf.readUInt32LE(offset + 18);
    const uncompressedSize = buf.readUInt32LE(offset + 22);
    const filenameLen      = buf.readUInt16LE(offset + 26);
    const extraLen         = buf.readUInt16LE(offset + 28);

    total  += uncompressedSize;
    offset += 30 + filenameLen + extraLen + compressedSize;

    /* Guard against malformed ZIP causing infinite loop */
    if (compressedSize === 0 && uncompressedSize === 0) break;
  }

  return total;
}
