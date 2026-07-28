import { WorkflowInstance, WorkflowDefinition, WorkflowNode } from './types';
import { ConnectorRuntime } from '../connector-framework/ConnectorRuntime';
import { CompensationEngine } from './CompensationEngine';

export interface ExecutionStepResult {
  nextState: 'running' | 'completed' | 'failed' | 'waiting';
  requiresApprovalNodeId?: string;
  output?: unknown;
}

export class WorkflowExecutor {
  public static async executeNode(
    instance: WorkflowInstance,
    _definition: WorkflowDefinition,
    node: WorkflowNode
  ): Promise<ExecutionStepResult> {
    try {
      switch (node.type) {
        case 'start':
          return { nextState: 'running', output: { started: true } };

        case 'end':
          return { nextState: 'completed', output: { finished: true } };

        case 'human_task':
        case 'approval':
          instance.pendingApprovals = instance.pendingApprovals || [];
          if (!instance.pendingApprovals.includes(node.id)) {
            instance.pendingApprovals.push(node.id);
          }
          return { nextState: 'waiting', requiresApprovalNodeId: node.id };

        case 'connector_task': {
          const connectorRuntime = ConnectorRuntime.getInstance();
          const connectorId = node.connectorId || 'conn_openrouter';
          const cap = (node.capability || 'execute') as any;
          const res = await connectorRuntime.executeCapability(connectorId, cap, instance.variables);
          return { nextState: 'running', output: res };
        }

        case 'ai_task': {
          return { nextState: 'running', output: { result: 'AI generation step completed', model: 'claude-3-5-sonnet' } };
        }

        case 'service_task':
        case 'task': {
          return { nextState: 'running', output: { executed: node.title || node.id } };
        }

        case 'decision':
        case 'switch': {
          let targetNode = node.nextNodes ? node.nextNodes[0] : undefined;
          if (node.switchCases && instance.variables.amount) {
            const isHigh = (instance.variables.amount as number) > 10000;
            targetNode = node.switchCases[String(isHigh)];
          }
          if (targetNode) {
            instance.currentNodeId = targetNode;
          }
          return { nextState: 'running', output: { selectedBranch: targetNode } };
        }

        case 'delay':
        case 'timer': {
          const delayMs = node.timeoutMs || 200;
          await new Promise((res) => setTimeout(res, delayMs));
          return { nextState: 'running', output: { delayedMs: delayMs } };
        }

        case 'parallel':
        case 'merge':
        case 'event':
        case 'sub_workflow': {
          return { nextState: 'running', output: { type: node.type, status: 'processed' } };
        }

        default:
          return { nextState: 'running', output: { node: node.id } };
      }
    } catch (err) {
      return { nextState: 'failed', output: { error: (err as Error).message } };
    }
  }

  public static async executeCompensation(
    instance: WorkflowInstance,
    definition: WorkflowDefinition
  ): Promise<void> {
    const compEngine = CompensationEngine.getInstance();
    await compEngine.executeCompensation(instance, definition);
  }
}
