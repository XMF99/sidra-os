//! Marketplace Install (ADR-0045 Act 2)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §5.3 Act 2
//! Delegates to M13 Registrar 12 checks. Post-install capability set is EMPTY.

use crate::manifest::parse::DepartmentPackManifest;
use crate::registry::install::InstalledPacksRegistry;

pub fn marketplace_install_pack(
    registry: &mut InstalledPacksRegistry,
    manifest: DepartmentPackManifest,
) -> Result<String, String> {
    // Delegates directly to M13 Registrar (no private Marketplace install path!)
    let dept_id = registry.install_pack(manifest)?;

    // Structural invariant (ADR-0045, AC9):
    // Post-install capability set is EMPTY. Zero capability grants written on install.
    if registry.grants_count != 0 {
        return Err("Violation: Install wrote capability grants".to_string());
    }

    Ok(dept_id)
}
