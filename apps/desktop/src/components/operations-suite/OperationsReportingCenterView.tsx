import { FC } from 'react';
import { useOperationsIntelligenceStore } from '../../state/useOperationsIntelligenceStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const OperationsReportingCenterView: FC = () => {
  const { executionProgressPercent, capacityUtilizationPercent, resourceEfficiencyPercent } = useOperationsIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Operations Reporting & Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Operations Statements, Execution Reports, Capacity Utilization Analytics, and Executive Operations Dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Execution Throughput & Efficiency</Heading>
              <StatusBadge status="success">Q3 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Execution Milestone Progress:</span>
                <span><strong>{executionProgressPercent}% Complete</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resource Efficiency Index:</span>
                <span><strong>{resourceEfficiencyPercent}% Efficient</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Workflow Cycle Time Reduction:</span>
                <span><strong style={{ color: '#38bdf8' }}>-35% Cycle Time</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Capacity Utilization & SLA Security</Heading>
              <StatusBadge status="success">BALANCED LOAD</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Capacity Load:</span>
                <span><strong>{capacityUtilizationPercent}% Load</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Operational Incident Count:</span>
                <span><strong>0 Incidents Active</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Enterprise SLA Uptime:</span>
                <span><strong style={{ color: '#34d399' }}>99.99% Uptime</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
