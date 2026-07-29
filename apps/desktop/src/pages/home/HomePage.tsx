import React from 'react';
import {
  FolderPlus,
  Play,
  Sparkles,
  Gamepad2,
  BookOpen,
  Bell,
  CheckCircle2,
  Bot,
  FileText,
  ShieldCheck,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';
import { useNotifications } from '../../app/providers/NotificationProvider';

export const HomePage: React.FC = () => {
  const { setProjectWizardOpen, setMissionWizardOpen, openProjectWizardWithTemplate } = useShellStore();
  const { setCenterOpen } = useNotifications();

  // Mock workspace data for user experience
  const recentProjects = [
    {
      id: 'p-1',
      name: 'Game Studio Engine v2',
      type: 'Game Studio',
      status: 'In Progress',
      progress: 68,
      lastActive: '10 mins ago',
      color: '#8b5cf6',
    },
    {
      id: 'p-2',
      name: 'Core Operating Platform',
      type: 'Software',
      status: 'Active',
      progress: 85,
      lastActive: '1 hour ago',
      color: '#3b82f6',
    },
    {
      id: 'p-3',
      name: 'Enterprise ERP Suite',
      type: 'ERP',
      status: 'Planning',
      progress: 30,
      lastActive: 'Yesterday',
      color: '#10b981',
    },
  ];

  const todaysMissions = [
    {
      id: 'm-101',
      title: 'Optimize Real-Time Physics Mesh Collision',
      project: 'Game Studio Engine v2',
      assignedAi: 'Lead Architect Agent',
      priority: 'High',
      status: 'Running',
    },
    {
      id: 'm-102',
      title: 'Refactor Identity Token Verification',
      project: 'Core Operating Platform',
      assignedAi: 'Full-Stack Dev Agent',
      priority: 'Medium',
      status: 'Completed',
    },
    {
      id: 'm-103',
      title: 'Generate Departmental Budget Report',
      project: 'Enterprise ERP Suite',
      assignedAi: 'Ops Controller Agent',
      priority: 'Urgent',
      status: 'Pending',
    },
  ];

  const recentAiActivity = [
    {
      id: 'a-1',
      agent: 'Lead Architect Agent',
      action: 'Completed execution plan for Physics Mesh Engine',
      time: '12 mins ago',
      type: 'plan',
    },
    {
      id: 'a-2',
      agent: 'QA Certification Bot',
      action: 'Verified unit test suite coverage (98.4%)',
      time: '45 mins ago',
      type: 'verify',
    },
    {
      id: 'a-3',
      agent: 'Game Studio Assistant',
      action: 'Generated 3D Shader shaders/water_surface.glsl',
      time: '2 hours ago',
      type: 'code',
    },
  ];

  const recentFiles = [
    { id: 'f-1', name: 'Game_Studio_Architecture_Design.pdf', space: 'Game Studio Knowledge', size: '2.4 MB' },
    { id: 'f-2', name: 'Q3_Product_Roadmap_Final.docx', space: 'Product Knowledge Space', size: '850 KB' },
    { id: 'f-3', name: 'Shader_Pipeline_Specification.md', space: 'Engineering Vault', size: '120 KB' },
  ];

  const recentDecisions = [
    {
      id: 'd-1',
      title: 'Adopt Vulkan API as default graphics driver for Game Studio',
      by: 'Ahmed (Principal Seat)',
      date: 'Today, 11:30 AM',
      approved: true,
    },
    {
      id: 'd-2',
      title: 'Authorize AI Agent autonomous deployment in Staging',
      by: 'Lead Architect Agent',
      date: 'Yesterday',
      approved: true,
    },
  ];

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        color: 'var(--sd-color-text, #f8fafc)',
      }}
    >
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '28px 32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, Ahmed 👋
          </h1>
          <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '15px', margin: '8px 0 0 0' }}>
            What would you like to do today? Your AI team and project workspaces are active.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            Beta 1 Active
          </span>
        </div>
      </div>

      {/* Primary Action Choices Grid */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sd-color-text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {/* Action 1: Create Project */}
          <button
            onClick={() => setProjectWizardOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
              <FolderPlus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Create Project</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                Wizard with templates
              </div>
            </div>
          </button>

          {/* Action 2: Continue Recent Project */}
          <button
            onClick={() => {
              window.location.hash = '#/projects';
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
              <Play size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Continue Project</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                Game Studio Engine v2
              </div>
            </div>
          </button>

          {/* Action 3: Create Mission */}
          <button
            onClick={() => setMissionWizardOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Create Mission</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                Type or Voice Directive
              </div>
            </div>
          </button>

          {/* Action 4: Open Game Studio */}
          <button
            onClick={() => openProjectWizardWithTemplate('Game Studio')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <Gamepad2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Open Game Studio</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                Project template
              </div>
            </div>
          </button>

          {/* Action 5: Search Knowledge */}
          <button
            onClick={() => {
              window.location.hash = '#/knowledge';
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Search Knowledge</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                Docs, briefs & memory
              </div>
            </div>
          </button>

          {/* Action 6: View Notifications */}
          <button
            onClick={() => setCenterOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              color: 'var(--sd-color-text, #f8fafc)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
              <Bell size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>View Notifications</div>
              <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>
                3 unread alerts
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Projects & Missions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Section 1: Recent Projects */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderKanban size={18} style={{ color: '#6366f1' }} /> Recent Projects
            </h2>
            <a href="#/projects" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              View All
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentProjects.map((prj) => (
              <div
                key={prj.id}
                onClick={() => {
                  window.location.hash = '#/projects';
                }}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: prj.color }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{prj.name}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                      {prj.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '6px' }}>
                    Active {prj.lastActive}
                  </div>
                </div>

                <div style={{ width: '120px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#94a3b8' }}>
                    <span>Progress</span>
                    <span>{prj.progress}%</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${prj.progress}%`, backgroundColor: prj.color, borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Today's Missions */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Today's Missions
            </h2>
            <a href="#/missions" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              Mission Board
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todaysMissions.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{m.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={12} /> {m.assignedAi} • {m.project}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: m.status === 'Running' ? 'rgba(59, 130, 246, 0.2)' : m.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: m.status === 'Running' ? '#3b82f6' : m.status === 'Completed' ? '#10b981' : '#f59e0b',
                  }}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: AI Activity, Files, Decisions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Section 3: Recent AI Activity */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#8b5cf6' }} /> Recent AI Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAiActivity.map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <div style={{ marginTop: '2px', color: '#8b5cf6' }}>
                  <Bot size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{act.agent}</div>
                  <div style={{ color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '2px' }}>{act.action}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recent Files */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: '#3b82f6' }} /> Recent Workspace Files
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentFiles.map((file) => (
              <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--sd-color-bg-inset, #0f172a)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={14} style={{ color: '#94a3b8' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{file.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{file.space}</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{file.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Recent Decisions */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#10b981' }} /> Recent Decisions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentDecisions.map((dec) => (
              <div key={dec.id} style={{ fontSize: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--sd-color-bg-inset, #0f172a)', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontWeight: 500 }}>{dec.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--sd-color-text-muted, #94a3b8)', marginTop: '4px' }}>
                  Approved by {dec.by} • {dec.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
