import { FC } from 'react';
import { useCognitiveEngineStore } from '../../state/useCognitiveEngineStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const MultiPerspectiveSynthesisView: FC = () => {
  const { perspectives } = useCognitiveEngineStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Multi-Perspective Executive Synthesis</Heading>
      <Text color="secondary">
        Analyzes organizational problems through multi-role viewpoints (CEO, CTO, CFO, Security, Operations) before merging into a unified recommendation.
      </Text>

      <Grid columns={2} gap="16px">
        {perspectives.map((p, idx) => (
          <Box
            key={idx}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{p.role} PERSPECTIVE</Text>
                <StatusBadge status="active">CONFIDENCE: {p.confidence}%</StatusBadge>
              </div>

              <Text size="xs" color="muted">Viewpoint Analysis:</Text>
              <Text size="xs" color="secondary">{p.viewpoint}</Text>

              <div style={{ padding: '8px 10px', backgroundColor: '#050608', borderRadius: 6, fontSize: 12, border: '1px solid #2e3548' }}>
                <strong style={{ color: '#34d399' }}>Recommendation:</strong> {p.recommendation}
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
