//! M20 Executable Artifacts — Grant Revocation
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §3.2, §12.1

use crate::domain::ArtifactCapabilityGrant;

pub fn revoke_grant(grant: &mut ArtifactCapabilityGrant, revoked_at: u64) -> Result<(), String> {
    if grant.revoked_at.is_some() {
        return Err("Grant is already revoked".to_string());
    }
    grant.revoked_at = Some(revoked_at);
    Ok(())
}
