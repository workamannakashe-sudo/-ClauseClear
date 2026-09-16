import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { LegalBanner } from './components/LegalBanner.js';
import { LegalModal } from './components/LegalModal.js';
import { IngestionPanel } from './components/IngestionPanel.js';
import { ClauseReview } from './components/ClauseReview.js';
import { ComparisonView } from './components/ComparisonView.js';
import { GroundedQA } from './components/GroundedQA.js';
import { ChecklistView } from './components/ChecklistView.js';
import { LeaseAnalysisResult, SampleDoc } from './types.js';
import {
  FileText,
  ShieldAlert,
  GitCompare,
  MessageSquare,
  CheckSquare,
  Scale
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'clauses' | 'compare' | 'qa' | 'checklist'>('ingestion');
  const [documentText, setDocumentText] = useState<string>('');
  const [analysis, setAnalysis] = useState<LeaseAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [samples, setSamples] = useState<Record<string, SampleDoc>>({});
  const [isMockMode, setIsMockMode] = useState<boolean>(true);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);

  // Load samples and server status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.isMockMode !== undefined) {
          setIsMockMode(data.isMockMode);
        }
      })
      .catch(() => setIsMockMode(true));

    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        setSamples(data);
        // Pre-populate with standard lease so user can explore immediately
        if (data.standard) {
          setDocumentText(data.standard.content);
        }
      })
      .catch((err) => console.error('Error fetching samples:', err));
  }, []);

  const handleLoadSample = (sampleKey: string) => {
    const sample = samples[sampleKey];
    if (sample) {
      setDocumentText(sample.content);
      // Auto-analyze if user clicked sample
      triggerAnalysis(sample.content);
    }
  };

  const triggerAnalysis = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || documentText).trim();
    if (!text) return;

    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error(`Analysis failed with status ${res.status}`);
      }

      const data: LeaseAnalysisResult = await res.json();
      setAnalysis(data);

      // If valid lease, move to clauses tab
      if (data.summary && (!data.mismatch || data.mismatch.isResidentialLease)) {
        setActiveTab('clauses');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        isMockMode={isMockMode}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
      />

      {/* Persistent Legal Banner */}
      <LegalBanner
        currentRiskLevel={analysis?.summary?.riskLevel}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Feature Tabs">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`nav-tab ${activeTab === 'ingestion' ? 'active' : ''}`}
          >
            <FileText size={16} />
            <span>1. Document Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('clauses')}
            className={`nav-tab ${activeTab === 'clauses' ? 'active' : ''}`}
            disabled={!analysis?.summary}
          >
            <ShieldAlert size={16} />
            <span>2. Clause Review & Risks</span>
            {analysis?.summary && (
              <span className={`badge ${analysis.summary.riskLevel === 'CRITICAL' ? 'badge-critical' : 'badge-standard'}`} style={{ fontSize: '0.65rem' }}>
                {analysis.summary.riskLevel}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
          >
            <GitCompare size={16} />
            <span>3. Version Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`nav-tab ${activeTab === 'qa' ? 'active' : ''}`}
          >
            <MessageSquare size={16} />
            <span>4. Grounded Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`nav-tab ${activeTab === 'checklist' ? 'active' : ''}`}
            disabled={!analysis?.summary}
          >
            <CheckSquare size={16} />
            <span>5. Next Steps & Letter</span>
          </button>
        </nav>

        {/* Tab Content Views */}
        {activeTab === 'ingestion' && (
          <IngestionPanel
            documentText={documentText}
            setDocumentText={setDocumentText}
            onAnalyze={() => triggerAnalysis()}
            isAnalyzing={isAnalyzing}
            samples={samples}
            mismatch={analysis?.mismatch}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'clauses' && analysis && (
          <ClauseReview analysis={analysis} />
        )}

        {activeTab === 'compare' && (
          <ComparisonView samples={samples} />
        )}

        {activeTab === 'qa' && (
          <GroundedQA documentText={documentText} />
        )}

        {activeTab === 'checklist' && analysis && (
          <ChecklistView analysis={analysis} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 0',
        marginTop: 'auto',
        background: 'rgba(9, 13, 22, 0.9)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <strong>LeaseGuard AI</strong> — Built for Prompt Wars Hackathon. Focused strictly on tenant rights & housing justice.
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Single-branch main</span>
            <span>•</span>
            <span>Zero-PII Storage</span>
            <span>•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Legal Notice & Aid
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};
