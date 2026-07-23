import { CommandRegistry } from './CommandRegistry';

export function registerDefaultCommands(): void {
  const registry = CommandRegistry.getInstance();

  // 1. Navigation Commands
  registry.register({
    id: 'nav.dashboard',
    title: 'Open Dashboard',
    subtitle: 'System operating picture and metrics',
    category: 'navigation',
    keywords: ['home', 'overview', 'metrics', 'dashboard'],
    shortcut: 'g d',
    handler: () => {
      window.location.hash = '#/';
    },
  });

  registry.register({
    id: 'nav.missions',
    title: 'Open Missions',
    subtitle: 'Mission Center and active workflows',
    category: 'navigation',
    keywords: ['missions', 'tasks', 'workflows', 'runs'],
    shortcut: 'g m',
    handler: () => {
      window.location.hash = '#/missions';
    },
  });

  registry.register({
    id: 'nav.agents',
    title: 'Open Agents',
    subtitle: 'Agent roster and status',
    category: 'navigation',
    keywords: ['agents', 'workers', 'ai', 'roster'],
    shortcut: 'g a',
    handler: () => {
      window.location.hash = '#/agents';
    },
  });

  registry.register({
    id: 'nav.projects',
    title: 'Open Projects',
    subtitle: 'Project workspaces and folders',
    category: 'navigation',
    keywords: ['projects', 'workspaces', 'folders'],
    shortcut: 'g p',
    handler: () => {
      window.location.hash = '#/projects';
    },
  });

  registry.register({
    id: 'nav.knowledge',
    title: 'Open Knowledge',
    subtitle: 'Hybrid retrieval memory and document store',
    category: 'navigation',
    keywords: ['knowledge', 'documents', 'memory', 'search', 'vector'],
    shortcut: 'g k',
    handler: () => {
      window.location.hash = '#/knowledge';
    },
  });

  registry.register({
    id: 'nav.connectors',
    title: 'Open Connectors',
    subtitle: 'Egress connectors and integrations',
    category: 'navigation',
    keywords: ['connectors', 'integrations', 'api', 'egress'],
    shortcut: 'g c',
    handler: () => {
      window.location.hash = '#/connectors';
    },
  });

  registry.register({
    id: 'nav.analytics',
    title: 'Open Analytics',
    subtitle: 'System performance and cost metrics',
    category: 'navigation',
    keywords: ['analytics', 'metrics', 'cost', 'spend', 'performance'],
    shortcut: 'g l',
    handler: () => {
      window.location.hash = '#/analytics';
    },
  });

  registry.register({
    id: 'nav.events',
    title: 'Open Event Log',
    subtitle: 'Immutable event stream and audit chain',
    category: 'navigation',
    keywords: ['events', 'log', 'audit', 'hash', 'chain'],
    shortcut: 'g e',
    handler: () => {
      window.location.hash = '#/events';
    },
  });

  registry.register({
    id: 'nav.settings',
    title: 'Open Settings',
    subtitle: 'System configuration and preferences',
    category: 'navigation',
    keywords: ['settings', 'config', 'preferences', 'theme'],
    shortcut: 'g s',
    handler: () => {
      window.location.hash = '#/settings';
    },
  });

  // 2. Actions Commands
  registry.register({
    id: 'action.new_mission',
    title: 'New Mission',
    subtitle: 'Create a new mission with objective wizard',
    category: 'actions',
    keywords: ['create', 'new', 'mission', 'task'],
    capability: 'mission.create',
    shortcut: '⌘N',
    handler: () => {
      window.location.hash = '#/missions/new';
    },
  });

  registry.register({
    id: 'action.search_knowledge',
    title: 'Search Knowledge',
    subtitle: 'Vector and semantic search across ingested files',
    category: 'actions',
    keywords: ['find', 'search', 'docs', 'knowledge'],
    shortcut: '⌘/',
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:open-search'));
    },
  });

  registry.register({
    id: 'action.toggle_theme',
    title: 'Toggle Theme',
    subtitle: 'Switch between light, dark, and atrium modes',
    category: 'actions',
    keywords: ['theme', 'dark', 'light', 'appearance'],
    handler: () => {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
    },
  });

  registry.register({
    id: 'action.refresh_dashboard',
    title: 'Refresh Dashboard Data',
    subtitle: 'Refetch all read model queries',
    category: 'actions',
    keywords: ['refresh', 'reload', 'sync', 'fetch'],
    handler: () => {
      window.location.reload();
    },
  });

  // 3. Developer Commands
  registry.register({
    id: 'dev.gallery',
    title: 'Open Component Gallery',
    subtitle: 'Interactive UI design tokens and components catalog',
    category: 'developer',
    keywords: ['dev', 'gallery', 'components', 'tokens', 'ui'],
    handler: () => {
      window.location.hash = '#/dev/gallery';
    },
  });
}
