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
    id: 'action.create_project',
    title: 'Create Project',
    subtitle: 'Launch 6-step project wizard with templates',
    category: 'actions',
    keywords: ['create', 'new', 'project', 'workspace', 'wizard'],
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:open-project-wizard'));
    },
  });

  registry.register({
    id: 'action.new_mission',
    title: 'Create Mission',
    subtitle: 'Create a new mission with objective wizard',
    category: 'actions',
    keywords: ['create', 'new', 'mission', 'task'],
    capability: 'mission.create',
    shortcut: '⌘N',
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:open-mission-wizard'));
    },
  });

  registry.register({
    id: 'action.open_gora',
    title: 'Open GORA Workspace',
    subtitle: 'Global Operations & Resource Architecture',
    category: 'actions',
    keywords: ['gora', 'workspace', 'project', 'enterprise'],
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:open-project-gora'));
    },
  });

  registry.register({
    id: 'action.open_game_studio',
    title: 'Open Game Studio',
    subtitle: '3D/2D game development template workspace',
    category: 'actions',
    keywords: ['game', 'studio', 'template', 'graphics', 'physics'],
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:open-project-studio'));
    },
  });

  registry.register({
    id: 'action.assign_ai',
    title: 'Assign AI Team',
    subtitle: 'Roster and assign autonomous AI agents',
    category: 'actions',
    keywords: ['assign', 'ai', 'team', 'agents', 'roster'],
    handler: () => {
      window.location.hash = '#/agents';
    },
  });

  registry.register({
    id: 'action.start_planning',
    title: 'Start Planning Session',
    subtitle: 'Initiate strategic planning sprint',
    category: 'actions',
    keywords: ['plan', 'planning', 'sprint', 'strategy'],
    handler: () => {
      window.location.hash = '#/missions';
    },
  });

  registry.register({
    id: 'action.search_knowledge',
    title: 'Search Knowledge',
    subtitle: 'Universal search across ingested files and memory',
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
    id: 'action.toggle_right_panel',
    title: 'Toggle Executive Activity Panel',
    subtitle: 'Show or hide the live activity feed and AI roster',
    category: 'actions',
    keywords: ['panel', 'right', 'activity', 'feed', 'sidebar'],
    handler: () => {
      window.dispatchEvent(new CustomEvent('sd:toggle-right-panel'));
    },
  });

  // 3. Developer Commands
  registry.register({
    id: 'dev.console',
    title: 'Open Developer Console',
    subtitle: 'Engineering runtime inspector & debugging suite',
    category: 'developer',
    keywords: ['dev', 'console', 'debug', 'inspector'],
    handler: () => {
      window.location.hash = '#/developer';
    },
  });

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
