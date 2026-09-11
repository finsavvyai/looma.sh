import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "event-contract/src/{canonical,digest,signature,semantics,validation}.ts",
        "evidence-contract/src/validation.ts",
      ],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
