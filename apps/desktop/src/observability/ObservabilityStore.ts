import { DependencyNode } from './types';

export class ObservabilityStore {
  private dependencyNodes: DependencyNode[] = [
    { id: 'mission', label: 'Mission Runtime', type: 'runtime', status: 'healthy', dependencies: ['agent', 'workflow', 'automation', 'eventbus'] },
    { id: 'workflow', label: 'Workflow Runtime', type: 'runtime', status: 'healthy', dependencies: ['agent', 'connector', 'eventbus'] },
    { id: 'automation', label: 'Automation Runtime', type: 'runtime', status: 'healthy', dependencies: ['connector', 'eventbus'] },
    { id: 'agent', label: 'Agent Runtime', type: 'runtime', status: 'healthy', dependencies: ['knowledge', 'eventbus'] },
    { id: 'knowledge', label: 'Knowledge Runtime', type: 'storage', status: 'healthy', dependencies: ['eventbus'] },
    { id: 'decision', label: 'Decision Engine', type: 'engine', status: 'healthy', dependencies: ['knowledge', 'eventbus'] },
    { id: 'planning', label: 'Planning Engine', type: 'engine', status: 'healthy', dependencies: ['decision', 'eventbus'] },
    { id: 'execution', label: 'Execution Coordination Engine', type: 'engine', status: 'healthy', dependencies: ['planning', 'decision', 'resource', 'eventbus'] },
    { id: 'resource', label: 'Resource Engine', type: 'engine', status: 'healthy', dependencies: ['eventbus'] },
    { id: 'eventbus', label: 'Event Bus Engine', type: 'engine', status: 'healthy', dependencies: [] },
  ];

  public getDependencyGraph(): DependencyNode[] {
    return [...this.dependencyNodes];
  }
}
