use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TableClassification {
    Structure,
    Data,
}

pub struct PartitionRegistry;

impl PartitionRegistry {
    pub fn get_table_partition() -> BTreeMap<&'static str, TableClassification> {
        let mut map = BTreeMap::new();

        // Structure tables (exported in Firm Templates)
        map.insert("departments", TableClassification::Structure);
        map.insert("offices", TableClassification::Structure);
        map.insert("divisions", TableClassification::Structure);
        map.insert("reporting_edges", TableClassification::Structure);
        map.insert("veto_scopes", TableClassification::Structure);
        map.insert("firm_templates", TableClassification::Structure);
        map.insert("template_manifests", TableClassification::Structure);
        map.insert("template_provenance", TableClassification::Structure);

        // Data tables (strictly excluded from Firm Templates)
        map.insert("events", TableClassification::Data);
        map.insert("engagements", TableClassification::Data);
        map.insert("work_orders", TableClassification::Data);
        map.insert("deliverables", TableClassification::Data);
        map.insert("meetings", TableClassification::Data);
        map.insert("decisions", TableClassification::Data);
        map.insert("memory_chunks", TableClassification::Data);
        map.insert("budgets", TableClassification::Data);
        map.insert("seats", TableClassification::Data);
        map.insert("fences", TableClassification::Data);
        map.insert("capability_grants", TableClassification::Data);
        map.insert("sync_devices", TableClassification::Data);
        map.insert("sync_peers", TableClassification::Data);
        map.insert("sync_cursors", TableClassification::Data);
        map.insert("sync_conflicts", TableClassification::Data);
        map.insert("merge_log", TableClassification::Data);

        map
    }

    pub fn classify_table(table_name: &str) -> TableClassification {
        let partition = Self::get_table_partition();
        partition
            .get(table_name)
            .copied()
            .unwrap_or(TableClassification::Data) // Unclassified tables default to Data (ADR-0067)
    }
}
