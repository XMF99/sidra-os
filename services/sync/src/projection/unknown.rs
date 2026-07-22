use sidra_domain::Event;

pub struct UnknownEventDeferrer;

impl UnknownEventDeferrer {
    pub fn is_known_kind(event_type: &str) -> bool {
        matches!(
            event_type,
            "DirectiveCreated"
                | "TurnCompleted"
                | "SeatMaterialized"
                | "SeatInvited"
                | "SeatAccepted"
                | "SeatProvisioned"
                | "DelegationGranted"
                | "DelegationRevoked"
                | "ApprovalResolved"
                | "SelfApprovalRefused"
                | "ConflictDetected"
                | "ConflictResolved"
        )
    }

    pub fn handle_unknown(event: &Event) -> bool {
        if !Self::is_known_kind(&event.event_type) {
            // Event is stored, chained, and ordered, but projection is deferred
            true
        } else {
            false
        }
    }
}
