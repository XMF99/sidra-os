import React from 'react';

export const Boardroom: React.FC = () => {
  return (
    <div style={{ flex: 1, padding: '24px', backgroundColor: 'var(--sd-color-surface-base)', color: 'var(--sd-color-text-primary)' }}>
      <h1>Boardroom</h1>
      <p style={{ color: 'var(--sd-color-text-secondary)' }}>Cooperating Executive Agent Council</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)' }}>
          <h3>AnalystAgent (Role: Analyst)</h3>
          <p style={{ fontSize: '13px', color: 'var(--sd-color-text-muted)' }}>Specialization: Ingestion, Chunking, Hybrid Vector Search</p>
          <span style={{ fontSize: '12px', color: 'var(--sd-color-status-success)' }}>● Active</span>
        </div>

        <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)' }}>
          <h3>WriterAgent (Role: Writer)</h3>
          <p style={{ fontSize: '13px', color: 'var(--sd-color-text-muted)' }}>Specialization: Executive Brief Formatting & Summarization</p>
          <span style={{ fontSize: '12px', color: 'var(--sd-color-status-success)' }}>● Active</span>
        </div>
      </div>
    </div>
  );
};
