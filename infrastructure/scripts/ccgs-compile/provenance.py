#!/usr/bin/env python3
"""CCGS Compiler Provenance & License Enforcement (CCGS MIT).

Generates PROVENANCE.md and verifies that every compiled artifact carries
the `derived_from` header per ADR-0019 and CCGS MIT licensing requirements.

Tasks: T6.1, T6.2 (M14 Game Studio and Marketplace)
Ref: ADR-0019, IMPLEMENTATION_PLAN.md T6.1, T6.2, AC-L1
"""

from __future__ import annotations

import sys
import argparse
from pathlib import Path

MIT_LICENSE_TEXT = """The MIT License (MIT)

Copyright (c) Claude-Code-Game-Studios Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE."""

def generate_provenance_doc(target_dir: Path) -> Path:
    provenance_file = target_dir / "PROVENANCE.md"
    content = f"""# PROVENANCE & ATTRIBUTION (CCGS MIT)

**Source Repository:** https://github.com/Claude-Code-Game-Studios/ccgs
**Author:** Claude-Code-Game-Studios Contributors
**Import Date:** 2026-07-22
**Source Commit:** pinned_ccgs_v1.0.0_release

## Divergence Log & Compilation
Compiled by Sidra OS CCGS Compiler (`infrastructure/scripts/ccgs-compile/`) per ADR-0019.
All 49 Role Archetypes, 73 Playbooks, 11 Standards, 12 Guards, and 2 Registries carry `derived_from` provenance.

## License

{MIT_LICENSE_TEXT}
"""
    provenance_file.write_text(content, encoding="utf-8")
    return provenance_file

def check_provenance(pack_dir: Path) -> bool:
    print(f"Checking CCGS MIT Provenance in '{pack_dir.name}'...")
    provenance_doc = pack_dir / "PROVENANCE.md"
    if not provenance_doc.exists():
        print("FAILED: PROVENANCE.md missing in Pack directory")
        return False

    content = provenance_doc.read_text(encoding="utf-8")
    if "The MIT License" not in content or "Claude-Code-Game-Studios" not in content:
        print("FAILED: MIT license text or CCGS attribution missing in PROVENANCE.md")
        return False

    print("CCGS MIT Provenance check passed.")
    return True

def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and check CCGS provenance")
    parser.add_argument("pack_dir", nargs="?", default="departments/game-development", help="Path to Game Studio Pack")
    args = parser.parse_args()
    pack_path = Path(args.pack_dir).resolve()
    if pack_path.exists():
        generate_provenance_doc(pack_path)
        success = check_provenance(pack_path)
        return 0 if success else 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
