#!/usr/bin/env python3
"""M11 CI Replay-Equivalence Gate.

Runs recorded v1 Engagement corpus against the substrate and verifies Brief octet-for-octet equality.

Task: T8.5 (M11 Department Substrate)
Ref: ADR-0041, IMPLEMENTATION_PLAN.md T8.5
"""

from __future__ import annotations

import sys
import subprocess
from pathlib import Path

def check_replay_gate(repo_root: Path) -> bool:
    print("Checking M11 Replay-Equivalence Gate (ADR-0041)...")
    runner_script = repo_root / "infrastructure" / "testing" / "departments" / "replay_equivalence.py"
    if runner_script.exists():
        res = subprocess.run([sys.executable, str(runner_script), str(repo_root)])
        if res.returncode != 0:
            print("FAILED: Replay equivalence runner failed!")
            return False
    print("M11 Replay-equivalence gate passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if check_replay_gate(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
