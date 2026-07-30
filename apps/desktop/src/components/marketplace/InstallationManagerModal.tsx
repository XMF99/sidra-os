import { FC } from 'react';
import { useCapabilityPlatformStore } from '../../state/useCapabilityPlatformStore';
import { Stack, Box, Heading, Text, Progress, StatusBadge } from '@sidra/ui';

export const InstallationManagerModal: FC = () => {
  const { installingCapabilityId, installProgress, installLogs } = useCapabilityPlatformStore();

  if (!installingCapabilityId) return null;

  return (
    <div
      role="dialog"
      aria-label="Modular Installation Manager"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Box
        padding="32px"
        bg="var(--sd-color-surface-raised, #12151e)"
        borderRadius="12px"
        border="1px solid var(--sd-color-border-subtle, #242938)"
        style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}
      >
        <Stack gap="20px" align="center">
          <StatusBadge status={installProgress === 100 ? 'success' : 'active'}>
            {installProgress === 100 ? 'GENERATION COMPLETE' : 'GENERATING WORKSPACE'}
          </StatusBadge>

          <Heading level={3}>Modular Installation Manager</Heading>
          <Text color="secondary" size="sm">
            Executing capability dependency resolution and Vault event log schema verification.
          </Text>

          <Progress value={installProgress} height={8} />

          <div
            style={{
              width: '100%',
              backgroundColor: '#050608',
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#94a3b8',
              textAlign: 'left',
              maxHeight: 120,
              overflowY: 'auto',
            }}
          >
            {installLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </Stack>
      </Box>
    </div>
  );
};
