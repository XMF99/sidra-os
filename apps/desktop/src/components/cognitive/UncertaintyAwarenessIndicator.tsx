import { FC } from 'react';
import { useCognitiveEngineStore } from '../../state/useCognitiveEngineStore';
import { Stack, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const UncertaintyAwarenessIndicator: FC = () => {
  const { uncertainty, goalAlignmentScore } = useCognitiveEngineStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Uncertainty Awareness & Goal Alignment Engine</Heading>
      <Text color="secondary">
        Explicitly communicates missing data, unknown facts, low confidence bounds, and alignment against organizational strategy.
      </Text>

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading level={4}>Organizational Goal Alignment Rating</Heading>
            <StatusBadge status="success">{goalAlignmentScore}% ALIGNED</StatusBadge>
          </div>
          <Text size="xs" color="muted">Recommendations strictly validated against current roadmaps and compliance mandates.</Text>
        </Stack>
      </Box>

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading level={4}>Uncertainty Metrics</Heading>
            <StatusBadge status={uncertainty.unknownFactsCount === 0 ? 'success' : 'pending'}>
              CONFIDENCE: {uncertainty.confidenceRating}%
            </StatusBadge>
          </div>

          <Text size="xs" color="muted">Unknown Facts Count: <strong>{uncertainty.unknownFactsCount}</strong></Text>

          {uncertainty.missingDataAlerts.length > 0 ? (
            <Alert type="warning" title="Missing Data Alerts:">
              <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                {uncertainty.missingDataAlerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </Alert>
          ) : (
            <Alert type="success" title="Zero Critical Missing Data Alerts">
              All necessary historical memory, graph edges, and DNA policies are fully resolved.
            </Alert>
          )}
        </Stack>
      </Box>
    </Stack>
  );
};
