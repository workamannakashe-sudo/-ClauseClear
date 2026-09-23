# Deployment Presets & Web Service Configuration

ClauseClear is designed to be deployed effortlessly across modern web service platforms.

## 📦 Deployment Presets Summary

### 1. Node.js API Web Service (`backend`)
- **Runtime**: Node.js 20+
- **Entry point**: `backend/dist/server.js` (built via `npm run build:backend`)
- **Port**: `5000` (configurable via `PORT` env var)
- **Environment Variables**:
  - `GEMINI_API_KEY`: Google Gemini API Key
  - `MOCK_MODE`: `false` for live mode, `true` for offline demo mode
  - `PORT`: Server port (default 5000)

---

### 2. Vite React Frontend (`frontend`)
- **Framework**: Vite + React 18 + Tailwind CSS
- **Build Output**: `dist/`
- **Build Command**: `npm run build:frontend`
- **Routing**: Single Page Application rewrite rule (`/* -> /index.html`)

---

### 3. VitePress Documentation Site (`docs`)
- **Framework**: VitePress
- **Build Output**: `docs/.vitepress/dist`
- **Build Command**: `npm run docs:build`
- **Dev Server**: `npm run docs:dev`

---

## 🛠️ One-Click Platform Presets

### Render (`render.yaml`)
Deploy backend & frontend in a single click using Render Infrastructure as Code:
```bash
render blueprint launch
```

### Docker Compose (`docker-compose.yml`)
Run locally in isolated containers:
```bash
docker-compose up --build
```
