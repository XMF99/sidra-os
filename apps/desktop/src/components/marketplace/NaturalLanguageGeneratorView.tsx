import { FC, useState } from 'react';
import { useCapabilityPlatformStore } from '../../state/useCapabilityPlatformStore';
import { Stack, Grid, Box, Heading, Text, TextInput, Button, StatusBadge, Alert, Icon } from '@sidra/ui';

export const NaturalLanguageGeneratorView: FC = () => {
  const { naturalLanguagePrompt, generateBlueprintFromPrompt, generatedVariants, isGeneratingBlueprint, generateWorkspaceFromBlueprint } = useCapabilityPlatformStore();
  const [promptInput, setPromptInput] = useState(naturalLanguagePrompt || 'I want a game studio with narrative AI and asset queue');

  const handleGenerate = () => {
    if (!promptInput.trim()) return;
    generateBlueprintFromPrompt(promptInput);
  };

  return (
    <Stack gap="24px" style={{ width: '100%' }}>
      <Box
        padding="24px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)"
        borderRadius="12px"
        border="1px solid rgba(99, 102, 241, 0.3)"
      >
        <Stack gap="16px">
          <Heading level={2}>Natural Language Workspace Generation</Heading>
          <Text color="secondary">
            Describe your business or operational vision. THEKY analyzes intent, creates Workspace Blueprints, and executes resolution.
          </Text>

          <div style={{ display: 'flex', gap: 12 }}>
            <TextInput
              placeholder="e.g. 'I want a game studio', 'I want a hospital', 'I want a law firm'..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <Button
              variant="primary"
              loading={isGeneratingBlueprint}
              rightIcon={<Icon name="Sparkles" size={16} />}
              onClick={handleGenerate}
            >
              Generate Workspace
            </Button>
          </div>
        </Stack>
      </Box>

      {/* Generated Variants Comparison Grid */}
      {generatedVariants.length > 0 && (
        <Stack gap="16px">
          <Heading level={3}>THEKY Generated Workspace Blueprint Variants</Heading>
          <Grid columns={2} gap="16px">
            {generatedVariants.map((variant) => (
              <Box
                key={variant.id}
                padding="20px"
                bg="var(--sd-color-surface-raised, #12151e)"
                borderRadius="8px"
                border={variant.variantType === 'Recommended' ? '2px solid var(--sd-color-accent, #6366f1)' : '1px solid var(--sd-color-border-subtle, #242938)'}
              >
                <Stack gap="12px">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Heading level={4}>{variant.name}</Heading>
                    <StatusBadge status={variant.variantType === 'Recommended' ? 'success' : 'active'}>
                      THEKY CONFIDENCE: {variant.thekyConfidenceScore}%
                    </StatusBadge>
                  </div>

                  <Text size="xs" color="muted">{variant.description}</Text>

                  <Alert type="info" title="Confidence Rationale:">
                    {variant.confidenceExplanation}
                  </Alert>

                  <div>
                    <Text size="xs" weight="semibold" color="muted">Included Capabilities:</Text>
                    <ul style={{ margin: '4px 0 0 16px', fontSize: 12, color: '#94a3b8' }}>
                      {variant.capabilities.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={variant.variantType === 'Recommended' ? 'primary' : 'outline'}
                    size="sm"
                    rightIcon={<Icon name="Check" size={14} />}
                    onClick={() => generateWorkspaceFromBlueprint(variant.id)}
                    style={{ marginTop: 8 }}
                  >
                    Generate Workspace from {variant.variantType} Variant
                  </Button>
                </Stack>
              </Box>
            ))}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
};
