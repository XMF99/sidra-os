"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Box = ({ as: Component = 'div', padding, margin, bg, color, border, borderRadius, className, style, onClick, children, }) => {
    return ((0, jsx_runtime_1.jsx)(Component, { className: className, onClick: onClick, style: {
            padding,
            margin,
            backgroundColor: bg,
            color,
            border,
            borderRadius,
            boxSizing: 'border-box',
            ...style,
        }, children: children }));
};
exports.Box = Box;
//# sourceMappingURL=Box.js.map