//! Marketplace Grant (ADR-0045 Act 3)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §5.3 Act 3
//! Separate logged Principal Decision. Only now can the department act.

use crate::manifest::parse::DepartmentPackManifest;
use crate::registry::grant::DepartmentGrantsStore;

pub fn grant_pack_capabilities(
    store: &mut DepartmentGrantsStore,
    manifest: &DepartmentPackManifest,
    approved_capabilities: &[String],
    actor: &str,
) -> Result<(), String> {
    if actor != "principal" {
        return Err(format!(
            "Grant refusal: Actor '{actor}' is not authorized. Only the Principal can grant pack capabilities."
        ));
    }

    store.grant_department(manifest, approved_capabilities)
}
