import { FC } from 'react';
import { useOnboardingStore, WorkspaceType } from '../../state/useOnboardingStore';
import { Stack, Grid, Box, Heading, Text, TextInput, Button, Icon } from '@sidra/ui';

export const WorkspaceWizardStep: FC = () => {
  const { workspaceName, workspaceType, setWorkspaceDetails, nextStep, prevStep } = useOnboardingStore();

  const types: WorkspaceType[] = [
    'Individual',
    'Freelancer',
    'Startup',
    'Company',
    'Enterprise',
    'Government',
    'University',
    'Studio',
    'Non-Profit',
    'Custom',
  ];

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 680, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="24px">
        <div>
          <Heading level={2}>Workspace Identity & Type</Heading>
          <Text color="secondary">
            Configure your workspace parameters to adapt AI recommendation templates and security controls.
          </Text>
        </div>

        <TextInput
          label="Workspace Name"
          value={workspaceName}
          onChange={(e) => setWorkspaceDetails({ workspaceName: e.target.value })}
          placeholder="e.g. Sovereign Enterprise Workspace"
        />

        <div>
          <Text size="xs" weight="semibold" color="muted" style={{ marginBottom: 8, display: 'block' }}>
            Select Workspace Mandate Type:
          </Text>
          <Grid columns={5} gap="8px">
            {types.map((type) => {
              const isSelected = type === workspaceType;
              return (
                <Button
                  key={type}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setWorkspaceDetails({ workspaceType: type })}
                  style={{ fontSize: 12, padding: '0 8px' }}
                >
                  {type}
                </Button>
              );
            })}
          </Grid>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<Icon name="ArrowRight" size={16} />}
            onClick={nextStep}
          >
            Continue to Industry Catalog
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
