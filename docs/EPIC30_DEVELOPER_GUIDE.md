# Sidra OS — Developer Guide (Epic 30)

## Comprehensive Developer Guide

Welcome to the Sidra OS developer ecosystem. This guide covers setup, building, testing, and creating custom plugins or connectors.

---

## 1. Environment Setup & Prerequisites

### Required Toolchains
- **Rust**: 1.80.0+ (`cargo`, `rustc`, `clippy`, `rustfmt`)
- **Node.js**: 20.x or 22.x LTS
- **pnpm**: 9.15.0+ (`npm i -g pnpm@9.15.0`)
- **Python**: 3.10+ (for verification test runners)

---

## 2. Monorepo Build Commands

```bash
# Clone the repository
git clone https://github.com/sidra-os/sidra-os.git
cd sidra-os

# Check dependency direction rules
node infrastructure/scripts/check-dependency-direction.js

# Check TypeScript bindings drift
node infrastructure/scripts/check-bindings-drift.js

# Format check
cargo fmt --all -- --check

# Clippy linting
cargo clippy --workspace --all-targets -- -D warnings

# Run all Rust workspace unit & integration tests
cargo test --workspace

# Build the Tauri Desktop Application & TypeScript packages
pnpm --filter @sidra/desktop build

# Run the Master Certification Suite
python infrastructure/testing/epic30_certification_suite.py
```

---

## 3. Developing Custom Plugins & Connectors

### Plugin SDK (`packages/plugin-sdk`)
Custom plugins compile to WebAssembly components (`wasm32-wasip1`) and run within the sandboxed Wasm runtime (`services/plugins/src/sandbox.rs`).

1. Define your plugin manifest (`plugin.json`).
2. Implement your tool exported function interface.
3. Declare capability grants (network egress, read-only file access).
4. Run `cargo build --target wasm32-wasip1 --release`.
