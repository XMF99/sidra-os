import { FC } from 'react';
import { useEnterpriseComposerStore } from '../../state/useEnterpriseComposerStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const DepartmentComposerView: FC = () => {
  const { enterprises } = useEnterpriseComposerStore();
  const currentEnt = enterprises[0];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Department Orchestrator Workspace</Heading>
      <Text color="secondary">
        Orchestrates organizational departments from Business Solutions (Game Studio Engine, Enterprise ERP, HR, Finance) and assigns hybrid AI/Human teams.
      </Text>

      <Grid columns={3} gap="16px">
        {currentEnt.departments.map((dept) => (
          <Box
            key={dept.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{dept.name}</Heading>
                <StatusBadge status="active">ACTIVE DEPT</StatusBadge>
              </div>

              <Text size="xs" color="muted">Head of Department: <strong>{dept.headRole}</strong></Text>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div>Assigned Solutions: {dept.solutionsAssigned.join(', ')}</div>
                <div style={{ marginTop: 4 }}>
                  Team Composition: <strong>{dept.humanRolesCount} Human Staff</strong> • <strong>{dept.aiWorkersCount} AI Sub-Agents</strong>
                </div>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
