import React from 'react';
import { Scale, ShieldAlert, Sparkles } from 'lucide-react';
import { Language, strings } from '../i18n.js';

interface HeaderProps {
  isMockMode: boolean;
  language: Language;
  onOpenLegalModal: () => void;
}

/**
 * ClauseClear application header — light frosted glass edition.
 * Provides a skip-link target, semantic <header> landmark,
 * branding, demo/live mode badge, and legal notice link.
 */
export const Header: React.FC<HeaderProps> = ({ isMockMode, language, onOpenLegalModal }) => {
  const t = strings[language];

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(139,92,246,0.1)',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 24px rgba(139,92,246,0.06)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Orb-inspired logo */}
          <div
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: 'conic-gradient(from 210deg, #f9a8d4, #c4b5fd, #93c5fd, #f9a8d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(167,139,250,0.45), inset 0 2px 4px rgba(255,255,255,0.6)',
              position: 'relative',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <div style={{
              position: 'absolute', inset: '20%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), transparent 65%)',
            }} />
            <Scale size={18} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ClauseClear
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                display: 'block',
                letterSpacing: '0.06em',
                marginTop: -1,
                fontWeight: 500,
              }}
            >
              RENTAL AGREEMENT ASSISTANT
            </span>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Mode badge */}
          <span
            className={isMockMode ? 'badge badge-demo' : 'badge badge-live'}
            title={isMockMode
              ? 'Demo Mode — pre-computed responses, no API key required'
              : 'Live Mode — powered by Google Gemini AI'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {isMockMode ? (
              <><Sparkles size={11} aria-hidden="true" /> {t.demoMode}</>
            ) : (
              <><span aria-hidden="true">✦</span> {t.liveMode}</>
            )}
          </span>

          {/* Legal notice */}
          <button
            onClick={onOpenLegalModal}
            className="btn btn-ghost"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', minHeight: 36, gap: '0.3rem' }}
            aria-label="Open legal notice and disclaimer"
          >
            <ShieldAlert size={14} aria-hidden="true" />
            <span className="no-print">Legal Notice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
