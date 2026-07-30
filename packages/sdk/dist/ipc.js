/**
 * Typed IPC Invocation Engine
 */
import { IPCError, CapabilityDeniedError } from "./errors.js";
/**
 * Execute a strongly-typed IPC command through Tauri bridge
 */
export async function executeIPCCommand(commandType, departmentId, payload) {
    const req = {
        request_id: globalThis.crypto?.randomUUID() ?? Math.random().toString(36).substring(2),
        department_id: departmentId,
        command_type: commandType,
        payload,
    };
    if (typeof window !== "undefined" && window.__TAURI_INVOKE__) {
        const result = await window.__TAURI_INVOKE__("exec_command", { request: req });
        if (!result.success) {
            if (result.error?.code === "CAPABILITY_DENIED") {
                throw new CapabilityDeniedError(commandType, departmentId, result.trace_id);
            }
            throw new IPCError(result.error?.message ?? "Unknown IPC Error", result.error?.code ?? "IPC_FAILED", result.trace_id);
        }
        return result.data;
    }
    // Fallback / mock mode for testing environments
    return { mock: true, received: payload };
}
//# sourceMappingURL=ipc.js.map