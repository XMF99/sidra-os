import { FC } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Grid, Box, Heading, Text, Button, Icon, Divider } from '@sidra/ui';

export const AuthPlatformStep: FC = () => {
  const { setAuthMethod, nextStep, prevStep } = useOnboardingStore();

  const handleSelectAuth = (method: 'guest' | 'google' | 'github' | 'microsoft' | 'apple' | 'sso') => {
    setAuthMethod(method);
    nextStep();
  };

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}
    >
      <Stack gap="24px">
        <div>
          <Heading level={2}>Authentication & Access Platform</Heading>
          <Text color="secondary">
            Select your enterprise identity provider or launch immediately in offline Guest Mode.
          </Text>
        </div>

        {/* Offline Guest Mode Banner */}
        <Box
          padding="16px"
          bg="rgba(16, 185, 129, 0.1)"
          borderRadius="8px"
          border="1px solid rgba(16, 185, 129, 0.3)"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text weight="semibold" color="primary">
                Sovereign Guest Mode (Offline Workspace)
              </Text>
              <Text size="xs" color="muted" style={{ display: 'block', marginTop: 2 }}>
                Full local event log, zero external server tracking, zero cloud login required.
              </Text>
            </div>
            <Button
              variant="success"
              size="sm"
              leftIcon={<Icon name="ShieldCheck" size={16} />}
              onClick={() => handleSelectAuth('guest')}
            >
              Continue in Guest Mode
            </Button>
          </div>
        </Box>

        <Divider />

        <Text size="xs" weight="semibold" color="muted">
          Enterprise Cloud Identity Providers:
        </Text>

        <Grid columns={2} gap="12px">
          <Button
            variant="secondary"
            leftIcon={<Icon name="Globe" size={16} />}
            onClick={() => handleSelectAuth('google')}
            style={{ justifyContent: 'flex-start' }}
          >
            Google Workspace SSO
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Icon name="Code" size={16} />}
            onClick={() => handleSelectAuth('github')}
            style={{ justifyContent: 'flex-start' }}
          >
            GitHub Enterprise
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Icon name="Key" size={16} />}
            onClick={() => handleSelectAuth('microsoft')}
            style={{ justifyContent: 'flex-start' }}
          >
            Microsoft Entra ID / SSO
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Icon name="Lock" size={16} />}
            onClick={() => handleSelectAuth('sso')}
            style={{ justifyContent: 'flex-start' }}
          >
            Custom SAML / SCIM SSO
          </Button>
        </Grid>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
