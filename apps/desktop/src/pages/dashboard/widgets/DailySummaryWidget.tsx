import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useDailySummaryQuery } from '../../../data/queries';
import { Sparkles } from 'lucide-react';

export const DailySummaryWidget: FC = () => {
  const { data: summary, isLoading } = useDailySummaryQuery();

  return (
    <WidgetErrorBoundary widgetName="Daily Narrative Summary">
      <Card padding="var(--sd-space-4)" style={{ backgroundColor: 'var(--sd-color-bg-surface-raised)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)', marginBottom: 'var(--sd-space-2)' }}>
          <Sparkles size={18} style={{ color: 'var(--sd-color-primary)' }} />
          <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
            Local Daily Summary (Non-Telemetry)
          </h4>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Generating summary...</div>
        ) : (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text)', lineHeight: 'var(--sd-leading-relaxed)' }}>
            {summary?.narrative}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
