import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Rail, RoomId } from '@sidra/ui';
import { Lobby } from './rooms/Lobby';
import { Boardroom } from './rooms/Boardroom';
import { Department } from './rooms/Department';
import { Archive } from './rooms/Archive';
import { Vault } from './rooms/Vault';
import { Console } from './rooms/Console';
import { Settings } from './rooms/Settings';
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
        {activeRoom === 'boardroom' && <Boardroom />}
        {activeRoom === 'department' && <Department />}
        {activeRoom === 'archive' && <Archive />}
        {activeRoom === 'vault' && <Vault />}
        {activeRoom === 'console' && <Console />}
        {activeRoom === 'settings' && <Settings />}
      </div>
    </QueryClientProvider>
  );
};

export default App;
