import { FC, useEffect, useState } from 'react';
import { useContextEngineStore } from '../../state/useContextEngineStore';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Box, Heading, Text, TextInput, StatusBadge, Icon } from '@sidra/ui';

export const GlobalCommandCenterModal: FC = () => {
  const { isCommandCenterOpen, closeCommandCenter, toggleCommandCenter, classifyIntent } = useContextEngineStore();
  const { sendPrompt } = useThekyConsoleStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandCenter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandCenter]);

  if (!isCommandCenterOpen) return null;

  const detectedIntent = query.trim() ? classifyIntent(query) : 'Search';

  const handleExecuteCommand = (commandText: string) => {
    sendPrompt(commandText);
    closeCommandCenter();
    setQuery('');
    window.location.hash = '#/console';
  };

  const quickCommands = [
    { label: 'Generate Game Studio Workspace', action: 'I want a game studio with narrative AI' },
    { label: 'Create New Project DAG', action: 'Create a new project DAG for kernel performance' },
    { label: 'Perform Security Token Audit', action: 'Perform a security audit using Permission Broker' },
    { label: 'Open Organization Spaces', action: 'Open Organization Spaces manager' },
  ];

  return (
    <div
      role="dialog"
      aria-label="THEKY Global Command Center"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 100,
      }}
      onClick={closeCommandCenter}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, width: '100%' }}>
        <Box
          padding="24px"
          bg="var(--sd-color-surface-raised, #12151e)"
          borderRadius="12px"
          border="1px solid var(--sd-color-accent, #6366f1)"
          style={{ width: '100%', boxShadow: '0 12px 32px rgba(0,0,0,0.8)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="Sparkles" size={18} color="var(--sd-color-accent, #6366f1)" />
                <Heading level={3}>THEKY Command Center</Heading>
              </div>
              <StatusBadge status="active">INTENT: {detectedIntent.toUpperCase()}</StatusBadge>
            </div>

            <TextInput
              placeholder="Ask THEKY, search, or type slash command (/workspace, /project)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  e.preventDefault();
                  handleExecuteCommand(query);
                }
              }}
            />

            <div>
              <Text size="xs" weight="semibold" color="muted" style={{ marginBottom: 8, display: 'block' }}>
                Suggested Actions & Commands:
              </Text>
              {quickCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={() => handleExecuteCommand(cmd.action)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: '#050608',
                    border: '1px solid #2e3548',
                    cursor: 'pointer',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text size="sm" color="primary">{cmd.label}</Text>
                  <Icon name="ArrowRight" size={14} color="#818cf8" />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
              <span>Press <strong>ESC</strong> to exit</span>
              <span>Press <strong>⌘K</strong> to toggle</span>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};
