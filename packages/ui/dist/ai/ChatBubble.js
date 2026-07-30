"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBubble = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ChatBubble = ({ role, content, timestamp, senderName }) => {
    const isUser = role === 'user';
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            marginBottom: 16,
            width: '100%',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: [(senderName || timestamp) && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 11, color: 'var(--sd-color-text-muted, #6b7280)', marginBottom: 4 }, children: [senderName && (0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 600, marginRight: 6 }, children: senderName }), timestamp && (0, jsx_runtime_1.jsx)("span", { children: timestamp })] })), (0, jsx_runtime_1.jsx)("div", { style: {
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser
                        ? 'var(--sd-color-accent, #6366f1)'
                        : 'var(--sd-color-surface-raised, #12151e)',
                    color: isUser ? '#ffffff' : 'var(--sd-color-text-primary, #f3f4f6)',
                    border: isUser ? 'none' : '1px solid var(--sd-color-border-subtle, #242938)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: 'var(--sd-shadow-sm, 0 1px 2px rgba(0,0,0,0.3))',
                }, children: content })] }));
};
exports.ChatBubble = ChatBubble;
//# sourceMappingURL=ChatBubble.js.map