-- Migration 0077: Workspace Provisioning & Installed Applications Schema
-- Stores domain OS workspaces (e.g. Game Development) and active installed applications.

CREATE TABLE IF NOT EXISTS workspaces (
    workspace_id TEXT PRIMARY KEY NOT NULL,
    domain TEXT NOT NULL,
    selected_model_id TEXT NOT NULL DEFAULT 'anthropic/claude-3.5-sonnet',
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS installed_applications (
    app_id TEXT PRIMARY KEY NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces(workspace_id),
    app_name TEXT NOT NULL,
    installed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_domain ON workspaces(domain);
CREATE INDEX IF NOT EXISTS idx_installed_apps_ws ON installed_applications(workspace_id);
