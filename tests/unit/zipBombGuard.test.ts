import { describe, it, expect } from 'vitest';
import { validateFile } from '../../backend/src/engine/zipBombGuard.js';

describe('Zip-Bomb & Magic-Byte Guard', () => {
  it('accepts valid PDF with %PDF magic bytes', () => {
    const pdfHeader = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj');
    const result = validateFile(pdfHeader, 'agreement.pdf', 'application/pdf');
    expect(result.valid).toBe(true);
  });

  it('rejects an executable disguised as a PDF', () => {
    const fakePdf = Buffer.from('MZ\x90\x00\x03\x00\x00\x00'); // Windows PE executable magic bytes
    const result = validateFile(fakePdf, 'malicious.pdf', 'application/pdf');
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain('incorrect magic bytes');
  });

  it('rejects files exceeding 5MB size limit', () => {
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    const result = validateFile(oversizedBuffer, 'huge.pdf', 'application/pdf');
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain('exceeds the 5 MB limit');
  });

  it('rejects unsupported extensions', () => {
    const scriptBuffer = Buffer.from('#!/bin/bash\nrm -rf /');
    const result = validateFile(scriptBuffer, 'script.sh', 'application/x-sh');
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain('Unsupported file type');
  });
});
