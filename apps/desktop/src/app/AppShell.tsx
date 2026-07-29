import { FC, useState, useEffect, ReactNode } from 'react';
import { Sidebar } from './shell/Sidebar';
import { TopBar } from './shell/TopBar';
import { StatusBar } from './shell/StatusBar';
import { RightActivityPanel } from './shell/RightActivityPanel';
import { RouteErrorBoundary } from './boundaries/RouteErrorBoundary';
import { CommandPaletteModal } from '../commands/CommandPaletteModal';
import { UniversalSearchModal } from '../components/search/UniversalSearchModal';
import { ProjectWizardModal } from '../components/projects/ProjectWizardModal';
import { MissionWizardModal } from '../components/missions/MissionWizardModal';
import { QuickCreateFAB } from '../components/common/QuickCreateFAB';
import { useShellStore } from '../state/useShellStore';

interface Props {
  children?: ReactNode;
}

export const AppShell: FC<Props> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const { rightPanelOpen } = useShellStore();

  // Keyboard shortcut listener for ⌘B (toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 'var(--sd-sidebar-w-collapsed)' : 'var(--sd-sidebar-w)';
  const rightPanelWidth = rightPanelOpen ? '320px' : '0px';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'var(--sd-topbar-h) 1fr var(--sd-statusbar-h)',
        gridTemplateColumns: `${sidebarWidth} 1fr ${rightPanelWidth}`,
        gridTemplateAreas: `
          "sidebar  topbar   topbar"
          "sidebar  content  rightpanel"
          "statusbar statusbar statusbar"
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
      {/* Sidebar Area */}
      <div style={{ gridArea: 'sidebar', height: '100%', overflow: 'hidden' }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Top Bar Area */}
      <div style={{ gridArea: 'topbar', height: '100%', overflow: 'hidden' }}>
        <TopBar />
      </div>

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

      {/* Right Activity Panel Area */}
      <div style={{ gridArea: 'rightpanel', height: '100%', overflow: 'hidden' }}>
        <RightActivityPanel />
      </div>

      {/* Status Bar Area */}
      <div style={{ gridArea: 'statusbar', height: '100%', overflow: 'hidden' }}>
        <StatusBar />
      </div>

      {/* Ambient Overlay Portal Container */}
      <div id="sd-portal-root" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }}>
        <CommandPaletteModal />
        <UniversalSearchModal />
        <div style={{ pointerEvents: 'auto' }}>
          <ProjectWizardModal />
          <MissionWizardModal />
          <QuickCreateFAB />
        </div>
      </div>
    </div>
  );
};
