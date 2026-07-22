# ADR-0050 — The Companion is a paired, untrusted client

**Status:** Proposed · **Date:** 2.5 "Field" (M18) · **Supersedes:** —

## Context

M18 puts a second surface — a phone — in front of the Vault for the first time. The security model
(`/docs/07-security-model.md` §2) already names exactly one class for a surface that displays state and
issues commands but holds nothing valuable: the **untrusted renderer**. The desktop WebView is in that class;
"assume compromised" applies to it, and nothing it can call may grant itself authority
(`/docs/01-technical-architecture.md` §4).

The phone must join that class, not a new one. But it differs from the desktop renderer in a way that forces
a decision: the desktop renderer is co-located with the kernel behind Tauri's IPC ACLs, on the same machine,
inside the same trust boundary's physical envelope. The phone is a **separate device on a network**, may be
**lost or stolen**, and reaches the kernel (or the relay) over a link that is not the local IPC bus. Two
questions follow that the renderer never had to answer:

1. **How does the kernel know a given phone is the Principal's phone**, and not an attacker's, before it
   accepts an outbox entry as the Principal's signed intent?
2. **How is that trust withdrawn** when the phone is lost, without rewriting history or trusting the phone to
   cooperate in its own revocation?

If these are answered by convention rather than mechanism, "the phone is untrusted" is an adjective, and the
lost-phone threat (a new T-class in this milestone) has no mitigation.

## Options

1. **No pairing — any device with the relay address can sync.** Simplest. Rejected: it makes the relay a
   credential and any phone that reaches it a Principal. There is no device identity to sign an approval with,
   so a reconciled Decision could not be attributed, and a lost phone could not be distinguished from a
   trusted one.

2. **A shared secret typed into the phone.** Better, but the secret is bearer authority: copyable,
   phishable, and unrevocable without rotating it everywhere. It also tends to end up in a log or a backup —
   exactly what `/docs/07-security-model.md` §9 redaction exists to prevent, and a poor fit for a device that
   may be seized.

3. **Per-device keypair established by an explicit, Principal-confirmed pairing act, with a revocable trust
   record on the chain (chosen).** Pairing is a logged Principal Decision: the desktop displays a
   short-lived, out-of-band pairing code; the phone generates a device keypair, proves possession of the code,
   and the kernel records a `companion_devices` row binding a `device_id` to the device's public key. The
   phone signs every outbox entry with its private key; the kernel verifies against the paired public key.
   Revocation is a second Decision that marks the device revoked — after which its signatures are refused at
   reconciliation, structurally, regardless of what the phone does.

## Decision

Option 3. **The Companion is the untrusted renderer class, extended to a networked device by a per-device
keypair and a revocable, logged pairing.**

- **Pairing is a Decision.** `begin_pairing` on the desktop mints a short-lived pairing challenge (displayed
  as a code/QR, never transmitted through the relay). The phone generates a device keypair in the platform
  secure enclave, answers the challenge, and the kernel writes a `companion_devices` row: `{ device_id,
  device_pubkey, paired_at, paired_by = 'principal', label, status = active }` and a `DevicePaired` event on
  the hash chain (ADR-0002). The **private key never leaves the phone's secure enclave; the public key never
  needs to be secret.** The Principal confirms the act in plain language (`/docs-v2/05-marketplace-and-packs.md`
  trust rule), so pairing spends attention once and is auditable forever.

- **Every phone-originated write is signed.** An `ApprovalOutboxEntry` (ADR-0049) carries a signature over its
  content by the device key. The kernel verifies it at reconciliation before the entry is considered the
  Principal's intent. An unsigned or wrongly-signed entry is discarded and logged; it can never become a
  Decision.

- **The phone holds no Vault secret.** Consistent with `/docs/07-security-model.md` §2 and
  `/docs/01-technical-architecture.md` §4: the device key authenticates the *device to the kernel*; it is not
  the Vault key, not a provider key, not a `KeychainRef`. Nothing that could decrypt the Vault or reach a
  model provider is ever on the phone. A snapshot the phone holds is display content and pending requests —
  never a credential.

- **Revocation is structural and one-sided.** `revoke_device` marks the row revoked and writes a
  `DeviceRevoked` event. From that point the kernel refuses every signature from that `device_id` at
  reconciliation — including any outbox the lost phone still holds and later manages to deliver. Revocation
  does not depend on the phone acknowledging anything, and it rewrites no history: a Decision the phone made
  *before* the loss and *before* revocation, if already reconciled, stands as the audited event it is;
  anything the phone captures after it is out of the Principal's hands is refused because the pairing that
  vouched for it is gone.

## Consequences

**Accepted: a pairing flow and a device-key mechanism to build and document.** A short-lived challenge, a
secure-enclave keypair, a signature check at reconciliation, and a device registry. Modest, and it reuses the
signing discipline the plugin/connector trust chain already relies on (Ed25519 over a payload,
`/docs/07-security-model.md` §8) — no new cryptographic primitive.

**Accepted: a lost phone can capture approvals until it is revoked.** Between loss and revocation, a thief
with an unlocked phone could clear the cached day's approvals. This is bounded by (a) the snapshot being only
the day's *pending* requests, not the Vault; (b) capture producing signed intent that still must reconcile
against a live kernel, where a suspicious pattern is visible; and (c) revocation refusing every later entry.
It is the same exposure a stolen unlocked laptop has to the desktop renderer, no worse, and the mitigation is
the same auto-lock and revoke posture.

**Gained: every phone-made Decision is attributable.** The reconciled Decision records which paired device
captured it. Legibility (Principle 4) extends to the second surface without a new concept.

**Gained: revocation needs no cooperation and no history rewrite.** A single Decision on the chain withdraws
trust; the append-only log is untouched. This is the lost-phone answer, and it is mechanical.

**Gained: the untrusted-client boundary holds across the network.** The phone joins the class the renderer
is already in. No API returns a secret to it (a rule inherited verbatim from the connector framework, M16
§12.3), and "assume the client is compromised" now covers the phone by the same reasoning it covers the
WebView.

**Reversal cost: low.** The device registry and pairing are additive (`companion_devices`, one event pair).
Removing M18 removes them; no existing trust boundary is altered, because this ADR *narrows into* the existing
untrusted-client class rather than creating a new one.
