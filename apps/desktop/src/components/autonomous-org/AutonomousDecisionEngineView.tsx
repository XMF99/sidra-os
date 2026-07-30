import { FC } from 'react';
import { useAutonomousOrgStore } from '../../state/useAutonomousOrgStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const AutonomousDecisionEngineView: FC = () => {
  const { decisionLogs } = useAutonomousOrgStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Autonomous Decision & Governance Engine</Heading>
      <Text color="secondary">
        Logs automated approvals, escalations, delegations, and pauses governed by immutable Execution Contracts.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {decisionLogs.map((entry) => (
          <Box
            key={entry.id}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{entry.targetSubject}</Text>
                <StatusBadge status={entry.action === 'Approve' ? 'success' : 'active'}>
                  {entry.action.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">{entry.reasoning}</Text>

              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                Policy: <strong>{entry.governancePolicy}</strong> • {new Date(entry.timestamp).toLocaleString()}
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
