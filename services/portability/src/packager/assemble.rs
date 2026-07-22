use crate::boundary::check::BoundaryCheckEngine;
use crate::domain::attestation::BoundaryAttestation;
use crate::domain::manifest::{FirmTemplate, TemplateManifest};
use crate::domain::values::{TemplateId, TemplateVersion};
use crate::exporter::select::TemplateSelection;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct TemplatePackager;

impl TemplatePackager {
    pub fn package_and_sign(
        vault: &Mutex<Vault>,
        selection: TemplateSelection,
        publisher_key: &str,
        timestamp: u64,
    ) -> Result<FirmTemplate, String> {
        // 1. Run boundary check on selection
        BoundaryCheckEngine::validate_selection(&selection).map_err(|e| e.to_string())?;

        let template_id_str = format!("tmpl_{}", Ulid::new());
        let template_id = TemplateId(template_id_str.clone());
        let template_version = TemplateVersion(selection.version.clone());

        // Serialize candidate bytes for attestation
        let json_bytes = serde_json::to_vec(&selection).map_err(|e| e.to_string())?;

        // 2. Scan bytes for operational data leaks
        BoundaryCheckEngine::scan_packaged_bytes(&json_bytes).map_err(|e| e.to_string())?;

        // Compute attestation
        let excluded_tables = vec![
            "events".to_string(),
            "engagements".to_string(),
            "work_orders".to_string(),
            "deliverables".to_string(),
            "meetings".to_string(),
            "decisions".to_string(),
            "memory_chunks".to_string(),
            "budgets".to_string(),
            "seats".to_string(),
            "capability_grants".to_string(),
        ];
        let attestation = BoundaryAttestation::compute(&json_bytes, excluded_tables);

        let manifest = TemplateManifest {
            template_id,
            template_name: selection.name,
            template_version,
            org_chart: selection.org_chart,
            pack_refs: selection.pack_refs,
            structural_canon: selection.chosen_canon,
            attestation,
        };

        let signature = format!("sig_tmpl_{}", Ulid::new());

        let firm_template = FirmTemplate {
            manifest: manifest.clone(),
            signature,
            publisher_key: publisher_key.to_string(),
        };

        // Persist export record to database
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "INSERT INTO firm_templates (template_id, template_name, template_version, kind, manifest_hash, publisher_key, created_at)
             VALUES (?1, ?2, ?3, 'exported', ?4, ?5, ?6)",
            rusqlite::params![
                manifest.template_id.0,
                manifest.template_name,
                manifest.template_version.0,
                manifest.attestation.digest,
                publisher_key,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Log TemplateExported event
        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: "founding_principal".to_string(),
            event_type: "TemplateExported".to_string(),
            payload: format!("Exported Firm Template {}", manifest.template_id.0),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(firm_template)
    }
}
