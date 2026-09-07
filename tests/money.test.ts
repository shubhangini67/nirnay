import { describe, expect, it } from "vitest";
import { aprFromFee, emi, inr, principalFromEmi } from "../src/domain/money";

describe("money", () => {
  it("formats Indian grouping", () => {
    expect(inr(110000)).toBe("₹1,10,000");
    expect(inr(1500000)).toBe("₹15,00,000");
    expect(inr(800000, true)).toBe("₹8.00 L");
  });

  it("EMI and inverse round-trip", () => {
    const p = 8_00_000;
    const e = emi(p, 12, 36);
    expect(e).toBeGreaterThan(26_000);
    expect(e).toBeLessThan(27_000);
    expect(Math.abs(principalFromEmi(e, 12, 36) - p)).toBeLessThan(5);
  });

  it("APR is above headline when a fee is charged", () => {
    const apr = aprFromFee(1_00_000, 12, 36, 0.015 * 1.18);
    expect(apr).toBeGreaterThan(12.8);
    expect(apr).toBeLessThan(14.5);
  });
});
