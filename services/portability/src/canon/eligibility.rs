use crate::domain::canon_entry::StructuralCanonEntry;

pub struct CanonEligibilityChecker;

impl CanonEligibilityChecker {
    pub fn is_eligible(entry: &StructuralCanonEntry) -> bool {
        entry.source_type == "principal" && entry.scope == "firm" && entry.status == "active"
    }
}
