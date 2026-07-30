import { FC } from 'react';
import { useAiEcosystemStore } from '../../state/useAiEcosystemStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const CostIntelligenceDashboard: FC = () => {
  const { costMetrics } = useAiEcosystemStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Cost Intelligence & Governance Dashboard</Heading>
      <Text color="secondary">
        Monitors token usage, provider requests, monthly cost ceilings, and automated optimization proposals.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Total Tokens Processed"
          value={costMetrics.totalTokensUsed.toLocaleString()}
          change="Optimal Throughput"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
        <KPICard
          title="Current Period Cost"
          value={`$${costMetrics.totalCostUsd.toFixed(2)}`}
          change={`Budget Ceiling: $${costMetrics.monthlyBudgetUsd.toFixed(2)}`}
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Cost Savings Rating"
          value="45% Savings"
          change="Local Edge Routing Active"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
      </Grid>

      <Alert type="success" title="Cost Optimization Recommendations:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          {costMetrics.activeOptimizationAlerts.map((alert, idx) => (
            <li key={idx}>{alert}</li>
          ))}
        </ul>
      </Alert>
    </Stack>
  );
};
