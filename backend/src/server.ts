import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Security Headers (hardened) ────────────────────────────────────── */
app.use((_req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy — strict; no inline eval; restrict font/img sources
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );
  res.setHeader('X-Frame-Options',       'DENY');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy',       'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy',    'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection',      '1; mode=block');
  // HSTS — only set in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  next();
});

/* ── CORS — restrict to known origins in dev ────────────────────────── */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (origin === undefined) and allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
}));

/* ── Body parsers with size limits ──────────────────────────────────── */
// Documents come via multipart/form-data; JSON body is for text-paste analysis
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

/* ── Rate limiting — sliding window per IP ──────────────────────────── */
interface RateEntry { count: number; resetTime: number }
const rateLimitStore = new Map<string, RateEntry>();
const RATE_WINDOW_MS  = 60_000; // 1 minute
const RATE_LIMIT_DEFAULT = 60;
const RATE_LIMIT_ANALYZE = 30;  // tighter for expensive endpoint

function rateLimiter(maxReqs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip  = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key) ?? { count: 0, resetTime: now + RATE_WINDOW_MS };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + RATE_WINDOW_MS;
    } else {
      entry.count++;
    }
    rateLimitStore.set(key, entry);

    res.setHeader('X-RateLimit-Limit',     String(maxReqs));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxReqs - entry.count)));
    res.setHeader('X-RateLimit-Reset',     String(Math.ceil(entry.resetTime / 1000)));

    if (entry.count > maxReqs) {
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment before making more requests.',
      });
      return;
    }
    next();
  };
}

// Apply tighter limit to analyze endpoint
app.use('/api/analyze', rateLimiter(RATE_LIMIT_ANALYZE));
app.use('/api', rateLimiter(RATE_LIMIT_DEFAULT));

/* ── API Routes ─────────────────────────────────────────────────────── */
app.use('/api', apiRouter);

/* ── Static frontend (production build) ────────────────────────────── */
const frontendDist = fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html'))
  ? path.resolve(process.cwd(), 'dist')
  : path.resolve(process.cwd(), 'frontend', 'dist');
app.use(express.static(frontendDist, { dotfiles: 'deny' }));

app.get('*', (_req: Request, res: Response) => {
  const idx = path.join(frontendDist, 'index.html');
  res.sendFile(idx, (err) => {
    if (err) {
      res.json({ message: 'ClauseClear API active. Run Vite dev server on port 3000.' });
    }
  });
});

/* ── Central Error Handler ──────────────────────────────────────────── */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[ClauseClear]', err.message);
  res.status(err.status ?? 500).json({
    error: 'An internal error occurred. Please try again.',
    ...(isDev && { details: err.message }),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n${'─'.repeat(52)}`);
    console.log(`⚖️  ClauseClear API  →  http://localhost:${PORT}`);
    console.log(`🌐 Mode: ${process.env.MOCK_MODE === 'true' || !process.env.GEMINI_API_KEY ? '🎭 Demo (Mock)' : '🤖 Live (Gemini)'}`);
    console.log(`🔒 Security headers: CSP · X-Frame-Options · HSTS`);
    console.log(`${'─'.repeat(52)}\n`);
  });
}

export default app;
