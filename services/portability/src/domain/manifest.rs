use crate::domain::attestation::BoundaryAttestation;
use crate::domain::canon_entry::StructuralCanonEntry;
use crate::domain::org_chart::OrgChart;
use crate::domain::values::{PackRef, TemplateId, TemplateVersion};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateManifest {
    pub template_id: TemplateId,
    pub template_name: String,
    pub template_version: TemplateVersion,
    pub org_chart: OrgChart,
    pub pack_refs: Vec<PackRef>,
    pub structural_canon: Vec<StructuralCanonEntry>,
    pub attestation: BoundaryAttestation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirmTemplate {
    pub manifest: TemplateManifest,
    pub signature: String,
    pub publisher_key: String,
}
