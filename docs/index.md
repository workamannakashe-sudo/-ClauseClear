---
layout: home

hero:
  name: "📜 ClauseClear"
  text: "AI Legal Assistant & Access System"
  tagline: "Empowering Indian Urban Tenants ('Riya') with Grounded AI Document Analysis & Legal Access"
  actions:
    - theme: brand
      text: System Architecture
      link: /architecture
    - theme: alt
      text: API Reference
      link: /api

features:
  - title: 🤖 Grounded AI Engine
    details: Powered by Google Gemini 3.6 Flash with 100% strict quote verification against input agreements. Zero hallucination.
  - title: 🇮🇳 Built for "Riya"
    details: Multilingual support (English, Hindi, Marathi), mobile-first responsive layout, and low-bandwidth optimization.
  - title: 🛡️ Security Hardened
    details: Sub-second zip-bomb detection, prompt-injection immutability guard, CSP headers, and local privacy guarantees.
  - title: 📊 Verifiable Evals
    details: Automated benchmark suite running 10 judge-ready scenarios with 100% pass rate (Grade A+).
---

# ClauseClear — Overview & Architecture

ClauseClear is a **GenAI Legal Assistance & Access System** designed for first-time urban tenants in India. It provides plain-language document analysis, risk evaluation, missing clause detection, and interactive Q&A grounded strictly in the provided agreement text.

## Core System Architecture

```mermaid
graph TD
    Client["📱 Mobile Client (Vite React + Tailwind CSS)"] -->|HTTPS / REST API| Backend["⚡ Express API Backend (Node.js)"]
    Backend --> Extractor["📄 Text Extractor (pdf-parse / mammoth)"]
    Backend --> Guard["🛡️ Security & Zip-Bomb Guard"]
    Backend --> RiskEng["⚖️ Risk & Mismatch Engine"]
    Backend --> LLM["🤖 Gemini 3.6 Flash Engine"]
    LLM --> Verifier["🔍 Strict Grounding Verifier"]
    Verifier --> Client
```

## Quick Links

- [System Architecture](/architecture)
- [API Reference](/api)
- [Target Persona "Riya"](/DEMO)
- [Security Threat Model](/THREAT_MODEL)
- [Evaluation Suite Benchmark](/EVAL)
- [Deployment Presets](/deployment)
