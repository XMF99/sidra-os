import { FC, ReactNode } from 'react';
import { Card } from './Card';
import { Skeleton } from '../primitives/Skeleton';

export interface MetricWidgetProps {
  label: string;
  value?: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  state?: 'loading' | 'empty' | 'error' | 'ready' | 'degraded';
  onClick?: () => void;
}

export const MetricWidget: FC<MetricWidgetProps> = ({
  label,
  value,
  delta,
  trend = 'neutral',
  icon,
  state = 'ready',
  onClick,
}) => {
  if (state === 'loading') {
    return (
      <Card padding="var(--sd-space-4)">
        <Skeleton width="40%" height="14px" />
        <div style={{ marginTop: 'var(--sd-space-2)' }}>
          <Skeleton width="60%" height="28px" />
        </div>
      </Card>
    );
  }

  const trendColors = {
    up: 'var(--sd-status-success)',
    down: 'var(--sd-status-danger)',
    neutral: 'var(--sd-color-text-muted)',
  };

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      padding="var(--sd-space-4)"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-1)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--sd-font-size-xs)', fontWeight: 'var(--sd-font-weight-medium)', color: 'var(--sd-color-text-muted)' }}>
          {label}
        </span>
        {icon && <div style={{ color: 'var(--sd-color-primary)' }}>{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sd-space-2)', marginTop: 'var(--sd-space-1)' }}>
        <span style={{ fontSize: 'var(--sd-font-size-2xl)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-color-text)' }}>
          {state === 'degraded' ? 'N/A' : value ?? 0}
        </span>
        {delta && (
          <span style={{ fontSize: 'var(--sd-font-size-xs)', fontWeight: 'var(--sd-font-weight-medium)', color: trendColors[trend] }}>
            {delta}
          </span>
        )}
      </div>
      {state === 'degraded' && (
        <span style={{ fontSize: '11px', color: 'var(--sd-color-text-subtle)' }}>
          Read model degraded in current build
        </span>
      )}
    </Card>
  );
};
