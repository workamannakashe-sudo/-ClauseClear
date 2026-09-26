import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { LegalBanner } from './components/LegalBanner.js';
import { LegalModal } from './components/LegalModal.js';
import { IngestionPanel } from './components/IngestionPanel.js';
import { OverviewPanel } from './components/OverviewPanel.js';
import { ClauseReview } from './components/ClauseReview.js';
import { ComparisonView } from './components/ComparisonView.js';
import { GroundedQA } from './components/GroundedQA.js';
import { ChecklistView } from './components/ChecklistView.js';
import { LanguageToggle } from './components/LanguageToggle.js';
import { LeaseAnalysisResult, SampleDoc } from './types.js';
import { Language, strings } from './i18n.js';
import {
  FileText, ShieldAlert, GitCompare,
  MessageSquare, CheckSquare, LayoutDashboard, Trash2
} from 'lucide-react';

type TabId = 'ingestion' | 'overview' | 'clauses' | 'compare' | 'qa' | 'checklist';

/** Step in the 3-step stepper: Upload → Understand → Act */
const getStep = (tab: TabId): 0 | 1 | 2 => {
  if (tab === 'ingestion') return 0;
  if (tab === 'overview' || tab === 'clauses' || tab === 'compare' || tab === 'qa') return 1;
  return 2;
};

export const App: React.FC = () => {
  const [activeTab,        setActiveTab]        = useState<TabId>('ingestion');
  const [documentText,     setDocumentText]     = useState<string>('');
  const [analysis,         setAnalysis]         = useState<LeaseAnalysisResult | null>(null);
  const [isAnalyzing,      setIsAnalyzing]      = useState<boolean>(false);
  const [samples,          setSamples]          = useState<Record<string, SampleDoc>>({});
  const [isMockMode,       setIsMockMode]       = useState<boolean>(true);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [language,         setLanguage]         = useState<Language>('en');
  const [analyzeError,     setAnalyzeError]     = useState<string | null>(null);

  const t = strings[language];

  /* Load health + samples on mount */
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => { if (d.isMockMode !== undefined) setIsMockMode(d.isMockMode); })
      .catch(() => setIsMockMode(true));

    fetch('/api/samples')
      .then((r) => r.json())
      .then((d) => {
        setSamples(d);
        const firstKey = Object.keys(d)[0];
        if (firstKey) setDocumentText(d[firstKey].content);
      })
      .catch((err) => console.error('Samples error:', err));
  }, []);

  const handleLoadSample = useCallback((key: string) => {
    const sample = samples[key] ?? samples[Object.keys(samples).find((k) => samples[k].id === key) ?? ''];
    if (sample) {
      setDocumentText(sample.content);
      setAnalysis(null);
      setActiveTab('ingestion');
    }
  }, [samples]);

  const triggerAnalysis = useCallback(async (text?: string) => {
    const src = (text ?? documentText).trim();
    if (!src) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isMockMode && { 'x-mock-mode': 'true' }),
        },
        body: JSON.stringify({ text: src }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? `Analysis failed with status ${res.status}`);
      }

      const data: LeaseAnalysisResult = await res.json();
      setAnalysis(data);

      if (data.summary && (!data.mismatch || data.mismatch.isResidentialLease)) {
        setActiveTab('overview');
      }
    } catch (err: any) {
      setAnalyzeError(err.message ?? 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentText, isMockMode]);

  const handleDeleteData = useCallback(() => {
    setDocumentText('');
    setAnalysis(null);
    setActiveTab('ingestion');
    setAnalyzeError(null);
    fetch('/api/session', { method: 'DELETE' }).catch(() => {});
  }, []);

  const hasAnalysis  = Boolean(analysis?.summary);
  const currentStep  = getStep(activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Skip link — must be first focusable element */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Header
        isMockMode={isMockMode}
        language={language}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        onToggleMockMode={() => setIsMockMode((prev) => !prev)}
      />

      <LegalBanner
        currentRiskLevel={analysis?.summary?.riskLevel}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
      />

      <main
        id="main-content"
        className="container"
        style={{ flex: 1, padding: '1.5rem 1.5rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >

        {/* ── Top utility bar: stepper + lang toggle + delete ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

          {/* 3-step stepper */}
          <nav aria-label="Progress steps">
            <ol className="stepper" style={{ listStyle: 'none', display: 'flex', alignItems: 'center' }}>
              {[
                { label: t.stepUpload,     step: 0, tab: 'ingestion'  as TabId },
                { label: t.stepUnderstand, step: 1, tab: 'overview'   as TabId },
                { label: t.stepAct,        step: 2, tab: 'checklist'  as TabId },
              ].map(({ label, step, tab }, idx) => {
                const isActive = currentStep === step;
                const isDone   = currentStep > step;
                return (
                  <React.Fragment key={step}>
                    <li className={`stepper-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      <button
                        onClick={() => {
                          if (step === 0) setActiveTab('ingestion');
                          else if (step === 1 && hasAnalysis) setActiveTab('overview');
                          else if (step === 2 && hasAnalysis) setActiveTab('checklist');
                        }}
                        disabled={step > 0 && !hasAnalysis}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Step ${step + 1}: ${label}${isDone ? ' (completed)' : isActive ? ' (current)' : ''}`}
                      >
                        <span className="stepper-dot" aria-hidden="true">
                          {isDone ? '✓' : step + 1}
                        </span>
                        <span className="no-print">{label}</span>
                      </button>
                    </li>
                    {idx < 2 && (
                      <div className={`stepper-line ${isDone ? 'done' : ''}`} aria-hidden="true" />
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LanguageToggle language={language} onChange={setLanguage} />
            {documentText && (
              <button
                onClick={handleDeleteData}
                className="btn btn-danger"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem', minHeight: 36, gap: '0.35rem' }}
                aria-label="Delete all uploaded data and start over"
              >
                <Trash2 size={14} aria-hidden="true" />
                {t.deleteData}
              </button>
            )}
          </div>
        </div>

        {/* ── Feature Tab Nav ── */}
        <nav className="nav-tabs no-print" aria-label="Feature navigation tabs" role="tablist">
          {(
            [
              { id: 'ingestion', icon: <FileText      size={14} aria-hidden="true" />, label: t.uploadTab },
              { id: 'overview',  icon: <LayoutDashboard size={14} aria-hidden="true" />, label: '📋 Overview',      requiresAnalysis: true },
              { id: 'clauses',   icon: <ShieldAlert   size={14} aria-hidden="true" />, label: t.clauseTab,   requiresAnalysis: true },
              { id: 'compare',   icon: <GitCompare    size={14} aria-hidden="true" />, label: t.compareTab },
              { id: 'qa',        icon: <MessageSquare size={14} aria-hidden="true" />, label: t.qaTab },
              { id: 'checklist', icon: <CheckSquare   size={14} aria-hidden="true" />, label: t.checklistTab, requiresAnalysis: true },
            ] as { id: TabId; icon: React.ReactNode; label: string; requiresAnalysis?: boolean }[]
          ).map(({ id, icon, label, requiresAnalysis }) => {
            const riskLevel = analysis?.summary?.riskLevel;
            const showBadge = (id === 'clauses' || id === 'overview') && riskLevel;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
                disabled={requiresAnalysis && !hasAnalysis}
                aria-selected={activeTab === id}
                aria-controls={`tab-panel-${id}`}
                role="tab"
                id={`tab-${id}`}
              >
                {icon}
                <span>{label}</span>
                {showBadge && (
                  <span
                    className={`badge ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'badge-critical' : 'badge-standard'}`}
                    style={{ fontSize: '0.58rem', padding: '0.1rem 0.4rem' }}
                    aria-label={`Risk level: ${riskLevel}`}
                  >
                    {riskLevel}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Analysis error */}
        {analyzeError && (
          <div
            role="alert"
            style={{
              background: 'var(--risk-critical-bg)',
              border: '1px solid var(--risk-critical-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              color: 'var(--risk-critical-text)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <strong>Analysis error:</strong> {analyzeError}
            </div>
            <button
              onClick={() => {
                setIsMockMode(true);
                setAnalyzeError(null);
                triggerAnalysis();
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', minHeight: 32 }}
            >
              🎭 Switch to Demo Mode & Retry
            </button>
          </div>
        )}

        {/* ── Tab panels ── */}
        <div role="tabpanel" id={`tab-panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'ingestion' && (
            <IngestionPanel
              documentText={documentText}
              setDocumentText={setDocumentText}
              onAnalyze={() => triggerAnalysis()}
              isAnalyzing={isAnalyzing}
              samples={samples}
              mismatch={analysis?.mismatch}
              onLoadSample={(key) => {
                handleLoadSample(key);
                setTimeout(() => {
                  const sample = samples[key];
                  if (sample?.content) triggerAnalysis(sample.content);
                }, 50);
              }}
              language={language}
              currentStep={currentStep}
            />
          )}

          {activeTab === 'overview' && analysis && (
            <OverviewPanel
              analysis={analysis}
              language={language}
              onGoToClauses={() => setActiveTab('clauses')}
            />
          )}

          {activeTab === 'clauses' && analysis && (
            <ClauseReview analysis={analysis} documentText={documentText} />
          )}

          {activeTab === 'compare' && (
            <ComparisonView samples={samples} />
          )}

          {activeTab === 'qa' && (
            <GroundedQA documentText={documentText} language={language} />
          )}

          {activeTab === 'checklist' && analysis && (
            <ChecklistView analysis={analysis} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="no-print"
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.25rem 0',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.75rem',
            fontSize: '0.75rem', color: 'var(--text-muted)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--accent-violet)' }}>ClauseClear</strong>
            {' '}— AI Rental Agreement Assistant for first-time tenants in India.
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>🔒 Zero persistent storage</span>
            <span>•</span>
            <span>Powered by Google Gemini</span>
            <span>•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0, minHeight: 'auto' }}
            >
              Legal Disclaimer
            </button>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};
