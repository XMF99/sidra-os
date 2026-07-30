import { FC } from 'react';
import { useBusinessSolutionStore } from '../../state/useBusinessSolutionStore';
import { Stack, Grid, Box, Heading, Text, Button, Icon } from '@sidra/ui';

export const SolutionTemplatesCatalogView: FC = () => {
  const { templates, instantiateSolutionFromTemplate } = useBusinessSolutionStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Enterprise Solution Templates Catalog</Heading>
      <Text color="secondary">
        Instantly deploy pre-configured enterprise solution templates for Game Studio, ERP, Software Enterprise, CRM, HR, and Finance.
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
                <Text size="xs" color="muted">Domain: {tmpl.domain} • Expected Automation: {tmpl.expectedAutomationPercent}%</Text>
              </div>

              <Text size="xs" color="secondary">{tmpl.description}</Text>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                <div>Default Capabilities: <strong>{tmpl.defaultCapabilities.join(', ')}</strong></div>
              </div>

              <Button
                variant="primary"
                size="sm"
                rightIcon={<Icon name="Plus" size={14} />}
                onClick={() => instantiateSolutionFromTemplate(tmpl.id)}
                style={{ marginTop: 4 }}
              >
                Instantiate Solution Draft
              </Button>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
