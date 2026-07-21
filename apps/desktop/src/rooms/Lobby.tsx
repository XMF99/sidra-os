import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemStatus } from '../lib/api';

export const Lobby: React.FC = () => {
  const { data: systemInfo } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: getSystemStatus,
    refetchInterval: 10000,
  });

  return (
    <div
      style={{
        flex: 1,
        height: '100vh',
        backgroundColor: 'var(--sd-color-surface-base)',
        color: 'var(--sd-color-text-primary)',
        padding: 'var(--sd-space-6)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid var(--sd-color-border-subtle)',
          paddingBottom: 'var(--sd-space-4)',
          marginBottom: 'var(--sd-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'var(--sd-font-weight-semibold)',
              margin: 0,
            }}
          >
            Lobby
          </h1>
          <p
            style={{
              color: 'var(--sd-color-text-secondary)',
              fontSize: 'var(--sd-font-size-sm)',
              margin: 'var(--sd-space-1) 0 0 0',
            }}
          >
            Sidra OS Executive Atrium
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--sd-color-surface-raised)',
            border: '1px solid var(--sd-color-border-subtle)',
            borderRadius: 'var(--sd-radius-md)',
            padding: 'var(--sd-space-2) var(--sd-space-3)',
            fontSize: 'var(--sd-font-size-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-2)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                systemInfo?.status === 'Ready'
                  ? 'var(--sd-color-status-success)'
                  : 'var(--sd-color-status-warning)',
            }}
          />
          <span>Kernel: {systemInfo?.status ?? 'Connecting...'}</span>
          <span style={{ color: 'var(--sd-color-text-muted)' }}>
            ({systemInfo?.version ?? 'v1.0'})
          </span>
        </div>
      </header>

      {/* Empty Lobby Room Canvas */}
      <main
        style={{
          flex: 1,
          border: '1px dashed var(--sd-color-border-subtle)',
          borderRadius: 'var(--sd-radius-lg)',
          backgroundColor: 'var(--sd-color-surface-raised)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--sd-color-text-muted)',
          textAlign: 'center',
          padding: 'var(--sd-space-8)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--sd-radius-full)',
            backgroundColor: 'var(--sd-color-surface-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--sd-space-3)',
            fontSize: '20px',
          }}
        >
          🏛️
        </div>
        <h2
          style={{
            fontSize: '18px',
            color: 'var(--sd-color-text-primary)',
            fontWeight: 'var(--sd-font-weight-medium)',
            margin: '0 0 var(--sd-space-2) 0',
          }}
        >
          No Active Engagements
        </h2>
        <p style={{ maxWidth: '400px', fontSize: 'var(--sd-font-size-sm)', margin: 0 }}>
          State an outcome to initiate work with your Executive team.
        </p>
      </main>
    </div>
  );
};
