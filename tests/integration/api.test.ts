import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/server.js';

describe('LeaseGuard AI API Endpoints', () => {
  it('GET /api/health returns online status and mock mode info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toContain('LeaseGuard AI');
  });

  it('GET /api/samples returns sample fixtures for instant evaluator testing', async () => {
    const res = await request(app).get('/api/samples');
    expect(res.status).toBe(200);
    expect(res.body.standard).toBeDefined();
    expect(res.body.predatory).toBeDefined();
    expect(res.body.renewal).toBeDefined();
    expect(res.body.mismatch).toBeDefined();
    expect(res.body.standard.content).toContain('742 Evergreen Terrace');
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
    expect(res.body.mismatch.guidanceMessage).toContain('residential rental agreements');
  });

  it('POST /api/analyze evaluates standard fair lease', async () => {
    const leaseText = `
      RESIDENTIAL LEASE AGREEMENT
      Landlord agrees to rent Apt 3B to Tenant for $1,800/month.
      A security deposit of $1,800 is held in escrow.
      Landlord shall provide 24 hours advance notice of entry.
      Landlord shall maintain plumbing and heating.
    `;
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: leaseText });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.clauses.length).toBeGreaterThan(0);
    expect(res.body.summary.riskLevel).toBeDefined();
  });

  it('POST /api/compare returns substantive difference between versions', async () => {
    const res = await request(app)
      .post('/api/compare')
      .send({
        versionA: 'Rent is $1,800. 5-day grace period. Late fee $50.',
        versionB: 'Rent is $2,050. 3-day grace period. Late fee $125. New amenity fee $85.'
      });

    expect(res.status).toBe(200);
    expect(res.body.summary.favourabilityShift).toBeDefined();
    expect(res.body.differences.length).toBeGreaterThan(0);
  });

  it('POST /api/qa answers grounded question when present', async () => {
    const leaseText = 'Landlord shall provide twenty-four (24) hours advance notice before entering.';
    const res = await request(app)
      .post('/api/qa')
      .send({
        documentText: leaseText,
        question: 'How much notice must the landlord give before entering?'
      });

    expect(res.status).toBe(200);
    expect(res.body.isAddressedInDocument).toBe(true);
    expect(res.body.confidence).toBe('HIGH');
  });

  it('POST /api/qa explicitly refuses unaddressed question', async () => {
    const leaseText = 'Rent is $1,800. Due on the 1st.';
    const res = await request(app)
      .post('/api/qa')
      .send({
        documentText: leaseText,
        question: 'Can I install an outdoor swimming pool on the rooftop?'
      });

    expect(res.status).toBe(200);
    expect(res.body.isAddressedInDocument).toBe(false);
    expect(res.body.confidence).toBe('UNADDRESSED');
    expect(res.body.answer).toContain('does not address or mention');
  });

  it('POST /api/checklist generates prioritized action items and drafted letter', async () => {
    const mockAnalysis = {
      summary: {
        riskLevel: 'CRITICAL',
        overallRiskScore: 85,
        headline: 'Predatory lease detected',
        criticalNotice: 'Severe risks found',
        keyDetails: {},
        complexityLevel: 'MODERATE'
      },
      clauses: []
    };

    const res = await request(app)
      .post('/api/checklist')
      .send({ analysis: mockAnalysis });

    expect(res.status).toBe(200);
    expect(res.body.checklist.length).toBeGreaterThan(0);
    expect(res.body.draftNegotiationLetter).toBeDefined();
    expect(res.body.draftNegotiationLetter.body.length).toBeGreaterThan(50);
  });
});
