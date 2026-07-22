# ADR-0048 — Object-storage addressing, chunking, and size limits

**Status:** Proposed · **Date:** 2.5 "Field" — M17

## Context

Four of the five first-party connectors (`git`, `issues`, `calendar`, `mail`) exchange small JSON payloads
that fit the M16 framework's default in-memory request shape without comment. The fifth — `object-storage` —
does not. Object storage moves the Firm's artifacts, datasets, and build outputs: bodies routinely in the
tens or hundreds of megabytes, occasionally gigabytes. Two framework assumptions that hold trivially for the
other four need an explicit contract here.

**Addressing and egress.** S3 offers two addressing styles. *Virtual-host style* puts the bucket in the host
(`{bucket}.s3.amazonaws.com`), which would make the connector's reachable host set depend on the bucket name —
an unbounded, effectively-wildcard egress surface, since any bucket name yields a new host. M16 install check
#6 forbids an egress entry "broader than a registrable domain" precisely to prevent wildcard reach (M16 §5.4),
and ADR-0036 makes the declared host set the connector's entire outbound surface. A per-bucket host set cannot
be declared in advance.

**Payload size and the request shape.** The M16 invocation pipeline (host §6) builds a request and hands it
through custody and egress. For a small JSON body this is a value in memory. For a multi-gigabyte object,
buffering the whole body in the connector host's address space would spike memory and could stall the Mission
scheduler (which M16 §15 promises connector calls never do). And a `put_object` interrupted mid-transfer by an
outage (ADR-0047 requires clean offline failure) must not leave a half-written object that later reconciliation
has to detect and clean up.

Neither is a new framework mechanism — they are the object-storage connector's *manifest and behavioural
contract* within the existing framework. But they are decisions, not defaults, so they are recorded.

## Options

1. **Virtual-host addressing + whole-body buffering.** The idiomatic S3 client shape. Rejected on both counts:
   the host set becomes bucket-dependent (unbounded egress, fails install check #6), and large bodies buffer in
   memory (memory spike, scheduler risk).
2. **Path-style addressing + whole-body buffering.** Fixes egress (one host) but still buffers gigabytes.
   Rejected on the size half.
3. **Path-style addressing + bounded-chunk streaming + multipart with a declared max object size.** The bucket
   is a path parameter under a single declared host; large transfers stream in bounded chunks; oversized puts
   use multipart with an abort-on-failure guarantee; a maximum object size is a manifest fact refused before
   any egress. Both problems solved within the existing framework, at the cost of an object-storage-specific
   request-shape contract.

## Decision

Option 3. The `object-storage` connector's contract:

**Addressing — one declared host.** The connector uses **path-style addressing**: the reachable host is
`s3.amazonaws.com`, and the bucket is a path parameter (`/{bucket}/{key}`), never part of the host.
`[egress].allow` therefore contains exactly one entry, `s3.amazonaws.com`, and satisfies M16 install check #6
with the tightest possible surface. A crafted or malicious bucket name is a path parameter (inspected per
security model §7.5), and cannot redirect egress off the declared host — closing the SSRF-via-bucket-name
vector (architecture §9, F2).

**Chunking and streaming.** `get_object` and `put_object` stream through the egress boundary in bounded chunks
(default **8 MiB**) rather than buffering the whole object in the connector host's memory. Streaming is within
the existing egress dispatch path; no new outbound mechanism is introduced.

**Multipart with abort-on-failure.** A `put_object` above the chunk threshold uses S3 multipart upload. A
failure mid-upload — including an outage that triggers the ADR-0047 offline path — **aborts** the multipart
session, so no partial object becomes visible. Recovery re-dispatches a clean fresh upload, never a resume of a
half-written object.

**Declared maximum object size.** A ceiling (default **5 GiB**) is a manifest fact. A `put_object` whose body
exceeds it is refused **before any egress**, with the limit named — a hard refusal in the manifest-check
spirit, not a runtime surprise partway through a transfer.

**Signing at the boundary.** The connector's `api_key` is an AWS access-key pair; **the kernel computes the
SigV4 signature at the egress boundary** (custody, ADR-0034). The connector never sees the secret and never
signs — the api-key custody path applied to a request-signing scheme, reaching the same guarantee the same way.

## Consequences

**Accepted: `object-storage` has a request-shape contract the other four connectors do not.** Streaming,
multipart, and a size ceiling are object-storage-specific manifest and behaviour. Real, contained cost: it
lives in one connector and its optional transform, not in the framework.

**Accepted: path-style addressing is required, not optional, for this connector.** Some S3-compatible
endpoints prefer virtual-host style; the connector mandates path-style so egress stays one declared host. An
endpoint that cannot serve path-style is not usable by this connector without a new ADR revisiting the egress
trade-off.

**Gained: egress stays a single declared host regardless of how many buckets the Firm uses.** The wildcard
surface virtual-host style would create never exists; ADR-0036 and install check #6 hold with one entry.

**Gained: large transfers do not spike memory or stall the scheduler.** Bounded-chunk streaming keeps a
gigabyte upload within the same per-call timeout and memory profile as any other connector call (architecture
§10).

**Gained: offline `put_object` loses nothing and leaves nothing to reconcile.** Multipart abort means there is
no orphaned partial object; the ADR-0047 no-buffer contract composes cleanly — the interrupted upload is simply
absent, and the Work Order re-dispatches a fresh one.

**Reversal cost: low.** Addressing, chunk size, and max size are manifest and connector-local behaviour;
changing the chunk threshold or the ceiling is a manifest edit and a re-run of the conformance suite, touching
no kernel code and no other connector.
