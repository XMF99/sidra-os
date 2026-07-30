import { FC } from 'react';
import { useCognitiveEngineStore } from '../../state/useCognitiveEngineStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Alert } from '@sidra/ui';

export const MetaReasoningAuditInspector: FC = () => {
  const { metaAudit } = useCognitiveEngineStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Meta Reasoning & Internal Self-Audit Inspector</Heading>
      <Text color="secondary">
        Internal self-review evaluating reasoning logic consistency, weak assumptions, rejected contradictions, and evidence coverage prior to execution.
      </Text>

      <Grid columns={2} gap="16px">
        <Box padding="18px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="8px">
            <Text size="xs" weight="semibold" color="muted">Logic Consistency Rating:</Text>
            <Heading level={2} style={{ color: '#34d399' }}>{metaAudit.logicConsistencyScore}%</Heading>
            <StatusBadge status="success">HIGH LOGIC CONSISTENCY</StatusBadge>
          </Stack>
        </Box>

        <Box padding="18px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
          <Stack gap="8px">
            <Text size="xs" weight="semibold" color="muted">Evidence Coverage Rating:</Text>
            <Heading level={2} style={{ color: '#60a5fa' }}>{metaAudit.evidenceCoverageScore}%</Heading>
            <StatusBadge status="active">HIGH EVIDENCE COVERAGE</StatusBadge>
          </Stack>
        </Box>
      </Grid>

      <Alert type="warning" title="Weak Assumptions Detected During Self-Review:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
          {metaAudit.weakAssumptionsDetected.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Alert>

      <Alert type="info" title="Rejected Logical Contradictions:">
        <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
          {metaAudit.rejectedContradictions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Alert>

      <Box padding="16px" bg="#050608" borderRadius="8px" border="1px solid #2e3548">
        <Text size="xs" weight="semibold" color="muted">Recommended Strategy Adjustments:</Text>
        <Text size="xs" color="secondary" style={{ marginTop: 4 }}>{metaAudit.recommendedAdjustments}</Text>
      </Box>
    </Stack>
  );
};
