import { FC, useState } from 'react';
import { ExecutiveControlTowerDashboard } from '../../components/orchestrator/ExecutiveControlTowerDashboard';
import { ExecutionContractEditor } from '../../components/orchestrator/ExecutionContractEditor';
import { MissionDecompositionTreeView } from '../../components/orchestrator/MissionDecompositionTreeView';
import { FailureRecoveryInspector } from '../../components/orchestrator/FailureRecoveryInspector';
import { AutonomousPolicySelector } from '../../components/orchestrator/AutonomousPolicySelector';

export const ExecutiveControlTowerPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'tower' | 'contracts' | 'decomposition' | 'recovery' | 'policies'>('tower');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'tower', label: 'Control Tower ⭐', icon: '📡' },
    { id: 'contracts', label: 'Execution Contracts ⭐', icon: '📜' },
    { id: 'decomposition', label: 'Mission DAG Tree', icon: '🌳' },
    { id: 'recovery', label: 'Failure Recovery', icon: '🛠️' },
    { id: 'policies', label: 'Autonomous Policies', icon: '🛡️' },
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
        {activeTab === 'tower' && <ExecutiveControlTowerDashboard />}
        {activeTab === 'contracts' && <ExecutionContractEditor />}
        {activeTab === 'decomposition' && <MissionDecompositionTreeView />}
        {activeTab === 'recovery' && <FailureRecoveryInspector />}
        {activeTab === 'policies' && <AutonomousPolicySelector />}
      </div>
    </div>
  );
};
