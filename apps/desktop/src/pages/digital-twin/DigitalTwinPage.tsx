import { FC, useState } from 'react';
import { DigitalTwinSandboxInspector } from '../../components/digital-twin/DigitalTwinSandboxInspector';
import { ScenarioSimulationMatrixView } from '../../components/digital-twin/ScenarioSimulationMatrixView';
import { WhatIfAnalysisView } from '../../components/digital-twin/WhatIfAnalysisView';
import { ResourceOptimizerView } from '../../components/digital-twin/ResourceOptimizerView';
import { OpportunityDiscoveryView } from '../../components/digital-twin/OpportunityDiscoveryView';
import { ExecutionPreviewModal } from '../../components/digital-twin/ExecutionPreviewModal';

export const DigitalTwinPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'scenarios' | 'whatif' | 'optimizer' | 'opportunities'>('sandbox');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'sandbox', label: 'Digital Twin Sandbox', icon: '🌐' },
    { id: 'scenarios', label: 'Scenario Matrix', icon: '📊' },
    { id: 'whatif', label: 'What-If Foresight', icon: '🔮' },
    { id: 'optimizer', label: 'Resource Optimizer ⭐', icon: '⚡' },
    { id: 'opportunities', label: 'Opportunities ⭐', icon: '✨' },
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
        {activeTab === 'sandbox' && <DigitalTwinSandboxInspector />}
        {activeTab === 'scenarios' && <ScenarioSimulationMatrixView />}
        {activeTab === 'whatif' && <WhatIfAnalysisView />}
        {activeTab === 'optimizer' && <ResourceOptimizerView />}
        {activeTab === 'opportunities' && <OpportunityDiscoveryView />}
      </div>

      {/* Execution Preview Modal */}
      <ExecutionPreviewModal />
    </div>
  );
};
