# ADR-0001 — Tauri 2 over Electron

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Sidra OS is a desktop application with a large trusted core (storage, cryptography, model gateway,
orchestration) and a rich untrusted UI. It must start fast, sit idle for hours at low memory, run a Rust
codebase that we intend to reuse verbatim as a server in 3.0, and enforce a hard boundary between the renderer
and anything effectful.

## Options

1. **Electron.** Mature, uniform rendering, enormous ecosystem, straightforward hiring. Ships a Chromium per
   application, costs roughly 150 MB resident before doing anything, and its security model is a set of flags
   on a Node process rather than a capability system. A Rust core would sit behind a native module or a
   sidecar process, which is a seam we would maintain forever.
2. **Tauri 2.** OS webview, small binaries, a Rust core as the primary process, and per-command ACLs as a
   first-class capability mechanism. The webview differs by platform.
3. **Native per platform** (SwiftUI / WinUI / GTK). Best performance and platform fidelity; triples the UI
   cost and makes the design system three design systems.
4. **Rust-native GUI** (egui, Iced, Dioxus). One language throughout; the ecosystem cannot currently deliver
   the typography, glass, and motion quality the Night Atrium design requires without building a rendering
   stack ourselves.

## Decision

Tauri 2.

The deciding factor is not binary size — it is that Tauri's architecture already has the shape we need. The
Rust process is the trusted kernel and the webview is untrusted; the capability ACL system means the Permission
Broker has a real enforcement point rather than a convention. In Electron we would spend the project fighting
to establish that boundary, and in 3.0 we would still have to extract the core from the Node process.

## Consequences

**Accepted:** webview inconsistency across macOS (WebKit), Windows (WebView2), and Linux (WebKitGTK). We
mitigate with a conservative CSS baseline (a documented list of features we will not use), per-platform visual
regression snapshots, and a platform QA gate at M8. Linux WebKitGTK is the weakest of the three and is the
platform most likely to constrain a visual decision.

**Accepted:** a smaller hiring pool and a thinner ecosystem than Electron's; some problems will be solved by
us rather than by a package.

**Gained:** ~1.2 s cold start and ≤400 MB idle are plausible budgets rather than aspirations; the kernel is a
library from day one; and IPC is a typed, ACL'd command surface instead of an open channel.

**Reversal cost:** moderate. The renderer is standard React and would port; the kernel would need a process
boundary. Reversing after 2.0 (Companion pairing) would be expensive.
