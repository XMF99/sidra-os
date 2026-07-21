import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEventLog, verifyEventChain } from '../lib/api';

export const Vault: React.FC = () => {
  const { data: events } = useQuery({
    queryKey: ['eventLog'],
    queryFn: getEventLog,
  });

  const { data: isChainValid } = useQuery({
    queryKey: ['verifyChain'],
    queryFn: verifyEventChain,
  });

  return (
    <div style={{ flex: 1, padding: '24px', backgroundColor: 'var(--sd-color-surface-base)', color: 'var(--sd-color-text-primary)', overflowY: 'auto' }}>
      <h1>Vault</h1>
      <p style={{ color: 'var(--sd-color-text-secondary)' }}>Single-File SQLite Database & SHA-256 Hash Chained Event Log</p>

      <div style={{ backgroundColor: 'var(--sd-color-surface-raised)', padding: '16px', borderRadius: '8px', border: '1px solid var(--sd-color-border-subtle)', marginBottom: '24px' }}>
        <h3>SHA-256 Event Log Chain Integrity</h3>
        <p style={{ color: isChainValid ? 'var(--sd-color-status-success)' : 'var(--sd-color-status-error)', fontWeight: 600 }}>
          {isChainValid ? '✓ SHA-256 Hash Chain Verified (Cryptographically Intact)' : '✗ SHA-256 Chain Verification Failure'}
        </p>
      </div>

      <h3>Event Chain Audit Trail ({events?.length ?? 0} events):</h3>
      {events?.map((e: any) => (
        <div
          key={e.sequence}
          style={{
            backgroundColor: 'var(--sd-color-surface-raised)',
            border: '1px solid var(--sd-color-border-subtle)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          <div><strong>Seq #{e.sequence}</strong>: {e.event_type} ({e.aggregate_type}/{e.aggregate_id})</div>
          <div style={{ color: 'var(--sd-color-text-muted)', fontSize: '11px', marginTop: '4px' }}>
            Hash: {e.hash} | Prev: {e.prev_hash}
          </div>
        </div>
      ))}
    </div>
  );
};
