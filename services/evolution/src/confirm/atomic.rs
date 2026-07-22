use crate::confirm::actor::ConfirmActorGuard;
use crate::confirm::decision::EvolutionDecisionCreator;
use crate::confirm::materialise::VersionMaterialiser;
use crate::confirm::preflight::ConfirmPreflight;
use crate::domain::revision::CharterRevision;
use crate::domain::values::{CharterVersion, DecisionId};
use sidra_store::Vault;
use std::sync::Mutex;

pub struct RevisionConfirmEngine;

impl RevisionConfirmEngine {
    pub fn confirm_revision(
        vault: &Mutex<Vault>,
        revision: &CharterRevision,
        principal_actor: &str,
        eval_summary: &str,
        timestamp: u64,
    ) -> Result<(CharterVersion, DecisionId), String> {
        ConfirmPreflight::check_eligible(revision)?;
        ConfirmActorGuard::assert_principal_seat(principal_actor)?;

        let decision_id = EvolutionDecisionCreator::create_principal_decision(
            vault,
            &revision.revision_id.0,
            &revision.archetype_id.0,
            principal_actor,
            eval_summary,
            timestamp,
        )?;

        let new_ver = VersionMaterialiser::materialise_new_version(
            vault,
            revision,
            &decision_id,
            principal_actor,
            timestamp,
        )?;

        Ok((new_ver, decision_id))
    }
}
