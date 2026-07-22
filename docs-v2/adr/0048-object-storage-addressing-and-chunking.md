# ADR-0048 — Object-storage addressing, streaming, and chunking contract

**Status:** Accepted · **Date:** 2.5 "Field" — M17

## Context

The `object-storage` connector (S3-compatible) poses unique challenges among the five connectors:
1. **Host addressing:** S3 supports virtual-host addressing (`bucket.s3.amazonaws.com`) and path-style
   addressing (`s3.amazonaws.com/bucket`). Virtual-host addressing would require wildcard egress declarations
   (`*.s3.amazonaws.com`), violating M16 install check #6 ("no wildcard host declarations").
2. **Payload size:** Large files (up to gigabytes) cannot be buffered in Wasm sandbox memory (M9/M16 caps
   sandbox memory at 64 MiB). Streaming in bounded chunks is required.
3. **Authentication:** AWS SigV4 requires signing headers with an access key and secret key. Per ADR-0034,
   credentials are held by the kernel and never exposed to the connector.

## Options

1. **Virtual-host addressing + in-memory payload buffering.** Requires wildcard egress rules; crashes on files
   > 64 MiB. Rejected.
2. **Path-style single-host addressing + kernel SigV4 signing + 8 MiB bounded chunking with multipart abort.**
   - Egress declared as single host `s3.amazonaws.com` (path-style).
   - Kernel holds AWS secret and signs requests at the boundary (SigV4).
   - Payloads stream in bounded 8 MiB chunks. Large uploads use S3 multipart upload with mandatory `AbortMultipartUpload` on any failure (preventing orphan storage costs).
3. **Direct AWS SDK integration in Wasm.** Exposes credentials to Wasm, violates ADR-0034. Rejected.

## Decision

Option 2.

**Contract for `object-storage` connector:**
- **Addressing:** Path-style addressing only (`https://s3.amazonaws.com/{bucket}/{key}`). Manifest declares `[egress].allow = ["s3.amazonaws.com"]`.
- **Credential Custody:** AWS Access Key ID and Secret Access Key held by kernel custody. Kernel performs SigV4 request signing prior to egress.
- **Chunking & Streaming:** Max payload per request chunk is 8 MiB. Uploads exceeding 8 MiB use multipart upload.
- **Multipart Abort:** Any interrupted or failed multipart upload issues `AbortMultipartUpload` to delete partial chunks immediately. No partial or orphan objects remain on S3 (AC-O3).

## Consequences

**Accepted:** Bucket names appear in request paths, keeping host declarations strictly single-domain.
**Gained:** Zero credential leakage to sandbox. Zero memory overflow on gigabyte-scale transfers. Zero orphan partial uploads on network failure.
