# ADR-0011 — Seven-directory monorepo layout

**Status:** Accepted · **Date:** design phase · **Supersedes:** the layout described in the first revision of
`02-architecture/03-folder-structure.md`

## Context

The original repository layout was organised by language: `crates/` for Rust, `ui/` for TypeScript, `config/`
for shipped defaults, `tests/` for everything provable. It is the conventional shape for a Tauri project and
it is legible on day one.

It has two problems that only appear later. First, it encodes the 1.0 process topology into the directory
tree: `crates/` is "the desktop binary's internals," which is exactly the assumption 3.0 breaks when the
kernel becomes a hosted service. Second, it files the agent charters under `config/`, which quietly tells
every engineer that the Firm's charters are settings — editable, unversioned in spirit, not gated. They are
neither: they are the product's behaviour, and they have evaluation sets attached.

## Options

1. **Keep the language-oriented layout.** Familiar, zero migration cost, and it keeps mis-filing charters as
   configuration while pre-committing to a single-binary topology.
2. **Split into multiple repositories** (kernel, desktop, agents). Enforces boundaries absolutely; makes
   atomic cross-cutting changes impossible, which is the majority of changes in a project this coupled, and
   triples release coordination for a team this size.
3. **A domain-oriented monorepo**: `docs/`, `apps/`, `services/`, `agents/`, `packages/`, `infrastructure/`,
   `workspace/`.

## Decision

Option 3. Seven top-level directories, split by what a thing is *for* rather than what it is written in.
`apps/` holds launchable products, `services/` holds the kernel's capabilities one crate each, `agents/`
holds the Firm as reviewed data, `packages/` holds shared libraries, `infrastructure/` holds build and proof,
and `workspace/` holds uncommitted local runtime state. Both the Cargo and pnpm workspaces span the tree by
glob rather than owning a directory each.

## Consequences

**Accepted:** two mixed-language directories. `apps/desktop` contains a Rust crate and a React tree; a
newcomer must learn that a product surface is one folder even when it is two languages. We judge this
cheaper than the alternative, where changing one feature means editing two distant subtrees.

**Accepted:** the word "workspace" now carries three meanings — Cargo's, pnpm's, and ours. We take the
collision because the human meaning is the one that appears as a path, and require the manifests and Justfile
to say "workspace members" explicitly when they mean the tooling sense.

**Accepted:** deeper paths. `services/orchestrator/src/engagement.rs` is longer than
`crates/sidra-orchestrator/src/engagement.rs` was — marginally — and no shallower than it needs to be.

**Gained:** the 3.0 topology is already expressed. Extracting the kernel to a server is selecting a subset of
`services/` and adding a binary under `apps/`, with no file moved and no import rewritten. ADR-0002's event
log and ADR-0005's routing were both designed for this; the tree now agrees with them.

**Gained:** charters are visibly product. `agents/` sits beside `apps/` with its evaluation sets in the same
subtree, so the CI gate — a charter change that regresses `agents/evals/` does not merge — reads as obvious
rather than as an unusual rule someone had to remember.

**Gained:** a mechanically checkable dependency direction. `packages/domain` ← `services/*` ← `apps/*`, with
`infrastructure/` depending on everything and nothing depending on it. A CI check enforces the arrows, which
is only possible because the tree names the layers.

**Gained:** `workspace/` gives local runtime state one obvious home, so the development Vault, downloaded
model weights, caches, and logs stop accumulating in whichever directory was convenient.

**Reversal cost:** low, and it drops toward zero the earlier it happens. This is a decision to make before
M1 rather than after it.
