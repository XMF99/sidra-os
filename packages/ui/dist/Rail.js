"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rail = exports.defaultUtilityRooms = exports.defaultPrimaryRooms = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Tooltip_1 = require("./Tooltip");
const lucide_react_1 = require("lucide-react");
exports.defaultPrimaryRooms = [
    { id: "lobby", label: "Dashboard", icon: lucide_react_1.LayoutDashboard },
    { id: "boardroom", label: "Chat", icon: lucide_react_1.MessageSquare },
    { id: "seats", label: "Seats (M21)", icon: lucide_react_1.Users },
    { id: "artifacts", label: "Artifacts (M20)", icon: lucide_react_1.Cpu },
    { id: "voice", label: "Voice (M19)", icon: lucide_react_1.Mic },
    { id: "events", label: "Audit & Events", icon: lucide_react_1.Activity },
    { id: "health", label: "System Health", icon: lucide_react_1.HeartPulse },
    { id: "projects", label: "Projects (Future M23)", icon: lucide_react_1.FolderLock, isFuture: true },
    { id: "sync", label: "Sync & Offline (Future M24)", icon: lucide_react_1.RefreshCw, isFuture: true },
    { id: "templates", label: "Firm Templates (Future M25)", icon: lucide_react_1.FileCode, isFuture: true },
];
exports.defaultUtilityRooms = [
    { id: "vault", label: "Vault", icon: lucide_react_1.Database },
    { id: "console", label: "Console", icon: lucide_react_1.Terminal },
    { id: "settings", label: "Settings", icon: lucide_react_1.Settings },
];
const Rail = ({ activeRoom, onSelectRoom, primaryRooms = exports.defaultPrimaryRooms, utilityRooms = exports.defaultUtilityRooms, }) => {
    return ((0, jsx_runtime_1.jsx)(Tooltip_1.TooltipProvider, { children: (0, jsx_runtime_1.jsxs)("nav", { "aria-label": "Primary Navigation", className: "sd-rail", children: [(0, jsx_runtime_1.jsx)("div", { className: "sd-rail-brand", style: { fontWeight: "bold", letterSpacing: "1px" }, children: "S" }), (0, jsx_runtime_1.jsx)("div", { className: "sd-rail-group", children: primaryRooms.map((room) => {
                        const Icon = room.icon;
                        const isActive = activeRoom === room.id;
                        return ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, { content: room.isFuture ? `${room.label} (Available in future milestone)` : room.label, side: "right", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => !room.isFuture && onSelectRoom(room.id), "aria-label": room.label, "aria-current": isActive ? "page" : undefined, className: `sd-rail-item ${isActive ? "sd-rail-item-active" : ""}`, style: {
                                    opacity: room.isFuture ? 0.4 : 1,
                                    cursor: room.isFuture ? "not-allowed" : "pointer",
                                    position: "relative",
                                }, children: [(0, jsx_runtime_1.jsx)(Icon, { size: 20 }), isActive && (0, jsx_runtime_1.jsx)("span", { className: "sd-rail-indicator" })] }) }, room.id));
                    }) }), (0, jsx_runtime_1.jsx)("div", { className: "sd-rail-spacer" }), (0, jsx_runtime_1.jsx)("div", { className: "sd-rail-divider" }), (0, jsx_runtime_1.jsx)("div", { className: "sd-rail-group", children: utilityRooms.map((room) => {
                        const Icon = room.icon;
                        const isActive = activeRoom === room.id;
                        return ((0, jsx_runtime_1.jsx)(Tooltip_1.Tooltip, { content: room.label, side: "right", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => onSelectRoom(room.id), "aria-label": room.label, "aria-current": isActive ? "page" : undefined, className: `sd-rail-item ${isActive ? "sd-rail-item-active" : ""}`, children: (0, jsx_runtime_1.jsx)(Icon, { size: 20 }) }) }, room.id));
                    }) })] }) }));
};
exports.Rail = Rail;
//# sourceMappingURL=Rail.js.map