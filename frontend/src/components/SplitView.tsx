import React, { useRef, useEffect, useCallback } from 'react';
import { Clause } from '../types.js';

interface SplitViewProps {
  documentText: string;
  activeQuote: string | null;
  clauses: Clause[];
  onSelectClause: (clause: Clause) => void;
}

/**
 * Split view: left pane = full source text with active quote highlighted;
 * right pane = scrollable clause cards.
 * Clicking a clause card scrolls the left pane to highlight the source quote.
 * WCAG: ARIA live region announces highlight changes; keyboard accessible.
 */
export const SplitView: React.FC<SplitViewProps> = ({
  documentText,
  activeQuote,
  clauses,
  onSelectClause,
}) => {
  const sourceRef = useRef<HTMLDivElement>(null);
  const liveRef   = useRef<HTMLDivElement>(null);

  /** Highlight the active quote by scrolling to and marking it. */
  useEffect(() => {
    if (!activeQuote || !sourceRef.current) return;

    const container = sourceRef.current;
    const text = container.textContent || '';
    const idx = text.toLowerCase().indexOf(activeQuote.toLowerCase().slice(0, 60));

    if (idx >= 0 && liveRef.current) {
      liveRef.current.textContent = `Highlighted: "${activeQuote.slice(0, 80)}…"`;
    }
  }, [activeQuote]);

  /** Build highlighted HTML. Only applied when activeQuote changes. */
  const buildHighlightedHTML = useCallback(() => {
    if (!activeQuote || !documentText) return documentText;

    const needle = activeQuote.slice(0, 80);
    const escapedNeedle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return documentText.replace(
        new RegExp(`(${escapedNeedle})`, 'i'),
        '<mark class="source-highlight" id="active-highlight" tabindex="-1">$1</mark>',
      );
    } catch {
      return documentText;
    }
  }, [activeQuote, documentText]);

  /** After highlight HTML set, scroll mark into view */
  useEffect(() => {
    if (!activeQuote) return;
    const el = document.getElementById('active-highlight');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }, [activeQuote, buildHighlightedHTML]);

  const getRiskColour = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'var(--risk-critical-border)';
      case 'HIGH':     return 'var(--risk-high-border)';
      case 'MEDIUM':   return 'var(--risk-medium-border)';
      default:         return 'var(--risk-low-border)';
    }
  };

  return (
    <div className="split-view" aria-label="Split view: source document and clause analysis">
      {/* ARIA live region — announces what was highlighted */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only"
           style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }} />

      {/* Left: Source text pane */}
      <section aria-label="Source document text" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
          📄 Source Document
        </h3>
        <div
          ref={sourceRef}
          className="split-pane"
          tabIndex={0}
          aria-label="Source document text; scroll to see the highlighted clause"
          dangerouslySetInnerHTML={{ __html: buildHighlightedHTML() }}
        />
      </section>

      {/* Right: Clause cards pane */}
      <section aria-label="Clause analysis cards" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
          🔍 Clause Analysis (click to highlight source)
        </h3>
        <div className="split-pane" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.85rem', background: 'transparent', border: 'none' }}>
          {clauses.map((clause) => {
            const isActive = activeQuote === clause.originalSnippet;
            return (
              <button
                key={clause.id}
                onClick={() => onSelectClause(clause)}
                aria-pressed={isActive}
                aria-label={`${clause.title} — ${clause.riskLevel} risk. Click to highlight in source.`}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: isActive ? 'rgba(139,92,246,0.12)' : 'var(--bg-card)',
                  border: `1px solid ${isActive ? 'rgba(139,92,246,0.5)' : 'var(--border-color)'}`,
                  borderLeft: `4px solid ${getRiskColour(clause.riskLevel)}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{clause.title}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: getRiskColour(clause.riskLevel), textTransform: 'uppercase' }}>
                    {clause.riskLevel}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {clause.plainEnglish.slice(0, 100)}{clause.plainEnglish.length > 100 ? '…' : ''}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
