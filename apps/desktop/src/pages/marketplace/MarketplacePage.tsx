import { FC, useState } from 'react';
import { NaturalLanguageGeneratorView } from '../../components/marketplace/NaturalLanguageGeneratorView';
import { CapabilityPackCatalog } from '../../components/marketplace/CapabilityPackCatalog';
import { WorkspaceBlueprintEditor } from '../../components/marketplace/WorkspaceBlueprintEditor';
import { InstallationManagerModal } from '../../components/marketplace/InstallationManagerModal';
import { Heading, Text, Box } from '@sidra/ui';

export const MarketplacePage: FC = () => {
  const [subTab, setSubTab] = useState<'generate' | 'packs' | 'blueprints' | 'inventory'>('generate');

  const tabs: { id: typeof subTab; label: string; icon: string }[] = [
    { id: 'generate', label: 'Natural Language Generator', icon: '✨' },
    { id: 'packs', label: 'Capability Packs', icon: '📦' },
    { id: 'blueprints', label: 'Workspace Blueprints', icon: '📐' },
    { id: 'inventory', label: 'Installed Inventory', icon: '⚡' },
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
          const isActive = t.id === subTab;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
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
        {subTab === 'generate' && <NaturalLanguageGeneratorView />}
        {subTab === 'packs' && <CapabilityPackCatalog />}
        {subTab === 'blueprints' && <WorkspaceBlueprintEditor />}
        {subTab === 'inventory' && (
          <Box padding="24px">
            <Heading level={3}>Capability Inventory & Offline Local Repository</Heading>
            <Text color="secondary" style={{ marginTop: 8 }}>
              All capability packages remain fully operational offline using the local Vault event store.
            </Text>
          </Box>
        )}
      </div>

      {/* Modular Installation Manager Modal */}
      <InstallationManagerModal />
    </div>
  );
};
