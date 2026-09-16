# 🛡️ LeaseGuard AI — Tenant & Renter Legal GenAI Assistant

> **Prompt Wars Hackathon Submission** | **Vertical:** Residential Tenants & Renters  
> **Status:** Single-Branch (`main`) | **Repo Size:** < 1MB | **Automated Tests:** 24/24 Passing (100%) | **Evaluation Mode:** 100% Offline Capable via Deterministic Mock Engine (Zero API Keys Required)

[![Tests Passing](https://img.shields.io/badge/Vitest-24%2F24%20Passing-10b981.svg)](#3-how-the-solution-works)
[![Branch](https://img.shields.io/badge/Branch-main%20only-blue.svg)](#11-repo-hygiene--audit)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Zero%20PII%20Storage-06b6d4.svg)](SECURITY.md)

---

## 1. Chosen Vertical & Persona

### The Chosen Persona: Residential Tenants & Renters ("LeaseGuard AI")
**LeaseGuard AI** is exclusively built for residential tenants, apartment renters, and subtenants reviewing new leases or lease renewals. 

### Why This Vertical Over the Alternatives?
While freelancer contracts, employment agreements, and SMB vendor agreements are important, **residential tenancy is the single most asymmetric, high-stakes consumer legal contract in everyday life**:
1. **Severe Information Asymmetry:** Standard residential leases are drafted by landlord association attorneys and packed with dense, boilerplate legal jargon. Everyday renters rarely have the funds or time to hire an attorney for an apartment lease.
2. **Unenforceable & Predatory Traps:** Landlords frequently insert clauses that violate statutory tenant rights—such as unannounced 24/7 landlord entry, total habitability waivers ("tenant pays for all structural and plumbing repairs"), punitive liquidated damages, and unlawful deposit forfeitures.
3. **High Financial & Personal Impact:** An unvetted clause can lead to sudden lockouts, lost $5,000+ security deposits, or living in unsafe, unheated premises without recourse.
4. **Concrete Decision Boundaries:** Tenancy law provides clear, objective legal benchmarks (e.g., mandatory 24–48 hour entry notice, statutory warranty of habitability, deposit deduction limits), enabling a deterministic risk engine to escalate urgent flags and generate practical landlord negotiation letters.

---

## 2. Approach, Logic & Architecture

LeaseGuard AI combines **deterministic rule-based decision engines** with **grounded Large Language Model (LLM) reasoning**. It is built not as a generic LLM wrapper, but as a structured legal safety system with visible, inspectable branching logic.

### System Architecture Flow

```
+------------------------------------------------------------------------+
|                        User Ingestion Layer                            |
|       (Paste Text / Upload PDF, DOCX, TXT / 1-Click Sample Fixtures)   |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                Parser & Input Sanitizer (Parsers Layer)                |
|       (MIME verification, 5MB ceiling, null-byte/control char strip)   |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                 Document Type Mismatch Detector (Engine)               |
|  - Inspects text for positive lease tokens vs non-lease patterns        |
|  - If Resume / Invoice / License detected: triggers friendly guidance  |
+-----------------------------------+------------------------------------+
                                    | (Valid Lease)
                                    v
+------------------------------------------------------------------------+
|             Document Complexity & Tone Adaptation Engine               |
|  - Analyzes word count & legalese density (indemnify, exculpate, etc.) |
|  - Dynamically adapts analytical depth (Concise vs In-Depth Breakdown)  |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|              Grounded LLM Provider / Deterministic Mock Engine         |
|  - Powered by versioned prompt templates in `/prompts`                 |
|  - Google Gemini 1.5 Flash (or OpenAI GPT-4o-mini) / Offline Engine    |
+-----------------------------------+------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|              Deterministic Risk Escalation Engine                      |
|  - Scores clauses: CRITICAL / HIGH / MEDIUM / STANDARD                 |
|  - Flags unannounced entry, habitability waivers, deposit forfeiture   |
|  - Auto-escalates attorney review recommendations on high-risk scores  |
+-----------------------------------+------------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
         v                          v                          v
+------------------+      +--------------------+     +------------------+
|  Clause Review   |      |  Substantive Diff  |     |  Grounded Q&A    |
|  & Risk Flags    |      |  (Original vs New) |     |  with Citations  |
+------------------+      +--------------------+     +------------------+
         |                          |                          |
         +--------------------------+--------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|               Prioritized Action Checklist & Letter Builder            |
|  - Immediate / Negotiate / Document / Legal Review action tiers        |
|  - Specific clarification questions for landlord                      |
|  - Ready-to-copy/download landlord negotiation letter draft            |
+------------------------------------------------------------------------+
```

### Inspectable Decision-Making Logic (Section 3 of Brief)

Evaluators can inspect the exact named modules executing the smart assistant behavior:

1. **Document Mismatch Detection (`backend/src/engine/mismatchDetector.ts`):**
   - Detects when a user uploads a resume, commercial invoice, software license, or medical bill instead of a lease.
   - Responds with friendly guidance explaining the mismatch rather than producing a hallucinated lease analysis.
2. **Dynamic Risk Escalation Engine (`backend/src/engine/riskEvaluator.ts`):**
   - Evaluates weighted clause risk scores (0 to 100).
   - If any `CRITICAL` clause (e.g., 0-hour landlord entry, habitability waiver) or `HIGH` clauses are present, the system automatically triggers a persistent alert banner and elevates checklist urgency to "Critical Action: Consult Tenant Union / Legal Aid".
3. **Document Complexity & Tone Adaptation (`backend/src/engine/toneComplexity.ts`):**
   - Assesses document length and legalese density (archaic terms like *indemnify*, *exculpate*, *heretofore*, *liquidated damages*).
   - Adapts analysis from concise checkpoints (for simple agreements) to deep-dive clause breakdowns (for dense commercialized leases).
4. **Strict Grounding & Hallucination Refusal (`backend/src/engine/groundedQAEvaluator.ts`):**
   - Inspects user questions against document token sets.
   - If a topic is unaddressed in the document (e.g., asking about rooftop swimming pools, smoking policies, or valet parking in a lease that doesn't mention them), **the engine refuses to invent clauses**, explicitly stating: *"The provided lease agreement does not address or mention this topic"*, and guides the user to state statutory default laws.
5. **Section-Aware Chunking (`backend/src/parsers/chunker.ts`):**
   - Splits long leases by numbered clauses and legal sections rather than arbitrarily truncating text.

### Prompt Design Philosophy (`/prompts`)
All prompt templates are stored as **clean, versioned, standalone text files** in `/prompts`—never hardcoded inline across backend logic:
- `prompts/system_persona.txt`: Establishes the tenant-defense persona, strict grounding rules, and persistent informational disclaimer.
- `prompts/document_classification.txt`: Validates residential lease markers.
- `prompts/clause_extraction.txt`: Directs clause simplification, obligations, and risk tagging.
- `prompts/substantive_comparison.txt`: Compares prior vs renewal agreements for legal and financial shifts.
- `prompts/grounded_qa.txt`: Enforces verbatim citations and strict refusal when unmentioned.
- `prompts/action_checklist.txt`: Formulates prioritized negotiation checklists and drafted letters.

---

## 3. How the Solution Works

### Quick Start from a Clean Clone (Evaluator Fast-Track)

Assume zero prior configuration. The repository is configured to run out of the box in **Offline Mock Mode** with zero API keys required.

#### Step 1: Install Dependencies
```bash
git clone https://github.com/workamannakashe-sudo/AI-for-Legal-Assistance-Access-promptwar.git
cd AI-for-Legal-Assistance-Access-promptwar
npm install
```

#### Step 2: Build & Start Application
```bash
# Build frontend and backend
npm run build

# Start production server (serves both API and UI on port 5000)
npm start
```
Open your browser to: **`http://localhost:5000`**

*(For live hot-reloading development: run `npm run dev` to start Vite on port 3000 and the Express backend on port 5000).*

---

### Running the Automated Test Suite
The repository includes a comprehensive automated test suite (unit and integration tests) using Vitest:

```bash
npm test
```
*Expected Output:*
```
Test Files  4 passed (4)
Tests       24 passed (24)
Duration    1.66s
```
**Test Coverage Includes:**
* `tests/unit/decision_engine.test.ts`: Document mismatch detection, risk escalation thresholds, heuristic predatory checks, and complexity analysis.
* `tests/unit/grounded_qa.test.ts`: Keyword grounding checks, verbatim citation extraction, and refusal of unmentioned topics.
* `tests/unit/document_parser.test.ts`: Sanitization of null bytes/CRLF, and section-aware chunking.
* `tests/integration/api.test.ts`: Integration tests covering `/api/health`, `/api/samples`, `/api/analyze`, `/api/compare`, `/api/qa`, and `/api/checklist`.

---

### Evaluator 1-Click Feature Testing (Offline Demo)

The web UI includes **Quick Sample Buttons** at the top of the screen so you can verify all capabilities in seconds:

1. **Standard Fair Lease Review:**
   - Click the **"Standard Lease"** sample button and click **"Analyze Lease Rights"**.
   - Review the low risk score (18/100), key details (rent, deposit, 24-hr entry notice), and categorized tenant/landlord obligations.
2. **Predatory Lease (Red Flags & Critical Escalation):**
   - Click the **"Predatory Lease (Red Flags)"** sample button and click **"Analyze Lease Rights"**.
   - Notice the risk score jumps to **CRITICAL (85/100)**, the persistent top banner shifts to red with an attorney referral advisory, and predatory clauses (unannounced entry, habitability waiver, deposit forfeiture) are flagged.
3. **Document Mismatch Detection:**
   - Click the **"Test Mismatch (Resume)"** sample button and click **"Analyze Lease Rights"**.
   - See the dynamic alert card appear: *"Document Mismatch Detected: Resume / Curriculum Vitae"*, providing helpful guidance without crashing.
4. **Substantive Version Comparison:**
   - Navigate to the **"3. Version Comparison"** tab.
   - Click **"Load Sample: Original vs. Renewal Amendment"** and click **"Run Substantive Diff"**.
   - Observe the financial changes (+13.9% base rent, new $85/month amenity fee, +150% late fee hike, shortened grace period) and substantive clause diffs.
5. **Grounded Q&A & Hallucination Refusal:**
   - Navigate to the **"4. Grounded Q&A"** tab.
   - Click the quick question: *"How much advance notice must the landlord give before entering?"* → Returns the exact verbatim citation from Section 5.
   - Click the quick prompt: *"Is there rooftop swimming pool access or valet parking? (Tests Refusal)"* → Returns an explicit refusal: *"Document Is Silent — Refused Hallucination"*, explaining that the lease contains no such clause.
6. **Action Checklist & Landlord Letter Generator:**
   - Navigate to the **"5. Next Steps & Letter"** tab.
   - Check off interactive items, review clarification questions for the landlord, and click **"Copy Letter"** or **"Download .txt"** to export the ready-to-send negotiation letter.
7. **Legal Disclaimer & Resources:**
   - Click the **"Legal Notice"** button in the header to view the persistent informational disclaimer and contacts for tenant legal aid organizations.

---

### Using Live LLM Mode (Optional)

If you wish to test with live Gemini or OpenAI APIs:
1. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Add your API key:
   ```ini
   GEMINI_API_KEY=your_google_gemini_api_key
   # or
   OPENAI_API_KEY=your_openai_api_key
   MOCK_MODE=false
   ```
3. Restart the server (`npm start`). The header badge will update to **"Live Gemini Engine"**.

---

## 4. Assumptions & Boundaries

1. **Document Scope:** Optimized for English-language residential leases, tenancy agreements, sublease agreements, and lease renewal amendments in the United States and common-law jurisdictions.
2. **Informational Nature:** LeaseGuard AI delivers legal risk analysis and plain-English education; it does not form an attorney-client relationship. High-stakes disputes always trigger explicit recommendations to consult local legal aid or licensed attorneys.
3. **User Rights:** Assumes the user is a party to the agreement (tenant, co-signer, or prospective subtenant).
4. **Jurisdictional Defaults:** Where agreements are silent, standard statutory principles (e.g., implied warranty of habitability, 24-hr entry notice) are cited as common baseline standards, with advisories that municipal rent boards may offer even stronger protections.

---

## 5. Security & Privacy Architecture (`SECURITY.md`)

- **Zero Client-Side Secret Exposure:** LLM API keys are exclusively handled by the server-side proxy; client assets never contain credentials.
- **In-Memory Ephemeral Processing:** Uploaded leases and user questions are processed in memory and never written to permanent disk databases or logged to third parties.
- **Input Sanitization:** File uploads are strictly validated for MIME type (`.txt`, `.pdf`, `.docx`) and capped at 5MB. Script tags and executable headers are rejected.
- **Rate Limiting:** Built-in sliding window rate-limiting middleware guards against runaway API consumption.

---

## 6. Project Structure

```
├── backend/
│   ├── src/
│   │   ├── engine/
│   │   │   ├── riskEvaluator.ts        # Dynamic risk scoring & legal severity escalation
│   │   │   ├── mismatchDetector.ts     # Document validation & mismatch detection
│   │   │   ├── groundedQAEvaluator.ts  # Grounding verification & hallucination refusal
│   │   │   └── toneComplexity.ts       # Document complexity & tone adaptation
│   │   ├── services/
│   │   │   ├── llmService.ts           # Modular prompt loader & LLM provider
│   │   │   └── mockService.ts          # Deterministic offline mock engine
│   │   ├── parsers/
│   │   │   ├── textExtractor.ts        # PDF/DOCX/TXT text extraction & sanitization
│   │   │   └── chunker.ts              # Section-aware document chunker
│   │   ├── routes/
│   │   │   └── api.ts                  # /analyze, /compare, /qa, /checklist, /samples, /health
│   │   └── server.ts                   # Express server with security headers & rate limiting
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx              # Top navigation, status indicator, persistent legal disclaimer
│   │   │   ├── LegalBanner.tsx         # Persistent disclaimer banner with risk escalation
│   │   │   ├── LegalModal.tsx          # Full legal disclaimer & tenant legal aid directory
│   │   │   ├── IngestionPanel.tsx      # File upload, paste, quick samples, mismatch alert
│   │   │   ├── ClauseReview.tsx        # Categorized clauses, plain English, why it matters, recommendations
│   │   │   ├── ComparisonView.tsx      # Substantive diff view (Version A vs Version B)
│   │   │   ├── GroundedQA.tsx          # Grounded Q&A with citations & explicit refusal
│   │   │   └── ChecklistView.tsx       # Action checklist with priority tiers & letter builder
│   │   ├── types.ts                    # TypeScript domain models
│   │   ├── index.css                   # Glassmorphic accessible design system
│   │   ├── App.tsx                     # Main application container
│   │   └── main.tsx                    # React mount point
│   ├── index.html                      # Semantic HTML with accessibility & font imports
│   ├── vite.config.ts                  # Vite build configuration
│   └── tsconfig.json
├── prompts/                            # Dedicated, versioned prompt template files
│   ├── system_persona.txt
│   ├── document_classification.txt
│   ├── clause_extraction.txt
│   ├── substantive_comparison.txt
│   ├── grounded_qa.txt
│   └── action_checklist.txt
├── samples/                            # Non-sensitive synthetic sample leases for instant testing
│   ├── standard_fair_lease.txt
│   ├── predatory_lease.txt
│   ├── lease_amendment_renewal.txt
│   └── non_lease_mismatch.txt
├── tests/                              # Automated test suite (Vitest)
│   ├── unit/
│   │   ├── decision_engine.test.ts
│   │   ├── grounded_qa.test.ts
│   │   └── document_parser.test.ts
│   └── integration/
│       └── api.test.ts
├── docs/
│   └── architecture.md                 # System architecture specification
├── .env.example                        # Safe configuration template
├── .eslintrc.json                      # Consistent linting configuration
├── .gitignore                          # Strict exclusions (< 10MB limit enforcement)
├── SECURITY.md                         # Security and data privacy policy
├── vitest.config.ts                    # Test runner configuration
└── package.json                        # Lean dependency manifest
```

---

## 7. Repo Hygiene & Audit Checklist

- [x] **Repository is Public & Single Branch:** Active on `main` only (zero temporary branches).
- [x] **Repo Size Comfortably Under 10MB:** Total git object size is **< 150 KiB**. All dependency directories (`node_modules`), build directories (`dist`), and local caches are strictly excluded via `.gitignore`.
- [x] **Zero Secrets Committed:** No API keys or `.env` files in git history.
- [x] **Fresh Clone Verified:** Runs seamlessly following README instructions with both Offline Mock Mode and optional Live API keys.
- [x] **Automated Tests Passing:** All 24 tests passing in CI/Vitest.
- [x] **Clear Persona & Vertical:** Tenant / Renter ("LeaseGuard AI") locked and reflected across the entire solution.