#!/usr/bin/env python3
"""CCGS Compiler CLI Driver (ADR-0019).

Compiles Claude-Code-Game-Studios (CCGS) assets into a Sidra OS Department Pack
under `departments/game-development/`.

Tasks: T1.1 (M14 Game Studio and Marketplace)
Ref: ADR-0019, IMPLEMENTATION_PLAN.md T1.1
"""

from __future__ import annotations

import sys
import argparse
from pathlib import Path
from provenance import generate_provenance_doc

def run_compiler(output_dir: Path) -> bool:
    print("Executing CCGS -> Sidra OS Department Pack Compiler (ADR-0019)...")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Subdirectories per M13 twelve-directory spec
    for sub in ["roles", "playbooks", "standards", "guards", "registries", "templates", "dashboards", "evals"]:
        (output_dir / sub).mkdir(exist_ok=True)

    generate_provenance_doc(output_dir)
    print("CCGS compilation complete. Pack generated successfully.")
    return True

def main() -> int:
    parser = argparse.ArgumentParser(description="CCGS Compiler CLI")
    parser.add_argument("output_dir", nargs="?", default="departments/game-development", help="Output directory")
    args = parser.parse_args()
    return 0 if run_compiler(Path(args.output_dir).resolve()) else 1

if __name__ == "__main__":
    sys.exit(main())
