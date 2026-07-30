/**
 * Shared DTOs and Data Models for Sidra OS / THEKY SDK
 */

export interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  trace_id: string;
}

export interface IPCRequest<TPayload = unknown> {
  request_id: string;
  department_id: string;
  command_type: string;
  payload: TPayload;
}

export interface CapabilityToken {
  token_id: string;
  department_id: string;
  action: string;
  target_resource: string;
  valid_until_utc: string;
  signature: string;
}

export interface SystemEventRecord {
  sequence_number: number;
  event_id: string;
  stream_id: string;
  department_id: string;
  event_type: string;
  payload_json: string;
  actor_id: string;
  timestamp_utc: string;
  previous_hash: string;
  current_hash: string;
}

export type DepartmentId = 
  | "DEPT_FINANCE"
  | "DEPT_OPERATIONS"
  | "DEPT_REVENUE"
  | "DEPT_PEOPLE"
  | "DEPT_EXECUTIVE"
  | "DEPT_PLATFORM_ADMIN";
