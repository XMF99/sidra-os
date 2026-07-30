import { FC, useEffect } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { ConversationHistorySidebar } from '../../components/console/ConversationHistorySidebar';
import { ThekyHomeLanding } from '../../components/console/ThekyHomeLanding';
import { ConversationEngineUI } from '../../components/console/ConversationEngineUI';
import { DeveloperModeDiagnostics } from '../../components/console/DeveloperModeDiagnostics';

export const ThekyConsolePage: FC = () => {
  const { threads, activeThreadId, toggleDeveloperMode } = useThekyConsoleStore();

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const isHomeView = activeThread.messages.length <= 1;

  // Keyboard shortcut listener for Ctrl+Shift+D (toggle Developer Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDeveloperMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDeveloperMode]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* History Sidebar */}
      <ConversationHistorySidebar />

      {/* Main Console Content View */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
        {isHomeView ? <ThekyHomeLanding /> : <ConversationEngineUI />}
      </div>

      {/* Hidden Developer Mode Telemetry Drawer */}
      <DeveloperModeDiagnostics />
    </div>
  );
};
