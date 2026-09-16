# Security & Privacy Policy — LeaseGuard AI

LeaseGuard AI is designed with strict security, confidentiality, and data privacy principles tailored for legal document evaluation.

## 1. Zero Client-Side Secret Leakage
- API keys (Google Gemini, OpenAI) are strictly managed via server-side environment variables (`.env`) and backend runtime processes.
- No secrets, tokens, or credential keys are bundled into frontend client assets or exposed via network responses.

## 2. In-Memory Processing & Ephemeral Sessions
- User documents, extracted text, and generated analyses are processed strictly **in-memory** during active sessions.
- No personal identifiable information (PII), names, rental addresses, or lease agreements are permanently stored, written to disk databases, or logged to third-party tracking services.
- Sessions automatically reset upon page refresh or explicit document removal.

## 3. Input Sanitization & File Upload Safety
- File uploads are constrained strictly to verified MIME types: plain text (`.txt`), Adobe PDF (`.pdf`), and Microsoft Word (`.docx`).
- Maximum file upload size is strictly capped at 5MB to prevent memory exhaustion / denial of service.
- Executable files, shell scripts, and HTML/SVG payloads with embedded scripts are rejected at the parsing boundary.
- User input rendered into the DOM is treated as text or strictly sanitized to eliminate cross-site scripting (XSS) vectors.

## 4. Rate Limiting & DoS Protection
- Backend endpoints feature rate-limiting middleware (`express-rate-limit` style windowing) to prevent abuse and runaway API consumption.
- Maximum payload and character ceilings prevent token ballooning.

## 5. Offline Mock Fallback Mode
- Evaluators can review the platform completely offline with zero API keys or external network connectivity by setting `MOCK_MODE=true` (or leaving API keys empty).
- Guarantees 100% testability without risking credential leaks.

## 6. Responsible Legal Disclaimer
- LeaseGuard AI provides legal informational analysis and education. It does not establish an attorney-client relationship. Critical lease disputes always trigger explicit advisories to consult tenant advocacy groups, legal aid, or licensed attorneys.
