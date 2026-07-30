import { FC } from 'react';
import { useDigitalTwinStore } from '../../state/useDigitalTwinStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const ResourceOptimizerView: FC = () => {
  const { resourceProposals } = useDigitalTwinStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Resource Optimizer ⭐</Heading>
      <Text color="secondary">
        Analyzes resource utilization (People, AI Agents, Budget, Time, Infrastructure) to recommend high-ROI allocation proposals and remove bottlenecks.
      </Text>

      <Grid columns={2} gap="16px">
        {resourceProposals.map((prop) => (
          <Box
            key={prop.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{prop.resourceType.toUpperCase()} BOTTLENECK</Text>
                <StatusBadge status="active">ROI: {prop.expectedRoi}</StatusBadge>
              </div>

              <Text size="xs" color="muted">Detected Bottleneck:</Text>
              <Text size="xs" color="secondary">{prop.currentBottleneck}</Text>

              <Alert type="success" title="Proposed Reallocation Strategy:">
                {prop.proposedReallocation}
              </Alert>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
