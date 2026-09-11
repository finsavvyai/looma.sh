# ADR-002: Canonical serialization and signature scope

- Status: Accepted for R01
- Date: 2026-09-11
- Requirements: FR-001, G1

## Decision

Looma v1 uses RFC 8785 JSON Canonicalization Scheme (JCS) and UTF-8 bytes.
Canonicalization does not normalize Unicode. Inputs are JSON values, so NaN,
Infinity, negative zero as a distinct value, and non-JSON values are unavailable.

For a signed document, remove only `signature.value`, retain the remaining
`signature` metadata, canonicalize the complete document, and encode it as
UTF-8. Ed25519 signs those bytes. The payload digest is lowercase
`sha256:<hex>` over the canonical payload.

This scope binds schema version, event ID and type, tenant, issuer, subject,
occurrence and receipt times, expiry, nonce or sequence, payload and its digest,
evidence, correlation, optional location, provenance, signature algorithm, and
key ID. Altering any of them invalidates the signature.

## Rejected alternatives

- `JSON.stringify` insertion order is not a cross-runtime contract.
- Signing only the payload leaves identity, tenant, time, replay, and provenance
  metadata mutable.
- Unicode normalization changes source values and is outside JCS.
- Excluding the whole signature object leaves algorithm and key identity mutable.

## Compatibility

Golden canonical bytes and signatures are immutable for schema version 1.0.0.
Changing canonicalization or signature scope requires a new major version.
