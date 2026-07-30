import { FC } from 'react';
import { useCapabilityIntelligenceStore } from '../../state/useCapabilityIntelligenceStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const CapabilityAnalyticsView: FC = () => {
  const { capabilities } = useCapabilityIntelligenceStore();

  const totalExecs = capabilities.reduce((acc, c) => acc + c.executionCount, 0);
  const avgSuccess = (capabilities.reduce((acc, c) => acc + c.successRate, 0) / (capabilities.length || 1)).toFixed(1);

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Capability Intelligence & Performance Analytics</Heading>
      <Text color="secondary">
        Real-time telemetry tracking capability executions, success rate %, and proactive optimization recommendations.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Total Capability Executions"
          value={totalExecs.toLocaleString()}
          change="Optimal Activity"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="Average Success Rate"
          value={`${avgSuccess}%`}
          change="99%+ Target Met"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Active Capabilities"
          value={`${capabilities.length} Capabilities`}
          change="Reusable Assets"
          changeType="positive"
          icon={<Icon name="Sliders" />}
        />
      </Grid>

      <Alert type="success" title="Capability Intelligence Proactive Recommendations:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          <li>Publish 'Omni-Channel Marketing Campaign' to the Org Library for cross-team sharing.</li>
          <li>Combine 'Game Studio Master Pipeline' with 'Automated Invoice Processing' for automated asset licensing.</li>
        </ul>
      </Alert>
    </Stack>
  );
};
