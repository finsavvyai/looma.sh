# `@looma/evidence-contract`

Version 1 defines a recipient- and purpose-bound `EvidenceManifest`. It keeps
immutable source-event references and source facts separate from derived facts.
Every derived fact names its input fact IDs and a versioned transform. Conflicts
remain explicit until a later authoritative reference supersedes them, and
withheld fields retain a machine-readable reason.

The manifest contains only synthetic hashes and references in its fixtures; it
does not authorize disclosure or copy source documents. Policy, retention,
consent, recipient, release, and signature evidence remain explicit.

The same exact-version compatibility rules as `@looma/event-contract` apply:
unknown versions fail closed, additive optional fields require a minor version,
breaking meaning or shape changes require a major version, and golden fixtures
never change within a released version.
