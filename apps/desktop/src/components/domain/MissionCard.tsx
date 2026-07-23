import { FC } from 'react';
import { Card } from '../composite/Card';
import { StatusBadge } from '../composite/StatusBadge';
import { navigate } from '../../routes/navigate';

export interface MissionSummaryDTO {
  id: string;
  title: string;
  department: string;
  status: string;
  progressPercent: number;
}

export interface MissionCardProps {
  mission: MissionSummaryDTO;
}

export const MissionCard: FC<MissionCardProps> = ({ mission }) => {
  return (
    <Card
      interactive
      onClick={() => navigate.missionDetail(mission.id)}
      padding="var(--sd-space-4)"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-2)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--sd-font-size-xs)', fontFamily: 'var(--sd-font-mono)', color: 'var(--sd-color-text-subtle)' }}>
          {mission.id}
        </span>
        <StatusBadge status={mission.status} />
      </div>
      <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', color: 'var(--sd-color-text)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
        {mission.title}
      </h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)', marginTop: 'var(--sd-space-1)' }}>
        <span>Dept: {mission.department}</span>
        <span>{mission.progressPercent}%</span>
      </div>
    </Card>
  );
};
