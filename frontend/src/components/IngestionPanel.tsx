import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, AlertTriangle, CheckCircle,
  RefreshCw, ArrowRight, Sparkles, Zap
} from 'lucide-react';
import { DocumentMismatchResult, SampleDoc } from '../types.js';
import { Language, strings } from '../i18n.js';

interface IngestionPanelProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  samples: Record<string, SampleDoc>;
  mismatch?: DocumentMismatchResult | null;
  onLoadSample: (sampleKey: string) => void;
  language: Language;
  currentStep: number;
}

const ACCEPT_TYPES = '.txt,.pdf,.docx';
const MAX_BYTES = 5 * 1024 * 1024;

const SAMPLE_BUTTONS = [
  { key: 'standard',         label: '✦ Standard Lease',       danger: false, desc: 'Balanced Mumbai L&L' },
  { key: 'predatory',        label: '⚠ Aggressive Lease',     danger: true,  desc: 'Red-flag clauses' },
  { key: 'riya_inconsistent',label: '⇌ Inconsistent Dates',   danger: false, desc: 'Internal mismatches' },
  { key: 'riya_missing',     label: '⊘ Missing Clauses',      danger: false, desc: 'Absent protections' },
  { key: 'riya_hindi',       label: '🇮🇳 Hindi Agreement',     danger: false, desc: 'Devanagari sample' },
];

/**
 * Document upload / paste panel — step 1 of 3.
 * Light holographic redesign. Orb hero on empty state.
 */
export const IngestionPanel: React.FC<IngestionPanelProps> = ({
  documentText,
  setDocumentText,
  onAnalyze,
  isAnalyzing,
  samples,
  mismatch,
  onLoadSample,
  language,
  currentStep,
}) => {
  const [dragActive,   setDragActive]   = useState(false);
  const [uploadError,  setUploadError]  = useState<string | null>(null);
  const [isUploading,  setIsUploading]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = strings[language];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFile = async (file: File) => {
    setUploadError(null);
    if (file.size > MAX_BYTES) {
      setUploadError(`File exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please paste text directly.`);
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['txt', 'pdf', 'docx'].includes(ext)) {
      setUploadError('Only .txt, .pdf, and .docx files are supported.');
      return;
    }
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (ev) => setDocumentText(ev.target?.result as string);
      reader.readAsText(file);
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const { text } = await res.json();
      if (!text || text.length < 50) {
        setUploadError('Could not extract text from this file. It may be a scanned PDF. Please paste text directly.');
        return;
      }
      setDocumentText(text);
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please paste text directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const isEmpty = !documentText.trim();

  return (
    <section className="animate-fade-in" aria-labelledby="ingestion-heading">

      {/* ── Hero Orb (shown only on empty state) ── */}
      {isEmpty && (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem 1.5rem',
          }}
        >
          {/* Orb */}
          <div className="orb-container" style={{ width: 160, height: 160, margin: '0 auto 1.75rem' }}>
            <div className="orb-glow" />
            <div className="orb-core" />
            <div className="orb-shimmer" />
          </div>

          <h1
            id="ingestion-heading"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: '0.6rem',
              lineHeight: 1.15,
            }}
          >
            AI-Powered{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Lease Analysis
            </span>
            {' '}for Riya
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto 0.4rem' }}>
            Paste or upload your rental agreement. ClauseClear flags red-flag clauses, missing protections, and inconsistencies — in plain English.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
            EN · हिन्दी · मराठी &nbsp;|&nbsp; Mobile-first &nbsp;|&nbsp; Zero storage
          </p>
        </div>
      )}

      {!isEmpty && (
        <h2 id="ingestion-heading" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Document Ready
        </h2>
      )}

      {/* ── Sample Buttons ── */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.6rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Try a sample
        </p>
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(12px)',
            width: 'fit-content',
            maxWidth: '100%',
          }}
          role="group"
          aria-label="Load a sample lease document"
        >
          {SAMPLE_BUTTONS.map(({ key, label, danger, desc }) => (
            <button
              key={key}
              onClick={() => onLoadSample(key)}
              disabled={isAnalyzing}
              className="btn"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.9rem',
                minHeight: 36,
                background: danger
                  ? 'rgba(239,68,68,0.07)'
                  : 'rgba(139,92,246,0.07)',
                color: danger ? 'var(--risk-critical-text)' : 'var(--accent-violet)',
                border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.2)'}`,
                borderRadius: 'var(--radius-full)',
              }}
              title={desc}
              aria-label={`Load sample: ${label} — ${desc}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Drop zone ── */}
      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop your lease document here, or click to browse. Accepts PDF, DOCX, or TXT up to 5 MB."
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        style={{ padding: '1.75rem 1.5rem', cursor: 'pointer', textAlign: 'center', marginBottom: '0.75rem' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_TYPES}
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(139,92,246,0.2)',
            }}
            aria-hidden="true"
          >
            {isUploading
              ? <RefreshCw size={22} color="var(--accent-violet)" style={{ animation: 'spin 1s linear infinite' }} />
              : <Upload size={22} color="var(--accent-violet)" />
            }
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isUploading ? 'Extracting text…' : 'Drop PDF / DOCX / TXT here'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            or click to browse &nbsp;·&nbsp; max 5 MB
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {uploadError && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            background: 'var(--risk-critical-bg)',
            border: '1px solid var(--risk-critical-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.84rem',
            color: 'var(--risk-critical-text)',
            marginBottom: '0.75rem',
          }}
        >
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ── Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        or paste text below
        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
      </div>

      {/* ── Textarea ── */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder={t.pastePlaceholder ?? 'Paste your rental agreement text here…'}
          rows={documentText ? 10 : 6}
          lang={language}
          style={{
            width: '100%', padding: '1rem 1.1rem',
            resize: 'vertical', lineHeight: 1.65,
            fontFamily: documentText ? 'JetBrains Mono, monospace' : 'inherit',
            fontSize: '0.875rem',
            background: 'rgba(255,255,255,0.8)',
          }}
          aria-label="Lease agreement text"
          aria-describedby="paste-hint"
        />
        {documentText && (
          <div
            id="paste-hint"
            style={{
              position: 'absolute', bottom: '0.6rem', right: '0.8rem',
              fontSize: '0.7rem', color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.85)',
              padding: '0.15rem 0.45rem', borderRadius: 4,
              pointerEvents: 'none',
            }}
          >
            {documentText.length.toLocaleString()} chars
          </div>
        )}
      </div>

      {/* ── Mismatch warning ── */}
      {mismatch && !mismatch.isResidentialLease && (
        <div
          role="alert"
          style={{
            marginTop: '0.75rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            background: 'var(--risk-high-bg)',
            border: '1px solid var(--risk-high-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.84rem', color: 'var(--risk-high-text)',
          }}
        >
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Document type check:</strong>{' '}
            {mismatch.message ?? 'This may not be a residential lease agreement.'}
          </div>
        </div>
      )}

      {/* ── Analyze CTA ── */}
      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onAnalyze}
          disabled={!documentText.trim() || isAnalyzing}
          className="btn btn-primary"
          style={{ fontSize: '0.9rem', padding: '0 2rem', minHeight: 48, gap: '0.5rem' }}
          aria-busy={isAnalyzing}
          id="analyze-button"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={16} aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing…
            </>
          ) : (
            <>
              <Zap size={16} aria-hidden="true" />
              {t.analyzeButton ?? 'Analyze Lease Terms'}
              <ArrowRight size={15} aria-hidden="true" />
            </>
          )}
        </button>

        {documentText && !isAnalyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={14} color="var(--risk-low-text)" aria-hidden="true" />
            Document ready — {documentText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
          </div>
        )}

        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {t.notLegalAdvice}
        </p>
      </div>

      {/* spin keyframe via inline style tag */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
};
