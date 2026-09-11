import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import schema from "../schema/event-envelope.schema.json";

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");

describe("R01 documentation review", () => {
  it("keeps vertical vocabulary out of core required fields", () => {
    expect(schema.required.join(" ")).not.toMatch(/gps|vehicle|insurance|aml/i);
  });

  it("records the accepted domain-neutral ownership review", () => {
    const adr = read("../../../docs/adr/0001-product-ownership-boundary.md");
    expect(adr).toContain("Status: Accepted for R01");
    expect(adr).toContain("[x] Core required fields are domain-neutral");
  });

  it("documents fail-closed evolution and deprecation rules", () => {
    const guide = read("../README.md");
    expect(guide).toContain("unknown version is rejected");
    expect(guide).toContain("breaking change");
    expect(guide).toContain("180 days");
  });
});
