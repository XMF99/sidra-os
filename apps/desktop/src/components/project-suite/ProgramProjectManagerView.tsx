import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const ProgramProjectManagerView: FC = () => {
  const { programs, projects } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Program & Project Execution Center</Heading>
      <Text color="secondary">
        Monitors strategic programs, active project completion %, Kanban/Gantt schedules, and deliverables.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Active Strategic Programs</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {programs.map((prg) => (
                <div key={prg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{prg.title}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Lead: {prg.leadName} • Budget: ${(prg.budget / 1000000).toFixed(1)}M</div>
                  </div>
                  <StatusBadge status="success">{prg.health.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>

        <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="12px">
            <Heading level={4}>Enterprise Projects Ledger</Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map((prj) => (
                <div key={prj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div><strong>{prj.projectName}</strong></div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Completion: {prj.completionPercent}%</div>
                  </div>
                  <StatusBadge status="success">{prj.status.toUpperCase()}</StatusBadge>
                </div>
              ))}
            </div>
          </Stack>
        </Box>
      </Grid>
    </Stack>
  );
};
