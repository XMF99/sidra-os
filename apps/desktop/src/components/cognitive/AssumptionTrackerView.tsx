import { FC } from 'react';
import { useCognitiveEngineStore } from '../../state/useCognitiveEngineStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const AssumptionTrackerView: FC = () => {
  const { assumptions } = useCognitiveEngineStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Assumption Tracker Ledger</Heading>
      <Text color="secondary">
        Explicitly tracks assumptions made during reasoning (Statement, Evidence Rating, Confidence, Source, Impact).
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {assumptions.map((asm) => (
          <Box
            key={asm.id}
            padding="16px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="8px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{asm.statement}</Text>
                <StatusBadge status={asm.evidenceRating === 'Strong' ? 'success' : 'pending'}>
                  EVIDENCE: {asm.evidenceRating.toUpperCase()} ({asm.confidence}%)
                </StatusBadge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                <span>Source: <strong>{asm.source}</strong></span>
                <span>Impact Level: <strong>{asm.impactLevel}</strong></span>
              </div>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
