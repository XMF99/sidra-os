import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Switch } from '@sidra/ui';

export const AIModelsView: FC = () => {
  const { models, selectedModelId, setSelectedModel, temperature, setTemperature, reasoningMode, setReasoningMode } = useAIWorkspaceStore();

  return (
    <Stack gap="24px" style={{ padding: 24 }}>
      <Heading level={2}>AI Model Providers & Routing Engine</Heading>
      <Text color="secondary">
        Multi-provider matrix supporting local Ollama sidecar, Anthropic Claude, OpenAI, and Google Gemini.
      </Text>

      {/* Model Preferences Bar */}
      <Box padding="20px" bg="var(--sd-color-surface-raised, #12151e)" borderRadius="8px" border="1px solid var(--sd-color-border-subtle, #242938)">
        <Stack gap="16px">
          <Heading level={4}>Reasoning Preferences</Heading>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <Text size="xs" color="muted">
                Reasoning Mode
              </Text>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {(['fast', 'balanced', 'deep'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={reasoningMode === mode ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setReasoningMode(mode)}
                  >
                    {mode.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Text size="xs" color="muted">
                Temperature ({temperature})
              </Text>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ marginTop: 8 }}
              />
            </div>

            <Switch checked={true} onChange={() => {}} label="Encrypt Local Key Storage" />
          </div>
        </Stack>
      </Box>

      {/* Model Cards Grid */}
      <Grid columns={2} gap="16px">
        {models.map((model) => {
          const isSelected = model.id === selectedModelId;
          return (
            <Box
              key={model.id}
              padding="20px"
              bg="var(--sd-color-surface-raised, #12151e)"
              borderRadius="8px"
              border={isSelected ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
            >
              <Stack gap="12px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Heading level={4}>{model.name}</Heading>
                  <StatusBadge status="success">{model.health.toUpperCase()}</StatusBadge>
                </div>
                <Text size="xs" color="muted">
                  Provider: {model.provider}
                </Text>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                  <span>Latency: {model.latencyMs}ms</span>
                  <span>Cost/1k: ${model.costPer1k.toFixed(4)}</span>
                  <span>Context: {(model.contextWindow / 1000).toFixed(0)}k tokens</span>
                </div>

                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedModel(model.id)}
                  style={{ marginTop: 8 }}
                >
                  {isSelected ? 'Active Default Provider' : 'Set as Default'}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Grid>
    </Stack>
  );
};
