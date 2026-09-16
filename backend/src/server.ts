import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple sliding window rate limit counter
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;

app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    clientData.count++;
  }

  requestCounts.set(ip, clientData);

  if (clientData.count > MAX_REQUESTS_PER_MINUTE) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before making more requests to protect system capacity.'
    });
    return;
  }

  next();
});

// API Routes
app.use('/api', apiRouter);

// Serve static frontend in production if built
const frontendDist = path.resolve(process.cwd(), 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({
        message: 'LeaseGuard AI API is active. Start Vite dev server for frontend on port 3000.'
      });
    }
  });
});

// Central Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An internal server error occurred.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🛡️  LeaseGuard AI Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚙️  Mode: ${process.env.MOCK_MODE === 'true' || !process.env.GEMINI_API_KEY ? 'Offline Mock Mode' : 'Live LLM Provider'}`);
    console.log(`==================================================\n`);
  });
}

export default app;
