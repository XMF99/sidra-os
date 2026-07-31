import { FC, useState } from 'react';
import { StudioWorkspaceView } from '../../components/game-studio-suite/StudioWorkspaceView';
import { AiStudioDirectorView } from '../../components/game-studio-suite/AiStudioDirectorView';
import { DesignArtProductionView } from '../../components/game-studio-suite/DesignArtProductionView';
import { EngineeringAudioView } from '../../components/game-studio-suite/EngineeringAudioView';
import { QaLiveOpsView } from '../../components/game-studio-suite/QaLiveOpsView';
import { StudioDigitalTwinView } from '../../components/game-studio-suite/StudioDigitalTwinView';
import { AiStudioAuditorView } from '../../components/game-studio-suite/AiStudioAuditorView';
import { GameReportingCenterView } from '../../components/game-studio-suite/GameReportingCenterView';

export const GameStudioSuitePage: FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'director' | 'design-art' | 'engineering' | 'qa-liveops' | 'twin' | 'auditor' | 'reports'>('workspace');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'workspace', label: 'Studio Workspace', icon: '🎮' },
    { id: 'director', label: 'AI Director & Agents ⭐', icon: '🤖' },
    { id: 'design-art', label: 'Design & Art', icon: '🎨' },
    { id: 'engineering', label: 'Engineering & Audio', icon: '⚙️' },
    { id: 'qa-liveops', label: 'QA, LiveOps & Stores', icon: '🚀' },
    { id: 'twin', label: 'Digital Twin ⭐', icon: '⚡' },
    { id: 'auditor', label: 'AI Auditor ⭐', icon: '🔍' },
    { id: 'reports', label: 'Studio Reports', icon: '📊' },
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
        {activeTab === 'workspace' && <StudioWorkspaceView />}
        {activeTab === 'director' && <AiStudioDirectorView />}
        {activeTab === 'design-art' && <DesignArtProductionView />}
        {activeTab === 'engineering' && <EngineeringAudioView />}
        {activeTab === 'qa-liveops' && <QaLiveOpsView />}
        {activeTab === 'twin' && <StudioDigitalTwinView />}
        {activeTab === 'auditor' && <AiStudioAuditorView />}
        {activeTab === 'reports' && <GameReportingCenterView />}
      </div>
    </div>
  );
};
