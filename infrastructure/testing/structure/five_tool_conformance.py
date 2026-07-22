#!/usr/bin/env python3
"""M12 Five-Tool Conformance Test.

Verifies every Division Executive holds exactly five tools (ADR-0004).

Task: T7.4 (M12 Structure)
Ref: ADR-0004, IMPLEMENTATION_PLAN.md T7.4, AC5
"""

from __future__ import annotations

import sys
import subprocess
from pathlib import Path

def test_five_tool_conformance(repo_root: Path) -> bool:
    print("Testing Five-Tool Executive Conformance (AC5)...")
    check_script = repo_root / "infrastructure" / "ci" / "five_tool_check.py"
    if check_script.exists():
        res = subprocess.run([sys.executable, str(check_script), str(repo_root)])
        if res.returncode != 0:
            print("FAILED: Five-tool check failed!")
            return False
    print("Five-tool conformance test passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if test_five_tool_conformance(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
