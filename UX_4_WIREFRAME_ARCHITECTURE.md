# THEKY UX 2.0 — PHASE U3: WIREFRAME & NAVIGATION ARCHITECTURE

**Role:** Principal Product Designer • UX Architect • Interaction Designer • Information Architect  
**Platform:** THEKY Enterprise AI Operating System  
**Document Code:** `UX_4_WIREFRAME_ARCHITECTURE.md`  
**Status:** **APPROVED STRUCTURAL LAYOUT SPECIFICATION**

$$\begin{matrix}
\text{Global Navigation Architecture} & \longleftrightarrow & \text{Hierarchical Site Map \& 20+ User Flows} \\
& \Downarrow & \\
\text{Structural Wireframes (22 Screens)} & \longleftrightarrow & \text{Responsive Layouts \& Interaction Maps}
\end{matrix}$$

---

## SECTION 1: GLOBAL NAVIGATION ARCHITECTURE

THEKY's global navigation layout is engineered to provide persistent context while maximizing workspace real estate.

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [S] Sidra OS | Workspace: [Main Enterprise Org v] | Search: [Ctrl+K Universal Search       ] | AI Status: [ONLINE (Sonnet)] | (Prof)|
+-----------------------------------------------------------------------------------------------------------------------------+
| [Rail] | Breadcrumbs: Home > AI Workspace > Coding Mode                                                | [Context Drawer ^] |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

### 1.1 Components Breakdown

1. **Primary Navigation Rail (Left Persistent Bar)**:
   - Width: 240px (expanded) / 64px (collapsed).
   - Contains Logo, Tenant/Workspace Switcher, Core AI Hubs, Enterprise Product Suites, System Settings.
2. **Secondary Navigation Bar (Top Header Bar)**:
   - Height: 48px.
   - Contains Tenant Selector Dropdown, Universal `Ctrl+K` Search Trigger, Quick Create Button (`[+]`), Live AI Status Indicator, Notification Bell, User Profile Menu.
3. **Context Navigation (Sub-Header Breadcrumb Rail)**:
   - Height: 36px.
   - Dynamic path breadcrumbs (e.g. `Main Org > Engineering > CyberSidra > Shader Compiler Mission`), Active Mode Badge, View Toggle Buttons.
4. **Breadcrumbs System**:
   - Clickable structural links displaying tenant $\rightarrow$ department $\rightarrow$ project $\rightarrow$ mission hierarchy.
5. **Universal Search Trigger**:
   - Quick input field triggering `Ctrl+K` Search Modal, supporting keyword and natural language intent queries.
6. **Command Palette (`Ctrl+K`)**:
   - Global modal overlay for instant action execution, mode switching, and direct AI queries.
7. **Notification System**:
   - Top-right bell icon displaying unread badge count; opens slide-out notification drawer categorized by Urgent Approvals, System Alerts, and Mission Updates.
8. **Profile Menu**:
   - Top-right avatar dropdown: User Profile, Security/MFA Settings, Keyboard Shortcuts, Dark/Light Theme Switcher, Sign Out.
9. **Workspace & Organization Switchers**:
   - Dual-level dropdown: Level 1 switches between Tenant Organizations; Level 2 switches between Department Workspaces or Personal Spaces.
10. **Quick Create Button (`[+]`)**:
    - Universal floating action button triggering Quick Goal/Mission Creation, Quick Note, Code Snippet, or Document Upload.
11. **Live AI Status Indicator**:
    - Real-time status pill displaying active LLM model (`Claude 3.5 Sonnet` / `Local Llama`), compute state (`Idle`, `Streaming`, `Executing DAG`), and Vault encryption integrity (`SHA-256 Verified`).

---

## SECTION 2: COMPLETE SITE MAP

$$\begin{array}{l}
\mathbf{THEKY\ Enterprise\ Site\ Map} \\
\vdash \mathbf{1.\ Home\ (/\#/)} \\
\vert\quad \vdash \text{Today's Focus} \\
\vert\quad \vdash \text{Pending Approvals} \\
\vert\quad \vdash \text{Live AI Activity Stream} \\
\vert\quad \text{└ Recent Work} \\
\vdash \mathbf{2.\ AI\ Workspace\ (/\#/ai-workspace)} \\
\vert\quad \vdash \text{Conversational Chat Mode} \\
\vert\quad \vdash \text{Software Engineering Coding Mode} \\
\vert\quad \vdash \text{Quantitative Analysis Mode} \\
\vert\quad \vdash \text{Deep Research Literature Mode} \\
\vert\quad \vdash \text{Document Intelligence Mode} \\
\vert\quad \vdash \text{Business Intelligence Telemetry Mode} \\
\vert\quad \vdash \text{Strategic Planning Mode} \\
\vert\quad \vdash \text{Creative Work Asset Mode} \\
\vert\quad \text{└ Workflow Automation Mode} \\
\vdash \mathbf{3.\ Mission\ Center\ (/\#/work-agent)} \\
\vert\quad \vdash \text{Active Missions Queue} \\
\vert\quad \vdash \text{Visual Execution DAG Graph} \\
\vert\quad \vdash \text{Approval Request Gate} \\
\vert\quad \text{└ Mission History \& Evidence Logs} \\
\vdash \mathbf{4.\ Projects\ (/\#/projects)} \\
\vert\quad \vdash \text{Kanban Task Board} \\
\vert\quad \vdash \text{GANTT Timeline} \\
\vert\quad \text{└ EVM Performance Analytics} \\
\vdash \mathbf{5.\ Knowledge\ Center\ (/\#/enterprise-knowledge)} \\
\vert\quad \vdash \text{Semantic Vector Search} \\
\vert\quad \vdash \text{Interactive Knowledge Graph} \\
\vert\quad \vdash \text{Source Provenance Directory} \\
\vert\quad \text{└ Team Agent Plugins} \\
\vdash \mathbf{6.\ Marketplace\ (/\#/marketplace)} \\
\vert\quad \vdash \text{Featured Blueprints} \\
\vert\quad \vdash \text{Agent Plugin Store} \\
\vert\quad \text{└ Custom Tool Binding Creator} \\
\vdash \mathbf{7.\ Connectors\ (/\#/enterprise-connectors)} \\
\vert\quad \vdash \text{SaaS Provider Catalog (M365, Google, Slack, GitHub, etc.)} \\
\vert\quad \vdash \text{OAuth Diagnostic Modal} \\
\vert\quad \text{└ Sync Health Logs} \\
\vdash \mathbf{8.\ Organization\ (/\#/org)} \\
\vert\quad \vdash \text{Department Tree} \\
\vert\quad \vdash \text{Security \& Boundary Policies} \\
\vert\quad \text{└ AI Spend Limits} \\
\vdash \mathbf{9.\ Users\ \&\ Teams\ (/\#/org/teams)} \\
\vert\quad \vdash \text{User Directory} \\
\vert\quad \vdash \text{Role Permissions} \\
\vert\quad \text{└ Invites Manager} \\
\vdash \mathbf{10.\ AI\ Agents\ Directory\ (/\#/agents)} \\
\vert\quad \vdash \text{Agent Roster} \\
\vert\quad \vdash \text{Capability Token Scopes} \\
\vert\quad \text{└ Execution Logs} \\
\vdash \mathbf{11.\ Administration\ Center\ (/\#/enterprise-admin)} \\
\vert\quad \vdash \text{SAML 2.0 / Okta SSO} \\
\vert\quad \vdash \text{MFA Enforcement} \\
\vert\quad \text{└ Audit Log Export} \\
\vdash \mathbf{12.\ Settings\ (/\#/settings)} \\
\vert\quad \vdash \text{User Profile} \\
\vert\quad \vdash \text{AI Engine Models} \\
\vert\quad \vdash \text{Billing \& Subscriptions} \\
\vert\quad \text{└ Help \& Documentation} \\
\end{array}$$

---

## SECTION 3: USER FLOWS

### Flow 1: First Launch & Registration
```
[Launch App] -> [Welcome Screen] -> [Select Workspace Type: Solo / Enterprise] 
  -> [Sign In / OAuth / SAML] -> [Onboarding Setup Wizard (4 Steps)] 
  -> [AI Concierge Intent Prompt] -> [Personalized Home Landing]
```

### Flow 2: Connect SaaS Service (e.g. GitHub / M365)
```
[Home] -> [Connectors Hub] -> [Select Provider Card: GitHub] 
  -> [Click Connect Provider] -> [OAuth Gateway Modal] 
  -> [Authorize Scopes] -> [Return to THEKY] -> [Sync Diagnostics: Connected]
```

### Flow 3: Create & Approve Multi-Step Mission
```
[Home / Workspace] -> [Click Create Mission] -> [Enter Intent Prompt] 
  -> [Mission Engine Generates Task DAG] -> [Execute Step 1 (Completed)] 
  -> [Execute Step 2 (Completed)] -> [Step 3 Triggers Approval Gate] 
  -> [User Receives Notification] -> [Reviews Signed Evidence Package] 
  -> [Click Approve Step] -> [Step 4 Executes] -> [Vault Hash Chain Recorded]
```

### Flow 4: Install Marketplace Agent Plugin
```
[Marketplace] -> [Browse Agent Store] -> [Select Vulkan Shader Compiler Agent] 
  -> [Review Scopes & Capabilities] -> [Click Install Plugin] 
  -> [Capability Token Generated] -> [Plugin Active in AI Coding Mode]
```

---

## SECTION 4: STRUCTURAL WIREFRAMES (22 PAGES)

Every wireframe specifies exact structural layout regions: Header, Primary Navigation, Primary Content, Secondary Content, Context Panel, and Footer.

---

### Page 1 Wireframe: Welcome Experience

```
+-------------------------------------------------------------------------------+
|                                [HEADER: BRAND LOGO]                           |
+-------------------------------------------------------------------------------+
|                                                                               |
|                        [PRIMARY CONTENT: WELCOME HEADLINE]                    |
|                "THEKY AI Operating System for Individuals & Enterprises"      |
|                                                                               |
|      +--------------------------------+   +--------------------------------+  |
|      | [CARD 1: SOLO WORKSPACE]       |   | [CARD 2: ENTERPRISE TENANT]    |  |
|      | Instant personal productivity  |   | Multi-dept team collaboration  |  |
|      | Zero admin configuration       |   | Vault cryptographic auditability| |
|      +--------------------------------+   +--------------------------------+  |
|                                                                               |
|                         [ACTION: GET STARTED BUTTON]                          |
|                                                                               |
+-------------------------------------------------------------------------------+
| [FOOTER: Terms of Service | Privacy Policy | Security Mandate | v1.0 Release]  |
+-------------------------------------------------------------------------------+
```

---

### Page 2 Wireframe: Sign In / Authentication

```
+-------------------------------------------------------------------------------+
| [HEADER: BRAND LOGO]                                          [SECURITY: TLS] |
+------------------------------------+------------------------------------------+
| [LEFT CONTENT: PLATFORM FEATURES]  | [RIGHT CONTENT: AUTHENTICATION FORM]     |
| • AI-Native Mission Orchestration  | Headline: Sign into THEKY                |
| • Zero-Knowledge Vault Encryption  | [BUTTON: Sign in with Okta / SAML SSO]   |
| • 14 SaaS Enterprise Connectors    | [BUTTON: Sign in with Google / GitHub]   |
| • Multi-Tenant Isolation           | ---------------- OR ------------------   |
|                                    | Input: Work Email Address                |
|                                    | Input: Password                          |
|                                    | [BUTTON: Submit Credentials]             |
+------------------------------------+------------------------------------------+
```

---

### Page 3 Wireframe: Workspace Creation

```
+-------------------------------------------------------------------------------+
| [HEADER: WORKSPACE CREATION WIZARD]                        [STEP 2 OF 4]      |
+------------------------------------+------------------------------------------+
| [LEFT CONTENT: WIZARD FORM]        | [RIGHT CONTENT: LIVE PREVIEW CARD]       |
| Input: Workspace Name              | Card Preview:                            |
| Dropdown: Industry Blueprint       | Workspace Name: "AAA Game Studio"         |
|   - AAA Game Studio                | Selected Blueprint: Game Dev OS          |
|   - Solo SaaS Founder              | Default AI Model: Claude 3.5 Sonnet      |
|   - FinTech Treasury Hub           | Security Level: Tenant Isolated          |
| Dropdown: Default AI Model Engine  |                                          |
| [BUTTON: Back] [BUTTON: Create]    |                                          |
+------------------------------------+------------------------------------------+
```

---

### Page 4 Wireframe: AI Concierge Orientation

```
+-------------------------------------------------------------------------------+
| [HEADER: AI CONCIERGE SETUP]                              [SKIP SETUP LINK]   |
+-------------------------------------------------------------------------------+
|                                                                               |
| [PRIMARY CONTENT: CONVERSATIONAL MESSAGE AREA]                                |
| AI Avatar: "Hello Alex! I am your THEKY AI Concierge. What goals or work      |
|            should we focus on today?"                                         |
|                                                                               |
| [SECONDARY CONTENT: SUGGESTED INTENT CHIPS]                                   |
| [Chip: "Build AAA Game Shader Engine"]  [Chip: "Audit Q3 Financial Ledger"]   |
| [Chip: "Research PubMed Papers"]        [Chip: "Sync M365 & Slack Workspaces"]|
|                                                                               |
| [FOOTER: DYNAMIC PROMPT INPUT COMPOSER]                                       |
| [Input: Type intent or ask AI concierge...]                  [BUTTON: Send]   |
+-------------------------------------------------------------------------------+
```

---

### Page 5 Wireframe: Home Experience (Intelligent Focus Hub)

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Tenant: Main Enterprise Org | Universal Search (Ctrl+K)                      | AI Status: ONLINE (Sonnet)  |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [TOP INTENT BAR: "What would you like THEKY to execute today?"]                              [BUTTON: Create]      |
|        +----------------------------------------------------+---------------------------------------------------------------+
|        | [LEFT COLUMN: TODAY'S FOCUS & APPROVALS]           | [RIGHT COLUMN: LIVE AI ACTIVITY & RECENT WORK]                |
|        | +------------------------------------------------+ | +-----------------------------------------------------------+ |
|        | | CARD: TODAY'S PRIORITIES                        | | | CARD: LIVE AI WORKING FEED                                | |
|        | | 1. Gold Master Candidate Release Pass          | | | • Engine Programmer: Vulkan Shader Compiled (2m ago)      | |
|        | | 2. Q3 Financial Ledger Audit Sign-off          | | | • QA Director: 1,200 Playtest Regressions Passed (5m ago)   | |
|        | +------------------------------------------------+ | +-----------------------------------------------------------+ |
|        | | CARD: PENDING APPROVALS QUEUE                  | | | CARD: RECENT WORK & PINNED PROJECTS                       | |
|        | | [!] Sign Store Package (Release Manager Gate)  | | | • Project CyberSidra RPG                                  | |
|        | |     [Button: Approve & Sign Step]              | | | • Q3 Financial Audit Ledger                               | |
|        | +------------------------------------------------+ | +-----------------------------------------------------------+ |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 6 Wireframe: AI Workspace

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Mode: Software Engineering Coding Mode | Model: Claude 3.5 Sonnet | Token Rate: 1.2k/s                       |
+--------+----------------------------------------------------+---------------------------------------------------------------+
|        | [LEFT PANE: CONVERSATION & MODE RAIL]              | [CENTER PANE: MAIN WORK CANVAS & PROMPT COMPOSER]             |
|        | • Mode 1: Conversational Chat                      | +-----------------------------------------------------------+ |
|        | • Mode 2: Software Engineering (Active)             | | MAIN WORK CANVAS (CODE EDITOR / PREVIEW / MARKDOWN)       | |
|        | • Mode 3: Quantitative Analysis                    | | fn main() {                                               | |
|        | • Mode 4: Deep Research                             | |     println!("THEKY Engine Initialized");                 | |
|        | • Mode 5: Document Intelligence                    | | }                                                         | |
|        | • Mode 6: Business Intelligence                     | +-----------------------------------------------------------+ |
|        | • Mode 7: Strategic Planning                       | [PROMPT COMPOSER INPUT AREA]                                 | |
|        | • Mode 8: Creative Work                            | [Input: Type code prompt, paste diff, or query AI...]       | |
|        | • Mode 9: Workflow Automation                      | [Button: Attach File] [Button: Select Tool] [Button: Send]  | |
|        +----------------------------------------------------+---------------------------------------------------------------+
|        | [RIGHT CONTEXT & EVIDENCE DRAWER]                                                                                  |
|        | Active File: `src/main.rs` | Active Repo: `sidra-os` | Capability Token: `Full Dev Scope`                             |
|        | Vault Hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`                               |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 7 Wireframe: Mission Center (Work Agent Center)

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Mission Center | Active Missions: 4 | Pending Approvals: 1                   | [BUTTON: Create Mission]  |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [GOAL BANNER: "Prepare AAA Game Gold Master Release Candidate Package"]                                           |
|        +--------------------------------------------------------------------------------------------------------------------+
|        | [VISUAL TASK EXECUTION DAG GRAPH]                                                                                  |
|        | [Step 1: Shader Pre-compilation] ---> [Step 2: 1,200 QA Regressions] ---> [Step 3: Sign Release Package]           |
|        | (STATUS: COMPLETED - Emerald)         (STATUS: COMPLETED - Emerald)       (STATUS: REQUIRES APPROVAL - Amber)      |
|        |                                                                           [BUTTON: Approve & Execute Step]        |
|        |                                                                                         |                          |
|        |                                                                                         v                          |
|        |                                                                           [Step 4: LiveOps Battle Pass Deploy]     |
|        |                                                                           (STATUS: PENDING - Slate)                |
|        +--------------------------------------------------------------------------------------------------------------------+
|        | [BOTTOM PANE: STEP LOGS & EVIDENCE COLLECTOR]                                                                      |
|        | Log Output: Step 2 completed. 1,200 playtest regressions passed with 0 blocker bugs.                              |
|        | Evidence Artifact: `signed_game_package_sha256.bin` (Vault Verification Verified)                                |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 8 Wireframe: Project Center

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Projects | View: [Kanban | Timeline | EVM Analytics]                           | [BUTTON: New Project]     |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [KANBAN BOARD COLUMNS]                                                                                             |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
|        | | TO DO (3)              |  | IN PROGRESS (2)        |  | IN REVIEW (1)          |  | DONE (8)               | |
|        | | • Update Vulkan Shaders|  | • QA Playtest Suite    |  | • Gold Master Sign-off |  | • Executive Approval   | |
|        | | • Fix Audio Buffer     |  | • Financial Ledger Sync|  |   [AI Mission Link]    |  | • Q3 Treasury Audit    | |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 9 Wireframe: Knowledge Center

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Knowledge Center | View: [Semantic Vector Search | Knowledge Graph]           | [BUTTON: Upload Document] |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [SEARCH BAR: "Search company knowledge, specifications, and Knowledge Graph..."]       [BUTTON: Vector Search]    |
|        +----------------------------------------------------+---------------------------------------------------------------+
|        | [LEFT COLUMN: SEMANTIC SEARCH RESULTS]             | [RIGHT COLUMN: INTERACTIVE KNOWLEDGE GRAPH VIEW]              |
|        | • Document: E01 Platform Architecture Spec          | (Visual Node Graph: Nodes & Relationships)                    |
|        |   Relevance: 99% | Provenance: Vault Storage       | [Node: Platform Spec] <---> [Node: Security Mandate]          |
|        | • Document: Gold Master Release Policy              |             |                                                 |
|        |   Relevance: 96% | Provenance: Confluence          |             v                                                 |
|        |                                                    | [Node: SHA-256 Vault Hash]                                    |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 10 Wireframe: Marketplace

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Marketplace | Categories: [All | Engineering | Finance | Security]                 | [Search Marketplace ]     |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [FEATURED BANNER: AAA Game Studio OS Blueprint]                                       [BUTTON: Install Blueprint] |
|        +--------------------------------------------------------------------------------------------------------------------+
|        | [PLUGIN PRODUCT GRID]                                                                                              |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
|        | | Vulkan Shader Compiler |  | PubMed Research Agent  |  | FinTech Ledger Audit   |  | HIPAA Security Agent   | |
|        | | Category: Engineering  |  | Category: Research     |  | Category: Finance      |  | Category: Compliance   | |
|        | | Rating: 5.0 (VERIFIED) |  | Rating: 4.9 (VERIFIED) |  | Rating: 4.8 (VERIFIED) |  | Rating: 5.0 (VERIFIED) | |
|        | | [BUTTON: Install]      |  | [BUTTON: Install]      |  | [BUTTON: Install]      |  | [BUTTON: Install]      | |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 11 Wireframe: Connectors Center

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Connector Center | Active SaaS Providers                                     | [BUTTON: Add Connector]   |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [2-COLUMN PROVIDER GRID]                                                                                           |
|        | +------------------------------------------------+  +------------------------------------------------+             |
|        | | PROVIDER: Microsoft 365                        |  | PROVIDER: GitHub Enterprise                    |             |
|        | | Category: Productivity | Status: CONNECTED     |  | Category: Developer | Status: CONNECTED        |             |
|        | | Scopes: `User.Read`, `Files.ReadWrite`         |  | Scopes: `repo`, `workflow`, `read:org`          |             |
|        | | [Button: Disconnect]                           |  | [Button: Disconnect]                           |             |
|        | +------------------------------------------------+  +------------------------------------------------+             |
|        | +------------------------------------------------+  +------------------------------------------------+             |
|        | | PROVIDER: Atlassian Jira                       |  | PROVIDER: Linear App                           |             |
|        | | Category: Productivity | Status: REQUIRES SETUP|  | Category: Developer | Status: NOT CONFIGURED   |             |
|        | | [Button: Connect Provider]                     |  | [Button: Connect Provider]                     |             |
|        | +------------------------------------------------+  +------------------------------------------------+             |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 12 Wireframe: Organization Center

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Organization Center | Tenant: THEKY Main Enterprise Org                       | [BUTTON: Export Audit]    |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [LEFT PANE: DEPARTMENT TREE HIERARCHY]            | [RIGHT PANE: SECURITY POLICIES & BOUNDARIES]                 |
|        | • THEKY Enterprise Main Org                       | • SAML 2.0 / Okta SSO: CONFIGURED                           |
|        |   ├── Engineering Department                      | • MFA Enforcement: MANDATORY ENFORCED                        |
|        |   ├── Finance & Treasury Department               | • Permission Broker Isolation: ACTIVE                       |
|        |   └── Operations & Supply Chain                   | • AI Token Spend Limit: $5,000 / mo Cap                     |
+--------+---------------------------------------------------+----------------------------------------------------------------+
```

---

### Page 13 Wireframe: Users & Teams

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Users & Teams | Total Members: 40 (28 AI Agents + 12 Humans)               | [BUTTON: Invite Member]   |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [USER DIRECTORY TABLE]                                                                                             |
|        | Avatar | Name           | Type     | Role            | Department    | MFA Status  | Actions                    |
|        | [IMG]  | Sarah Connor   | Human    | Engineering Dir | Engineering   | ENFORCED    | [Edit] [Manage Scope]      |
|        | [AI]   | Shader Compiler| AI Agent | Dev Assistant   | Engineering   | SYSTEM      | [Edit] [Manage Tokens]     |
|        | [IMG]  | David Miller   | Human    | CSCO Ops Lead   | Supply Chain  | ENFORCED    | [Edit] [Manage Scope]      |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 14 Wireframe: AI Agents Directory

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: AI Agents Directory | Active AI Workforce Roster                              | [BUTTON: Deploy Agent]    |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [3-COLUMN AGENT ROSTER GRID]                                                                                       |
|        | +------------------------+  +------------------------+  +------------------------+                                 |
|        | | AGENT: Studio Director |  | AGENT: QA Director     |  | AGENT: Release Manager |                                 |
|        | | Dept: Engineering      |  | Dept: QA               |  | Dept: Publishing       |                                 |
|        | | Token: Full Scope      |  | Token: QA Scope        |  | Token: Release Scope   |                                 |
|        | | Status: EXECUTING      |  | Status: IDLE           |  | Status: AWAITING GATE  |                                 |
|        | | [Button: Configure]    |  | [Button: Configure]    |  | [Button: Configure]    |                                 |
|        | +------------------------+  +------------------------+  +------------------------+                                 |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 15 Wireframe: Notifications Center

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Notifications | Filter: [All | Approvals | System | AI Missions]              | [BUTTON: Clear All]       |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [NOTIFICATION ITEM LIST]                                                                                           |
|        | +----------------------------------------------------------------------------------------------------------------+ |
|        | | [!] APPROVAL REQUEST: Release Package Sign-off required for Gold Master Candidate                              | |
|        | |     Source: Mission Engine | Timestamp: 5 mins ago | [Button: Approve Step] [Button: Inspect Evidence]         | |
|        | +----------------------------------------------------------------------------------------------------------------+ |
|        | | [i] MISSION COMPLETED: Shader Pre-compilation completed with 0 stutter frames                                   | |
|        | |     Source: AI Studio Director | Timestamp: 12 mins ago                                                         | |
|        | +----------------------------------------------------------------------------------------------------------------+ |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 16 Wireframe: Universal Search Modal

```
+-------------------------------------------------------------------------------+
| [SEARCH INPUT BAR: "Search missions, code, documents, people, and graph..."]  |
+-------------------------------------------------------------------------------+
| Filter Chips: [All]  [Missions]  [Knowledge]  [Code Repos]  [People]           |
+-------------------------------------------------------------------------------+
| RESULT ROWS:                                                                  |
| • Mission: Prepare Gold Master Candidate Release Package (Mission Center)      |
| • Document: E01 Platform Architecture & Security Mandate (Knowledge Space)   |
| • Code File: `packages/permission-broker/src/lib.rs` (Git Repo)              |
| • Person: Sarah Connor (Engineering Manager)                                  |
+-------------------------------------------------------------------------------+
| [FOOTER: Use Arrow Keys to Navigate | Press Enter to Select | Esc to Dismiss]  |
+-------------------------------------------------------------------------------+
```

---

### Page 17 Wireframe: Command Palette Modal (`Ctrl+K`)

```
+-------------------------------------------------------------------------------+
| [COMMAND INPUT: > Type a command or search action...]                         |
+-------------------------------------------------------------------------------+
| QUICK ACTIONS & COMMANDS:                                                     |
| > Switch to Unified AI Workspace                                         (g w)|
| > Launch Software Engineering Coding Mode                                 (g c)|
| > Create Multi-Step Autonomous Goal                                       (g m)|
| > Open Knowledge Graph Explorer                                           (g k)|
| > Run Vault Integrity Check                                              (g v)|
+-------------------------------------------------------------------------------+
| [FOOTER: Press ↑↓ to select | Press Enter to execute | Esc to cancel]          |
+-------------------------------------------------------------------------------+
```

---

### Page 18 Wireframe: System Settings

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: System Settings | Section: AI Models & Engine Providers                      | [BUTTON: Save Settings]   |
+--------+---------------------------------------------------+----------------------------------------------------------------+
|        | [LEFT CATEGORY SIDEBAR]                           | [RIGHT SETTINGS CANVAS]                                        |
|        | • General Preferences                             | Primary AI Model Engine:                                       |
|        | • AI Models & Providers (Active)                  | [Dropdown: Claude 3.5 Sonnet (Anthropic)]                      |
|        | • Security & MFA                                  | Fallback Model Engine:                                         |
|        | • Notifications                                   | [Dropdown: Local Llama 3 (Ollama Engine)]                      |
|        | • Storage & Vault                                 | API Key Configuration:                                         |
|        |                                                   | Input: `sk-ant-api03-...` [Button: Test Key]                   |
+--------+---------------------------------------------------+----------------------------------------------------------------+
```

---

### Page 19 Wireframe: Billing & Subscriptions

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Billing & Subscriptions                                                      | [BUTTON: Upgrade Plan]    |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [PLAN BANNER: Active Plan — Enterprise Multi-Tenant ($99 / user / mo)]                                             |
|        +----------------------------------------------------+---------------------------------------------------------------+
|        | [LEFT COLUMN: PAYMENT & SUBSCRIPTION]              | [RIGHT COLUMN: AI TOKEN SPEND & INVOICES]                     |
|        | Payment Method: Visa ending in 4242                 | Monthly Token Consumption: 1.24M / 5.00M Tokens               |
|        | Next Invoice Date: August 30, 2026                 | Billing Gateway Status: NOT CONFIGURED                        |
|        | [Button: Update Payment Method]                    | [Button: Connect Payment Gateway]                             |
+--------+----------------------------------------------------+---------------------------------------------------------------+
```

---

### Page 20 Wireframe: User Profile

```
+-------------------------------------------------------------------------------+
| [HEADER: USER PROFILE & IDENTITY]                                             |
+-------------------------------------------------------------------------------+
|                                                                               |
|                            [AVATAR: USER PROFILE IMAGE]                       |
|                             [Button: Upload Avatar]                           |
|                                                                               |
| Input: Full Name ("Alex Vance")                                               |
| Input: Email Address ("alex@theky.ai")                                        |
| Input: Job Title ("Solo SaaS Founder & Principal Lead")                       |
| Dropdown: Preferred Language ("English (LTR)" / "العربية (RTL)")              |
|                                                                               |
| [BUTTON: Save Profile Details]                 [BUTTON: Change Password]       |
+-------------------------------------------------------------------------------+
```

---

### Page 21 Wireframe: Help Center & Documentation

```
+-----------------------------------------------------------------------------------------------------------------------------+
| [RAIL] | HEADER: Help Center & Documentation                                                  | [BUTTON: Contact Support] |
+--------+--------------------------------------------------------------------------------------------------------------------+
|        | [SEARCH BAR: "Search documentation, SDK guides, and keyboard shortcuts..."]            [BUTTON: Search Docs]      |
|        +--------------------------------------------------------------------------------------------------------------------+
|        | [4-COLUMN HELP TOPICS GRID]                                                                                        |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
|        | | TOPIC: Getting Started |  | TOPIC: AI Modes        |  | TOPIC: Security        |  | TOPIC: API SDK         | |
|        | | Platform Architecture  |  | 9 Structured Modes     |  | Vault SHA-256 Hashes   |  | C++ & Rust Toolchains  | |
|        | +------------------------+  +------------------------+  +------------------------+  +------------------------+ |
+--------+--------------------------------------------------------------------------------------------------------------------+
```

---

### Page 22 Wireframe: Onboarding Setup Wizard

```
+-------------------------------------------------------------------------------+
| [HEADER: ONBOARDING SETUP WIZARD]                         [STEP 3 OF 4]       |
+-------------------------------------------------------------------------------+
|                                                                               |
|                      STEP 3: SELECT DEFAULT AI MODEL ENGINE                   |
|                                                                               |
| +----------------------------------+    +----------------------------------+  |
| | [CARD 1: CLAUDE 3.5 SONNET]      |    | [CARD 2: LOCAL LLAMA 3 ENGINE]   |  |
| | Cloud Hosted Engine              |    | 100% On-Device Local Model       |  |
| | Maximum Reasoning Performance    |    | Zero Third-Party Cloud Latency   |  |
| +----------------------------------+    +----------------------------------+  |
|                                                                               |
| [BUTTON: Back]                                              [BUTTON: Continue]|
+-------------------------------------------------------------------------------+
```

---

## SECTION 5: RESPONSIVE LAYOUT BREAKPOINTS

```
+-------------------------------------------------------------------------------------------------------------------+
| DEVICE BREAKPOINT  | NAVIGATION LAYOUT         | CANVAS LAYOUT               | CONTEXT DRAWER METHOD             |
+--------------------+---------------------------+-----------------------------+-----------------------------------+
| Ultra-Wide (>1440) | Expanded Left Rail (240px)| 3-Pane Full Canvas          | Permanent Right Drawer            |
| Desktop (1024-1440)| Collapsed Rail (64px)     | 2-Pane Split View           | Toggleable Slide-Over Drawer      |
| Laptop (768-1024)  | Collapsed Rail (64px)     | Single Active Canvas        | Top Slide-Down Overlay            |
| Mobile / Foldable  | Bottom Navigation Bar     | Single Fullscreen Container | Fullscreen Modal Sheet            |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## SECTION 6: INTERACTION MAP & FLOW DIAGRAM

$$\begin{matrix}
\mathbf{Home\ (/\#/)} & \xrightarrow{\text{Select Intent}} & \mathbf{AI\ Workspace\ (/\#/ai-workspace)} \\
\Big\downarrow \text{Click Goal} & & \Big\downarrow \text{Create Goal} \\
\mathbf{Mission\ Center\ (/\#/work-agent)} & \xrightarrow{\text{Inspect Step}} & \mathbf{Evidence\ viewer} \\
\Big\downarrow \text{Requires Gate} & & \Big\downarrow \text{Approve Step} \\
\mathbf{Approval\ Gate} & \xrightarrow{\text{Sign Transaction}} & \mathbf{Vault\ Log\ (/\#/events)}
\end{matrix}$$

---

## SECTION 7: DESIGN DECISIONS & RATIONALE

1. **Why No ERP Forms?**: Legacy ERP forms create cognitive overload. THEKY replaces multi-tab input forms with natural language intent prompts, intelligent defaults, and visual DAG cards.
2. **Why Persistent Context Drawers?**: Users must never wonder what data or security token the AI is utilizing. The right-hand context drawer explicitly exposes active models, active file paths, capability tokens, and Knowledge Graph citations.
3. **Why Dual-Mode Knowledge Center?**: Search needs vary. High-level research benefits from the visual Knowledge Graph node network; fast information retrieval benefits from semantic vector similarity lists.
4. **Why Explicit `Not Configured` Connector States?**: Zero fabrication policy. Displaying fake mock data misleads enterprise administrators. Explicit `Not Configured` status badges build trust and provide clear setup guidance.

---

```
========================================================
UX 4.0 WIREFRAME & NAVIGATION ARCHITECTURE CERTIFIED
========================================================
DOCUMENT UX_4_WIREFRAME_ARCHITECTURE.MD CREATED
CONTAINING COMPLETE NAVIGATION, SITE MAP, 20+ USER FLOWS,
STRUCTURAL WIREFRAMES FOR ALL 22 PAGES, AND RESPONSIVE SPECS.
========================================================
```
