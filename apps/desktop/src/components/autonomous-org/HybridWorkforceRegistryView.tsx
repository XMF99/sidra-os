import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const HybridWorkforceRegistryView: FC = () => {
  const { workforce } = useAutonomousOrgStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Hybrid Human + AI Workforce Registry</Heading>
      <Text color="secondary">
        Unified directory orchestrating AI Executives, AI Managers, AI Specialists, Human Employees, and Contractors.
      </Text>

      <Grid columns={2} gap="16px">
        {workforce.map((w) => {
          const isAi = w.type.startsWith('AI');
          return (
            <Box
              key={w.id}
              padding="20px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isAi ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
            >
              <Stack gap="12px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Heading level={4}>{w.name}</Heading>
                    <Text size="xs" color="muted">{w.roleTitle} • {w.type}</Text>
                  </div>
                  <StatusBadge status={isAi ? 'active' : 'success'}>
                    {w.status.toUpperCase()}
                  </StatusBadge>
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  <div>Skills: <strong>{w.skills.join(', ')}</strong></div>
                  <div>Workload Capacity: <strong>{w.workloadPercent}% Allocated</strong></div>
                </div>
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Stack>
  );
};
