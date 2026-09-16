import React, { useState } from 'react';
import { GitCompare, ArrowRight, AlertTriangle, TrendingUp, DollarSign, ShieldAlert, CheckCircle } from 'lucide-react';
import { LeaseComparisonResult, SampleDoc } from '../types.js';

interface ComparisonViewProps {
  samples: Record<string, SampleDoc>;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ samples }) => {
  const [versionA, setVersionA] = useState<string>('');
  const [versionB, setVersionB] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [result, setResult] = useState<LeaseComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSampleComparison = () => {
    if (samples.standard && samples.renewal) {
      setVersionA(samples.standard.content);
      setVersionB(samples.renewal.content);
    }
  };

  const handleCompare = async () => {
    if (!versionA.trim() || !versionB.trim()) {
      setError('Please provide text for both Version A and Version B.');
      return;
    }

    setError(null);
    setIsComparing(true);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionA, versionB })
      });

      if (!res.ok) {
        throw new Error(`Comparison failed with status: ${res.status}`);
      }

      const data: LeaseComparisonResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Comparison request failed.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Comparison Ingestion Box */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <GitCompare size={20} color="var(--accent-blue)" />
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                Substantive Lease Version Comparison
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Compare original vs. renewal agreement to detect stealth fee increases, shifted repair obligations, and reduced tenant protections.
            </p>
          </div>

          <button
            onClick={loadSampleComparison}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            Load Sample: Original vs. Renewal Amendment
          </button>
        </div>

        {/* 2-Column Input Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label htmlFor="version-a" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Version A (Original Lease / Current Terms)
            </label>
            <textarea
              id="version-a"
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              placeholder="Paste original lease clauses here..."
              style={{
                width: '100%',
                height: '180px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '0.85rem',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label htmlFor="version-b" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Version B (Proposed Renewal / Amendment Addendum)
            </label>
            <textarea
              id="version-b"
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              placeholder="Paste renewal terms or proposed lease changes here..."
              style={{
                width: '100%',
                height: '180px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '0.85rem',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button
            onClick={handleCompare}
            disabled={isComparing || !versionA.trim() || !versionB.trim()}
            className="btn btn-primary"
            style={{ minWidth: '200px' }}
          >
            {isComparing ? 'Evaluating Substantive Changes...' : 'Run Substantive Diff'}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive Summary Card */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-high" style={{ marginBottom: '0.5rem' }}>
                  {result.summary.favourabilityShift.replace(/_/g, ' ')}
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem' }}>
                  {result.summary.headline}
                </h3>
              </div>
            </div>

            {/* Financial Changes Cards */}
            {result.summary.keyFinancialChanges.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Key Financial Impact & New Charges
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {result.summary.keyFinancialChanges.map((fin, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        {fin.metric}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {fin.before}
                        </span>
                        <ArrowRight size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                          {fin.after}
                        </span>
                      </div>
                      {fin.percentChange && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: fin.percentChange.includes('+') ? '#fca5a5' : '#86efac'
                        }}>
                          {fin.percentChange}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clause Difference Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Substantive Clause Modifications</h3>
            {result.differences.map((diff, index) => (
              <div
                key={index}
                className="glass-panel"
                style={{
                  padding: '1.35rem',
                  borderLeft: `4px solid ${
                    diff.severity === 'HIGH' || diff.severity === 'CRITICAL'
                      ? 'var(--risk-high-border)'
                      : 'var(--risk-medium-border)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: diff.changeType === 'ADDED' ? '#38bdf8' : '#eab308',
                      marginRight: '0.5rem'
                    }}>
                      [{diff.changeType}]
                    </span>
                    <strong style={{ fontSize: '1.05rem' }}>{diff.clauseTitle}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span className={`badge ${diff.impactOnTenant === 'NEGATIVE' ? 'badge-high' : 'badge-standard'}`}>
                      {diff.impactOnTenant} IMPACT
                    </span>
                  </div>
                </div>

                {/* Side by side snippet comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', margin: '0.75rem 0' }}>
                  {diff.versionA_Snippet && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                        ORIGINAL LEASE LANGUAGE
                      </span>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>
                        "{diff.versionA_Snippet}"
                      </p>
                    </div>
                  )}

                  {diff.versionB_Snippet && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.06)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                        AMENDED / PROPOSED LANGUAGE
                      </span>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>
                        "{diff.versionB_Snippet}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Plain English Analysis */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0' }}>
                  {diff.plainLanguageAnalysis}
                </p>

                {/* Action Recommendation */}
                <div style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.8rem',
                  color: '#fef3c7',
                  marginTop: '0.5rem'
                }}>
                  <strong>Tenant Counter-Strategy:</strong> {diff.actionRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
