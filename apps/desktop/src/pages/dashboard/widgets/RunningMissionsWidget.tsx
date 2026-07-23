import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { MissionCard } from '../../../components/domain/MissionCard';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useMissionsQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { Crosshair, ArrowRight } from 'lucide-react';

export const RunningMissionsWidget: FC = () => {
  const { data: missions, isLoading, error } = useMissionsQuery();
  const runningMissions = (missions || []).filter((m) => m.status === 'running');

  return (
    <WidgetErrorBoundary widgetName="Running Missions">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <Crosshair size={18} style={{ color: 'var(--sd-color-primary)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Running Missions ({runningMissions.length})
            </h4>
          </div>
          <button
            onClick={() => navigate.missions({ filter: 'running' })}
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
            See All <ArrowRight size={12} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading running missions...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error loading missions</div>
        ) : runningMissions.length === 0 ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>No missions currently running.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-3)' }}>
            {runningMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
