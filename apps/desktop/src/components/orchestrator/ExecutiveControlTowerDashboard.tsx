import { FC } from 'react';
import { useExecutiveOrchestratorStore } from '../../state/useExecutiveOrchestratorStore';
import { Grid, Box, Heading, Text, KPICard, StatusBadge, Icon } from '@sidra/ui';

export const ExecutiveControlTowerDashboard: FC = () => {
  const { controlTowerMetrics, activePolicyLevel } = useExecutiveOrchestratorStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.18) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.4)"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Heading level={2}>Executive Control Tower ⭐</Heading>
            <Text size="xs" color="muted">Governance Policy: <strong>{activePolicyLevel} Execution</strong></Text>
          </div>
          <StatusBadge status="success">REAL-TIME ORCHESTRATION ACTIVE</StatusBadge>
        </div>
      </Box>

      {/* Real-time KPIs */}
      <Grid columns={4} gap="16px">
        <KPICard title="Organization Health" value={`${controlTowerMetrics.orgHealthScore}%`} change="Optimal" changeType="positive" icon={<Icon name="Activity" />} />
        <KPICard title="Active Executions" value={`${controlTowerMetrics.activeExecutionsCount} Running`} change="0 Blocked" changeType="positive" icon={<Icon name="PlayCircle" />} />
        <KPICard title="Pending Approvals" value={`${controlTowerMetrics.pendingApprovalsCount} Waiting`} change="Human Approval Required" changeType="neutral" icon={<Icon name="Lock" />} />
        <KPICard title="AI Workload Capacity" value={`${controlTowerMetrics.aiCapacityUsage}%`} change="Balanced Load" changeType="positive" icon={<Icon name="Cpu" />} />
      </Grid>
    </div>
  );
};
