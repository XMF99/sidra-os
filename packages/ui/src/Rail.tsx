import React from "react";
import { Tooltip, TooltipProvider } from "./Tooltip";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Cpu,
  Mic,
  Activity,
  HeartPulse,
  Database,
  Terminal,
  Settings,
  FolderLock,
  RefreshCw,
  FileCode,
} from "lucide-react";

export type RoomId =
  | "lobby"
  | "boardroom"
  | "seats"
  | "artifacts"
  | "voice"
  | "events"
  | "health"
  | "department"
  | "archive"
  | "vault"
  | "console"
  | "settings"
  | "projects"
  | "sync"
  | "templates";

export interface RailItemConfig {
  id: RoomId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  isFuture?: boolean;
}

export interface RailProps {
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
  primaryRooms?: RailItemConfig[];
  utilityRooms?: RailItemConfig[];
}

export const defaultPrimaryRooms: RailItemConfig[] = [
  { id: "lobby", label: "Dashboard", icon: LayoutDashboard },
  { id: "boardroom", label: "Chat", icon: MessageSquare },
  { id: "seats", label: "Seats (M21)", icon: Users },
  { id: "artifacts", label: "Artifacts (M20)", icon: Cpu },
  { id: "voice", label: "Voice (M19)", icon: Mic },
  { id: "events", label: "Audit & Events", icon: Activity },
  { id: "health", label: "System Health", icon: HeartPulse },
  { id: "projects", label: "Projects (Future M23)", icon: FolderLock, isFuture: true },
  { id: "sync", label: "Sync & Offline (Future M24)", icon: RefreshCw, isFuture: true },
  { id: "templates", label: "Firm Templates (Future M25)", icon: FileCode, isFuture: true },
];

export const defaultUtilityRooms: RailItemConfig[] = [
  { id: "vault", label: "Vault", icon: Database },
  { id: "console", label: "Console", icon: Terminal },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Rail: React.FC<RailProps> = ({
  activeRoom,
  onSelectRoom,
  primaryRooms = defaultPrimaryRooms,
  utilityRooms = defaultUtilityRooms,
}) => {
  return (
    <TooltipProvider>
      <nav aria-label="Primary Navigation" className="sd-rail">
        {/* Top Brand Indicator */}
        <div className="sd-rail-brand" style={{ fontWeight: "bold", letterSpacing: "1px" }}>
          S
        </div>

        {/* Primary Navigation Group */}
        <div className="sd-rail-group">
          {primaryRooms.map((room) => {
            const Icon = room.icon;
            const isActive = activeRoom === room.id;
            return (
              <Tooltip
                key={room.id}
                content={room.isFuture ? `${room.label} (Available in future milestone)` : room.label}
                side="right"
              >
                <button
                  onClick={() => !room.isFuture && onSelectRoom(room.id)}
                  aria-label={room.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`sd-rail-item ${isActive ? "sd-rail-item-active" : ""}`}
                  style={{
                    opacity: room.isFuture ? 0.4 : 1,
                    cursor: room.isFuture ? "not-allowed" : "pointer",
                    position: "relative",
                  }}
                >
                  <Icon size={20} />
                  {isActive && <span className="sd-rail-indicator" />}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="sd-rail-spacer" />

        {/* Divider */}
        <div className="sd-rail-divider" />

        {/* Utility Group */}
        <div className="sd-rail-group">
          {utilityRooms.map((room) => {
            const Icon = room.icon;
            const isActive = activeRoom === room.id;
            return (
              <Tooltip key={room.id} content={room.label} side="right">
                <button
                  onClick={() => onSelectRoom(room.id)}
                  aria-label={room.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`sd-rail-item ${isActive ? "sd-rail-item-active" : ""}`}
                >
                  <Icon size={20} />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
};
