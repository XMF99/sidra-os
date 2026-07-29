# THEKY P08.2 — Command Center High-Fidelity UI Specification (`Cmd+K`)

> **Program P08.2: Core Product UI Production**  
> **Document:** 03-command-center.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Floating Command Palette Overlay UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| [INPUT BAR] 🔍 Type a command or natural intent...                                       [Esc to Close] |
+---------------------------------------------------------------------------------------------------------+
| QUICK ACTIONS                                                                                           |
|  ⚡ Create Sovereign Markdown Document                                                 [Cmd + N]        |
|  📋 View Executive Brief Queue [1 Sign-Off Pending]                                    [Cmd + B]        |
|  🧠 Open Memory Vector Graph Inspector                                                 [Cmd + M]        |
|                                                                                                         |
| RECENT COMMANDS                                                                                         |
|  🕒 Deploy Agent `syn_dev_builder_01` to Local WASM Sandbox                            (Executed 10m ago)|
|  🕒 Filter CRM Accounts by ARR > $100,000                                              (Executed 1h ago) |
|                                                                                                         |
| SUGGESTED SYSTEM INTENT                                                                                 |
|  🎯 Sign Off Q3 Enterprise ELA Contract ($120,000 ARR) ───────────────────────────────> Requires Action |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Token & Component Binding Specifications

* **Modal Overlay Container:** `width: 640px`, `bg: #141C2B`, `border: 1px solid #38BDF8`, `radius: 12px` (`sys.token.radius.lg`), `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.50)`, `backdrop-filter: blur(12px)`.
* **Keyboard Badge Component:** `bg: #233248`, `color: #F1F5F9`, `font: 11px / 500 Monospace`, `padding: 2px 6px`, `radius: 4px`.

---
