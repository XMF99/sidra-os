import { WorkflowInstance, WorkflowDefinition } from './types';
import { WorkflowExecutor } from './WorkflowExecutor';

export class WorkflowScheduler {
  public static async stepInstance(
    instance: WorkflowInstance,
    def: WorkflowDefinition
  ): Promise<{ nextState: string; activeNodeIds: string[]; requiresApprovalNodeId?: string }> {
    const currentNode = def.nodes.get(instance.currentNodeId);
    if (!currentNode) {
      return { nextState: 'failed', activeNodeIds: [] };
    }

    instance.history.push({
      nodeId: currentNode.id,
      state: 'completed',
      timestamp: new Date().toISOString(),
    });

    const result = await WorkflowExecutor.executeNode(currentNode, instance, def);

    if (result.requiresApproval) {
      if (!instance.pendingApprovals) instance.pendingApprovals = [];
      instance.pendingApprovals.push(currentNode.id);
      return { nextState: 'waiting', activeNodeIds: [currentNode.id], requiresApprovalNodeId: currentNode.id };
    }

    if (result.isComplete) {
      return { nextState: 'completed', activeNodeIds: [] };
    }

    if (result.nextNodeIds.length > 0) {
      instance.currentNodeId = result.nextNodeIds[0];
      return { nextState: 'running', activeNodeIds: result.nextNodeIds };
    }

    return { nextState: 'completed', activeNodeIds: [] };
  }
}
