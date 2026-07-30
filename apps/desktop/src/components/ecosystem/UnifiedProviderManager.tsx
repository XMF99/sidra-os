import { FC } from 'react';
import { useAiEcosystemStore } from '../../state/useAiEcosystemStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const UnifiedProviderManager: FC = () => {
  const { providers, activeModel } = useAiEcosystemStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)"
        borderRadius="8px"
        border="1px solid rgba(99, 102, 241, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Heading level={2}>Unified AI Provider Framework</Heading>
              <Text size="xs" color="muted">Active Model Routing Target: <strong>{activeModel}</strong></Text>
            </div>
            <StatusBadge status="success">PROVIDER AGNOSTIC ENGINE ACTIVE</StatusBadge>
          </div>

          <Text color="secondary">
            Unified abstraction layer supporting OpenAI, Anthropic, Google Gemini, Azure, OpenRouter, and Ollama Local LLMs with zero domain logic leakage.
          </Text>
        </Stack>
      </Box>

      <Heading level={3}>Configured AI Providers ({providers.length})</Heading>

      <Grid columns={2} gap="16px">
        {providers.map((prov) => (
          <Box
            key={prov.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text weight="semibold" color="primary">{prov.name}</Text>
                <StatusBadge status={prov.healthStatus === 'Active' ? 'success' : 'pending'}>
                  {prov.healthStatus.toUpperCase()} ({prov.latencyMs}ms)
                </StatusBadge>
              </div>

              <Text size="xs" color="muted">Cost Benchmark: <strong>${prov.costPer1kTokens} / 1k Tokens</strong></Text>

              <div>
                <Text size="xs" weight="semibold" color="muted">Available Models:</Text>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {prov.availableModels.map((mod, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: mod === activeModel ? 'var(--sd-color-accent, #6366f1)' : '#050608',
                        color: '#ffffff',
                        fontSize: 11,
                        border: '1px solid #2e3548',
                      }}
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
