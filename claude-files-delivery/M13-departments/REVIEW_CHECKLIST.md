# M13 — Review Checklist

Every item ✓ VERIFIED or ✗ FAILED. Build/test items ✗ until a toolchain runs them.

## Documents & ADRs
- [x] README, Architecture, Implementation Plan, Review Checklist present
- [x] Governing ADRs mapped (0013, 0014, 0016, 0017, 0020); no new ADR required

## Epics complete
- [ ] E1 Pack freeze + three-act install + agent→department resolver
- [ ] E2 standards inheritance + registry API + Canon promotion
- [ ] E3 seven CORE Packs authored
- [ ] E4 Exchange end-to-end
- [ ] E5 Application records
- [ ] E6 department rooms + fixed panels
- [ ] E7 install/uninstall isolation proof (I-17)

## Acceptance criteria
- [ ] AC1 three-act install, each act logged + refusable
- [ ] AC2 twelve checks green on all seven Packs
- [ ] AC3 three departments install from Packs (exit part 1)
- [ ] AC4 one Exchange request end to end, charged to requester (exit part 2)
- [ ] AC5 standards inherit firm>app>dept; conflict surfaced at install
- [ ] AC6 registry append-only + Canon promotion (propose/confirm)
- [ ] AC7 Application record joins departments; holds no logic
- [ ] AC8 Registrar resolves agent→department (the API M16 needs)
- [ ] AC9 uninstall leaves Firm working; artifacts+memory readable (I-17)
- [ ] AC10 forbidden scope cannot be granted
- [ ] AC11 room appears only on explicit install
- [ ] AC12 replay stays green

## Exit criteria
- [ ] Three departments installed (AC3) + one Exchange request end to end (AC4)

## Architecture compliance
- [x] Pack format frozen; nine of twelve dirs are data; only tools/ runs code
- [x] Installation never grants authority (three separate acts)
- [x] agent→department resolver delivered for M16 (closes the AC2/ADR-0035 gap)
- [ ] Build/test/clippy/fmt executed — **✗ NOT VERIFIED (no toolchain)**

**STOP after M14.**
