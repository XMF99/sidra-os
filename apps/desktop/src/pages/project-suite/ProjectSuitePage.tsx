import { FC, useState } from 'react';
import { PortfolioWorkspaceView } from '../../components/project-suite/PortfolioWorkspaceView';
import { AiPmoAdvisorView } from '../../components/project-suite/AiPmoAdvisorView';
import { ProgramProjectManagerView } from '../../components/project-suite/ProgramProjectManagerView';
import { ResourceFinancialsView } from '../../components/project-suite/ResourceFinancialsView';
import { ProjectDigitalTwinView } from '../../components/project-suite/ProjectDigitalTwinView';
import { AiPortfolioAuditorView } from '../../components/project-suite/AiPortfolioAuditorView';
import { ProjectReportingCenterView } from '../../components/project-suite/ProjectReportingCenterView';

export const ProjectSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'pmo' | 'programs' | 'resources' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Portfolio Workspace', icon: '📂' },
    { id: 'pmo', label: 'AI PMO ⭐', icon: '🤖' },
    { id: 'programs', label: 'Programs & Projects', icon: '🚀' },
    { id: 'resources', label: 'Resource & Financials', icon: '📈' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Project Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <PortfolioWorkspaceView />}
        {activeTab === 'pmo' && <AiPmoAdvisorView />}
        {activeTab === 'programs' && <ProgramProjectManagerView />}
        {activeTab === 'resources' && <ResourceFinancialsView />}
        {activeTab === 'twin' && <ProjectDigitalTwinView />}
        {activeTab === 'auditor' && <AiPortfolioAuditorView />}
        {activeTab === 'reports' && <ProjectReportingCenterView />}
      </div>
    </div>
  );
};
