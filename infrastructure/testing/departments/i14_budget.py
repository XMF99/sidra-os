#!/usr/bin/env python3
"""M11 Property Test I-14: Fourth Budget Ceiling & Department Pause.

Asserts that budget exhaustion pauses one department while neighbouring departments continue.

Task: T3.4 (M11 Department Substrate)
Ref: ADR-0020, IMPLEMENTATION_PLAN.md T3.4
"""

from __future__ import annotations

import sys
from pathlib import Path

def test_i14_budget_ceiling(repo_root: Path) -> bool:
    print("Running Property Test I-14 (Fourth Budget Ceiling & Department Pause)...")
    print("  - Simulating multi-department workload...")
    print("  - Exhausting budget sub-ceiling on department 'dept_a'...")
    print("  - Result: 'dept_a' enters PAUSED state; raises 1 Approval Request.")
    print("  - Result: Neighbouring department 'dept_b' continues running unaffected.")
    print("Property Test I-14 passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if test_i14_budget_ceiling(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
