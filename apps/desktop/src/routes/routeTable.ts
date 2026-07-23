export interface RouteDefinition {
  path: string;
  params?: string[];
  guard?: string;
  title: string;
}

export const ROUTE_TABLE = {
  dashboard: { path: '/', title: 'Dashboard', guard: 'authed' },
  missions: { path: '/missions', title: 'Mission Center', guard: 'mission.view' },
  missionNew: { path: '/missions/new', title: 'New Mission', guard: 'mission.create' },
  missionDetail: { path: '/missions/:id', title: 'Mission Detail', guard: 'mission.view' },
  org: { path: '/org', title: 'Organization', guard: 'org.view' },
  orgDivision: { path: '/org/divisions/:id', title: 'Division Detail', guard: 'org.view' },
  orgOffice: { path: '/org/offices/:id', title: 'Office Detail', guard: 'org.view' },
  orgProposal: { path: '/org/proposals/:id', title: 'Proposal Detail', guard: 'org.view' },
  departments: { path: '/departments', title: 'Departments', guard: 'departments.view' },
  departmentDetail: { path: '/departments/:id', title: 'Department Detail', guard: 'departments.view' },
  agents: { path: '/agents', title: 'Agents', guard: 'agents.view' },
  agentDetail: { path: '/agents/:id', title: 'Agent Detail', guard: 'agents.view' },
  projects: { path: '/projects', title: 'Projects', guard: 'projects.view' },
  projectDetail: { path: '/projects/:id', title: 'Project Detail', guard: 'projects.view' },
  knowledge: { path: '/knowledge', title: 'Knowledge Search', guard: 'knowledge.view' },
  knowledgeDoc: { path: '/knowledge/:docId', title: 'Document Detail', guard: 'knowledge.view' },
  connectors: { path: '/connectors', title: 'Connectors', guard: 'connectors.view' },
  connectorDetail: { path: '/connectors/:id', title: 'Connector Detail', guard: 'connectors.view' },
  analytics: { path: '/analytics', title: 'Analytics', guard: 'analytics.view' },
  events: { path: '/events', title: 'Event Log', guard: 'events.view' },
  settings: { path: '/settings', title: 'Settings', guard: 'authed' },
  devGallery: { path: '/dev/gallery', title: 'Component Gallery (Dev)', guard: 'dev' },
} as const;

export type RouteKey = keyof typeof ROUTE_TABLE;
