import { AgentModel, AgentCapability } from './types';

export class AgentRegistry {
  private agents = new Map<string, AgentModel>();

  public register(agent: AgentModel): void {
    this.agents.set(agent.id, agent);
  }

  public unregister(id: string): boolean {
    return this.agents.delete(id);
  }

  public getById(id: string): AgentModel | undefined {
    return this.agents.get(id);
  }

  public getAll(): AgentModel[] {
    return Array.from(this.agents.values());
  }

  public getByCapability(capability: AgentCapability): AgentModel[] {
    return this.getAll().filter((a) => a.capabilities.includes(capability));
  }

  public getByDepartment(department: string): AgentModel[] {
    return this.getAll().filter((a) => a.department.toLowerCase() === department.toLowerCase());
  }

  public getByRole(role: string): AgentModel[] {
    return this.getAll().filter((a) => a.role.toLowerCase() === role.toLowerCase());
  }

  public getAvailableForCapability(capability: AgentCapability): AgentModel[] {
    return this.getByCapability(capability).filter(
      (a) => a.state === 'idle' && a.health === 'healthy'
    );
  }
}
