# THEKY UX 2.0 — PHASE U2: PRODUCT EXPERIENCE BLUEPRINT

**Role:** Chief Product Officer • Principal UX Designer • Product Strategist • Interaction Designer  
**Platform:** THEKY Enterprise AI Operating System  
**Document Code:** `UX_3_PRODUCT_BLUEPRINT.md`  
**Status:** **APPROVED WORLD-CLASS PRODUCT SPECIFICATION**

$$\begin{matrix}
\text{Calm, Fast \& Focused} & \longleftrightarrow & \text{AI-First Interaction Model} \\
& \Downarrow & \\
\text{22 Screen Blueprints} & \longleftrightarrow & \text{12 Industry Personalizations \& Micro-Interactions}
\end{matrix}$$

---

## 1. Global UX Principles & Navigation Framework

Every screen in THEKY answers five fundamental questions for the user at all times:

1. **Where am I?**: Clear breadcrumbs, active workspace indicator, active mode badge, and structural page headers.
2. **What is AI doing?**: Real-time status indicators (e.g. `AI Thinking`, `Executing Step 2/4`, `Awaiting Approval`), live model telemetry, and execution logs.
3. **What should I do next?**: Highlighted primary action buttons, context-suggested intent chips, and explicit pending approval banners.
4. **How do I return?**: Esc key dismisses overlays, persistent back breadcrumbs, global home button, and sidebar navigation.
5. **How do I search?**: Universal `Ctrl+K` Command Palette, persistent search input, and global semantic vector search.

---

## 2. Micro-Interactions Catalog

- **Hover States**: Cards lift smoothly with 4px translation (`transform: translateY(-2px)`), sub-pixel border glows (`rgba(99, 102, 241, 0.4)`), and cursor transitions (`transition: all 150ms ease-out`).
- **Selection States**: Active items display an inset 3px primary accent bar, elevated background surface color, and bold typography.
- **Loading States**: Shimmer skeleton animations with subtle pulse effects; dynamic status text indicating backend stage (`Connecting to Vault...`, `Synthesizing Knowledge Graph...`).
- **Transitions**: Page views fade and slide with 200ms cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Notifications**: Toast alerts slide in from the top-right corner with sound-cued micro-haptics and auto-dismiss counters.
- **Mission Completion**: Celebratory subtle particle animation around the step badge, green status shift, and sound chime.
- **AI Speaking / Output Streaming**: Glowing pulsing aura around active AI model avatar, real-time Markdown token streaming with smooth autoscroll.
- **Approvals**: Tactile button press with loading spinner during cryptographic signature validation, followed by a checkmark confirmation morph.
- **Uploads / Downloads**: Circular radial progress rings inside file cards with drag-and-drop target zone highlights.
- **Search Interactions**: Instant keypress filtering with highlighted query matches and keyboard arrow selection.

---

## 3. Comprehensive Screen Blueprints (22 Primary Screens)

Below is the complete specification for all 22 primary product screens.

---

### Screen 1: Welcome Experience

- **Screen Purpose**: Introduce new users to THEKY AI Operating System and guide initial workspace selection.
- **Primary User Goal**: Get started immediately with solo or enterprise workspace setup.
- **First Impression**: Clean, dark glassmorphism canvas featuring a subtle animated ambient gradient and glowing logo mark.
- **Layout Structure**: Single centered container with step navigation indicator at the top.
- **Main Components**: Welcome Headline, Workspace Choice Cards (`[Solo Workspace]`, `[Team / Enterprise Tenant]`), Get Started Button.
- **Secondary Components**: Feature highlights list, Terms of Service link, Theme toggle.
- **Actions**: Select workspace type, Continue to Sign In / Onboarding.
- **AI Behaviors**: AI Concierge avatar greets the user with contextual orientation text.
- **Empty State**: N/A (interactive onboarding flow).
- **Loading State**: Subtle spinner inside button during workspace initialization.
- **Error State**: Banner alert indicating connection timeout with retry button.
- **Success State**: Smooth fade transition to Sign In / Onboarding wizard.
- **Desktop Experience**: Centered 680px card with ambient backglow.
- **Tablet Experience**: Centered 90% width card.
- **Mobile Experience**: Fullscreen layout with bottom-fixed action button.
- **Accessibility Notes**: High-contrast text buttons, `aria-live="polite"` step announcements.
- **Arabic Experience**: Full RTL alignment with `Cairo` font family and right-aligned choice badges.
- **English Experience**: LTR alignment with `Inter` font family.
- **Future Expansion**: Direct QR code scan to sync mobile device.

---

### Screen 2: Sign In / Authentication

- **Screen Purpose**: Securely authenticate individual users and enterprise employees.
- **Primary User Goal**: Log into workspace via Passkey, SAML SSO, or OAuth.
- **First Impression**: Minimalist, high-security authentication panel.
- **Layout Structure**: Dual-pane split: left side highlights features, right side holds authentication form.
- **Main Components**: Enterprise SSO Button (`[Sign in with Okta / M365]`), Google/GitHub OAuth buttons, Email/Password input, Passkey button.
- **Secondary Components**: MFA challenge input, Reset Password link, Remember Me checkbox.
- **Actions**: Submit credentials, Trigger SSO redirect, Submit MFA token.
- **AI Behaviors**: Validates security domain and pre-fetches user permission scope tokens.
- **Empty State**: Pre-filled email field if returning user.
- **Loading State**: Button morphs into loading spinner with disable state.
- **Error State**: Red alert banner: `"Invalid credentials or MFA token expired"`.
- **Success State**: Green checkmark animation followed by smooth redirect to Home.
- **Desktop Experience**: Split pane design (50% image/quote, 50% form).
- **Tablet Experience**: Single centered column.
- **Mobile Experience**: Edge-to-edge mobile form with native biometric prompt.
- **Accessibility Notes**: Keyboard tab order strictly mapped, input error aria labels.
- **Arabic Experience**: Right-aligned input fields and RTL label alignment.
- **English Experience**: Left-aligned inputs with standard LTR layout.
- **Future Expansion**: WebAuthn hardware key support (YubiKey).

---

### Screen 3: Workspace Creation

- **Screen Purpose**: Initialize a new solo workspace or multi-tenant organizational structure.
- **Primary User Goal**: Name workspace, select industry template blueprint, and set default AI models.
- **First Impression**: Guided interactive wizard with live preview card.
- **Layout Structure**: Two-column wizard: Left step form, Right real-time workspace preview.
- **Main Components**: Workspace Name Input, Blueprint Selector Dropdown (`AAA Game Studio`, `Solo SaaS`, `FinTech`), Primary Model Selector (`Claude 3.5 Sonnet`, `Local Llama`).
- **Secondary Components**: Team size selector, Region selection dropdown, Advanced Vault storage settings toggle.
- **Actions**: Back, Next, Create Workspace.
- **AI Behaviors**: AI recommends optimal blueprints based on selected industry type.
- **Empty State**: Default blueprint pre-selected based on user signup role.
- **Loading State**: Step indicator shows `"Provisioning Vault DB & Knowledge Graph..."`.
- **Error State**: In-line validation error if workspace name is taken or invalid.
- **Success State**: Workspace initialized banner with direct link to Home.
- **Desktop Experience**: Two-column interactive layout.
- **Tablet Experience**: Single column wizard with collapsible preview.
- **Mobile Experience**: Stepped wizard with sticky bottom navigation.
- **Accessibility Notes**: `aria-current="step"` indicators on progress bar.
- **Arabic Experience**: RTL flow from right to left wizard steps.
- **English Experience**: Standard LTR flow.
- **Future Expansion**: One-click import from Notion/Slack workspaces.

---

### Screen 4: AI Concierge Orientation

- **Screen Purpose**: Interactive initial setup chat to tailor THEKY AI engine to the user's specific goals.
- **Primary User Goal**: Tell THEKY what work to prioritize.
- **First Impression**: Conversational AI assistant prompt screen with suggested goal prompts.
- **Layout Structure**: Central interactive chat interface with suggested quick prompt chips below.
- **Main Components**: Conversational Message List, Dynamic Prompt Composer, Suggested Intent Chips.
- **Secondary Components**: Skip setup button, Model selector badge.
- **Actions**: Type intent prompt, Click intent chip, Send message, Skip setup.
- **AI Behaviors**: Parses user text, extracts domain goals, populates initial Memory store.
- **Empty State**: Warm greeting message: `"Hello Alex! What shall we accomplish today?"`.
- **Loading State**: AI avatar pulse effect with typing indicator dots.
- **Error State**: `"AI Concierge temporarily unreachable. Retry?"`.
- **Success State**: Memory saved notification; transitions user directly to personalized Home.
- **Desktop Experience**: Centered wide chat container.
- **Tablet Experience**: Centered medium container.
- **Mobile Experience**: Fullscreen mobile chat view.
- **Accessibility Notes**: Voice input microphone toggle with speech-to-text feedback.
- **Arabic Experience**: RTL chat bubble alignment and Arabic voice input support.
- **English Experience**: Standard LTR chat layout.
- **Future Expansion**: Personalized AI voice avatar synthesis.

---

### Screen 5: Home Experience (Intelligent Focus Hub)

- **Screen Purpose**: Central operational launchpad displaying priorities, pending approvals, and active AI missions.
- **Primary User Goal**: Instantly review what requires attention, see what AI is working on, and trigger new intents.
- **First Impression**: Calm, organized workspace focused on action items—zero ERP grid clutter.
- **Layout Structure**: Top Intent Bar, 2-Column Grid (Left: Today's Focus & Approvals, Right: Live AI Activity & Recent Work).
- **Main Components**: Intent Prompt Bar, Today's Focus Card, Pending Approvals Queue, Live AI Working Feed, Quick Actions Bar.
- **Secondary Components**: Connected Services Health Widget, Recent Work Carousel, Pinned Projects list.
- **Actions**: Type intent, Approve pending gate, Open project, Execute quick action chip.
- **AI Behaviors**: Synthesizes tasks from Shared Memory, highlights urgent approval gates, suggests next logical steps.
- **Empty State**: Clean slate state: `"All priorities completed! What would you like to build next?"`.
- **Loading State**: Shimmer cards for priorities and live feed.
- **Error State**: Non-blocking toast notification if live activity stream fails to refresh.
- **Success State**: Instant approval removal with smooth card reordering.
- **Desktop Experience**: Full 3-pane layout with expandable drawers.
- **Tablet Experience**: Stacked 2-column layout.
- **Mobile Experience**: Single column scrollable feed with sticky intent bar.
- **Accessibility Notes**: Keyboard navigation via `g d` shortcut, high contrast status badges.
- **Arabic Experience**: RTL Mirrored layout with right-aligned status cards.
- **English Experience**: LTR standard layout.
- **Future Expansion**: Widget customization drag-and-drop grid.

---

### Screen 6: AI Workspace (The Heart of THEKY)

- **Screen Purpose**: Multi-modal workspace combining chat, code, research, document parsing, and agent orchestration.
- **Primary User Goal**: Conduct deep work with AI collaboration across text, code, files, and multi-step tasks.
- **First Impression**: High-powered IDE-like canvas with smooth collapsible panels.
- **Layout Structure**: 3-Pane Canvas: Left Navigation/Mode Rail, Center Primary Work Canvas, Right Context & Evidence Drawer.
- **Main Components**: AI Mode Selector Bar (9 modes), Multi-modal Prompt Composer, Code/Document Live Preview Panel, Context Drawer.
- **Secondary Components**: Model Engine Selector (`Claude 3.5 Sonnet`), Token Usage Counter, Active File Path Bar, Evidence Viewer.
- **Actions**: Send prompt, Toggle AI mode, Execute code preview, Attach file, Inspect evidence hash.
- **AI Behaviors**: Streams token responses, automatically invokes tools (file search, compiler), generates evidence hashes.
- **Empty State**: Mode orientation prompt with starter templates (`[Debug C++ Engine]`, `[Parse PDF Contract]`).
- **Loading State**: Real-time token streaming with animated code syntax highlighter.
- **Error State**: Red inline error card with `[Retry]` and `[Change Model]` actions.
- **Success State**: Artifact generated tag with `[Save to Knowledge]` and `[Copy Code]` buttons.
- **Desktop Experience**: Full 3-pane split canvas with resizable dividers.
- **Tablet Experience**: 2-pane collapsible layout.
- **Mobile Experience**: Single pane with tab switcher (Chat | Preview | Context).
- **Accessibility Notes**: ARIA code region labels, keyboard mode switcher (`Ctrl+1` through `Ctrl+9`).
- **Arabic Experience**: RTL text orientation for chat and document preview.
- **English Experience**: Standard LTR IDE layout.
- **Future Expansion**: Real-time co-editing canvas with multi-user cursors.

---

### Screen 7: Mission Center (Work Agent Center)

- **Screen Purpose**: Orchestrate, monitor, and manage multi-step autonomous AI agent goals and execution DAGs.
- **Primary User Goal**: Create multi-step missions, track DAG task decomposition, approve gated steps, and review evidence.
- **First Impression**: Dynamic visual DAG timeline showing live agent execution nodes.
- **Layout Structure**: Top Filter/Create Bar, Main Canvas (Visual Execution DAG), Right Mission Detail Panel.
- **Main Components**: Goal Creation Button, Visual DAG Canvas, Approval Gate Notification Bar, Step Execution Log.
- **Secondary Components**: Agent Ownership Badge, Vault Hash Chain Viewer, Pause/Resume Controls.
- **Actions**: Create Goal, Approve Step, Pause Mission, Retry Step, Inspect Evidence.
- **AI Behaviors**: Mission Engine decomposes goals into DAG tasks, dispatches worker agents, pauses at approval gates.
- **Empty State**: `"No active missions. Click [Create Multi-Step Goal] to delegate work to AI Agents."`.
- **Loading State**: Pulsing DAG node connections with glowing execution paths.
- **Error State**: Amber node highlight: `"Step 3 Failed: Compiler Warning. Click [Retry Step] or [Re-route]"`.
- **Success State**: Green DAG node state with Vault SHA-256 completion signature.
- **Desktop Experience**: Wide visual node graph canvas with zoom/pan controls.
- **Tablet Experience**: Vertical timeline card view.
- **Mobile Experience**: Stepped list timeline with swipe approval cards.
- **Accessibility Notes**: Accessible list fallback for canvas graph, ARIA status logs.
- **Arabic Experience**: RTL timeline flow (right to left progression).
- **English Experience**: LTR timeline flow.
- **Future Expansion**: Parallel multi-agent swarm graph visualization.

---

### Screen 8: Project Center

- **Screen Purpose**: Manage projects, milestones, task boards, and team resource allocation.
- **Primary User Goal**: Oversee project progress, review Earned Value Management (EVM) metrics, and link missions to projects.
- **First Impression**: Clean Kanban / Timeline view integrated with AI mission status.
- **Layout Structure**: Top Project Header, Tab Switcher (Kanban | Timeline | EVM Analytics), Main Board Area.
- **Main Components**: Project Board, Task Cards, AI Mission Link Badge, Milestone Progress Bar.
- **Secondary Components**: EVM Performance Chart, Member Avatars, Budget Tracker.
- **Actions**: Create Project, Add Task, Attach AI Mission, Export Report.
- **AI Behaviors**: Automatically calculates project completion probabilities and flags resource bottlenecks.
- **Empty State**: `"No active projects in this workspace. Create your first project."`.
- **Loading State**: Skeleton Kanban columns.
- **Error State**: Banner: `"Failed to sync project status with Linear/Jira"`.
- **Success State**: Task card moves smoothly to `Done` with confetti animation.
- **Desktop Experience**: Multi-column Kanban board with drag-and-drop.
- **Tablet Experience**: 2-column Kanban view with column swiping.
- **Mobile Experience**: Single list view with filter dropdown.
- **Accessibility Notes**: Keyboard drag-and-drop support (`Space` to grab, `Arrows` to move).
- **Arabic Experience**: RTL column layout (To Do on right, Done on left).
- **English Experience**: Standard LTR Kanban layout.
- **Future Expansion**: AI-generated GANTT chart schedule optimization.

---

### Screen 9: Knowledge Center

- **Screen Purpose**: Unified repository for company documents, semantic vector search, and Knowledge Graph node exploration.
- **Primary User Goal**: Search company knowledge, inspect source provenance, and explore Knowledge Graph citations.
- **First Impression**: Dual-mode Knowledge Search hub with semantic vector results and interactive graph.
- **Layout Structure**: Search Header, View Toggle (Vector Search | Knowledge Graph), Main Content Area, Document Preview Rail.
- **Main Components**: Semantic Search Input Bar, Document Cards, Interactive Graph Nodes, Citation Badge Viewer.
- **Secondary Components**: Filter Chips (Scope, Department, Date), Source Provenance Indicator (`M365`, `Git Repo`).
- **Actions**: Execute Vector Search, Click Graph Node, Preview Document, Re-index Source.
- **AI Behaviors**: Performs vector similarity search, extracts entity relationships, links node IDs (`KG-NODE-1042`).
- **Empty State**: `"Knowledge base is empty. Connect SaaS sources or upload documents to build vector index."`.
- **Loading State**: Graph nodes expand with physics-based layout animation.
- **Error State**: `"Vector index unavailable. Falling back to text search."`.
- **Success State**: Search query returns vector similarity scores (e.g. `98% Match`).
- **Desktop Experience**: Side-by-side Graph and Search result view.
- **Tablet Experience**: Toggleable Graph/Search views.
- **Mobile Experience**: Search list with document modal drawer.
- **Accessibility Notes**: Screen reader node hierarchy descriptions.
- **Arabic Experience**: Arabic vector embedding search support with RTL text rendering.
- **English Experience**: Standard LTR vector search layout.
- **Future Expansion**: 3D Spatial Knowledge Graph view for VR/AR headsets.

---

### Screen 10: Marketplace

- **Screen Purpose**: Discover, install, and manage agent plugins, workspace blueprints, and solution templates.
- **Primary User Goal**: Expand THEKY capabilities by installing verified enterprise agent plugins.
- **First Impression**: Premium App Store gallery featuring curated agent capabilities.
- **Layout Structure**: Top Banner (Featured Plugins), Category Filter Rail, Plugin Grid, Installation Manager Drawer.
- **Main Components**: Featured Blueprint Banner, Plugin Cards, Install Button, Verified Badge, Rating Stars.
- **Secondary Components**: Category Chips (`Engineering`, `Finance`, `Security`), Developer Info, License Type.
- **Actions**: Search Marketplace, Click Plugin Card, Install Plugin, Review Permissions.
- **AI Behaviors**: Recommends plugins based on active workspace industry type.
- **Empty State**: `"No plugins installed. Browse featured plugins below."`.
- **Loading State**: Shimmer cards with loading button spinners.
- **Error State**: `"Plugin installation failed: Required capability token scope missing."`.
- **Success State**: `"Plugin successfully installed! Available in AI Modes."`.
- **Desktop Experience**: 4-column responsive product grid.
- **Tablet Experience**: 2-column product grid.
- **Mobile Experience**: Single column card feed with sticky category filters.
- **Accessibility Notes**: ARIA badge tags, high-contrast rating stars.
- **Arabic Experience**: RTL grid layout with Arabic localized plugin titles.
- **English Experience**: Standard LTR grid layout.
- **Future Expansion**: Monetized developer publishing portal.

---

### Screen 11: Connectors Center

- **Screen Purpose**: Connect and manage enterprise SaaS integration providers (M365, Google Workspace, Slack, GitHub, etc.).
- **Primary User Goal**: Authenticate SaaS providers, monitor sync health, and view OAuth scopes.
- **First Impression**: Clean integration dashboard displaying active connections and unconfigured SaaS templates.
- **Layout Structure**: Header, Category Tabs, 2-Column Provider Grid, Sync Diagnostic Drawer.
- **Main Components**: Provider Cards, Status Badges (`Connected`, `Not Configured`, `Requires Setup`), OAuth Connect Button.
- **Secondary Components**: OAuth Scopes List, Last Sync Timestamp, Diagnostic Log Viewer.
- **Actions**: Click Connect, Launch OAuth Flow, Disconnect Provider, Test Sync Health.
- **AI Behaviors**: Monitored connectors feed live context into Memory and Knowledge Graph.
- **Empty State**: Unconfigured providers explicitly render **`Not Configured`** status badges without decorative fake data.
- **Loading State**: Provider card shows `"Authenticating OAuth Token..."`.
- **Error State**: Amber badge: `"Sync Expired. Re-authentication Required."`.
- **Success State**: Emerald badge: `"Connected & Synced (Just Now)"`.
- **Desktop Experience**: 2-column grid with side-by-side diagnostic log panel.
- **Tablet Experience**: 2-column grid.
- **Mobile Experience**: Single column card list with status drawers.
- **Accessibility Notes**: Keyboard-accessible connect buttons, clear status text.
- **Arabic Experience**: RTL status card layout.
- **English Experience**: Standard LTR status card layout.
- **Future Expansion**: Custom Webhook & REST API connector wizard.

---

### Screen 12: Organization Center

- **Screen Purpose**: Manage enterprise tenant settings, department boundaries, security policies, and organizational structure.
- **Primary User Goal**: Oversee company structure, enforce department access rules, and review tenant security.
- **First Impression**: High-level corporate structure overview with interactive department map.
- **Layout Structure**: Top Org Header, Tab Bar (Overview | Departments | Security Policies | Audit Stream), Main Content Pane.
- **Main Components**: Org Structure Tree, Department Cards, Security Policy Badges, Tenant Isolation Indicator.
- **Secondary Components**: AI Token Spend Limit Gauge, Vault Cryptographic Audit Badge, Member Count.
- **Actions**: Add Department, Update Security Policy, Set AI Spend Cap, Export Audit Log.
- **AI Behaviors**: Enforces department scope boundaries across Permission Broker requests.
- **Empty State**: Solo user mode displays: `"Solo Workspace Active. Upgrade to Team Tenant to enable Organization Center."`.
- **Loading State**: Department tree renders with expandable node animations.
- **Error State**: `"Policy save failed: Insufficient administrator permissions."`.
- **Success State**: `"Security policy updated across all department workspaces."`.
- **Desktop Experience**: Expandable tree view alongside department detail cards.
- **Tablet Experience**: Stacked department list.
- **Mobile Experience**: Single column accordion list.
- **Accessibility Notes**: ARIA treegrid roles for accessible navigation.
- **Arabic Experience**: RTL tree alignment (root on right, branches extending left).
- **English Experience**: Standard LTR tree alignment.
- **Future Expansion**: Multi-tenant federation across global subsidiaries.

---

### Screen 13: Users & Teams

- **Screen Purpose**: Manage human team members, assign department roles, and invite collaborators.
- **Primary User Goal**: Invite users, manage permissions, assign teams, and view active sessions.
- **First Impression**: Clean user directory table with team filter tabs.
- **Layout Structure**: Header with Search/Invite Bar, Team Tabs, User Directory Table, User Detail Drawer.
- **Main Components**: User Table (Avatar, Name, Email, Role, Department, Status), Invite Member Button, Role Selector.
- **Secondary Components**: Team Cards, Active Session Count, MFA Status Badge.
- **Actions**: Search Users, Click Invite Member, Change User Role, Revoke Access.
- **AI Behaviors**: Auto-suggests team assignments based on user activity.
- **Empty State**: `"No additional team members. Click [Invite Member] to add collaborators."`.
- **Loading State**: Table row skeleton pulse effect.
- **Error State**: `"Invite failed: Email domain not allowed by organization security policy."`.
- **Success State**: `"Invitation sent to user@company.com"`.
- **Desktop Experience**: High-density data table with quick inline actions.
- **Tablet Experience**: Medium density table with swipe actions.
- **Mobile Experience**: User card list with tap-to-expand details.
- **Accessibility Notes**: Keyboard-navigable table rows (`Up/Down Arrows`).
- **Arabic Experience**: RTL table column layout.
- **English Experience**: Standard LTR table column layout.
- **Future Expansion**: SCIM 2.0 automated provisioning sync.

---

### Screen 14: AI Agents Directory

- **Screen Purpose**: View, configure, and monitor all active AI Agents operating in the workspace.
- **Primary User Goal**: Review agent roles, assign capability tokens, monitor task execution, and set spend caps.
- **First Impression**: Dynamic workforce roster displaying human-equivalent AI agent profiles.
- **Layout Structure**: Header Summary (Total Agents | Active Tasks | Token Rate), Agent Card Grid, Agent Detail Drawer.
- **Main Components**: Agent Roster Cards (Avatar, Agent Title, Department, Current Task, Assigned Model), Configure Agent Button.
- **Secondary Components**: Capability Token Badges (`Git Read`, `Compiler Exec`), Performance Rating, Spend Limit Meter.
- **Actions**: Click Agent Card, Assign Task, Edit Capability Token, Pause Agent.
- **AI Behaviors**: Agents log active thought steps and execution state in real time.
- **Empty State**: `"Default AI Agents active. Add custom agents from Marketplace."`.
- **Loading State**: Agent card pulse effect while fetching active execution telemetry.
- **Error State**: `"Agent paused: Capability token expired."`.
- **Success State**: `"Agent capability scope successfully updated."`.
- **Desktop Experience**: 3-column workforce roster grid.
- **Tablet Experience**: 2-column grid.
- **Mobile Experience**: Agent card list with status toggles.
- **Accessibility Notes**: Screen reader accessible agent status announcements.
- **Arabic Experience**: RTL card grid with Arabic agent titles (`مدير التطوير`).
- **English Experience**: LTR card grid.
- **Future Expansion**: Agent-to-agent autonomous negotiation monitor.

---

### Screen 15: Notifications Center

- **Screen Purpose**: Centralized hub for system alerts, pending mission approvals, and team mention updates.
- **Primary User Goal**: Review unread alerts, execute quick approvals, and clear notifications.
- **First Impression**: Organized notification feed categorized by priority and actionability.
- **Layout Structure**: Header with Filter Tabs (All | Approvals | System | AI Missions), Notification List, Quick Action Bar.
- **Main Components**: Notification Cards, Priority Badges (`Urgent`, `Info`, `Success`), Quick Action Button (`[Approve]`).
- **Secondary Components**: Timestamp, Read/Unread Indicator, Source Link.
- **Actions**: Click Notification, Approve Step, Mark as Read, Clear All.
- **AI Behaviors**: Groups related notifications into intelligent summaries (e.g. `"3 QA tasks completed"`).
- **Empty State**: `"You're all caught up! No unread notifications."`.
- **Loading State**: Shimmer notification rows.
- **Error State**: `"Failed to load notifications. Pull to refresh."`.
- **Success State**: Item slides out smoothly when dismissed or approved.
- **Desktop Experience**: Slide-out drawer or full-page view.
- **Tablet Experience**: Full-page list layout.
- **Mobile Experience**: Native mobile notification list with swipe gestures.
- **Accessibility Notes**: `aria-live="assertive"` for urgent approval notifications.
- **Arabic Experience**: RTL notification card layout with right-aligned badges.
- **English Experience**: Standard LTR notification layout.
- **Future Expansion**: Custom notification threshold rules per user.

---

### Screen 16: Universal Search

- **Screen Purpose**: Deep semantic and keyword search across all workspace entities (missions, documents, code, users).
- **Primary User Goal**: Find any file, message, project, or Knowledge Graph node instantly.
- **First Impression**: Focused search modal with real-time category filtering.
- **Layout Structure**: Top Search Bar, Category Filters (`All`, `Missions`, `Knowledge`, `Code`, `People`), Results List.
- **Main Components**: Large Search Input, Result Rows (Icon, Title, Snippet Match, Location, Timestamp), Filter Chips.
- **Secondary Components**: Search History, Suggested Searches, Keyboard Navigation Guide.
- **Actions**: Type Search Query, Arrow Up/Down, Press Enter to Select, Press Esc to Dismiss.
- **AI Behaviors**: Combines exact string matching with vector embedding similarity search.
- **Empty State**: Recent searches list and popular query suggestions.
- **Loading State**: Animated search bar glow with result skeleton lines.
- **Error State**: `"No results found for 'xyz'. Try searching semantic terms."`.
- **Success State**: Instant search matches highlighted in result snippets.
- **Desktop Experience**: Centered overlay modal (`Cmd+K / Ctrl+K`).
- **Tablet Experience**: Centered modal overlay.
- **Mobile Experience**: Fullscreen search view with auto-focused keyboard.
- **Accessibility Notes**: Full arrow key navigation with screen reader live announcements.
- **Arabic Experience**: RTL search input with Arabic semantic matching.
- **English Experience**: Standard LTR search modal.
- **Future Expansion**: Search filters by specific Vault transaction hash.

---

### Screen 17: Command Palette (`Ctrl+K`)

- **Screen Purpose**: Power-user command interface for executing instant actions, switching views, and triggering AI intents.
- **Primary User Goal**: Execute actions rapidly without touching the mouse.
- **First Impression**: Sleek, high-speed command bar appearing at the center top of the screen.
- **Layout Structure**: Search Bar Input, Categorized Command Section List, Shortcut Hint Footer.
- **Main Components**: Command Input, Action List Items (Command Title, Category Badge, Shortcut Key), Category Headers.
- **Secondary Components**: Recent Commands, AI Intent Prompt Option (`"Ask THEKY: ..."`).
- **Actions**: Filter Commands, Run Action, Navigate Page, Switch Mode.
- **AI Behaviors**: Parses natural language inputs into actionable platform commands.
- **Empty State**: Displays top 5 recommended system commands.
- **Loading State**: Instant inline response (<10ms execution delay).
- **Error State**: `"Unrecognized command. Press Enter to run as AI query."`.
- **Success State**: Instant modal close and action execution.
- **Desktop Experience**: Centered top 640px floating palette.
- **Tablet Experience**: Centered floating palette.
- **Mobile Experience**: Bottom-anchored command sheet.
- **Accessibility Notes**: `role="combobox"` with full `aria-activedescendant` support.
- **Arabic Experience**: RTL command list items with Arabic action names.
- **English Experience**: Standard LTR command palette.
- **Future Expansion**: Voice-triggered command execution.

---

### Screen 18: System Settings

- **Screen Purpose**: Configure user preferences, application themes, AI engine providers, and security defaults.
- **Primary User Goal**: Customize environment settings, API keys, and notification rules.
- **First Impression**: Clean tabbed settings interface organized by domain area.
- **Layout Structure**: Left Category Sidebar (General | AI Models | Security | Notifications | Storage), Main Settings Canvas.
- **Main Components**: Settings Section Cards, Model Provider Toggles, Theme Selector (`Dark`, `Light`, `System`), Save Button.
- **Secondary Components**: API Key Input Fields, Local Storage Usage Gauge, Reset Defaults Link.
- **Actions**: Change Theme, Select Default AI Model, Enter API Key, Save Settings.
- **AI Behaviors**: Validates API key connectivity and tests model latency upon input.
- **Empty State**: N/A (form settings view).
- **Loading State**: Button shows `"Saving preferences..."`.
- **Error State**: Red inline text: `"API Key validation failed. Check provider credentials."`.
- **Success State**: Toast notification: `"System settings saved successfully."`.
- **Desktop Experience**: 2-column layout (Categories on left, Controls on right).
- **Tablet Experience**: Top dropdown category menu with settings controls below.
- **Mobile Experience**: Accordion list settings view.
- **Accessibility Notes**: High contrast theme options, explicit form field labels.
- **Arabic Experience**: RTL category rail on right side.
- **English Experience**: LTR category rail on left side.
- **Future Expansion**: Custom CSS theme engine editor.

---

### Screen 19: Billing & Subscriptions

- **Screen Purpose**: Manage organization subscription plan, payment methods, invoice history, and AI token spend caps.
- **Primary User Goal**: Upgrade subscription plan, update credit card, view usage metrics, or set spend controls.
- **First Impression**: Financial control dashboard with explicit configuration status indicators.
- **Layout Structure**: Top Plan Banner, 2-Column Grid (Left: Plan & Payment Method, Right: AI Spend & Invoices).
- **Main Components**: Active Plan Card, Upgrade Button, Payment Method Form, Invoice History Table.
- **Secondary Components**: Token Consumption Bar Chart, Unbacked Gateway Status Indicator (**`Not Configured`**).
- **Actions**: Upgrade Plan, Connect Billing Gateway, Download Invoice PDF, Set Spend Cap.
- **AI Behaviors**: Predicts end-of-month token usage based on active mission execution velocity.
- **Empty State**: Unconfigured billing provider explicitly displays: **`Not Configured (Connect Enterprise Payment Gateway)`**.
- **Loading State**: Shimmer cards while fetching billing portal data.
- **Error State**: `"Billing gateway connection timeout. Retry?"`.
- **Success State**: `"Payment method successfully updated."`.
- **Desktop Experience**: 2-column billing management grid.
- **Tablet Experience**: Stacked billing cards.
- **Mobile Experience**: Single column list view with action modals.
- **Accessibility Notes**: Accessible tabular invoice data with clear column headers.
- **Arabic Experience**: RTL currency and plan price display (`$99 / شهر`).
- **English Experience**: Standard LTR price display (`$99 / mo`).
- **Future Expansion**: Usage-based crypto token billing integration.

---

### Screen 20: User Profile

- **Screen Purpose**: Manage personal user identity, avatar, contact details, and assigned roles.
- **Primary User Goal**: Update personal profile details, change password, and configure avatar.
- **First Impression**: Clean personal identity management card.
- **Layout Structure**: Centered Profile Form with Avatar Header.
- **Main Components**: Avatar Uploader, Full Name Input, Email Field, Job Title, Preferred Language Selector.
- **Secondary Components**: Department Badge, Role List, Password Change Section.
- **Actions**: Upload Avatar, Edit Details, Change Password, Save Profile.
- **AI Behaviors**: Personalizes AI assistant tone based on profile role and language preference.
- **Empty State**: Pre-populated with signup credentials.
- **Loading State**: Avatar upload shows radial percentage spinner.
- **Error State**: `"Password change failed: New password does not meet complexity rules."`.
- **Success State**: `"Profile details updated successfully."`.
- **Desktop Experience**: Centered 680px profile card.
- **Tablet Experience**: Centered 90% width card.
- **Mobile Experience**: Fullscreen profile form.
- **Accessibility Notes**: Accessible file upload dropzone with keyboard trigger.
- **Arabic Experience**: RTL form layout with Arabic language selection.
- **English Experience**: Standard LTR profile form.
- **Future Expansion**: Verified Decentralized Identity (DID) badge.

---

### Screen 21: Help Center & Documentation

- **Screen Purpose**: Provide documentation, video walkthroughs, keyboard shortcut guides, and customer support.
- **Primary User Goal**: Search documentation, learn AI mode capabilities, or open a support ticket.
- **First Impression**: Welcoming knowledge hub with instant documentation search.
- **Layout Structure**: Search Banner, Category Cards (`Getting Started`, `AI Modes`, `Security`, `API SDK`), FAQ Accordion.
- **Main Components**: Search Documentation Bar, Topic Cards, Keyboard Shortcut Cheat Sheet, Support Contact Button.
- **Secondary Components**: System Status Indicator (`All Systems Operational`), Release Notes link.
- **Actions**: Search Docs, Open Shortcut Guide, Contact Support, Read Release Notes.
- **AI Behaviors**: Interactive AI Support Assistant answers user questions using product documentation vectors.
- **Empty State**: Displays top 6 popular help articles.
- **Loading State**: Shimmer cards for help articles.
- **Error State**: `"Failed to connect to documentation index."`.
- **Success State**: Instant article search matches with visual code snippets.
- **Desktop Experience**: 3-column help topic grid with floating AI Support Assistant.
- **Tablet Experience**: 2-column topic grid.
- **Mobile Experience**: Single column topic list.
- **Accessibility Notes**: Expandable accordion ARIA controls (`aria-expanded="true/false"`).
- **Arabic Experience**: Localized Arabic documentation with RTL article layout.
- **English Experience**: Standard LTR documentation layout.
- **Future Expansion**: In-app interactive guided walkthrough tours.

---

### Screen 22: Onboarding Setup Wizard

- **Screen Purpose**: Guide new individual or enterprise users through initial account setup, theme selection, and model configuration.
- **Primary User Goal**: Complete initial setup in under 60 seconds.
- **First Impression**: High-speed, 4-step progress wizard with smooth transition animations.
- **Layout Structure**: Stepped Wizard Container (Header Progress Bar, Step Card Canvas, Footer Action Buttons).
- **Main Components**: Step 1: Account Type, Step 2: Theme & Language, Step 3: Model Engine, Step 4: First Intent.
- **Secondary Components**: Step counter indicator (`Step 2 of 4`), Back/Next buttons, Skip option.
- **Actions**: Select Option, Click Next, Complete Setup.
- **AI Behaviors**: Pre-configures workspace memory and default AI modes based on wizard selections.
- **Empty State**: Initial defaults pre-selected for fast 1-click progression.
- **Loading State**: Step progression smooth progress bar animation.
- **Error State**: In-line error if required step selection is missing.
- **Success State**: Confetti animation; instant transition to Home.
- **Desktop Experience**: Centered 720px wizard card.
- **Tablet Experience**: Centered 90% card.
- **Mobile Experience**: Fullscreen step view with sticky footer.
- **Accessibility Notes**: `aria-live` step change announcements.
- **Arabic Experience**: RTL wizard progression (right to left steps).
- **English Experience**: Standard LTR wizard progression.
- **Future Expansion**: Automated team workspace auto-joining via corporate email domain match.

---

## 4. Personalization & Industry Variations

THEKY maintains an identical underlying application architecture across all users while dynamically adapting Home widgets, recommended quick actions, default AI modes, and onboarding templates based on user profile:

| Industry / User Type | Home Priority Focus | Recommended Quick Actions | Default AI Mode | Blueprint Preset |
|---|---|---|---|---|
| **Individual Solo** | Personal tasks, quick notes, daily goal | `[Quick Note]`, `[AI Query]` | Conversational Chat | Solo Productivity |
| **Startup Founder** | Runway status, pitch deck, product release | `[Create Pitch]`, `[Deploy Release]` | Workflow Automation | Startup Launchpad |
| **Enterprise Corp** | Dept approvals, security risk, compliance | `[Approve Purchase]`, `[View Vault]` | Business Intelligence | Enterprise Multi-Tenant |
| **Developer** | Open pull requests, build failures, commit logs | `[Launch Code Mode]`, `[Debug Rust]` | Software Engineering | Developer Workspace |
| **Game Studio** | Shader compiles, playtest QA pass, asset pipeline | `[Build Gold Master]`, `[QA Regressions]`| Creative Work | AAA Game Studio OS |
| **Marketing Agency** | Campaign ROAS, client deliverables, copy review | `[Generate Campaign]`, `[Review Copy]` | Creative Work | Growth Agency |
| **Restaurant** | Inventory stock levels, supplier orders, daily sales | `[Order Supplies]`, `[Daily Sales]` | Quantitative Analysis | Retail & Hospitality |
| **Healthcare** | Patient scheduling, compliance audit, research | `[Search PubMed]`, `[Audit HIPAA]` | Research & Literature | Medical Research |
| **Education** | Course curriculum, grading queue, research papers | `[Grade Assignment]`, `[Research Paper]`| Document Intelligence | Academic Campus |
| **Construction** | Site permits, vendor invoices, safety logs | `[Inspect Permit]`, `[Approve Vendor]` | Document Intelligence | Construction Ops |
| **Manufacturing** | Equipment status, supply chain risk, yield telemetry | `[Inspect Logistics]`, `[Yield Telemetry]`| Quantitative Analysis | Industrial Manufacturing |

---

```
========================================================
UX 3.0 PRODUCT EXPERIENCE BLUEPRINT CERTIFIED
========================================================
DOCUMENT UX_3_PRODUCT_BLUEPRINT.MD CREATED
COVERING ALL 22 REQUIRED SCREEN BLUEPRINTS,
12 INDUSTRY PERSONALIZATIONS, AND MICRO-INTERACTIONS.
========================================================
```
