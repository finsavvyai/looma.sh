import { describe, expect, it } from "vitest";
import manifest from "../../evidence-contract/fixtures/valid-manifest.json";
import { validateEvidenceManifest } from "../../evidence-contract/src/validation";
import golden from "../fixtures/golden-ed25519.json";
import envelope from "../fixtures/valid-envelope.json";
import { canonicalSha256 } from "../src/digest";
import type { JsonObject, JsonValue } from "../src/json";
import { verifyEd25519Signature } from "../src/signature";
import { validateEventEnvelope } from "../src/validation";

describe("synthetic contract-level end-to-end flow", () => {
  it("validates a signed event and a manifest that references it", () => {
    expect(validateEventEnvelope(envelope)).toBe(true);
    expect(canonicalSha256(envelope.payload as JsonValue)).toBe(envelope.payload_digest);
    expect(verifyEd25519Signature(envelope as unknown as JsonObject, golden.public_key)).toBe(true);
    expect(validateEvidenceManifest(manifest)).toBe(true);
    expect(manifest.source_events[0].source_event_id).toBe(envelope.event_id);
  });
});
