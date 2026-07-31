# THEKY PRODUCT BIBLE — OFFICIAL PRODUCT DESIGN & EXPERIENCE GUIDELINES

**Role:** Chief Product Officer • Design Director • UX Governor • Product Quality Authority  
**Document Code:** `THEKY_PRODUCT_BIBLE.md`  
**Status:** **SUPREME PRODUCT DESIGN & EXPERIENCE GOVERNANCE HANDBOOK**

$$\begin{matrix}
\text{Product Manifesto (U0)} & \longrightarrow & \text{UX Architecture (U1)} & \longrightarrow & \text{Product Blueprint (U2)} \\
& & \Downarrow & & \\
\text{Design System (U4)} & \longleftarrow & \text{Wireframes (U3)} & \longleftarrow & \mathbf{THEKY\ Product\ Bible\ (U4.5)}
\end{matrix}$$

---

## SECTION 1: PRODUCT PHILOSOPHY & ARCHITECTURAL UNIFICATION

THEKY’s design hierarchy connects five foundational pillars into one cohesive operating system:

1. **The Manifesto (`THEKY_PRODUCT_MANIFESTO.md`)**: The constitutional philosophy establishing THEKY as an AI-Native Operating System dedicated to human amplification, zero ERP fatigue, and cryptographic evidence.
2. **Experience Architecture (`UX_2_PRODUCT_ARCHITECTURE.md`)**: The structural vision defining the transition from solo productivity to multi-tenant enterprise orchestration.
3. **Product Blueprint (`UX_3_PRODUCT_BLUEPRINT.md`)**: The detailed specification of all 22 primary screens, micro-interactions, and 12 industry personalizations.
4. **Wireframe Architecture (`UX_4_WIREFRAME_ARCHITECTURE.md`)**: The structural spatial layout maps, universal site map, and 20+ user interaction flows.
5. **Design System (`UX_5_DESIGN_SYSTEM.md`)**: The visual tokens, HSL color palette, typography scales, baseline spacing grid, and motion rules.

$$\mathbf{Governance\ Mandate:} \quad \text{Whenever any pull request or design proposal conflicts with this handbook, THEKY Product Bible wins.}$$

---

## SECTION 2: THE 12 UX COMMANDMENTS

1. **One Primary Purpose Per Screen**: Every view must answer what the user is meant to accomplish without competing visual calls-to-action.
2. **Never Overload the User**: Maximum 3 primary focus regions per canvas. Secondary information lives in context drawers.
3. **Every Action Must Be Reversible**: Provide undo buffers, confirmation modals for destructive changes, and Vault audit rollback logs.
4. **Expose Progress for Long Tasks**: Any background operation taking $>500\text{ms}$ must expose a progress ring or execution log.
5. **Expose Evidence for All AI Output**: Every AI response must cite its source provenance and Knowledge Graph node ID (`KG-NODE-xxxx`).
6. **Every Metric Must Have a Verified Source**: No static or fabricated numbers. If a metric is unbacked, explicitly state **`Not Configured`**.
7. **Zero Fake Loading or Artifical Delay**: Never insert artificial delays for visual effect. If an operation takes 10ms, return in 10ms.
8. **Zero Fake AI Execution**: Every reported agent execution must represent real model compute or verified backend execution.
9. **Keyboard Accessibility by Default**: Every action must be triggerable via standard keyboard shortcuts (`Ctrl+K`, `g d`, `g m`, `Tab`).
10. **Explainability Before Complexity**: Users must always be able to inspect *"Why did AI make this decision?"*.
11. **Security & Boundary Isolation**: Permission Broker capability tokens must be verified before granting resource access.
12. **Radical Calmness**: Avoid bright flashing red banners, panic dialogs, or aggressive toast spam.

---

## SECTION 3: NAVIGATION RULES

- **Maximum Navigation Depth**: Maximum **3 structural levels** deep (`Tenant > Department/Project > Detail Canvas`).
- **Sidebar Rules**: Left navigation rail must remain persistent or collapsible (`240px` expanded / `64px` icon mode); never hide the brand logo or tenant switcher.
- **Context Drawer Rules**: Slide-out context drawer (right pane) is reserved for telemetry, file specs, and evidence details; it must never obscure the main work canvas.
- **Command Palette (`Ctrl+K`) Rules**: Overlays center top (`640px` max width); executes instant navigation, mode switching, or direct AI query.
- **Universal Search Rules**: Searches across all entities simultaneously; highlights keyword matches with vector similarity scores.
- **Breadcrumb Rules**: Displays full hierarchical breadcrumb path; every breadcrumb segment must be a clickable link.
- **Quick Create Rules**: Floating `[+]` button opens a unified modal for goals, code snippets, notes, or document uploads.
- **Workspace Switcher Rules**: Level 1 switches Tenant Orgs; Level 2 switches Departments or Personal spaces. Active context is preserved across switches.

---

## SECTION 4: AI INTERACTION & AUTONOMY RULES

$$\begin{array}{rcc}
\text{Read-Only Data Search} & \implies & \mathbf{Act\ Silently\ in\ Background} \\
\text{Low-Risk Formatting / Drafting} & \implies & \mathbf{Act\ \&\ Notify\ in\ Feed} \\
\text{High-Risk Financial / Deploy / Security} & \implies & \mathbf{PAUSE\ \&\ Require\ Human\ Approval\ Gate} \\
\text{Deep Human Focus Work} & \implies & \mathbf{Stay\ Silent\ \&\ Observe}
\end{array}$$

- **Rules for Evidence Generation**: Every completed mission task must produce a Vault transaction record containing input parameters, model ID, execution duration, and cryptographic SHA-256 hash.
- **Confidence Indicators**: Display percentage similarity for vector retrieval (`98% Match`); explicitly highlight low-confidence items (`<70% Match`) with a review recommendation badge.

---

## SECTION 5: COPYWRITING & TONE GUIDE

THEKY speaks with calm precision, professional warmth, and radical clarity:

```
[BUTTONS]        Use action verbs: "Approve Step", "Create Goal", "Install Plugin", "Connect Provider"
[HEADINGS]       Clear intent: "Today's Priorities", "Work Agent Center", "Knowledge Base Search"
[ERRORS]         Explain root cause & fix: "OAuth Token Expired. Click [Reconnect] to restore sync."
[SUCCESS]        Concise confirmation: "Mission Step 2 approved. Step 3 started."
[LOADING]        State backend stage: "Synthesizing Knowledge Graph nodes..."
[APPROVALS]      Explicit risk statement: "Requires sign-off to sign release store package."
[SECURITY]       Clear scope statement: "Tenant Isolated • Vault SHA-256 Verified"
```

- **Forbidden Words**: Avoid `magic`, `wizardry`, `oops`, `yikes`, `system error 0x80004005`, `processing...`.

---

## SECTION 6: VISUAL CONSISTENCY RULES

- **Cards**: Dark raised surface (`#151926`), 1px subtle border (`#242938`), 8px border radius, 16px internal padding.
- **Spacing**: Strict adherence to the 8px baseline grid (`8px`, `16px`, `24px`, `32px`, `48px`).
- **Typography**: `Inter` for English LTR, `Cairo` for Arabic RTL, `JetBrains Mono` for code and hashes.
- **Tables**: Clean borderless rows with subtle 1px divider lines; hover highlight on active row; sticky header bar.
- **Dialogs & Modals**: Centered glassmorphic overlays with backdrop blur (`12px`); dismissable via `Esc` key or outer backdrop click.
- **Charts**: Use clean monochromatic gradients (Indigo to Cyan); no garish rainbow colors.
- **Responsive Layouts**: 12-column responsive grid adapting seamlessly across Desktop, Tablet, and Mobile devices.

---

## SECTION 7: COMPONENT USAGE RULES

### 7.1 Status Badges
- **Purpose**: Communicate entity state instantly.
- **When to Use**: Mission execution state, connector OAuth health, user MFA status.
- **When NOT to Use**: Decorative labels or plain text tags.
- **Accessibility**: Screen-reader accessible label (`aria-label="Status: Approved"`).

### 7.2 Toast Notifications
- **Purpose**: Transient non-blocking feedback.
- **When to Use**: Action success confirmation, quick background job completions.
- **When NOT to Use**: Critical approval gates or destructive confirmation warnings.
- **Behavior**: Auto-dismiss after 4000ms; hover pauses dismissal timer.

---

## SECTION 8: THEKY AI PERSONALITY

THEKY’s AI persona is engineered around four permanent traits:

1. **Professional**: Speaks like a top-tier executive staff lead—precise, organized, and focused on outcomes.
2. **Respectful**: Never interrupts the user's flow; honors user approval decisions without pushback.
3. **Transparent**: Never pretends certainty when data is missing; explicitly states confidence boundaries.
4. **Helpful**: Proactively suggests next logical steps without imposing mandatory choices.

---

## SECTION 9: QUALITY GATE CHECKLIST

Before any pull request or UI canvas is merged into production, it must satisfy all 14 criteria:

```
[ ] 1. Accessibility: 4.5:1 minimum contrast & screen reader ARIA labels
[ ] 2. Keyboard: 100% navigable via Tab, Enter, Space, Esc, and Ctrl+K
[ ] 3. Localization: Dual LTR (English) and RTL (Arabic) rendering support
[ ] 4. Responsiveness: Verifiable layout across 320px, 768px, 1024px, and 1440px+
[ ] 5. Zero Fabrication: Unbacked metrics explicitly render "Not Configured"
[ ] 6. Zero Fake Loading: Operations execute at natural backend speed
[ ] 7. Provenance: Knowledge items display original document source & KG node ID
[ ] 8. Vault Integration: All state changes produce SHA-256 evidence logs
[ ] 9. Loading States: Shimmer skeleton animations with stage text
[ ] 10. Empty States: Helpful illustration, clear explanation, and primary action button
[ ] 11. Error Handling: Human-readable root cause explanation with retry action
[ ] 12. Success Feedback: Concise toast or visual badge confirmation
[ ] 13. Security Scopes: Permission Broker capability token verified
[ ] 14. Performance: Page canvas renders in <100ms
```

---

## SECTION 10: MARKETPLACE & PLUGIN STANDARDS

- **UI Requirements**: Plugins must adopt THEKY Design System tokens and dark glassmorphism surfaces.
- **Security & Permissions**: Plugins must request explicit capability token scopes (`Git Read`, `Storage Write`) during installation.
- **Evidence Mandate**: Every plugin action executed during a mission must attach evidence artifacts to the Vault log.
- **Verification**: Verified enterprise badge (`Gold Shield`) awarded only after static security analysis and sandbox testing.

---

## SECTION 11: AI AGENT STANDARDS

Every AI Agent operating in THEKY must adhere to six mandatory criteria:

1. **Defined Purpose**: Explicit title, role description, and assigned department.
2. **Scoped Inputs/Outputs**: Well-defined JSON payload parameters and artifact outputs.
3. **Capability Token Isolation**: Operates strictly within assigned capability token scope boundaries.
4. **Evidence Logging**: Every step logs execution time, model ID, and transaction SHA-256 hash.
5. **Failure Recovery**: On error, agent attempts 1 automated retry; if unresolved, escalates to human manager.
6. **Human Approval Compliance**: Agent halts execution at gated steps until human approval signature is received.

---

## SECTION 12: FUTURE FEATURE GOVERNANCE GATE

Any proposed new product feature must be evaluated against this governance matrix:

```
+---------------------------------------------------------------------------------------------------+
| GOVERNANCE EVALUATION CRITERION                                  | MANDATORY REQUIREMENT          |
+------------------------------------------------------------------+--------------------------------+
| 1. Aligns with Product Manifesto?                                 | YES (Must pass)                |
| 2. Reduces user cognitive complexity?                            | YES (Must pass)                |
| 3. Strengthens AI-First Operating System architecture?             | YES (Must pass)                |
| 4. Increases trust and provides verifiable evidence?             | YES (Must pass)                |
| 5. Adheres to Zero Data Fabrication policy?                      | YES (Must pass)                |
| 6. Reuses existing design system patterns?                       | YES (Must pass)                |
+---------------------------------------------------------------------------------------------------+
```

---

## SECTION 13: MASTER RELEASE CHECKLIST

```
===================================================================================
THEKY ENTERPRISE v1.0 MASTER RELEASE CHECKLIST
===================================================================================
[ ] UX Architecture & Information Architecture Certified (UX_2_PRODUCT_ARCHITECTURE.MD)
[ ] Product Experience Blueprint Certified (UX_3_PRODUCT_BLUEPRINT.MD)
[ ] Wireframe & Layout Specifications Certified (UX_4_WIREFRAME_ARCHITECTURE.MD)
[ ] Design System & Design Tokens Certified (UX_5_DESIGN_SYSTEM.MD)
[ ] Product Manifesto Philosophy Certified (THEKY_PRODUCT_MANIFESTO.MD)
[ ] Quality Checklist Satisfied Across All 22 Product Views
[ ] Zero P0 Defect Blockers Remaining
[ ] Cryptographic Vault AES-256-GCM Payload Encryption Verified
[ ] Permission Broker HMAC-SHA256 Token Signatures & Path Containment Verified
[ ] Dynamic Readiness Telemetry Verification Passed
[ ] All Workspace Quality Gates Passed (Clippy, Cargo Test, Vitest, pnpm build)
===================================================================================
FINAL RELEASE VERDICT: CERTIFIED READY FOR PRODUCTION
===================================================================================
```
