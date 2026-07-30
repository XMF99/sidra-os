import { FC } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Grid, Box, Heading, Text, Button, StatusBadge, Alert, Icon } from '@sidra/ui';

export const RecommendationEngineStep: FC = () => {
  const { recommendations, toggleRecommendationInstall, nextStep, prevStep } = useOnboardingStore();

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="20px">
        <div>
          <Heading level={2}>AI Personalization Recommendations</Heading>
          <Text color="secondary">
            Generated based on your industry profile and discovery interview answers.
          </Text>
        </div>

        <Grid columns={2} gap="12px">
          {recommendations.map((rec) => (
            <Box
              key={rec.id}
              padding="16px"
              bg="var(--sd-color-surface-sunken, #050608)"
              borderRadius="8px"
              border="1px solid var(--sd-color-border-default, #2e3548)"
            >
              <Stack gap="8px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text weight="semibold" color="primary">{rec.title}</Text>
                  <StatusBadge status={rec.installed ? 'success' : 'neutral'}>
                    {rec.installed ? 'SELECTED' : 'OPTIONAL'}
                  </StatusBadge>
                </div>
                <Text size="xs" color="muted">{rec.description}</Text>
                <Alert type="info" title="Why recommended:">
                  {rec.rationale}
                </Alert>
                <Button
                  variant={rec.installed ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleRecommendationInstall(rec.id)}
                  style={{ marginTop: 4 }}
                >
                  {rec.installed ? 'Included in Install' : '+ Add to Workspace'}
                </Button>
              </Stack>
            </Box>
          ))}
        </Grid>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<Icon name="ArrowRight" size={16} />}
            onClick={nextStep}
          >
            Launch Modular Workspace Installer
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
