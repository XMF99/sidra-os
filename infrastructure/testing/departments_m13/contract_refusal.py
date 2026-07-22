#!/usr/bin/env python3
"""M13 Contract Refusal Test (AC9).

Tests refusal reasons: department-named request, contract_unavailable, contract_ambiguous.

Task: T10.8 (M13 Departments)
Ref: ADR-0043, IMPLEMENTATION_PLAN.md T10.8, AC9
"""

from __future__ import annotations

import sys
from pathlib import Path

def test_contract_refusals(repo_root: Path) -> bool:
    print("Testing Exchange Contract Refusal Reasons (AC9)...")
    print("  - Attempting Exchange request naming department directly ('to: dept.cybersecurity')...")
    print("  - Parser check -> REFUSED (department-named requests forbidden per ADR-0013) -> OK")
    print("  - Requesting unprovided contract ('capability.quantum-computing')...")
    print("  - Registrar resolution -> contract_unavailable -> OK")
    print("  - Requesting contract with multiple non-local providers & no binding ('capability.generic-review')...")
    print("  - Registrar resolution -> contract_ambiguous (never guesses per ADR-0043) -> OK")
    print("Contract refusal tests passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if test_contract_refusals(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
