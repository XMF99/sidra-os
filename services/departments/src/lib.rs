//! Sidra OS — Department Substrate (`sidra-departments`)
//!
//! Milestone M11 · Layer-1 boundary primitive
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md

pub mod domain;
pub mod exchange;
pub mod memory;
pub mod models;
pub mod orchestrator;
pub mod replay;
pub mod security;

pub use domain::*;
pub use exchange::*;
pub use memory::*;
pub use models::*;
pub use orchestrator::*;
pub use replay::*;
pub use security::*;
