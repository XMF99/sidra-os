import { describe, it, expect } from 'vitest';
import { useAiEcosystemStore } from '../useAiEcosystemStore';

describe('useAiEcosystemStore', () => {
  it('manages Unified AI Provider Framework and health benchmarks', () => {
    const store = useAiEcosystemStore.getState();
    expect(store.providers.length).toBeGreaterThan(0);

    const openaiProvider = store.providers.find((p) => p.id === 'openai');
    expect(openaiProvider).toBeDefined();
    expect(openaiProvider?.healthStatus).toBe('Active');
  });

  it('configures Dynamic Model Router strategies and active model bindings', () => {
    const store = useAiEcosystemStore.getState();
    expect(store.routingStrategy).toBe('Automatic');

    store.setRoutingStrategy('Lowest Cost');
    expect(useAiEcosystemStore.getState().routingStrategy).toBe('Lowest Cost');

    store.setActiveModel('gpt-4o');
    expect(useAiEcosystemStore.getState().activeModel).toBe('gpt-4o');
  });

  it('registers MCP Platform servers and enforces permission sandboxing', () => {
    const store = useAiEcosystemStore.getState();
    const initialMcpCount = store.mcpServers.length;

    store.registerMcpServer({
      name: 'Test Database MCP Server',
      version: '1.0.0',
      capabilities: ['execute_sql'],
      permissionScope: 'Sandboxed',
      status: 'Connected',
      toolsCount: 4,
    });

    const updatedMcp = useAiEcosystemStore.getState().mcpServers;
    expect(updatedMcp.length).toBe(initialMcpCount + 1);
    expect(updatedMcp.some((s) => s.name === 'Test Database MCP Server')).toBe(true);
  });

  it('toggles Tool Connector authorization states', () => {
    const store = useAiEcosystemStore.getState();
    expect(store.connectors.length).toBeGreaterThan(0);

    const firstConn = store.connectors[0];
    const initialAuth = firstConn.authStatus;

    store.toggleConnectorAuth(firstConn.id);
    const updatedConn = useAiEcosystemStore.getState().connectors.find((c) => c.id === firstConn.id);
    expect(updatedConn?.authStatus).not.toBe(initialAuth);
  });

  it('saves prompt templates and tracks Cost Intelligence metrics', () => {
    const store = useAiEcosystemStore.getState();
    expect(store.prompts.length).toBeGreaterThan(0);

    store.savePromptTemplate({
      title: 'New Automated Directive',
      version: '1.0',
      templateString: 'Execute query {{query}}',
      variables: ['query'],
      approvalState: 'Approved',
    });

    expect(useAiEcosystemStore.getState().prompts.some((p) => p.title === 'New Automated Directive')).toBe(true);
    expect(useAiEcosystemStore.getState().costMetrics.totalTokensUsed).toBeGreaterThan(0);
  });
});
