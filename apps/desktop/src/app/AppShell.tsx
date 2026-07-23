import { FC, useState, ReactNode, CSSProperties } from 'react';
import { RouteErrorBoundary } from './boundaries/RouteErrorBoundary';

interface Props {
  children?: ReactNode;
}

export const AppShell: FC<Props> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'var(--sd-titlebar-h) var(--sd-topbar-h) 1fr var(--sd-statusbar-h)',
        gridTemplateColumns: sidebarCollapsed ? 'var(--sd-sidebar-w-collapsed) 1fr' : 'var(--sd-sidebar-w) 1fr',
        gridTemplateAreas: `
          "titlebar titlebar"
          "sidebar  topbar"
          "sidebar  content"
          "statusbar statusbar"
        `,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--sd-color-bg-app)',
        color: 'var(--sd-color-text)',
        fontFamily: 'var(--sd-font-sans)',
        boxSizing: 'border-box',
        transition: 'grid-template-columns var(--sd-motion-base) var(--sd-ease-standard)',
      }}
    >
      {/* Title Bar - 36px */}
      <header
        style={{
          gridArea: 'titlebar',
          height: 'var(--sd-titlebar-h)',
          backgroundColor: 'var(--sd-color-bg-surface-raised)',
          borderBottom: '1px solid var(--sd-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--sd-space-4)',
          userSelect: 'none',
          WebkitAppRegion: 'drag',
        } as CSSProperties}
      >
        <div style={{ fontSize: 'var(--sd-font-size-xs)', fontWeight: 'var(--sd-font-weight-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--sd-space-2)' }}>
          <span style={{ color: 'var(--sd-color-primary)' }}>❖</span> Sidra OS Desktop Alpha
        </div>
        <div style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>
          Workspace: Main
        </div>
      </header>

      {/* Sidebar Area - 240px / 64px */}
      <aside
        style={{
          gridArea: 'sidebar',
          backgroundColor: 'var(--sd-color-bg-surface)',
          borderRight: '1px solid var(--sd-color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 10,
        }}
      >
        <div style={{ padding: 'var(--sd-space-3)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--sd-color-border)' }}>
          {!sidebarCollapsed && <span style={{ fontWeight: 'var(--sd-font-weight-semibold)', fontSize: 'var(--sd-font-size-sm)' }}>Navigation</span>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--sd-color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--sd-font-size-sm)',
              padding: 'var(--sd-space-1)',
            }}
            title={sidebarCollapsed ? 'Expand Sidebar (⌘B)' : 'Collapse Sidebar (⌘B)'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <div style={{ flex: 1, padding: 'var(--sd-space-2)' }}>
          {/* Sidebar items will render here in Epic 2 */}
        </div>
      </aside>

      {/* Top Bar Area - 52px */}
      <nav
        style={{
          gridArea: 'topbar',
          height: 'var(--sd-topbar-h)',
          backgroundColor: 'var(--sd-color-bg-surface)',
          borderBottom: '1px solid var(--sd-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--sd-space-4)',
          zIndex: 5,
        }}
      >
        <div style={{ fontSize: 'var(--sd-font-size-sm)', color: 'var(--sd-color-text-muted)' }}>
          Dashboard
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)' }}>
          <span style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-subtle)' }}>⌘K for Palette</span>
        </div>
      </nav>

      {/* Main Page Outlet Content */}
      <main
        style={{
          gridArea: 'content',
          overflowY: 'auto',
          position: 'relative',
          backgroundColor: 'var(--sd-color-bg-app)',
        }}
      >
        <RouteErrorBoundary>{children}</RouteErrorBoundary>
      </main>

      {/* Status Bar Area - 28px */}
      <footer
        style={{
          gridArea: 'statusbar',
          height: 'var(--sd-statusbar-h)',
          backgroundColor: 'var(--sd-color-bg-surface-raised)',
          borderTop: '1px solid var(--sd-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--sd-space-3)',
          fontSize: 'var(--sd-font-size-xs)',
          color: 'var(--sd-color-text-muted)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-4)' }}>
          <span>● Vault: Ready</span>
          <span>Event Tail: Live</span>
        </div>
        <div>Sidra OS v4.0-alpha</div>
      </footer>

      {/* Ambient Overlay Portal Container */}
      <div id="sd-portal-root" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }} />
    </div>
  );
};
