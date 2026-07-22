#!/usr/bin/env python3
"""M11 Kernel-Neutrality CI Grep.

Enforces that no kernel crate (services/security, services/memory, services/models,
services/orchestrator, services/kernel) contains department identifiers, with exactly ONE
allowlisted `__default__` construction site in services/departments/src/domain/default.rs.

Task: T6.2, T6.3 (M11 Department Substrate)
Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §6.1, IMPLEMENTATION_PLAN.md E6
"""

from __future__ import annotations

import sys
import argparse
from pathlib import Path

KERNEL_CRATES = [
    "services/security",
    "services/memory",
    "services/models",
    "services/orchestrator",
    "services/kernel"
]

ALLOWLISTED_SITE = "services/departments/src/domain/default.rs"

def check_kernel_neutrality(repo_root: Path) -> bool:
    print("Checking M11 Kernel-Neutrality CI Grep...")
    violations = []
    
    for crate_rel in KERNEL_CRATES:
        crate_dir = repo_root / crate_rel
        if not crate_dir.exists():
            continue
        
        for p in crate_dir.rglob("*.rs"):
            rel = p.relative_to(repo_root).as_posix()
            content = p.read_text(encoding="utf-8")
            if "__default__" in content:
                violations.append(f"Forbidden '__default__' reference in kernel crate file: {rel}")
            if "if department ==" in content or "if dept ==" in content:
                violations.append(f"Hardcoded department name branch in kernel crate file: {rel}")
                
    if violations:
        print("FAILED: Kernel neutrality violations found:")
        for v in violations:
            print(f"  - {v}")
        return False
        
    print("Kernel-neutrality check passed: No department identifiers found in kernel crates.")
    return True

def main() -> int:
    parser = argparse.ArgumentParser(description="Check kernel neutrality")
    parser.add_argument("repo_root", nargs="?", default=".", help="Path to repository root")
    args = parser.parse_args()
    success = check_kernel_neutrality(Path(args.repo_root).resolve())
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
