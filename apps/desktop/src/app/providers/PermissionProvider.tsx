import { createContext, useContext, useState, FC, ReactNode } from 'react';

export type PermissionState = 'enabled' | 'disabled' | 'hidden' | 'explain';

interface PermissionContextType {
  capabilities: Set<string>;
  useCan: (capability: string, resourceId?: string) => PermissionState;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType>({
  capabilities: new Set(),
  useCan: () => 'enabled',
  refreshPermissions: async () => {},
});

export const useCan = (capability: string, resourceId?: string): PermissionState => {
  const { useCan: check } = useContext(PermissionContext);
  return check(capability, resourceId);
};

export const usePermissionContext = (): PermissionContextType => useContext(PermissionContext);

interface Props {
  children: ReactNode;
}

export const PermissionProvider: FC<Props> = ({ children }) => {
  const [capabilities] = useState<Set<string>>(new Set(['*']));

  const useCanCheck = (capability: string, _resourceId?: string): PermissionState => {
    if (capabilities.has('*') || capabilities.has(capability)) {
      return 'enabled';
    }
    return 'disabled';
  };

  const refreshPermissions = async (): Promise<void> => {
    // In Epic 4, fetch host permissions.forActor
  };

  return (
    <PermissionContext.Provider
      value={{
        capabilities,
        useCan: useCanCheck,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
