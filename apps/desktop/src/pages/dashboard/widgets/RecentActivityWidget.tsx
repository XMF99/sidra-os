import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { EventRow } from '../../../components/domain/EventRow';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useEventLogQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { ScrollText, ArrowRight } from 'lucide-react';

export const RecentActivityWidget: FC = () => {
  const { data: events, isLoading, error } = useEventLogQuery();

  return (
    <WidgetErrorBoundary widgetName="Recent Activity">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <ScrollText size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Recent Activity Feed
            </h4>
          </div>
          <button
            onClick={() => navigate.events()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-primary)',
              cursor: 'pointer',
              fontSize: 'var(--sd-font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            Open Event Log <ArrowRight size={12} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading event feed...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error reading events</div>
        ) : !events || events.length === 0 ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>No recent events recorded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-2)' }}>
            {events.slice(0, 5).map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onFollowCorrelation={(correlationId) => navigate.events({ correlation: correlationId })}
              />
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
