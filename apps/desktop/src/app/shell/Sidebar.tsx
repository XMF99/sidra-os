import { FC, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Crosshair,
  FolderKanban,
  Network,
  Building2,
  Bot,
  BookOpen,
  Plug,
  BarChart3,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCan } from '../providers/PermissionProvider';
import { navigate } from '../../routes/navigate';

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  hash: string;
  icon: typeof LayoutDashboard;
  capability: string;
  badge?: number;
  shortcut: string;
  onNavigate: () => void;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: FC<Props> = ({ collapsed, onToggleCollapse }) => {
  const [activeHash, setActiveHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut listener for g-jumps
  useEffect(() => {
    let lastKey = '';
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (lastKey === 'g') {
        clearTimeout(timer);
        lastKey = '';
        if (key === 'd') navigate.dashboard();
        else if (key === 'm') navigate.missions();
        else if (key === 'o') navigate.org();
        else if (key === 'e') navigate.departments();
        else if (key === 'p') navigate.projects();
        else if (key === 'k') navigate.knowledge();
        else if (key === 'c') navigate.connectors();
        else if (key === 'a') navigate.agents();
        else if (key === 'l') navigate.events();
        else if (key === 's') navigate.settings();
      } else if (key === 'g') {
        lastKey = 'g';
        timer = setTimeout(() => {
          lastKey = '';
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  const useCanCheck = useCan;

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          hash: '#/',
          icon: LayoutDashboard,
          capability: 'dashboard.view',
          shortcut: 'g d',
          onNavigate: () => navigate.dashboard(),
        },
      ],
    },
    {
      title: 'Work',
      items: [
        {
          id: 'missions',
          label: 'Mission Center',
          hash: '#/missions',
          icon: Crosshair,
          capability: 'mission.view',
          shortcut: 'g m',
          onNavigate: () => navigate.missions(),
        },
        {
          id: 'projects',
          label: 'Projects',
          hash: '#/projects',
          icon: FolderKanban,
          capability: 'projects.view',
          shortcut: 'g p',
          onNavigate: () => navigate.projects(),
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          id: 'org',
          label: 'Organization',
          hash: '#/org',
          icon: Network,
          capability: 'org.view',
          shortcut: 'g o',
          onNavigate: () => navigate.org(),
        },
        {
          id: 'departments',
          label: 'Departments',
          hash: '#/departments',
          icon: Building2,
          capability: 'departments.view',
          shortcut: 'g e',
          onNavigate: () => navigate.departments(),
        },
        {
          id: 'agents',
          label: 'Agents',
          hash: '#/agents',
          icon: Bot,
          capability: 'agents.view',
          shortcut: 'g a',
          onNavigate: () => navigate.agents(),
        },
      ],
    },
    {
      title: 'Knowledge',
      items: [
        {
          id: 'knowledge',
          label: 'Knowledge',
          hash: '#/knowledge',
          icon: BookOpen,
          capability: 'knowledge.view',
          shortcut: 'g k',
          onNavigate: () => navigate.knowledge(),
        },
        {
          id: 'connectors',
          label: 'Connectors',
          hash: '#/connectors',
          icon: Plug,
          capability: 'connectors.view',
          shortcut: 'g c',
          onNavigate: () => navigate.connectors(),
        },
      ],
    },
    {
      title: 'Insight',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          hash: '#/analytics',
          icon: BarChart3,
          capability: 'analytics.view',
          shortcut: 'g l',
          onNavigate: () => navigate.analytics(),
        },
        {
          id: 'events',
          label: 'Event Log',
          hash: '#/events',
          icon: ScrollText,
          capability: 'events.view',
          shortcut: 'g l',
          onNavigate: () => navigate.events(),
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          hash: '#/settings',
          icon: Settings,
          capability: 'authed',
          shortcut: 'g s',
          onNavigate: () => navigate.settings(),
        },
      ],
    },
  ];

  const isItemActive = (itemHash: string) => {
    if (itemHash === '#/') {
      return activeHash === '#/' || activeHash === '' || activeHash === '#';
    }
    return activeHash.startsWith(itemHash);
  };

  return (
    <nav
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--sd-color-bg-surface)',
        borderRight: '1px solid var(--sd-color-border)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Brand Header */}
      <div
        style={{
          height: 'var(--sd-topbar-h)',
          padding: '0 var(--sd-space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--sd-color-border)',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--sd-radius-md)',
                backgroundColor: 'var(--sd-color-primary)',
                color: 'var(--sd-color-primary-contrast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'var(--sd-font-weight-bold)',
                fontSize: '12px',
              }}
            >
              S
            </div>
            <span style={{ fontWeight: 'var(--sd-font-weight-bold)', fontSize: 'var(--sd-font-size-md)' }}>
              Sidra OS
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sd-color-text-muted)',
            cursor: 'pointer',
            padding: 'var(--sd-space-1)',
            borderRadius: 'var(--sd-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Groups List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sd-space-2) 0' }}>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => useCanCheck(item.capability) !== 'hidden'
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} style={{ marginBottom: 'var(--sd-space-3)' }}>
              {!collapsed && (
                <div
                  style={{
                    padding: 'var(--sd-space-1) var(--sd-space-3)',
                    fontSize: 'var(--sd-font-size-xs)',
                    fontWeight: 'var(--sd-font-weight-semibold)',
                    color: 'var(--sd-color-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {group.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const IconComponent = item.icon;
                const active = isItemActive(item.hash);
                const canState = useCanCheck(item.capability);
                const isDisabled = canState === 'disabled';

                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && item.onNavigate()}
                    disabled={isDisabled}
                    title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--sd-space-3)',
                      width: '100%',
                      padding: collapsed ? 'var(--sd-space-2) 0' : 'var(--sd-space-2) var(--sd-space-3)',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                      background: active
                        ? 'var(--sd-color-selection)'
                        : 'transparent',
                      color: active
                        ? 'var(--sd-color-primary)'
                        : isDisabled
                        ? 'var(--sd-color-text-subtle)'
                        : 'var(--sd-color-text)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      borderRadius: 'var(--sd-radius-md)',
                      position: 'relative',
                      fontSize: 'var(--sd-font-size-sm)',
                      fontWeight: active ? 'var(--sd-font-weight-semibold)' : 'var(--sd-font-weight-regular)',
                      transition: 'background var(--sd-motion-fast) var(--sd-ease-standard)',
                    }}
                  >
                    {/* Active inset bar */}
                    {active && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '4px',
                          bottom: '4px',
                          width: '3px',
                          borderRadius: '0 var(--sd-radius-sm) var(--sd-radius-sm) 0',
                          backgroundColor: 'var(--sd-color-primary)',
                        }}
                      />
                    )}
                    <IconComponent size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--sd-radius-pill)',
                          backgroundColor: 'var(--sd-color-primary)',
                          color: 'var(--sd-color-primary-contrast)',
                          fontSize: '11px',
                          fontWeight: 'var(--sd-font-weight-bold)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
