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
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

export const HomePage: React.FC = () => {
  const { setProjectWizardOpen, setMissionWizardOpen, openProjectWorkspace, setUniversalSearchOpen } = useShellStore();

  // 1. Today's Focus Data
  const topPriorities = [
    { id: 'tp-1', title: 'Approve GORA Security Architecture & Guardrails Spec', project: 'GORA Workspace', deadline: 'Today 5:00 PM', priority: 'Urgent', color: '#ef4444' },
    { id: 'tp-2', title: 'Deploy Vulkan Physics Collision Matrix Engine', project: 'Game Studio Engine v2', deadline: 'Tomorrow', priority: 'High', color: '#f59e0b' },
    { id: 'tp-3', title: 'Review Departmental Budget Allocation Brief', project: 'Enterprise ERP Suite', deadline: 'Jul 31', priority: 'Normal', color: '#3b82f6' },
  ];

  const aiRecommendations = [
    'Assign QA Certification Bot to execute automated regression suite on GORA release',
    'Review 2 pending security token decisions from Lead Architect Agent',
  ];

  // 2. Projects Data
  const recentProjects = [
    { id: 'gora', name: 'GORA Workspace', type: 'Enterprise Architecture', progress: 78, status: 'Active', pinned: true, color: '#6366f1' },
    { id: 'game_studio', name: 'Game Studio Engine v2', type: '3D/2D Graphics & Physics', progress: 68, status: 'Active', pinned: true, color: '#8b5cf6' },
    { id: 'erp', name: 'Enterprise ERP Suite', type: 'Corporate Operations', progress: 35, status: 'Planning', pinned: false, color: '#10b981' },
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
  };

  // 5. Knowledge Data
  const knowledgeItems = [
    { id: 'k-1', title: 'GORA Architecture & Security Guardrails.pdf', type: 'Doc', time: '10m ago' },
    { id: 'k-2', title: 'Vulkan Graphics Pipeline Spec.md', type: 'Spec', time: '1h ago' },
    { id: 'k-3', title: 'Decision #42: Adopt Vulkan API as default driver', type: 'Decision', time: 'Today' },
  ];

  // 6. Calendar Data
  const todaySchedule = [
    { time: '10:00 AM', title: 'Executive Sync with AI Lead Team', type: 'Meeting' },
    { time: '02:00 PM', title: 'GORA Architecture Review & Sign-off', type: 'Milestone' },
    { time: '04:30 PM', title: 'Q3 Product Roadmap Review', type: 'Deadline' },
  ];

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        color: 'var(--sd-color-text, #f8fafc)',
      }}
    >
      {/* Hero Welcome Banner with Glow Layer */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '36px 40px',
          borderRadius: '24px',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
          border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.12))',
          boxShadow: 'var(--sd-shadow-3, 0 16px 36px -8px rgba(0, 0, 0, 0.6))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Ambient Gradient Blur Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--sd-color-primary, #6366f1)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              Executive Workspace
            </span>
            <span style={{ fontSize: '12px', color: 'var(--sd-color-text-subtle, #64748b)' }}>v4.0 Sovereign</span>
          </div>

          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.025em',
              color: '#ffffff',
            }}
          >
            What should I work on right now?
          </h1>
          <p
            style={{
              color: 'var(--sd-color-text-muted, #94a3b8)',
              fontSize: '15px',
              margin: '8px 0 0 0',
              lineHeight: 1.5,
              maxWidth: '620px',
            }}
          >
            Welcome back, Ahmed. You have 3 urgent focus items, 2 pending AI decisions, and 4 running agent directives today.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setUniversalSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.12))',
              backgroundColor: 'var(--sd-color-bg-inset, #0a0d14)',
              color: 'var(--sd-color-text, #f8fafc)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <Search size={16} style={{ color: '#94a3b8' }} /> Global Search (⌘/)
          </button>

          <button
            onClick={() => setMissionWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--sd-color-primary, #6366f1)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
          >
            <Plus size={18} /> New Mission
          </button>
        </div>
      </div>

      {/* SECTION 1: TODAY'S FOCUS */}
      <div
        style={{
          backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
          border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: 'var(--sd-shadow-2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} style={{ color: 'var(--sd-color-primary, #6366f1)' }} /> Today's Focus & Priorities
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#94a3b8' }}>
            <Zap size={14} style={{ color: '#f59e0b' }} />
            <span>Current Sprint: Q3 Sprint 4 (Day 8 of 14)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Top Priorities List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topPriorities.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0a0d14)',
                  border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.08))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--sd-color-primary, #6366f1)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {item.project} • Deadline: <span style={{ color: '#cbd5e1' }}>{item.deadline}</span>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '8px',
                    backgroundColor: `${item.color}1e`,
                    color: item.color,
                    border: `1px solid ${item.color}33`,
                  }}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>

          {/* AI Recommendations Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sd-color-primary, #6366f1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} /> AI Recommendations
            </div>
            {aiRecommendations.map((rec, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, paddingLeft: '10px', borderLeft: '2px solid var(--sd-color-primary, #6366f1)' }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-COLUMN GRID: PROJECTS & MISSION CENTER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* SECTION 2: PROJECTS */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
            border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderKanban size={22} style={{ color: '#3b82f6' }} /> Projects Workspace
            </h2>
            <button
              onClick={() => setProjectWizardOpen(true)}
              style={{
                fontSize: '13px',
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
              <Plus size={16} /> Create Project
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentProjects.map((prj) => (
              <div
                key={prj.id}
                onClick={() => {
                  openProjectWorkspace(prj.id);
                  window.location.hash = '#/projects';
                }}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0a0d14)',
                  border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.08))',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: prj.color }} />
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff' }}>{prj.name}</span>
                    {prj.pinned && <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{prj.type}</div>
                </div>

                <div style={{ width: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                    <span>Completion</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{prj.progress}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
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
            backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
            border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crosshair size={22} style={{ color: '#10b981' }} /> Mission Center
            </h2>
            <a href="#/missions" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sd-color-primary, #6366f1)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Mission Board <ArrowUpRight size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {assignedMissions.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--sd-color-bg-inset, #0a0d14)',
                  border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.08))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    {m.assignedAi}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '8px',
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

      {/* 3-COLUMN GRID: AI TEAM, KNOWLEDGE, SCHEDULE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '28px' }}>
        {/* SECTION 4: AI TELEMETRY */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
            border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: '#8b5cf6' }} /> AI Team Telemetry
          </h2>

          <div style={{ fontSize: '13px', padding: '12px', borderRadius: '10px', backgroundColor: '#0a0d14', color: '#10b981', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            ✓ {aiActivity.completedTasks} Directive Runs Completed Today
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Active Directives:</div>
          {aiActivity.runningAgents.map((ag, i) => (
            <div key={i} style={{ fontSize: '12px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0a0d14', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ag.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{ag.task}</div>
            </div>
          ))}
        </div>

        {/* SECTION 5: KNOWLEDGE */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
            border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: '#f59e0b' }} /> Knowledge & Memory
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {knowledgeItems.map((k) => (
              <div key={k.id} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0a0d14', fontSize: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontWeight: 500, color: '#f8fafc' }}>{k.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{k.type} • {k.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: SCHEDULE */}
        <div
          style={{
            backgroundColor: 'var(--sd-color-bg-surface-raised, #151c2e)',
            border: '1px solid var(--sd-color-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={20} style={{ color: '#ec4899' }} /> Executive Schedule
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todaySchedule.map((s, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0a0d14', fontSize: '12px', borderLeft: '3px solid #ec4899' }}>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{s.time} — {s.title}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{s.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
