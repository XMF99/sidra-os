//! Autoscale Bounded by Budget Sub-Ceiling (ADR-0014, ADR-0020)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.4

pub fn validate_autoscale(
    current_count: usize,
    max_instances: usize,
    current_spend: f64,
    budget_sub_ceiling: f64,
) -> Result<(), String> {
    if current_count >= max_instances {
        return Err(format!(
            "Autoscale refusal: Max instance count limit ({max_instances}) reached"
        ));
    }

    if current_spend >= budget_sub_ceiling {
        return Err(format!(
            "Autoscale refusal: Department budget sub-ceiling ({budget_sub_ceiling}) exhausted"
        ));
    }

    Ok(())
}
