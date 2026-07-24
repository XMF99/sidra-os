import { FC, useEffect, useState, ReactNode } from 'react';
import { RouteErrorBoundary } from '../app/boundaries/RouteErrorBoundary';
import { NotFound } from '../pages/NotFound';
import { ComponentGallery } from '../pages/dev/ComponentGallery';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { DeveloperConsole } from '../developer-console/DeveloperConsole';
import { ROUTE_TABLE } from './routeTable';

interface Props {
  children?: ReactNode;
  fallbackComponent?: ReactNode;
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

  if (rawPath === '/developer' || rawPath === '/dev') {
    return (
      <RouteErrorBoundary>
        <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
          <DeveloperConsole />
        </div>
      </RouteErrorBoundary>
    );
  }

  if (rawPath === '/dev/gallery') {
    return (
      <RouteErrorBoundary>
        <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
          <ComponentGallery />
        </div>
      </RouteErrorBoundary>
    );
  }

  if (rawPath === '/' || rawPath === '') {
    return (
      <RouteErrorBoundary>
        <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
          <DashboardPage />
        </div>
      </RouteErrorBoundary>
    );
  }

  // Validate current hash against known route table paths
  const isValidRoute = () => {
    const rawPath = currentHash.replace(/^#/, '').split('?')[0] || '/';
    if (rawPath === '/' || rawPath === '' || rawPath === '/developer' || rawPath === '/dev') return true;

    return Object.values(ROUTE_TABLE).some((route) => {
      const pattern = route.path.replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(rawPath);
    });
  };

  const matched = isValidRoute();

  return (
    <RouteErrorBoundary>
      <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
        {matched ? <DashboardPage /> : <NotFound />}
      </div>
    </RouteErrorBoundary>
  );
};
