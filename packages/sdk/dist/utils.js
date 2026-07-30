/**
 * SDK Helper Utilities
 */
export function formatUUID() {
    return globalThis.crypto?.randomUUID() ?? "00000000-0000-0000-0000-000000000000";
}
export function sanitizeBrief(text, maxWords = 600) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
        return text;
    }
    return words.slice(0, maxWords).join(" ") + "...";
}
//# sourceMappingURL=utils.js.map