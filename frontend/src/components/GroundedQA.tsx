import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, ShieldAlert, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { GroundedQAResult } from '../types.js';

interface GroundedQAProps {
  documentText: string;
}

interface QAItem {
  id: string;
  question: string;
  result: GroundedQAResult;
}

export const GroundedQA: React.FC<GroundedQAProps> = ({ documentText }) => {
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<QAItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const suggestedQuestions = [
    'How much advance notice must the landlord give before entering?',
    'Are pets allowed and what are the fees?',
    'What are the rules regarding subletting or roommates?',
    'Is there rooftop swimming pool access or valet parking?' // Deliberately tests silent document refusal
  ];

  const handleAsk = async (qText?: string) => {
    const query = (qText || question).trim();
    if (!query) return;

    if (!documentText.trim()) {
      setError('Please upload or paste a lease document first before asking questions.');
      return;
    }

    setError(null);
    setIsAsking(true);

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          question: query
        })
      });

      if (!res.ok) {
        throw new Error(`Q&A service failed with status ${res.status}`);
      }

      const result: GroundedQAResult = await res.json();
      setChatHistory((prev) => [
        {
          id: Date.now().toString(),
          question: query,
          result
        },
        ...prev
      ]);
      setQuestion('');
    } catch (err: any) {
      setError(err.message || 'Failed to get answer.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Question Input Box */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <MessageSquare size={20} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
            Grounded Document Q&A
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Ask natural-language questions about your rights and restrictions. Answers are strictly grounded in your lease text with verbatim citations. If the lease does not address the question, it will refuse rather than fabricate terms.
        </p>

        {/* Suggested Question Chips */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            Quick Prompts (Click to test):
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                disabled={isAsking}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.65rem',
                  textAlign: 'left',
                  borderColor: idx === 3 ? 'rgba(234, 179, 8, 0.4)' : undefined
                }}
              >
                {q} {idx === 3 && '(Tests Refusal)'}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type a question about notice, pets, repairs, fees, or lease termination..."
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="btn btn-primary"
            style={{ minWidth: '120px' }}
          >
            {isAsking ? 'Searching...' : 'Ask Lease'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</p>
        )}
      </div>

      {/* Answer Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {chatHistory.map((item) => (
          <div
            key={item.id}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderLeft: `4px solid ${
                item.result.isAddressedInDocument ? 'var(--accent-blue)' : '#eab308'
              }`
            }}
          >
            {/* User Question */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '1rem', color: '#fff' }}>
                Q: {item.question}
              </strong>
            </div>

            {/* Status / Grounding Pill */}
            <div style={{ marginBottom: '0.75rem' }}>
              {item.result.isAddressedInDocument ? (
                <span className="badge badge-standard">
                  <CheckCircle2 size={12} /> Verified in Lease Document
                </span>
              ) : (
                <span className="badge badge-medium">
                  <ShieldAlert size={12} /> Document Is Silent — Refused Hallucination
                </span>
              )}
            </div>

            {/* Grounded Answer */}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55, margin: '0.5rem 0' }}>
              {item.result.answer}
            </p>

            {/* Verbatim Quote Citation if present */}
            {item.result.directQuote && (
              <div className="quote-snippet">
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  <BookOpen size={12} /> Cited Verbatim from {item.result.relevantSection || 'Lease'}
                </span>
                "{item.result.directQuote}"
              </div>
            )}

            {/* Follow-up advisory */}
            {item.result.recommendedFollowUp && (
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <strong>Tenant Tip:</strong> {item.result.recommendedFollowUp}
              </div>
            )}
          </div>
        ))}

        {chatHistory.length === 0 && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <HelpCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              No questions asked yet. Select one of the quick prompts above or ask anything about your tenancy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
