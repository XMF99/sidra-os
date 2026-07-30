"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = exports.TooltipProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const RadixTooltip = __importStar(require("@radix-ui/react-tooltip"));
exports.TooltipProvider = RadixTooltip.Provider;
const Tooltip = ({ content, children, side = "right" }) => {
    return ((0, jsx_runtime_1.jsxs)(RadixTooltip.Root, { delayDuration: 200, children: [(0, jsx_runtime_1.jsx)(RadixTooltip.Trigger, { asChild: true, children: children }), (0, jsx_runtime_1.jsx)(RadixTooltip.Portal, { children: (0, jsx_runtime_1.jsxs)(RadixTooltip.Content, { side: side, sideOffset: 6, className: "sd-tooltip-content", children: [content, (0, jsx_runtime_1.jsx)(RadixTooltip.Arrow, { className: "sd-tooltip-arrow" })] }) })] }));
};
exports.Tooltip = Tooltip;
//# sourceMappingURL=Tooltip.js.map