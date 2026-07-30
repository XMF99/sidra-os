"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Grid = ({ columns = 1, gap = 'var(--sd-space-4, 16px)', style, children, }) => {
    const gridTemplateColumns = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'grid',
            gridTemplateColumns,
            gap,
            boxSizing: 'border-box',
            ...style,
        }, children: children }));
};
exports.Grid = Grid;
//# sourceMappingURL=Grid.js.map