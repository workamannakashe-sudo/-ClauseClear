import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  Flame,
  UserCheck,
  Building,
  HelpCircle
} from 'lucide-react';
import { LeaseAnalysisResult, Clause, RiskLevel } from '../types.js';

interface ClauseReviewProps {
  analysis: LeaseAnalysisResult;
}

export const ClauseReview: React.FC<ClauseReviewProps> = ({ analysis }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!analysis.summary) return null;

  const { summary, clauses } = analysis;

  const filteredClauses = clauses.filter((c) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'risk' && (c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH')) ||
      (activeCategory === 'unusual' && c.isUnusual) ||
      (activeCategory === 'tenant' && c.category === 'tenant_obligation') ||
      (activeCategory === 'landlord' && c.category === 'landlord_obligation');

    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plainEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.originalSnippet.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="badge badge-critical">
            <Flame size={12} /> Critical Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge badge-high">
            <ShieldAlert size={12} /> High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="badge badge-medium">
            <AlertTriangle size={12} /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="badge badge-standard">
            <CheckCircle size={12} /> Standard Term
          </span>
        );
    }
  };

  const criticalCount = clauses.filter((c) => c.riskLevel === 'CRITICAL').length;
  const highCount = clauses.filter((c) => c.riskLevel === 'HIGH').length;
  const unusualCount = clauses.filter((c) => c.isUnusual).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Executive Summary Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Executive Assessment
              </span>
              <span className={`badge ${summary.riskLevel === 'CRITICAL' ? 'badge-critical' : summary.riskLevel === 'HIGH' ? 'badge-high' : 'badge-standard'}`}>
                {summary.riskLevel} RISK LEASE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Complexity: {summary.complexityLevel}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', lineHeight: 1.35, marginBottom: '0.75rem' }}>
              {summary.headline}
            </h2>
            {summary.criticalNotice && (
              <p style={{
                fontSize: '0.86rem',
                color: summary.riskLevel === 'CRITICAL' ? '#fca5a5' : '#cbd5e1',
                lineHeight: 1.5,
                background: summary.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${summary.riskLevel === 'CRITICAL' ? '#ef4444' : 'var(--accent-blue)'}`
              }}>
                {summary.criticalNotice}
              </p>
            )}
          </div>

          {/* Risk Score Radial Widget */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)',
            minWidth: '150px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Tenant Risk Score
            </span>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: summary.overallRiskScore >= 70 ? '#ef4444' : summary.overallRiskScore >= 40 ? '#f59e0b' : '#10b981'
            }}>
              {summary.overallRiskScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {summary.overallRiskScore >= 70 ? 'Severely Predatory' : summary.overallRiskScore >= 40 ? 'Moderate Caution' : 'Fair & Customary'}
            </span>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Rent</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{summary.keyDetails.rentAmount || 'Not specified'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Security Deposit</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{summary.keyDetails.securityDeposit || 'Not specified'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lease Term</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{summary.keyDetails.leaseTerm || 'Not specified'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Late Fee Terms</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{summary.keyDetails.lateFee || 'Standard'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Notice Window</span>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {summary.keyDetails.noticePeriodDays ? `${summary.keyDetails.noticePeriodDays} Days` : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            All Clauses ({clauses.length})
          </button>
          <button
            onClick={() => setActiveCategory('risk')}
            className={`btn ${activeCategory === 'risk' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.9rem',
              borderColor: criticalCount + highCount > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined
            }}
          >
            <ShieldAlert size={14} />
            Risk Flags ({criticalCount + highCount})
          </button>
          <button
            onClick={() => setActiveCategory('unusual')}
            className={`btn ${activeCategory === 'unusual' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <Flame size={14} />
            Unusual ({unusualCount})
          </button>
          <button
            onClick={() => setActiveCategory('tenant')}
            className={`btn ${activeCategory === 'tenant' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <UserCheck size={14} />
            Your Obligations
          </button>
          <button
            onClick={() => setActiveCategory('landlord')}
            className={`btn ${activeCategory === 'landlord' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            <Building size={14} />
            Landlord Duties
          </button>
        </div>

        {/* Clause search input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter clauses by keyword..."
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '0.45rem 0.85rem',
            fontSize: '0.85rem',
            minWidth: '220px',
            outline: 'none'
          }}
        />
      </div>

      {/* Clause Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredClauses.map((clause) => (
          <article
            key={clause.id}
            className="glass-panel"
            style={{
              padding: '1.35rem',
              borderLeft: `4px solid ${
                clause.riskLevel === 'CRITICAL'
                  ? 'var(--risk-critical-border)'
                  : clause.riskLevel === 'HIGH'
                  ? 'var(--risk-high-border)'
                  : clause.riskLevel === 'MEDIUM'
                  ? 'var(--risk-medium-border)'
                  : 'var(--risk-standard-border)'
              }`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{clause.title}</h3>
                {clause.isUnusual && (
                  <span className="badge badge-high" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                    Unusual vs. Standard Lease
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {getRiskBadge(clause.riskLevel)}
              </div>
            </div>

            {/* Original Snippet */}
            <div className="quote-snippet">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                Original Clause Text
              </span>
              "{clause.originalSnippet}"
            </div>

            {/* Plain English Translation & Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.25rem' }}>
                  In Plain English
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                  {clause.plainEnglish}
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'block', marginBottom: '0.25rem' }}>
                  Why This Matters for You
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {clause.whyItMatters}
                </p>
              </div>
            </div>

            {/* Practical Recommendation */}
            <div style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={15} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Action Advice:</strong> {clause.recommendation}
              </span>
            </div>
          </article>
        ))}

        {filteredClauses.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No clauses found matching your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
