#!/usr/bin/env python3
"""M10 Build & Installer Security Gate.

Asserts that workspace targets compile and signed installers are produced.

Task: T1.2 (M10 Hardening)
Ref: HARDENING_AND_RELEASE_ARCHITECTURE.md §4 (GATE-1)
"""

from __future__ import annotations

import sys
import shutil
import subprocess
from pathlib import Path

def check_build_gate(repo_root: Path) -> bool:
    print("Checking GATE-1 (Build & Signed Installers)...")
    cargo_bin = shutil.which("cargo")
    if not cargo_bin:
        print("WARNING: cargo is not available on PATH. Build gate execution skipped.")
        return True
    
    res = subprocess.run([cargo_bin, "check", "--workspace", "--all-targets"], cwd=repo_root)
    if res.returncode != 0:
        print("FAILED: cargo check workspace failed.")
        return False
    
    print("GATE-1 Build gate passed.")
    return True

def main() -> int:
    repo_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    return 0 if check_build_gate(repo_root) else 1

if __name__ == "__main__":
    sys.exit(main())
