import { describe, expect, it } from "vitest";
import { dumpPersona } from "../src/domain/dump";

describe("persona dump", () => {
  it("prints three complete traces", () => {
    for (const id of ["priya", "ravi", "anita"] as const) {
      const text = dumpPersona(id);
      expect(text).toContain("## Outputs");
      expect(text).toContain("O1");
    }
  });
});
