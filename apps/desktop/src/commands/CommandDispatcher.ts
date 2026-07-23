import { CommandRegistry } from './CommandRegistry';
import { CommandExecutionContext } from './commandTypes';
import { MissionRuntime } from '../runtime/MissionRuntime';

export class CommandDispatcher {
  private static instance: CommandDispatcher;
  private recentCommandIds: string[] = [];
  private favoriteCommandIds: Set<string> = new Set();
  private runtime: MissionRuntime;

  private constructor() {
    this.runtime = MissionRuntime.getInstance();
  }

  public static getInstance(): CommandDispatcher {
    if (!CommandDispatcher.instance) {
      CommandDispatcher.instance = new CommandDispatcher();
    }
    return CommandDispatcher.instance;
  }

  public async dispatch(commandId: string, context?: CommandExecutionContext): Promise<boolean> {
    const registry = CommandRegistry.getInstance();
    const command = registry.get(commandId);

    if (!command) {
      console.warn(`[CommandDispatcher] Command '${commandId}' not found in registry.`);
      return false;
    }

    try {
      // Execute command handler through Runtime pipeline
      await command.handler(context);

      // Record recent command execution history (max 10)
      this.recentCommandIds = [
        commandId,
        ...this.recentCommandIds.filter((id) => id !== commandId),
      ].slice(0, 10);

      return true;
    } catch (err) {
      console.error(`[CommandDispatcher] Error executing command '${commandId}':`, err);
      return false;
    }
  }

  public getRuntime(): MissionRuntime {
    return this.runtime;
  }

  public getRecentCommandIds(): string[] {
    return [...this.recentCommandIds];
  }

  public toggleFavorite(commandId: string): void {
    if (this.favoriteCommandIds.has(commandId)) {
      this.favoriteCommandIds.delete(commandId);
    } else {
      this.favoriteCommandIds.add(commandId);
    }
  }

  public isFavorite(commandId: string): boolean {
    return this.favoriteCommandIds.has(commandId);
  }
}
