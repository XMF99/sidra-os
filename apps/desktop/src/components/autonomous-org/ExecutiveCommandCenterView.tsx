import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, KPICard, Alert, Icon } from '@sidra/ui';

export const ExecutiveCommandCenterView: FC = () => {
  const { runtimes, workforce, briefings } = useAutonomousOrgStore();

  const totalTasks = runtimes.reduce((acc, r) => acc + r.activeTasksCount, 0);
  const avgHealth = (runtimes.reduce((acc, r) => acc + r.healthScore, 0) / (runtimes.length || 1)).toFixed(0);
  const latestBriefing = briefings[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.4)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Executive Command Center Dashboard ⭐</Heading>
              <Text size="xs" color="muted">Real-Time Autonomous Enterprise Operations Control</Text>
            </div>
            <StatusBadge status="success">AUTONOMOUS RUNTIME ACTIVE</StatusBadge>
          </div>
          <Text color="secondary">
            THEKY operates complete enterprise organizations autonomously, coordinating daily department runtimes, hybrid teams, and morning briefings.
          </Text>
        </Stack>
      </Box>

      <Grid columns={3} gap="16px">
        <KPICard
          title="Organizational Health"
          value={`${avgHealth}%`}
          change="Optimal Runtime"
          changeType="positive"
          icon={<Icon name="Activity" />}
        />
        <KPICard
          title="Active Autonomous Tasks"
          value={`${totalTasks} Tasks`}
          change="Executing Daily Routines"
          changeType="positive"
          icon={<Icon name="Sliders" />}
        />
        <KPICard
          title="Hybrid Workforce"
          value={`${workforce.length} Members`}
          change="AI & Human Staff Active"
          changeType="positive"
          icon={<Icon name="Users" />}
        />
      </Grid>

      {latestBriefing && (
        <Alert type="info" title={`Daily Morning Briefing Executive Summary (${latestBriefing.date}):`}>
          <Text size="xs" color="secondary">{latestBriefing.summary}</Text>
          <div style={{ marginTop: 6, fontSize: 11 }}>
            Top Risks Monitored: <strong>{latestBriefing.topRisks.join(' • ')}</strong>
          </div>
        </Alert>
      )}

      <Heading level={3}>Active Department Operations</Heading>
      <Grid columns={3} gap="16px">
        {runtimes.map((dept) => (
          <Box
            key={dept.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{dept.departmentName}</Heading>
                <StatusBadge status="success">{dept.dailyRoutineStatus.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div>Active Tasks: <strong>{dept.activeTasksCount}</strong></div>
                <div>Completed Tasks: <strong>{dept.completedTasksCount}</strong></div>
                <div>Health Score: <strong>{dept.healthScore}%</strong></div>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
