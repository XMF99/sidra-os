import React, { useState } from 'react';
import {
  FolderKanban,
  Crosshair,
  BookOpen,
  Bot,
  Folder,
  Gamepad2,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

interface ProjectDetailWorkspaceProps {
  projectId?: string;
  onBack?: () => void;
}

export const ProjectDetailWorkspace: React.FC<ProjectDetailWorkspaceProps> = ({ projectId = 'gora', onBack }) => {
  const { setMissionWizardOpen, closeProjectWorkspace } = useShellStore();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const projectTitle = projectId === 'gora' ? 'GORA Workspace' : projectId === 'game_studio' ? 'Game Studio Engine v2' : 'Project Workspace';
  const projectSubtitle = projectId === 'gora' ? 'Global Operations & Resource Architecture' : 'Next-Gen 3D Graphics & Physics Engine';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'missions', label: 'Mission Board', icon: Crosshair },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'ai_team', label: 'AI Team', icon: Bot },
    { id: 'files', label: 'Files', icon: Folder },
    { id: 'assets', label: 'Assets', icon: Gamepad2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: 'var(--sd-color-bg-app)',
        color: 'var(--sd-color-text, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Project Workspace Header */}
      <div
        style={{
          padding: '24px 32px 0 32px',
          borderBottom: '1px solid var(--sd-color-border, #334155)',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => {
                closeProjectWorkspace();
                if (onBack) onBack();
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid var(--sd-color-border, #334155)',
                backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{projectTitle}</h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#6366f1',
                  }}
                >
                  ACTIVE WORKSPACE
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--sd-color-text-muted, #94a3b8)' }}>
                {projectSubtitle}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setMissionWizardOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--sd-color-primary, #6366f1)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> New Project Mission
            </button>
          </div>
        </div>

        {/* 10 Workspace Tabs Bar */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 500,
                  border: 'none',
                  borderBottom: isSelected ? '2px solid var(--sd-color-primary, #6366f1)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isSelected ? 'var(--sd-color-primary, #6366f1)' : '#94a3b8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body View */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Overall Completion</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#6366f1' }}>78%</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Missions</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#10b981' }}>12 Running</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Assigned AI Team</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#f59e0b' }}>5 Agents</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Repository Storage</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#3b82f6' }}>1.4 GB</div>
              </div>
            </div>

            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Workspace Strategic Brief</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                GORA coordinates multi-tier autonomous AI execution, asset pipelines, and security guardrails across engineering and operations departments.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>{projectTitle} Mission Board</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Optimize Real-Time Physics Mesh Collision</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Assigned to Lead Architect Agent</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '12px', fontWeight: 600 }}>Running</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Project Knowledge Space</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
              Contains 42 ingested documents, architecture specs, and vector memory embeddings.
            </p>
          </div>
        )}

        {activeTab === 'ai_team' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Assigned Autonomous AI Team</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Lead Architect Agent</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>System Design & Code Quality</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>QA Certification Bot</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Test Coverage & Gate Verification</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Workspace Folders</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#0f172a', fontSize: '13px' }}>📁 /Assets</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#0f172a', fontSize: '13px' }}>📁 /Docs</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#0f172a', fontSize: '13px' }}>📁 /Source</div>
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#0f172a', fontSize: '13px' }}>📁 /Briefs</div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Assets & Graphics</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>3D Shader matrices, WASM plugins, and compiled asset packages.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Execution Analytics</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Velocity: 94.2% task execution efficiency.</p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Milestones & Timeline</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Q3 Sprint 4 Target Completion Date: August 30, 2026.</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Project Documents</h3>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>📄 Executive_Summary_v2.docx • 📄 Technical_Spec.md</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Project Guardrails & Settings</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Path scopes and AI spend limit configured.</p>
          </div>
        )}
      </div>
    </div>
  );
};
