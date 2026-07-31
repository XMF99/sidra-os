import { FC, useState } from 'react';
import { ExecutiveWorkspaceView } from '../../components/executive-suite/ExecutiveWorkspaceView';
import { AiExecutiveBoardView } from '../../components/executive-suite/AiExecutiveBoardView';
import { ExecutiveWarRoomView } from '../../components/executive-suite/ExecutiveWarRoomView';
import { ExecutiveDecisionCenterView } from '../../components/executive-suite/ExecutiveDecisionCenterView';
import { ExecutiveBriefingCenterView } from '../../components/executive-suite/ExecutiveBriefingCenterView';
import { FinancialSnapshotView } from '../../components/executive-suite/FinancialSnapshotView';
import { EnterpriseRadarView } from '../../components/executive-suite/EnterpriseRadarView';
import { ExecutiveMemoryView } from '../../components/executive-suite/ExecutiveMemoryView';

export const ExecutiveSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'board' | 'warroom' | 'decisions' | 'briefing' | 'financials' | 'radar' | 'memory'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'CEO Workspace ⭐', icon: '🏛️' },
    { id: 'board', label: 'AI Executive Board ⭐', icon: '👔' },
    { id: 'warroom', label: 'Executive War Room ⭐', icon: '🚨' },
    { id: 'decisions', label: 'Decision Center', icon: '⚖️' },
    { id: 'briefing', label: 'Briefing Center', icon: '🌅' },
    { id: 'financials', label: 'Financial Snapshot', icon: '💰' },
    { id: 'radar', label: 'Enterprise Radar', icon: '📡' },
    { id: 'memory', label: 'Executive Memory', icon: '🧠' },
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
        {activeTab === 'workspace' && <ExecutiveWorkspaceView />}
        {activeTab === 'board' && <AiExecutiveBoardView />}
        {activeTab === 'warroom' && <ExecutiveWarRoomView />}
        {activeTab === 'decisions' && <ExecutiveDecisionCenterView />}
        {activeTab === 'briefing' && <ExecutiveBriefingCenterView />}
        {activeTab === 'financials' && <FinancialSnapshotView />}
        {activeTab === 'radar' && <EnterpriseRadarView />}
        {activeTab === 'memory' && <ExecutiveMemoryView />}
      </div>
    </div>
  );
};
