import { FC } from 'react';
import { useEnterpriseComposerStore } from '../../state/useEnterpriseComposerStore';
import { Stack, Grid, Box, Heading, Text, Button, Icon } from '@sidra/ui';

export const EnterpriseTemplatesCatalogView: FC = () => {
  const { templates, instantiateEnterpriseFromTemplate } = useEnterpriseComposerStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Pre-Built Enterprise Templates Catalog</Heading>
      <Text color="secondary">
        Instantly instantiate complete enterprise organizations for Game Studio Enterprise, Software Corporation, ERP Company, and Tech Startup.
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
                <Text size="xs" color="muted">Industry: {tmpl.industry} • Expected AI Utilization: {tmpl.expectedAiUtilizationPercent}%</Text>
              </div>

              <Text size="xs" color="secondary">{tmpl.description}</Text>

              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                <div>Default Departments: <strong>{tmpl.defaultDepartments.join(', ')}</strong></div>
              </div>

              <Button
                variant="primary"
                size="sm"
                rightIcon={<Icon name="Plus" size={14} />}
                onClick={() => instantiateEnterpriseFromTemplate(tmpl.id)}
                style={{ marginTop: 4 }}
              >
                Instantiate Enterprise Draft
              </Button>
            </Stack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
