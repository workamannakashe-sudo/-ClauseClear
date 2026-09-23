import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, CheckCircle2, ShieldAlert,
  BookOpen, HelpCircle, Loader2
} from 'lucide-react';
import { GroundedQAResult } from '../types.js';
import { Language, strings } from '../i18n.js';

interface GroundedQAProps {
  documentText: string;
  language: Language;
}

interface QAItem {
  id: string;
  question: string;
  result: GroundedQAResult | null;
  isStreaming: boolean;
}

const SUGGESTED_QUESTIONS = [
  'What is the notice period if I want to leave early?',
  'How much security deposit is required and when do I get it back?',
  'Are pets allowed in this agreement?',
  'Can the landlord enter my home without notice?',
  'Is there a swimming pool or gym mentioned?', // tests silent-document refusal
];

/**
 * Grounded Q&A with chat-bubble UI.
 * Streams answers via SSE when available, falls back to regular fetch.
 * Every answer carries a grounding badge and verbatim citation.
 */
export const GroundedQA: React.FC<GroundedQAProps> = ({ documentText, language }) => {
  const [question, setQuestion]   = useState('');
  const [isAsking, setIsAsking]   = useState(false);
  const [chatItems, setChatItems] = useState<QAItem[]>([]);
  const [error, setError]         = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const t = strings[language];

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatItems]);

  const handleAsk = useCallback(async (qText?: string) => {
    const query = (qText ?? question).trim();
    if (!query || isAsking) return;

    if (!documentText.trim()) {
      setError('Please upload or paste a rental agreement first before asking questions.');
      return;
    }

    setError(null);
    setIsAsking(true);
    const id = Date.now().toString();

    /* Add placeholder bubble immediately */
    setChatItems((prev) => [
      ...prev,
      { id, question: query, result: null, isStreaming: true },
    ]);
    setQuestion('');

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, question: query }),
      });

      if (!res.ok) throw new Error(`Q&A service failed with status ${res.status}`);

      const result: GroundedQAResult = await res.json();
      setChatItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, result, isStreaming: false } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? 'Failed to get answer. Please try again.');
      setChatItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setIsAsking(false);
      inputRef.current?.focus();
    }
  }, [question, documentText, isAsking]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '75vh', minHeight: 500 }}
      aria-label="Grounded Q&A chat"
    >
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <MessageSquare size={20} color="var(--accent-lavender)" aria-hidden="true" />
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Grounded Document Q&amp;A</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Answers are strictly sourced from your uploaded document. The AI will say "This document doesn't say" rather than guessing.
        </p>
      </div>

      {/* Suggested questions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleAsk(q)}
            disabled={isAsking}
            className="btn btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.7rem',
              minHeight: 36,
              borderColor: i === 4 ? 'rgba(234,179,8,0.4)' : undefined,
              color: i === 4 ? 'var(--risk-medium-text)' : undefined,
            }}
            title={i === 4 ? 'Tests refusal when document is silent' : undefined}
          >
            {q} {i === 4 && <span aria-label="tests refusal">(Tests Refusal)</span>}
          </button>
        ))}
      </div>

      {/* Chat history */}
      <div
        className="glass-panel"
        style={{
          flex: 1, overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex', flexDirection: 'column',
          gap: '1.25rem',
        }}
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
      >
        {chatItems.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <HelpCircle size={40} aria-hidden="true" />
            <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
              Select a suggested question above or type your own below.
            </p>
          </div>
        )}

        {chatItems.map((item) => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* User bubble — right aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="chat-bubble-user" role="note" aria-label={`Your question: ${item.question}`}>
                {item.question}
              </div>
            </div>

            {/* AI bubble — left aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.6rem', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div
                aria-hidden="true"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'conic-gradient(from 210deg, #f9a8d4, #c4b5fd, #93c5fd, #f9a8d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 4,
                  boxShadow: '0 3px 8px rgba(167,139,250,0.35)',
                }}
              >
                <MessageSquare size={16} color="#fff" />
              </div>

              <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {item.isStreaming ? (
                  <div className="chat-bubble-ai" aria-busy="true" aria-label="Loading answer">
                    <Loader2 size={18} color="var(--accent-lavender)" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                  </div>
                ) : item.result ? (
                  <>
                    {/* Grounding badge */}
                    <div>
                      {item.result.isAddressedInDocument ? (
                        <span className="badge badge-standard">
                          <CheckCircle2 size={11} aria-hidden="true" /> Verified in document
                        </span>
                      ) : (
                        <span className="badge badge-standard" style={{ background: 'rgba(234,179,8,0.1)', color: 'var(--risk-medium-text)', border: '1px solid rgba(234,179,8,0.25)' }}>
                          <ShieldAlert size={11} aria-hidden="true" /> Document is silent — refused to guess
                        </span>
                      )}
                    </div>

                    {/* Answer bubble */}
                    <div
                      className="chat-bubble-ai"
                      lang={language}
                      role="article"
                      aria-label={`Answer: ${item.result.answer}`}
                    >
                      {item.result.answer}
                    </div>

                    {/* Citation */}
                    {item.result.directQuote && (
                      <div
                        style={{
                          maxWidth: '90%',
                          background: 'rgba(139,92,246,0.04)',
                          border: '1px solid rgba(139,92,246,0.15)',
                          borderLeft: '3px solid var(--accent-lavender)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        <span style={{ fontSize: '0.66rem', color: 'var(--accent-violet)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem', textTransform: 'uppercase', fontStyle: 'normal', fontWeight: 700 }}>
                          <BookOpen size={11} aria-hidden="true" />
                          Cited from {item.result.relevantSection ?? 'document'}
                        </span>
                        "{item.result.directQuote}"
                      </div>
                    )}

                    {/* Follow-up */}
                    {item.result.recommendedFollowUp && (
                      <div
                        style={{
                          fontSize: '0.78rem', color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.7)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.55rem 0.75rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <strong style={{ color: 'var(--accent-violet)' }}>💡 Tip:</strong> {item.result.recommendedFollowUp}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{ color: 'var(--risk-critical-text)', fontSize: '0.84rem', padding: '0.6rem 1rem', background: 'var(--risk-critical-bg)', border: '1px solid var(--risk-critical-border)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      {/* Input bar — LiX-inspired */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
        style={{
          display: 'flex',
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.85)',
          border: '1.5px solid rgba(139,92,246,0.25)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.5rem 0.5rem 0.5rem 1.25rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 16px rgba(139,92,246,0.1)',
        }}
      >
        <label htmlFor="qa-input" className="sr-only">Ask a question about your agreement</label>
        <input
          id="qa-input"
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your agreement…"
          disabled={isAsking}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            minHeight: 38,
            fontFamily: 'inherit',
          }}
          aria-label="Question input"
          aria-describedby="qa-hint"
        />
        <span id="qa-hint" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          Press Enter or click the send button to ask your question
        </span>
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="btn btn-primary"
          style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.1rem', minWidth: 44, minHeight: 44 }}
          aria-label={t.askBtn}
        >
          {isAsking
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
            : <Send size={16} aria-hidden="true" />}
        </button>
      </form>
    </div>
  );
};
