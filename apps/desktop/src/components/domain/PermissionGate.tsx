import { FC, ReactNode } from 'react';
import { useCan, PermissionState } from '../../app/providers/PermissionProvider';

export interface PermissionGateProps {
  capability: string;
  resourceId?: string;
  children: (state: PermissionState) => ReactNode;
}

export const PermissionGate: FC<PermissionGateProps> = ({
  capability,
  resourceId,
  children,
}) => {
  const canState = useCan(capability, resourceId);

  if (canState === 'hidden') {
    return null;
  }

  return <>{children(canState)}</>;
};
