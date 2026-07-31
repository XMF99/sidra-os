import { FC } from 'react';
import { useExecutiveSuiteStore } from '../../state/useExecutiveSuiteStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const ExecutiveWorkspaceView: FC = () => {
  const { financials } = useExecutiveSuiteStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Executive Workspace & CEO Command Surface ⭐</Heading>
              <Text size="xs" color="muted">Enterprise-Wide Strategic Awareness & Executive Intelligence</Text>
            </div>
            <StatusBadge status="success">EXECUTIVE SUITE ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Primary operating environment for CEOs, founders, and enterprise leadership teams. Consumes platform services directly.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Annual Recurring Revenue"
          value={`$${financials.revenueArr}M ARR`}
          change="+24% YoY Growth"
          changeType="positive"
          icon={<Icon name="DollarSign" />}
        />
        <KPICard
          title="Cash Runway"
          value={`${financials.cashRunwayMonths} Months`}
          change="Strong Liquidity"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Enterprise Health Score"
          value="98% Health"
          change="Optimal Runtime"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="Workflow Automation"
          value="88% Autonomy"
          change="Hybrid Teams Active"
          changeType="positive"
          icon={<Icon name="Cpu" />}
        />
      </Grid>

      <Alert type="info" title="Executive Strategic Priorities (OKRs):">
        <ol style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
          <li>Scale Game Studio Enterprise Solution across global publishing spaces.</li>
          <li>Maintain 98%+ enterprise health and 100% Digital Twin sandbox isolation.</li>
          <li>Sustain $12.4M ARR with 78% gross margin.</li>
        </ol>
      </Alert>
    </Stack>
  );
};
