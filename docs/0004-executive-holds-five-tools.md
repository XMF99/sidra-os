# ADR-0004 — The Executive holds only five tools

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Kai (`agent.exec`) sees every Directive, reads across the whole Vault, and directs every other agent. That
makes Kai simultaneously the most useful agent and the most dangerous one: the largest context, the broadest
trust, and the highest exposure to untrusted content flowing in from ingested sources. An injection that
captures Kai captures the Firm.

There is also a product failure mode independent of security. An executive with tools uses them. Every tool
given to Kai is a task Kai will do personally instead of delegating, which collapses the organisation into a
single agent with a nice interface — the exact thing Principle 2 exists to prevent.

## Options

1. **Kai holds the full toolset.** Fastest for simple tasks; collapses the org and maximises blast radius.
2. **Kai holds a curated subset.** Requires defending each addition; the line is arguable but real.
3. **Kai holds no tools at all.** Purest, but Kai then cannot read the Vault to staff a Directive
   intelligently, and staffing quality is the product.

## Decision

Kai holds exactly five capabilities: **retrieve** (read memory and the Vault), **delegate** (issue a Work
Order), **convene** (call a meeting), **decide** (record a Decision), and **report** (produce a Brief). No
filesystem writes, no network egress, no code execution, no external tool of any kind. Anything else Kai needs
done is delegated, which is what an executive is for.

## Consequences

**Accepted:** trivial requests cost one extra delegation hop. The fast lane mitigates this — it routes a
Directive to a single specialist without a full staffing cycle — but the hop is real and it is the price of
the property.

**Accepted:** Kai can never "just fix it." Every effect in the system has an author who is not the executive,
which is also what makes attribution meaningful.

**Gained:** the highest-context, highest-trust agent has almost no ability to cause an effect. A successful
injection against Kai can, at worst, cause a badly staffed Engagement — and the specialists it delegates to
have their own Fences and their own capability sets.

**Gained:** the organisation stays an organisation. The structural incentive points at delegation.

**Revisit if:** measurement shows the extra hop dominates latency for a majority of Directives even with the
fast lane. The response would be to widen the fast lane, not to give Kai tools.
