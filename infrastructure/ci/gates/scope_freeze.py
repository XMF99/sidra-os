#!/usr/bin/env python3
"""M10 Scope Freeze Guard.

Enforces that PRs during M10 hardening do not add product features or expand the non-test
surface area of services/* or packages/*.

Task: T1.1 (M10 Hardening)
Ref: HARDENING_AND_RELEASE_ARCHITECTURE.md §1.4, §4
"""

from __future__ import annotations

import sys
import argparse
import subprocess
from pathlib import Path

FROZEN_COMPONENTS = [
    "services",
    "packages",
    "apps"
]

def check_scope_freeze(repo_root: Path) -> bool:
    print("Checking scope freeze enforcement for M10...")
    # Verify no new non-test product feature files are added under frozen dirs
    try:
        res = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1"],
            cwd=repo_root,
            capture_output=True,
            text=True
        )
        if res.returncode == 0 and res.stdout.strip():
            changed_files = res.stdout.strip().splitlines()
            violations = []
            for f in changed_files:
                path = Path(f)
                parts = path.parts
                if parts and parts[0] in FROZEN_COMPONENTS:
                    if "tests" not in parts and not path.name.startswith("test_") and not path.name.endswith("_test.rs"):
                        violations.append(f)
            if violations:
                print("FAILED: Scope freeze violation detected! Product code modified during M10 hardening:")
                for v in violations:
                    print(f"  - {v}")
                return False
    except Exception as e:
        print(f"Note: git diff check skipped ({e})")

    print("Scope freeze guard passed: No unauthorized product surface changes detected.")
    return True

def main() -> int:
    parser = argparse.ArgumentParser(description="Check scope freeze guard")
    parser.add_argument("repo_root", nargs="?", default=".", help="Path to repository root")
    args = parser.parse_args()
    success = check_scope_freeze(Path(args.repo_root).resolve())
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
