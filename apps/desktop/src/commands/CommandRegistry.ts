import { CommandDefinition, CommandSearchResult, CommandCategory } from './commandTypes';
import { PermissionState } from '../app/providers/PermissionProvider';

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands = new Map<string, CommandDefinition>();

  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  public register(command: CommandDefinition): void {
    this.commands.set(command.id, command);
  }

  public unregister(id: string): void {
    this.commands.delete(id);
  }

  public get(id: string): CommandDefinition | undefined {
    return this.commands.get(id);
  }

  public getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  public getByCategory(category: CommandCategory): CommandDefinition[] {
    return this.getAll().filter((c) => c.category === category);
  }

  public search(
    query: string,
    checkCanFn?: (capability: string) => PermissionState
  ): CommandSearchResult[] {
    const q = query.toLowerCase().trim();
    const available = this.getAll().filter((cmd) => {
      if (!cmd.capability || !checkCanFn) return true;
      const perm = checkCanFn(cmd.capability);
      return perm !== 'hidden';
    });

    if (!q) {
      return available.map((cmd) => ({ command: cmd, score: 1 }));
    }

    const results: CommandSearchResult[] = [];

    for (const cmd of available) {
      const titleLower = cmd.title.toLowerCase();
      const subtitleLower = (cmd.subtitle || '').toLowerCase();
      const categoryLower = cmd.category.toLowerCase();
      const keywordsLower = (cmd.keywords || []).map((k) => k.toLowerCase()).join(' ');

      let score = 0;

      if (titleLower === q) {
        score += 100;
      } else if (titleLower.startsWith(q)) {
        score += 80;
      } else if (titleLower.includes(q)) {
        score += 60;
      }

      if (subtitleLower.includes(q)) {
        score += 40;
      }

      if (categoryLower.includes(q)) {
        score += 30;
      }

      if (keywordsLower.includes(q)) {
        score += 25;
      }

      if (score > 0) {
        results.push({ command: cmd, score, matchesTitle: titleLower.includes(q) });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
