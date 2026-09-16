import React from 'react';
import { Shield, Info, Sparkles, Scale } from 'lucide-react';

interface HeaderProps {
  isMockMode: boolean;
  onOpenLegalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMockMode, onOpenLegalModal }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.25rem'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
                LeaseGuard <span style={{ color: 'var(--accent-blue)' }}>AI</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                TENANT ADVOCACY
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Legal Intelligence & Risk Defense for Renters
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mode Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 500,
            background: isMockMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${isMockMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            color: isMockMode ? '#34d399' : '#60a5fa'
          }}>
            {isMockMode ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>Offline Evaluation Mode</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Live Gemini Engine</span>
              </>
            )}
          </div>

          {/* Legal Disclaimer Button */}
          <button
            onClick={onOpenLegalModal}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            aria-label="View Legal Disclaimer and Tenant Advocacy Resources"
          >
            <Scale size={15} />
            <span>Legal Notice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
