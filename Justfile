# Sidra OS Monorepo Task Runner Entry Point
# Per docs/03-folder-structure.md: build, test, eval, chaos, release

default:
    @just --list

# Build all Rust and TypeScript workspace members
build:
    cargo build --workspace
    pnpm --recursive run build

# Run unit and integration tests across all workspace members
test:
    cargo test --workspace
    pnpm --recursive run test

# Run prompt and agent evaluation benchmarks
eval:
    cargo test -p sidra-agents --evals

# Run fault-injection and kill -9 crash recovery chaos tests
chaos:
    cargo test --test chaos

# Build production artifacts and signed installers
release:
    cargo build --workspace --release
    pnpm --filter desktop run tauri build
