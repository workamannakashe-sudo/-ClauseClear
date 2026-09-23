import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { LeaseAnalysisResult } from '../types.js';
import { RiskScoreWidget } from './RiskScoreWidget.js';
import { Language, strings } from '../i18n.js';

interface OverviewPanelProps {
  analysis: LeaseAnalysisResult;
  language: Language;
  onGoToClauses: () => void;
}

const SKELETON_LINES = [80, 60, 90, 50, 70];

const SkeletonLine: React.FC<{ width: number }> = ({ width }) => (
  <div
    className="skeleton"
    style={{ height: 14, width: `${width}%`, borderRadius: 6, marginBottom: 10 }}
    aria-hidden="true"
  />
);

/**
 * 60-second overview: Grade-8 summary, 5 things to know, Risk Score + Grounding Score.
 * Light holographic redesign.
 */
export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  analysis,
  language,
  onGoToClauses,
}) => {
  const t = strings[language];

  if (!analysis.summary) {
    return (
      <div
        className="glass-panel"
        style={{ padding: '1.75rem' }}
        aria-busy="true"
        aria-label="Loading overview"
      >
        <div style={{ marginBottom: '1rem' }}>
          <SkeletonLine width={40} />
          <SkeletonLine width={80} />
          <SkeletonLine width={65} />
        </div>
        {SKELETON_LINES.map((w, i) => <SkeletonLine key={i} width={w} />)}
      </div>
    );
  }

  const { summary, clauses, groundingScore, missingClauses, inconsistencies } = analysis;

  /* 5 things to know */
  const fiveThings: string[] = [
    ...(clauses ?? [])
      .filter((c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH')
      .slice(0, 3)
      .map((c) => c.plainEnglish),
    ...(missingClauses ?? []).slice(0, 2).map((m) => `Missing protection: ${m}`),
  ].slice(0, 5);

  const criticalCount = (clauses ?? []).filter((c) => c.riskLevel === 'CRITICAL').length;
  const highCount     = (clauses ?? []).filter((c) => c.riskLevel === 'HIGH').length;
  const missingCount  = (missingClauses ?? []).length;

  const riskColor =
    summary.riskLevel === 'CRITICAL' ? 'var(--risk-critical-text)' :
    summary.riskLevel === 'HIGH'     ? 'var(--risk-high-text)'     :
    summary.riskLevel === 'MEDIUM'   ? 'var(--risk-medium-text)'   :
    'var(--risk-low-text)';

  return (
    <section className="animate-fade-in" aria-labelledby="overview-heading">

      {/* ── Summary hero ── */}
      <div
        className="glass-panel"
        style={{ padding: '2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative orb blob */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 220, height: 220,
            background: 'conic-gradient(from 210deg, rgba(249,168,212,0.25), rgba(196,181,253,0.3), rgba(147,197,253,0.2), rgba(249,168,212,0.25))',
            borderRadius: '50%',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          {/* Left: text */}
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'conic-gradient(from 210deg, #f9a8d4, #c4b5fd, #93c5fd, #f9a8d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(167,139,250,0.3)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <ShieldCheck size={18} color="#fff" />
              </div>
              <h2
                id="overview-heading"
                style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}
              >
                {summary.headline}
              </h2>
            </div>

            <p
              lang={language}
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '1.25rem',
                maxWidth: 580,
              }}
            >
              {summary.criticalNotice ?? summary.headline}
            </p>

            {/* Financial strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {[
                { label: 'Monthly Rent',     value: summary.keyDetails.rentAmount },
                { label: 'Security Deposit', value: summary.keyDetails.securityDeposit },
                { label: 'Lease Term',       value: summary.keyDetails.leaseTerm },
                { label: 'Notice Period',    value: summary.keyDetails.noticePeriodDays ? `${summary.keyDetails.noticePeriodDays} days` : null },
                { label: 'Late Fee',         value: summary.keyDetails.lateFee },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '0.5rem 0.75rem', background: 'rgba(139,92,246,0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {label}
                  </span>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: value ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: 2 }}>
                    {value ?? 'Not specified'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Risk Score widget */}
          <RiskScoreWidget
            score={summary.overallRiskScore}
            breakdown={{
              criticalClauses: criticalCount,
              highClauses: highCount,
              missingClauses: missingCount,
              depositMonths: summary.depositMonths ?? 0,
              lockInMonths: summary.lockInMonths ?? 0,
            }}
            groundingPercent={groundingScore}
          />
        </div>
      </div>

      {/* ── 5 Things to Know ── */}
      {fiveThings.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
              aria-hidden="true"
            >
              <Info size={15} color="var(--accent-violet)" />
            </div>
            5 things to know before you sign
          </h3>
          <ol
            style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}
            aria-label="Five key things to know about this agreement"
          >
            {fiveThings.map((thing, i) => (
              <li
                key={i}
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  padding: '0.5rem 0.75rem',
                  background: i === 0 ? 'rgba(139,92,246,0.04)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: i === 0 ? '3px solid var(--accent-lavender)' : 'none',
                }}
              >
                {thing}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Issues Detected ── */}
      {(missingCount > 0 || (inconsistencies ?? []).length > 0) && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            borderLeft: '4px solid var(--risk-high-border)',
          }}
          role="alert"
          aria-label="Detected issues"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <AlertTriangle size={18} color="var(--risk-high-text)" aria-hidden="true" />
            <h3 style={{ fontSize: '0.95rem', color: 'var(--risk-high-text)', margin: 0, fontWeight: 700 }}>
              Issues Detected
            </h3>
          </div>
          {missingCount > 0 && (
            <div style={{ marginBottom: '0.85rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Missing Clauses ({missingCount}):
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {(missingClauses ?? []).map((m, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: 'var(--risk-high-text)' }}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {(inconsistencies ?? []).length > 0 && (
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Internal Inconsistencies:
              </p>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {(inconsistencies ?? []).map((inc, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: 'var(--risk-medium-text)' }}>{inc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── CTA ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onGoToClauses} className="btn btn-primary" style={{ gap: '0.45rem' }}>
          <CheckCircle2 size={16} aria-hidden="true" />
          Explore all {(clauses ?? []).length} clauses
        </button>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {t.notLegalAdvice}
        </p>
      </div>
    </section>
  );
};
