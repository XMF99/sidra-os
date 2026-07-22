# M12 — ADR Requirements

**No new ADR is required.** M12 implements decisions already recorded.

| ADR | Decision | M12 use |
|---|---|---|
| ADR-0012 | Divisions between the Executive and Departments | The eight-Division layer + routing hop (E1, E2) |
| ADR-0015 | Offices hold vetoes; Departments hold delivery | The four Offices + firm-wide vetoes + reviewer instances (E3) |
| ADR-0018 | Review Intensity as a firm-wide setting | Referenced by Office must-review thresholds; the setting itself ships fully at M14 |
| ADR-0004 | Executive holds five tools | Extends to every Division executive — they do no delivery work (E1) |
| ADR-0008 | Separation of author and reviewer | Extended to `reviewer_division != author_division` for Office reviews (I-16, E3) |

## Confirmation
No open decision at M12. If the fast-lane target or veto precedence needs revisiting under measurement, that
is an ADR (next free number 0038+), not a code change.
