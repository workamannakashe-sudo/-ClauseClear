import React from 'react';
import { AlertTriangle, Scale, ExternalLink, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types.js';

interface LegalBannerProps {
  currentRiskLevel?: RiskLevel | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  onOpenLegalModal: () => void;
}

export const LegalBanner: React.FC<LegalBannerProps> = ({ currentRiskLevel, onOpenLegalModal }) => {
  const isHighRisk = currentRiskLevel === 'CRITICAL' || currentRiskLevel === 'HIGH';

  return (
    <div
      role="region"
      aria-label="Legal Disclaimer and Risk Advisory"
      style={{
        background: isHighRisk
          ? 'linear-gradient(90deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))'
          : 'rgba(139,92,246,0.04)',
        borderBottom: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.1)'}`,
        padding: '0.55rem 0',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '0.75rem', fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
          {isHighRisk ? (
            <ShieldAlert size={16} color="var(--risk-critical-text)" style={{ flexShrink: 0 }} aria-hidden="true" />
          ) : (
            <Scale size={16} color="var(--accent-violet)" style={{ flexShrink: 0 }} aria-hidden="true" />
          )}
          <p style={{ color: isHighRisk ? 'var(--risk-critical-text)' : 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {isHighRisk ? (
              <strong>
                CRITICAL ADVISORY: High-risk terms detected. ClauseClear provides legal education only — not formal legal representation. Consult a tenant attorney or legal aid clinic.
              </strong>
            ) : (
              <span>
                <strong>Informational only.</strong> ClauseClear assists with clause simplification and risk awareness. Not legal advice or attorney-client relationship.
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onOpenLegalModal}
          style={{
            background: 'none', border: 'none',
            color: isHighRisk ? 'var(--risk-critical-text)' : 'var(--accent-violet)',
            fontWeight: 600, fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            minHeight: 32,
          }}
          aria-label="Find Tenant Legal Aid — opens legal disclaimer"
        >
          Find Tenant Legal Aid
          <ExternalLink size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
