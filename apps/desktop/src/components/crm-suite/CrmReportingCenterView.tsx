import { FC } from 'react';
import { useCustomerIntelligenceStore } from '../../state/useCustomerIntelligenceStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const CrmReportingCenterView: FC = () => {
  const { pipelineValueArr, csatScorePercent, netRetentionRatePercent } = useCustomerIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>CRM Reporting & Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Pipeline Reports, Revenue by Segment Analytics, CSAT Trends, and Executive CRM Reports.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Sales Pipeline & Forecast</Heading>
              <StatusBadge status="success">Q3 FORECAST</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Weighted Pipeline Value:</span>
                <span><strong>${pipelineValueArr}M</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Win Probability:</span>
                <span><strong>88.5%</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Projected Closed ARR:</span>
                <span><strong style={{ color: '#34d399' }}>+$16.4M ARR</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Customer Retention & CSAT Index</Heading>
              <StatusBadge status="success">EXCELLENT</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer Satisfaction (CSAT):</span>
                <span><strong>{csatScorePercent}% CSAT</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Net Retention Rate (NRR):</span>
                <span><strong>{netRetentionRatePercent}% NRR</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Gross Churn Rate:</span>
                <span><strong style={{ color: '#34d399' }}>0.0% (Zero Churn)</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
