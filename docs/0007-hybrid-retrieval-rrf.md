# ADR-0007 — Hybrid retrieval with reciprocal-rank fusion

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Retrieval quality determines Brief quality more than any other single factor. The Vault contains a mixture of
prose, code, tables, meeting Minutes, and Decisions. Queries are correspondingly mixed: conceptual ("what did
we decide about pricing"), lexical ("the `budget_exceeded` error"), and identifier-shaped ("ENG-4471").

## Options

1. **Vector search only.** Strong on paraphrase and concept; unreliable on rare tokens, identifiers, error
   codes, and exact names — which is a large fraction of real queries in a technical Vault.
2. **Lexical (BM25) only.** Exact and explainable; fails on paraphrase, which is most of how people ask.
3. **Hybrid with weighted score fusion.** Requires normalising two incomparable score distributions; the
   weights need retuning whenever the embedding model changes.
4. **Hybrid with reciprocal-rank fusion.** Combines ranks rather than scores, so no normalisation is needed
   and it is insensitive to embedding-model swaps.

## Decision

Run both retrievers in parallel, fuse with RRF (`k = 60`), then apply MMR (`λ = 0.7`) for diversity, then cap
retrieved context at 40% of the frame with a relevance floor. Every included chunk carries its provenance and
its score into the Turn.

## Consequences

**Accepted:** two indexes to maintain and keep consistent (`sqlite-vec` and FTS5), both updated in the same
transaction as the source chunk.

**Accepted:** RRF discards score magnitude, so a result that one retriever is overwhelmingly confident about
is treated as merely first. In practice this is a feature — it prevents a single over-confident retriever from
dominating — but it is a real loss of signal, and it is why a `worker`-class reranker is the designated
upgrade path if evaluation shows a ceiling.

**Accepted:** roughly double the retrieval latency of a single method. Measured budget is p95 ≤120 ms on a
100k-chunk corpus, which the parallel execution keeps within reach.

**Gained:** robustness across query types without per-query-type routing logic.

**Gained:** changing the embedding model requires re-embedding but no retuning, because there are no weights.

**Gated by:** the retrieval evaluation set. Hybrid must beat both baselines on recall@10 or this decision is
wrong and gets superseded.
