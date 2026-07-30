import { FC, useState } from 'react';
import { UnifiedProviderManager } from '../../components/ecosystem/UnifiedProviderManager';
import { DynamicModelRouterView } from '../../components/ecosystem/DynamicModelRouterView';
import { McpPlatformHubView } from '../../components/ecosystem/McpPlatformHubView';
import { ToolConnectorRegistryView } from '../../components/ecosystem/ToolConnectorRegistryView';
import { PromptManagementView } from '../../components/ecosystem/PromptManagementView';
import { CostIntelligenceDashboard } from '../../components/ecosystem/CostIntelligenceDashboard';

export const AiEcosystemPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'router' | 'mcp' | 'connectors' | 'prompts' | 'cost'>('providers');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'providers', label: 'AI Providers', icon: '🤖' },
    { id: 'router', label: 'Model Router', icon: '🔀' },
    { id: 'mcp', label: 'MCP Hub', icon: '🔌' },
    { id: 'connectors', label: 'Connectors', icon: '🔗' },
    { id: 'prompts', label: 'Prompt Library', icon: '📝' },
    { id: 'cost', label: 'Cost Intelligence', icon: '💰' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Sub-Tab Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          padding: '0 16px',
          backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
          borderBottom: '1px solid var(--sd-color-border-subtle, #242938)',
          gap: 8,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: isActive ? 'var(--sd-color-accent, #6366f1)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--sd-color-text-secondary, #9ca3af)',
                border: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {activeTab === 'providers' && <UnifiedProviderManager />}
        {activeTab === 'router' && <DynamicModelRouterView />}
        {activeTab === 'mcp' && <McpPlatformHubView />}
        {activeTab === 'connectors' && <ToolConnectorRegistryView />}
        {activeTab === 'prompts' && <PromptManagementView />}
        {activeTab === 'cost' && <CostIntelligenceDashboard />}
      </div>
    </div>
  );
};
