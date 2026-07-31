import { FC } from 'react';
import { useCustomerIntelligenceStore } from '../../state/useCustomerIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const CustomerWorkspaceView: FC = () => {
  const { pipelineValueArr, openOpportunitiesCount, customerHealthScore, csatScorePercent, netRetentionRatePercent } = useCustomerIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(59, 130, 246, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Customer Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Customer Operating Environment</Text>
            </div>
            <StatusBadge status="success">AI CCO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to optimize sales pipelines, customer success, and SLA compliance.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Active Sales Pipeline"
          value={`$${pipelineValueArr}M Value`}
          change={`${openOpportunitiesCount} Open Deals`}
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Customer Health Score"
          value={`${customerHealthScore}% Health`}
          change="Zero Churn Risk"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="Customer CSAT Score"
          value={`${csatScorePercent}% CSAT`}
          change="100% SLA Met"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Net Retention Rate"
          value={`${netRetentionRatePercent}% NRR`}
          change="Strong Expansion"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
      </Grid>

      <Alert type="info" title="Customer Intelligence & Strategic Growth Alerts:">
        Active Enterprise Deals: <strong>{openOpportunitiesCount} Opportunities Active</strong> • Net Retention Rate verified at {netRetentionRatePercent}% with 0 high-risk account warnings.
      </Alert>
    </Stack>
  );
};
