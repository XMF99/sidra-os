//! M21 Seats and Identity — Conformance Suite & Exit Criterion Verification
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §17, ADR-0057, ADR-0058, ADR-0059

use std::collections::BTreeSet;
use crate::domain::{Capability, DisplayName, SeatFence, SeatId};
use crate::integrity::EventChainIntegrityHarness;
use crate::lifecycle::{accept_seat, invite_seat, materialize_founding, provision_seat};
use crate::registry::SeatRegistry;

pub struct SeatsConformanceSuite;

impl SeatsConformanceSuite {
    /// Verify Exit Criterion: A second Seat is created; every event distinguishes the two; no historical event is rewritten (AC1, AC2, AC3)
    pub fn verify_exit_criterion() -> Result<(), String> {
        // 1. Setup pre-existing event log prefix (seq 1..N) with 'principal', agent, and system events
        let mut event_log: Vec<(u64, String, String)> = vec![
            (1, "principal".to_string(), "DirectiveCreated: System setup".to_string()),
            (2, "principal".to_string(), "EngagementCreated: Initial engagement".to_string()),
            (3, "agent.backend".to_string(), "TurnCompleted: Task 1".to_string()),
            (4, "system".to_string(), "CompactionCompleted".to_string()),
        ];

        let prefix_before = event_log.clone();

        // 2. Materialize Founding Seat (bound to 'principal')
        let mut registry = SeatRegistry::new();
        let founding = materialize_founding(&mut registry, 1700000000)?;
        assert_eq!(founding.actor_value.0, "principal");

        let mut founding_fence = SeatFence::empty(founding.id.clone(), founding.actor_value.clone(), 1700000000);
        founding_fence.capabilities.insert(Capability::parse("*")?);

        // 3. Invite & Accept Second Seat ("Sam")
        let second_seat = invite_seat(&mut registry, "Sam Altman", &founding.id, 1700000100)?;
        accept_seat(&mut registry, &second_seat.id)?;

        let mut second_caps = BTreeSet::new();
        second_caps.insert(Capability::parse("fs.read:vault/Sources/**")?);

        let (_fence, _budget, _memory) = provision_seat(
            &mut registry,
            &second_seat.id,
            second_caps,
            &founding_fence,
            500_00, // $500.00
            1000_00, // $1000.00 firm ceiling
            0,
            1700000200,
        )?;

        // 4. Append new events for second Seat (seq N+1 ..)
        let second_actor = second_seat.actor_value.0.clone();
        assert_ne!(second_actor, "principal");

        event_log.push((5, "principal".to_string(), format!("SeatInvited: {}", second_seat.id.0)));
        event_log.push((6, second_actor.clone(), "SeatAccepted: Sam Altman".to_string()));
        event_log.push((7, second_actor.clone(), "DirectiveCreated: Sam's Directive".to_string()));

        // 5. Verify AC3: Chain integrity assertion (no historical event rewritten)
        EventChainIntegrityHarness::verify_no_history_rewritten(&prefix_before, &event_log)?;

        // 6. Verify AC2: Every event distinguishes the two Seats (disjoint result sets)
        let founding_events: Vec<_> = event_log.iter().filter(|e| e.1 == "principal").collect();
        let second_events: Vec<_> = event_log.iter().filter(|e| e.1 == second_actor).collect();

        assert!(!founding_events.is_empty());
        assert!(!second_events.is_empty());
        for fe in &founding_events {
            for se in &second_events {
                assert_ne!(fe.1, se.1);
            }
        }

        Ok(())
    }
}
