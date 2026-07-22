-- M14 Game Studio and Marketplace: 0017_pack_installs.sql
-- Creates pack_installs table tracking lifecycle status (Proposed, Installed, Granted, Retired)

CREATE TABLE IF NOT EXISTS pack_installs (
    pack_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('proposed', 'acquired', 'installed', 'granted', 'retired')),
    provenance_ref TEXT NOT NULL,
    installed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
