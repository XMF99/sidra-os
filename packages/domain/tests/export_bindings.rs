use sidra_domain::{AppStatus, BriefStatus, EngagementId, Event, SystemInfo};
use ts_rs::TS;

#[test]
fn export_ts_bindings() {
    EngagementId::export_all().unwrap();
    AppStatus::export_all().unwrap();
    BriefStatus::export_all().unwrap();
    SystemInfo::export_all().unwrap();
    Event::export_all().unwrap();
}
