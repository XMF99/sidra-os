import { FC } from 'react';
import { useExecutiveOrchestratorStore, PolicyLevel } from '../../state/useExecutiveOrchestratorStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const AutonomousPolicySelector: FC = () => {
  const { activePolicyLevel, setPolicyLevel } = useExecutiveOrchestratorStore();

  const policies: { level: PolicyLevel; name: string; desc: string }[] = [
    { level: 'Manual', name: 'Manual Execution Policy', desc: 'Every task decomposition, AI agent assignment, and execution step requires explicit human approval.' },
    { level: 'Assisted', name: 'Assisted Policy', desc: 'THEKY performs task decomposition and AI assignment; human approves execution contract before start.' },
    { level: 'Semi-Autonomous', name: 'Semi-Autonomous Policy (Default)', desc: 'THEKY executes low-risk tasks autonomously; high-impact contracts and security mutations require approval.' },
    { level: 'Autonomous', name: 'Full Autonomous Policy', desc: 'THEKY autonomously decomposes, schedules, executes, and recovers across all verified workspace spaces.' },
  ];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Autonomous Execution Governance Policies</Heading>
      <Text color="secondary">
        Configures organizational governance level determining AI autonomy bounds for mission execution and failure recovery.
      </Text>

      <Grid columns={2} gap="16px">
        {policies.map((p) => {
          const isSelected = p.level === activePolicyLevel;
          return (
            <Box
              key={p.level}
              padding="18px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              onClick={() => setPolicyLevel(p.level)}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text weight="semibold" color="primary">{p.name}</Text>
                  {isSelected && <StatusBadge status="active">ACTIVE POLICY</StatusBadge>}
                </div>
                <Text size="xs" color="muted">{p.desc}</Text>
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Stack>
  );
};
