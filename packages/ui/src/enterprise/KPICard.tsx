import { FC, ReactNode } from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
}

export const KPICard: FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
}) => {
  const changeColors = {
    positive: 'var(--sd-color-status-success, #10b981)',
    negative: 'var(--sd-color-status-error, #ef4444)',
    neutral: 'var(--sd-color-text-muted, #6b7280)',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
        border: '1px solid var(--sd-color-border-subtle, #242938)',
        borderRadius: 'var(--sd-radius-lg, 8px)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: 'var(--sd-shadow-sm, 0 1px 2px rgba(0,0,0,0.5))',
        fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--sd-color-text-secondary, #9ca3af)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && <span style={{ color: 'var(--sd-color-accent, #6366f1)' }}>{icon}</span>}
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--sd-color-text-primary, #f3f4f6)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {change && (
        <div style={{ fontSize: 12, fontWeight: 600, color: changeColors[changeType] }}>
          {change}
        </div>
      )}
    </div>
  );
};
