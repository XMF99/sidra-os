import React from 'react';

export const Department: React.FC = () => {
  return (
    <div style={{ flex: 1, padding: '24px', backgroundColor: 'var(--sd-color-surface-base)', color: 'var(--sd-color-text-primary)' }}>
      <h1>Department</h1>
      <p style={{ color: 'var(--sd-color-text-secondary)' }}>Departmental Work Order Execution Pipeline</p>

      <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)', marginTop: '24px' }}>
        <h3>Work Order Pipeline</h3>
        <p style={{ fontSize: '13px', color: 'var(--sd-color-text-muted)' }}>Status Lifecycle: Pending → Planning → Executing → Completed</p>
      </div>
    </div>
  );
};
