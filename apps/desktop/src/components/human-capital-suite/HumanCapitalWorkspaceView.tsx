import { FC } from 'react';
import { useHumanCapitalStore } from '../../state/useHumanCapitalStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const HumanCapitalWorkspaceView: FC = () => {
  const { headcountHuman, headcountAi, openRequisitionsCount, retentionRatePercent, engagementScorePercent, workforceHealthScore } = useHumanCapitalStore();

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
              <Heading level={2}>Human Capital Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-First Enterprise People & Workforce Operating Environment</Text>
            </div>
            <StatusBadge status="success">AI CHRO ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services to orchestrate hybrid human-AI teams across the complete employee lifecycle.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Hybrid Workforce Headcount"
          value={`${headcountHuman} Staff + ${headcountAi} AI`}
          change="Hybrid Teams Operational"
          changeType="positive"
          icon={<Icon name="Users" />}
        />
        <KPICard
          title="Retention Rate"
          value={`${retentionRatePercent}% Retention`}
          change="High Talent Stability"
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Engagement Score"
          value={`${engagementScorePercent}% Score`}
          change="Strong Culture Index"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
        <KPICard
          title="Workforce Health Score"
          value={`${workforceHealthScore}% Health`}
          change="Optimal Workload"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
      </Grid>

      <Alert type="info" title="Active Talent Requisitions & Workforce Alerts:">
        Open Job Requisitions: <strong>{openRequisitionsCount} Positions Active</strong> • Zero critical retention risks detected across departments.
      </Alert>
    </Stack>
  );
};
