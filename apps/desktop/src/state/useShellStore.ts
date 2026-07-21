import { create } from 'zustand';
import { RoomId } from '@sidra/ui';

interface ShellState {
  activeRoom: RoomId;
  setActiveRoom: (room: RoomId) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  activeRoom: 'lobby',
  setActiveRoom: (room) => set({ activeRoom: room }),
}));
