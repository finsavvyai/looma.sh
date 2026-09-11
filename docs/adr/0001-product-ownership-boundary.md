# ADR-001: Product and ownership boundary

- Status: Accepted for R01
- Date: 2026-09-11
- Requirements: FR-001, FR-006, G0

## Decision

Looma owns domain-neutral event ingress contracts, canonicalization,
correlation references, evidence-manifest construction, controlled delivery,
and service-outcome measurement. Credential assurance, policy decisions,
authoritative lifecycle, compliance decisions, and release qualification remain
owned by their independent providers. R01 defines references to those decisions;
it does not implement or impersonate them.

The required `EventEnvelope` fields describe identity, tenancy, event semantics,
time, replay protection, payload integrity, evidence references, provenance, and
signature metadata. No required field assumes a particular industry, device,
location source, decision system, or vertical workflow. Location is optional.

`EvidenceManifest` preserves source facts and their immutable event IDs. Derived
facts identify inputs and transform versions. Conflicts and withheld fields are
records, never silent rewrites or inferred authorization.

## Consequences

- Vertical packages own their payload schemas and cannot add a second trust path.
- Provider adapters must use separately approved, pinned contracts in later work.
- R01 uses synthetic fixtures and creates no network, storage, or partner access.

## R01 review

- [x] Core required fields are domain-neutral.
- [x] Optional location carries precision and disclosure classification.
- [x] Source, derived, conflicting, and withheld facts remain distinct.
- [x] External authority is referenced and not reimplemented.
