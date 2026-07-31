import { FC, useState } from 'react';
import { OperationsWorkspaceView } from '../../components/operations-suite/OperationsWorkspaceView';
import { AiCooAdvisorView } from '../../components/operations-suite/AiCooAdvisorView';
import { ExecutionControlCenterView } from '../../components/operations-suite/ExecutionControlCenterView';
import { ResourceWorkflowView } from '../../components/operations-suite/ResourceWorkflowView';
import { OperationsDigitalTwinView } from '../../components/operations-suite/OperationsDigitalTwinView';
import { AiOperationsAuditorView } from '../../components/operations-suite/AiOperationsAuditorView';
import { OperationsReportingCenterView } from '../../components/operations-suite/OperationsReportingCenterView';

export const OperationsSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'coo' | 'execution' | 'resources' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Operations Workspace', icon: '⚙️' },
    { id: 'coo', label: 'AI COO ⭐', icon: '🤖' },
    { id: 'execution', label: 'Execution Control', icon: '🎯' },
    { id: 'resources', label: 'Resource & Workflows', icon: '⚡' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '🔄' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Operations Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <OperationsWorkspaceView />}
        {activeTab === 'coo' && <AiCooAdvisorView />}
        {activeTab === 'execution' && <ExecutionControlCenterView />}
        {activeTab === 'resources' && <ResourceWorkflowView />}
        {activeTab === 'twin' && <OperationsDigitalTwinView />}
        {activeTab === 'auditor' && <AiOperationsAuditorView />}
        {activeTab === 'reports' && <OperationsReportingCenterView />}
      </div>
    </div>
  );
};
