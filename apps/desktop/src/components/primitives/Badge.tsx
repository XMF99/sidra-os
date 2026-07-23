import { FC, ReactNode } from 'react';

export interface BadgeProps {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  variant?: 'soft' | 'solid' | 'outline';
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  tone = 'neutral',
  variant = 'soft',
  children,
}) => {
  let bg = 'var(--sd-color-bg-inset)';
  let color = 'var(--sd-color-text-muted)';
  let border = '1px solid var(--sd-color-border)';

  if (tone === 'success') {
    bg = variant === 'solid' ? 'var(--sd-status-success)' : 'var(--sd-status-success-bg)';
    color = variant === 'solid' ? '#ffffff' : 'var(--sd-status-success)';
    border = variant === 'outline' ? '1px solid var(--sd-status-success)' : 'none';
  } else if (tone === 'warning') {
    bg = variant === 'solid' ? 'var(--sd-status-warning)' : 'var(--sd-status-warning-bg)';
    color = variant === 'solid' ? '#ffffff' : 'var(--sd-status-warning)';
    border = variant === 'outline' ? '1px solid var(--sd-status-warning)' : 'none';
  } else if (tone === 'danger') {
    bg = variant === 'solid' ? 'var(--sd-status-danger)' : 'var(--sd-status-danger-bg)';
    color = variant === 'solid' ? '#ffffff' : 'var(--sd-status-danger)';
    border = variant === 'outline' ? '1px solid var(--sd-status-danger)' : 'none';
  } else if (tone === 'info') {
    bg = variant === 'solid' ? 'var(--sd-status-info)' : 'var(--sd-status-info-bg)';
    color = variant === 'solid' ? '#ffffff' : 'var(--sd-status-info)';
    border = variant === 'outline' ? '1px solid var(--sd-status-info)' : 'none';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--sd-radius-pill)',
        fontSize: 'var(--sd-font-size-xs)',
        fontWeight: 'var(--sd-font-weight-medium)',
        backgroundColor: bg,
        color,
        border,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};
