import { FC } from 'react';
import { useSupplyChainStore } from '../../state/useSupplyChainStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const SupplyChainReportingCenterView: FC = () => {
  const { inventoryHealthScore, supplierOnTimeRatePercent, fulfillmentVelocityPercent, demandForecastAccuracyPercent } = useSupplyChainStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Supply Chain Reporting & Procurement Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Inventory Statements, Supplier Performance Scorecards, Procurement Cost Analytics, and Executive Supply Dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Inventory Health & Turn Velocity</Heading>
              <StatusBadge status="success">Q3 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inventory Health Score:</span>
                <span><strong>{inventoryHealthScore}% Health</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fulfillment Velocity:</span>
                <span><strong>{fulfillmentVelocityPercent}% Velocity</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Annualized Inventory Turns:</span>
                <span><strong style={{ color: '#10b981' }}>12.4 Turns / Year</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Supplier On-Time & Forecast Accuracy</Heading>
              <StatusBadge status="success">HIGH ACCURACY</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Supplier On-Time Delivery Rate:</span>
                <span><strong>{supplierOnTimeRatePercent}% On-Time</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Demand Forecast Accuracy:</span>
                <span><strong>{demandForecastAccuracyPercent}% Accuracy</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Net Procurement Cost Reduction:</span>
                <span><strong style={{ color: '#38bdf8' }}>-12.8% Savings</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
