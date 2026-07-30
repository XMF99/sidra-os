import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { Stack, Grid, Box, Heading, Text, Button, KPICard, StatusBadge, Icon } from '@sidra/ui';

export const AIWorkspaceHome: FC = () => {
  const { setActiveSubTab, missions, decisions } = useAIWorkspaceStore();

  const pendingDecisions = decisions.filter((d) => d.status === 'pending');
  const activeMissions = missions.filter((m) => m.status === 'in_progress');

  return (
    <Stack gap="var(--sd-space-6, 24px)" style={{ padding: 24 }}>
      {/* Executive Welcome Banner */}
      <Box
        padding="24px"
        borderRadius="var(--sd-radius-lg, 8px)"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)"
        border="1px solid rgba(99, 102, 241, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading level={2}>Executive Intelligence Platform</Heading>
            <StatusBadge status="active">System Status: Operational</StatusBadge>
          </div>
          <Text color="secondary" size="md">
            Sovereign multi-agent orchestration, event-sourced decision auditing, and vector knowledge memory.
          </Text>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button
              variant="primary"
              leftIcon={<Icon name="MessageSquare" size={16} />}
              onClick={() => setActiveSubTab('conversations')}
            >
              Start New Conversation
            </Button>
            <Button
              variant="secondary"
              leftIcon={<Icon name="Target" size={16} />}
              onClick={() => setActiveSubTab('missions')}
            >
              Create Mission
            </Button>
          </div>
        </Stack>
      </Box>

      {/* KPI Cards Grid */}
      <Grid columns={4} gap="16px">
        <KPICard title="Active Missions" value={activeMissions.length} change="+1 this week" changeType="positive" icon={<Icon name="Target" />} />
        <KPICard title="Pending Decisions" value={pendingDecisions.length} change="Action Required" changeType="negative" icon={<Icon name="ShieldCheck" />} />
        <KPICard title="Active AI Agents" value="3 Running" change="All Healthy" changeType="positive" icon={<Icon name="Cpu" />} />
        <KPICard title="Vector Knowledge" value="10,240 Embeddings" change="sqlite-vec" changeType="neutral" icon={<Icon name="Database" />} />
      </Grid>

      {/* Quick AI Command Actions */}
      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="16px">
          <Heading level={4}>Suggested Quick Actions</Heading>
          <Grid columns={3} gap="12px">
            <Button
              variant="outline"
              leftIcon={<Icon name="FileText" size={16} />}
              onClick={() => setActiveSubTab('decisions')}
              style={{ justifyContent: 'flex-start' }}
            >
              Review Pending Executive Decisions ({pendingDecisions.length})
            </Button>
            <Button
              variant="outline"
              leftIcon={<Icon name="Search" size={16} />}
              onClick={() => setActiveSubTab('knowledge')}
              style={{ justifyContent: 'flex-start' }}
            >
              Search Vector Vault Knowledge Base
            </Button>
            <Button
              variant="outline"
              leftIcon={<Icon name="Sliders" size={16} />}
              onClick={() => setActiveSubTab('models')}
              style={{ justifyContent: 'flex-start' }}
            >
              Configure Local Ollama / Cloud Providers
            </Button>
          </Grid>
        </Stack>
      </Box>
    </Stack>
  );
};
