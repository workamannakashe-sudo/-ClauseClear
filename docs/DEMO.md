# ClauseClear Judge Demo & 2-Minute Walkthrough (DEMO.md)

Welcome to the ClauseClear evaluation walkthrough. Follow this 2-minute script to inspect all core features, security protections, and verifiable evidence.

---

## ⚡ Quick Start (< 30 Seconds)

1. Start the application:
```bash
npm run dev
```
2. Open your browser at:
`http://localhost:5173` (or the port displayed in terminal)

3. Alternatively, run the automated verification benchmark:
```bash
npm run eval
```

---

## 🧭 Step-by-Step 2-Minute Walkthrough

### Step 1: Persona Onboarding & Sample Selection (0:00 - 0:30)
1. **Notice the Riya Hero**: "Welcome, Riya! First time signing a rental agreement?"
2. Click **"Try with a sample"** in the ingestion panel.
3. Select **"Standard Balanced Lease (Mumbai)"**.
4. Click **"Analyze Lease Terms"**.
5. Observe the **Overview Tab**:
   - Grade-8 Plain-English Verdict.
   - Financial quick-strip (₹35,000 rent, ₹70,000 deposit).
   - Radial SVG Risk Gauge displaying **18/100 (LOW)**.
   - Click "How this score was calculated" to inspect the transparent weight breakdown.
   - Grounding Verification Badge: **100% Grounded**.

### Step 2: Split-View Grounding & Verification (0:30 - 1:00)
1. Click the **"Clause Breakdown"** tab.
2. Notice the side-by-side view: Original contract on the left, simplified clause cards on the right.
3. Click any clause card (e.g. "Term & Tenure" or "Notice of Entry").
4. Observe the live highlight scroll in the original document — verifying exact verbatim grounding.

### Step 3: Predatory Lease & Inconsistency Detection (1:00 - 1:20)
1. Return to the **Upload / Input** tab.
2. Select sample **"⚠ Aggressive Landlord Lease"**.
3. Click **"Analyze Lease Terms"**.
4. Observe the immediate escalation:
   - Risk score jumps to **100/100 (CRITICAL)**.
   - Red alert banner flags 100% deposit forfeiture, 24/7 entry without notice, and habitability waivers.
5. Try sample **"Internally Inconsistent Agreement"**:
   - Observe automatic detection of conflicting notice periods (30 days vs 90 days).

### Step 4: Substantive Comparison (1:20 - 1:40)
1. Click the **"Compare Leases"** tab.
2. Click **"Load Sample: Original vs. Renewal Amendment"**.
3. Click **"Run Substantive Comparison"**.
4. Review the financial delta table: +13.9% rent hike, hidden $85 amenity fee, shifted HVAC obligations.

### Step 5: Grounded Q&A & Lawyer Brief (1:40 - 2:00)
1. Click the **"Ask Questions"** tab.
2. Ask: *"What is my security deposit?"*
   - Model quotes ₹70,000 with verbatim citation from Section 3.
3. Ask: *"Can I keep a pet parrot?"*
   - Model triggers **Refusal on Silence**: *"The provided agreement does not address or mention this topic."*
4. Click the **"Action Checklist"** tab:
   - Review pre-sign verification checklist.
   - Review "Questions for Lawyer / Legal Aid Advocate".
   - Click **"Download / Print Lawyer Brief"** to inspect printable advocate summary.
5. Click the **Language Toggle** in the header to switch to **हिन्दी (HI)** or **मराठी (MR)**.
