import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Rail, RoomId } from '@sidra/ui';
import { Lobby } from './rooms/Lobby';
import { useShellStore } from './state/useShellStore';
import '@sidra/design/style';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const activeRoom = useShellStore((state) => state.activeRoom);
  const setActiveRoom = useShellStore((state) => state.setActiveRoom);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Rail activeRoom={activeRoom} onSelectRoom={(room) => setActiveRoom(room as RoomId)} />

        {activeRoom === 'lobby' && <Lobby />}

        {activeRoom !== 'lobby' && (
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--sd-color-surface-base)',
              color: 'var(--sd-color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p>Room [{activeRoom}] under construction</p>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;
