"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heading = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Heading = ({ level = 1, color = 'var(--sd-color-text-primary, #f3f4f6)', style, children, }) => {
    const Tag = `h${level}`;
    const sizes = {
        1: 28,
        2: 24,
        3: 20,
        4: 18,
        5: 16,
        6: 14,
    };
    return ((0, jsx_runtime_1.jsx)(Tag, { style: {
            margin: 0,
            fontSize: sizes[level],
            fontWeight: 600,
            lineHeight: 1.3,
            color,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
            ...style,
        }, children: children }));
};
exports.Heading = Heading;
//# sourceMappingURL=Heading.js.map