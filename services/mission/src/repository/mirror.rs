//! Markdown Mirror Writer (T2.12)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §20.4, IMPLEMENTATION_PLAN.md T2.12

use super::projections::MissionProjection;

pub fn format_mission_mirror_markdown(proj: &MissionProjection) -> String {
    format!(
        "# Mission Mirror: {}\n\n- **State**: {}\n- **Risk Band**: {}\n- **Plan Version**: {}\n",
        proj.mission_id, proj.state, proj.risk_band, proj.plan_version
    )
}
