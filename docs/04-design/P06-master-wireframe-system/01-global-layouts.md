# THEKY P06 — Global Application Layout Wireframes

> **Program P06: Master Wireframe System**  
> **Document:** 01-global-layouts.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED WIREFRAME SYSTEM (LOCKED)  

---

## 1. Desktop Shell Structural Layout

```
+---------------------------------------------------------------------------------------------------------+
| [APP BAR] THEKY OS │ Workspace: Acme Vault [v] │ Search/Cmd (`Cmd+K`) │ Status: Offline Ready [Sync]     |
+------------------+----------------------------------------------------+----------------------------------+
| [NAV SIDEBAR]    | [PRIMARY WORKSPACE CANVAS]                         | [INSPECTOR DRAWER (Collapsible)] |
| • Home           |                                                    |                                  |
| • Brief Queue [3]|  +----------------------------------------------+  | [OBJECT METADATA]                |
| • Missions       |  | EXECUTIVE BRIEF / PRIMARY DOCUMENT CONTENT   |  | • ID: doc_prd_billing_v2         |
| • Projects       |  |                                              |  | • Owner: Principal Alex          |
| • Knowledge      |  |                                              |  | • Classification: Confidential   |
| • AI Employees   |  |                                              |  | • Security Gate: Passed          |
| • CRM            |  |                                              |  |                                  |
| • Connectors     |  +----------------------------------------------+  | [MEMORY GRAPH LINKS]             |
| • Settings       |                                                    | • Link 1: ADR-0004               |
+------------------+----------------------------------------------------+----------------------------------+
| [BOTTOM DRAWER (Dockable)]: Mission DAG Execution Logs │ Active WASM Sandbox: syn_dev_builder_01        |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Web & Mobile Shell Structural Layouts

### 2.1 Web Shell Structural Blueprint
```
+---------------------------------------------------------------------------------------------------------+
| [TOP BAR] THEKY Web │ Org: Acme Corp │ Cmd Launcher (`Cmd+K`) │ Active User: Alex (Admin)               |
+------------------+--------------------------------------------------------------------------------------+
| [COLLAPSIBLE NAV]| [MAIN VIEWPORT CANVAS]                                                               |
| • Home / Briefs  |  +--------------------------------------------------------------------------------+  |
| • Knowledge      |  | Content View / Document Editor                                                    |  |
| • Admin Panel    |  +--------------------------------------------------------------------------------+  |
+------------------+--------------------------------------------------------------------------------------+
```

### 2.2 Mobile Shell Structural Blueprint
```
+------------------------------------+
| [STATUS BAR] THEKY Companion       |
+------------------------------------+
| [EXECUTIVE BRIEF CARD]             |
| Mission: Deploy Sales Engine       |
| Status: Review Gate Passed         |
| Decision Required: Sign-Off Spend  |
| [1-Click Approval (`Cmd+Enter`)]   |
+------------------------------------+
| [BOTTOM TAB BAR]                   |
| [Briefs] [Missions] [Vault] [Menu] |
+------------------------------------+
```

---
