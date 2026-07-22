use crate::domain::normalized_step::NormalizedStep;
use crate::domain::signature::ProcedureSignature;
use crate::domain::values::{ContractShapeId, EffectClass, RoleArchetypeId};

pub struct SignatureNormalizer;

impl SignatureNormalizer {
    pub fn normalize_work_orders(
        work_orders: &[(String, String, u8, String)], // (task_kind, role_archetype_id, effect_class, contract_shape)
    ) -> ProcedureSignature {
        let mut steps = Vec::new();

        for (kind, role, eff, shape) in work_orders {
            let eff_class = EffectClass::new(*eff).unwrap_or(EffectClass(1));
            let step = NormalizedStep::new(
                kind.clone(),
                RoleArchetypeId(role.clone()),
                eff_class,
                ContractShapeId(shape.clone()),
                None,
            );
            steps.push(step);
        }

        let mut edges = Vec::new();
        if steps.len() > 1 {
            for i in 0..(steps.len() - 1) {
                edges.push((i, i + 1));
            }
        }

        ProcedureSignature::compute(steps, edges)
    }
}
