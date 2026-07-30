import { FC, useState, useEffect, ReactNode } from 'react';
import { Sidebar } from './shell/Sidebar';
import { TopBar } from './shell/TopBar';
import { TabBar } from './shell/TabBar';
import { StatusBar } from './shell/StatusBar';
import { RightActivityPanel } from './shell/RightActivityPanel';
import { SplashScreen } from './shell/SplashScreen';
import { RouteErrorBoundary } from './boundaries/RouteErrorBoundary';
import { CommandPaletteModal } from '../commands/CommandPaletteModal';
import { UniversalSearchModal } from '../components/search/UniversalSearchModal';
import { ProjectWizardModal } from '../components/projects/ProjectWizardModal';
import { MissionWizardModal } from '../components/missions/MissionWizardModal';
import { QuickCreateFAB } from '../components/common/QuickCreateFAB';
import { ModalContainer } from '../components/dialogs/ModalContainer';
import { ToastContainer } from '../components/notifications/ToastContainer';
import { useShellStore } from '../state/useShellStore';
import { useSessionStore } from '../state/useSessionStore';

interface Props {
  children?: ReactNode;
}

export const AppShell: FC<Props> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const { rightPanelOpen } = useShellStore();
  const { isLocked, unlockSession } = useSessionStore();

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
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Lock Screen Overlay Hook */}
      {isLocked && (
        <div
          role="alertdialog"
          aria-label="Session Locked"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <h2>Session Locked</h2>
          <p style={{ color: '#94a3b8' }}>Enter your passcode to unlock workspace</p>
          <button
            onClick={() => unlockSession('1234')}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 16,
            }}
          >
            Unlock Workspace
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'var(--sd-topbar-h) auto 1fr var(--sd-statusbar-h)',
          gridTemplateColumns: `${sidebarWidth} 1fr ${rightPanelWidth}`,
          gridTemplateAreas: `
            "sidebar  topbar   topbar"
            "sidebar  tabbar   rightpanel"
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

        {/* Multi-Tab Navigation Area */}
        <div style={{ gridArea: 'tabbar', height: '100%', overflow: 'hidden' }}>
          <TabBar />
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
          <ModalContainer />
          <ToastContainer />
          <div style={{ pointerEvents: 'auto' }}>
            <ProjectWizardModal />
            <MissionWizardModal />
            <QuickCreateFAB />
          </div>
        </div>
      </div>
    </>
  );
};
