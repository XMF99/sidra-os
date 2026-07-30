import { FC } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { ChatBubble } from '@sidra/ui';
import { PromptComposer } from './PromptComposer';

export const ConversationWorkspace: FC = () => {
  const { messages } = useAIWorkspaceStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={new Date(msg.timestamp).toLocaleTimeString()}
            senderName={msg.senderName}
          />
        ))}
      </div>

      {/* Prompt Composer Bottom Input */}
      <PromptComposer />
    </div>
  );
};
