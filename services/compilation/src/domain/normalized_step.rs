use crate::domain::values::{ContractShapeId, EffectClass, RoleArchetypeId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NormalizedStep {
    pub task_kind: String,
    pub role_archetype_id: RoleArchetypeId,
    pub effect_class: EffectClass,
    pub contract_shape_id: ContractShapeId,
    pub child_template: Option<Box<NormalizedStep>>,
}

impl NormalizedStep {
    pub fn new(
        task_kind: String,
        role_archetype_id: RoleArchetypeId,
        effect_class: EffectClass,
        contract_shape_id: ContractShapeId,
        child_template: Option<NormalizedStep>,
    ) -> Self {
        Self {
            task_kind,
            role_archetype_id,
            effect_class,
            contract_shape_id,
            child_template: child_template.map(Box::new),
        }
    }
}
