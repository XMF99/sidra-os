//! Mission Aggregate (T1.8)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §5, IMPLEMENTATION_PLAN.md T1.8

use super::charter::Charter;
use super::plan::PlanVersion;
use super::values::MissionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MissionPolicy {
    pub allow_autoscale: bool,
    pub max_replan_count: u32,
}

impl Default for MissionPolicy {
    fn default() -> Self {
        Self {
            allow_autoscale: true,
            max_replan_count: 2,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Mission {
    pub id: MissionId,
    pub charter: Charter,
    pub current_state: String, // Draft, Planned, Authorised, Running, Completed, etc.
    pub plans: Vec<PlanVersion>,
    pub policy: MissionPolicy,
}

impl Mission {
    pub fn draft(id: MissionId, charter: Charter) -> Self {
        Self {
            id,
            charter,
            current_state: "Draft".to_string(),
            plans: Vec::new(),
            policy: MissionPolicy::default(),
        }
    }

    pub fn current_plan(&self) -> Option<&PlanVersion> {
        self.plans.iter().find(|p| p.superseded_by.is_none())
    }

    pub fn add_plan(&mut self, plan: PlanVersion) -> Result<(), &'static str> {
        if let Some(current) = self.plans.iter_mut().find(|p| p.superseded_by.is_none()) {
            current.supersede(plan.version)?;
        }
        self.plans.push(plan);
        Ok(())
    }
}
