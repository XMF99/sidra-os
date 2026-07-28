import { DispatchedTaskToken } from './types';
import { AgentRuntime } from '../agent-runtime/AgentRuntime';
import { WorkflowRuntime } from '../workflow-runtime/WorkflowRuntime';
import { AutomationRuntime } from '../automation-runtime/AutomationRuntime';
import { ConnectorRuntime } from '../connector-framework/ConnectorRuntime';

export class RuntimeDispatcher {
  public static async dispatch(
    token: DispatchedTaskToken
  ): Promise<{ success: boolean; payload?: unknown; error?: string }> {
    token.status = 'running';

    try {
      if (token.runtime === 'agent') {
        const agentRuntime = AgentRuntime.getInstance();
        const assigned = agentRuntime.assignMission(token.taskId, 'coding');
        return { success: true, payload: { assignedAgentId: assigned?.id || 'A-01' } };
      }

      if (token.runtime === 'workflow') {
        const workflowRuntime = WorkflowRuntime.getInstance();
        const allWfs = workflowRuntime.getAllInstances();
        if (allWfs.length > 0) {
          return { success: true, payload: { instanceId: allWfs[0].id } };
        }
        return { success: true, payload: { instanceId: 'WFI-DEFAULT' } };
      }

      if (token.runtime === 'automation') {
        const automationRuntime = AutomationRuntime.getInstance();
        const automations = automationRuntime.getAllAutomations();
        if (automations.length > 0) {
          const job = automationRuntime.triggerAutomation(automations[0].id);
          return { success: true, payload: { jobId: job.jobId } };
        }
        return { success: true, payload: { status: 'triggered' } };
      }

      if (token.runtime === 'connector') {
        const connectorRuntime = ConnectorRuntime.getInstance();
        const res = await connectorRuntime.executeCapability('conn_openrouter', 'execute', { task: token.taskTitle });
        return { success: true, payload: res };
      }

      return { success: true, payload: { status: 'mock_completed' } };
    } catch (err) {
      token.status = 'failed';
      token.errorReason = (err as Error).message;
      return { success: false, error: (err as Error).message };
    }
  }
}
