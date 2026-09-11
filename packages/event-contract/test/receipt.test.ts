import { describe, expect, it } from "vitest";
import receipt from "../fixtures/valid-receipt.json";
import { validateEventReceipt } from "../src/validation";

describe("EventReceipt schema", () => {
  it("accepts the complete synthetic receipt", () => {
    expect(validateEventReceipt(receipt)).toBe(true);
  });

  it.each(["event_id", "envelope_digest", "credential_ref", "policy_decision_ref", "release_id"])(
    "rejects missing %s",
    (field) => {
      const candidate = structuredClone(receipt) as Record<string, unknown>;
      delete candidate[field];
      expect(validateEventReceipt(candidate)).toBe(false);
    },
  );

  it("rejects unsupported versions and unknown fields", () => {
    expect(validateEventReceipt({ ...receipt, schema_version: "2.0.0" })).toBe(false);
    expect(validateEventReceipt({ ...receipt, implicit_success: true })).toBe(false);
  });
});
