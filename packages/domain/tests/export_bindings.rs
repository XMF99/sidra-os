use sidra_domain::{
    AppStatus, ApprovalRequest, BriefStatus, Capability, ContextWindow, EffectClass, EngagementId,
    Event, Fence, MemoryChunk, ProvenanceTag, SearchResult, SystemInfo,
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
    MemoryChunk::export_all().unwrap();
    SearchResult::export_all().unwrap();
    ContextWindow::export_all().unwrap();
}
