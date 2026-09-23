import React, { useId } from 'react';
import { Info, TrendingUp } from 'lucide-react';

interface RiskScoreWidgetProps {
  /** 0-100 tenant risk score */
  score: number;
  breakdown?: {
    criticalClauses: number;
    highClauses: number;
    missingClauses: number;
    depositMonths: number;
    lockInMonths: number;
  };
  groundingPercent?: number;
}

const getScoreColour = (s: number) =>
  s >= 70 ? '#dc2626' : s >= 40 ? '#ea580c' : '#059669';

const getScoreGradient = (s: number) =>
  s >= 70
    ? 'conic-gradient(from 0deg, #ef4444, #f97316, #ef4444)'
    : s >= 40
    ? 'conic-gradient(from 0deg, #f97316, #eab308, #f97316)'
    : 'conic-gradient(from 0deg, #10b981, #34d399, #10b981)';

const getScoreLabel = (s: number) =>
  s >= 70 ? 'High Risk' : s >= 40 ? 'Moderate Risk' : 'Low Risk';

/**
 * SVG radial gauge — light mode edition.
 * Risk communicated via colour, text label, AND numeric value (WCAG 1.4.1).
 */
export const RiskScoreWidget: React.FC<RiskScoreWidgetProps> = ({
  score,
  breakdown,
  groundingPercent,
}) => {
  const tooltipId = useId();
  const colour   = getScoreColour(score);
  const gradient = getScoreGradient(score);
  const label    = getScoreLabel(score);

  const R            = 38;
  const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * R;
  const offset        = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.35rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(255,255,255,0.75)',
        border: '1px solid rgba(139,92,246,0.14)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(139,92,246,0.08)',
        minWidth: 168,
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
      >
        Tenant Risk Score
      </span>

      {/* SVG Gauge */}
      <div style={{ position: 'relative', width: 108, height: 108 }}>
        {/* Glow ring behind */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: -6,
            borderRadius: '50%',
            background: score >= 70
              ? 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)'
              : score >= 40
              ? 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          }}
        />
        <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="rgba(139,92,246,0.1)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={colour}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
          />
        </svg>
        {/* Numeric score */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
          aria-label={`Risk score ${score} out of 100, ${label}`}
          role="img"
        >
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: colour, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
        </div>
      </div>

      <span
        style={{
          fontSize: '0.82rem', fontWeight: 700, color: colour,
          background: score >= 70
            ? 'rgba(239,68,68,0.08)'
            : score >= 40
            ? 'rgba(249,115,22,0.08)'
            : 'rgba(16,185,129,0.08)',
          padding: '0.2rem 0.7rem',
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${colour}30`,
        }}
      >
        {label}
      </span>

      {/* Breakdown details */}
      {breakdown && (
        <div style={{ width: '100%' }}>
          <details>
            <summary
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                userSelect: 'none',
                listStyle: 'none',
                padding: '0.2rem 0',
              }}
              aria-describedby={tooltipId}
            >
              <Info size={12} color="var(--accent-violet)" />
              How is this calculated?
            </summary>
            <div
              id={tooltipId}
              style={{
                marginTop: '0.5rem',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 0.9rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Score breakdown (0–100):
              </strong>
              <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>Critical clauses ×30: <b style={{ color: '#dc2626' }}>+{breakdown.criticalClauses * 30}</b></li>
                <li>High-risk clauses ×15: <b style={{ color: '#ea580c' }}>+{breakdown.highClauses * 15}</b></li>
                <li>Missing clauses ×5: <b style={{ color: '#a16207' }}>+{breakdown.missingClauses * 5}</b></li>
                <li>Deposit &gt;2 months: <b>+{breakdown.depositMonths > 2 ? (breakdown.depositMonths - 2) * 5 : 0}</b></li>
                <li>Lock-in &gt;6 months: <b>+{breakdown.lockInMonths > 6 ? (breakdown.lockInMonths - 6) * 2 : 0}</b></li>
              </ul>
              <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.67rem' }}>
                Score capped at 100. Deterministic rules engine runs first; Gemini handles interpretation.
              </p>
            </div>
          </details>
        </div>
      )}

      {/* Grounding Score */}
      {groundingPercent !== undefined && (
        <div className="grounding-bar" style={{ marginTop: '0.2rem', fontSize: '0.72rem' }}>
          <TrendingUp size={11} aria-hidden="true" />
          {groundingPercent}% grounded
        </div>
      )}
    </div>
  );
};
