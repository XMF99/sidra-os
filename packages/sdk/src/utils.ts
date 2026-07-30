/**
 * SDK Helper Utilities
 */

export function formatUUID(): string {
  return globalThis.crypto?.randomUUID() ?? "00000000-0000-0000-0000-000000000000";
}

export function sanitizeBrief(text: string, maxWords = 600): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(" ") + "...";
}
