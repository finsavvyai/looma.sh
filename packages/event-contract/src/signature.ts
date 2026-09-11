import { ed25519 } from "@noble/curves/ed25519.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import { signatureBytes } from "./canonical";
import type { JsonObject } from "./json";

export function verifyEd25519Signature(document: JsonObject, publicKeyHex: string): boolean {
  const signature = document.signature;
  if (
    !signature ||
    Array.isArray(signature) ||
    typeof signature !== "object" ||
    signature.algorithm !== "Ed25519" ||
    typeof signature.value !== "string"
  ) {
    return false;
  }
  try {
    return ed25519.verify(
      hexToBytes(signature.value),
      signatureBytes(document),
      hexToBytes(publicKeyHex),
    );
  } catch {
    return false;
  }
}
