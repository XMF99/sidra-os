//! M21 Seats and Identity — Seat Working Memory Aggregate
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §4.5, ADR-0059

use super::values::{MemoryNamespace, SeatId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeatWorkingMemory {
    pub seat_id: SeatId,
    pub namespace: MemoryNamespace,
    pub sealed: bool,
}

impl SeatWorkingMemory {
    pub fn provision(seat_id: SeatId) -> Self {
        let namespace = MemoryNamespace::from_seat_id(&seat_id);
        Self {
            seat_id,
            namespace,
            sealed: false,
        }
    }

    pub fn seal(&mut self) {
        self.sealed = true;
    }

    pub fn is_readable(&self, requested_namespace: &str) -> bool {
        // Isolation check: a Seat may read ONLY its own namespace (ADR-0059)
        requested_namespace == self.namespace.0
    }

    pub fn is_writable(&self, requested_namespace: &str) -> bool {
        if self.sealed {
            return false; // Sealed namespace is read-only
        }
        requested_namespace == self.namespace.0
    }
}
