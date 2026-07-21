import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEventLog } from '../lib/api';

export const Console: React.FC = () => {
  const { data: events } = useQuery({
    queryKey: ['consoleLog'],
    queryFn: getEventLog,
    refetchInterval: 2000,
  });

  return (
    <div style={{ flex: 1, padding: '24px', backgroundColor: 'var(--sd-color-surface-base)', color: 'var(--sd-color-text-primary)', overflowY: 'auto' }}>
      <h1>Console</h1>
      <p style={{ color: 'var(--sd-color-text-secondary)' }}>Real-Time System Telemetry & Event Stream</p>

      <div
        style={{
          backgroundColor: 'var(--sd-color-surface-sunken)',
          border: '1px solid var(--sd-color-border-subtle)',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          minHeight: '400px',
        }}
      >
        {events?.map((e: any) => (
          <div key={e.sequence} style={{ marginBottom: '6px' }}>
            <span style={{ color: 'var(--sd-color-text-muted)' }}>[{e.timestamp}]</span>{' '}
            <span style={{ color: 'var(--sd-color-accent)' }}>[{e.event_type}]</span> {e.payload}
          </div>
        ))}
      </div>
    </div>
  );
};
