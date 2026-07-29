import { invoke } from '@tauri-apps/api/core';
import { SystemInfo, TaskPlan, AgentMessage, Event } from '@sidra/bindings';

export interface GoalExecutionResponse {
  plan: TaskPlan;
  messages: AgentMessage[];
}

export interface SeatDTO {
  id: string;
  actor_value: string;
  display_name: string;
  status: string;
  is_founding: boolean;
  budget_ceiling_cents: number;
  memory_namespace: string;
}

export interface ExecutableArtifactDTO {
  id: { 0: string };
  name: string;
  description: string;
  wasm_filename: string;
  produced_by_work_order: string;
  produced_by_agent: string;
  capability_grants: Array<{
    capability_id: string;
    resource: string;
    granted: boolean;
  }>;
  created_at: number;
}

export interface MilestoneInfo {
  id: string;
  name: string;
  release: string;
  is_completed: boolean;
  exit_criterion: string;
}

export interface SystemHealthDTO {
  status: string;
  release: string;
  active_services_count: number;
  db_status: string;
  event_count: number;
  memory_mb: number;
  storage_kb: number;
  total_milestones: number;
  completed_milestones: number;
}

export async function getSystemStatus(): Promise<SystemInfo> {
  return await invoke<SystemInfo>('app_get_status');
}

export async function executeGoal(goal: string): Promise<GoalExecutionResponse> {
  return await invoke<GoalExecutionResponse>('app_execute_goal', { goal });
}

export async function getEventLog(): Promise<Event[]> {
  return await invoke<Event[]>('app_get_event_log');
}

export async function verifyEventChain(): Promise<boolean> {
  return await invoke<boolean>('app_verify_event_chain');
}

export async function getSeats(): Promise<SeatDTO[]> {
  return await invoke<SeatDTO[]>('app_list_seats');
}

export async function createSeat(displayName: string): Promise<SeatDTO> {
  return await invoke<SeatDTO>('app_create_seat', { displayName });
}

export async function getArtifacts(): Promise<ExecutableArtifactDTO[]> {
  return await invoke<ExecutableArtifactDTO[]>('app_list_artifacts');
}

export async function executeArtifact(artifactId: string): Promise<string> {
  return await invoke<string>('app_execute_artifact', { artifactId });
}

export async function getMilestones(): Promise<MilestoneInfo[]> {
  return await invoke<MilestoneInfo[]>('app_get_milestones');
}

export async function getSystemHealth(): Promise<SystemHealthDTO> {
  return await invoke<SystemHealthDTO>('app_get_system_health');
}

export async function beginVoiceCapture(): Promise<string> {
  return await invoke<string>('voice_begin_capture');
}

export async function stopVoiceCapture(): Promise<{ text: string; confirmed: boolean }> {
  return await invoke<{ text: string; confirmed: boolean }>('voice_stop_capture');
}

export async function getPlugins(): Promise<string[]> {
  return await invoke<string[]>('app_get_plugins');
}
