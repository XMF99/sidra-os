import { WorkflowInstance, WorkflowDefinition } from './types';

export class CompensationEngine {
  private static instance: CompensationEngine;

  public static getInstance(): CompensationEngine {
    if (!CompensationEngine.instance) {
      CompensationEngine.instance = new CompensationEngine();
    }
    return CompensationEngine.instance;
  }

  public async executeCompensation(
    instance: WorkflowInstance,
    definition: WorkflowDefinition,
    onLog?: (msg: string) => void
  ): Promise<void> {
    const executedNodes = [...instance.history].reverse();

    for (const record of executedNodes) {
      const node = definition.nodes.get(record.nodeId);
      if (node && node.compensationNodeId) {
        const compNode = definition.nodes.get(node.compensationNodeId);
        const compMsg = `Rolling back step '${node.id}' using compensation handler '${compNode?.id || node.compensationNodeId}'`;
        if (onLog) onLog(compMsg);

        instance.history.push({
          nodeId: node.compensationNodeId,
          state: 'compensated',
          timestamp: new Date().toISOString(),
          output: { compensatedNodeId: node.id },
        });

        await new Promise((res) => setTimeout(res, 100));
      }
    }
  }
}
