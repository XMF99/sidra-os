import React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
export interface TooltipProps {
    content: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
}
export declare const TooltipProvider: React.FC<RadixTooltip.TooltipProviderProps>;
export declare const Tooltip: React.FC<TooltipProps>;
//# sourceMappingURL=Tooltip.d.ts.map