import React from 'react';
import { X, Scale, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
          aria-label="Close legal modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent-blue)'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <h2 id="legal-modal-title" style={{ fontSize: '1.35rem', margin: 0 }}>
              Legal Disclaimer & Tenant Resources
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Important information regarding your rights and representation
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Not Legal Advice / No Attorney-Client Relationship
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                LeaseGuard AI is an automated generative AI legal education system designed to illuminate standard residential tenancy provisions. It does not provide legal representation, legal advice, or attorney oversight. Tenancy regulations vary significantly across municipal jurisdictions, state statutes, and rent stabilization ordinances.
              </p>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
          Free & Low-Cost Tenant Legal Resources
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <li style={{ background: 'var(--bg-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Legal Services Corporation (LSC)</strong>
              <span className="badge badge-standard">Free Legal Aid</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Federal non-profit providing civil legal assistance to low-income Americans facing eviction or housing disputes.
            </p>
          </li>
          <li style={{ background: 'var(--bg-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>HUD Tenant Rights by State</strong>
              <span className="badge badge-standard">Government</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Directory of state-specific laws governing security deposits, repairs, notice of entry, and tenant remedies.
            </p>
          </li>
          <li style={{ background: 'var(--bg-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>National Low Income Housing Coalition (NLIHC)</strong>
              <span className="badge badge-standard">Advocacy</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Renter protection databases and local tenant union directory.
            </p>
          </li>
        </ul>

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
