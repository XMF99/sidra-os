import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Progress } from '@sidra/ui';

export const MultiAgentWorkspace: FC = () => {
  const { agents } = useAIWorkspaceStore();

  return (
    <Stack gap="24px" style={{ padding: 24 }}>
      <Heading level={2}>Multi-Agent Executive Workforce</Heading>
      <Text color="secondary">
        Autonomous sub-agent workers operating under strict Permission Broker capability ceilings.
      </Text>

      <Grid columns={3} gap="16px">
        {agents.map((agent) => (
          <Box
            key={agent.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{agent.name}</Heading>
                <StatusBadge status={agent.status === 'executing' ? 'active' : 'success'}>
                  {agent.status.toUpperCase()}
                </StatusBadge>
              </div>
              <Text size="xs" color="muted">
                Role: {agent.role}
              </Text>
              <Progress value={agent.progress} />

              <div style={{ marginTop: 8 }}>
                <Text size="xs" weight="semibold">
                  Recent Logs:
                </Text>
                <div
                  style={{
                    backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
                    padding: 8,
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                    maxHeight: 80,
                    overflowY: 'auto',
                    marginTop: 4,
                  }}
                >
                  {agent.logs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
