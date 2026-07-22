//! Department Pack Manifest TOML Parser (ADR-0013)
//!
//! Ref: IMPLEMENTATION_PLAN.md T2.1

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepartmentPackManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub division_id: String,
    pub capabilities: PackCapabilities,
    pub provides: Vec<String>,
    pub requires: Vec<String>, // Contracts ONLY (ADR-0013: no department id allowed!)
    pub roles: Vec<PackRoleSpec>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackCapabilities {
    pub required: Vec<String>,
    pub optional: Vec<String>,
    pub forbidden: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackRoleSpec {
    pub archetype_id: String,
    pub name: String,
    pub policy: String, // 'eager', 'on_demand', or 'scheduled'
    pub capabilities: Vec<String>,
}

pub fn parse_department_manifest(toml_str: &str) -> Result<DepartmentPackManifest, String> {
    toml::from_str(toml_str).map_err(|e| format!("Failed to parse department.toml: {e}"))
}
