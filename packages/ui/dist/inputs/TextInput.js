"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInput = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const TextInput = ({ label, error, leftIcon, rightIcon, style, id, ...props }) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }, children: [label && ((0, jsx_runtime_1.jsx)("label", { htmlFor: inputId, style: {
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--sd-color-text-secondary, #9ca3af)',
                    fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
                }, children: label })), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    height: 36,
                    backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
                    border: error
                        ? '1px solid var(--sd-color-status-error, #ef4444)'
                        : '1px solid var(--sd-color-border-default, #2e3548)',
                    borderRadius: 'var(--sd-radius-md, 6px)',
                    padding: '0 12px',
                    gap: 8,
                }, children: [leftIcon, (0, jsx_runtime_1.jsx)("input", { id: inputId, style: {
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--sd-color-text-primary, #f3f4f6)',
                            fontSize: 14,
                            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
                            ...style,
                        }, ...props }), rightIcon] }), error && ((0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: 11,
                    color: 'var(--sd-color-status-error, #ef4444)',
                    fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
                }, children: error }))] }));
};
exports.TextInput = TextInput;
//# sourceMappingURL=TextInput.js.map