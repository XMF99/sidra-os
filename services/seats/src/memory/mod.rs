//! M21 Seats and Identity — Working Memory Isolation Engine
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §10, ADR-0059

use crate::domain::SeatWorkingMemory;

pub struct SeatMemoryEngine;

impl SeatMemoryEngine {
    /// Verify whether acting Seat may read a target working memory namespace
    pub fn authorize_read(memory: &SeatWorkingMemory, requested_namespace: &str) -> Result<(), String> {
        if !memory.is_readable(requested_namespace) {
            return Err(format!(
                "MemoryIsolationDenied: Seat '{}' cannot read cross-Seat namespace '{}' (ADR-0059)",
                memory.seat_id.0, requested_namespace
            ));
        }
        Ok(())
    }

    /// Verify whether acting Seat may write a target working memory namespace
    pub fn authorize_write(memory: &SeatWorkingMemory, requested_namespace: &str) -> Result<(), String> {
        if !memory.is_writable(requested_namespace) {
            return Err(format!(
                "MemoryIsolationDenied: Seat '{}' cannot write namespace '{}' (sealed or cross-Seat access, ADR-0059)",
                memory.seat_id.0, requested_namespace
            ));
        }
        Ok(())
    }
}
