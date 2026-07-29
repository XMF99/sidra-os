import React, { useState } from 'react';
import { Plus, Sparkles, FolderPlus, BookOpen, ShieldCheck, Building, FileText, Folder } from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

export const QuickCreateFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setMissionWizardOpen, setProjectWizardOpen } = useShellStore();

  const handleAction = (type: string) => {
    setIsOpen(false);
    if (type === 'mission') {
      setMissionWizardOpen(true);
    } else if (type === 'project') {
      setProjectWizardOpen(true);
    } else if (type === 'knowledge') {
      window.location.hash = '#/knowledge';
    } else if (type === 'decision') {
      window.location.hash = '#/settings';
    } else if (type === 'department') {
      window.location.hash = '#/departments';
    } else if (type === 'document') {
      window.location.hash = '#/knowledge';
    } else if (type === 'folder') {
      window.location.hash = '#/projects';
    }
  };

  const createOptions = [
    { id: 'mission', label: 'Create Mission', icon: Sparkles, color: '#6366f1' },
    { id: 'project', label: 'Create Project', icon: FolderPlus, color: '#3b82f6' },
    { id: 'knowledge', label: 'Knowledge Space', icon: BookOpen, color: '#f59e0b' },
    { id: 'decision', label: 'Record Decision', icon: ShieldCheck, color: '#10b981' },
    { id: 'department', label: 'New Department', icon: Building, color: '#ec4899' },
    { id: 'document', label: 'New Document', icon: FileText, color: '#8b5cf6' },
    { id: 'folder', label: 'New Folder', icon: Folder, color: '#64748b' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9000 }}>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 8999,
          }}
        />
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            right: 0,
            width: '240px',
            backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
            border: '1px solid var(--sd-color-border, #334155)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
            padding: '8px',
            zIndex: 9001,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--sd-color-text-muted, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Quick Create
          </div>

          {createOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => handleAction(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--sd-color-text, #f8fafc)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
                    color: opt.color,
                    display: 'flex',
                  }}
                >
                  <Icon size={16} />
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Create (Mission, Project, Document, Decision)"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--sd-color-primary, #6366f1)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          zIndex: 9002,
        }}
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
