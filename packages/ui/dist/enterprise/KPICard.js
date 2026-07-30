"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const KPICard = ({ title, value, change, changeType = 'positive', icon, }) => {
    const changeColors = {
        positive: 'var(--sd-color-status-success, #10b981)',
        negative: 'var(--sd-color-status-error, #ef4444)',
        neutral: 'var(--sd-color-text-muted, #6b7280)',
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            backgroundColor: 'var(--sd-color-surface-raised, #12151e)',
            border: '1px solid var(--sd-color-border-subtle, #242938)',
            borderRadius: 'var(--sd-radius-lg, 8px)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: 'var(--sd-shadow-sm, 0 1px 2px rgba(0,0,0,0.5))',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 13, color: 'var(--sd-color-text-secondary, #9ca3af)', fontWeight: 500 }, children: title }), icon && (0, jsx_runtime_1.jsx)("span", { style: { color: 'var(--sd-color-accent, #6366f1)' }, children: icon })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 28, fontWeight: 700, color: 'var(--sd-color-text-primary, #f3f4f6)', letterSpacing: '-0.02em' }, children: value }), change && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, fontWeight: 600, color: changeColors[changeType] }, children: change }))] }));
};
exports.KPICard = KPICard;
//# sourceMappingURL=KPICard.js.map