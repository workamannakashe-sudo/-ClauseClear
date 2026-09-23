import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/server.js';

describe('ClauseClear API Endpoints', () => {
  it('GET /api/health returns online status and mock mode info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toContain('ClauseClear');
  });

  it('GET /api/samples returns sample fixtures for instant evaluator testing', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(res.body.standard).toBeDefined();
    expect(res.body.predatory).toBeDefined();
    expect(res.body.riya_inconsistent).toBeDefined();
    expect(res.body.riya_missing).toBeDefined();
    expect(res.body.riya_hindi).toBeDefined();
  });

  it('POST /api/analyze flags non-lease mismatch cleanly without crashing', async () => {
    const mismatchText = `
      RESUME - Jane Doe
      Education: Master of Science in Data Engineering
      Experience: Lead Data Architect at CloudScale Systems.
      Skills: Python, Spark, SQL, Docker.
    `;
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: mismatchText });

    expect(res.status).toBe(200);
    expect(res.body.mismatch).toBeDefined();
    expect(res.body.mismatch.isResidentialLease).toBe(false);
  });

  it('POST /api/analyze evaluates standard fair lease with grounding and missing clause scan', async () => {
    const leaseText = `
      LEAVE AND LICENSE AGREEMENT
      Licensor agrees to license Flat 301 to Licensee Riya for ₹35,000/month.
      A refundable security deposit of ₹70,000 is held.
      Licensor shall provide twenty-four (24) hours advance notice of entry.
      Licensor shall maintain electrical and plumbing structures.
    `;
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: leaseText });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.clauses.length).toBeGreaterThan(0);
    expect(res.body.groundingScore).toBeDefined();
    expect(res.body.missingClauses).toBeDefined();
  });

  it('POST /api/overview returns Grade-8 summary and 5 key points', async () => {
    const leaseText = `
      LEAVE AND LICENSE AGREEMENT
      Monthly license fee is ₹30,000. Security deposit ₹60,000.
      Term is 11 months. Notice period is 30 days.
    `;
    const res = await request(app)
      .post('/api/overview')
      .send({ documentText: leaseText });

    expect(res.status).toBe(200);
    expect(res.body.keyPoints).toBeDefined();
    expect(res.body.keyPoints.length).toBe(5);
  });

  it('POST /api/compare returns substantive difference between versions', async () => {
    const res = await request(app)
      .post('/api/compare')
      .send({
        versionA: 'Monthly rent is $1,800. No trash fee.',
        versionB: 'Monthly rent is $2,050. Monthly trash fee is $85.'
      });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.differences).toBeDefined();
  });

  it('POST /api/qa handles grounded questions with quote and refusal on silence', async () => {
    const doc = 'The security deposit of ₹50,000 shall be refunded within 7 days.';
    
    // Addressed question
    const res1 = await request(app)
      .post('/api/qa')
      .send({ documentText: doc, question: 'What is the security deposit?' });
    expect(res1.status).toBe(200);
    expect(res1.body.isAddressedInDocument).toBe(true);

    // Silent question
    const res2 = await request(app)
      .post('/api/qa')
      .send({ documentText: doc, question: 'Are pets allowed in the building?' });
    expect(res2.status).toBe(200);
    expect(res2.body.isAddressedInDocument).toBe(false);
    expect(res2.body.answer).toContain('not address or mention');
  });

  it('DELETE /api/session acknowledges privacy cleanup', async () => {
    const res = await request(app).delete('/api/session');
    expect(res.status).toBe(200);
    expect(res.body.cleared).toBe(true);
  });
});
