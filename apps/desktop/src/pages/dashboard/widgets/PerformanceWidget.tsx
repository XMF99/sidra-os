import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { MetricWidget } from '../../../components/composite/MetricWidget';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { usePerformanceQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { BarChart3 } from 'lucide-react';

export const PerformanceWidget: FC = () => {
  const { data: perf, isLoading, error } = usePerformanceQuery();

  return (
    <WidgetErrorBoundary widgetName="Performance">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <BarChart3 size={18} style={{ color: 'var(--sd-status-info)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Performance Insights
            </h4>
          </div>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading analytics...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error loading metrics</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--sd-space-3)' }}>
            <MetricWidget
              label="Latency"
              value={`${perf?.medianLatencyMs ?? 0}ms`}
              delta="Median"
              onClick={() => navigate.analytics({ metric: 'latency' })}
            />
            <MetricWidget
              label="Utilization"
              value={`${perf?.agentUtilizationPercent ?? 0}%`}
              delta="Active"
              onClick={() => navigate.analytics({ metric: 'utilization' })}
            />
            <MetricWidget
              label="Spend vs Budget"
              value={`$${perf?.spendUSD ?? 0}`}
              delta={`Cap: $${perf?.budgetUSD ?? 100}`}
              onClick={() => navigate.analytics({ metric: 'spend' })}
            />
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
