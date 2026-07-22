use crate::domain::values::{DeviceId, DeviceSeq, VersionVector};
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VectorDeltaRange {
    pub device_id: DeviceId,
    pub start_seq: DeviceSeq,
    pub end_seq: DeviceSeq,
}

pub struct VectorExchange;

impl VectorExchange {
    pub fn compute_delta(local: &VersionVector, remote: &VersionVector) -> Vec<VectorDeltaRange> {
        let mut deltas = Vec::new();

        for (dev_id, local_seq) in &local.frontiers {
            let remote_seq = remote.get(dev_id);
            if local_seq.0 > remote_seq.0 {
                deltas.push(VectorDeltaRange {
                    device_id: dev_id.clone(),
                    start_seq: DeviceSeq(remote_seq.0 + 1),
                    end_seq: *local_seq,
                });
            }
        }

        deltas
    }
}
