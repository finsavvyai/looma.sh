import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import missingIdentity from "../fixtures/missing-identity.json";
import oversized from "../fixtures/oversized-envelope.json";
import stale from "../fixtures/stale-envelope.json";
import unsupported from "../fixtures/unsupported-version.json";
import valid from "../fixtures/valid-envelope.json";
import { envelopeSemanticIssues } from "../src/semantics";
import type { EventEnvelope } from "../src/generated/event-envelope";
import { parseBoundedEnvelope, validateEventEnvelope } from "../src/validation";

const malformed = readFileSync(
  new URL("../fixtures/malformed-envelope.json", import.meta.url),
  "utf8",
);

describe("published negative fixture matrix", () => {
  it("parses and validates the positive fixture", () => {
    const parsed = parseBoundedEnvelope(JSON.stringify(valid));
    expect(validateEventEnvelope(parsed)).toBe(true);
  });

  it("rejects malformed JSON", () => {
    expect(() => parseBoundedEnvelope(malformed)).toThrow(SyntaxError);
  });

  it("rejects missing identity and unsupported versions", () => {
    expect(validateEventEnvelope(missingIdentity)).toBe(false);
    expect(validateEventEnvelope(unsupported)).toBe(false);
  });

  it("rejects oversized UTF-8 envelopes before parsing", () => {
    expect(() => parseBoundedEnvelope(JSON.stringify(oversized))).toThrow(RangeError);
  });

  it("classifies the schema-valid stale fixture", () => {
    expect(validateEventEnvelope(stale)).toBe(true);
    expect(
      envelopeSemanticIssues(
        stale as unknown as EventEnvelope,
        Date.parse("2030-01-01T00:02:00.000Z"),
      ),
    ).toContain("stale");
  });
});
