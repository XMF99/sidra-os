import { FC, useEffect } from 'react';
import { useContextEngineStore } from '../../state/useContextEngineStore';
import { Stack, Grid, Box, Heading, Text, KPICard, StatusBadge, Alert, Button, Icon } from '@sidra/ui';

export const ProjectCommandCenterPage: FC = () => {
  const { setContextScope, activeProjectName, activeSpaceType } = useContextEngineStore();

  useEffect(() => {
    setContextScope({
      projectId: 'prj-alpha',
      projectName: 'Sidra Kernel Optimization Project',
    });
  }, [setContextScope]);

  return (
    <Stack gap="24px" style={{ padding: 24 }}>
      {/* Project Header Bar */}
      <Box
        padding="24px"
        bg="var(--sd-color-surface-raised, #12151e)"
        borderRadius="8px"
        border="1px solid var(--sd-color-border-subtle, #242938)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>{activeProjectName}</Heading>
              <Text size="xs" color="muted">Space Scope: <strong>{activeSpaceType} Space</strong> • Security Baseline: Sovereign</Text>
            </div>
            <StatusBadge status="success">PROJECT HEALTH: 96% OPTIMAL</StatusBadge>
          </div>
          <Text color="secondary">
            Operational Command Center orchestrating Tokio kernel IPC throughput, memory isolation boundaries, and vault hash-chain verifications.
          </Text>
        </Stack>
      </Box>

      {/* Project KPIs Grid */}
      <Grid columns={4} gap="16px">
        <KPICard title="Project Health" value="96%" change="Optimal" changeType="positive" icon={<Icon name="Activity" />} />
        <KPICard title="Active Missions" value="3 Running" change="DAG Progress 75%" changeType="positive" icon={<Icon name="Target" />} />
        <KPICard title="Pending Decisions" value="0 Blockers" change="Clear Execution" changeType="positive" icon={<Icon name="CheckCircle" />} />
        <KPICard title="Sub-Agent Activity" value="2 Agents Active" change="Tokens: 1,420" changeType="neutral" icon={<Icon name="Cpu" />} />
      </Grid>

      {/* Smart Proactive Recommendations & Risk Panel */}
      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>THEKY Smart Recommendations</Heading>
            <Alert type="info" title="Recommended Next Mission:">
              Rehearse forward-only SQLite Vault projection rebuild to verify 10k event state integrity.
            </Alert>
            <Alert type="success" title="Suggested Capability Expansion:">
              Install Developer Telemetry Console pack for real-time memory profiling.
            </Alert>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Recent Project Activity & Knowledge</Heading>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              <div style={{ marginBottom: 8 }}>📄 <strong>ADR-0014:</strong> Tokio Multi-Threaded Executor Architecture</div>
              <div style={{ marginBottom: 8 }}>🛡️ <strong>Vault Audit:</strong> SHA-256 state hash verified up to sequence 10,000</div>
              <div>🤖 <strong>Sub-Agent Log:</strong> Security Reviewer Agent approved capability tokens</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="ArrowRight" size={14} />}
              onClick={() => { window.location.hash = '#/console'; }}
            >
              Ask THEKY About This Project
            </Button>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
