"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button = ({ variant = 'primary', size = 'md', loading = false, disabled = false, leftIcon, rightIcon, children, style, ...props }) => {
    const variantStyles = {
        primary: {
            bg: 'var(--sd-color-accent, #6366f1)',
            color: '#ffffff',
            border: 'none',
        },
        secondary: {
            bg: 'var(--sd-color-surface-raised, #12151e)',
            color: 'var(--sd-color-text-primary, #f3f4f6)',
            border: '1px solid var(--sd-color-border-default, #2e3548)',
        },
        ghost: {
            bg: 'transparent',
            color: 'var(--sd-color-text-primary, #f3f4f6)',
            border: 'none',
        },
        outline: {
            bg: 'transparent',
            color: 'var(--sd-color-accent, #6366f1)',
            border: '1px solid var(--sd-color-accent, #6366f1)',
        },
        destructive: {
            bg: 'var(--sd-color-status-error, #ef4444)',
            color: '#ffffff',
            border: 'none',
        },
        success: {
            bg: 'var(--sd-color-status-success, #10b981)',
            color: '#ffffff',
            border: 'none',
        },
    };
    const sizeStyles = {
        sm: { height: 28, padding: '0 10px', fontSize: 12 },
        md: { height: 36, padding: '0 16px', fontSize: 14 },
        lg: { height: 44, padding: '0 20px', fontSize: 16 },
    };
    const currentVariant = variantStyles[variant] ?? variantStyles.primary;
    const currentSize = sizeStyles[size] ?? sizeStyles.md;
    return ((0, jsx_runtime_1.jsx)("button", { disabled: disabled || loading, style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: currentSize.height,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            fontWeight: 500,
            borderRadius: 'var(--sd-radius-md, 6px)',
            backgroundColor: currentVariant.bg,
            color: currentVariant.color,
            border: currentVariant.border,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            opacity: disabled || loading ? 0.6 : 1,
            gap: 8,
            transition: 'background-color 0.15s ease, transform 0.1s ease',
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
            outline: 'none',
            ...style,
        }, ...props, children: loading ? ((0, jsx_runtime_1.jsx)("span", { style: { animation: 'spin 1s linear infinite' }, children: "\u23F3" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [leftIcon, children, rightIcon] })) }));
};
exports.Button = Button;
//# sourceMappingURL=Button.js.map