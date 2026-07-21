import { invoke } from '@tauri-apps/api/core';
import { SystemInfo } from '@sidra/bindings';

/**
 * Fetch operational status of the Sidra OS system kernel over Tauri IPC.
 * Degrades gracefully if running in pure web preview mode.
 */
export async function getSystemStatus(): Promise<SystemInfo> {
  try {
    return await invoke<SystemInfo>('app_get_status');
  } catch {
    // Fallback for non-Tauri preview environments
    return {
      version: '1.0.0-atrium',
      platform: 'Web Client',
      status: 'Ready',
    };
  }
}
