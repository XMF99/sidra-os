import { FC } from 'react';
import { useEnterpriseComposerStore } from '../../state/useEnterpriseComposerStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const EnterpriseAnalyticsView: FC = () => {
  const { enterprises } = useEnterpriseComposerStore();
  const currentEnt = enterprises[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Intelligence & Operational Health</Heading>
      <Text color="secondary">
        Real-time telemetry measuring enterprise operational health, AI worker utilization, and cross-department synergies.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Operational Health Score"
          value={`${currentEnt.operationalHealthScore}%`}
          change="Optimal Governance"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="AI Worker Utilization"
          value={`${currentEnt.aiUtilizationPercent}%`}
          change="Hybrid Teams Active"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
        <KPICard
          title="Enterprise Operating Model"
          value={currentEnt.operatingModel}
          change="Cross-Functional Matrix"
          changeType="positive"
          icon={<Icon name="Sliders" />}
        />
      </Grid>

      <Alert type="success" title="Enterprise Intelligence Optimization Recommendations:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          <li>Share 'QA Certification Sub-Agent Bot' across both Engineering and Operations to optimize worker utilization by 15%.</li>
          <li>Enable automatic contract validation for Finance & Revenue Operations to reduce invoice approval latency.</li>
        </ul>
      </Alert>
    </Stack>
  );
};
