import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Bot,
  Layers,
  ArrowUpRight,
  Folder,
  BookOpen,
  X,
} from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';
import { ProjectDetailWorkspace } from './ProjectDetailWorkspace';

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'Active' | 'Planning' | 'Completed' | 'Paused';
  progress: number;
  departments: string[];
  aiAgents: string[];
  lastActive: string;
  color: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-1',
    name: 'Game Studio Engine v2',
    type: 'Game Studio',
    description: 'Next-generation 3D/2D graphics pipeline, physics engine, and level creation suite for desktop and web.',
    status: 'Active',
    progress: 72,
    departments: ['Engineering', 'Design', 'Product'],
    aiAgents: ['Lead Architect Agent', 'Game Designer Agent', 'QA Tester Bot'],
    lastActive: '10 mins ago',
    color: '#8b5cf6',
  },
  {
    id: 'prj-2',
    name: 'Core Platform Services',
    type: 'Software',
    description: 'High-availability microservice kernel, event stream coordinator, and security identity module.',
    status: 'Active',
    progress: 88,
    departments: ['Engineering', 'Operations'],
    aiAgents: ['Full-Stack Developer Agent', 'Ops Controller'],
    lastActive: '1 hour ago',
    color: '#3b82f6',
  },
  {
    id: 'prj-3',
    name: 'Enterprise ERP Integration',
    type: 'ERP',
    description: 'Corporate financial forecasting, automated inventory management, and cross-departmental workflows.',
    status: 'Planning',
    progress: 35,
    departments: ['Finance', 'Operations', 'Product'],
    aiAgents: ['Ops Controller', 'Content Strategist AI'],
    lastActive: 'Yesterday',
    color: '#10b981',
  },
  {
    id: 'prj-4',
    name: 'Autonomous AI Agent Lab',
    type: 'Research',
    description: 'Deep neural network experimentation, reinforcement learning benchmarks, and synthetic dataset generation.',
    status: 'Active',
    progress: 60,
    departments: ['Engineering', 'Product'],
    aiAgents: ['Lead Architect Agent', 'QA Tester Bot'],
    lastActive: '3 hours ago',
    color: '#f59e0b',
  },
];

export const ProjectsPage: React.FC = () => {
  const { setProjectWizardOpen, activeProjectWorkspaceId, openProjectWorkspace } = useShellStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  if (activeProjectWorkspaceId) {
    return <ProjectDetailWorkspace projectId={activeProjectWorkspaceId} />;
  }

  const filteredProjects = INITIAL_PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: 'var(--sd-color-text, #f8fafc)',
      }}
    >
      {/* Header & Main Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderKanban size={28} style={{ color: 'var(--sd-color-primary, #6366f1)' }} /> Projects Workspace
          </h1>
          <p style={{ color: 'var(--sd-color-text-muted, #94a3b8)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Manage active initiatives, auto-provisioned workspaces, and assigned AI teams.
          </p>
        </div>

        <button
          onClick={() => setProjectWizardOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'var(--sd-color-primary, #6366f1)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
        >
          <Plus size={18} /> Create Project
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: '14px',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '320px',
          }}
        >
          <Search size={16} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or keywords..."
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: '13px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Status:</span>
          {['all', 'active', 'planning', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filterStatus === st ? 'var(--sd-color-primary, #6366f1)' : 'transparent',
                color: filterStatus === st ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredProjects.map((prj) => (
          <div
            key={prj.id}
            style={{
              borderRadius: '16px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div>
              {/* Card Top Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: prj.color }} />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                    }}
                  >
                    {prj.type}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: prj.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: prj.status === 'Active' ? '#10b981' : '#f59e0b',
                  }}
                >
                  {prj.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>{prj.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--sd-color-text-muted, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                {prj.description}
              </p>
            </div>

            {/* Progress & AI Team */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Overall Completion</span>
                  <span>{prj.progress}%</span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prj.progress}%`, backgroundColor: prj.color, borderRadius: '3px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={14} style={{ color: '#8b5cf6' }} />
                  <span>{prj.aiAgents.length} AI Team Members</span>
                </div>
                <span>Active {prj.lastActive}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => setSelectedProject(prj)}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--sd-color-border, #334155)',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: 'var(--sd-color-text, #f8fafc)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Folder size={14} /> Open Project
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Open Project Modal Detail Drawer */}
      {selectedProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
              border: '1px solid var(--sd-color-border, #334155)',
              borderRadius: '16px',
              padding: '28px',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: selectedProject.color }}>
                  {selectedProject.type.toUpperCase()} WORKSPACE
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 700 }}>{selectedProject.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{selectedProject.description}</p>

            {/* Auto-provisioned spaces */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} /> Knowledge Space
                </div>
                <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
                  {selectedProject.name} Knowledge Base
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Mission Board
                </div>
                <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
                  {selectedProject.name} Directives
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Folder size={14} /> Default Folders
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>
                  /Assets, /Docs, /Source, /Briefs
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={14} /> AI Workspace
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#94a3b8' }}>
                  {selectedProject.aiAgents.join(', ')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  openProjectWorkspace(selectedProject.id);
                  setSelectedProject(null);
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--sd-color-primary, #6366f1)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Launch Workspace <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
