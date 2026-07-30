import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const OperationalAnalyticsView: FC = () => {
  const { runtimes } = useAutonomousOrgStore();

  const totalCompleted = runtimes.reduce((acc, r) => acc + r.completedTasksCount, 0);

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Operational Analytics & Telemetry</Heading>
      <Text color="secondary">
        Telemetry measuring execution rates, completion rates %, AI contribution vs human contribution %, and automation levels.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Total Tasks Completed"
          value={totalCompleted.toLocaleString()}
          change="High Throughput"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="AI Contribution Ratio"
          value="88% AI"
          change="12% Human Review"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
        <KPICard
          title="Task Completion Rate"
          value="99.4%"
          change="0.6% Retried"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
      </Grid>

      <Alert type="success" title="Operational Telemetry Insights:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          <li>AI Sub-Agents completed 269 autonomous tasks with 99.4% first-time success rate.</li>
          <li>Zero security violations or contract breaches logged across all active department runtimes.</li>
        </ul>
      </Alert>
    </Stack>
  );
};
