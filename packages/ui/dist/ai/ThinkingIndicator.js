"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingIndicator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ThinkingIndicator = ({ label = 'Agent reasoning...' }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 9999,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontSize: 12,
            fontWeight: 500,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { display: 'inline-block', animation: 'spin 1.5s linear infinite' }, children: "\uD83E\uDDE0" }), (0, jsx_runtime_1.jsx)("span", { children: label })] }));
};
exports.ThinkingIndicator = ThinkingIndicator;
//# sourceMappingURL=ThinkingIndicator.js.map