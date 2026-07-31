import { FC } from 'react';
import { useOperationsIntelligenceStore } from '../../state/useOperationsIntelligenceStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const ResourceWorkflowView: FC = () => {
  const { resources } = useOperationsIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Resource Capacity & Workflow Orchestration</Heading>
      <Text color="secondary">
        Monitors resource allocation (People, GPU Compute, Assets), capacity utilization %, and workflow execution rules.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {resources.map((res) => (
          <Box
            key={res.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Heading level={4}>{res.resourceName}</Heading>
                  <Text size="xs" color="muted">Category: {res.category}</Text>
                </div>
                <StatusBadge status="success">{res.capacityUtilizationPercent}% UTILIZATION</StatusBadge>
              </div>

              <Text size="xs" color="secondary">
                Resource Health: <strong>Optimal Load Balance (0 Bottlenecks)</strong>
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
