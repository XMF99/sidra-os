use crate::domain::manifest::FirmTemplate;
use crate::importer::empty_guard::EmptyVaultGuard;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct FirmTemplateReproducer;

impl FirmTemplateReproducer {
    pub fn reproduce_into_empty_vault(
        vault: &Mutex<Vault>,
        template: &FirmTemplate,
        installing_seat_id: &str,
        timestamp: u64,
    ) -> Result<(), String> {
        // 1. Assert target Vault is empty
        EmptyVaultGuard::assert_empty(vault).map_err(|e| e.to_string())?;

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        // 2. Transactional reproducing
        conn.execute_batch("BEGIN TRANSACTION;").map_err(|e| e.to_string())?;

        let manifest = &template.manifest;

        // Write firm_templates record
        conn.execute(
            "INSERT INTO firm_templates (template_id, template_name, template_version, kind, manifest_hash, publisher_key, created_at)
             VALUES (?1, ?2, ?3, 'installed', ?4, ?5, ?6)",
            rusqlite::params![
                manifest.template_id.0,
                manifest.template_name,
                manifest.template_version.0,
                manifest.attestation.digest,
                template.publisher_key,
                timestamp as i64,
            ],
        )
        .map_err(|e| format!("Failed to record firm_template: {}", e))?;

        // Write template_provenance birth record
        let vault_id = format!("vlt_{}", Ulid::new());
        conn.execute(
            "INSERT INTO template_provenance (vault_id, template_id, template_version, manifest_hash, installing_seat_id, installed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                vault_id,
                manifest.template_id.0,
                manifest.template_version.0,
                manifest.attestation.digest,
                installing_seat_id,
                timestamp as i64,
            ],
        )
        .map_err(|e| format!("Failed to record template_provenance: {}", e))?;

        // Reproduce org chart departments
        for dept in &manifest.org_chart.departments {
            conn.execute(
                "INSERT INTO departments (id, name, division_id, office_id) VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT(id) DO NOTHING",
                rusqlite::params![dept.id, dept.name, dept.division_id, dept.office_id],
            )
            .map_err(|e| format!("Failed to reproduce department: {}", e))?;
        }

        // Reproduce reporting edges
        for edge in &manifest.org_chart.edges {
            conn.execute(
                "INSERT INTO reporting_edges (parent_id, child_id) VALUES (?1, ?2)
                 ON CONFLICT(parent_id, child_id) DO NOTHING",
                rusqlite::params![edge.parent_id, edge.child_id],
            )
            .map_err(|e| format!("Failed to reproduce reporting edge: {}", e))?;
        }

        // Emit TemplateInstalled event (genesis event for target Vault)
        let input = sidra_domain::EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "TemplateInstalled".to_string(),
            aggregate_type: "portability".to_string(),
            aggregate_id: manifest.template_id.0.clone(),
            payload: format!("Installed Firm Template {}", manifest.template_id.0),
            metadata: format!(r#"{{"actor":"{}"}}"#, installing_seat_id),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        conn.execute_batch("COMMIT;").map_err(|e| e.to_string())?;
        Ok(())
    }
}
