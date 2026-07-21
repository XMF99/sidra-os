# CI checks

Every automated check lives here. `.github/workflows/` contains only thin triggers that call
these scripts, so a check can be run locally exactly as CI runs it (ADR-0011 places CI under
`infrastructure/`; GitHub Actions requires workflow files under `.github/workflows/`).

| Check | Script | Enforces |
|---|---|---|
| Dependency direction | [`check_dependency_direction.py`](check_dependency_direction.py) | ADR-0022 / ARCH Appendix B — `sidra-mission` must not depend on `sidra-orchestrator` |

## Running locally

```
python3 infrastructure/ci/check_dependency_direction.py .        # run the check
bash infrastructure/ci/tests/test_check_dependency_direction.sh  # test the checker
```

The dependency check uses `cargo metadata` when cargo is on `PATH`, which covers **direct and
transitive** dependencies. Without cargo it falls back to parsing manifests, which covers
**direct dependencies only** and warns on stderr. CI always runs it with a toolchain present.

Exit codes: `0` clean · `1` violation · `2` the checker could not run.

The distinction between `1` and `2` matters: a checker that cannot run must never be mistaken
for a checker that found nothing.
