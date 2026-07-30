import { FC, useState } from 'react';
import { BusinessSolutionRegistryView } from '../../components/solution-composer/BusinessSolutionRegistryView';
import { SolutionComposerWorkspaceView } from '../../components/solution-composer/SolutionComposerWorkspaceView';
import { EnterpriseBlueprintGeneratorView } from '../../components/solution-composer/EnterpriseBlueprintGeneratorView';
import { SolutionTemplatesCatalogView } from '../../components/solution-composer/SolutionTemplatesCatalogView';
import { BusinessImpactAnalyticsView } from '../../components/solution-composer/BusinessImpactAnalyticsView';

export const BusinessSolutionPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'composer' | 'blueprints' | 'templates' | 'impact'>('registry');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'registry', label: 'Solution Registry', icon: '🏢' },
    { id: 'composer', label: 'Solution Composer', icon: '🎨' },
    { id: 'blueprints', label: 'Blueprints Generator ⭐', icon: '📐' },
    { id: 'templates', label: 'Templates Catalog', icon: '📑' },
    { id: 'impact', label: 'Impact Analytics ⭐', icon: '📊' },
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
        {activeTab === 'registry' && <BusinessSolutionRegistryView />}
        {activeTab === 'composer' && <SolutionComposerWorkspaceView />}
        {activeTab === 'blueprints' && <EnterpriseBlueprintGeneratorView />}
        {activeTab === 'templates' && <SolutionTemplatesCatalogView />}
        {activeTab === 'impact' && <BusinessImpactAnalyticsView />}
      </div>
    </div>
  );
};
