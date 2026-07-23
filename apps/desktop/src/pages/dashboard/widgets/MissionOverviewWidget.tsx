import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useMissionsQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { PieChart } from 'lucide-react';

export const MissionOverviewWidget: FC = () => {
  const { data: missions } = useMissionsQuery();

  const counts = {
    running: (missions || []).filter((m) => m.status === 'running').length,
    awaiting: (missions || []).filter((m) => m.status === 'awaiting_approval').length,
    completed: (missions || []).filter((m) => m.status === 'completed').length,
  };

  return (
    <WidgetErrorBoundary widgetName="Mission Portfolio Overview">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <PieChart size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Mission Portfolio Status
            </h4>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sd-space-2)' }}>
          <div
            onClick={() => navigate.missions({ filter: 'running' })}
            style={{
              padding: 'var(--sd-space-2)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-status-success-bg)',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 'var(--sd-font-size-xl)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-status-success)' }}>
              {counts.running}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted)' }}>Running</div>
          </div>

          <div
            onClick={() => navigate.missions({ filter: 'awaiting_approval' })}
            style={{
              padding: 'var(--sd-space-2)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-status-warning-bg)',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 'var(--sd-font-size-xl)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-status-warning)' }}>
              {counts.awaiting}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted)' }}>Awaiting Approval</div>
          </div>

          <div
            onClick={() => navigate.missions({ filter: 'completed' })}
            style={{
              padding: 'var(--sd-space-2)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-color-bg-inset)',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 'var(--sd-font-size-xl)', fontWeight: 'var(--sd-font-weight-bold)', color: 'var(--sd-color-text)' }}>
              {counts.completed}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted)' }}>Completed</div>
          </div>
        </div>
      </Card>
    </WidgetErrorBoundary>
  );
};
