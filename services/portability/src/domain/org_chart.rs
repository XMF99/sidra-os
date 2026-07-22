use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepartmentNode {
    pub id: String,
    pub name: String,
    pub division_id: Option<String>,
    pub office_id: Option<String>,
    pub archetype_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportingEdge {
    pub parent_id: String,
    pub child_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrgChart {
    pub departments: Vec<DepartmentNode>,
    pub edges: Vec<ReportingEdge>,
}

impl OrgChart {
    pub fn new(departments: Vec<DepartmentNode>, edges: Vec<ReportingEdge>) -> Self {
        Self { departments, edges }
    }
}
