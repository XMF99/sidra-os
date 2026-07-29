# THEKY Constitution — Documentation Standard & Specifications

> **Program 00: Product Constitution**  
> **Document:** 06-documentation-standard.md  
> **Governance Authority:** Supreme Governance (Subordinate ONLY to [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md))  
> **Status:** PERMANENT DOCUMENTATION STANDARD  

---

## 1. Documentation Governance

All documentation in the **THEKY** repository is treated as **Authoritative Architectural Artifacts**. This standard defines mandatory formatting, metadata, naming, and review rules.

---

## 2. Directory Taxonomy & Naming Rules

```
design/
├── ARCHITECTURE-LOCK.md      ── Highest Constitutional Authority
├── constitution/             ── Program 00 Constitutional Documents (`00-` to `13-`)
├── phase-01-product-discovery/ ─ Phase 01 Discovery Packages (`01-` to `24-`)
├── phase-02-product-strategy/ ── Phase 02 Product Strategy Packages (`01-` to `13-`)
├── ADR/                      ── Architecture Decision Records (`ADR-0001-title.md`)
├── DECISIONS/                ── Product Decision Records (`PDR-0001-title.md`)
├── RFC/                      ── Request for Comments (`RFC-0001-title.md`)
└── CHANGELOG/                ── Ecosystem Version Change Ledgers (`CHANGELOG-v1.0.md`)
```

---

## 3. Mandatory Metadata Header Block

Every document must begin with the standardized metadata header:

```markdown
# [Title]

> **[Program / Phase ID]**  
> **Document:** [filename.md]  
> **Governance Authority:** [Parent Authority Link]  
> **Status:** [DRAFT / UNDER REVIEW / APPROVED STRATEGY / RATIFIED]  
```

---
