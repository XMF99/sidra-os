# THEKY P04.5 — System Feedback Architecture & Confidence Messaging

> **Program P04.5: UX Architecture**  
> **Document:** 05-feedback-system.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED UX ARCHITECTURE (LOCKED)  

---

## 1. Feedback Messaging Spectrum

```
+---------------------------------------------------------------------------------------------------------+
|                                      SIX SYSTEM FEEDBACK CLASSES                                        |
+----------------------+----------------------+----------------------+------------------------------------+
| 1. SUCCESS           | 2. FAILURE           | 3. WARNING           | 4. PROGRESS                        |
| • Ledger Commit Hash | • Root-Cause Trace   | • Spend Cap Near     | • Mission DAG % Complete           |
+----------------------+----------------------+----------------------+------------------------------------+
| 5. AI UNCERTAINTY    | 6. HUMAN APPROVAL    |                      |                                    |
| • Score (0.0 to 1.0) | • Digital Sign-Off   |                      |                                    |
+----------------------+----------------------+----------------------+------------------------------------+
```

---

## 2. AI Certainty & Honest Uncertainty Rules

Synthetic agents explicitly state uncertainty scores alongside outputs:
* **High Certainty ($\ge 0.95$):** Ready for immediate 1-click human sign-off.
* **Moderate Certainty ($0.75 - 0.94$):** Requires Reviewer agent verification.
* **Low Certainty ($<0.75$):** Escalated to Principal with explicit risk flags.

---
