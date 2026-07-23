import { FC } from 'react';
import { TauriBridgeProvider } from './app/providers/TauriBridgeProvider';
import { I18nRtlProvider } from './app/providers/I18nRtlProvider';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { QueryProvider } from './app/providers/QueryProvider';
import { PermissionProvider } from './app/providers/PermissionProvider';
import { ShortcutRegistryProvider } from './app/providers/ShortcutRegistryProvider';
import { NotificationProvider } from './app/providers/NotificationProvider';
import { AppErrorBoundary } from './app/boundaries/AppErrorBoundary';
import { HashRouter } from './routes/router';
import { AppShell } from './app/AppShell';
import './design/tokens/tokens.css';

export const App: FC = () => {
  return (
    <TauriBridgeProvider>
      <I18nRtlProvider>
        <ThemeProvider>
          <QueryProvider>
            <PermissionProvider>
              <ShortcutRegistryProvider>
                <NotificationProvider>
                  <AppErrorBoundary>
                    <AppShell>
                      <HashRouter />
                    </AppShell>
                  </AppErrorBoundary>
                </NotificationProvider>
              </ShortcutRegistryProvider>
            </PermissionProvider>
          </QueryProvider>
        </ThemeProvider>
      </I18nRtlProvider>
    </TauriBridgeProvider>
  );
};

export default App;
