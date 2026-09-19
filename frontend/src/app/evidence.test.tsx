import { describe, expect, it } from "vitest";
import { explainFactor } from "./evidence";

describe("deterministic explanations", () => {
  it("explains supported statuses without fabricating citations", () => {
    expect(explainFactor("soil pH", "LIMITING", { source_name: "FAO ECOCROP" })).toContain("FAO ECOCROP");
    expect(explainFactor("temperature", "UNKNOWN")).toContain("unavailable");
  });
});
