import { FC } from 'react';
import { Card } from '../composite/Card';
import { Avatar } from '../primitives/Avatar';
import { StatusBadge } from '../composite/StatusBadge';
import { navigate } from '../../routes/navigate';

export interface AgentSummaryDTO {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'idle' | 'offline';
  currentMissionId?: string;
}

export interface AgentCardProps {
  agent: AgentSummaryDTO;
}

export const AgentCard: FC<AgentCardProps> = ({ agent }) => {
  return (
    <Card
      interactive
      onClick={() => navigate.agentDetail(agent.id)}
      padding="var(--sd-space-4)"
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)' }}
    >
      <Avatar name={agent.name} status={agent.status} size="lg" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--sd-font-size-sm)', fontWeight: 'var(--sd-font-weight-semibold)', color: 'var(--sd-color-text)' }}>
            {agent.name}
          </span>
          <StatusBadge status={agent.status} />
        </div>
        <span style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>
          {agent.role} · {agent.department}
        </span>
      </div>
    </Card>
  );
};
