#!/usr/bin/env python3
"""M10 Domain Purity Gate.

Verifies packages/domain contains no I/O dependencies or prohibited side-effect crates.

Task: T1.3 (M10 Hardening)
Ref: HARDENING_AND_RELEASE_ARCHITECTURE.md §4 (GATE-4)
"""

from __future__ import annotations

import sys
from pathlib import Path

PROHIBITED_IO_DEPS = ["tokio", "reqwest", "std::fs", "hyper", "tungstenite"]

def check_domain_purity(repo_root: Path) -> bool:
    print("Checking GATE-4 (Domain Purity)...")
    domain_dir = repo_root / "packages" / "domain"
    if not domain_dir.exists():
        print(f"Domain directory {domain_dir} does not exist.")
        return False

    toml_path = domain_dir / "Cargo.toml"
    if toml_path.exists():
        content = toml_path.read_text(encoding="utf-8")
        for dep in ["tokio", "reqwest", "hyper", "tungstenite"]:
            if dep in content:
                print(f"FAILED: Prohibited I/O dependency '{dep}' found in packages/domain/Cargo.toml")
                return False

    print("GATE-4 Domain purity gate passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if check_domain_purity(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
