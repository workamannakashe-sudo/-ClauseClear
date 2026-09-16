import React from 'react';
import { AlertTriangle, ShieldAlert, Scale, ExternalLink } from 'lucide-react';
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
          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))'
          : 'rgba(30, 41, 59, 0.45)',
        borderBottom: `1px solid ${isHighRisk ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`,
        padding: '0.65rem 0',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
          {isHighRisk ? (
            <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          ) : (
            <Scale size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
          )}
          <p style={{ color: isHighRisk ? '#fca5a5' : 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {isHighRisk ? (
              <strong>
                CRITICAL TENANT ADVISORY: High-risk or potentially unenforceable terms detected in this agreement. LeaseGuard AI provides legal education, NOT formal legal representation. Consultation with a tenant attorney or local legal aid clinic is strongly recommended.
              </strong>
            ) : (
              <span>
                <strong>INFORMATIONAL LEGAL INTELLIGENCE:</strong> LeaseGuard AI assists tenants with clause simplification and risk awareness. It does not constitute binding legal counsel or an attorney-client relationship.
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onOpenLegalModal}
          style={{
            background: 'transparent',
            border: 'none',
            color: isHighRisk ? '#f87171' : 'var(--accent-blue)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '4px'
          }}
        >
          <span>Find Tenant Legal Aid</span>
          <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
};
