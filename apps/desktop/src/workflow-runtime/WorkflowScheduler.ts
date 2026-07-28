import { WorkflowInstance, WorkflowDefinition } from './types';
import { WorkflowExecutor, ExecutionStepResult } from './WorkflowExecutor';

export class WorkflowScheduler {
  public static async stepInstance(
    instance: WorkflowInstance,
    definition: WorkflowDefinition
  ): Promise<ExecutionStepResult> {
    const currentNode = definition.nodes.get(instance.currentNodeId);
    if (!currentNode) {
      return { nextState: 'failed', output: { error: `Node '${instance.currentNodeId}' not found.` } };
    }

    const startTime = Date.now();
    const result = await WorkflowExecutor.executeNode(instance, definition, currentNode);
    const durationMs = Date.now() - startTime;

    instance.history.push({
      nodeId: currentNode.id,
      state: result.nextState,
      timestamp: new Date().toISOString(),
      output: result.output,
      durationMs,
    });

    if (result.nextState === 'running') {
      if (currentNode.nextNodes && currentNode.nextNodes.length > 0) {
        instance.currentNodeId = currentNode.nextNodes[0];
      }
    }

    return result;
  }
}
