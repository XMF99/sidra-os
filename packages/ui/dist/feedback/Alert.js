"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Alert = ({ type = 'info', title, children }) => {
    const stylesMap = {
        info: {
            bg: 'rgba(59, 130, 246, 0.1)',
            border: 'var(--sd-color-status-info, #3b82f6)',
            color: '#93c5fd',
            icon: 'ℹ️',
        },
        success: {
            bg: 'rgba(16, 185, 129, 0.1)',
            border: 'var(--sd-color-status-success, #10b981)',
            color: '#6ee7b7',
            icon: '✅',
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'var(--sd-color-status-warning, #f59e0b)',
            color: '#fde047',
            icon: '⚠️',
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.1)',
            border: 'var(--sd-color-status-error, #ef4444)',
            color: '#fca5a5',
            icon: '🛑',
        },
    };
    const style = stylesMap[type] ?? stylesMap.info;
    return ((0, jsx_runtime_1.jsxs)("div", { role: "alert", style: {
            backgroundColor: style.bg,
            border: `1px solid ${style.border}`,
            borderLeft: `4px solid ${style.border}`,
            borderRadius: 'var(--sd-radius-md, 6px)',
            padding: '12px 16px',
            display: 'flex',
            gap: 12,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 16 }, children: style.icon }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [title && (0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600, fontSize: 14, color: style.color }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 13, color: 'var(--sd-color-text-primary, #f3f4f6)', marginTop: title ? 4 : 0 }, children: children })] })] }));
};
exports.Alert = Alert;
//# sourceMappingURL=Alert.js.map