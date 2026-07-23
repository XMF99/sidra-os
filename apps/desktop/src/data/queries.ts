import { useQuery } from '@tanstack/react-query';
import { ipc } from './ipc';

export const queryKeys = {
  health: ['system', 'health'] as const,
  verifyChain: ['events', 'verifyChain'] as const,
  events: ['events', 'log'] as const,
  missions: ['missions', 'list'] as const,
  agents: ['agents', 'list'] as const,
  projects: ['projects', 'list'] as const,
  documents: ['memory', 'recentDocuments'] as const,
  performance: ['analytics', 'performance'] as const,
  notifications: ['notifications', 'list'] as const,
  dailySummary: ['analytics', 'dailySummary'] as const,
};

export const useSystemHealthQuery = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => ipc.getSystemHealth(),
  });
};

export const useVerifyChainQuery = () => {
  return useQuery({
    queryKey: queryKeys.verifyChain,
    queryFn: () => ipc.verifyEventChain(),
  });
};

export const useEventLogQuery = () => {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => ipc.getEventLog(),
  });
};

export const useMissionsQuery = () => {
  return useQuery({
    queryKey: queryKeys.missions,
    queryFn: () => ipc.getMissions(),
  });
};

export const useAgentsQuery = () => {
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: () => ipc.getAgents(),
  });
};

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => ipc.getProjects(),
  });
};

export const useDocumentsQuery = () => {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => ipc.getDocuments(),
  });
};

export const usePerformanceQuery = () => {
  return useQuery({
    queryKey: queryKeys.performance,
    queryFn: () => ipc.getPerformance(),
  });
};

export const useNotificationsQuery = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => ipc.getNotifications(),
  });
};

export const useDailySummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.dailySummary,
    queryFn: () => ipc.getDailySummary(),
  });
};
