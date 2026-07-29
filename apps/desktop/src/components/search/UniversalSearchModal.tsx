import React, { useState, useEffect, useRef } from 'react';
import { Search, FolderKanban, BookOpen, FileText, Crosshair, Bot, User, Settings, CornerDownLeft } from 'lucide-react';
import { useShellStore } from '../../state/useShellStore';

export interface SearchItem {
  id: string;
  type: 'project' | 'knowledge' | 'file' | 'mission' | 'agent' | 'person' | 'document' | 'setting';
  title: string;
  subtitle: string;
  action: () => void;
  icon: any;
}

export const UniversalSearchModal: React.FC = () => {
  const { isUniversalSearchOpen, setUniversalSearchOpen, openProjectWorkspace } = useShellStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard listener for ⌘/ or Ctrl+/
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setUniversalSearchOpen(!isUniversalSearchOpen);
      } else if (e.key === 'Escape' && isUniversalSearchOpen) {
        setUniversalSearchOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setUniversalSearchOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('sd:open-search', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('sd:open-search', handleCustomOpen);
    };
  }, [isUniversalSearchOpen, setUniversalSearchOpen]);

  useEffect(() => {
    if (isUniversalSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isUniversalSearchOpen]);

  if (!isUniversalSearchOpen) return null;

  // Mock index for instant search across all 8 domain entities
  const ALL_SEARCH_ITEMS: SearchItem[] = [
    {
      id: 's-1',
      type: 'project',
      title: 'GORA - Global Operations & Resource Architecture',
      subtitle: 'Active Enterprise Workspace • Progress 78%',
      icon: FolderKanban,
      action: () => {
        openProjectWorkspace('gora');
        window.location.hash = '#/projects';
      },
    },
    {
      id: 's-2',
      type: 'project',
      title: 'Game Studio Engine v2',
      subtitle: 'Game Studio Template Workspace • Progress 68%',
      icon: FolderKanban,
      action: () => {
        openProjectWorkspace('game_studio');
        window.location.hash = '#/projects';
      },
    },
    {
      id: 's-3',
      type: 'mission',
      title: 'Optimize Real-Time Physics Mesh Collision',
      subtitle: 'Assigned to Lead Architect Agent • Priority: High',
      icon: Crosshair,
      action: () => {
        window.location.hash = '#/missions';
      },
    },
    {
      id: 's-4',
      type: 'mission',
      title: 'Refactor Identity Token Verification',
      subtitle: 'Assigned to Full-Stack Dev Agent • Completed',
      icon: Crosshair,
      action: () => {
        window.location.hash = '#/missions';
      },
    },
    {
      id: 's-5',
      type: 'knowledge',
      title: 'GORA Core Specification & Architecture Brief',
      subtitle: 'Ingested Knowledge Base Document • 4.2 MB',
      icon: BookOpen,
      action: () => {
        window.location.hash = '#/knowledge';
      },
    },
    {
      id: 's-6',
      type: 'file',
      title: 'Shader_Pipeline_Specification.glsl',
      subtitle: 'Game Studio Assets • Updated 2 hours ago',
      icon: FileText,
      action: () => {
        window.location.hash = '#/knowledge';
      },
    },
    {
      id: 's-7',
      type: 'agent',
      title: 'Lead Architect Agent',
      subtitle: 'Autonomous Agent • Role: System Design & Code Review',
      icon: Bot,
      action: () => {
        window.location.hash = '#/agents';
      },
    },
    {
      id: 's-8',
      type: 'person',
      title: 'Ahmed (Principal Seat)',
      subtitle: 'Human Seat • Administrator & Strategic Approver',
      icon: User,
      action: () => {
        window.location.hash = '#/settings';
      },
    },
    {
      id: 's-9',
      type: 'document',
      title: 'Q3 Product Roadmap & Strategy Plan.docx',
      subtitle: 'Executive Strategy Vault • Verified',
      icon: FileText,
      action: () => {
        window.location.hash = '#/knowledge';
      },
    },
    {
      id: 's-10',
      type: 'setting',
      title: 'Developer Mode & Kernel Diagnostics',
      subtitle: 'System Configuration & Preferences',
      icon: Settings,
      action: () => {
        window.location.hash = '#/settings';
      },
    },
  ];

  const filteredItems = ALL_SEARCH_ITEMS.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesQuery && matchesTab;
  });

  const handleSelect = (item: SearchItem) => {
    item.action();
    setUniversalSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'project', label: 'Projects' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'file', label: 'Files' },
    { id: 'mission', label: 'Missions' },
    { id: 'agent', label: 'Agents' },
    { id: 'person', label: 'People' },
    { id: 'document', label: 'Documents' },
    { id: 'setting', label: 'Settings' },
  ];

  return (
    <div
      onClick={() => setUniversalSearchOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '8vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--sd-color-bg-surface-raised, #1e293b)',
          border: '1px solid var(--sd-color-border, #334155)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          color: 'var(--sd-color-text, #f8fafc)',
        }}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--sd-color-border, #334155)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={20} style={{ color: 'var(--sd-color-primary, #6366f1)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Universal Search across Projects, Knowledge, Missions, Files, Agents..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'inherit',
              outline: 'none',
            }}
          />
          <kbd style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', fontSize: '11px', color: '#94a3b8' }}>
            ESC
          </kbd>
        </div>

        {/* Category Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 16px',
            borderBottom: '1px solid var(--sd-color-border, #334155)',
            backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
            overflowX: 'auto',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setSelectedIndex(0);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === cat.id ? 'var(--sd-color-primary, #6366f1)' : 'transparent',
                color: activeTab === cat.id ? '#fff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No entities found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'var(--sd-color-primary, #6366f1)' : '#0f172a',
                        color: isSelected ? '#fff' : '#94a3b8',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.subtitle}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: 600 }}>
                      {item.type}
                    </span>
                    {isSelected && <CornerDownLeft size={16} style={{ color: 'var(--sd-color-primary, #6366f1)' }} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--sd-color-bg-inset, #0f172a)',
            borderTop: '1px solid var(--sd-color-border, #334155)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          <span>Use ↑↓ to navigate, Enter to select</span>
          <span>Universal Index • 8 Domain Entities</span>
        </div>
      </div>
    </div>
  );
};
