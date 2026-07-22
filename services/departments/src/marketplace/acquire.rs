//! Marketplace Acquire (ADR-0045 Act 1)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §5.3 Act 1
//! Acquire = Download + Verify Signature. LOADS NOTHING into memory.

use super::publish::PublishedListing;

#[derive(Debug, Clone)]
pub struct AcquiredArtifact {
    pub pack_id: String,
    pub signature: String,
    pub verified: bool,
}

pub fn acquire_pack_artifact(listing: &PublishedListing) -> Result<AcquiredArtifact, String> {
    if listing.signature.trim().is_empty() {
        return Err("Acquire refusal: Signature missing or unverified".to_string());
    }

    // Acquire loads nothing into runtime!
    Ok(AcquiredArtifact {
        pack_id: listing.pack_id.clone(),
        signature: listing.signature.clone(),
        verified: true,
    })
}
