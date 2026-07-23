import { FC } from 'react';
import { Badge } from '../primitives/Badge';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  let tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' = 'neutral';

  if (['running', 'active', 'completed', 'resolved', 'allowed', 'live'].includes(normalized)) {
    tone = 'success';
  } else if (['awaiting_approval', 'awaitingapproval', 'pending', 'syncing', 'reconnecting'].includes(normalized)) {
    tone = 'warning';
  } else if (['failed', 'blocked', 'rejected', 'denied', 'error'].includes(normalized)) {
    tone = 'danger';
  } else if (['draft', 'idle'].includes(normalized)) {
    tone = 'neutral';
  } else {
    tone = 'info';
  }

  return <Badge tone={tone}>{status}</Badge>;
};
