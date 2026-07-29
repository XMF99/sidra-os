# THEKY Phase 02 — Comprehensive Module Architecture

> **Phase 02: Product Strategy**  
> **Document:** 04-module-architecture.md  
> **Governance Authority:** [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md)  
> **Status:** APPROVED STRATEGY  

---

## 1. Module Governance & Architecture Standard

This document decomposes the 18 business domains defined in [03-domain-architecture.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/phase-02-product-strategy/03-domain-architecture.md) into concrete, decoupled software modules. Every module definition specifies major domain objects, interactions, and boundary rules compliant with [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md).

---

## 2. Module Specifications by Domain

### 2.1 Identity Domain Modules

#### Module ID-01: Directory & User Manager (`identity::directory`)
* **Purpose:** Manages identity records for human staff, AI employees, and system accounts.
* **Responsibilities:** Lifecycle management of user records, public key binding, org tree linking.
* **Major Objects:** `IdentityRecord`, `PublicKeyFingerprint`, `RoleBinding`.
* **Interactions:** Receives auth verification from `identity::auth`; feeds identity attributes to `governance::rbac`.
* **Dependencies:** None.
* **Boundaries:** Does not evaluate permission policies or store financial spend limits.
* **Future Extensibility:** Support for W3C Decentralized Identifiers (DIDs).

#### Module ID-02: Key Vault & Hardware Auth (`identity::keyvault`)
* **Purpose:** Hardware TPM / WebAuthn key integration and cryptographic signing.
* **Responsibilities:** Generating Ed25519 key pairs, verifying hardware TPM signatures, managing passkeys.
* **Major Objects:** `CryptoKeyPair`, `HardwareAttestation`, `TPMSessionToken`.
* **Interactions:** Provides signed auth tokens to `identity::directory` and `workspace::vault`.
* **Dependencies:** OS Security Frameworks (Metal/Secure Enclave/TPM 2.0).
* **Boundaries:** Zero access to unencrypted workspace disk files.
* **Future Extensibility:** Post-quantum cryptographic algorithm migration (Kyber/Dilithium).

---

### 2.2 Knowledge Domain Modules

#### Module KN-01: Sovereign Document Store (`knowledge::docstore`)
* **Purpose:** Local disk Markdown document read, write, and versioning.
* **Responsibilities:** Atomic file writes, Markdown parsing, diff generation (**INV-04**).
* **Major Objects:** `MarkdownDocument`, `DocumentVersionHeader`, `FileDiffBlock`.
* **Interactions:** Sends document text updates to `memory::vector_index`; reads templates from `knowledge::template_engine`.
* **Dependencies:** `workspace::vault`.
* **Boundaries:** Does not index semantic embeddings or enforce file permissions.
* **Future Extensibility:** Real-time Operational Transformation (OT) / CRDT collaborative editing engine.

#### Module KN-02: Document Template Engine (`knowledge::template_engine`)
* **Purpose:** Standardized document rendering for PRDs, ADRs, Briefs, and Financial Reports.
* **Responsibilities:** Template interpolation, PDF/HTML compilation, standard header injection.
* **Major Objects:** `DocumentTemplate`, `RenderedArtifact`, `HeaderMetadataBlock`.
* **Interactions:** Supplies templates to `mission::brief_compiler` and `projects::spec_engine`.
* **Dependencies:** `knowledge::docstore`.
* **Boundaries:** Pure rendering engine; zero data persistence logic.
* **Future Extensibility:** Custom developer-defined Handlebars/WebAssembly template modules.

---

### 2.3 Memory Domain Modules

#### Module ME-01: Vector Search Indexer (`memory::vector_index`)
* **Purpose:** Local semantic vector embedding generation and HNSW similarity search.
* **Responsibilities:** Text chunking, embedding generation, local HNSW index maintenance (**INV-06**).
* **Major Objects:** `VectorEmbedding`, `HNSWIndexHeader`, `SemanticSearchResult`.
* **Interactions:** Receives text updates from `knowledge::docstore`; provides graph context to `ai::router`.
* **Dependencies:** Local ONNX / NPU embedding runtime.
* **Boundaries:** Local memory only; zero cloud upload of raw embeddings.
* **Future Extensibility:** Dynamic hardware offloading to Apple Silicon Neural Engine or CUDA.

#### Module ME-02: Organizational Knowledge Graph (`memory::graph`)
* **Purpose:** Relationships between projects, decisions, personas, and code files.
* **Responsibilities:** Entity extraction, dependency mapping, context query resolution.
* **Major Objects:** `GraphNode`, `GraphEdge`, `ContextSubGraph`.
* **Interactions:** Serves context sub-graphs to `mission::intent_parser` and `ai::orchestrator`.
* **Dependencies:** `memory::vector_index`.
* **Boundaries:** Read-only context query engine.
* **Future Extensibility:** Graph neural network (GNN) entity reasoning layers.

---

### 2.4 Mission Domain Modules

#### Module MI-01: Intent Decomposition Engine (`mission::intent_parser`)
* **Purpose:** Parses high-level human intent statements into executable mission graphs.
* **Responsibilities:** Intent classification, goal breakdown, department routing (**INV-01**).
* **Major Objects:** `HumanIntentStatement`, `MissionGraph`, `TaskDependencyNode`.
* **Interactions:** Queries context from `memory::graph`; dispatches tasks to `ai::orchestrator`.
* **Dependencies:** `ai::router`, `governance::fence`.
* **Boundaries:** Does not directly write code files or issue financial payments.
* **Future Extensibility:** Multi-intent pipeline queuing and background priority scheduling.

#### Module MI-02: Executive Brief Compiler (`mission::brief_compiler`)
* **Purpose:** Consolidates multi-agent execution outputs into ONE decision-ready brief (**INV-07**).
* **Responsibilities:** Output aggregation, risk highlighting, single decision prompt rendering.
* **Major Objects:** `ExecutiveBrief`, `DecisionPrompt`, `RiskSummaryBlock`.
* **Interactions:** Receives reviewed outputs from `ai::reviewer`; dispatches briefs to `communication::queue`.
* **Dependencies:** `knowledge::template_engine`.
* **Boundaries:** Does not approve briefs; renders briefs for human sign-off only.
* **Future Extensibility:** Adaptive brief summaries customized to persona preferences.

---

### 2.5 Workspace Domain Modules

#### Module WS-01: Vault Manager & Encryption (`workspace::vault`)
* **Purpose:** Encrypted local workspace directory vault management.
* **Responsibilities:** AES-256-GCM encryption/decryption, hardware key locking, directory sandboxing.
* **Major Objects:** `WorkspaceVaultConfig`, `VaultMasterKey`, `DirectorySandboxBoundary`.
* **Interactions:** Authenticates keys via `identity::keyvault`; provides decrypted disk handle to `knowledge::docstore`.
* **Dependencies:** OS Crypto API / Hardware TPM.
* **Boundaries:** Local file access manager; zero network communication capability.
* **Future Extensibility:** Multi-vault concurrent mounting and zero-knowledge cloud backup.

---

### 2.6 People Domain Modules

#### Module PE-01: Org Hierarchy & Charter Engine (`people::org_manager`)
* **Purpose:** Manages the 9-level organizational hierarchy and agent charters.
* **Responsibilities:** Maintaining org tree nodes, defining agent role boundaries and budgets.
* **Major Objects:** `OrgTreeNode`, `AgentCharter`, `CapabilityBoundarySpec`.
* **Interactions:** Supplies org rules to `governance::rbac`; feeds charters to `ai::orchestrator`.
* **Dependencies:** `identity::directory`.
* **Boundaries:** Configuration store; zero policy enforcement logic (delegated to Governance).
* **Future Extensibility:** Dynamic department charter generation from enterprise policy docs.

---

### 2.7 AI Orchestration Domain Modules

#### Module AI-01: Multi-Layer Model Router (`ai::router`)
* **Purpose:** 7-parameter deterministic compute routing across 4 layers (**INV-09**).
* **Responsibilities:** Privacy tier enforcement, latency estimation, model adapter selection.
* **Major Objects:** `RoutingVector`, `ModelProviderSpec`, `ExecutionPlan`.
* **Interactions:** Checks egress policy with `governance::egress`; dispatches model calls to provider adapters.
* **Dependencies:** `finance::budget_manager`.
* **Boundaries:** Execution proxy; zero persistence logic.
* **Future Extensibility:** Real-time provider spot-price optimization.

#### Module AI-02: Independent Reviewer Gate (`ai::reviewer`)
* **Purpose:** Independent QA, Security, and Architecture audit gates (**INV-02**).
* **Responsibilities:** Author vs Reviewer identity separation, test suite execution, risk verification.
* **Major Objects:** `ReviewerAuditReport`, `VerificationScore`, `RiskFlag`.
* **Interactions:** Audits outputs from `ai::orchestrator`; passes verified briefs to `mission::brief_compiler`.
* **Dependencies:** `projects::test_runner`, `ai::router`.
* **Boundaries:** Strictly auditing; reviewer agents cannot self-author content.
* **Future Extensibility:** Multi-model consensus voting (e.g., Claude + GPT-4o joint verification).

---

### 2.8 Finance Domain Modules

#### Module FI-01: Token Budget & Spend Manager (`finance::budget_manager`)
* **Purpose:** Department compute spend caps and model token budget enforcement.
* **Responsibilities:** Real-time spend tracking, daily cap checks, budget elevation requests.
* **Major Objects:** `DepartmentBudgetCap`, `SpendLedgerEntry`, `CapViolationAlert`.
* **Interactions:** Checked by `ai::router` prior to cloud API bursts; notifies `communication::queue` on cap limits.
* **Dependencies:** `automation::hash_ledger`.
* **Boundaries:** Spend manager; zero direct credit card processing logic.
* **Future Extensibility:** Predictive token burn rate modeling.

---

### 2.9 Sales Domain Modules

#### Module SA-01: Prospect Intelligence Engine (`sales::prospect_intelligence`)
* **Purpose:** Automated enterprise prospect intelligence compilation.
* **Responsibilities:** Synthesizing public prospect context, compiling account briefs.
* **Major Objects:** `ProspectDossier`, `AccountContextMap`, `RFPComplianceMatrix`.
* **Interactions:** Queries `memory::graph`; feeds compiled briefs to `mission::brief_compiler`.
* **Dependencies:** `ai::router`, `knowledge::docstore`.
* **Boundaries:** Synthesis tool; zero outbound spam communications capability.
* **Future Extensibility:** CRM automated deal pipeline health scoring.

---

### 2.10 Projects Domain Modules

#### Module PR-01: Task Graph & Spec Engine (`projects::spec_engine`)
* **Purpose:** Requirement decomposition, PRD tracking, and sprint task graph generation.
* **Responsibilities:** Feature decomposition, spec validation, git branch mapping.
* **Major Objects:** `ProductRequirementDoc`, `TaskExecutionGraph`, `GitBranchMapping`.
* **Interactions:** Receives objectives from `mission::intent_parser`; dispatches dev tasks to `ai::orchestrator`.
* **Dependencies:** `knowledge::docstore`.
* **Boundaries:** Spec manager; zero direct git repository push logic without reviewer gate.
* **Future Extensibility:** Automated PRD gap analysis using historical bug databases.

---

### 2.11 Automation Domain Modules

#### Module AU-01: Immutable Ledger Engine (`automation::hash_ledger`)
* **Purpose:** Cryptographic hash-chained append-only event logging (**INV-03**).
* **Responsibilities:** SHA-256 hash calculation, event block signing, ledger verification.
* **Major Objects:** `HashLedgerBlock`, `BlockHeader`, `MerkleTreeRoot`.
* **Interactions:** Receives events from all domains; provides audit verification to `compliance::auditor`.
* **Dependencies:** `identity::keyvault`.
* **Boundaries:** Append-only ledger; zero record modification or deletion capability.
* **Future Extensibility:** Zero-knowledge proof (ZKP) ledger validation streams.

---

### 2.12 Communication Domain Modules

#### Module CO-01: Executive Brief Queue (`communication::queue`)
* **Purpose:** Asynchronous decision queue rendering and brief alert routing.
* **Responsibilities:** Maintaining pending brief queues, mobile push notification dispatch.
* **Major Objects:** `DecisionQueue`, `BriefNotificationItem`, `SignOffPayload`.
* **Interactions:** Receives briefs from `mission::brief_compiler`; dispatches signed decisions to `governance::rbac`.
* **Dependencies:** `mission::brief_compiler`.
* **Boundaries:** Renders briefs; zero direct decision approval authority.
* **Future Extensibility:** Cross-device peer-to-peer brief queue synchronization.

---

### 2.13 Analytics Domain Modules

#### Module AN-01: Local System Observability (`analytics::telemetry`)
* **Purpose:** Local system health, latency metrics, and performance analytics.
* **Responsibilities:** System frame latency tracking, token velocity monitoring, health scoring.
* **Major Objects:** `PerformanceMetricSnapshot`, `TokenVelocityMetric`, `SystemHealthScore`.
* **Interactions:** Collects metrics from `ai::router` and `workspace::vault`.
* **Dependencies:** None.
* **Boundaries:** Local memory storage; zero cloud upload without explicit policy consent.
* **Future Extensibility:** Automated local NPU bottleneck detection.

---

### 2.14 Administration Domain Modules

#### Module AD-01: License & Fleet Policy Engine (`admin::license_manager`)
* **Purpose:** Hardware UUID license validation and IT policy synchronization.
* **Responsibilities:** Validating license keys, parsing enterprise administrative policy pushes.
* **Major Objects:** `LicenseKeyCertificate`, `FleetPolicyDocument`, `EnterpriseTierFeatureMap`.
* **Interactions:** Enables/disables system capabilities based on license tier.
* **Dependencies:** `identity::keyvault`.
* **Boundaries:** License check; zero payment processing logic.
* **Future Extensibility:** Offline air-gapped enterprise license renewal validation.

---

### 2.15 Governance Domain Modules

#### Module GO-01: Policy-Based Access Evaluator (`governance::pbac`)
* **Purpose:** RBAC, ABAC, and PBAC capability token evaluation (**INV-05**, **INV-08**).
* **Responsibilities:** Evaluating capability access tokens, verifying multi-sig sign-offs.
* **Major Objects:** `CapabilityAccessRequest`, `EvaluationResult`, `MultiSigPolicyRule`.
* **Interactions:** Evaluates requests from all domains; queries identities from `identity::directory`.
* **Dependencies:** `identity::directory`, `automation::hash_ledger`.
* **Boundaries:** Policy evaluator; zero user UI interaction logic.
* **Future Extensibility:** Formal verification logic for complex legal governance policies.

---

### 2.16 Compliance Domain Modules

#### Module CM-01: Compliance & Evidence Collector (`compliance::auditor`)
* **Purpose:** Regulatory evidence extraction, DSAR processing, and legal hold locks.
* **Responsibilities:** Compiling SOC 2 evidence packages, executing cryptographic right-to-be-forgotten purges.
* **Major Objects:** `EvidenceArchivePackage`, `DSARRequest`, `LegalHoldLockConfig`.
* **Interactions:** Queries `automation::hash_ledger` and `workspace::vault`.
* **Dependencies:** `automation::hash_ledger`.
* **Boundaries:** Audit engine; zero authority to alter historical hash blocks.
* **Future Extensibility:** Real-time HIPAA / FedRAMP automated compliance reporting.

---

### 2.17 Marketplace Domain Modules

#### Module MP-01: Agent Pack Catalog Manager (`marketplace::catalog`)
* **Purpose:** Browsing, verifying, and installing certified synthetic agent packs.
* **Responsibilities:** Presenting local agent catalogs, validating pack digital signatures.
* **Major Objects:** `AgentPackManifest`, `DigitalSignatureCertificate`, `InstalledPackRegistry`.
* **Interactions:** Installs verified modules into `people::org_manager` and `ai::orchestrator`.
* **Dependencies:** `admin::license_manager`.
* **Boundaries:** Local catalog manager; zero web scraping or unverified pack installation.
* **Future Extensibility:** Peer-to-peer decentralized agent pack sharing.

---

### 2.18 Developer Platform Domain Modules

#### Module DP-01: Agent Charter CLI & Sandbox (`devplatform::sandbox`)
* **Purpose:** Developer SDK, CLI testing tools, and sandboxed capability fence testing.
* **Responsibilities:** Simulating agent execution, testing capability fence violations.
* **Major Objects:** `SandboxTestEnvironment`, `FenceViolationReport`, `CompiledPackArchive`.
* **Interactions:** Uses `governance::pbac` to test fence boundaries.
* **Dependencies:** `workspace::vault`.
* **Boundaries:** Isolated developer sandbox; zero access to production workspace data.
* **Future Extensibility:** Automated IDE extension plugins for visual agent charter debugging.

---
