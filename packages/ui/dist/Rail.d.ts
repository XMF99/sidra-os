import React from "react";
export type RoomId = "lobby" | "boardroom" | "seats" | "artifacts" | "voice" | "events" | "health" | "department" | "archive" | "vault" | "console" | "settings" | "projects" | "sync" | "templates";
export interface RailItemConfig {
    id: RoomId;
    label: string;
    icon: React.ComponentType<{
        size?: number;
    }>;
    isFuture?: boolean;
}
export interface RailProps {
    activeRoom: RoomId;
    onSelectRoom: (room: RoomId) => void;
    primaryRooms?: RailItemConfig[];
    utilityRooms?: RailItemConfig[];
}
export declare const defaultPrimaryRooms: RailItemConfig[];
export declare const defaultUtilityRooms: RailItemConfig[];
export declare const Rail: React.FC<RailProps>;
//# sourceMappingURL=Rail.d.ts.map