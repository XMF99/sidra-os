use crate::domain::canon_entry::StructuralCanonEntry;
use crate::domain::org_chart::OrgChart;
use crate::domain::values::PackRef;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateSelection {
    pub name: String,
    pub version: String,
    pub org_chart: OrgChart,
    pub pack_refs: Vec<PackRef>,
    pub chosen_canon: Vec<StructuralCanonEntry>,
}
