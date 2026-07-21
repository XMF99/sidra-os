use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use sidra_domain::DepartmentId;
use sidra_security::EgressFilter;

/// Compile `[egress].allow` into `EgressFilter` entry for (connector, department) (ADR-0036, T6.1)
pub fn compile_egress(
    manifest: &ConnectorManifest,
    department_id: &DepartmentId,
    egress_filter: &EgressFilter,
) -> Result<(), ConnectorError> {
    for host in &manifest.egress.allow {
        egress_filter.add_allowed_host(host);
    }
    Ok(())
}
