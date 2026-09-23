import React from 'react';
import { Language } from '../i18n.js';

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGS: { code: Language; label: string; full: string }[] = [
  { code: 'en', label: 'EN',  full: 'English' },
  { code: 'hi', label: 'हिं', full: 'हिंदी' },
  { code: 'mr', label: 'मर',  full: 'मराठी' },
];

/**
 * Three-way language toggle (EN / Hindi / Marathi).
 * Updates document.documentElement.lang so screen readers
 * announce the correct language for each content block.
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onChange }) => {
  const handleChange = (lang: Language) => {
    document.documentElement.lang = lang;
    onChange(lang);
  };

  return (
    <div
      role="group"
      aria-label="Select language / भाषा चुनें / भाषा निवडा"
      style={{
        display: 'flex',
        gap: '0.2rem',
        padding: '0.25rem',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-full)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {LANGS.map(({ code, label, full }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          aria-pressed={language === code}
          aria-label={full}
          style={{
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: language === code
              ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
              : 'transparent',
            color: language === code ? '#fff' : 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: language === code ? 700 : 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minHeight: 30,
            minWidth: 34,
            boxShadow: language === code ? '0 2px 8px rgba(139,92,246,0.3)' : 'none',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
