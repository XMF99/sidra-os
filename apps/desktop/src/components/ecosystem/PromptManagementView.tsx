import { FC } from 'react';
import { useAiEcosystemStore } from '../../state/useAiEcosystemStore';
import { Stack, Box, Heading, Text, StatusBadge } from '@sidra/ui';

export const PromptManagementView: FC = () => {
  const { prompts } = useAiEcosystemStore();

  return (
    <Stack gap="20px" style={{ width: '100%' }}>
      <Heading level={3}>Prompt Management Platform</Heading>
      <Text color="secondary">
        Centralized prompt directive library supporting template versioning, variable interpolation, testing, and approval workflows.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {prompts.map((prm) => (
          <Box
            key={prm.id}
            padding="20px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="10px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading level={4}>{prm.title} (v{prm.version})</Heading>
                <StatusBadge status="success">{prm.approvalState.toUpperCase()}</StatusBadge>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#050608', borderRadius: 6, fontSize: 12, border: '1px solid #2e3548', fontFamily: 'monospace' }}>
                {prm.templateString}
              </div>

              <Text size="xs" color="muted">
                Variables: {prm.variables.map((v) => `{{${v}}}`).join(', ')}
              </Text>
            </Stack>
          </Box>
        ))}
      </div>
    </Stack>
  );
};
