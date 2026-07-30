import { FC } from 'react';
import { useExecutiveOrchestratorStore } from '../../state/useExecutiveOrchestratorStore';
import { Stack, Box, Heading, Text, StatusBadge, Button, Alert } from '@sidra/ui';

export const FailureRecoveryInspector: FC = () => {
  const { failures, triggerFailureRecovery } = useExecutiveOrchestratorStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Failure Recovery & Replanning Engine</Heading>
      <Text color="secondary">
        Monitors sub-agent timeouts, connector disruptions, and policy violations, automatically executing recovery strategies without restarting.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {failures.map((fail) => (
          <Box
            key={fail.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{fail.failureType.toUpperCase()} DETECTED</Text>
                <StatusBadge status={fail.status === 'Resolved' ? 'success' : 'pending'}>
                  STATUS: {fail.status.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="secondary">{fail.description}</Text>

              <Alert type="warning" title="Recovery Strategy:">
                {fail.recoveryStrategy}
              </Alert>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text size="xs" color="muted">Detected: {new Date(fail.timestamp).toLocaleTimeString()}</Text>
                {fail.status !== 'Resolved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => triggerFailureRecovery(fail.id)}
                  >
                    Execute Recovery Action
                  </Button>
                )}
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
