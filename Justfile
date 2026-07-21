# Sidra OS Monorepo Commands

default:
	@just --list

lint:
	cargo fmt --all -- --check
	cargo clippy --workspace --all-targets -- -D warnings

deny:
	cargo deny check

check-deps:
	node infrastructure/scripts/check-dependency-direction.js

check-bindings:
	node infrastructure/scripts/check-bindings-drift.js

test:
	cargo test --workspace

sbom:
	node infrastructure/scripts/generate-sbom.js

verify-all: check-deps check-bindings lint deny test sbom
	node infrastructure/scripts/verify-all-invariants.js
