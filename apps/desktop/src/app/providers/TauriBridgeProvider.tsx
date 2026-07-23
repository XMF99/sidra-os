import { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';

interface TauriBridgeContextType {
  isTauri: boolean;
  tailStatus: 'live' | 'reconnecting' | 'offline';
  invokeCommand: <T = unknown>(command: string, args?: Record<string, unknown>) => Promise<T>;
}

const TauriBridgeContext = createContext<TauriBridgeContextType>({
  isTauri: false,
  tailStatus: 'live',
  invokeCommand: async () => {
    throw new Error('TauriBridgeProvider not initialized');
  },
});

export const useTauriBridge = (): TauriBridgeContextType => useContext(TauriBridgeContext);

interface Props {
  children: ReactNode;
}

export const TauriBridgeProvider: FC<Props> = ({ children }) => {
  const [isTauri, setIsTauri] = useState<boolean>(false);
  const [tailStatus, setTailStatus] = useState<'live' | 'reconnecting' | 'offline'>('live');

  useEffect(() => {
    // Detect window.__TAURI__ or tauri runtime
    const hasTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    setIsTauri(hasTauri);
    setTailStatus('live');
  }, []);

  const invokeCommand = async <T = unknown>(commandName: string, args?: Record<string, unknown>): Promise<T> => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke<T>(commandName, args);
    }
    console.warn(`[TauriBridge] Browser fallback stub for IPC: ${commandName}`, args);
    return {} as T;
  };

  return (
    <TauriBridgeContext.Provider value={{ isTauri, tailStatus, invokeCommand }}>
      {children}
    </TauriBridgeContext.Provider>
  );
};
