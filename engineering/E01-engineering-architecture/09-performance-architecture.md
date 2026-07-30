# THEKY Engineering Architecture: Performance Architecture

**Document ID:** `E01-09`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/09-performance-architecture.md`  

---

## 1. Non-Negotiable Performance Budgets (ADR-0016)

Performance is treated as a hard system gate. Exceeding a budget is classified as a build failure in CI.

| Performance Metric | Target Budget | Hard Maximum Threshold | Enforcement Mechanism |
|---|---|---|---|
| **Cold Start Time** | ≤ 800 ms | **≤ 1200 ms** | Automated E2E CI Benchmark Gate |
| **UI Frame Rate** | 60 FPS (16.6ms/frame) | **≥ 55 FPS** | Chrome DevTools Protocol CI Gate |
| **System Idle RAM** | ≤ 280 MB | **≤ 400 MB** | Native OS Heap Memory Monitor |
| **IPC Roundtrip Latency** | ≤ 2 ms | **≤ 5 ms** | Criterion Microbenchmarks |
| **Brief Generation Time** | ≤ 1000 ms | **≤ 2000 ms** | AI Runtime Span Benchmark |
| **Event Append Throughput**| ≥ 5,000 events/sec | **≥ 2,000 events/sec** | SQLite Ingest Microbenchmark |

---

## 2. Memory Sub-Budget Allocation

To remain strictly under the **400 MB idle memory limit**, memory is explicitly allocated across processes:

```
+-----------------------------------------------------------------------------------+
| MAXIMUM IDLE MEMORY ALLOCATION (400 MB TOTAL CAP)                                 |
+-----------------------------------------------------------------------------------+
|  1. MAIN TAURI HOST PROCESS (Rust Core & SQLite Pool):   Max 180 MB               |
|  2. RENDER PROCESS (React Webview Engine):               Max 140 MB               |
|  3. AI ENGINE BUFFER (Sidecar IPC & Vector Cache):        Max  60 MB               |
|  4. OS HEADROOM & IPC BUFFERS:                           Max  20 MB               |
+-----------------------------------------------------------------------------------+
```

---

## 3. Profiling & Continuous Benchmarking Strategy

```
                          CONTINUOUS PROFILING SUITE
                                       |
    +----------------------------------+----------------------------------+
    |                                  |                                  |
    v                                  v                                  v
[ RUST BENCHMARKS ]           [ FRONTEND TRACING ]             [ IPC BENCHMARKS ]
- `criterion` harness         - Chrome DevTools Protocol       - Tokio Tracing Spans
- Memory allocation tracking   - Layout shift & FPS audit       - Serialization cost
- Event store IO throughput   - JS Heap Snapshot               - IPC Payload Overhead
```

### 3.1 Profiling Tools & Commands
- **Rust Backend:** Profiling executed via `cargo flamegraph` and `criterion` microbenchmarks located in `infrastructure/benchmarks`.
- **Frontend UI:** Profiled via Lighthouse CI headless runs and Chrome DevTools Protocol frame rate counters.
- **CI Performance Gate:** Commits that cause a > 5% regression in cold start latency or memory consumption are automatically rejected.

---
