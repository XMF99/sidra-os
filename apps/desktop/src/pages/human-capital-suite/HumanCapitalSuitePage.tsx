import { FC, useState } from 'react';
import { HumanCapitalWorkspaceView } from '../../components/human-capital-suite/HumanCapitalWorkspaceView';
import { AiChroAdvisorView } from '../../components/human-capital-suite/AiChroAdvisorView';
import { RecruitmentCenterView } from '../../components/human-capital-suite/RecruitmentCenterView';
import { EmployeeLifecycleView } from '../../components/human-capital-suite/EmployeeLifecycleView';
import { HumanCapitalDigitalTwinView } from '../../components/human-capital-suite/HumanCapitalDigitalTwinView';
import { AiWorkforceAuditorView } from '../../components/human-capital-suite/AiWorkforceAuditorView';
import { HrReportingCenterView } from '../../components/human-capital-suite/HrReportingCenterView';

export const HumanCapitalSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'chro' | 'recruitment' | 'lifecycle' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'People Workspace', icon: '👥' },
    { id: 'chro', label: 'AI CHRO ⭐', icon: '👔' },
    { id: 'recruitment', label: 'Recruitment Center', icon: '🎯' },
    { id: 'lifecycle', label: 'Employee Lifecycle', icon: '🌱' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'HR Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <HumanCapitalWorkspaceView />}
        {activeTab === 'chro' && <AiChroAdvisorView />}
        {activeTab === 'recruitment' && <RecruitmentCenterView />}
        {activeTab === 'lifecycle' && <EmployeeLifecycleView />}
        {activeTab === 'twin' && <HumanCapitalDigitalTwinView />}
        {activeTab === 'auditor' && <AiWorkforceAuditorView />}
        {activeTab === 'reports' && <HrReportingCenterView />}
      </div>
    </div>
  );
};
