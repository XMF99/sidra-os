"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sparkline = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Sparkline = ({ data, color = 'var(--sd-color-accent, #6366f1)', width = 120, height = 32, }) => {
    if (!data || data.length < 2)
        return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
        .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    })
        .join(' ');
    return ((0, jsx_runtime_1.jsx)("svg", { width: width, height: height, style: { overflow: 'visible' }, children: (0, jsx_runtime_1.jsx)("polyline", { fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", points: points }) }));
};
exports.Sparkline = Sparkline;
//# sourceMappingURL=Sparkline.js.map