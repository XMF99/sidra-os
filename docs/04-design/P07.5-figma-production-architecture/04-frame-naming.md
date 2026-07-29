# THEKY P07.5 — Frame, Component, & Variant Naming Standards

> **Program P07.5: Figma Production Architecture**  
> **Document:** 04-frame-naming.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION ARCHITECTURE (LOCKED)  

---

## 1. Component & Variant Naming Convention

Component sets follow a strict dot-delimited naming syntax matching code bindings:

$$\text{Component Name} = \texttt{comp.}\langle\text{Family}\rangle.\langle\text{Name}\rangle/\langle\text{Variant}\rangle/\langle\text{State}\rangle$$

* **Example:** `comp.buttons.action_primary/sign_off/default`
* **Example:** `comp.cards.brief_card/executive/passed_review`

---

## 2. Frame & Section Naming Rules

* **Screen Frame Naming:** `screen.[module].[view_name].[viewport].[state]` (e.g., `screen.missions.dag_list.desktop.ready`).
* **Section Section Naming:** `[MODULE_CODE] - Feature Flow Title` (e.g., `[P04-MIS] - Mission Execution & Brief Delivery Flow`).

---
