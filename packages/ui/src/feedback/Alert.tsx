import { FC, ReactNode } from 'react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children?: ReactNode;
}

export const Alert: FC<AlertProps> = ({ type = 'info', title, children }) => {
  const stylesMap: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'var(--sd-color-status-info, #3b82f6)',
      color: '#93c5fd',
      icon: 'ℹ️',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'var(--sd-color-status-success, #10b981)',
      color: '#6ee7b7',
      icon: '✅',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'var(--sd-color-status-warning, #f59e0b)',
      color: '#fde047',
      icon: '⚠️',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'var(--sd-color-status-error, #ef4444)',
      color: '#fca5a5',
      icon: '🛑',
    },
  };

  const style = stylesMap[type] ?? stylesMap.info;

  return (
    <div
      role="alert"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: 'var(--sd-radius-md, 6px)',
        padding: '12px 16px',
        display: 'flex',
        gap: 12,
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
      }}
    >
      <span style={{ fontSize: 16 }}>{style.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 14, color: style.color }}>{title}</div>}
        <div style={{ fontSize: 13, color: 'var(--sd-color-text-primary, #f3f4f6)', marginTop: title ? 4 : 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
