//! Sidra OS — Seats and Identity Service (`sidra-seats`)
//! Milestone M21 · Release 3.0 "Chambers" · Layer 1
//!
//! Provides first-class human identity, per-Seat Fences, budget nesting,
//! and working-memory isolation without rewriting any historical event log.

pub mod audit;
pub mod binding;
pub mod budget;
pub mod conformance;
pub mod domain;
pub mod fence;
pub mod integrity;
pub mod lifecycle;
pub mod memory;
pub mod registry;

pub use audit::SeatAuditEmitter;
pub use binding::SeatAttributionJoin;
pub use budget::SeatBudgetEngine;
pub use conformance::SeatsConformanceSuite;
pub use domain::{
    ActorValue, Capability, DisplayName, MemoryNamespace, Seat, SeatBudget, SeatFence, SeatId,
    SeatStatus, SeatWorkingMemory,
};
pub use fence::SeatFenceEngine;
pub use integrity::EventChainIntegrityHarness;
pub use lifecycle::{accept_seat, invite_seat, materialize_founding, provision_seat, resume_seat, retire_seat, suspend_seat};
pub use memory::SeatMemoryEngine;
pub use registry::SeatRegistry;
