import { FC, useState } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Stack, TextInput, Button, Icon, Text } from '@sidra/ui';

export const ConversationHistorySidebar: FC = () => {
  const { threads, activeThreadId, selectThread, createNewThread, togglePinThread, deleteThread } = useThekyConsoleStore();
  const [search, setSearch] = useState('');

  const filtered = threads.filter((t) =>
    !t.archived && (t.title.toLowerCase().includes(search.toLowerCase()) || t.preview.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      style={{
        width: 260,
        height: '100%',
        backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
        borderRight: '1px solid var(--sd-color-border-subtle, #242938)',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        boxSizing: 'border-box',
      }}
    >
      <Stack gap="12px" style={{ height: '100%' }}>
        <Button
          variant="primary"
          leftIcon={<Icon name="Plus" size={16} />}
          onClick={createNewThread}
          style={{ width: '100%' }}
        >
          New Conversation
        </Button>

        <TextInput
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Icon name="Search" size={14} />}
        />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map((t) => {
            const isActive = t.id === activeThreadId;
            return (
              <div
                key={t.id}
                onClick={() => selectThread(t.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: isActive ? 'var(--sd-color-surface-overlay, #1a1e2b)' : 'transparent',
                  border: isActive ? '1px solid var(--sd-color-accent, #6366f1)' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: 6,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text weight={isActive ? 'semibold' : 'regular'} size="sm" color="primary">
                    {t.title}
                  </Text>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinThread(t.id);
                      }}
                      style={{ background: 'none', border: 'none', color: t.pinned ? '#6366f1' : '#6b7280', cursor: 'pointer' }}
                    >
                      📌
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(t.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <Text size="xs" color="muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', marginTop: 2 }}>
                  {t.preview}
                </Text>
              </div>
            );
          })}
        </div>
      </Stack>
    </div>
  );
};
