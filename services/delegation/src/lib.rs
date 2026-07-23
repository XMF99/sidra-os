//! Sidra OS — Delegation and Separation of Duties (`sidra-delegation`)
//! Milestone M22 · Release 3.0 "Chambers" · Layer 2
//!
//! Provides structural self-approval refusal (ADR-0060), delegation engine (ADR-0061),
//! ScopedAuthority computation, and dual-custody verification.

pub mod conformance;
pub mod delegation;
pub mod domain;
pub mod eligibility;
pub mod mirror;
pub mod resolution;

pub use conformance::DelegationConformanceSuite;
pub use delegation::{DelegateAuthorityArgs, DelegationEngine};
pub use domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, CreateResolutionArgs, Delegation,
    DelegationId, DenyReason, Scope, ScopedAuthority,
};
pub use eligibility::EligibilityGuard;
pub use resolution::{ApproveRequestArgs, ResolutionEngine};
