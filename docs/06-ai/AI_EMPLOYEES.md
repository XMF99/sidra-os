# Synthetic AI Employee Charters & Capability Fences

> **Section 06: AI Platform Documentation**  
> **Document:** AI_EMPLOYEES.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** APPROVED SPECIFICATION  

---

## 1. Synthetic Employee Identity & Charter Specification

Every synthetic agent operating within THEKY is assigned a formal **Synthetic Employee Charter**:

```json
{
  "agent_id": "syn_dev_rust_builder",
  "archetype": "SYNTHETIC_AUTHOR",
  "department": "Engineering & Technology",
  "charter_scope": "Rust backend crate implementation within services/mission",
  "capability_fences": {
    "permitted_paths": ["services/mission/*", "packages/domain/*"],
    "blocked_paths": ["workspace/vault/confidential/*"],
    "cloud_egress": false,
    "daily_token_budget_usd": 10.00
  },
  "supervisor_principal_id": "usr_cto_alex"
}
```
