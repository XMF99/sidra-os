use crate::domain::values::ProjectionCell;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CellCategory {
    AuditBearing,
    EphemeralLww,
}

pub struct CellClassifier;

impl CellClassifier {
    pub fn classify(cell: &ProjectionCell) -> CellCategory {
        if cell.table_name == "ui_state" || cell.table_name == "preferences" {
            CellCategory::EphemeralLww
        } else {
            CellCategory::AuditBearing
        }
    }
}
