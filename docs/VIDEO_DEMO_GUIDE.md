# 🎬 ClauseClear — Hackathon Video Submission & Recording Guide (With Demo Data)

> **Target Length:** ~3 Minutes 30 Seconds (Strictly under 4:00 limit)  
> **Target Persona:** Riya (First-time Indian Urban Tenant signing Leave & License Agreement)  
> **App URL:** `http://localhost:5173` (`npm run dev`)  
> **GenAI Engine:** Google Gemini AI + Deterministic Grounding Verifier Engine  

---

## ⏱️ Video Script Timeline & Shot List

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ SECTION 1: Project Walkthrough & Overview (0:00 - 1:00)                           │
│ - Persona introduction ("Riya", Indian urban tenant facing predatory leases)      │
│ - Upload interface & Golden Sample selection                                     │
│ - Plain-English summary, Transparent Risk Score, & Verbatim Grounding Badge       │
├───────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 2: Live Testing & Real-Time Input (1:00 - 1:55)                           │
│ - Live typing & raw text entry ( pausing on inputs so judges can read )           │
│ - Success Case: Standard Mumbai Lease analysis                                    │
│ - Predatory/Edge Case: Aggressive Landlord Lease (100% deposit forfeiture alert)  │
│ - Mismatch/Error Case: Document Type Detector blocking non-lease uploads         │
├───────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 3: GenAI Integration in Action (1:55 - 2:45)                              │
│ - Explicit callout: Google Gemini API integration                                 │
│ - Prompt in -> Plain-English Translation + Grounded Verbatim Quotes out           │
│ - Dynamic behavior test: Grounded Q&A tab ("What is my deposit?" vs Pet Refusal)  │
├───────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 4: Lease Compare & Lawyer Brief (2:45 - 3:15)                             │
│ - Substantive comparison between original lease vs renewal (+13.9% rent hike)   │
│ - Printable Lawyer Brief & Action Checklist for legal aid advocates              │
├───────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 5: Wrap-Up & Submission Check (3:15 - 3:30)                               │
│ - Verification benchmark summary (44/44 Tests, 10/10 Evals)                      │
│ - Final submission checklist review                                               │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Recording Instructions & Copy-Paste Demo Data

### 🎬 Section 1: Core Walkthrough (0:00 – 1:00)
* **Screen State:** Homepage at `http://localhost:5173`
* **Narration Script:**
  > *"Meet Riya — a first-time urban tenant in Mumbai signing a Leave & License agreement. Like millions of Indian renters, Riya faces 20-page legal documents packed with predatory clauses. ClauseClear bridges this asymmetry using grounded Google Gemini AI."*
* **Action:**
  1. Click the button **`✦ Standard Lease`** (`Standard Balanced Lease (Mumbai)`).
  2. Click **"Analyze Lease Terms"**.
* **What to Highlight on Screen:**
  - Grade-8 Plain-English Verdict.
  - Financial Quick-Strip (**₹35,000 Rent, ₹70,000 Security Deposit**).
  - SVG Risk Gauge (**18/100 - LOW RISK**).
  - Grounding Verification Badge (**100% Grounded**).

---

### 🧪 Section 2: Live Testing & Edge Cases (1:00 – 1:55)
* **Requirement:** Video Submission Guide requires live inputs typed/pasted on screen with a brief pause.

#### 📝 Demo Data Block A — Live Typing Test (Valid Standard Lease)
> **Instructions:** Clear the text box, paste the snippet below, and **pause for 2 seconds** so judges can read the input.

```text
LEAVE AND LICENSE AGREEMENT
This agreement is made between Licensor Mr. Rajesh Sharma and Licensee Ms. Riya Patel.
1. RENT & DEPOSIT: The Licensee shall pay a monthly license fee of INR 35,000 on or before the 5th of each calendar month. The Licensee has deposited an interest-free refundable security deposit of INR 70,000.
2. REFUND OF DEPOSIT: The Security Deposit shall be refunded by the Licensor within 15 days of vacant possession handover.
3. ENTRY NOTICE: The Licensor or authorized representative shall give at least 24 hours prior written notice before entering the licensed premises.
```

- **Action:** Click **"Analyze Lease Terms"**. Point out instant analysis and verbatim quote matching.

---

#### 📝 Demo Data Block B — Predatory Edge Case
* **Action:** Click sample button **`⚠ Aggressive Lease`** (`riya_aggressive_landlord.txt`) -> Click **"Analyze Lease Terms"**.
* **Narration Script:**
  > *"Judges want to see how the system handles predatory traps. When Riya loads an aggressive landlord contract, ClauseClear instantly flags a 100/100 CRITICAL Risk score."*
* **What to Highlight on Screen:**
  - **Red Alert 1:** 100% Security Deposit Forfeiture for minor wear and tear.
  - **Red Alert 2:** 24/7 unannounced landlord entry without notice.
  - **Red Alert 3:** Landlord immunity from structural repairs.

---

#### 📝 Demo Data Block C — Document Type Mismatch Guard
> **Instructions:** Clear the text box and paste a non-lease text snippet (e.g. Resume / Invoice) to prove input validation.

```text
RIYA PATEL - SOFTWARE ENGINEER RESUME
Experience: 3 years full-stack web development (React, Node.js, TypeScript).
Education: B.Tech in Computer Science, University of Mumbai.
Skills: Web design, AI integration, REST APIs, UI testing.
```

- **Action:** Click **"Analyze Lease Terms"**.
- **What to Highlight:** Guardrail alert: *"Document Mismatch Detected: This document appears to be a resume/CV rather than an Indian residential lease agreement."* (Proves safety against AI hallucination).

---

### 🤖 Section 3: GenAI Integration in Action (1:55 – 2:45)
* **Narration Script:**
  > *"ClauseClear uses Google Gemini AI for semantic legal reasoning, paired with our deterministic post-processing Grounding Verifier Engine. Every AI summary must cite an exact verbatim substring from the contract text."*

#### 🔍 Step A: Split-View Grounding Highlight
- Open **"Clause Breakdown"** tab.
- Click clause card **"Notice of Entry"**.
- Show the automatic smooth scroll on the left panel highlighting exact text: `"give at least 24 hours prior written notice"`.

#### 💬 Step B: Dynamic Q&A & Refusal on Silence
- Open **"Ask Questions"** tab.

**Live Question 1 (Grounded Answer):**
> Type: `What is my security deposit and when will it be refunded?`  
> *(Pause 1s, click Ask)*  
> **Gemini Output:** `₹70,000, refundable within 15 days of vacant possession handover.` (Grounding Score: 100%)

**Live Question 2 (Dynamic Refusal Test):**
> Type: `Can I keep a pet cat in the apartment?`  
> *(Pause 1s, click Ask)*  
> **Gemini Output:** `Refusal on Silence: The provided agreement does not address or mention pet policies.`  
> *(Narration: "This proves AI responses are dynamic and grounded, refusing to invent terms not present in the contract.")*

---

### 📊 Section 4: Lease Comparison & Lawyer Brief (2:45 – 3:15)
* **Action:**
  1. Click **"Compare Leases"** tab.
  2. Click **"Load Sample: Original vs. Renewal Amendment"**.
  3. Click **"Run Substantive Comparison"**.
* **What to Highlight:**
  - **Financial Delta:** Rent hike from ₹35,000 to ₹39,800 (**+13.9% increase**).
  - **Hidden Fee:** Surprise ₹2,500 monthly building amenity charge.
  - **Shifted Obligation:** Tenant now responsible for major HVAC repairs.
* **Lawyer Brief Action:**
  1. Click **"Action Checklist"** tab.
  2. Click **"Download / Print Lawyer Brief"**.
  3. Show the clean, printable legal aid advocate brief formatted for quick consultation.

---

### 🏁 Section 5: Conclusion & Verification Benchmark (3:15 – 3:30)
* **Screen State:** Terminal window running `npm run check`.
* **Narration Script:**
  > *"Every feature in ClauseClear is backed by automated tests and golden evals. 44 out of 44 Vitest tests and 10 out of 10 benchmark evals pass reproducibly. ClauseClear protects tenant rights with grounded GenAI."*

---

## 🛑 Pre-Submission Verification Checklist

Before uploading your video, double-check all 11 criteria from the hackathon submission guide:

- [ ] **Walkthrough Complete:** Covers onboarding, analysis, split view, Q&A, and lease comparison.
- [ ] **Live Testing:** Demo Data Blocks A, B, and C were typed/selected live on screen with a 2s pause.
- [ ] **Edge Cases Shown:** Standard lease, predatory lease (100/100 risk), and resume mismatch guard demonstrated.
- [ ] **Readable Inputs:** Text inside text boxes is clearly visible and paused long enough to read.
- [ ] **GenAI Explicitly Highlighted:** Pointed out Google Gemini API integration and verbatim quote citations.
- [ ] **Dynamic AI Proven:** Demonstrated dynamic answers (deposit query vs umentioned pet refusal).
- [ ] **Step-by-Step Flow:** Clear tab progression (Overview -> Breakdown -> Q&A -> Compare -> Checklist).
- [ ] **Clear Audio/Pacing:** Voiceover/captions are clear, moderate pace, without mumbling or long silent gaps.
- [ ] **Under 4 Minutes:** Total length is ~3:30 (strictly under 240 seconds).
- [ ] **Sharing Link Set Correctly:** Uploaded to YouTube (Unlisted/Public) or Google Drive (**Set to "Anyone with the link can view"**).
- [ ] **Incognito Link Tested:** Opened the link in a fresh Incognito / Private browser tab without signing in to confirm it plays smoothly.
