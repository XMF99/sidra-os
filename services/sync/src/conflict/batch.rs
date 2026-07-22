use crate::conflict::detect::DetectedFork;
use std::collections::BTreeMap;

pub struct ConflictBatcher;

impl ConflictBatcher {
    pub fn group_by_subject(forks: &[DetectedFork]) -> BTreeMap<String, Vec<DetectedFork>> {
        let mut grouped: BTreeMap<String, Vec<DetectedFork>> = BTreeMap::new();

        for fork in forks {
            let key = format!("{}:{}", fork.cell.table_name, fork.cell.row_pk);
            grouped.entry(key).or_default().push(fork.clone());
        }

        grouped
    }
}
