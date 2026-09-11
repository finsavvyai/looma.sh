# `@looma/event-contract`

Version 1 defines domain-neutral `EventEnvelope` and `EventReceipt` contracts.
The package contains JSON Schemas, generated TypeScript declarations, canonical
JSON helpers, semantic checks, and synthetic conformance fixtures. It does not
ingest, persist, authorize, or deliver events.

## Event identity and integrity

Every envelope identifies its exact schema, event, namespace, tenant, issuer,
subject, occurrence and receipt times, expiry, payload digest, provenance, and
either a nonce or sequence. The complete document is signed except for
`signature.value`; `signature.algorithm` and `signature.key_id` remain inside
the signed scope. Optional location always carries precision and disclosure
classification.

The maximum canonical envelope size for the v1 conformance profile is 4096
UTF-8 bytes. Runtime policy may impose a smaller limit but never a larger one
without registering a new profile.

## Namespaces and compatibility

- Event types use lowercase reverse-DNS-style names with at least three
  segments, for example `sh.looma.synthetic.status`.
- Schema versions use semantic versioning and consumers pin an exact registered
  version. An unknown version is rejected; there is no best-effort downgrade.
- Additive optional fields require a new minor schema. Removing, renaming,
  changing meaning, or making a field required requires a new major schema.
- Patch versions clarify constraints without changing accepted documents.
- A version may be deprecated only after its replacement and migration guide
  exist. Supported consumers receive at least 180 days' notice unless a
  documented security issue requires a shorter window.
- Golden vectors are immutable within a version. A canonical-byte change is a
  breaking change.

## Canonical bytes

Canonical JSON follows RFC 8785 (JCS): object keys are sorted, strings are
encoded as UTF-8 without Unicode normalization, and finite JSON numbers use the
ECMAScript serialization required by JCS. Producers compute `payload_digest`
from the canonical payload and compute signature bytes from the canonical
envelope after removing only `signature.value`.

Run `npm --prefix packages run check` from the repository root.
