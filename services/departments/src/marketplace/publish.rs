//! Marketplace Publisher (ADR-0045)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §5.4, IMPLEMENTATION_PLAN.md T3.1, T6.3

use crate::manifest::parse::DepartmentPackManifest;
use crate::manifest::validate::validate_pack_installation;

#[derive(Debug, Clone)]
pub struct PublishedListing {
    pub pack_id: String,
    pub name: String,
    pub version: String,
    pub origin_line: String, // MUST be first line per CCGS MIT attribution (AC-L1)
    pub signature: String,
    pub requested_capabilities: Vec<String>,
}

pub fn publish_pack(
    manifest: &DepartmentPackManifest,
    provenance_doc_content: &str,
    signature: &str,
) -> Result<PublishedListing, String> {
    // 1. Run 12 mechanical checks locally
    validate_pack_installation(manifest)?;

    // 2. Check CCGS MIT Attribution (AC-L1)
    if !provenance_doc_content.contains("The MIT License")
        || !provenance_doc_content.contains("Claude-Code-Game-Studios")
    {
        return Err(
            "Publish gate refused: CCGS MIT attribution missing in PROVENANCE.md".to_string(),
        );
    }

    let origin_line = "Source: Claude-Code-Game-Studios (MIT License)".to_string();

    Ok(PublishedListing {
        pack_id: manifest.id.clone(),
        name: manifest.name.clone(),
        version: manifest.version.clone(),
        origin_line,
        signature: signature.to_string(),
        requested_capabilities: manifest.capabilities.required.clone(),
    })
}
