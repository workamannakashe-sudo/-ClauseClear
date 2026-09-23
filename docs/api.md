# API Specification & Reference (`/api`)

ClauseClear exposes a RESTful JSON API implemented with Express and TypeScript.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://clauseclear.onrender.com/api`

---

## Endpoints

### 1. `GET /api/health`
Returns system status, service version, and AI mode.

**Response (200 OK):**
```json
{
  "status": "online",
  "service": "ClauseClear Legal Engine v2",
  "version": "2.0.0",
  "isMockMode": false
}
```

---

### 2. `POST /api/analyze`
Analyzes a residential lease agreement for risks, predatory clauses, missing protections, and inconsistencies.

**Request Body (JSON):**
```json
{
  "text": "This agreement is made between Landlord A and Tenant B for Flat 101..."
}
```

**Response (200 OK):**
```json
{
  "summary": {
    "headline": "BALANCED LEASE: Customary residential lease...",
    "overallRiskScore": 18,
    "riskLevel": "LOW",
    "criticalNotice": "FAIR / BALANCED: Terms appear customary."
  },
  "clauses": [
    {
      "id": "c1",
      "title": "24-Hour Landlord Notice of Entry",
      "category": "landlord_obligation",
      "riskLevel": "STANDARD",
      "originalSnippet": "Landlord shall provide at least twenty-four (24) hours advance notice...",
      "plainEnglish": "The landlord must notify you 24h in advance before entering."
    }
  ],
  "isMockMode": false,
  "missingClauses": ["Rent escalation clause"]
}
```

---

### 3. `POST /api/qa`
Performs grounded Q&A against the uploaded document. Every answer MUST be strictly supported by source quotes.

**Request Body (JSON):**
```json
{
  "documentText": "Tenant shall deposit ₹50,000...",
  "question": "What is my deposit amount?",
  "language": "en"
}
```

**Response (200 OK):**
```json
{
  "answer": "Your deposit is ₹50,000, which must be returned within 30 days of lease end.",
  "citations": [
    "Tenant shall deposit ₹50,000..."
  ],
  "isGrounded": true
}
```
