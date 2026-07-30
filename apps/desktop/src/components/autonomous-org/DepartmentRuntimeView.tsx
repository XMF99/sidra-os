import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const DepartmentRuntimeView: FC = () => {
  const { runtimes } = useAutonomousOrgStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Executable Department Runtime Operations</Heading>
      <Text color="secondary">
        Monitors live execution of daily routines, sprint planning, task assignments, and reviews across active enterprise departments.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {runtimes.map((dept) => (
          <Box
            key={dept.id}
            padding="22px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{dept.departmentName}</Heading>
                <StatusBadge status="success">{dept.dailyRoutineStatus.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <span>Active Tasks: <strong>{dept.activeTasksCount} Tasks</strong></span>
                <span style={{ marginLeft: 20 }}>Completed Tasks: <strong>{dept.completedTasksCount} Tasks</strong></span>
                <span style={{ marginLeft: 20 }}>Department Health: <strong>{dept.healthScore}%</strong></span>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
