import { FC } from 'react';
import { Button } from '../primitives/Button';

export interface ErrorStateProps {
  title?: string;
  error?: Error | string;
  correlationId?: string;
  onRetry?: () => void;
}

export const ErrorState: FC<ErrorStateProps> = ({
  title = 'Operation Failed',
  error,
  correlationId,
  onRetry,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected service error occurred.';

  const handleCopyId = () => {
    if (correlationId && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(correlationId);
    }
  };

  return (
    <div
      style={{
        padding: 'var(--sd-space-6)',
        borderRadius: 'var(--sd-radius-lg)',
        backgroundColor: 'var(--sd-color-bg-surface)',
        border: '1px solid var(--sd-status-danger)',
        maxWidth: '480px',
        margin: 'var(--sd-space-4) auto',
      }}
    >
      <h4
        style={{
          margin: '0 0 var(--sd-space-2) 0',
          fontSize: 'var(--sd-font-size-md)',
          fontWeight: 'var(--sd-font-weight-semibold)',
          color: 'var(--sd-status-danger)',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: '0 0 var(--sd-space-3) 0',
          fontSize: 'var(--sd-font-size-sm)',
          color: 'var(--sd-color-text-muted)',
        }}
      >
        {errorMessage}
      </p>
      {correlationId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sd-space-2)',
            borderRadius: 'var(--sd-radius-sm)',
            backgroundColor: 'var(--sd-color-bg-inset)',
            fontSize: 'var(--sd-font-size-xs)',
            fontFamily: 'var(--sd-font-mono)',
            marginBottom: 'var(--sd-space-4)',
          }}
        >
          <span>correlationId: {correlationId}</span>
          <button
            onClick={handleCopyId}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Copy
          </button>
        </div>
      )}
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
