import { FC } from 'react';
import { useBusinessSolutionStore } from '../../state/useBusinessSolutionStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const BusinessImpactAnalyticsView: FC = () => {
  const { solutions } = useBusinessSolutionStore();

  const avgRoi = (solutions.reduce((acc, s) => acc + s.roiEstimateRatio, 0) / (solutions.length || 1)).toFixed(1);
  const avgAutomation = (solutions.reduce((acc, s) => acc + s.automationLevelPercent, 0) / (solutions.length || 1)).toFixed(0);
  const totalSavedHours = solutions.reduce((acc, s) => acc + s.timeSavingsHoursPerWeek, 0);

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Business Impact Analysis & AI Architect ⭐</Heading>
      <Text color="secondary">
        Telemetry calculating estimated ROI ratio, workflow automation level %, cost reduction, and AI architect recommendations.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Estimated ROI Ratio"
          value={`${avgRoi}x ROI`}
          change="High Return Target"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Workflow Automation Level"
          value={`${avgAutomation}%`}
          change="Autonomous Execution"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
        <KPICard
          title="Weekly Time Saved"
          value={`${totalSavedHours} Hours`}
          change="Operational Savings"
          changeType="positive"
          icon={<Icon name="Clock" />}
        />
      </Grid>

      <Alert type="success" title="AI Solution Architect Recommendations:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          <li>Combine 'Game Studio Operating Solution' with 'Unified Enterprise ERP Solution' to automate revenue distribution.</li>
          <li>Enable automatic digital contract authorization for internal Space-level drafts to reduce approval latency by 40%.</li>
        </ul>
      </Alert>
    </Stack>
  );
};
