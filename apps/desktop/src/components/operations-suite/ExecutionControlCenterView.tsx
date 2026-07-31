import { FC } from 'react';
import { useOperationsIntelligenceStore } from '../../state/useOperationsIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const ExecutionControlCenterView: FC = () => {
  const { initiatives, tasks, completeExecutionTask } = useOperationsIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Execution Control & Milestone Tracker</Heading>
      <Text color="secondary">
        Tracks operational initiatives, milestone completion %, task dependencies, and execution progress.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Operational Initiatives</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {initiatives.map((init) => (
                <div key={init.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{init.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Dept: {init.department} • Progress: {init.progressPercent}%</div>
                  </div>
                  <StatusBadge status="success">{init.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Execution Tasks Queue</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((tsk) => (
                <div key={tsk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{tsk.taskName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Assignee: {tsk.assignee} • Priority: {tsk.priority}</div>
                  </div>
                  {tsk.status !== 'Done' ? (
                    <Button variant="primary" size="sm" onClick={() => completeExecutionTask(tsk.id)}>
                      Mark Complete
                    </Button>
                  ) : (
                    <StatusBadge status="success">DONE</StatusBadge>
                  )}
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
