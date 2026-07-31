import { FC } from 'react';
import { useSalesRevenueStore } from '../../state/useSalesRevenueStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const SalesWorkspaceView: FC = () => {
  const { pipelineValueArr, bookingsArr, forecastAccuracyPercent, quotaAttainmentPercent, conversionRatePercent, revenueHealthScore } = useSalesRevenueStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(234, 179, 8, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(234, 179, 8, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Sales & Revenue Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Revenue Operating Environment</Text>
            </div>
            <StatusBadge status="success">AI CRO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to optimize opportunity pipelines, contract execution, and quota attainment.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Active Revenue Pipeline"
          value={`$${pipelineValueArr}M ARR`}
          change="Strong Coverage"
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Closed Bookings ARR"
          value={`$${bookingsArr}M Bookings`}
          change="On Track for Target"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Quota Attainment"
          value={`${quotaAttainmentPercent}% Attainment`}
          change="Surpassing Quota"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Revenue Health Score"
          value={`${revenueHealthScore}% Health`}
          change={`${forecastAccuracyPercent}% Forecast Accuracy`}
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="success" title="Sales Velocity & Quota Attainment Overview:">
        Deal Conversion Rate verified at {conversionRatePercent}% with forecast accuracy score standing at {forecastAccuracyPercent}%.
      </Alert>
    </Stack>
  );
};
