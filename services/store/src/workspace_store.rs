//! Workspace Store Repository
//! Manages SQLite persistence for domain workspaces and installed applications.

use crate::errors::StoreError;
use rusqlite::{params, Connection, OptionalExtension};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Workspace {
    pub workspace_id: String,
    pub domain: String,
    pub selected_model_id: String,
    pub status: String,
    pub created_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InstalledApp {
    pub app_id: String,
    pub workspace_id: String,
    pub app_name: String,
    pub installed_at: u64,
}

pub struct WorkspaceRepository;

impl WorkspaceRepository {
    pub fn create_workspace(
        conn: &Connection,
        workspace_id: &str,
        domain: &str,
        selected_model_id: &str,
        apps: &[String],
        now: u64,
    ) -> Result<Workspace, StoreError> {
        let tx = conn.unchecked_transaction()?;

        tx.execute(
            "INSERT INTO workspaces (workspace_id, domain, selected_model_id, status, created_at)
             VALUES (?1, ?2, ?3, 'active', ?4)",
            params![workspace_id, domain, selected_model_id, now as i64],
        )?;

        for (idx, app) in apps.iter().enumerate() {
            let app_id = format!("{}_app_{}", workspace_id, idx + 1);
            tx.execute(
                "INSERT INTO installed_applications (app_id, workspace_id, app_name, installed_at)
                 VALUES (?1, ?2, ?3, ?4)",
                params![app_id, workspace_id, app, now as i64],
            )?;
        }

        tx.commit()?;

        Ok(Workspace {
            workspace_id: workspace_id.to_string(),
            domain: domain.to_string(),
            selected_model_id: selected_model_id.to_string(),
            status: "active".to_string(),
            created_at: now,
        })
    }

    pub fn get_workspace(
        conn: &Connection,
        workspace_id: &str,
    ) -> Result<Option<Workspace>, StoreError> {
        let ws = conn
            .query_row(
                "SELECT workspace_id, domain, selected_model_id, status, created_at
                 FROM workspaces WHERE workspace_id = ?1",
                params![workspace_id],
                |row| {
                    Ok(Workspace {
                        workspace_id: row.get(0)?,
                        domain: row.get(1)?,
                        selected_model_id: row.get(2)?,
                        status: row.get(3)?,
                        created_at: row.get::<_, i64>(4)? as u64,
                    })
                },
            )
            .optional()?;
        Ok(ws)
    }

    pub fn list_installed_apps(
        conn: &Connection,
        workspace_id: &str,
    ) -> Result<Vec<InstalledApp>, StoreError> {
        let mut stmt = conn.prepare(
            "SELECT app_id, workspace_id, app_name, installed_at
             FROM installed_applications WHERE workspace_id = ?1",
        )?;

        let iter = stmt.query_map(params![workspace_id], |row| {
            Ok(InstalledApp {
                app_id: row.get(0)?,
                workspace_id: row.get(1)?,
                app_name: row.get(2)?,
                installed_at: row.get::<_, i64>(3)? as u64,
            })
        })?;

        let mut apps = Vec::new();
        for app in iter {
            apps.push(app?);
        }
        Ok(apps)
    }
}
