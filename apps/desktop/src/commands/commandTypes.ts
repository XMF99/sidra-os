export type CommandCategory = 'navigation' | 'actions' | 'developer' | 'system';

export interface CommandExecutionContext {
  navigate?: (path: string) => void;
  toggleTheme?: () => void;
  refetchQueries?: () => void;
  openPalette?: () => void;
  [key: string]: unknown;
}

export interface CommandDefinition {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  keywords?: string[];
  capability?: string;
  shortcut?: string;
  iconName?: string;
  handler: (context?: CommandExecutionContext) => Promise<void> | void;
}

export interface CommandSearchResult {
  command: CommandDefinition;
  score: number;
  matchesTitle?: boolean;
}
