import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { canonicalBytes } from "./canonical";
import type { JsonValue } from "./json";

export function canonicalSha256(value: JsonValue): string {
  return `sha256:${bytesToHex(sha256(canonicalBytes(value)))}`;
}
