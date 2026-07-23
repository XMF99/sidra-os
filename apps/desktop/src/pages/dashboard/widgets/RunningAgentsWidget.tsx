import { FC } from 'react';
import { Card } from '../../../components/composite/Card';
import { AgentCard } from '../../../components/domain/AgentCard';
import { WidgetErrorBoundary } from '../../../app/boundaries/WidgetErrorBoundary';
import { useAgentsQuery } from '../../../data/queries';
import { navigate } from '../../../routes/navigate';
import { Bot, ArrowRight } from 'lucide-react';

export const RunningAgentsWidget: FC = () => {
  const { data: agents, isLoading, error } = useAgentsQuery();
  const activeAgents = (agents || []).filter((a) => a.status === 'active');

  return (
    <WidgetErrorBoundary widgetName="Running Agents">
      <Card padding="var(--sd-space-4)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sd-space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <Bot size={18} style={{ color: 'var(--sd-status-success)' }} />
            <h4 style={{ margin: 0, fontSize: 'var(--sd-font-size-md)', fontWeight: 'var(--sd-font-weight-semibold)' }}>
              Active Agents ({activeAgents.length})
            </h4>
          </div>
          <button
            onClick={() => navigate.agents({ filter: 'active' })}
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
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>Loading active agents...</div>
        ) : error ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-status-danger)' }}>Error loading agents</div>
        ) : activeAgents.length === 0 ? (
          <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>No agents active right now.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sd-space-3)' }}>
            {activeAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </Card>
    </WidgetErrorBoundary>
  );
};
