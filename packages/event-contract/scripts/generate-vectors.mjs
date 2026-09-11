import { readFile, writeFile } from "node:fs/promises";
import { ed25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { canonicalize } from "json-canonicalize";

const fixtureUrl = new URL("../fixtures/valid-envelope.json", import.meta.url);
const envelope = JSON.parse(await readFile(fixtureUrl, "utf8"));
const privateKey = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
const digest = bytesToHex(sha256(new TextEncoder().encode(canonicalize(envelope.payload))));
envelope.payload_digest = `sha256:${digest}`;
const scope = structuredClone(envelope);
delete scope.signature.value;
const canonical = canonicalize(scope);
const signature = bytesToHex(
  ed25519.sign(new TextEncoder().encode(canonical), hexToBytes(privateKey)),
);
envelope.signature.value = signature;
await writeFile(fixtureUrl, `${JSON.stringify(envelope, null, 2)}\n`);

const golden = {
  vector_id: "r01-ed25519-1",
  private_key: privateKey,
  public_key: bytesToHex(ed25519.getPublicKey(hexToBytes(privateKey))),
  canonical_hex: bytesToHex(new TextEncoder().encode(canonical)),
  signature,
  negative_vectors: [
    ["schema", "/schema_version", "1.0.1"],
    ["event_id", "/event_id", "evt.synthetic.changed"],
    ["event_type", "/event_type", "sh.looma.synthetic.changed"],
    ["tenant", "/tenant_id", "tenant.synthetic.changed"],
    ["issuer", "/issuer/id", "issuer.synthetic.changed"],
    ["subject", "/subject/id", "subject.synthetic.changed"],
    ["occurred_at", "/occurred_at", "2030-01-01T00:00:01.000Z"],
    ["received_at", "/received_at", "2030-01-01T00:00:02.000Z"],
    ["expires_at", "/expires_at", "2030-01-01T00:09:00.000Z"],
    ["nonce", "/nonce", "0000000000000002"],
    ["payload", "/payload/count", 2],
    ["payload_digest", "/payload_digest", `sha256:${"0".repeat(64)}`],
    ["evidence", "/evidence", [{ evidence_id: "e", content_digest: `sha256:${"1".repeat(64)}` }]],
    ["correlation", "/correlation_ids/correlation_id", "flow.synthetic.changed"],
    ["location", "/location/precision_m", 200],
    ["provenance", "/provenance/adapter_version", "1.0.1"],
    ["algorithm", "/signature/algorithm", "other"],
    ["key_id", "/signature/key_id", "key.synthetic.changed"],
    ["signature", "/signature/value", "0".repeat(128)],
  ].map(([id, path, replacement]) => ({ id, path, replacement, expected: false })),
};
await writeFile(
  new URL("../fixtures/golden-ed25519.json", import.meta.url),
  `${JSON.stringify(golden, null, 2)}\n`,
);

const missingIdentity = structuredClone(envelope);
delete missingIdentity.issuer;
await writeFile(
  new URL("../fixtures/missing-identity.json", import.meta.url),
  `${JSON.stringify(missingIdentity, null, 2)}\n`,
);

const stale = structuredClone(envelope);
stale.occurred_at = "2029-12-31T23:00:00.000Z";
await writeFile(
  new URL("../fixtures/stale-envelope.json", import.meta.url),
  `${JSON.stringify(stale, null, 2)}\n`,
);

const unsupported = structuredClone(envelope);
unsupported.schema_version = "2.0.0";
await writeFile(
  new URL("../fixtures/unsupported-version.json", import.meta.url),
  `${JSON.stringify(unsupported, null, 2)}\n`,
);

const oversized = structuredClone(envelope);
oversized.payload = { blob: "x".repeat(5000) };
await writeFile(
  new URL("../fixtures/oversized-envelope.json", import.meta.url),
  `${JSON.stringify(oversized, null, 2)}\n`,
);
await writeFile(
  new URL("../fixtures/malformed-envelope.json", import.meta.url),
  '{"schema_version":\n',
);
