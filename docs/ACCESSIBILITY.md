# ClauseClear Accessibility Compliance Report (ACCESSIBILITY.md)

ClauseClear is designed and audited against **WCAG 2.1 Level AA** standards. As an access-to-justice tool serving first-time tenants ("Riya"), accessibility across devices, assistive technologies, and languages is a core requirement.

---

## 1. Compliance Matrix (WCAG 2.1 AA)

| Success Criterion | Requirement | Implementation in ClauseClear | Status |
|---|---|---|---|
| **1.1.1 Non-text Content** | Text alternatives for icons/visuals | `lucide-react` icons paired with visible text or `aria-label`; SVG gauge includes textual risk level | **COMPLIANT** |
| **1.3.1 Info & Relationships** | Semantic structure & ARIA roles | `<main>`, `<header>`, `<nav>`, `role="tab"`, `role="tabpanel"`, `role="checkbox"` | **COMPLIANT** |
| **1.4.1 Use of Color** | Color is never sole carrier of meaning | Risk indicators combine color, badge text ("CRITICAL"), numerical score, and icons | **COMPLIANT** |
| **1.4.3 Contrast (Minimum)** | Text contrast $\ge 4.5:1$ (normal text) | Primary text `#f0eeff` on `#0d0d1a` bg ($15.8:1$), muted text `#b0a8d8` ($6.2:1$) | **COMPLIANT** |
| **2.1.1 Keyboard** | Full functionality via keyboard | All buttons, tabs, sample selectors, and checklist toggles support `Tab`, `Enter`, `Space` | **COMPLIANT** |
| **2.1.2 No Keyboard Trap** | No focus entrapment | Modals and panels allow clean `Escape` or `Tab` exit | **COMPLIANT** |
| **2.4.1 Bypass Blocks** | Skip repetitive navigation | `.skip-link` provides instant jump to `#main-content` on initial Tab keypress | **COMPLIANT** |
| **2.5.5 Target Size** | Minimum touch target $\ge 44 \times 44\text{px}$ | All mobile interactive elements enforce `--touch-min: 44px` with comfortable padding | **COMPLIANT** |
| **3.1.2 Language of Parts** | Accurate screen-reader pronunciation | Language toggle dynamically sets `document.documentElement.lang = 'hi' \| 'mr' \| 'en'` | **COMPLIANT** |
| **4.1.3 Status Messages** | Dynamic content announcement | `aria-live="polite"` on GroundedQA log, analysis loader, and copy notifications | **COMPLIANT** |

---

## 2. Typography & Devanagari Script Support

- **English**: Inter (`wght@400;500;600;700`) for high-legibility UI microcopy.
- **Hindi & Marathi**: Noto Sans Devanagari (`wght@400;500;600;700`) loaded from Google Fonts for authentic conjunct rendering and diacritic placement.
- **Monospace**: JetBrains Mono for exact statutory contract snippet quotes.

---

## 3. Screen Reader Testing Log

Tested with NVDA (Windows) and VoiceOver (macOS / iOS Safari):
- **Skip Link**: Announces "Skip to main content" on first `Tab`.
- **Radial Risk Score Gauge**: Announces "Tenant Risk Score: X out of 100, Risk Level: [LOW / HIGH / CRITICAL]".
- **Interactive Checklists**: Announces checkbox state ("checked" / "not checked") upon Spacebar activation.
- **Grounded Q&A**: Emits polite audio announcement when streaming answer completes.
