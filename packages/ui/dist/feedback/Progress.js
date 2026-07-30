"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Progress = ({ value, color = 'var(--sd-color-accent, #6366f1)', height = 6, }) => {
    const percentage = Math.min(100, Math.max(0, value));
    return ((0, jsx_runtime_1.jsx)("div", { role: "progressbar", "aria-valuenow": percentage, "aria-valuemin": 0, "aria-valuemax": 100, style: {
            width: '100%',
            height,
            backgroundColor: 'var(--sd-color-surface-sunken, #050608)',
            borderRadius: height / 2,
            overflow: 'hidden',
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: color,
                borderRadius: height / 2,
                transition: 'width 0.3s ease',
            } }) }));
};
exports.Progress = Progress;
//# sourceMappingURL=Progress.js.map