import { FC, useState } from 'react';
import { ExecutiveCommandCenterView } from '../../components/autonomous-org/ExecutiveCommandCenterView';
import { HybridWorkforceRegistryView } from '../../components/autonomous-org/HybridWorkforceRegistryView';
import { DepartmentRuntimeView } from '../../components/autonomous-org/DepartmentRuntimeView';
import { DailyBriefingEngineView } from '../../components/autonomous-org/DailyBriefingEngineView';
import { AutonomousDecisionEngineView } from '../../components/autonomous-org/AutonomousDecisionEngineView';
import { OperationalAnalyticsView } from '../../components/autonomous-org/OperationalAnalyticsView';

export const AutonomousOrgPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'command' | 'workforce' | 'runtime' | 'briefing' | 'decisions' | 'analytics'>('command');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'command', label: 'Command Center ⭐', icon: '🏛️' },
    { id: 'workforce', label: 'Hybrid Workforce', icon: '👥' },
    { id: 'runtime', label: 'Department Runtime', icon: '⚙️' },
    { id: 'briefing', label: 'Daily Briefing ⭐', icon: '🌅' },
    { id: 'decisions', label: 'Autonomous Decisions', icon: '⚖️' },
    { id: 'analytics', label: 'Operational Telemetry', icon: '📊' },
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
        {activeTab === 'command' && <ExecutiveCommandCenterView />}
        {activeTab === 'workforce' && <HybridWorkforceRegistryView />}
        {activeTab === 'runtime' && <DepartmentRuntimeView />}
        {activeTab === 'briefing' && <DailyBriefingEngineView />}
        {activeTab === 'decisions' && <AutonomousDecisionEngineView />}
        {activeTab === 'analytics' && <OperationalAnalyticsView />}
      </div>
    </div>
  );
};
