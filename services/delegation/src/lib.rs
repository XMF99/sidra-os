//! Sidra OS — Delegation and Separation of Duties Service (`sidra-delegation`)
//! Milestone M22 · Release 3.0 "Chambers" · Layer 1
//!
//! Provides structural self-approval refusal (ADR-0060) and bounded,
//! time-boxed, logged delegation between Seats (ADR-0061).

pub mod conformance;
pub mod delegation;
pub mod domain;
pub mod eligibility;
pub mod mirror;
pub mod resolution;

pub use conformance::DelegationConformanceSuite;
pub use delegation::DelegationEngine;
pub use domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, Delegation, DelegationId, DenyReason,
    Scope, ScopedAuthority,
};
pub use eligibility::EligibilityGuard;
pub use mirror::DelegationMirrorWriter;
pub use resolution::ResolutionEngine;
