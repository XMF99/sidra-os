import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { AIWorkspaceHome } from '../../components/ai/AIWorkspaceHome';
import { ConversationWorkspace } from '../../components/ai/ConversationWorkspace';
import { MultiAgentWorkspace } from '../../components/ai/MultiAgentWorkspace';
import { ExecutiveDecisionCenter } from '../../components/ai/ExecutiveDecisionCenter';
import { AIModelsView } from '../../components/ai/AIModelsView';
import { Heading, Text, Stack, Box } from '@sidra/ui';

export const AIWorkspacePage: FC = () => {
  const { activeSubTab, setActiveSubTab } = useAIWorkspaceStore();

  const tabs: { id: typeof activeSubTab; label: string; icon: string }[] = [
    { id: 'home', label: 'Workspace Home', icon: '🏠' },
    { id: 'conversations', label: 'Conversations', icon: '💬' },
    { id: 'agents', label: 'Multi-Agent Workforce', icon: '🤖' },
    { id: 'decisions', label: 'Executive Decisions', icon: '⚖️' },
    { id: 'models', label: 'AI Models & Providers', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* AI Sub-Tab Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          padding: '0 16px',
          backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
          borderBottom: '1px solid var(--sd-color-border-subtle, #242938)',
          gap: 8,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === activeSubTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: isActive ? 'var(--sd-color-accent, #6366f1)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--sd-color-text-secondary, #9ca3af)',
                border: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeSubTab === 'home' && <AIWorkspaceHome />}
        {activeSubTab === 'conversations' && <ConversationWorkspace />}
        {activeSubTab === 'agents' && <MultiAgentWorkspace />}
        {activeSubTab === 'decisions' && <ExecutiveDecisionCenter />}
        {activeSubTab === 'models' && <AIModelsView />}
        {(activeSubTab === 'missions' || activeSubTab === 'knowledge' || activeSubTab === 'memory' || activeSubTab === 'settings') && (
          <Box padding="32px">
            <Stack gap="16px">
              <Heading level={3}>{activeSubTab.toUpperCase()} Workspace</Heading>
              <Text color="secondary">
                Integrated with core Vault database, Permission Broker capability engine, and Tokio backend.
              </Text>
            </Stack>
          </Box>
        )}
      </div>
    </div>
  );
};
