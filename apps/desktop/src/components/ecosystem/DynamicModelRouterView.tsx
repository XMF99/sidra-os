import { FC } from 'react';
import { useAiEcosystemStore, RoutingStrategy } from '../../state/useAiEcosystemStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const DynamicModelRouterView: FC = () => {
  const { routingStrategy, setRoutingStrategy, activeModel, setActiveModel } = useAiEcosystemStore();

  const strategies: { strategy: RoutingStrategy; label: string; desc: string }[] = [
    { strategy: 'Automatic', label: 'Automatic Smart Routing', desc: 'Balances task complexity, context length, latency, and cost dynamically.' },
    { strategy: 'Lowest Cost', label: 'Lowest Cost Optimization', desc: 'Prefers local Ollama models and low-cost flash tier endpoints for routine tasks.' },
    { strategy: 'Lowest Latency', label: 'Lowest Latency First', desc: 'Prioritizes local edge models and low-latency API regions for instant response.' },
    { strategy: 'Highest Quality', label: 'Highest Reasoning Quality', desc: 'Routes complex architectural, coding, and security tasks to frontier models.' },
  ];

  const models: string[] = ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1-5-pro', 'llama3-70b', 'mistral-large'];

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Dynamic Model Router Engine</Heading>
      <Text color="secondary">
        Automatically matches task intent and complexity to the optimal AI model while maintaining cost ceilings.
      </Text>

      <Grid columns={2} gap="16px">
        {strategies.map((strat) => {
          const isSelected = strat.strategy === routingStrategy;
          return (
            <Box
              key={strat.strategy}
              padding="18px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              onClick={() => setRoutingStrategy(strat.strategy)}
              style={{ cursor: 'pointer' }}
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text weight="semibold" color="primary">{strat.label}</Text>
                  {isSelected && <StatusBadge status="active">ACTIVE ROUTER</StatusBadge>}
                </div>
                <Text size="xs" color="muted">{strat.desc}</Text>
              </Stack>
            </Box>
          );
        })}
      </Grid>

      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="12px">
          <Heading level={4}>Manual Model Binding Target</Heading>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {models.map((m) => {
              const isCurrent = m === activeModel;
              return (
                <button
                  key={m}
                  onClick={() => setActiveModel(m)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    backgroundColor: isCurrent ? 'var(--sd-color-accent, #6366f1)' : '#050608',
                    color: '#ffffff',
                    border: '1px solid #2e3548',
                    fontWeight: isCurrent ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {m} {isCurrent ? '(Bound)' : ''}
                </button>
              );
            })}
          </div>
        </Stack>
      </Box>
    </Stack>
  );
};
