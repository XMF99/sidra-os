import { FC } from 'react';
import { useMarketingGrowthStore } from '../../state/useMarketingGrowthStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const MarketingWorkspaceView: FC = () => {
  const { qualifiedLeadsCount, cacAmount, roasMultiplier, marketingRoiPercent, marketingHealthScore } = useMarketingGrowthStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(236, 72, 153, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Marketing & Growth Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Growth Operating Environment</Text>
            </div>
            <StatusBadge status="success">AI CMO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to orchestrate campaigns, lead generation, and multi-channel attribution.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Qualified Leads Generated"
          value={`${qualifiedLeadsCount.toLocaleString()} Leads`}
          change="Routed to CRM"
          changeType="positive"
          icon={<Icon name="Target" />}
        />
        <KPICard
          title="Customer Acquisition Cost"
          value={`$${cacAmount.toLocaleString()} CAC`}
          change="22% Below Target"
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Return on Ad Spend"
          value={`${roasMultiplier}x ROAS`}
          change="High Campaign Yield"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Marketing Health Score"
          value={`${marketingHealthScore}% Health`}
          change={`${marketingRoiPercent}% Marketing ROI`}
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="info" title="Marketing Growth & Lead Generation Alerts:">
        Active Campaigns: <strong>2 High-Yield Campaigns Live</strong> • 1,240 qualified leads auto-routed into the CRM & Sales Intelligence Suites.
      </Alert>
    </Stack>
  );
};
