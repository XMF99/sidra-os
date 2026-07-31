import { FC } from 'react';
import { useMarketingGrowthStore } from '../../state/useMarketingGrowthStore';
import { Stack, Box, Heading, Text, Grid, StatusBadge } from '@sidra/ui';

export const MarketingReportingCenterView: FC = () => {
  const { qualifiedLeadsCount, roasMultiplier, marketingRoiPercent } = useMarketingGrowthStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Marketing Reporting & Growth Analytics Center</Heading>
      <Text color="secondary">
        Generates real-time Campaign ROI Statements, Lead Generation Funnels, Brand Sentiment Analytics, and Executive Marketing Reports.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Campaign Yield & Marketing ROI</Heading>
              <StatusBadge status="success">Q3 AUDITED</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Qualified Leads Generated:</span>
                <span><strong>{qualifiedLeadsCount.toLocaleString()} Leads</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Return on Ad Spend (ROAS):</span>
                <span><strong>{roasMultiplier}x ROAS</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Net Marketing ROI:</span>
                <span><strong style={{ color: '#ec4899' }}>+{marketingRoiPercent}% ROI</strong></span>
              </div>
            </div>
          </Stack>
        </Box>

        <Box padding="22px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="14px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading level={4}>Brand Health & Share of Voice</Heading>
              <StatusBadge status="success">DOMINANT BRAND</StatusBadge>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Brand Sentiment Index:</span>
                <span><strong>96% Positive</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Share of Voice (Developer AI Category):</span>
                <span><strong>44% SOV</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e3548', paddingTop: 6 }}>
                <span>Organic Search Growth:</span>
                <span><strong style={{ color: '#34d399' }}>+48% YoY Growth</strong></span>
              </div>
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
