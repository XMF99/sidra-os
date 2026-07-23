import { FC, ReactNode } from 'react';

export interface EmptyStateProps {
  variant?: 'first-run' | 'no-match' | 'degraded';
  title: string;
  hint: string;
  action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  variant = 'no-match',
  title,
  hint,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sd-space-8) var(--sd-space-4)',
        textAlign: 'center',
        borderRadius: 'var(--sd-radius-lg)',
        backgroundColor: 'var(--sd-color-bg-surface)',
        border: '1px dashed var(--sd-color-border)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--sd-radius-circle)',
          backgroundColor: 'var(--sd-color-bg-inset)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--sd-space-3)',
          color: 'var(--sd-color-text-subtle)',
          fontSize: '18px',
        }}
      >
        {variant === 'first-run' ? '✦' : variant === 'degraded' ? '⚡' : '🔍'}
      </div>
      <h4
        style={{
          margin: '0 0 var(--sd-space-1) 0',
          fontSize: 'var(--sd-font-size-md)',
          fontWeight: 'var(--sd-font-weight-semibold)',
          color: 'var(--sd-color-text)',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: '0 0 var(--sd-space-4) 0',
          fontSize: 'var(--sd-font-size-sm)',
          color: 'var(--sd-color-text-muted)',
          maxWidth: '360px',
        }}
      >
        {hint}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
