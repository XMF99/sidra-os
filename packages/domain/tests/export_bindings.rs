use sidra_domain::{
    AppStatus, ApprovalRequest, BriefStatus, Capability, EffectClass, EngagementId, Event, Fence,
    ProvenanceTag, SystemInfo,
};
use ts_rs::TS;

#[test]
fn export_ts_bindings() {
    EngagementId::export_all().unwrap();
    AppStatus::export_all().unwrap();
    BriefStatus::export_all().unwrap();
    SystemInfo::export_all().unwrap();
    Event::export_all().unwrap();
    EffectClass::export_all().unwrap();
    Capability::export_all().unwrap();
    Fence::export_all().unwrap();
    ApprovalRequest::export_all().unwrap();
    ProvenanceTag::export_all().unwrap();
}
