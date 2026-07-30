"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Divider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Divider = ({ orientation = 'horizontal', color = 'var(--sd-color-border-subtle, #242938)', style, }) => {
    return ((0, jsx_runtime_1.jsx)("div", { role: "separator", style: {
            width: orientation === 'horizontal' ? '100%' : '1px',
            height: orientation === 'horizontal' ? '1px' : '100%',
            backgroundColor: color,
            margin: orientation === 'horizontal' ? '8px 0' : '0 8px',
            boxSizing: 'border-box',
            ...style,
        } }));
};
exports.Divider = Divider;
//# sourceMappingURL=Divider.js.map