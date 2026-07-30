import { FC, useState } from 'react';
import { EnterpriseRegistryView } from '../../components/enterprise-composer/EnterpriseRegistryView';
import { DepartmentComposerView } from '../../components/enterprise-composer/DepartmentComposerView';
import { InteractiveOrgChartView } from '../../components/enterprise-composer/InteractiveOrgChartView';
import { MasterEnterpriseBlueprintView } from '../../components/enterprise-composer/MasterEnterpriseBlueprintView';
import { EnterpriseTemplatesCatalogView } from '../../components/enterprise-composer/EnterpriseTemplatesCatalogView';
import { EnterpriseAnalyticsView } from '../../components/enterprise-composer/EnterpriseAnalyticsView';

export const EnterprisePlatformPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'departments' | 'orgchart' | 'blueprints' | 'templates' | 'analytics'>('registry');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'registry', label: 'Enterprise Registry', icon: '🏢' },
    { id: 'departments', label: 'Departments', icon: '🏬' },
    { id: 'orgchart', label: 'Interactive Org Chart ⭐', icon: '🌳' },
    { id: 'blueprints', label: 'Master Blueprints ⭐', icon: '📐' },
    { id: 'templates', label: 'Templates Catalog', icon: '📑' },
    { id: 'analytics', label: 'Enterprise Intelligence', icon: '📈' },
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
        {activeTab === 'registry' && <EnterpriseRegistryView />}
        {activeTab === 'departments' && <DepartmentComposerView />}
        {activeTab === 'orgchart' && <InteractiveOrgChartView />}
        {activeTab === 'blueprints' && <MasterEnterpriseBlueprintView />}
        {activeTab === 'templates' && <EnterpriseTemplatesCatalogView />}
        {activeTab === 'analytics' && <EnterpriseAnalyticsView />}
      </div>
    </div>
  );
};
