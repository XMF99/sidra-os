import { FC } from 'react';
import { useTauriBridge } from '../providers/TauriBridgeProvider';
import { useShellStore } from '../../state/useShellStore';
import { navigate } from '../../routes/navigate';

export const StatusBar: FC = () => {
  const { tailStatus } = useTauriBridge();
  const { developerMode } = useShellStore();

  return (
    <footer
      aria-label="System status bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: '0 var(--sd-space-4)',
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
        {/* Segment 1: Sidra Status */}
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
          title="Sidra OS Beta 1: Ready"
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
          <span>Sidra OS: Ready</span>
        </button>

        {/* Segment 2: Active Missions */}
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
          title="View active missions"
        >
          Missions: <strong style={{ color: 'var(--sd-color-text)' }}>1 active</strong>
        </button>

        {/* Segment 3: AI Team Agents */}
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
          title="View active AI team"
        >
          AI Team: <strong style={{ color: 'var(--sd-color-text)' }}>5 agents online</strong>
        </button>

        {/* Segment 4: Sync State */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-1)' }}>
          <span>Sync: Up to date</span>
        </span>

        {/* Segment 5: Developer Diagnostics (Developer Mode Only) */}
        {developerMode && (
          <button
            onClick={() => navigate.events()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sd-space-1)',
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              fontSize: 'inherit',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 600,
            }}
            title="Developer Mode: Event Tail diagnostic"
          >
            <span>● Tail: {tailStatus}</span>
          </button>
        )}
      </div>

      {/* Segment 6: App Release */}
      <div>
        <span>Sidra OS Beta 1 {developerMode ? '(Dev Mode)' : ''}</span>
      </div>
    </footer>
  );
};
