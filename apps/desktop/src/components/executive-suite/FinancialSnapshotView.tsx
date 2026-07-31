import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Grid, Heading, Text, KPICard, Alert, Icon } from '@sidra/ui';

export const FinancialSnapshotView: FC = () => {
  const { financials } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Financial Executive Snapshot</Heading>
      <Text color="secondary">
        Real-time financial intelligence displaying ARR, operating expenses, cash runway, gross margin %, and budget adherence.
      </Text>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Annual Recurring Revenue"
          value={`$${financials.revenueArr}M ARR`}
          change="Strong Growth"
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Operating Expenses"
          value={`$${financials.expensesArr}M / yr`}
          change="Under Budget Target"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Gross Margin"
          value={`${financials.grossMarginPercent}%`}
          change="High Efficiency"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="success" title="Financial Forecast & Budget Adherence:">
        Budget adherence stands at {financials.budgetAdherencePercent}% with cash runway projected for {financials.cashRunwayMonths} months at current burn rate.
      </Alert>
    </Stack>
  );
};
