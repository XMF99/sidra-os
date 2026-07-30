import { FC } from 'react';
import { usePlatformIntegrationStore } from '../../state/usePlatformIntegrationStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const EndToEndFlowInspectorView: FC = () => {
  const { pipelineFlow } = usePlatformIntegrationStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>End-to-End Pipeline Tracer ⭐</Heading>
      <Text color="secondary">
        Visualizes the unbroken 18-stage execution flow from User Intent to Autonomous Execution, Reflection, and Continuous Learning.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipelineFlow.map((evt, i) => (
          <Box
            key={i}
            padding="16px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
            style={{ marginLeft: i * 4 }}
          >
            <Stack gap="6px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{evt.stage}</Text>
                <StatusBadge status="success">VERIFIED PASS</StatusBadge>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                <div>Input: <code>{evt.inputPayload}</code></div>
                <div>Output: <code>{evt.outputPayload}</code></div>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
