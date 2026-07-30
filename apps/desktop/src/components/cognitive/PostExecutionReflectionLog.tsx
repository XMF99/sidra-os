import { FC } from 'react';
import { useCognitiveEngineStore } from '../../state/useCognitiveEngineStore';
import { Stack, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const PostExecutionReflectionLog: FC = () => {
  const { reflections } = useCognitiveEngineStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Post-Execution Reflection Ledger</Heading>
      <Text color="secondary">
        Post-execution outcome evaluator comparing Expected vs Actual results and feeding lessons learned back into Living Memory.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {reflections.map((refl) => (
          <Box
            key={refl.id}
            padding="18px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{refl.actionTitle}</Heading>
                <StatusBadge status={refl.success ? 'success' : 'pending'}>
                  {refl.success ? 'OUTCOME MET EXPECTATIONS' : 'DEVIATION DETECTED'}
                </StatusBadge>
              </div>

              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                <div><strong>Expected Outcome:</strong> {refl.expectedOutcome}</div>
                <div style={{ marginTop: 4 }}><strong>Actual Outcome:</strong> {refl.actualOutcome}</div>
              </div>

              <Alert type="success" title="Lessons Learned Fed Back to Memory:">
                {refl.lessonsLearned}
              </Alert>

              <Text size="xs" color="muted" style={{ fontSize: 10 }}>Logged: {new Date(refl.timestamp).toLocaleString()}</Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
