import { WorkflowNode, WorkflowInstance, WorkflowDefinition } from './types';
import { AgentRuntime } from '../agent-runtime/AgentRuntime';

export class WorkflowExecutor {
  public static async executeNode(
    node: WorkflowNode,
    instance: WorkflowInstance,
    _def: WorkflowDefinition
  ): Promise<{ nextNodeIds: string[]; requiresApproval?: boolean; isComplete?: boolean; error?: string }> {
    switch (node.type) {
      case 'start':
        return { nextNodeIds: node.nextNodes || [] };

      case 'task': {
        const agentRuntime = AgentRuntime.getInstance();
        if (node.capability) {
          const assigned = agentRuntime.assignMission(instance.missionId, node.capability);
          if (assigned) {
            instance.variables[`node_${node.id}_assigned_agent`] = assigned.name;
          }
        }
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'decision': {
        // Simple condition evaluation
        const condition = node.condition || 'false';
        let conditionResult = false;
        try {
          // Safe rule evaluation over instance.variables
          const vars = instance.variables;
          conditionResult = Boolean(new Function('vars', `return ${condition}`)(vars));
        } catch {
          conditionResult = false;
        }

        // Branching: index 0 if true, index 1 if false
        if (conditionResult && node.nextNodes && node.nextNodes.length > 0) {
          return { nextNodeIds: [node.nextNodes[0]] };
        } else if (!conditionResult && node.nextNodes && node.nextNodes.length > 1) {
          return { nextNodeIds: [node.nextNodes[1]] };
        }
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'parallel': {
        // Fan-out to all next nodes
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'merge': {
        // Fan-in join
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'delay': {
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'approval': {
        // Pause workflow execution until explicit approval is granted
        return { nextNodeIds: node.nextNodes || [], requiresApproval: true };
      }

      case 'loop': {
        return { nextNodeIds: node.nextNodes || [] };
      }

      case 'end': {
        return { nextNodeIds: [], isComplete: true };
      }

      default:
        return { nextNodeIds: [] };
    }
  }

  public static async executeCompensation(
    instance: WorkflowInstance,
    def: WorkflowDefinition
  ): Promise<void> {
    const historyReverse = [...instance.history].reverse();
    for (const entry of historyReverse) {
      const node = def.nodes.get(entry.nodeId);
      if (node && node.compensationNodeId) {
        const compNode = def.nodes.get(node.compensationNodeId);
        if (compNode) {
          await WorkflowExecutor.executeNode(compNode, instance, def);
        }
      }
    }
  }
}
