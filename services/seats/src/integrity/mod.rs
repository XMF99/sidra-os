//! M21 Seats and Identity — Hash-Chain Integrity Harness
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §13.3, §19, ADR-0057, AC3

use sha2::{Digest, Sha256};

pub struct EventChainIntegrityHarness;

impl EventChainIntegrityHarness {
    /// Compute root hash over event log prefix (seq 1..N)
    pub fn compute_prefix_root_hash(events: &[(u64, String, String)]) -> String {
        let mut hasher = Sha256::new();
        for (seq, actor, payload) in events {
            hasher.update(format!("{}:{}:{}", seq, actor, payload).as_bytes());
        }
        format!("{:x}", hasher.finalize())
    }

    /// Prove Exit Criterion AC3 (No History Rewritten):
    /// Asserting that root hash R0 computed over pre-existing prefix seq 1..N
    /// is byte-identical to root hash R1 computed over the SAME prefix seq 1..N
    /// after adding a second Seat and appending new events (seq > N).
    pub fn verify_no_history_rewritten(
        prefix_before: &[(u64, String, String)],
        full_chain_after: &[(u64, String, String)],
    ) -> Result<(), String> {
        let n = prefix_before.len();
        if full_chain_after.len() < n {
            return Err("ChainIntegrityError: Event log shrunk after adding Seat!".to_string());
        }

        let prefix_after = &full_chain_after[..n];

        // 1. Assert pre-existing prefix items are byte-identical
        for i in 0..n {
            if prefix_before[i] != prefix_after[i] {
                return Err(format!(
                    "ChainIntegrityError: Historical event seq {} was modified! Before: {:?}, After: {:?}",
                    prefix_before[i].0, prefix_before[i], prefix_after[i]
                ));
            }
        }

        // 2. Assert root hashes match R0 == R1
        let r0 = Self::compute_prefix_root_hash(prefix_before);
        let r1 = Self::compute_prefix_root_hash(prefix_after);

        if r0 != r1 {
            return Err(format!(
                "ChainIntegrityError: Prefix root hash changed! R0={}, R1={} (AC3 violation)",
                r0, r1
            ));
        }

        Ok(())
    }
}
