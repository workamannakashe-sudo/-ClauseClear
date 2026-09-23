import React from 'react';
import { X, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

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
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(30,27,75,0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
          padding: '2rem',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(139,92,246,0.15), 0 8px 24px rgba(0,0,0,0.08)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'rgba(139,92,246,0.07)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '50%',
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          aria-label="Close legal modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'conic-gradient(from 210deg, #f9a8d4, #c4b5fd, #93c5fd, #f9a8d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(167,139,250,0.3)',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <Scale size={22} color="#fff" />
          </div>
          <div>
            <h2 id="legal-modal-title" style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>
              Legal Disclaimer & Tenant Resources
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Important information about ClauseClear's scope
            </p>
          </div>
        </div>

        {/* Warning box */}
        <div
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div>
              <h4 style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 700 }}>
                Not Legal Advice · No Attorney-Client Relationship
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                ClauseClear is an automated AI legal-literacy tool designed to help first-time tenants understand their residential rental agreements. It does <strong>not</strong> provide legal representation, legal advice, or attorney oversight. Tenancy regulations vary across jurisdictions and individual circumstances. Always consult a licensed advocate for binding guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem', fontWeight: 700 }}>
          🇮🇳 Free Tenant Legal Resources in India
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
          {[
            {
              name: 'District Legal Services Authority (DLSA)',
              tag: 'Free Legal Aid',
              desc: 'Every district in India has a DLSA providing free legal aid for tenancy disputes under the Legal Services Authorities Act.',
            },
            {
              name: 'National Legal Services Authority (NALSA)',
              tag: 'Government',
              desc: 'NALSA provides legal awareness programs and free aid for economically weaker tenants across India.',
            },
            {
              name: 'Rent Control Courts / Tribunals',
              tag: 'Statutory',
              desc: 'Disputes over rent, deposit refunds, and evictions are adjudicated under your state\'s Rent Control Act (e.g., Maharashtra Rent Control Act 1999).',
            },
          ].map((r) => (
            <li
              key={r.name}
              style={{
                background: 'rgba(255,255,255,0.8)',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{r.name}</strong>
                <span className="badge badge-standard">{r.tag}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                {r.desc}
              </p>
            </li>
          ))}
        </ul>

        {/* Grounding note */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem', color: '#059669',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          All ClauseClear answers are verbatim-grounded in your uploaded document. Zero persistent storage — your data is never saved.
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ minWidth: 180 }}>
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
