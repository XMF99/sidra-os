import { FC } from 'react';
import { useCapabilityPlatformStore } from '../../state/useCapabilityPlatformStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Icon } from '@sidra/ui';

export const CapabilityPackCatalog: FC = () => {
  const { packs, generateWorkspaceFromBlueprint } = useCapabilityPlatformStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={2}>Business Capability Packs</Heading>
      <Text color="secondary">
        Pre-configured business-in-a-box capability bundles. Automatically provisions applications, agents, workflows, and dashboards.
      </Text>

      <Grid columns={2} gap="16px">
        {packs.map((pack) => (
          <Box
            key={pack.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={pack.icon} size={20} color="var(--sd-color-accent, #6366f1)" />
                  <Heading level={4}>{pack.name}</Heading>
                </div>
                <StatusBadge status={pack.installed ? 'success' : 'neutral'}>
                  {pack.installed ? 'ACTIVE' : 'AVAILABLE'}
                </StatusBadge>
              </div>

              <Text size="xs" color="muted">{pack.description}</Text>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text size="xs" color="muted">Industry: <strong>{pack.industry}</strong></Text>
                <Button
                  variant={pack.installed ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => generateWorkspaceFromBlueprint(pack.id)}
                >
                  {pack.installed ? 'Re-provision Pack' : 'Generate Workspace'}
                </Button>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
