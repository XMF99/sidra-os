import { FC } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Box, Heading, Text, Button, StatusBadge, Icon } from '@sidra/ui';

export const FirstRunWelcome: FC = () => {
  const { nextStep, completeOnboarding } = useOnboardingStore();

  return (
    <Box
      padding="40px"
      bg="linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)"
      borderRadius="12px"
      border="1px solid rgba(99, 102, 241, 0.4)"
      style={{ maxWidth: 680, width: '100%', margin: '0 auto', textAlign: 'center' }}
    >
      <Stack gap="24px" align="center">
        <StatusBadge status="active">Version 1.0 Executive Build</StatusBadge>

        <Heading level={1} style={{ fontSize: 36, letterSpacing: '-0.03em' }}>
          Welcome to THEKY
        </Heading>

        <Text color="secondary" size="lg" style={{ maxWidth: 540 }}>
          The sovereign multi-agent operating system engineered for high-assurance enterprise operations and executive intelligence.
        </Text>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <Button
            variant="ghost"
            onClick={completeOnboarding}
          >
            Skip to Dashboard
          </Button>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<Icon name="ArrowRight" size={18} />}
            onClick={nextStep}
          >
            Start Guided Onboarding
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
