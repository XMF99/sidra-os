import { FC, useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Plus, ChevronDown, User, Shield } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useNotifications } from '../providers/NotificationProvider';
import { navigate } from '../../routes/navigate';

export const TopBar: FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setCenterOpen } = useNotifications();
  const [activeHash, setActiveHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Compute breadcrumbs from route hash
  const getBreadcrumbs = () => {
    const cleanHash = activeHash.replace(/^#\/?/, '');
    if (!cleanHash) return [{ label: 'Dashboard', hash: '#/' }];

    const parts = cleanHash.split('/');
    const crumbs = [{ label: 'Home', hash: '#/' }];

    if (parts[0] === 'missions') {
      crumbs.push({ label: 'Missions', hash: '#/missions' });
      if (parts[1] && parts[1] !== 'new') {
        crumbs.push({ label: `Mission ${parts[1]}`, hash: `#/missions/${parts[1]}` });
      } else if (parts[1] === 'new') {
        crumbs.push({ label: 'New Mission', hash: '#/missions/new' });
      }
    } else if (parts[0] === 'org') {
      crumbs.push({ label: 'Organization', hash: '#/org' });
      if (parts[1] === 'divisions' && parts[2]) {
        crumbs.push({ label: `Division ${parts[2]}`, hash: `#/org/divisions/${parts[2]}` });
      } else if (parts[1] === 'offices' && parts[2]) {
        crumbs.push({ label: `Office ${parts[2]}`, hash: `#/org/offices/${parts[2]}` });
      } else if (parts[1] === 'proposals' && parts[2]) {
        crumbs.push({ label: `Proposal ${parts[2]}`, hash: `#/org/proposals/${parts[2]}` });
      }
    } else if (parts[0] === 'departments') {
      crumbs.push({ label: 'Departments', hash: '#/departments' });
      if (parts[1]) crumbs.push({ label: `Department ${parts[1]}`, hash: `#/departments/${parts[1]}` });
    } else if (parts[0] === 'agents') {
      crumbs.push({ label: 'Agents', hash: '#/agents' });
      if (parts[1]) crumbs.push({ label: `Agent ${parts[1]}`, hash: `#/agents/${parts[1]}` });
    } else if (parts[0] === 'projects') {
      crumbs.push({ label: 'Projects', hash: '#/projects' });
      if (parts[1]) crumbs.push({ label: `Project ${parts[1]}`, hash: `#/projects/${parts[1]}` });
    } else if (parts[0] === 'knowledge') {
      crumbs.push({ label: 'Knowledge', hash: '#/knowledge' });
      if (parts[1]) crumbs.push({ label: `Document ${parts[1]}`, hash: `#/knowledge/${parts[1]}` });
    } else if (parts[0] === 'connectors') {
      crumbs.push({ label: 'Connectors', hash: '#/connectors' });
      if (parts[1]) crumbs.push({ label: `Connector ${parts[1]}`, hash: `#/connectors/${parts[1]}` });
    } else if (parts[0] === 'analytics') {
      crumbs.push({ label: 'Analytics', hash: '#/analytics' });
    } else if (parts[0] === 'events') {
      crumbs.push({ label: 'Event Log', hash: '#/events' });
    } else if (parts[0] === 'settings') {
      crumbs.push({ label: 'Settings', hash: '#/settings' });
    } else {
      crumbs.push({ label: parts[0], hash: `/#${parts[0]}` });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: '0 var(--sd-space-4)',
        backgroundColor: 'var(--sd-color-bg-surface)',
        borderBottom: '1px solid var(--sd-color-border)',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Breadcrumb Navigation & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-4)' }}>
        {/* Workspace Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sd-space-2)',
              padding: 'var(--sd-space-1) var(--sd-space-3)',
              borderRadius: 'var(--sd-radius-md)',
              backgroundColor: 'var(--sd-color-bg-inset)',
              border: '1px solid var(--sd-color-border)',
              color: 'var(--sd-color-text)',
              fontSize: 'var(--sd-font-size-xs)',
              fontWeight: 'var(--sd-font-weight-medium)',
              cursor: 'pointer',
            }}
          >
            <Shield size={14} style={{ color: 'var(--sd-color-primary)' }} />
            <span>Main Firm</span>
            <ChevronDown size={14} />
          </button>
          {isWorkspaceMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '180px',
                backgroundColor: 'var(--sd-color-bg-surface-raised)',
                border: '1px solid var(--sd-color-border)',
                borderRadius: 'var(--sd-radius-md)',
                boxShadow: 'var(--sd-shadow-3)',
                padding: 'var(--sd-space-1)',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: 'var(--sd-space-2)',
                  fontSize: 'var(--sd-font-size-xs)',
                  fontWeight: 'var(--sd-font-weight-semibold)',
                  color: 'var(--sd-color-text-muted)',
                }}
              >
                Workspaces
              </div>
              <button
                onClick={() => setIsWorkspaceMenuOpen(false)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--sd-space-2)',
                  fontSize: 'var(--sd-font-size-xs)',
                  borderRadius: 'var(--sd-radius-sm)',
                  backgroundColor: 'var(--sd-color-selection)',
                  color: 'var(--sd-color-primary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✓ Main Firm (Local)
              </button>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.hash + idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
              {idx > 0 && <span style={{ color: 'var(--sd-color-text-subtle)', fontSize: 'var(--sd-font-size-xs)' }}>›</span>}
              <a
                href={crumb.hash}
                style={{
                  fontSize: 'var(--sd-font-size-sm)',
                  color: idx === breadcrumbs.length - 1 ? 'var(--sd-color-text)' : 'var(--sd-color-text-muted)',
                  fontWeight: idx === breadcrumbs.length - 1 ? 'var(--sd-font-weight-semibold)' : 'var(--sd-font-weight-regular)',
                  textDecoration: 'none',
                }}
              >
                {crumb.label}
              </a>
            </span>
          ))}
        </nav>
      </div>

      {/* Right Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)' }}>
        {/* Global Search Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sd:open-search'));
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-2)',
            padding: 'var(--sd-space-1) var(--sd-space-3)',
            borderRadius: 'var(--sd-radius-md)',
            backgroundColor: 'var(--sd-color-bg-inset)',
            border: '1px solid var(--sd-color-border)',
            color: 'var(--sd-color-text-muted)',
            fontSize: 'var(--sd-font-size-xs)',
            cursor: 'pointer',
          }}
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd style={{ padding: '0 4px', borderRadius: 'var(--sd-radius-sm)', border: '1px solid var(--sd-color-border)', fontSize: '10px' }}>⌘/</kbd>
        </button>

        {/* Quick Action: Developer Console */}
        <button
          onClick={() => { window.location.hash = '#/developer'; }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-1)',
            padding: 'var(--sd-space-1) var(--sd-space-3)',
            borderRadius: 'var(--sd-radius-md)',
            backgroundColor: 'var(--sd-color-bg-inset)',
            color: 'var(--sd-color-primary)',
            border: '1px solid var(--sd-color-primary)',
            fontSize: 'var(--sd-font-size-xs)',
            fontWeight: 'var(--sd-font-weight-medium)',
            cursor: 'pointer',
          }}
        >
          <span>🛠️ Developer Console</span>
        </button>

        {/* Quick Action: New Mission */}
        <button
          onClick={() => navigate.missionNew()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-1)',
            padding: 'var(--sd-space-1) var(--sd-space-3)',
            borderRadius: 'var(--sd-radius-md)',
            backgroundColor: 'var(--sd-color-primary)',
            color: 'var(--sd-color-primary-contrast)',
            border: 'none',
            fontSize: 'var(--sd-font-size-xs)',
            fontWeight: 'var(--sd-font-weight-medium)',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          <span>New Mission</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => setCenterOpen(true)}
          aria-label="Open Notification Center"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sd-color-text-muted)',
            cursor: 'pointer',
            padding: 'var(--sd-space-2)',
            borderRadius: 'var(--sd-radius-md)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Notification Center (⌘⇧N)"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: 'var(--sd-radius-circle)',
              backgroundColor: 'var(--sd-status-info)',
            }}
          />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sd-color-text-muted)',
            cursor: 'pointer',
            padding: 'var(--sd-space-2)',
            borderRadius: 'var(--sd-radius-md)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Toggle Theme (⌘\)"
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile / Seat Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sd-space-2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--sd-space-1)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--sd-radius-circle)',
                backgroundColor: 'var(--sd-color-bg-inset)',
                border: '1px solid var(--sd-color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sd-color-text)',
              }}
            >
              <User size={16} />
            </div>
          </button>
          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                width: '200px',
                backgroundColor: 'var(--sd-color-bg-surface-raised)',
                border: '1px solid var(--sd-color-border)',
                borderRadius: 'var(--sd-radius-md)',
                boxShadow: 'var(--sd-shadow-3)',
                padding: 'var(--sd-space-2)',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: 'var(--sd-font-size-xs)', fontWeight: 'var(--sd-font-weight-semibold)', color: 'var(--sd-color-text)' }}>
                Principal Seat
              </div>
              <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-subtle)', marginBottom: 'var(--sd-space-2)' }}>
                role: principal
              </div>
              <div style={{ borderTop: '1px solid var(--sd-color-border)', paddingTop: 'var(--sd-space-2)' }}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate.settings({ section: 'identity' });
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--sd-space-1) var(--sd-space-2)',
                    fontSize: 'var(--sd-font-size-xs)',
                    borderRadius: 'var(--sd-radius-sm)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--sd-color-text)',
                    cursor: 'pointer',
                  }}
                >
                  View Identity & Seat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
