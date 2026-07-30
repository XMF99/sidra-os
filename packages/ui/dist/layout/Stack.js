"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Stack = ({ direction = 'column', gap = 'var(--sd-space-3, 12px)', align = 'stretch', justify = 'flex-start', wrap = false, style, children, }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'flex',
            flexDirection: direction,
            gap,
            alignItems: align,
            justifyContent: justify,
            flexWrap: wrap ? 'wrap' : 'nowrap',
            boxSizing: 'border-box',
            ...style,
        }, children: children }));
};
exports.Stack = Stack;
//# sourceMappingURL=Stack.js.map