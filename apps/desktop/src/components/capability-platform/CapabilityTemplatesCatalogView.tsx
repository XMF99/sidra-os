import { FC } from 'react';
import { useCapabilityIntelligenceStore } from '../../state/useCapabilityIntelligenceStore';
import { Stack, Grid, Box, Heading, Text, Button, Icon } from '@sidra/ui';

export const CapabilityTemplatesCatalogView: FC = () => {
  const { templates, createCapabilityFromTemplate } = useCapabilityIntelligenceStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Pre-Built Capability Templates Catalog</Heading>
      <Text color="secondary">
        Instantly instantiate verified business capability templates for Game Development, Invoice Processing, Marketing, and Customer Support.
      </Text>

      <Grid columns={2} gap="16px">
        {templates.map((tmpl) => (
          <Box
            key={tmpl.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div>
                <Heading level={4}>{tmpl.title}</Heading>
                <Text size="xs" color="muted">Category: {tmpl.category}</Text>
              </div>

              <Text size="xs" color="secondary">{tmpl.description}</Text>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                <div>Recommended Models: <strong>{tmpl.recommendedModels.join(', ')}</strong></div>
                <div>Recommended Connectors: <strong>{tmpl.recommendedConnectors.join(', ')}</strong></div>
              </div>

              <Button
                variant="primary"
                size="sm"
                rightIcon={<Icon name="Plus" size={14} />}
                onClick={() => createCapabilityFromTemplate(tmpl.id)}
                style={{ marginTop: 4 }}
              >
                Instantiate Capability Draft
              </Button>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
