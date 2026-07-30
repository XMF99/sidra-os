import { create } from 'zustand';

export interface UserSession {
  userId: string;
  username: string;
  email: string;
  role: 'SYSTEM_ADMIN' | 'EXECUTIVE' | 'OPERATOR';
  department: string;
}

interface SessionState {
  isAuthenticated: boolean;
  isLocked: boolean;
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (passcode: string) => boolean;
}

const MOCK_USER: UserSession = {
  userId: 'usr-admin-01',
  username: 'Chief Executive',
  email: 'admin@sidra.os',
  role: 'SYSTEM_ADMIN',
  department: 'DEPT_EXECUTIVE',
};

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: true,
  isLocked: false,
  user: MOCK_USER,

  login: (user) => set({ isAuthenticated: true, isLocked: false, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  lockSession: () => set({ isLocked: true }),
  unlockSession: (_passcode) => {
    set({ isLocked: false });
    return true;
  },
}));
