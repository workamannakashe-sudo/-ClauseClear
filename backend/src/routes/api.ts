import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractTextFromBuffer, sanitizeText } from '../parsers/textExtractor.js';
import { detectDocumentMismatch } from '../engine/mismatchDetector.js';
import { LLMService } from '../services/llmService.js';
import { checkGroundingRelevance, generateSilentDocumentRefusal } from '../engine/groundedQAEvaluator.js';
import { runGroundingVerifier } from '../engine/groundingVerifier.js';
import { detectMissingClauses } from '../engine/missingClauseDetector.js';
import { validateFile } from '../engine/zipBombGuard.js';

const router  = Router();
const upload  = multer({ limits: { fileSize: 5 * 1024 * 1024 }, storage: multer.memoryStorage() });
const llmSvc  = new LLMService();

/* ── GET /api/health ────────────────────────────────────────────────── */
router.get('/health', (_req, res: Response) => {
  res.json({
    status:     'online',
    service:    'ClauseClear Legal Engine v2',
    version:    '2.0.0',
    isMockMode: llmSvc.getIsMockMode(),
  });
});

/* ── GET /api/samples ───────────────────────────────────────────────── */
router.get('/samples', (_req, res: Response) => {
  try {
    const dir = path.resolve(process.cwd(), 'samples');
    const read = (f: string) => {
      const p = path.join(dir, f);
      return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
    };

    res.json({
      standard: {
        id: 'standard', name: 'Standard Balanced Lease (Mumbai)',
        description: 'A balanced residential L&L agreement — Riya\'s starting point.',
        content: read('riya_standard_mumbai.txt') || read('standard_fair_lease.txt'),
      },
      predatory: {
        id: 'predatory', name: '⚠ Aggressive Landlord Lease',
        description: 'Contains forfeiture clauses, no-notice entry, and habitability waivers.',
        content: read('riya_aggressive_landlord.txt') || read('predatory_lease.txt'),
      },
      riya_inconsistent: {
        id: 'riya_inconsistent', name: 'Internally Inconsistent Agreement',
        description: 'Different notice periods in different clauses — internal contradiction.',
        content: read('riya_inconsistent.txt'),
      },
      riya_missing: {
        id: 'riya_missing', name: 'Missing Clauses Agreement',
        description: 'Absent: deposit refund timeline, notice period, dispute resolution.',
        content: read('riya_missing_clauses.txt'),
      },
      riya_hindi: {
        id: 'riya_hindi', name: 'Hindi / Marathi Agreement',
        description: 'Partially in Hindi — tests multilingual support.',
        content: read('riya_hindi_agreement.txt'),
      },
      renewal: {
        id: 'renewal', name: 'Lease Renewal (Version B — Compare)',
        description: 'Use in Compare mode against the standard lease.',
        content: read('lease_amendment_renewal.txt'),
      },
      mismatch: {
        id: 'mismatch', name: 'Non-Lease (CV/Resume) — Mismatch Test',
        description: 'Tests mismatch detection engine.',
        content: read('non_lease_mismatch.txt'),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to load samples: ${err.message}` });
  }
});

/* ── POST /api/parse — file upload to text ──────────────────────────── */
router.post('/parse', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided.' });
    return;
  }

  /* Security: validate before parsing */
  const validation = validateFile(req.file.buffer, req.file.originalname, req.file.mimetype);
  if (!validation.valid) {
    res.status(400).json({ error: validation.errorMessage, isScannedPdf: validation.isScannedPdf });
    return;
  }

  try {
    const parsed = await extractTextFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    if (!parsed.text || parsed.text.trim().length < 50) {
      res.status(422).json({
        error: 'Could not extract readable text from this file. It may be a scanned PDF.',
        isScannedPdf: true,
      });
      return;
    }
    res.json({ text: parsed.text, charCount: parsed.text.length });
  } catch (err: any) {
    res.status(500).json({ error: `File parsing failed: ${err.message}` });
  }
});

/* ── POST /api/analyze ──────────────────────────────────────────────── */
const optionalUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
};

router.post('/analyze', optionalUpload, async (req: Request, res: Response) => {
  try {
    let documentText = '';

    if (req.file) {
      const v = validateFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      if (!v.valid) { res.status(400).json({ error: v.errorMessage }); return; }

      const parsed = await extractTextFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
      documentText = parsed.text;
    } else if (req.body?.text) {
      documentText = sanitizeText(req.body.text);
    } else {
      res.status(400).json({ error: 'Provide document text or an uploaded file.' });
      return;
    }

    if (!documentText.trim()) {
      res.status(400).json({ error: 'Document text is empty after parsing.' });
      return;
    }

    /* 1. Mismatch detection */
    const mismatch = detectDocumentMismatch(documentText);
    if (!mismatch.isResidentialLease) {
      res.json({ mismatch, summary: null, clauses: [], isMockMode: llmSvc.getIsMockMode() });
      return;
    }

    /* 2. LLM analysis */
    const analysis = await llmSvc.analyzeLease(documentText);

    /* 3. Grounding verifier — runs on every clause */
    const { clauses: verifiedClauses, groundingScore } = runGroundingVerifier(
      documentText,
      analysis.clauses ?? [],
    );

    /* 4. Missing clause detector */
    const { missing: missingClauses, inconsistencies } = detectMissingClauses(documentText);

    res.json({
      ...analysis,
      clauses: verifiedClauses,
      groundingScore,
      missingClauses,
      inconsistencies,
      mismatch,
    });
  } catch (err: any) {
    console.error('[/api/analyze]', err.message);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

/* ── POST /api/compare ──────────────────────────────────────────────── */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { versionA, versionB } = req.body ?? {};
    if (!versionA || !versionB) {
      res.status(400).json({ error: 'Both versionA and versionB are required.' });
      return;
    }
    const result = await llmSvc.compareLeases(sanitizeText(versionA), sanitizeText(versionB));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: `Comparison failed: ${err.message}` });
  }
});

/* ── POST /api/qa ───────────────────────────────────────────────────── */
router.post('/qa', async (req: Request, res: Response) => {
  try {
    const { documentText, question } = req.body ?? {};
    if (!documentText || !question) {
      res.status(400).json({ error: 'Both documentText and question are required.' });
      return;
    }

    const safeText = sanitizeText(documentText);
    const safeQ    = sanitizeText(question);

    /* Grounding relevance check — fast, deterministic */
    const relevance = checkGroundingRelevance(safeText, safeQ);
    if (relevance.isDocumentSilent) {
      res.json(generateSilentDocumentRefusal(safeQ));
      return;
    }

    const answer = await llmSvc.answerQuestion(safeText, safeQ);
    res.json(answer);
  } catch (err: any) {
    res.status(500).json({ error: `Q&A failed: ${err.message}` });
  }
});

/* ── POST /api/qa/stream — Server-Sent Events (SSE) streaming QA ───── */
router.post('/qa/stream', async (req: Request, res: Response) => {
  try {
    const { documentText, question } = req.body ?? {};
    if (!documentText || !question) {
      res.status(400).json({ error: 'Both documentText and question are required.' });
      return;
    }

    const safeText = sanitizeText(documentText);
    const safeQ = sanitizeText(question);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Check if document is silent on this topic
    const relevance = checkGroundingRelevance(safeText, safeQ);
    if (relevance.isDocumentSilent) {
      const refusal = generateSilentDocumentRefusal(safeQ);
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: refusal.answer })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', result: refusal })}\n\n`);
      res.end();
      return;
    }

    // Get answer from LLM or Mock
    const answer = await llmSvc.answerQuestion(safeText, safeQ);
    const words = answer.answer.split(' ');
    
    // Stream response chunks for realistic streaming UI feel
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done', result: answer })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
    res.end();
  }
});

/* ── POST /api/overview — Grade-8 summary & key points ──────────────── */
router.post('/overview', async (req: Request, res: Response) => {
  try {
    const { documentText } = req.body ?? {};
    if (!documentText) {
      res.status(400).json({ error: 'documentText is required.' });
      return;
    }

    const safeText = sanitizeText(documentText);
    const analysis = await llmSvc.analyzeLease(safeText);
    const missing = detectMissingClauses(safeText);

    res.json({
      summary: analysis.summary,
      keyPoints: [
        `Monthly Rent: ${analysis.summary?.keyDetails?.rentAmount ?? 'Not clearly stated'}`,
        `Security Deposit: ${analysis.summary?.keyDetails?.securityDeposit ?? 'Not specified'}`,
        `Notice Period: ${analysis.summary?.keyDetails?.noticePeriodDays ? `${analysis.summary.keyDetails.noticePeriodDays} days` : 'Not specified'}`,
        `Term: ${analysis.summary?.keyDetails?.leaseTerm ?? '11 Months (Standard L&L)'}`,
        `Risk Status: ${analysis.summary?.riskLevel ?? 'LOW'} (Score: ${analysis.summary?.overallRiskScore ?? 20}/100)`
      ],
      missingClauses: missing.missing,
      inconsistencies: missing.inconsistencies
    });
  } catch (err: any) {
    res.status(500).json({ error: `Overview failed: ${err.message}` });
  }
});

/* ── POST /api/grounding-score — Standalone grounding verifier ───────── */
router.post('/grounding-score', (req: Request, res: Response) => {
  try {
    const { documentText, clauses } = req.body ?? {};
    if (!documentText || !Array.isArray(clauses)) {
      res.status(400).json({ error: 'documentText and clauses array are required.' });
      return;
    }

    const result = runGroundingVerifier(documentText, clauses);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: `Grounding score calculation failed: ${err.message}` });
  }
});

/* ── POST /api/checklist ────────────────────────────────────────────── */
router.post('/checklist', async (req: Request, res: Response) => {
  try {
    const { analysis } = req.body ?? {};
    if (!analysis) {
      res.status(400).json({ error: 'Analysis payload is required.' });
      return;
    }
    const result = await llmSvc.generateChecklist(analysis);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: `Checklist generation failed: ${err.message}` });
  }
});

/* ── DELETE /api/session — privacy: clear in-memory session data ────── */
router.delete('/session', (_req, res: Response) => {
  /* Server is stateless — in-memory store is on the client.
     This endpoint exists for completeness and to satisfy the privacy guarantee. */
  res.json({ cleared: true, message: 'Session data cleared. No document text is stored server-side.' });
});

export default router;
