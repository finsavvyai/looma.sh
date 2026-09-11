import { describe, expect, it } from "vitest";
import valid from "../fixtures/valid-envelope.json";
import { envelopeSemanticIssues } from "../src/semantics";
import type { EventEnvelope } from "../src/generated/event-envelope";

const now = Date.parse("2030-01-01T00:02:00.000Z");
const candidate = () => structuredClone(valid) as EventEnvelope;

describe("EventEnvelope semantic checks", () => {
  it("accepts a fresh fixture with a matching payload digest", () => {
    expect(envelopeSemanticIssues(candidate(), now)).toEqual([]);
  });

  it("detects a payload digest mismatch", () => {
    const envelope = candidate();
    envelope.payload = { changed: true };
    expect(envelopeSemanticIssues(envelope, now)).toContain("payload_digest_mismatch");
  });

  it("detects stale and future occurrence times", () => {
    const stale = candidate();
    stale.occurred_at = "2029-12-31T23:00:00.000Z";
    expect(envelopeSemanticIssues(stale, now)).toContain("stale");

    const future = candidate();
    future.occurred_at = "2030-01-01T00:03:00.000Z";
    expect(envelopeSemanticIssues(future, now)).toContain("future");
  });

  it("detects expiry and invalid event time ordering", () => {
    const expired = candidate();
    expired.expires_at = "2030-01-01T00:01:00.000Z";
    expect(envelopeSemanticIssues(expired, now)).toContain("expired");

    const reversed = candidate();
    reversed.expires_at = "2029-12-31T23:59:59.000Z";
    expect(envelopeSemanticIssues(reversed, now)).toContain("invalid_time_order");
  });
});
