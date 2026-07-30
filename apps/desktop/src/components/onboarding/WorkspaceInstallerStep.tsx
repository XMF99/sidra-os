import { FC, useState, useEffect } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Box, Heading, Text, Button, Progress, StatusBadge, Icon } from '@sidra/ui';

export const WorkspaceInstallerStep: FC = () => {
  const { recommendations, completeOnboarding, prevStep } = useOnboardingStore();
  const [progress, setProgress] = useState(0);

  const selectedCount = recommendations.filter((r) => r.installed).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      padding="36px"
      bg="var(--sd-color-surface-raised, #12151e)"
      borderRadius="12px"
      border="1px solid var(--sd-color-border-subtle, #242938)"
      style={{ maxWidth: 640, width: '100%', margin: '0 auto', textAlign: 'center' }}
    >
      <Stack gap="24px" align="center">
        <StatusBadge status={progress === 100 ? 'success' : 'active'}>
          {progress === 100 ? 'WORKSPACE PROVISIONED' : 'PROVISIONING WORKSPACE'}
        </StatusBadge>

        <Heading level={2}>Modular Workspace Installer</Heading>

        <Text color="secondary" style={{ maxWidth: 480 }}>
          Provisioning {selectedCount} selected application packages, sub-agent capabilities, and dynamic navigation links...
        </Text>

        <Progress value={progress} height={8} />

        <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>
          {progress < 25 && 'Step 1/4: Initializing SQLite Vault event schema...'}
          {progress >= 25 && progress < 50 && 'Step 2/4: Configuring Permission Broker capability tokens...'}
          {progress >= 50 && progress < 75 && 'Step 3/4: Registering sub-agent task DAG templates...'}
          {progress >= 75 && progress < 100 && 'Step 4/4: Generating personalized dashboard layout...'}
          {progress === 100 && '✅ Provisioning complete. Workspace operational.'}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <Button variant="ghost" onClick={prevStep}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={progress < 100}
            rightIcon={<Icon name="Check" size={18} />}
            onClick={completeOnboarding}
          >
            Enter Sovereign Workspace
          </Button>
        </div>
      </Stack>
    </Box>
  );
};
