# LeaseGuard AI — System Architecture & Decision Flow

## Overview
LeaseGuard AI is an intelligent legal assistant for residential tenants. It bridges the gap between dense legal language in tenancy agreements and actionable tenant self-defense through deterministic rule engines coupled with grounded LLM reasoning.

## Decision Architecture Flow

```
+-------------------------------------------------------------+
|                      User Ingestion                         |
|   (Paste Text or Upload PDF / DOCX / TXT / 1-Click Samples) |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               Parser & Security Sanitizer                   |
|   (MIME verification, 5MB ceiling, script stripping)        |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Document Mismatch Detector (Engine)              |
| - Checks for residential lease markers vs non-lease text   |
| - If mismatch: triggers friendly guided alert without error |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Section Chunker & Complexity Analyzer            |
| - Evaluates doc length & legal density                      |
| - Adapts tone (simplified vs deep-dive)                     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|              LLM / Offline Mock Engine                      |
| - Grounded by modular versioned prompt templates in /prompts|
| - Extracts structured JSON schema                           |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Deterministic Risk Escalation Engine             |
| - Scores clauses: CRITICAL / HIGH / MEDIUM / STANDARD       |
| - Flags habitability waivers, unannounced entry, forfeiture |
| - Prioritizes actionable checklist items                    |
+------------------------------+------------------------------+
                               |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
+---------------+      +---------------+      +---------------+
| Clause Review |      | Substantive   |      | Grounded Q&A  |
| & Highlights  |      | Diff Engine   |      | & Citations   |
+---------------+      +---------------+      +---------------+
        |                      |                      |
        +----------------------+----------------------+
                               |
                               v
+-------------------------------------------------------------+
|        Actionable Checklist & Letter Generator              |
| - Pre-move inspection items                                 |
| - Clarification questions for landlord                      |
| - Ready-to-copy negotiation draft                           |
+-------------------------------------------------------------+
```

## Grounding & Refusal Guarantee
To prevent hallucinations, the Q&A engine implements a strict 2-step verification:
1. The question is searched against extracted lease sections and verified for thematic presence.
2. If absent, the system explicitly returns `isAddressedInDocument: false` with guidance on state statutory baselines, refusing to invent fictitious lease terms.
