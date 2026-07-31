import { FC, useState } from 'react';
import { SupplyChainWorkspaceView } from '../../components/supply-chain-suite/SupplyChainWorkspaceView';
import { AiCscoAdvisorView } from '../../components/supply-chain-suite/AiCscoAdvisorView';
import { ProcurementSupplierView } from '../../components/supply-chain-suite/ProcurementSupplierView';
import { WarehouseLogisticsView } from '../../components/supply-chain-suite/WarehouseLogisticsView';
import { SupplyChainDigitalTwinView } from '../../components/supply-chain-suite/SupplyChainDigitalTwinView';
import { AiSupplyAuditorView } from '../../components/supply-chain-suite/AiSupplyAuditorView';
import { SupplyChainReportingCenterView } from '../../components/supply-chain-suite/SupplyChainReportingCenterView';

export const SupplyChainSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'csco' | 'procurement' | 'warehouse' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Supply Workspace', icon: '📦' },
    { id: 'csco', label: 'AI CSCO ⭐', icon: '🤖' },
    { id: 'procurement', label: 'Procurement & Suppliers', icon: '📝' },
    { id: 'warehouse', label: 'Warehouse & Logistics', icon: '🚚' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Supply Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <SupplyChainWorkspaceView />}
        {activeTab === 'csco' && <AiCscoAdvisorView />}
        {activeTab === 'procurement' && <ProcurementSupplierView />}
        {activeTab === 'warehouse' && <WarehouseLogisticsView />}
        {activeTab === 'twin' && <SupplyChainDigitalTwinView />}
        {activeTab === 'auditor' && <AiSupplyAuditorView />}
        {activeTab === 'reports' && <SupplyChainReportingCenterView />}
      </div>
    </div>
  );
};
