//! Milestone M13 Exit Criterion Test Harness
//!
//! Ref: ADR-0044, IMPLEMENTATION_PLAN.md T10.9, AC1, AC4
//! Installs Backend, Cybersecurity, and Software Engineering from Pack manifests.
//! Runs 1 Exchange request: Backend -> capability.security-review -> Cybersecurity.

use crate::manifest::parse::parse_department_manifest;
use crate::registry::install::InstalledPacksRegistry;
use crate::registry::orggraph::DepartmentRegistrar;

pub fn execute_m13_exit_criterion() -> Result<(), String> {
    let backend_toml = r#"
        id = "dept.backend"
        name = "Backend Engineering"
        version = "1.0.0"
        division_id = "div_core_software"
        provides = ["capability.api-design"]
        requires = ["capability.code-review", "capability.security-review"]

        [capabilities]
        required = ["capability.api-design"]
        optional = []
        forbidden = ["capability.direct-database-write"]

        [[roles]]
        archetype_id = "archetype.backend-lead"
        name = "Backend Lead"
        policy = "eager"
        capabilities = ["capability.api-design"]
    "#;

    let cybersecurity_toml = r#"
        id = "dept.cybersecurity"
        name = "Cybersecurity"
        version = "1.0.0"
        division_id = "div_cybersecurity"
        provides = ["capability.security-review"]
        requires = []

        [capabilities]
        required = ["capability.security-review"]
        optional = []
        forbidden = []

        [[roles]]
        archetype_id = "archetype.ciso-analyst"
        name = "Security Analyst"
        policy = "eager"
        capabilities = ["capability.security-review"]
    "#;

    let software_eng_toml = r#"
        id = "dept.software-engineering"
        name = "Software Engineering"
        version = "1.0.0"
        division_id = "div_core_software"
        provides = ["capability.code-review"]
        requires = []

        [capabilities]
        required = ["capability.code-review"]
        optional = []
        forbidden = []

        [[roles]]
        archetype_id = "archetype.senior-dev"
        name = "Senior Dev"
        policy = "eager"
        capabilities = ["capability.code-review"]
    "#;

    let backend = parse_department_manifest(backend_toml)?;
    let cybersecurity = parse_department_manifest(cybersecurity_toml)?;
    let software_eng = parse_department_manifest(software_eng_toml)?;

    let mut pack_reg = InstalledPacksRegistry::new();
    let mut registrar = DepartmentRegistrar::new();

    let d1 = pack_reg.install_pack(backend.clone())?;
    let d2 = pack_reg.install_pack(cybersecurity.clone())?;
    let d3 = pack_reg.install_pack(software_eng.clone())?;

    // Invariant check: Install writes ZERO capability grants!
    if pack_reg.grants_count != 0 {
        return Err("Violation: Install wrote capability grants (AC2 failure)".to_string());
    }

    registrar.packs.insert(d1.clone(), backend);
    registrar.packs.insert(d2.clone(), cybersecurity);
    registrar.packs.insert(d3.clone(), software_eng);

    // Resolve contract: Backend -> capability.security-review -> (Registrar resolves to) Cybersecurity
    let resolved_dept = registrar
        .resolve_contract("capability.security-review", Some("div_core_software"))
        .map_err(|e| e.to_string())?;

    if resolved_dept != "dept.cybersecurity" {
        return Err(format!(
            "Exchange contract resolution failure: expected 'dept.cybersecurity', got '{resolved_dept}'"
        ));
    }

    Ok(())
}
