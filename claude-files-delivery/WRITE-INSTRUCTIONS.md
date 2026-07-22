# Sidra OS — Repository Write Bundle (M26–M30 + capstones + ADR registration)

The device bridge disconnected before the final repository write could run. This bundle contains **exactly the
files that need to land in the repo**, laid out to mirror the `sidra-os/` tree so it can be applied by a plain
unzip-and-merge. **Nothing here is new or modified architecture** — these are the already-completed documents,
copied verbatim into their repository locations.

## What's in this bundle

```
claude-files-delivery/
├── M26-outcome-calibration/            (README, 00-M25-AUDIT, ARCHITECTURE, IMPLEMENTATION_PLAN, REVIEW_CHECKLIST, adr/0069–0071)
├── M27-charter-evolution/              (… adr/0072–0073)
├── M28-procedural-compilation/         (… adr/0074–0075)
├── M29-firm-self-review/               (… adr/0076–0077)
├── M30-continuum-hardening-and-4.0/    (… adr/0078–0079)
├── DELIVERY-INDEX.md                   (finalized, M1–M30 — replaces the 3.0 version already in the repo)
├── MILESTONE-DEPENDENCY-MAP.md         (new)
├── IMPLEMENTATION-ROADMAP.md           (new)
└── ARCHITECTURE-COMPLETENESS-AUDIT.md  (new)

docs-v2/adr/
├── 0045-*.md … 0079-*.md               (the 35 new ADRs to register — copies from the package adr/ folders)
└── _INDEX-ROWS-TO-APPEND.md            (the table rows to add to docs-v2/adr/README.md; NOT a file to keep)
```

## How to apply (manual path)

1. Unzip this bundle at the **root of your `sidra-os/` folder**. It merges into `claude-files-delivery/` and
   `docs-v2/adr/` without touching anything else.
   - `DELIVERY-INDEX.md` overwrites the existing 3.0-era index with the finalized M1–M30 version — that is
     intended.
2. Register the ADRs in the index: open `docs-v2/adr/README.md`, and append the rows from
   `docs-v2/adr/_INDEX-ROWS-TO-APPEND.md` to its decision table (the live index currently ends at **0044**;
   these add **0045–0079**, contiguous). Then delete `_INDEX-ROWS-TO-APPEND.md` — it is a helper, not a repo
   file. Mark the rows `Accepted` whenever the Principal approves them (they ship as `Proposed`).

## How to apply (automatic path)

Reconnect the Claude desktop app to the `sidra-os` folder and tell me to continue. The moment the bridge is
back I will write all of the above into the repo directly — including reading the live `docs-v2/adr/README.md`
and appending the 0045–0079 rows in place — and then re-run the final verification.

## What is NOT touched

M1–M25 packages, M16, M15, `/docs`, the workspace crates, migrations, and every existing ADR (0001–0044)
are left exactly as they are. This bundle only adds the M26–M30 packages, the four capstone documents, and the
new ADR files/rows.
