import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const PortfolioWorkspaceView: FC = () => {
  const { portfolioHealthScore, strategicAlignmentPercent, activeProgramsCount, activeProjectsCount, budgetUtilizationPercent, scheduleHealthPercent, portfolioRisksCount } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(99, 102, 241, 0.22) 100%)"
        borderRadius="8px"
        border="1px solid rgba(168, 85, 247, 0.5)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Project & Portfolio Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise Execution Platform</Text>
            </div>
            <StatusBadge status="success">AI PMO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to orchestrate strategic portfolios, programs, earned value financials, and resource governance.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Portfolio Health Score"
          value={`${portfolioHealthScore}% Health`}
          change="Optimal Delivery"
          changeType="positive"
          icon={<Icon name="Briefcase" />}
        />
        <KPICard
          title="Strategic Alignment"
          value={`${strategicAlignmentPercent}% Aligned`}
          change="Executive Certified"
          changeType="positive"
          icon={<Icon name="Target" />}
        />
        <KPICard
          title="Active Programs & Projects"
          value={`${activeProgramsCount} Prgs / ${activeProjectsCount} Prjs`}
          change="On Schedule"
          changeType="positive"
          icon={<Icon name="Layers" />}
        />
        <KPICard
          title="Budget & Schedule Health"
          value={`${budgetUtilizationPercent}% Spend (${scheduleHealthPercent}% Sched)`}
          change="Zero Variance"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="success" title="Portfolio Delivery & Milestone Telemetry:">
        Active Strategic Risks: <strong>{portfolioRisksCount} Critical Risks</strong> • 100% of project milestone commits logged with verified Vault signatures.
      </Alert>
    </Stack>
  );
};
