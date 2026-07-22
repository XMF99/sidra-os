//! Fourth Budget Ceiling (F-bud)
//!
//! Hierarchy: Turn ⊂ Engagement ⊂ Department ⊂ Month
//! Ref: ADR-0020, DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §3.2

use crate::domain::BudgetSubCeiling;

#[derive(Debug, Clone, PartialEq)]
pub enum BudgetVerdict {
    Approved,
    Exhausted {
        department_id: String,
        spent: f64,
        ceiling: f64,
    },
}

pub fn check_fourth_ceiling(
    cost: f64,
    department_id: &str,
    current_dept_spent: f64,
    dept_ceiling: &BudgetSubCeiling,
) -> BudgetVerdict {
    if current_dept_spent + cost > dept_ceiling.ceiling_hard {
        BudgetVerdict::Exhausted {
            department_id: department_id.to_string(),
            spent: current_dept_spent + cost,
            ceiling: dept_ceiling.ceiling_hard,
        }
    } else {
        BudgetVerdict::Approved
    }
}
