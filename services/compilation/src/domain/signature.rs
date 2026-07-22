use crate::domain::normalized_step::NormalizedStep;
use crate::domain::values::SignatureHash;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProcedureSignature {
    pub steps: Vec<NormalizedStep>,
    pub edges: Vec<(usize, usize)>,
    pub hash: SignatureHash,
}

impl ProcedureSignature {
    pub fn compute(steps: Vec<NormalizedStep>, mut edges: Vec<(usize, usize)>) -> Self {
        edges.sort_unstable();

        let mut hasher = Sha256::new();
        hasher.update([1u8]); // Encoding version 1

        for step in &steps {
            hasher.update(step.task_kind.as_bytes());
            hasher.update(step.role_archetype_id.0.as_bytes());
            hasher.update([step.effect_class.0]);
            hasher.update(step.contract_shape_id.0.as_bytes());
            if let Some(child) = &step.child_template {
                hasher.update(child.task_kind.as_bytes());
                hasher.update(child.role_archetype_id.0.as_bytes());
                hasher.update([child.effect_class.0]);
                hasher.update(child.contract_shape_id.0.as_bytes());
            }
        }

        for (from, to) in &edges {
            hasher.update(from.to_be_bytes());
            hasher.update(to.to_be_bytes());
        }

        let hash_bytes = hasher.finalize();
        let hash_hex = format!("{:x}", hash_bytes);

        Self {
            steps,
            edges,
            hash: SignatureHash(hash_hex),
        }
    }
}
