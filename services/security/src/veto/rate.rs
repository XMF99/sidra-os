//! Veto Rate Projection & Ceremonial Review Instrument (M12)
//!
//! Ref: ADR-0015, IMPLEMENTATION_PLAN.md T3.6

pub fn calculate_office_approval_rate(vetoes_total: usize, vetoes_upheld: usize) -> f64 {
    if vetoes_total == 0 {
        return 1.0;
    }
    1.0 - (vetoes_upheld as f64 / vetoes_total as f64)
}

pub fn is_ceremonial_review(approval_rate: f64) -> bool {
    // Approval rate > 95% indicates ceremonial review failure mode
    approval_rate > 0.95
}
