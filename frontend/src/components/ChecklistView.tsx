import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  Copy,
  Check,
  Download,
  Mail,
  HelpCircle,
  Scale
} from 'lucide-react';
import { ActionChecklistResult, LeaseAnalysisResult, ChecklistItem, RiskLevel } from '../types.js';

interface ChecklistViewProps {
  analysis: LeaseAnalysisResult;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ analysis }) => {
  const [checklistData, setChecklistData] = useState<ActionChecklistResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (analysis && analysis.summary) {
      loadChecklist();
    }
  }, [analysis]);

  const loadChecklist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis })
      });
      if (res.ok) {
        const data: ActionChecklistResult = await res.json();
        setChecklistData(data);
      }
    } catch (err) {
      console.error('Failed to load checklist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyDraftLetter = () => {
    if (!checklistData?.draftNegotiationLetter) return;
    navigator.clipboard.writeText(
      `Subject: ${checklistData.draftNegotiationLetter.subject}\n\n${checklistData.draftNegotiationLetter.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadDraftLetter = () => {
    if (!checklistData?.draftNegotiationLetter) return;
    const text = `Subject: ${checklistData.draftNegotiationLetter.subject}\n\n${checklistData.draftNegotiationLetter.body}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tenant_lease_negotiation_letter.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getUrgencyBadge = (urgency: RiskLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return <span className="badge badge-critical">Critical Action</span>;
      case 'HIGH':
        return <span className="badge badge-high">High Priority</span>;
      case 'MEDIUM':
        return <span className="badge badge-medium">Medium</span>;
      default:
        return <span className="badge badge-standard">Standard Step</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Generating tailored next-step actions & landlord communication...</p>
      </div>
    );
  }

  if (!checklistData) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Analyze a lease document to generate your custom action checklist.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <CheckSquare size={22} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            Prioritized Tenant Action Checklist
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          {checklistData.summary}
        </p>
      </div>

      {/* Interactive Checklist Items */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
          Key Next Steps & Safeguards
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {checklistData.checklist.map((item) => {
            const isDone = completedItems.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isDone ? 'rgba(16, 185, 129, 0.06)' : 'rgba(0, 0, 0, 0.25)',
                  border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ marginTop: '2px', color: isDone ? '#10b981' : 'var(--text-muted)' }}>
                  {isDone ? <CheckSquare size={19} /> : <Square size={19} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: isDone ? '#94a3b8' : '#fff',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {item.title}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {getUrgencyBadge(item.urgency)}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0', lineHeight: 1.45 }}>
                    {item.actionDetails}
                  </p>

                  {item.relatedClause && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Triggered by: <em>{item.relatedClause}</em>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions to ask the Landlord in writing */}
      {checklistData.questionsForLandlord.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <HelpCircle size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              Written Clarifications to Request from Landlord
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {checklistData.questionsForLandlord.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem'
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                  "{q.question}"
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Why ask: {q.context}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready-to-Send Negotiation Letter Draft */}
      {checklistData.draftNegotiationLetter && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
                Drafted Landlord Negotiation Email / Letter
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={copyDraftLetter}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Letter'}</span>
              </button>
              <button
                onClick={downloadDraftLetter}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              >
                <Download size={14} />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.82rem',
            color: '#e2e8f0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            <strong>Subject: {checklistData.draftNegotiationLetter.subject}</strong>
            {'\n\n'}
            {checklistData.draftNegotiationLetter.body}
          </div>
        </div>
      )}
    </div>
  );
};
