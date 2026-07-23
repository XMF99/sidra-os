import { WorkflowDefinition, WorkflowNode } from './types';
import { ExecutionGraph } from './ExecutionGraph';

export class WorkflowRegistry {
  private static instance: WorkflowRegistry;
  private definitions = new Map<string, WorkflowDefinition>();

  private constructor() {
    this.registerDefaultWorkflows();
  }

  public static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  private registerDefaultWorkflows(): void {
    // 1. Standard Mission Execution Workflow
    const nodes = new Map<string, WorkflowNode>();
    nodes.set('start_1', { id: 'start_1', type: 'start', title: 'Start Workflow', nextNodes: ['task_analysis'] });
    nodes.set('task_analysis', { id: 'task_analysis', type: 'task', title: 'Initial Analysis', capability: 'analysis', nextNodes: ['decision_budget'] });
    nodes.set('decision_budget', { id: 'decision_budget', type: 'decision', title: 'Evaluate Budget', condition: 'vars.spendUSD > 100', nextNodes: ['approval_principal', 'task_exec'] });
    nodes.set('approval_principal', { id: 'approval_principal', type: 'approval', title: 'Principal Approval', nextNodes: ['task_exec'] });
    nodes.set('task_exec', { id: 'task_exec', type: 'task', title: 'Execute Mission Action', capability: 'coding', nextNodes: ['end_1'], compensationNodeId: 'comp_rollback' });
    nodes.set('comp_rollback', { id: 'comp_rollback', type: 'task', title: 'Rollback Action', capability: 'analysis' });
    nodes.set('end_1', { id: 'end_1', type: 'end', title: 'End Workflow' });

    const def: WorkflowDefinition = {
      id: 'wf_standard_mission',
      name: 'Standard Mission Orchestration',
      startNodeId: 'start_1',
      nodes,
    };

    this.register(def);
  }

  public register(def: WorkflowDefinition): void {
    ExecutionGraph.validate(def);
    this.definitions.set(def.id, def);
  }

  public get(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id);
  }

  public getAll(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }
}
