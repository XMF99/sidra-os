import { FC, useState } from 'react';
import { MarketingWorkspaceView } from '../../components/marketing-suite/MarketingWorkspaceView';
import { AiCmoAdvisorView } from '../../components/marketing-suite/AiCmoAdvisorView';
import { CampaignCenterView } from '../../components/marketing-suite/CampaignCenterView';
import { AudienceContentView } from '../../components/marketing-suite/AudienceContentView';
import { MarketingDigitalTwinView } from '../../components/marketing-suite/MarketingDigitalTwinView';
import { AiMarketingAuditorView } from '../../components/marketing-suite/AiMarketingAuditorView';
import { MarketingReportingCenterView } from '../../components/marketing-suite/MarketingReportingCenterView';

export const MarketingSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'cmo' | 'campaigns' | 'audience' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Marketing Workspace', icon: '📢' },
    { id: 'cmo', label: 'AI CMO ⭐', icon: '🤖' },
    { id: 'campaigns', label: 'Campaign Center', icon: '🚀' },
    { id: 'audience', label: 'Audience & Content', icon: '🎯' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Marketing Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <MarketingWorkspaceView />}
        {activeTab === 'cmo' && <AiCmoAdvisorView />}
        {activeTab === 'campaigns' && <CampaignCenterView />}
        {activeTab === 'audience' && <AudienceContentView />}
        {activeTab === 'twin' && <MarketingDigitalTwinView />}
        {activeTab === 'auditor' && <AiMarketingAuditorView />}
        {activeTab === 'reports' && <MarketingReportingCenterView />}
      </div>
    </div>
  );
};
