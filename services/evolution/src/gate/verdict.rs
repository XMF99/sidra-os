use crate::domain::status::{RefuseReason, RevisionStatus};
use crate::domain::values::RevisionId;

pub struct RevisionVerdict;

impl RevisionVerdict {
    pub fn assemble_refusal(_revision_id: &RevisionId, reason: RefuseReason) -> RevisionStatus {
        RevisionStatus::Refused(reason)
    }

    pub fn assemble_awaiting(_revision_id: &RevisionId) -> RevisionStatus {
        RevisionStatus::AwaitingPrincipal
    }
}
