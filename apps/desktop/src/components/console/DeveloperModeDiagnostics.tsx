import { FC } from 'react';
import { useThekyConsoleStore } from '../../state/useThekyConsoleStore';
import { Stack, Box, Heading, Text, StatusBadge, Button } from '@sidra/ui';

export const DeveloperModeDiagnostics: FC = () => {
  const { isDeveloperModeEnabled, toggleDeveloperMode, threads, activeThreadId } = useThekyConsoleStore();

  if (!isDeveloperModeEnabled) return null;

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const lastMsg = activeThread.messages[activeThread.messages.length - 1];
  const diag = lastMsg?.devDiagnostics;

  return (
    <div
      role="dialog"
      aria-label="Developer Mode Telemetry Diagnostics"
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 360,
        backgroundColor: '#050608',
        borderLeft: '1px solid #6366f1',
        zIndex: 9999,
        padding: 20,
        boxShadow: '-4px 0 16px rgba(0,0,0,0.6)',
        color: '#f3f4f6',
        fontFamily: 'monospace',
        fontSize: 12,
        overflowY: 'auto',
      }}
    >
      <Stack gap="16px">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading level={4} style={{ color: '#818cf8' }}>⚙️ Developer Mode Telemetry</Heading>
          <Button variant="ghost" size="sm" onClick={toggleDeveloperMode}>
            Close
          </Button>
        </div>

        <StatusBadge status="active">HIDDEN DIAGNOSTICS ACTIVE</StatusBadge>

        <Text size="xs" color="muted">
          Internal Execution Router Telemetry (Never shown in standard user UI):
        </Text>

        <Box padding="12px" bg="#12151e" borderRadius="6px" border="1px solid #2e3548">
          <div><strong style={{ color: '#60a5fa' }}>Internal Model Routed:</strong></div>
          <div style={{ color: '#f3f4f6', marginTop: 4 }}>{diag?.modelRouted ?? 'Local Ollama Sidecar (Auto)'}</div>
        </Box>

        <Box padding="12px" bg="#12151e" borderRadius="6px" border="1px solid #2e3548">
          <div><strong style={{ color: '#34d399' }}>Execution Latency:</strong> {diag?.latencyMs ?? 120}ms</div>
          <div style={{ marginTop: 4 }}><strong style={{ color: '#fbbf24' }}>Total Tokens:</strong> {diag?.tokensTotal ?? 145}</div>
        </Box>

        <Box padding="12px" bg="#12151e" borderRadius="6px" border="1px solid #2e3548">
          <div><strong style={{ color: '#c084fc' }}>Execution Graph Trace:</strong></div>
          <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
            {(diag?.executionGraph ?? ['TokenBroker::eval', 'Vault::verify_hash', 'THEKY::synthesize']).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </Box>

        <Text size="xs" color="muted" style={{ fontStyle: 'italic', marginTop: 12 }}>
          Press Ctrl+Shift+D to toggle Developer Mode off.
        </Text>
      </Stack>
    </div>
  );
};
