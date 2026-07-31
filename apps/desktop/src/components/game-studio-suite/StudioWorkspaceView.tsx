import { FC } from 'react';
import { useGameStudioStore } from '../../state/useGameStudioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const StudioWorkspaceView: FC = () => {
  const { studioHealthScore, sprintProgressPercent, releaseReadinessStatus, dauCount, mauCount, playerRetentionPercent } = useGameStudioStore();

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
              <Heading level={2}>THEKY Game Studio Intelligence Workspace</Heading>
              <Text size="xs" color="muted">AI-Native AAA/AA Game Development Operating System</Text>
            </div>
            <StatusBadge status="success">AI DIRECTOR ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            Consumes certified platform services (Mission Engine, Knowledge Graph, Digital Twin) to orchestrate 38 studio agent roles across complete 14-stage game production pipelines.
          </Text>
        </Stack>
      </Box>

      <Grid columns={4} gap="16px">
        <KPICard
          title="Studio Health Score"
          value={`${studioHealthScore}% Health`}
          change="3 AAA/AA Titles Active"
          changeType="positive"
          icon={<Icon name="Play" />}
        />
        <KPICard
          title="Sprint & Release Progress"
          value={`${sprintProgressPercent}% Complete`}
          change={releaseReadinessStatus}
          changeType="positive"
          icon={<Icon name="CheckCircle" />}
        />
        <KPICard
          title="Live Player Population"
          value={`${(dauCount / 1000000).toFixed(1)}M DAU / ${(mauCount / 1000000).toFixed(1)}M MAU`}
          change="LiveOps Active"
          changeType="positive"
          icon={<Icon name="Users" />}
        />
        <KPICard
          title="D30 Player Retention"
          value={`${playerRetentionPercent}% Retention`}
          change="Top 5% Industry Benchmark"
          changeType="positive"
          icon={<Icon name="TrendingUp" />}
        />
      </Grid>

      <Alert type="success" title="Production & Release Telemetry:">
        Active Production Milestones: <strong>Gold Master Candidate Certified</strong> • 100% of game build artifacts pass automated Vault security and performance checks.
      </Alert>
    </Stack>
  );
};
