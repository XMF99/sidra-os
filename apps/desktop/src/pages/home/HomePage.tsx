import React from 'react';
import {
  Sparkles,
  FolderKanban,
  Crosshair,
  Bot,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Star,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

export const HomePage: React.FC = () => {
  const { setProjectWizardOpen, setMissionWizardOpen, openProjectWorkspace, setUniversalSearchOpen } = useShellStore();

  // 1. Today's Focus Data
  const topPriorities = [
    { id: 'tp-1', title: 'Complete GORA Architecture Spec Review', project: 'GORA Workspace', deadline: 'Today 5:00 PM', priority: 'Urgent' },
    { id: 'tp-2', title: 'Deploy Vulkan Physics Collision Matrix', project: 'Game Studio Engine v2', deadline: 'Tomorrow', priority: 'High' },
    { id: 'tp-3', title: 'Approve Departmental Budget Allocation', project: 'Enterprise ERP Suite', deadline: 'Jul 31', priority: 'Medium' },
  ];

  const aiRecommendations = [
    'Assign QA Certification Bot to run automated regression suite on GORA release',
    'Review 2 pending decision requests from Lead Architect Agent',
  ];

  // 2. Projects Data
  const recentProjects = [
    { id: 'gora', name: 'GORA Workspace', type: 'Enterprise', progress: 78, status: 'Active', pinned: true, color: '#6366f1' },
    { id: 'game_studio', name: 'Game Studio Engine v2', type: 'Game Studio', progress: 68, status: 'Active', pinned: true, color: '#8b5cf6' },
    { id: 'erp', name: 'Enterprise ERP Suite', type: 'ERP', progress: 35, status: 'Planning', pinned: false, color: '#10b981' },
  ];

  // 3. Mission Center Data
  const assignedMissions = [
    { id: 'm-1', title: 'Optimize Real-Time Physics Mesh Collision', status: 'Running', assignedAi: 'Lead Architect Agent', category: 'Assigned' },
    { id: 'm-2', title: 'Refactor Identity Token Verification', status: 'Waiting Review', assignedAi: 'Full-Stack Dev Agent', category: 'Review' },
    { id: 'm-3', title: 'Egress Connector Rate Limiter', status: 'Blocked', assignedAi: 'Ops Controller', category: 'Blocked' },
    { id: 'm-4', title: 'Generate Q3 Performance Brief', status: 'Completed Today', assignedAi: 'Content Strategist AI', category: 'Completed' },
  ];

  // 4. AI Activity Data
  const aiActivity = {
    completedTasks: 18,
    runningAgents: [
      { name: 'Lead Architect Agent', task: 'Executing Physics Mesh Engine' },
      { name: 'Game Studio Assistant', task: 'Rendering GLSL Shaders' },
    ],
    pendingDecisions: [
      { id: 'pd-1', title: 'Authorize Staging Deployment Token', requester: 'Lead Architect' },
    ],
    suggestedActions: [
      'Trigger synthetic load rehearsal for GORA Egress',
    ],
  };

  // 5. Knowledge Data
  const knowledgeItems = [
    { id: 'k-1', title: 'GORA Architecture & Security Guardrails.pdf', type: 'Doc', time: '10m ago' },
    { id: 'k-2', title: 'Vulkan Graphics Pipeline Spec.md', type: 'Spec', time: '1h ago' },
    { id: 'k-3', title: 'Decision #42: Adopt Vulkan API as default driver', type: 'Decision', time: 'Today' },
  ];

  // 7. Calendar Data
  const todaySchedule = [
    { time: '10:00 AM', title: 'Executive Sync with AI Lead Team', type: 'Meeting' },
    { time: '02:00 PM', title: 'GORA Architecture Review & Sign-off', type: 'Milestone' },
    { time: '04:30 PM', title: 'Q3 Product Roadmap Review', type: 'Deadline' },
  ];

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        color: 'var(--sd-color-text, #f8fafc)',
      }}
    >
      {/* Executive Welcome & Primary Question */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sd-color-primary, #6366f1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Executive Workspace
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
            What should I work on right now?
          </h1>
          <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '15px', margin: '8px 0 0 0' }}>
            Welcome back, Ahmed. You have 3 high-priority focus items and 2 pending AI decisions today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setUniversalSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid var(--sd-color-border, #334155)',
              backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
              color: 'var(--sd-color-text, #f8fafc)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Search size={16} /> Quick Search (⌘/)
          </button>

          <button
            onClick={() => setMissionWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--sd-color-primary, #6366f1)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Plus size={18} /> New Mission
          </button>
        </div>
      </div>

      {/* SECTION 1: TODAY'S FOCUS */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
          borderRadius: '18px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} style={{ color: 'var(--sd-color-primary, #6366f1)' }} /> Today's Focus & Priorities
          </h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Current Sprint: Q3 Sprint 4 (Day 8 of 14)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          {/* Top 3 Priorities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topPriorities.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                  border: '1px solid var(--sd-color-border, #334155)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--sd-color-primary, #6366f1)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {item.project} • Deadline: {item.deadline}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: item.priority === 'Urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.priority === 'Urgent' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sd-color-primary, #6366f1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={16} /> AI Recommendations
            </div>
            {aiRecommendations.map((rec, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4, paddingLeft: '8px', borderLeft: '2px solid var(--sd-color-primary, #6366f1)' }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID: PROJECTS & MISSION CENTER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* SECTION 2: PROJECTS */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderKanban size={20} style={{ color: '#3b82f6' }} /> Projects Workspace
            </h2>
            <button
              onClick={() => setProjectWizardOpen(true)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--sd-color-primary, #6366f1)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} /> Create Project
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentProjects.map((prj) => (
              <div
                key={prj.id}
                onClick={() => {
                  openProjectWorkspace(prj.id);
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
                    {prj.pinned && <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{prj.type} Workspace</div>
                </div>

                <div style={{ width: '110px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Progress</span>
                    <span>{prj.progress}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${prj.progress}%`, backgroundColor: prj.color, borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: MISSION CENTER */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={20} style={{ color: '#10b981' }} /> Mission Center
            </h2>
            <a href="#/missions" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sd-color-primary, #6366f1)', textDecoration: 'none' }}>
              Mission Board →
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignedMissions.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '14px',
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
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    {m.assignedAi}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor:
                      m.category === 'Assigned' ? 'rgba(59, 130, 246, 0.15)' :
                      m.category === 'Review' ? 'rgba(245, 158, 11, 0.15)' :
                      m.category === 'Blocked' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color:
                      m.category === 'Assigned' ? '#3b82f6' :
                      m.category === 'Review' ? '#f59e0b' :
                      m.category === 'Blocked' ? '#ef4444' : '#10b981',
                  }}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-COLUMN GRID: AI ACTIVITY, KNOWLEDGE, NOTIFICATIONS & CALENDAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* SECTION 4: AI ACTIVITY */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#8b5cf6' }} /> AI Team Telemetry
          </h2>

          <div style={{ fontSize: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 600 }}>
            ✓ {aiActivity.completedTasks} Tasks Completed Today
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Running AI Agents:</div>
          {aiActivity.runningAgents.map((ag, i) => (
            <div key={i} style={{ fontSize: '12px', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#0f172a' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ag.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{ag.task}</div>
            </div>
          ))}
        </div>

        {/* SECTION 5: KNOWLEDGE */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: '#f59e0b' }} /> Knowledge & Decisions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {knowledgeItems.map((k) => (
              <div key={k.id} style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#0f172a', fontSize: '12px' }}>
                <div style={{ fontWeight: 500 }}>{k.title}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{k.type} • {k.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6 & 7: NOTIFICATIONS & CALENDAR */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} style={{ color: '#ec4899' }} /> Schedule & Deadlines
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todaySchedule.map((s, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#0f172a', fontSize: '12px', borderLeft: '3px solid #ec4899' }}>
                <div style={{ fontWeight: 600 }}>{s.time} — {s.title}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{s.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
