use crate::manifest::validate::is_host_allowed;

/// Registrable domain suffix matching helper (ADR-0036, T6.4)
pub fn match_host_to_allowlist(host: &str, allowlist: &[String]) -> bool {
    is_host_allowed(host, allowlist)
}
