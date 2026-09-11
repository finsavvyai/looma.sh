import { bytesToHex } from "@noble/hashes/utils.js";
import { describe, expect, it } from "vitest";
import golden from "../fixtures/golden-ed25519.json";
import valid from "../fixtures/valid-envelope.json";
import { signatureBytes, signatureScope } from "../src/canonical";
import type { JsonObject } from "../src/json";
import { verifyEd25519Signature } from "../src/signature";

const document = () => structuredClone(valid) as unknown as JsonObject;
const mutate = (value: any, path: string, replacement: unknown) => {
  const parts = path.slice(1).split("/");
  const leaf = parts.pop() as string;
  let cursor = value;
  for (const part of parts) cursor = cursor[part];
  cursor[leaf] = replacement;
};

describe("complete Ed25519 signature scope", () => {
  it("matches and verifies the immutable TypeScript golden vector", () => {
    expect(bytesToHex(signatureBytes(document()))).toBe(golden.canonical_hex);
    expect(verifyEd25519Signature(document(), golden.public_key)).toBe(true);
  });

  it.each(golden.negative_vectors)("rejects golden mutation $id", (vector) => {
    const changed = document();
    mutate(changed, vector.path, vector.replacement);
    expect(verifyEd25519Signature(changed, golden.public_key)).toBe(vector.expected);
  });

  it("rejects malformed signature metadata and key material", () => {
    expect(verifyEd25519Signature({ signature: null }, golden.public_key)).toBe(false);
    expect(verifyEd25519Signature({ signature: [] }, golden.public_key)).toBe(false);
    expect(verifyEd25519Signature({ signature: "bad" }, golden.public_key)).toBe(false);
    expect(
      verifyEd25519Signature({ signature: { algorithm: "bad", value: "00" } }, golden.public_key),
    ).toBe(false);
    expect(verifyEd25519Signature(document(), "bad-hex")).toBe(false);
  });

  it("fails closed when the canonical scope lacks a signature value", () => {
    expect(() => signatureScope({})).toThrow("signature must be an object");
    expect(() => signatureScope({ signature: { algorithm: "Ed25519" } })).toThrow(
      "signature.value must be a string",
    );
  });
});
