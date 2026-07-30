import { FC, useState, useRef } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Button, Icon, Text } from '@sidra/ui';

export const PrimaryPromptComposer: FC<{ isCentered?: boolean }> = ({ isCentered = false }) => {
  const [prompt, setPrompt] = useState<string>('');
  const { sendPrompt, attachedFiles, addAttachment, removeAttachment } = useThekyConsoleStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!prompt.trim() && attachedFiles.length === 0) return;
    sendPrompt(prompt);
    setPrompt('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach((f) => {
      addAttachment({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: f.type || 'file' });
    });
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isCentered ? 720 : '100%',
        margin: isCentered ? '0 auto' : '0',
        backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
        border: '1px solid var(--sd-color-border-default, #2e3548)',
        borderRadius: 12,
        padding: 16,
        boxShadow: 'var(--sd-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.5))',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      {/* Attached Files Badges */}
      {attachedFiles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818cf8',
                fontSize: 12,
              }}
            >
              <Icon name="FileText" size={14} />
              <span>{file.name} ({file.size})</span>
              <button
                onClick={() => removeAttachment(file.id)}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: 4 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Multi-line Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask THEKY anything, type '/' for slash commands (/task, /project, /doc, /workspace)..."
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        style={{
          width: '100%',
          minHeight: isCentered ? 96 : 64,
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--sd-color-text-primary, #f3f4f6)',
          fontSize: 15,
          fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
          lineHeight: 1.5,
          resize: 'vertical',
        }}
      />

      {/* Action Bar & Attachment Input */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Icon name="Paperclip" size={16} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Attach Files
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrompt((prev) => prev + ' /workspace')}
          >
            /workspace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrompt((prev) => prev + ' /project')}
          >
            /project
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text size="xs" color="muted">
            Shift + Enter for line break
          </Text>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<Icon name="ArrowRight" size={16} />}
            onClick={handleSend}
          >
            Ask THEKY
          </Button>
        </div>
      </div>
    </div>
  );
};
