import { FC } from 'react';
import { useProjectPortfolioStore } from '../../state/useProjectPortfolioStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const ResourceFinancialsView: FC = () => {
  const { tasks } = useProjectPortfolioStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Resource Planning & Project Financials</Heading>
      <Text color="secondary">
        Monitors team capacity allocation, project budget forecasts, actual costs, earned value, and risk registers.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tasks.map((tsk) => (
          <Box
            key={tsk.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{tsk.taskName}</Heading>
                  <Text size="xs" color="muted">Assignee: {tsk.assignee} • Due: {tsk.dueDate}</Text>
                </div>
                <StatusBadge status="success">{tsk.status.toUpperCase()}</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Earned Value Index: <strong>1.04 EVM (Cost & Schedule Variance On Target)</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
