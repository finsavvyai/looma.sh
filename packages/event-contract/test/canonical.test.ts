import { bytesToHex } from "@noble/hashes/utils.js";
import { describe, expect, it } from "vitest";
import { canonicalBytes, canonicalJson } from "../src/canonical";
import { canonicalSha256 } from "../src/digest";

describe("RFC 8785 canonicalization", () => {
  it("sorts nested object fields deterministically", () => {
    const left = { z: 1, a: { y: true, x: null } };
    const right = { a: { x: null, y: true }, z: 1 };
    expect(canonicalJson(left)).toBe(canonicalJson(right));
    expect(canonicalJson(left)).toBe('{"a":{"x":null,"y":true},"z":1}');
  });

  it("preserves Unicode values and canonicalizes equivalent escapes", () => {
    const escaped = JSON.parse('{"value":"Caf\\u00e9 \\u6771\\u4eac"}');
    expect(canonicalJson(escaped)).toBe(canonicalJson({ value: "Café 東京" }));
  });

  it("uses JCS number serialization and UTF-8 bytes", () => {
    expect(canonicalJson({ small: 0.000001, negativeZero: -0 })).toBe(
      '{"negativeZero":0,"small":0.000001}',
    );
    expect(bytesToHex(canonicalBytes("é"))).toBe("22c3a922");
  });

  it("hashes equivalent payloads identically and changes on mutation", () => {
    expect(canonicalSha256({ b: 2, a: 1 })).toBe(canonicalSha256({ a: 1, b: 2 }));
    expect(canonicalSha256({ a: 1 })).not.toBe(canonicalSha256({ a: 2 }));
  });
});
