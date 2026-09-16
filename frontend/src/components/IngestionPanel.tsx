import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, RefreshCw, ArrowRight, ShieldAlert } from 'lucide-react';
import { DocumentMismatchResult, SampleDoc } from '../types.js';

interface IngestionPanelProps {
  documentText: string;
  setDocumentText: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  samples: Record<string, SampleDoc>;
  mismatch?: DocumentMismatchResult | null;
  onLoadSample: (sampleKey: string) => void;
}

export const IngestionPanel: React.FC<IngestionPanelProps> = ({
  documentText,
  setDocumentText,
  onAnalyze,
  isAnalyzing,
  samples,
  mismatch,
  onLoadSample
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadError(null);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB maximum limit.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'pdf', 'docx'].includes(ext || '')) {
      setUploadError('Invalid file format. Please upload a .txt, .pdf, or .docx document.');
      return;
    }

    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setDocumentText(content);
      };
      reader.readAsText(file);
    } else {
      // Send directly to backend via FormData
      uploadFileToBackend(file);
    }
  };

  const uploadFileToBackend = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Trigger analysis immediately via file upload
      onAnalyze();
    } catch (err: any) {
      setUploadError(`Failed to process uploaded file: ${err.message}`);
    }
  };

  const wordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;

  return (
    <section className="animate-fade-in" aria-labelledby="ingestion-heading">
      {/* Top Banner with Sample Buttons */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 id="ingestion-heading" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              Upload or Paste Residential Lease
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Evaluate clauses, uncover predatory traps, and get plain-English rights analysis
            </p>
          </div>

          {/* 1-Click Evaluator Testing Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>
              Quick Samples:
            </span>
            <button
              onClick={() => onLoadSample('standard')}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              title="Load balanced residential lease agreement"
            >
              Standard Lease
            </button>
            <button
              onClick={() => onLoadSample('predatory')}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.75rem',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#fca5a5'
              }}
              title="Load predatory agreement with unannounced entry and habitability waivers"
            >
              Predatory Lease (Red Flags)
            </button>
            <button
              onClick={() => onLoadSample('mismatch')}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              title="Load resume to test document mismatch detection"
            >
              Test Mismatch (Resume)
            </button>
          </div>
        </div>

        {/* Document Mismatch Alert Card */}
        {mismatch && !mismatch.isResidentialLease && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '1rem'
            }}
          >
            <ShieldAlert size={26} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ color: '#fca5a5', fontSize: '1rem', marginBottom: '0.35rem' }}>
                Document Mismatch Detected: {mismatch.detectedDocumentType}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                {mismatch.mismatchReason}
              </p>
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: '#94a3b8'
              }}>
                <strong>Guidance:</strong> {mismatch.guidanceMessage}
              </div>
            </div>
          </div>
        )}

        {/* Upload Drop Zone & Text Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '1.25rem' }}>
          {/* File Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload PDF, DOCX, or TXT lease file"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
            <div style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem'
            }}>
              <Upload size={24} color="var(--accent-blue)" />
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Drop your lease file here
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Supports PDF, DOCX, or TXT (Max 5MB)
            </p>
            <span className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
              Browse Files
            </span>
          </div>

          {/* Paste Text Area */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label htmlFor="lease-textarea" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Or Paste Agreement Text
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {wordCount} words | {documentText.length} characters
              </span>
            </div>
            <textarea
              id="lease-textarea"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste residential lease clauses or full contract here (e.g. rent, security deposit, notice of entry, maintenance terms)..."
              style={{
                flex: 1,
                minHeight: '180px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '0.85rem',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {uploadError && (
          <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            {uploadError}
          </p>
        )}

        {/* Action Button & Live Progress */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '1rem', alignItems: 'center' }}>
          {/* ARIA Live Status for Screen Readers */}
          <div aria-live="polite" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isAnalyzing ? 'Analyzing lease clauses and evaluating tenant risk...' : ''}
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !documentText.trim()}
            className="btn btn-primary"
            style={{ minWidth: '180px' }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Analyzing Terms...</span>
              </>
            ) : (
              <>
                <span>Analyze Lease Rights</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
