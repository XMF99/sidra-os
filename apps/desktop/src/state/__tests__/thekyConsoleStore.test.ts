import { describe, it, expect } from 'vitest';
import { useThekyConsoleStore } from '../useThekyConsoleStore';

describe('useThekyConsoleStore', () => {
  it('sends prompt to THEKY single AI identity', () => {
    const store = useThekyConsoleStore.getState();
    store.sendPrompt('Analyze market telemetry');
    const thread = useThekyConsoleStore.getState().threads[0];
    const userMsg = thread.messages.find((m) => m.content === 'Analyze market telemetry');
    expect(userMsg).toBeDefined();
    expect(userMsg?.senderName).toBe('You');
  });

  it('manages attachments', () => {
    const store = useThekyConsoleStore.getState();
    store.addAttachment({ name: 'financial_report.pdf', size: '1.2 MB', type: 'application/pdf' });
    expect(useThekyConsoleStore.getState().attachedFiles.length).toBe(1);
    store.clearAttachments();
    expect(useThekyConsoleStore.getState().attachedFiles.length).toBe(0);
  });

  it('converts conversation response output to action item', () => {
    const store = useThekyConsoleStore.getState();
    const thread = store.threads[0];
    const targetMsgId = thread.messages[0].id;
    store.convertMessageToAction(targetMsgId, 'Task');
    const updatedMsg = useThekyConsoleStore.getState().threads[0].messages.find((m) => m.id === targetMsgId);
    expect(updatedMsg?.actionConverted?.type).toBe('Task');
  });

  it('toggles hidden Developer Mode state', () => {
    const store = useThekyConsoleStore.getState();
    const initialDev = store.isDeveloperModeEnabled;
    store.toggleDeveloperMode();
    expect(useThekyConsoleStore.getState().isDeveloperModeEnabled).toBe(!initialDev);
  });

  it('creates new conversation thread', () => {
    const initialCount = useThekyConsoleStore.getState().threads.length;
    useThekyConsoleStore.getState().createNewThread();
    expect(useThekyConsoleStore.getState().threads.length).toBe(initialCount + 1);
  });
});
