import { FC } from 'react';
import { useExecutiveOrchestratorStore } from '../../state/useExecutiveOrchestratorStore';
import { Stack, Box, Heading, Text, StatusBadge, Progress } from '@sidra/ui';

export const MissionDecompositionTreeView: FC = () => {
  const { tasks } = useExecutiveOrchestratorStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Mission Decomposition DAG</Heading>
      <Text color="secondary">
        Hierarchical task decomposition tree automatically breaking plans into Objectives, Milestones, Missions, Tasks, and Subtasks.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            padding="16px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={task.status === 'Completed' ? 'success' : task.status === 'Executing' ? 'active' : 'neutral'}>
                    {task.category.toUpperCase()}
                  </StatusBadge>
                  <Text weight="semibold" color="primary">{task.title}</Text>
                </div>
                <Text size="xs" color="muted">Agent: <strong>{task.assignedAgent}</strong></Text>
              </div>

              <Progress value={task.progress} height={6} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                <span>Dependencies: {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}</span>
                <span>Status: <strong>{task.status}</strong> ({task.progress}%)</span>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
