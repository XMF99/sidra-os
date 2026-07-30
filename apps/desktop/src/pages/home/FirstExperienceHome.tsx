import { FC } from 'react';
import { useContextEngineStore } from '../../state/useContextEngineStore';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Stack, Grid, Box, Heading, Text, Button, StatusBadge, Alert, Icon } from '@sidra/ui';

export const FirstExperienceHome: FC = () => {
  const { isDemoMode, enterDemoMode, leaveDemoMode } = useContextEngineStore();
  const { sendPrompt } = useThekyConsoleStore();

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto', width: '100%' }}>
      <Stack gap="24px">
        {/* Demo Mode Banner Indicator */}
        {isDemoMode && (
          <Alert type="warning" title="Demonstration Workspace Active">
            You are entering the THEKY demonstration workspace. All data is isolated and will never pollute your production organization.
            <div style={{ marginTop: 8 }}>
              <Button variant="outline" size="sm" onClick={leaveDemoMode}>
                Leave Demo Mode
              </Button>
            </div>
          </Alert>
        )}

        {/* Executive Welcome Header */}
        <Box
          padding="32px"
          bg="linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)"
          borderRadius="12px"
          border="1px solid rgba(99, 102, 241, 0.4)"
        >
          <Stack gap="16px" align="center" style={{ textAlign: 'center' }}>
            <StatusBadge status={isDemoMode ? 'pending' : 'active'}>
              {isDemoMode ? 'DEMO ENVIRONMENT ACTIVE' : 'PRODUCTION SOVEREIGN WORKSPACE'}
            </StatusBadge>
            <Heading level={1} style={{ fontSize: 36, letterSpacing: '-0.03em' }}>
              Welcome to THEKY
            </Heading>
            <Text color="secondary" size="lg" style={{ maxWidth: 600 }}>
              The AI-first Business Operating System. Ask questions, orchestrate multi-agent workforce tasks, or generate workspaces directly from natural language.
            </Text>
          </Stack>
        </Box>

        {/* Clean First-Launch Options */}
        <Grid columns={2} gap="16px">
          <Box
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="Plus" size={20} color="var(--sd-color-accent, #6366f1)" />
                <Heading level={4}>Create Organization</Heading>
              </div>
              <Text size="xs" color="muted">Provision a new sovereign organization workspace with custom capability packs and team spaces.</Text>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { window.location.hash = '#/setup'; }}
              >
                Launch Workspace Wizard
              </Button>
            </Stack>
          </Box>

          <Box
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="PlayCircle" size={20} color="#f59e0b" />
                <Heading level={4}>Open Demo Environment</Heading>
              </div>
              <Text size="xs" color="muted">Explore THEKY with sample blueprints, test task DAGs, and mock telemetry isolated from production.</Text>
              <Button
                variant="outline"
                size="sm"
                onClick={enterDemoMode}
              >
                {isDemoMode ? 'Demo Active' : 'Enter Demo Mode'}
              </Button>
            </Stack>
          </Box>

          <Box
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="MessageSquare" size={20} color="#10b981" />
                <Heading level={4}>Ask THEKY Intelligence Console</Heading>
              </div>
              <Text size="xs" color="muted">Direct natural language interface to query intelligence, orchestrate agents, and execute commands.</Text>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  sendPrompt('Give me an overview of THEKY Business Operating System capabilities.');
                  window.location.hash = '#/console';
                }}
              >
                Open THEKY Console
              </Button>
            </Stack>
          </Box>

          <Box
            padding="24px"
            bg="var(--sd-color-surface-raised, #12151e)"
            borderRadius="8px"
            border="1px solid var(--sd-color-border-subtle, #242938)"
          >
            <Stack gap="12px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="Layers" size={20} color="#818cf8" />
                <Heading level={4}>Generate Workspace from Prompt</Heading>
              </div>
              <Text size="xs" color="muted">Type natural language descriptions to generate game studios, hospitals, law firms, or ERP workspaces.</Text>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { window.location.hash = '#/marketplace'; }}
              >
                Open Workspace Generator
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Stack>
    </div>
  );
};
