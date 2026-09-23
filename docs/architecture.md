# System Architecture & Application Presets

This document details the software architecture, component separation, and deployment presets of **ClauseClear**.

## 🏗️ Technical Stack & Preset Architecture

| Component | Framework / Tool | Deployment / Host Preset |
|---|---|---|
| **Frontend Application** | React 18, Vite, TypeScript | Static Web Service (`/dist`) |
| **Backend API Engine** | Node.js, Express, TypeScript | Node Web Service (`/api`, Port 5000) |
| **AI Orchestration** | Google Gemini 3.6 Flash REST API | Cloud LLM Service |
| **Documentation Site** | VitePress | VitePress Preset (`/docs`) |

---

## 🔌 API Endpoints (`/api`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check & engine status (mock vs live mode indicator). |
| `/api/samples` | `GET` | Retrieves pre-configured legal document samples for Riya. |
| `/api/parse` | `POST` | Parses `.pdf`, `.docx`, or `.txt` files into sanitized text. |
| `/api/analyze` | `POST` | Full analysis: risk score, clause breakdown, missing clauses, mismatch check. |
| `/api/qa` | `POST` | Grounded Q&A against source document with quote verification. |
| `/api/compare` | `POST` | Clause-by-clause comparison between Version A and Version B. |
| `/api/checklist` | `POST` | Generates a tenant action checklist and negotiation advice. |

---

## 🚀 Application Deployment Presets

### 1. Render (`render.yaml`)
Preset configuration for hosting Node.js backend web service alongside Vite static frontend on Render.

### 2. Vercel (`vercel.json`)
Preset configuration for Vercel Serverless Functions (`backend/src/server.ts`) and Vite static build (`/dist`).

### 3. Docker Compose (`docker-compose.yml`)
Containerized environment exposing backend API on port 5000 and Vite dev frontend on port 5173.
