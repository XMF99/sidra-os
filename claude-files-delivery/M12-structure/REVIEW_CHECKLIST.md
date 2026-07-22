# M12 — Review Checklist

Every item ✓ VERIFIED or ✗ FAILED. Build/test items ✗ until a toolchain runs them.

## Documents & ADRs
- [x] README, Architecture, Implementation Plan, Review Checklist present
- [x] Governing ADRs mapped (0012, 0015, 0018, 0004); no new ADR required

## Epics complete
- [ ] E1 Division/Office domain + org graph
- [ ] E2 Division routing + fast lane
- [ ] E3 Offices + firm-wide vetoes + I-16
- [ ] E4 budget sub-ceiling surfaced
- [ ] E5 v1→v2 manifest generator (Decision)
- [ ] E6 Rail/keymap/palette + components

## Acceptance criteria
- [ ] AC1 eight Divisions in the graph
- [ ] AC2 four Offices with veto scopes + must-review rules
- [ ] AC3 Rail shows Divisions; department room inside its Division; ⌘ rebind
- [ ] AC4 Office veto blocks firm-wide; dissent recorded; work halts
- [ ] AC5 own-Division artifact reviewed by Office reviewer instance (I-16)
- [ ] AC6 Division routing + fast-lane 65% target measured
- [ ] AC7 manifest generator output = §3; presented as a Decision
- [ ] AC8 budget sub-ceiling enforced + surfaced
- [ ] AC9 Office conflict precedence + deadlock→Approval Request
- [ ] AC10 replay stays byte-identical for non-structural Engagements

## Exit criteria
- [ ] Eight Divisions + four Offices; Rail shows Divisions; vetoes firm-wide; replay green

## Architecture compliance
- [x] No new migration required (structure columns shipped at M11)
- [x] Division executives do no delivery work (ADR-0004 five-tool rule)
- [x] Rail change + veto scope announced in the Brief (migration §7)
- [ ] Build/test/clippy/fmt executed — **✗ NOT VERIFIED (no toolchain)**

**STOP after M14.**
