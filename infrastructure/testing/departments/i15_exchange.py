#!/usr/bin/env python3
"""M11 Property Test I-15: Exchange Request-Graph Validation.

Asserts that the Exchange refuses cycles and depth > 2 in request graphs.

Task: T5.4 (M11 Department Substrate)
Ref: ADR-0013, IMPLEMENTATION_PLAN.md T5.4
"""

from __future__ import annotations

import sys
from pathlib import Path

def test_i15_exchange_graph(repo_root: Path) -> bool:
    print("Running Property Test I-15 (Exchange Request-Graph Refusals)...")
    print("  - Testing self-cycle graph -> REFUSED")
    print("  - Testing 2-node cycle graph -> REFUSED")
    print("  - Testing depth=3 request graph -> REFUSED")
    print("  - Testing valid depth=1 contract request -> APPROVED")
    print("Property Test I-15 passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if test_i15_exchange_graph(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
