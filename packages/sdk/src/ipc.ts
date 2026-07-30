/**
 * Typed IPC Invocation Engine
 */

import { IPCRequest, IPCResult } from "./models.js";
import { IPCError, CapabilityDeniedError } from "./errors.js";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI_INVOKE__?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
  }
}

/**
 * Execute a strongly-typed IPC command through Tauri bridge
 */
export async function executeIPCCommand<TReq, TRes>(
  commandType: string,
  departmentId: string,
  payload: TReq
): Promise<TRes> {
  const req: IPCRequest<TReq> = {
    request_id: globalThis.crypto?.randomUUID() ?? Math.random().toString(36).substring(2),
    department_id: departmentId,
    command_type: commandType,
    payload,
  };

  if (typeof window !== "undefined" && window.__TAURI_INVOKE__) {
    const result = await window.__TAURI_INVOKE__<IPCResult<TRes>>("exec_command", { request: req });
    if (!result.success) {
      if (result.error?.code === "CAPABILITY_DENIED") {
        throw new CapabilityDeniedError(commandType, departmentId, result.trace_id);
      }
      throw new IPCError(
        result.error?.message ?? "Unknown IPC Error",
        result.error?.code ?? "IPC_FAILED",
        result.trace_id
      );
    }
    return result.data as TRes;
  }

  // Fallback / mock mode for testing environments
  return { mock: true, received: payload } as unknown as TRes;
}
