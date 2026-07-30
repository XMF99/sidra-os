import { FC, useState } from 'react';
import { useContextEngineStore } from '../../state/useContextEngineStore';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { StatusBadge, Icon } from '@sidra/ui';

export const UnifiedIntelligenceBar: FC = () => {
  const [query, setQuery] = useState('');
  const { classifyIntent, activeSpaceType, activeProjectName, openCommandCenter } = useContextEngineStore();
  const { sendPrompt } = useThekyConsoleStore();

  const detectedIntent = query.trim() ? classifyIntent(query) : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      sendPrompt(query);
      setQuery('');
      window.location.hash = '#/console';
    }
  };

  return (
    <div style={{ flex: 1, maxWidth: 640, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
      <div
        onClick={openCommandCenter}
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          height: 32,
          backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
          border: '1px solid var(--sd-color-border-default, #2e3548)',
          borderRadius: 6,
          padding: '0 10px',
          gap: 8,
          cursor: 'text',
        }}
      >
        <Icon name="Sparkles" size={14} color="var(--sd-color-accent, #6366f1)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask THEKY or search in ${activeProjectName || activeSpaceType || 'Workspace'}...`}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--sd-color-text-primary, #f3f4f6)',
            fontSize: 13,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          }}
        />

        {detectedIntent && (
          <StatusBadge status="active">INTENT: {detectedIntent.toUpperCase()}</StatusBadge>
        )}

        <kbd
          style={{
            fontSize: 11,
            backgroundColor: '#12151e',
            color: '#9ca3af',
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid #2e3548',
          }}
        >
          ⌘K
        </kbd>
      </div>
    </div>
  );
};
