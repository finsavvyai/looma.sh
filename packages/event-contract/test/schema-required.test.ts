import { describe, expect, it } from "vitest";
import valid from "../fixtures/valid-envelope.json";
import unsupported from "../fixtures/unsupported-version.json";
import { validateEventEnvelope } from "../src/validation";

describe("EventEnvelope required contract", () => {
  it("accepts the synthetic v1 fixture", () => {
    expect(validateEventEnvelope(valid)).toBe(true);
  });

  it.each([
    "tenant_id",
    "issuer",
    "subject",
    "occurred_at",
    "received_at",
    "expires_at",
    "payload_digest",
  ])("rejects missing %s", (field) => {
    const candidate = structuredClone(valid) as Record<string, unknown>;
    delete candidate[field];
    expect(validateEventEnvelope(candidate)).toBe(false);
  });

  it("requires exactly one replay discriminator", () => {
    const missing = structuredClone(valid) as Record<string, unknown>;
    delete missing.nonce;
    expect(validateEventEnvelope(missing)).toBe(false);

    const both = structuredClone(valid) as Record<string, unknown>;
    both.sequence = 1;
    expect(validateEventEnvelope(both)).toBe(false);

    const sequence = structuredClone(valid) as Record<string, unknown>;
    delete sequence.nonce;
    sequence.sequence = 0;
    expect(validateEventEnvelope(sequence)).toBe(true);
  });

  it("rejects unsupported versions and invalid timestamps", () => {
    expect(validateEventEnvelope(unsupported)).toBe(false);
    const timestamp = structuredClone(valid);
    timestamp.occurred_at = "2030-99-99";
    expect(validateEventEnvelope(timestamp)).toBe(false);
  });

  it("rejects unknown envelope fields", () => {
    expect(validateEventEnvelope({ ...valid, unexpected: true })).toBe(false);
  });

  it("requires complete location privacy metadata", () => {
    const location = structuredClone(valid);
    delete (location.location as Partial<typeof location.location>).precision_m;
    expect(validateEventEnvelope(location)).toBe(false);
  });
});
