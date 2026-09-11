import { canonicalize } from "json-canonicalize";
import type { JsonObject, JsonValue } from "./json";

const encoder = new TextEncoder();

export function canonicalJson(value: JsonValue): string {
  return canonicalize(value);
}

export function canonicalBytes(value: JsonValue): Uint8Array {
  return encoder.encode(canonicalJson(value));
}

export function signatureScope(document: JsonObject): JsonObject {
  const signature = document.signature;
  if (!signature || Array.isArray(signature) || typeof signature !== "object") {
    throw new TypeError("signature must be an object");
  }
  if (typeof signature.value !== "string") {
    throw new TypeError("signature.value must be a string");
  }
  const { value: _value, ...metadata } = signature;
  return { ...document, signature: metadata };
}

export function signatureBytes(document: JsonObject): Uint8Array {
  return canonicalBytes(signatureScope(document));
}
