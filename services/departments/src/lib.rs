//! Sidra OS — Department Substrate (`sidra-departments`)
//!
//! Milestone M11 + M12 + M13
//! Ref: DEPARTMENTS_ARCHITECTURE.md

pub mod archetypes;
pub mod conformance;
pub mod domain;
pub mod exchange;
pub mod manifest;
pub mod marketplace;
pub mod memory;
pub mod models;
pub mod orchestrator;
pub mod org_graph;
pub mod registry;
pub mod replay;
pub mod security;

pub use archetypes::*;
pub use conformance::*;
pub use domain::*;
pub use exchange::*;
pub use manifest::*;
pub use marketplace::*;
pub use memory::*;
pub use models::*;
pub use orchestrator::*;
pub use org_graph::*;
pub use registry::*;
pub use replay::*;
pub use security::*;
