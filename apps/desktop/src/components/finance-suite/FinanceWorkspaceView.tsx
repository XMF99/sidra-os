import { FC } from 'react';
import { useFinanceIntelligenceStore } from '../../state/useFinanceIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const FinanceWorkspaceView: FC = () => {
  const { cashPositionArr, expensesArr, cashRunwayMonths, grossMarginPercent, budgetAdherencePercent, financialHealthScore } = useFinanceIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(16, 185, 129, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Finance Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Financial Operating Environment</Text>
            </div>
            <StatusBadge status="success">AI CFO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to deliver explainability, real-time auditability, and Digital Twin scenario simulations.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Cash Position & ARR"
          value={`$${cashPositionArr}M ARR`}
          change="Strong Liquidity"
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Operating Expenses"
          value={`$${expensesArr}M / yr`}
          change="Under Budget"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Cash Runway"
          value={`${cashRunwayMonths} Months`}
          change="Solvent Runway"
          changeType="positive"
          icon={<Icon name="Clock" />}
        />
        <KPICard
          title="Financial Health Score"
          value={`${financialHealthScore}% Health`}
          change="Optimal Control"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="success" title="Financial Performance & Budget Adherence Overview:">
        Gross margins stand at {grossMarginPercent}% with budget adherence verified at {budgetAdherencePercent}%. All transactions logged in SHA-256 Vault Event Index.
      </Alert>
    </Stack>
  );
};
