"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const StatusBadge = ({ status = 'neutral', children }) => {
    const badgeStyles = {
        active: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
        success: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
        pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
        danger: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
        neutral: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
    };
    const style = badgeStyles[status] ?? badgeStyles.neutral;
    return ((0, jsx_runtime_1.jsx)("span", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: children }));
};
exports.StatusBadge = StatusBadge;
//# sourceMappingURL=StatusBadge.js.map