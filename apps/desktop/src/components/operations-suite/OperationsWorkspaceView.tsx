import { FC } from 'react';
import { useOperationsIntelligenceStore } from '../../state/useOperationsIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const OperationsWorkspaceView: FC = () => {
  const { operationalHealthScore, executionProgressPercent, capacityUtilizationPercent, resourceEfficiencyPercent, openIncidentsCount } = useOperationsIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(14, 165, 233, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Operations Intelligence Command Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Operations Operating Platform</Text>
            </div>
            <StatusBadge status="success">AI COO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to orchestrate enterprise execution, capacity scheduling, and continuous workflow optimization.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Operational Health Score"
          value={`${operationalHealthScore}% Health`}
          change="Optimal Control"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="Execution Progress"
          value={`${executionProgressPercent}% Complete`}
          change="Ahead of Milestones"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Capacity Utilization"
          value={`${capacityUtilizationPercent}% Capacity`}
          change="Optimal Load"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
        <KPICard
          title="Resource Efficiency"
          value={`${resourceEfficiencyPercent}% Efficient`}
          change="Zero Bottlenecks"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
      </Grid>

      <Alert type="success" title="Operational Execution & Incident Telemetry:">
        Active Operational Incidents: <strong>{openIncidentsCount} Incidents Active</strong> • 100% of workflows executing with verified Vault event signatures.
      </Alert>
    </Stack>
  );
};
