#!/usr/bin/env python3
"""M10 Chaos Gate Enablement.

Wires CI to run the chaos crash & recovery harness.

Task: T1.5 (M10 Hardening)
Ref: HARDENING_AND_RELEASE_ARCHITECTURE.md §4 (GATE-8)
"""

from __future__ import annotations

import sys
import subprocess
from pathlib import Path

def check_chaos_gate(repo_root: Path) -> bool:
    print("Checking GATE-8 (Chaos & Recovery Gate)...")
    harness_path = repo_root / "infrastructure" / "testing" / "chaos" / "inject.py"
    if harness_path.exists():
        res = subprocess.run([sys.executable, str(harness_path), str(repo_root)])
        if res.returncode != 0:
            print("FAILED: Chaos recovery harness failed!")
            return False
    print("GATE-8 Chaos gate passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if check_chaos_gate(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
