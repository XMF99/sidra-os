import { FC, useState } from 'react';
import { SalesWorkspaceView } from '../../components/sales-suite/SalesWorkspaceView';
import { AiCroAdvisorView } from '../../components/sales-suite/AiCroAdvisorView';
import { OpportunityQuoteCenterView } from '../../components/sales-suite/OpportunityQuoteCenterView';
import { ContractManagementView } from '../../components/sales-suite/ContractManagementView';
import { SalesDigitalTwinView } from '../../components/sales-suite/SalesDigitalTwinView';
import { AiRevenueAuditorView } from '../../components/sales-suite/AiRevenueAuditorView';
import { RevenueReportingCenterView } from '../../components/sales-suite/RevenueReportingCenterView';

export const SalesSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'cro' | 'opps' | 'contracts' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Sales Workspace', icon: '📈' },
    { id: 'cro', label: 'AI CRO ⭐', icon: '🎯' },
    { id: 'opps', label: 'Opportunities & Quotes', icon: '💼' },
    { id: 'contracts', label: 'Contracts & Renewals', icon: '📜' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Revenue Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <SalesWorkspaceView />}
        {activeTab === 'cro' && <AiCroAdvisorView />}
        {activeTab === 'opps' && <OpportunityQuoteCenterView />}
        {activeTab === 'contracts' && <ContractManagementView />}
        {activeTab === 'twin' && <SalesDigitalTwinView />}
        {activeTab === 'auditor' && <AiRevenueAuditorView />}
        {activeTab === 'reports' && <RevenueReportingCenterView />}
      </div>
    </div>
  );
};
