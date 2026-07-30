"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarChart = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BarChart = ({ data, color = 'var(--sd-color-accent, #6366f1)', height = 160, }) => {
    if (!data || data.length === 0)
        return null;
    const maxValue = Math.max(...data.map((d) => d.value)) || 1;
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height,
            gap: 12,
            paddingTop: 16,
            fontFamily: 'var(--sd-font-family-sans, system-ui, sans-serif)',
        }, children: data.map((item, idx) => {
            const barHeightPercent = (item.value / maxValue) * 100;
            return ((0, jsx_runtime_1.jsxs)("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            width: '100%',
                            maxHeight: '100%',
                            height: `${barHeightPercent}%`,
                            backgroundColor: color,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                        }, title: `${item.label}: ${item.value}` }), (0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: 11,
                            color: 'var(--sd-color-text-muted, #6b7280)',
                            marginTop: 6,
                            textAlign: 'center',
                        }, children: item.label })] }, idx));
        }) }));
};
exports.BarChart = BarChart;
//# sourceMappingURL=BarChart.js.map