import { FC } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { PrimaryPromptComposer } from './PrimaryPromptComposer';
import { Stack, Grid, Box, Heading, Text, StatusBadge, Button, Icon } from '@sidra/ui';

export const ThekyHomeLanding: FC = () => {
  const { smartSuggestions, sendPrompt } = useOnboardingStoreContext();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '40px 24px',
        boxSizing: 'border-box',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <Stack gap="32px" align="center" style={{ width: '100%' }}>
        {/* THEKY Identity Welcome Banner */}
        <Stack gap="12px" align="center" style={{ textAlign: 'center' }}>
          <StatusBadge status="active">THEKY Business Operating System</StatusBadge>
          <Heading level={1} style={{ fontSize: 38, letterSpacing: '-0.03em' }}>
            What shall we build today?
          </Heading>
          <Text color="secondary" size="lg" style={{ maxWidth: 580 }}>
            I am THEKY. Ask questions, orchestrate multi-agent workforce tasks, or generate workspaces directly from natural language.
          </Text>
        </Stack>

        {/* Prominent Large Centered Prompt Input */}
        <PrimaryPromptComposer isCentered />

        {/* Smart Contextual Suggestion Pills */}
        <div style={{ width: '100%', maxWidth: 720 }}>
          <Text size="xs" weight="semibold" color="muted" style={{ marginBottom: 12, display: 'block', textAlign: 'center' }}>
            Smart Contextual Suggestions:
          </Text>
          <Grid columns={2} gap="12px">
            {smartSuggestions.map((sug) => (
              <Box
                key={sug.id}
                padding="14px"
                bg="var(--sd-color-surface-raised, #12151e)"
                borderRadius="8px"
                border="1px solid var(--sd-color-border-subtle, #242938)"
                onClick={() => sendPrompt(sug.prompt)}
                style={{ cursor: 'pointer', transition: 'border-color 0.15s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={sug.icon} size={18} color="var(--sd-color-accent, #6366f1)" />
                  <Text weight="semibold" size="sm" color="primary">{sug.label}</Text>
                </div>
              </Box>
            ))}
          </Grid>
        </div>

        {/* One-Click Quick Actions Toolbar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="FolderPlus" size={14} />}
            onClick={() => sendPrompt('Create a new project workspace')}
          >
            Create Project
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="Layers" size={14} />}
            onClick={() => sendPrompt('Generate a modular workspace layout')}
          >
            Generate Workspace
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="UploadCloud" size={14} />}
            onClick={() => sendPrompt('Analyze uploaded enterprise documents')}
          >
            Analyze Documents
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="Cpu" size={14} />}
            onClick={() => sendPrompt('Start multi-agent executive team')}
          >
            Start AI Team
          </Button>
        </div>
      </Stack>
    </div>
  );
};

function useOnboardingStoreContext() {
  const { smartSuggestions, sendPrompt } = useThekyConsoleStore();
  return { smartSuggestions, sendPrompt };
}
