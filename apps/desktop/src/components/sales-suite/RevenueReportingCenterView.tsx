import { FC } from 'react';
import { useSalesRevenueStore } from '../../state/useSalesRevenueStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const RevenueReportingCenterView: FC = () => {
  const { bookingsArr, quotaAttainmentPercent, forecastAccuracyPercent } = useSalesRevenueStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Revenue Reporting & Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Sales Reports, Bookings Statements, Forecast Accuracy Metrics, and Quota Attainment Dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Bookings & Revenue Attainment</Heading>
              <StatusBadge status="success">Q3 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Closed Bookings ARR:</span>
                <span><strong>${bookingsArr}M ARR</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sales Quota Attainment:</span>
                <span><strong>{quotaAttainmentPercent}% Attainment</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Pipeline Coverage Multiplier:</span>
                <span><strong style={{ color: '#34d399' }}>3.8x Target Coverage</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Revenue Forecast Precision</Heading>
              <StatusBadge status="success">HIGH PRECISION</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Forecast Accuracy Score:</span>
                <span><strong>{forecastAccuracyPercent}% Precision</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Win Rate Average:</span>
                <span><strong>42.0% Win Rate</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Gross Revenue Growth Rate:</span>
                <span><strong style={{ color: '#eab308' }}>+28% YoY Growth</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
