import { FC } from 'react';
import { useOnboardingStore } from '../../state/useOnboardingStore';
import { Stack, Grid, Box, Heading, Text, KPICard, StatusBadge, Button, Icon } from '@sidra/ui';

export const PersonalizedDashboard: FC = () => {
  const { workspaceName, workspaceType, recommendations, resumeOnboarding } = useOnboardingStore();

  const installedCount = recommendations.filter((r) => r.installed).length;

  return (
    <Stack gap="24px" style={{ padding: 24 }}>
      <Box
        padding="24px"
        borderRadius="8px"
        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)"
        border="1px solid rgba(99, 102, 241, 0.3)"
      >
        <Stack gap="12px">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Heading level={2}>{workspaceName}</Heading>
            <StatusBadge status="active">{workspaceType.toUpperCase()} WORKSPACE</StatusBadge>
          </div>
          <Text color="secondary">
            Personalized home experience provisioned with {installedCount} active applications and AI sub-agents.
          </Text>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon name="RefreshCw" size={14} />}
              onClick={resumeOnboarding}
            >
              Re-run Intelligent Onboarding
            </Button>
          </div>
        </Stack>
      </Box>

      <Grid columns={3} gap="16px">
        <KPICard title="Installed Applications" value={installedCount} change="Progressive Layout" changeType="positive" icon={<Icon name="Grid" />} />
        <KPICard title="Security Token Baseline" value="100% Compliant" change="Permission Broker" changeType="positive" icon={<Icon name="Shield" />} />
        <KPICard title="Vault Event Log" value="Verified Integrity" change="SHA-256 Hash Chain" changeType="neutral" icon={<Icon name="Database" />} />
      </Grid>
    </Stack>
  );
};
