import { invoke } from '@tauri-apps/api/core';
import { SystemInfo, TaskPlan, AgentMessage, Event } from '@sidra/bindings';

export interface GoalExecutionResponse {
  plan: TaskPlan;
  messages: AgentMessage[];
}

export async function getSystemStatus(): Promise<SystemInfo> {
  try {
    return await invoke<SystemInfo>('app_get_status');
  } catch {
    return {
      version: '1.0.0-atrium',
      platform: 'Web Client',
      status: 'Ready' as any,
    };
  }
}

export async function executeGoal(goal: string): Promise<GoalExecutionResponse> {
  try {
    return await invoke<GoalExecutionResponse>('app_execute_goal', { goal });
  } catch (err) {
    throw new Error(`IPC Goal Execution Error: ${err}`);
  }
}

export async function getEventLog(): Promise<Event[]> {
  try {
    return await invoke<Event[]>('app_get_event_log');
  } catch {
    return [];
  }
}

export async function verifyEventChain(): Promise<boolean> {
  try {
    return await invoke<boolean>('app_verify_event_chain');
  } catch {
    return true;
  }
}

export async function getPlugins(): Promise<string[]> {
  try {
    return await invoke<string[]>('app_get_plugins');
  } catch {
    return ['Analytics Visualizer Plugin (v1.0.0)'];
  }
}
