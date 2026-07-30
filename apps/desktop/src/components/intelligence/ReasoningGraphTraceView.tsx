import { FC } from 'react';
import { useIntelligenceCoreStore } from '../../state/useIntelligenceCoreStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const ReasoningGraphTraceView: FC = () => {
  const { runReasoningPipeline } = useIntelligenceCoreStore();

  const sampleTrace = runReasoningPipeline('Provision Game Studio Workspace and verify Vault security tokens');

  const steps = [
    { name: '1. Intent Classification', desc: `Detected Intent: ${sampleTrace.intent.toUpperCase()}` },
    { name: '2. Evidence & Context Query', desc: `Queried active Space scope and matched ${sampleTrace.memoryMatches.length} historical memory record(s).` },
    { name: '3. Knowledge Graph Traversal', desc: `Traversed ${sampleTrace.graphNeighbors.length} connected entity node(s).` },
    { name: '4. Reasoning Synthesis', desc: sampleTrace.decisionPlan },
    { name: '5. Decision & Execution Plan', desc: `Confidence Rating: ${sampleTrace.confidence}% • Risk Assessment: LOW` },
  ];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Internal Reasoning Graph Trace</Heading>
      <Text color="secondary">
        Inspects step-by-step reasoning evaluation before decision execution (Intent → Evidence → Knowledge → Reasoning → Decision → Execution).
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, idx) => (
          <Box
            key={idx}
            padding="16px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="6px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{step.name}</Text>
                <StatusBadge status="active">STEP {idx + 1}</StatusBadge>
              </div>
              <Text size="xs" color="muted">{step.desc}</Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
