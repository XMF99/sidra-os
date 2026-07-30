import { FC } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { ChatBubble, ThinkingIndicator } from '@sidra/ui';
import { PrimaryPromptComposer } from './PrimaryPromptComposer';
import { ConversationActionsMenu } from './ConversationActionsMenu';

export const ConversationEngineUI: FC = () => {
  const { threads, activeThreadId, isGenerating } = useThekyConsoleStore();

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Scrollable Virtualized Message List */}
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {activeThread.messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 20 }}>
            <ChatBubble
              role={msg.role}
              content={
                <div>
                  <div>{msg.content}</div>
                  {msg.role === 'assistant' && (
                    <ConversationActionsMenu
                      messageId={msg.id}
                      convertedAction={msg.actionConverted}
                    />
                  )}
                </div>
              }
              timestamp={new Date(msg.timestamp).toLocaleTimeString()}
              senderName={msg.senderName}
            />
          </div>
        ))}

        {isGenerating && (
          <div style={{ marginBottom: 20 }}>
            <ThinkingIndicator label="THEKY is evaluating security token policy & routing execution..." />
          </div>
        )}
      </div>

      {/* Bottom Primary Prompt Composer */}
      <div style={{ padding: 16, backgroundColor: 'var(--sd-color-surface-raised, #12151e)', borderTop: '1px solid var(--sd-color-border-subtle, #242938)' }}>
        <PrimaryPromptComposer />
      </div>
    </div>
  );
};
