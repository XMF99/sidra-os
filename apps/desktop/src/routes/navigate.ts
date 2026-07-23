export interface NavigateHelpers {
  dashboard: () => void;
  missions: (params?: { filter?: string; sort?: string; q?: string; dept?: string }) => void;
  missionDetail: (id: string, query?: { tab?: string }) => void;
  missionNew: () => void;
  org: () => void;
  orgDivision: (id: string) => void;
  orgOffice: (id: string) => void;
  orgProposal: (id: string) => void;
  departments: (params?: { q?: string }) => void;
  departmentDetail: (id: string, query?: { tab?: string }) => void;
  agents: (params?: { filter?: string; dept?: string }) => void;
  agentDetail: (id: string, query?: { tab?: string }) => void;
  projects: (params?: { q?: string }) => void;
  projectDetail: (id: string, query?: { tab?: string }) => void;
  knowledge: (params?: { q?: string; source?: string }) => void;
  documentDetail: (docId: string) => void;
  connectors: (params?: { q?: string; status?: string }) => void;
  connectorDetail: (id: string, query?: { tab?: string }) => void;
  analytics: (params?: { range?: string; scope?: string; metric?: string }) => void;
  events: (params?: { kind?: string; correlation?: string; entity?: string }) => void;
  settings: (query?: { section?: string }) => void;
}

const buildUrl = (path: string, query?: Record<string, string | undefined>): string => {
  if (!query) return `#${path}`;
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.set(k, v);
    }
  });
  const queryString = searchParams.toString();
  return `#${path}${queryString ? `?${queryString}` : ''}`;
};

export const navigate: NavigateHelpers = {
  dashboard: () => (window.location.hash = buildUrl('/')),
  missions: (params) => (window.location.hash = buildUrl('/missions', params as Record<string, string>)),
  missionDetail: (id, query) => (window.location.hash = buildUrl(`/missions/${id}`, query as Record<string, string>)),
  missionNew: () => (window.location.hash = buildUrl('/missions/new')),
  org: () => (window.location.hash = buildUrl('/org')),
  orgDivision: (id) => (window.location.hash = buildUrl(`/org/divisions/${id}`)),
  orgOffice: (id) => (window.location.hash = buildUrl(`/org/offices/${id}`)),
  orgProposal: (id) => (window.location.hash = buildUrl(`/org/proposals/${id}`)),
  departments: (params) => (window.location.hash = buildUrl('/departments', params as Record<string, string>)),
  departmentDetail: (id, query) => (window.location.hash = buildUrl(`/departments/${id}`, query as Record<string, string>)),
  agents: (params) => (window.location.hash = buildUrl('/agents', params as Record<string, string>)),
  agentDetail: (id, query) => (window.location.hash = buildUrl(`/agents/${id}`, query as Record<string, string>)),
  projects: (params) => (window.location.hash = buildUrl('/projects', params as Record<string, string>)),
  projectDetail: (id, query) => (window.location.hash = buildUrl(`/projects/${id}`, query as Record<string, string>)),
  knowledge: (params) => (window.location.hash = buildUrl('/knowledge', params as Record<string, string>)),
  documentDetail: (docId) => (window.location.hash = buildUrl(`/knowledge/${docId}`)),
  connectors: (params) => (window.location.hash = buildUrl('/connectors', params as Record<string, string>)),
  connectorDetail: (id, query) => (window.location.hash = buildUrl(`/connectors/${id}`, query as Record<string, string>)),
  analytics: (params) => (window.location.hash = buildUrl('/analytics', params as Record<string, string>)),
  events: (params) => (window.location.hash = buildUrl('/events', params as Record<string, string>)),
  settings: (query) => (window.location.hash = buildUrl('/settings', query as Record<string, string>)),
};
