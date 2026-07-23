use crate::domain::observation::ProcedureObservation;
use sidra_store::Vault;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct RecurrenceResult {
    pub distinct_count: usize,
    pub cited_missions: Vec<String>,
    pub cited_engagements: Vec<String>,
    pub capability_union: Vec<String>,
}

pub struct RecurrenceCounter;

impl RecurrenceCounter {
    pub const RECURRENCE_THRESHOLD: usize = 5;

    pub fn record_observation(
        vault: &Mutex<Vault>,
        obs: &ProcedureObservation,
    ) -> Result<Option<RecurrenceResult>, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let dept_json = serde_json::to_string(&obs.departments).unwrap_or_default();
        let cap_json = serde_json::to_string(&obs.capabilities).unwrap_or_default();

        // Enforce UNIQUE(signature_hash, mission_id) via SQL INSERT OR IGNORE
        conn.execute(
            "INSERT OR IGNORE INTO procedure_observations (observation_id, mission_id, engagement_id, signature_hash, departments_json, capabilities_json, observed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                obs.observation_id,
                obs.mission_id.0,
                obs.engagement_id.0,
                obs.signature.hash.0,
                dept_json,
                cap_json,
                obs.observed_at as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Query distinct mission count for this signature_hash
        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT mission_id, engagement_id, capabilities_json
                 FROM procedure_observations WHERE signature_hash = ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(rusqlite::params![obs.signature.hash.0], |row| {
                let m_id: String = row.get(0)?;
                let e_id: String = row.get(1)?;
                let caps_str: String = row.get(2)?;
                Ok((m_id, e_id, caps_str))
            })
            .map_err(|e| e.to_string())?;

        let mut distinct_missions = Vec::new();
        let mut distinct_engagements = Vec::new();
        let mut cap_set = std::collections::BTreeSet::new();

        for (m_id, e_id, caps_str) in rows.flatten() {
            if !distinct_missions.contains(&m_id) {
                distinct_missions.push(m_id);
            }
            if !distinct_engagements.contains(&e_id) {
                distinct_engagements.push(e_id);
            }
            let caps: Vec<String> = serde_json::from_str(&caps_str).unwrap_or_default();
            for c in caps {
                cap_set.insert(c);
            }
        }

        if distinct_missions.len() == Self::RECURRENCE_THRESHOLD {
            Ok(Some(RecurrenceResult {
                distinct_count: distinct_missions.len(),
                cited_missions: distinct_missions,
                cited_engagements: distinct_engagements,
                capability_union: cap_set.into_iter().collect(),
            }))
        } else {
            Ok(None)
        }
    }
}
