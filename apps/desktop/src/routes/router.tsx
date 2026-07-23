import { FC, useEffect, useState, ReactNode } from 'react';
import { RouteErrorBoundary } from '../app/boundaries/RouteErrorBoundary';
import { NotFound } from '../pages/NotFound';
import { ComponentGallery } from '../pages/dev/ComponentGallery';
import { ROUTE_TABLE } from './routeTable';

interface Props {
  children?: ReactNode;
  fallbackComponent?: ReactNode;
}

export const HashRouter: FC<Props> = ({ fallbackComponent }) => {
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

  if (rawPath === '/dev/gallery') {
    return (
      <RouteErrorBoundary>
        <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
          <ComponentGallery />
        </div>
      </RouteErrorBoundary>
    );
  }

  // Validate current hash against known route table paths
  const isValidRoute = () => {
    const rawPath = currentHash.replace(/^#/, '').split('?')[0] || '/';
    if (rawPath === '/' || rawPath === '') return true;

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
        {matched ? fallbackComponent : <NotFound />}
      </div>
    </RouteErrorBoundary>
  );
};
