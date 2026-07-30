import { FC } from 'react';
import { useAiEcosystemStore } from '../../state/useAiEcosystemStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const ToolConnectorRegistryView: FC = () => {
  const { connectors, toggleConnectorAuth } = useAiEcosystemStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Centralized Tool & Connector Registry</Heading>
      <Text color="secondary">
        Unified connector framework integrating GitHub, GitLab, Google Workspace, M365, Slack, Jira, Notion, Linear, Figma, and Stripe.
      </Text>

      <Grid columns={2} gap="16px">
        {connectors.map((conn) => (
          <Box
            key={conn.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{conn.name}</Text>
                <StatusBadge status={conn.authStatus === 'Authorized' ? 'success' : 'pending'}>
                  {conn.authStatus.toUpperCase()}
                </StatusBadge>
              </div>

              <Text size="xs" color="muted">
                Category: <strong>{conn.category}</strong> • Sync Status: <strong>{conn.syncStatus}</strong>
              </Text>

              <Button
                variant={conn.authStatus === 'Authorized' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => toggleConnectorAuth(conn.id)}
                style={{ marginTop: 4 }}
              >
                {conn.authStatus === 'Authorized' ? 'Disconnect Integration' : 'Authorize Integration'}
              </Button>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
