import { FC } from 'react';

export interface EventDTO {
  id: string;
  kind: string;
  correlationId: string;
  timestamp: string;
  summary: string;
}

export interface EventRowProps {
  event: EventDTO;
  onFollowCorrelation?: (correlationId: string) => void;
}

export const EventRow: FC<EventRowProps> = ({ event, onFollowCorrelation }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--sd-space-2) var(--sd-space-3)',
        borderRadius: 'var(--sd-radius-md)',
        backgroundColor: 'var(--sd-color-bg-surface)',
        border: '1px solid var(--sd-color-border)',
        fontSize: 'var(--sd-font-size-xs)',
        gap: 'var(--sd-space-3)',
      }}
    >
      <span style={{ fontFamily: 'var(--sd-font-mono)', color: 'var(--sd-color-text-subtle)', minWidth: '100px' }}>
        {event.kind}
      </span>
      <span style={{ flex: 1, color: 'var(--sd-color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.summary}
      </span>
      <button
        onClick={() => onFollowCorrelation?.(event.correlationId)}
        style={{
          fontFamily: 'var(--sd-font-mono)',
          color: 'var(--sd-color-primary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        {event.correlationId.substring(0, 8)}...
      </button>
    </div>
  );
};
