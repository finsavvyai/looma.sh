import { describe, expect, it } from "vitest";
import manifest from "../fixtures/valid-manifest.json";
import { validateEvidenceManifest } from "../src/validation";

const candidate = () => structuredClone(manifest) as any;

describe("EvidenceManifest schema", () => {
  it("accepts source, derived, conflict, and withheld evidence", () => {
    expect(validateEvidenceManifest(candidate())).toBe(true);
  });

  it.each(["source_events", "source_facts", "derived_facts", "conflicts", "withheld_fields"])(
    "rejects missing %s",
    (field) => {
      const value = candidate();
      delete value[field];
      expect(validateEvidenceManifest(value)).toBe(false);
    },
  );

  it("requires derivation inputs and a versioned transform", () => {
    const noInputs = candidate();
    noInputs.derived_facts[0].input_fact_ids = [];
    expect(validateEvidenceManifest(noInputs)).toBe(false);

    const noVersion = candidate();
    delete noVersion.derived_facts[0].transform.version;
    expect(validateEvidenceManifest(noVersion)).toBe(false);
  });

  it("keeps unresolved and superseded conflict semantics explicit", () => {
    const unresolvedWithResolution = candidate();
    unresolvedWithResolution.conflicts[0].resolution_ref = "resolution.synthetic.001";
    expect(validateEvidenceManifest(unresolvedWithResolution)).toBe(false);

    const supersededWithoutResolution = candidate();
    supersededWithoutResolution.conflicts[0].status = "superseded";
    expect(validateEvidenceManifest(supersededWithoutResolution)).toBe(false);

    supersededWithoutResolution.conflicts[0].resolution_ref = "resolution.synthetic.001";
    expect(validateEvidenceManifest(supersededWithoutResolution)).toBe(true);
  });

  it("requires withholding reasons and rejects unsupported versions", () => {
    const noReason = candidate();
    delete noReason.withheld_fields[0].reason_code;
    expect(validateEvidenceManifest(noReason)).toBe(false);

    const unsupported = candidate();
    unsupported.schema_version = "2.0.0";
    expect(validateEvidenceManifest(unsupported)).toBe(false);
  });
});
