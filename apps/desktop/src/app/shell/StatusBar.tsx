import { FC } from 'react';
import { useTauriBridge } from '../providers/TauriBridgeProvider';
import { navigate } from '../../routes/navigate';

export const StatusBar: FC = () => {
  const { tailStatus } = useTauriBridge();

  return (
    <footer
      aria-label="System status bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: '0 var(--sd-space-3)',
        backgroundColor: 'var(--sd-color-bg-surface-raised)',
        borderTop: '1px solid var(--sd-color-border)',
        fontSize: 'var(--sd-font-size-xs)',
        color: 'var(--sd-color-text-muted)',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Status Segments */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-4)' }}>
        {/* Segment 1: Vault & Health */}
        <button
          onClick={() => navigate.dashboard()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-1)',
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
          }}
          title="Vault state: Open & healthy"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: 'var(--sd-radius-circle)',
              backgroundColor: 'var(--sd-status-success)',
              display: 'inline-block',
            }}
          />
          <span>Vault: Ready</span>
        </button>

        {/* Segment 2: Event Tail State */}
        <button
          onClick={() => navigate.events()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-1)',
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
          }}
          title="Click to view Event Log"
        >
          <span style={{ color: tailStatus === 'live' ? 'var(--sd-status-success)' : 'var(--sd-status-warning)' }}>
            ●
          </span>
          <span>Event Tail: {tailStatus}</span>
        </button>

        {/* Segment 3: Running Missions */}
        <button
          onClick={() => navigate.missions({ filter: 'running' })}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
          }}
          title="View running missions"
        >
          Missions: <strong style={{ color: 'var(--sd-color-text)' }}>0 running</strong>
        </button>

        {/* Segment 4: Running Agents */}
        <button
          onClick={() => navigate.agents({ filter: 'active' })}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
          }}
          title="View active agents"
        >
          Agents: <strong style={{ color: 'var(--sd-color-text)' }}>0 active</strong>
        </button>

        {/* Segment 5: Sync State */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-1)' }}>
          <span>Sync: Idle</span>
        </span>
      </div>

      {/* Segment 6: Environment Tag */}
      <div>
        <span>Local · v4.0-alpha</span>
      </div>
    </footer>
  );
};
