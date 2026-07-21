import React from "react";
import { Tooltip, TooltipProvider } from "./Tooltip";
import {
  LayoutDashboard,
  Users,
  Building2,
  Archive,
  Database,
  Terminal,
  Settings,
} from "lucide-react";

export type RoomId =
  | "lobby"
  | "boardroom"
  | "department"
  | "archive"
  | "vault"
  | "console"
  | "settings";

export interface RailItemConfig {
  id: RoomId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface RailProps {
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
  primaryRooms?: RailItemConfig[];
  utilityRooms?: RailItemConfig[];
}

export const defaultPrimaryRooms: RailItemConfig[] = [
  { id: "lobby", label: "Lobby", icon: LayoutDashboard },
  { id: "boardroom", label: "Boardroom", icon: Users },
  { id: "department", label: "Department", icon: Building2 },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "vault", label: "Vault", icon: Database },
];

export const defaultUtilityRooms: RailItemConfig[] = [
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
        <div className="sd-rail-brand">S</div>

        {/* Primary Navigation Group */}
        <div className="sd-rail-group">
          {primaryRooms.map((room) => {
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
