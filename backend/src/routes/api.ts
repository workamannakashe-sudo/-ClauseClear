import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { extractTextFromBuffer, sanitizeText } from '../parsers/textExtractor.js';
import { detectDocumentMismatch } from '../engine/mismatchDetector.js';
import { LLMService } from '../services/llmService.js';
import { checkGroundingRelevance, generateSilentDocumentRefusal } from '../engine/groundedQAEvaluator.js';

const router = Router();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const llmService = new LLMService();

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    isMockMode: llmService.getIsMockMode(),
    service: 'LeaseGuard AI Legal Engine',
    version: '1.0.0'
  });
});

// GET /api/samples - Preloaded samples for 1-click evaluator testing
router.get('/samples', (_req: Request, res: Response) => {
  try {
    const samplesDir = path.resolve(process.cwd(), 'samples');
    const read = (filename: string) => {
      const p = path.join(samplesDir, filename);
      return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
    };

    res.json({
      standard: {
        id: 'standard',
        name: 'Standard Fair Lease (Balanced)',
        description: 'Standard residential lease with 24hr notice and habitability guarantees.',
        content: read('standard_fair_lease.txt')
      },
      predatory: {
        id: 'predatory',
        name: 'High-Risk Predatory Lease (Red Flags)',
        description: 'Contains unannounced entry, deposit forfeiture, habitability waiver, and excessive fees.',
        content: read('predatory_lease.txt')
      },
      renewal: {
        id: 'renewal',
        name: 'Lease Renewal & Amendment (Version B)',
        description: 'Used in comparison mode against standard fair lease to reveal substantive hikes and obligations.',
        content: read('lease_amendment_renewal.txt')
      },
      mismatch: {
        id: 'mismatch',
        name: 'Non-Lease Mismatch (Resume/CV)',
        description: 'Upload a software engineer resume to test mismatch detection engine.',
        content: read('non_lease_mismatch.txt')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to load samples: ${err.message}` });
  }
});

// POST /api/analyze - Text or file upload
router.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let documentText = '';

    if (req.file) {
      const parsed = await extractTextFromBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      documentText = parsed.text;
    } else if (req.body.text) {
      documentText = sanitizeText(req.body.text);
    } else {
      res.status(400).json({ error: 'Please provide either document text or an uploaded file.' });
      return;
    }

    if (!documentText || documentText.trim().length === 0) {
      res.status(400).json({ error: 'Extracted document text is empty.' });
      return;
    }

    // Run mismatch detector first (Section 3: Detect document type mismatches)
    const mismatch = detectDocumentMismatch(documentText);
    if (!mismatch.isResidentialLease) {
      res.json({
        mismatch,
        summary: null,
        clauses: [],
        isMockMode: llmService.getIsMockMode()
      });
      return;
    }

    // Run core lease analysis
    const analysis = await llmService.analyzeLease(documentText);
    res.json({
      ...analysis,
      mismatch
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

// POST /api/compare - Compare Version A and Version B
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { versionA, versionB } = req.body;
    if (!versionA || !versionB) {
      res.status(400).json({ error: 'Both versionA and versionB text must be provided for comparison.' });
      return;
    }

    const sanitizedA = sanitizeText(versionA);
    const sanitizedB = sanitizeText(versionB);

    const result = await llmService.compareLeases(sanitizedA, sanitizedB);
    res.json(result);
  } catch (err: any) {
    console.error('Comparison error:', err);
    res.status(500).json({ error: `Comparison failed: ${err.message}` });
  }
});

// POST /api/qa - Grounded question answering
router.post('/qa', async (req: Request, res: Response) => {
  try {
    const { documentText, question } = req.body;
    if (!documentText || !question) {
      res.status(400).json({ error: 'Both documentText and question are required.' });
      return;
    }

    const sanitizedText = sanitizeText(documentText);
    const sanitizedQuestion = sanitizeText(question);

    // Grounding check: verify if document touches on question topic
    const relevance = checkGroundingRelevance(sanitizedText, sanitizedQuestion);
    if (relevance.isDocumentSilent) {
      const refusal = generateSilentDocumentRefusal(sanitizedQuestion);
      res.json(refusal);
      return;
    }

    const answer = await llmService.answerQuestion(sanitizedText, sanitizedQuestion);
    res.json(answer);
  } catch (err: any) {
    console.error('QA error:', err);
    res.status(500).json({ error: `Q&A failed: ${err.message}` });
  }
});

// POST /api/checklist - Action checklist generator
router.post('/checklist', async (req: Request, res: Response) => {
  try {
    const { analysis } = req.body;
    if (!analysis) {
      res.status(400).json({ error: 'Analysis payload is required to generate checklist.' });
      return;
    }

    const checklistResult = await llmService.generateChecklist(analysis);
    res.json(checklistResult);
  } catch (err: any) {
    console.error('Checklist error:', err);
    res.status(500).json({ error: `Checklist generation failed: ${err.message}` });
  }
});

export default router;
