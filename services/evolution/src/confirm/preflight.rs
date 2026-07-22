use crate::domain::revision::CharterRevision;
use crate::domain::status::RevisionStatus;

pub struct ConfirmPreflight;

impl ConfirmPreflight {
    pub fn check_eligible(revision: &CharterRevision) -> Result<(), String> {
        if revision.status != RevisionStatus::AwaitingPrincipal {
            return Err(format!(
                "Revision {} is not in AwaitingPrincipal state (current status: {:?})",
                revision.revision_id.0, revision.status
            ));
        }
        Ok(())
    }
}
