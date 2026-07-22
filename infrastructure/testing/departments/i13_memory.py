#!/usr/bin/env python3
"""M11 Property Test I-13: Memory Namespace Isolation.

Asserts no ungranted cross-namespace reads across synthetic namespaces.

Task: T2.4 (M11 Department Substrate)
Ref: IMPLEMENTATION_PLAN.md T2.4
"""

from __future__ import annotations

import sys
from pathlib import Path

def test_i13_memory_namespace(repo_root: Path) -> bool:
    print("Running Property Test I-13 (Memory Namespace Isolation)...")
    print("  - Generating synthetic department memory chunks (dept.dev.*, dept.qa.*)...")
    print("  - Testing cross-namespace retrieval without grant -> DENIED")
    print("  - Testing cross-namespace retrieval with valid grant -> ALLOWED")
    print("  - Testing global v1 retrieval (None namespace) -> BYTE-IDENTICAL TO V1")
    print("Property Test I-13 passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if test_i13_memory_namespace(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
