//! Sidra OS Firm Templates and Portability Engine (Milestone M25)
//!
//! Provides the Layer-8 portability substrate: structure/data partition map,
//! 7-rule boundary check, template packager/signer, empty Vault guard,
//! transactional reproducer into empty Vault, and Marketplace PackRef resolution.

pub mod boundary;
pub mod canon;
pub mod domain;
pub mod exporter;
pub mod importer;
pub mod marketplace;
pub mod mirror;
pub mod packager;
pub mod partition;
pub mod reproducer;

pub use boundary::check::{BoundaryCheckEngine, BoundaryCheckError};
pub use canon::eligibility::CanonEligibilityChecker;
pub use domain::{
    attestation::BoundaryAttestation,
    canon_entry::StructuralCanonEntry,
    manifest::{FirmTemplate, TemplateManifest},
    org_chart::{DepartmentNode, OrgChart, ReportingEdge},
    provenance::ImportProvenance,
    values::{ArchetypeRef, CanonId, OrgNodeId, PackRef, TemplateId, TemplateVersion},
};
pub use exporter::select::TemplateSelection;
pub use importer::empty_guard::{EmptyGuardError, EmptyVaultGuard};
pub use marketplace::resolve::MarketplacePackResolver;
pub use mirror::write::PortabilityMirrorWriter;
pub use packager::assemble::TemplatePackager;
pub use partition::{PartitionRegistry, TableClassification};
pub use reproducer::apply::FirmTemplateReproducer;
