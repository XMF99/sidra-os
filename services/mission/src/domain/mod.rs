//! The Mission Engine domain model.
//!
//! Pure types and invariants, with no I/O. Persistence is `sidra-mission`'s repository layer
//! (E2); nothing in this module reads a clock, a file, a socket, or a random source.

pub mod charter;
pub mod events;
pub mod mission;
pub mod objective;
pub mod plan;
pub mod subtask;
pub mod task;
pub mod values;

pub use charter::*;
pub use events::*;
pub use mission::*;
pub use objective::*;
pub use plan::*;
pub use subtask::*;
pub use task::*;
pub use values::*;
