import { FC } from 'react';
import { useHumanCapitalStore } from '../../state/useHumanCapitalStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const EmployeeLifecycleView: FC = () => {
  const { employees } = useHumanCapitalStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Employee Lifecycle & Skill Matrix Directory</Heading>
      <Text color="secondary">
        Monitors personnel onboarding, active roles, skill matrices, performance scores, and retention risk telemetry.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {employees.map((emp) => (
          <Box
            key={emp.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{emp.name} — {emp.roleTitle}</Heading>
                  <Text size="xs" color="muted">Department: {emp.department} • Performance Score: {emp.performanceScore}%</Text>
                </div>
                <StatusBadge status="success">{emp.lifecycleState.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                Skills: <strong>{emp.skills.join(', ')}</strong> • Retention Risk: <strong style={{ color: '#34d399' }}>{emp.retentionRisk}</strong>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
