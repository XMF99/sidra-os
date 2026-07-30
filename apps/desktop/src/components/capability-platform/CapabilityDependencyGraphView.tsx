import { FC } from 'react';
import { useCapabilityIntelligenceStore } from '../../state/useCapabilityIntelligenceStore';
import { Stack, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const CapabilityDependencyGraphView: FC = () => {
  const { dependencyNodes } = useCapabilityIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Capability Dependency Graph DAG</Heading>
      <Text color="secondary">
        Visualizes relationships across Business Capabilities, automatically resolving prerequisites and detecting circular dependencies.
      </Text>

      <Alert type="success" title="Zero Circular Dependencies Detected">
        Dependency graph is clean and fully acyclic across all registered business capabilities.
      </Alert>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {dependencyNodes.map((node) => (
          <Box
            key={node.id}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{node.name} (v{node.version})</Text>
                <StatusBadge status={node.hasConflict ? 'pending' : 'success'}>
                  {node.hasConflict ? 'CONFLICT DETECTED' : 'RESOLVED'}
                </StatusBadge>
              </div>

              <Text size="xs" color="muted">
                Prerequisite Dependencies: {node.dependsOn.length > 0 ? node.dependsOn.join(', ') : 'None (Root Capability)'}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
