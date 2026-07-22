//! M20 Executable Artifacts — Resource Bounds & Limits
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §9, §15, ADR-0006, ADR-0055

use crate::domain::{RunOutcome, WasmLimits};

pub struct ResourceBoundsTracker {
    limits: WasmLimits,
    fuel_used: u64,
    wall_ms_used: u64,
    memory_mb_used: u32,
}

impl ResourceBoundsTracker {
    pub fn new(limits: WasmLimits) -> Self {
        Self {
            limits,
            fuel_used: 0,
            wall_ms_used: 0,
            memory_mb_used: 0,
        }
    }

    pub fn consume_fuel(&mut self, fuel: u64) -> Result<(), RunOutcome> {
        self.fuel_used += fuel;
        if self.fuel_used > self.limits.fuel {
            return Err(RunOutcome::FuelExhausted);
        }
        Ok(())
    }

    pub fn consume_wall_ms(&mut self, ms: u64) -> Result<(), RunOutcome> {
        self.wall_ms_used += ms;
        if self.wall_ms_used > self.limits.wall_ms {
            return Err(RunOutcome::EpochDeadlineHit);
        }
        Ok(())
    }

    pub fn check_memory_mb(&mut self, memory_mb: u32) -> Result<(), RunOutcome> {
        self.memory_mb_used = memory_mb;
        if self.memory_mb_used > self.limits.memory_mb {
            return Err(RunOutcome::MemoryCapExceeded);
        }
        Ok(())
    }

    pub fn fuel_used(&self) -> u64 {
        self.fuel_used
    }

    pub fn wall_ms_used(&self) -> u64 {
        self.wall_ms_used
    }
}
