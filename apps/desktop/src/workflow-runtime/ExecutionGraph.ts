import { WorkflowDefinition, WorkflowNode } from './types';

export class CycleInWorkflowError extends Error {
  constructor(nodeId: string) {
    super(`Cycle detected in workflow graph at node '${nodeId}'`);
    this.name = 'CycleInWorkflowError';
  }
}

export class ExecutionGraph {
  public static validate(def: WorkflowDefinition): void {
    if (!def.nodes.has(def.startNodeId)) {
      throw new Error(`Workflow '${def.name}' start node '${def.startNodeId}' does not exist.`);
    }

    // DFS Cycle Detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = def.nodes.get(nodeId);
      if (node && node.nextNodes) {
        for (const nextId of node.nextNodes) {
          if (!visited.has(nextId)) {
            dfs(nextId);
          } else if (recursionStack.has(nextId)) {
            throw new CycleInWorkflowError(nodeId);
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    dfs(def.startNodeId);
  }

  public static getNode(def: WorkflowDefinition, nodeId: string): WorkflowNode {
    const node = def.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node '${nodeId}' not found in workflow '${def.id}'.`);
    }
    return node;
  }
}
