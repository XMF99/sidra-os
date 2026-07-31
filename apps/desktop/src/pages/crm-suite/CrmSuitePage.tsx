import { FC, useState } from 'react';
import { CustomerWorkspaceView } from '../../components/crm-suite/CustomerWorkspaceView';
import { AiCcoAdvisorView } from '../../components/crm-suite/AiCcoAdvisorView';
import { SalesPipelineView } from '../../components/crm-suite/SalesPipelineView';
import { CustomerSuccessSupportView } from '../../components/crm-suite/CustomerSuccessSupportView';
import { CrmDigitalTwinView } from '../../components/crm-suite/CrmDigitalTwinView';
import { AiCustomerAuditorView } from '../../components/crm-suite/AiCustomerAuditorView';
import { CrmReportingCenterView } from '../../components/crm-suite/CrmReportingCenterView';

export const CrmSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'cco' | 'pipeline' | 'success' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Customer Workspace', icon: '🤝' },
    { id: 'cco', label: 'AI CCO ⭐', icon: '🤖' },
    { id: 'pipeline', label: 'Sales Pipeline', icon: '💼' },
    { id: 'success', label: 'CS & Support', icon: '🎧' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'CRM Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <CustomerWorkspaceView />}
        {activeTab === 'cco' && <AiCcoAdvisorView />}
        {activeTab === 'pipeline' && <SalesPipelineView />}
        {activeTab === 'success' && <CustomerSuccessSupportView />}
        {activeTab === 'twin' && <CrmDigitalTwinView />}
        {activeTab === 'auditor' && <AiCustomerAuditorView />}
        {activeTab === 'reports' && <CrmReportingCenterView />}
      </div>
    </div>
  );
};
