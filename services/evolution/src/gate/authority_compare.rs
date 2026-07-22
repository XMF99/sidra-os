use crate::domain::status::RefuseReason;
use sidra_mission::{Charter, CharterRelation as Relation};

pub struct AuthorityComparator;

impl AuthorityComparator {
    pub fn compare(candidate: &Charter, base: &Charter) -> Result<Relation, RefuseReason> {
        let rel = candidate.relation_to(base);
        match rel {
            Relation::Same | Relation::Narrower => Ok(rel),
            Relation::Wider | Relation::Incomparable => Err(RefuseReason::Widening),
        }
    }
}
