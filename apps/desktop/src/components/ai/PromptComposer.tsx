import { FC, useState } from 'react';
import { useAIWorkspaceStore } from '../../state/useAIWorkspaceStore';
import { Stack, Button, Icon, Text } from '@sidra/ui';

export const PromptComposer: FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const { addMessage, selectedModelId, models } = useAIWorkspaceStore();

  const activeModel = models.find((m) => m.id === selectedModelId) ?? models[0];
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  const estimatedCost = (wordCount * activeModel.costPer1k) / 1000;

  const handleSend = () => {
    if (!prompt.trim()) return;
    addMessage({
      role: 'user',
      content: prompt,
      senderName: 'You',
    });
    setPrompt('');

    // Simulate AI response stream
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `Acknowledged executive command. Processing objective using provider **${activeModel.name}**. State transition appended to SQLite event log.`,
        senderName: 'Executive AI Agent',
      });
    }, 600);
  };

  return (
    <Stack gap="12px" style={{ width: '100%', padding: 16, backgroundColor: 'var(--sd-color-surface-raised, #12151e)', borderTop: '1px solid var(--sd-color-border-subtle, #242938)' }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type a command, ask a question, or type '/' for prompt templates..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        style={{
          width: '100%',
          minHeight: 64,
          backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
          border: '1px solid var(--sd-color-border-default, #2e3548)',
          borderRadius: 8,
          padding: 12,
          color: 'var(--sd-color-text-primary, #f3f4f6)',
          fontSize: 14,
          fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text size="xs" color="muted">
            Model: <strong style={{ color: '#818cf8' }}>{activeModel.name}</strong>
          </Text>
          <Text size="xs" color="muted">
            Tokens: {wordCount * 2} | Est. Cost: ${estimatedCost.toFixed(6)}
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrompt((prev) => prev + ' /summarize')}
          >
            /summarize
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="Send" size={14} />}
            onClick={handleSend}
          >
            Send Command
          </Button>
        </div>
      </div>
    </Stack>
  );
};
