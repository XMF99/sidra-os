import { FC, useEffect, useState, ReactNode } from 'react';
import { RouteErrorBoundary } from '../app/boundaries/RouteErrorBoundary';
import { NotFound } from '../pages/NotFound';
import { ComponentGallery } from '../pages/dev/ComponentGallery';
import { HomePage } from '../pages/home/HomePage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { DeveloperConsole } from '../developer-console/DeveloperConsole';
import { SetupWizard } from '../pages/setup/SetupWizard';
import { GameStudioManager } from '../pages/game-studio/GameStudioManager';

// Room components
import { Archive } from '../rooms/Archive';
import { ArtifactsRoom } from '../rooms/ArtifactsRoom';
import { Boardroom } from '../rooms/Boardroom';
import { Console } from '../rooms/Console';
import { DashboardRoom } from '../rooms/DashboardRoom';
import { Department } from '../rooms/Department';
import { EventLogRoom } from '../rooms/EventLogRoom';
import { Lobby } from '../rooms/Lobby';
import { SeatsRoom } from '../rooms/SeatsRoom';
import { Settings } from '../rooms/Settings';
import { SystemHealthRoom } from '../rooms/SystemHealthRoom';
import { Vault } from '../rooms/Vault';

interface Props {
  children?: ReactNode;
  fallbackComponent?: ReactNode;
}

export function matchRouteComponent(rawPath: string): ReactNode {
  const cleanPath = rawPath.split('?')[0] || '/';

  // Game Studio Manager Route
  if (cleanPath === '/studio' || cleanPath === '/game-studio' || cleanPath === '/gamestudio') {
    return <GameStudioManager />;
  }

  // Setup Wizard Route
  if (cleanPath === '/setup' || cleanPath === '/welcome') {
    return <SetupWizard />;
  }

  // Exact & home routes
  if (cleanPath === '/' || cleanPath === '' || cleanPath === '/dashboard' || cleanPath === '/home') {
    return <HomePage />;
  }
  if (cleanPath === '/developer' || cleanPath === '/dev') {
    return <DeveloperConsole />;
  }
  if (cleanPath === '/dev/gallery') {
    return <ComponentGallery />;
  }

  // Work & Missions
  if (cleanPath === '/missions' || cleanPath.startsWith('/missions/')) {
    return <Lobby />;
  }

  // Organization
  if (cleanPath === '/org' || cleanPath.startsWith('/org/')) {
    return <Boardroom />;
  }

  // Departments
  if (cleanPath === '/departments' || cleanPath.startsWith('/departments/')) {
    return <Department />;
  }

  // Agents & Seats
  if (cleanPath === '/agents' || cleanPath.startsWith('/agents/')) {
    return <SeatsRoom />;
  }

  // Projects Workspace
  if (cleanPath === '/projects' || cleanPath.startsWith('/projects/')) {
    return <ProjectsPage />;
  }

  // Knowledge & Vault
  if (cleanPath === '/knowledge' || cleanPath.startsWith('/knowledge/')) {
    return <Vault />;
  }

  // Connectors & Artifacts
  if (cleanPath === '/connectors' || cleanPath.startsWith('/connectors/')) {
    return <ArtifactsRoom />;
  }

  // Analytics & Health
  if (cleanPath === '/analytics') {
    return <SystemHealthRoom />;
  }

  // Event Log
  if (cleanPath === '/events') {
    return <EventLogRoom />;
  }

  // Settings
  if (cleanPath === '/settings') {
    return <Settings />;
  }

  // Direct Room Routes
  if (cleanPath === '/rooms/archive' || cleanPath === '/archive') {
    return <Archive />;
  }
  if (cleanPath === '/rooms/artifacts' || cleanPath === '/artifacts') {
    return <ArtifactsRoom />;
  }
  if (cleanPath === '/rooms/boardroom' || cleanPath === '/boardroom') {
    return <Boardroom />;
  }
  if (cleanPath === '/rooms/console' || cleanPath === '/console') {
    return <Console />;
  }
  if (cleanPath === '/rooms/dashboard') {
    return <DashboardRoom />;
  }
  if (cleanPath === '/rooms/department') {
    return <Department />;
  }
  if (cleanPath === '/rooms/events' || cleanPath === '/rooms/event-log') {
    return <EventLogRoom />;
  }
  if (cleanPath === '/rooms/lobby' || cleanPath === '/lobby') {
    return <Lobby />;
  }
  if (cleanPath === '/rooms/seats' || cleanPath === '/seats') {
    return <SeatsRoom />;
  }
  if (cleanPath === '/rooms/settings') {
    return <Settings />;
  }
  if (cleanPath === '/rooms/system-health' || cleanPath === '/rooms/health' || cleanPath === '/health') {
    return <SystemHealthRoom />;
  }
  if (cleanPath === '/rooms/vault' || cleanPath === '/vault') {
    return <Vault />;
  }
  if (cleanPath === '/rooms/voice' || cleanPath === '/voice') {
    return <Lobby />;
  }

  return <NotFound />;
}

export const HashRouter: FC<Props> = () => {
  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const rawPath = currentHash.replace(/^#/, '').split('?')[0] || '/';
  const componentToRender = matchRouteComponent(rawPath);

  return (
    <RouteErrorBoundary>
      <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
        {componentToRender}
      </div>
    </RouteErrorBoundary>
  );
};
