import { FC, useState } from 'react';
import { FinanceWorkspaceView } from '../../components/finance-suite/FinanceWorkspaceView';
import { AiCfoAdvisorView } from '../../components/finance-suite/AiCfoAdvisorView';
import { GeneralLedgerView } from '../../components/finance-suite/GeneralLedgerView';
import { AccountsReceivablePayableView } from '../../components/finance-suite/AccountsReceivablePayableView';
import { FinancialDigitalTwinView } from '../../components/finance-suite/FinancialDigitalTwinView';
import { AiFinancialAuditorView } from '../../components/finance-suite/AiFinancialAuditorView';
import { FinancialReportingCenterView } from '../../components/finance-suite/FinancialReportingCenterView';

export const FinanceSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'cfo' | 'ledger' | 'arap' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Finance Workspace', icon: '💰' },
    { id: 'cfo', label: 'AI CFO ⭐', icon: '🤖' },
    { id: 'ledger', label: 'General Ledger', icon: '📖' },
    { id: 'arap', label: 'AR & AP', icon: '📑' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Financial Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <FinanceWorkspaceView />}
        {activeTab === 'cfo' && <AiCfoAdvisorView />}
        {activeTab === 'ledger' && <GeneralLedgerView />}
        {activeTab === 'arap' && <AccountsReceivablePayableView />}
        {activeTab === 'twin' && <FinancialDigitalTwinView />}
        {activeTab === 'auditor' && <AiFinancialAuditorView />}
        {activeTab === 'reports' && <FinancialReportingCenterView />}
      </div>
    </div>
  );
};
