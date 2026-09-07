import { describe, expect, it } from "vitest";
import { assess } from "./assess";
import { PERSONAS } from "./personas";
import { QUESTIONS, additionalQuestions, missingMust, mustQuestions, visibleQuestions } from "./questions";
import type { Answers } from "./types";

describe("three borrowers", () => {
  const priya = assess(PERSONAS[0].answers);
  const ravi = assess(PERSONAS[1].answers);
  const anita = assess(PERSONAS[2].answers);

  it("Priya: borrow less on a wedding, personal loan, household < ask < lender", () => {
    expect(priya.ready).toBe(true);
    expect(priya.product).toBe("personal");
    expect(priya.verdict).toBe("borrow_less");
    expect(priya.householdAmount.high).toBeGreaterThan(4_00_000);
    expect(priya.householdAmount.high).toBeLessThanOrEqual(8_50_000);
    expect(priya.lenderAmount.high).toBeGreaterThan(priya.householdAmount.high);
    expect(priya.useAmount).toBeLessThan(8_00_000);
    expect(priya.rate.low).toBeGreaterThanOrEqual(10.5);
    expect(priya.rate.high).toBeLessThan(14.5);
    expect(priya.rate.aprLow).toBeGreaterThan(priya.rate.low);
    expect(priya.waitStory).toBeTruthy();
    expect(priya.emiCeiling).toBeGreaterThan(10_000);
    expect(priya.emiCeiling).toBeLessThan(30_000);
  });

  it("Ravi: borrow on a LAP, unknown score is not 300, 15L fits", () => {
    expect(ravi.product).toBe("lap");
    expect(ravi.routedAwayFromAsk).toBe(true);
    expect(ravi.verdict).toBe("borrow");
    expect(ravi.householdAmount.high).toBeGreaterThanOrEqual(12_00_000);
    expect(ravi.useAmount).toBe(15_00_000);
    expect(ravi.rate.high - ravi.rate.low).toBeGreaterThan(2);
    expect(ravi.rate.low).toBeGreaterThan(9);
    expect(ravi.rate.low).toBeLessThan(16);
    expect(ravi.confidence).toBeLessThanOrEqual(0.56);
    expect(ravi.income.lender).toBeLessThan(ravi.income.household);
  });

  it("Anita: don't borrow, scooter is not the product she should take", () => {
    expect(anita.verdict).toBe("dont_borrow");
    expect(anita.product).toBe("two_wheeler");
    expect(anita.useAmount).toBe(0);
    expect(anita.householdAmount.high).toBe(0);
    expect(anita.lenderAmount.high).toBeGreaterThan(0);
    expect(anita.rate.low).toBeGreaterThan(15);
  });
});

describe("question design", () => {
  it("must-set is enough to compute", () => {
    const mustOnly: Answers = {
      purpose: "wedding",
      amountWanted: 5_00_000,
      loanGuess: "personal",
      age: 30,
      workType: "salaried",
      incomeMonthly: 80_000,
      existingEmi: 0,
      expenses: 30_000,
      scoreBand: "unknown",
    };
    expect(missingMust(mustOnly)).toHaveLength(0);
    const r = assess(mustOnly);
    expect(r.ready).toBe(true);
    expect(r.confidence).toBeLessThan(0.7);
    expect(r.rate.high - r.rate.low).toBeGreaterThan(4);
  });

  it("unknown score is not priced as 300", () => {
    const base: Answers = {
      purpose: "other",
      amountWanted: 3_00_000,
      loanGuess: "personal",
      age: 32,
      workType: "salaried",
      incomeMonthly: 90_000,
      existingEmi: 0,
      expenses: 28_000,
      scoreBand: "unknown",
      employerKind: "private",
      jobYears: 4,
    };
    const unknown = assess(base);
    const stained = assess({ ...base, scoreBand: "below_650" });
    expect(unknown.rate.low).toBeLessThan(stained.rate.low);
    expect(unknown.rate.high - unknown.rate.low).toBeGreaterThanOrEqual(
      stained.rate.high - stained.rate.low - 0.25,
    );
  });

  it("a salaried path and a shop path are not the same questions", () => {
    const salaried = visibleQuestions({ workType: "salaried", existingEmi: 0 });
    const shop = visibleQuestions({
      workType: "self_employed",
      purpose: "business",
      existingEmi: 0,
      propertyValue: 10_00_000,
    });
    const sIds = salaried.map((q) => q.id);
    const kIds = shop.map((q) => q.id);
    expect(sIds).toContain("employer");
    expect(sIds).not.toContain("itr");
    expect(kIds).toContain("itr");
    expect(kIds).not.toContain("employer");
  });

  it("every additional question is wired to an output", () => {
    const extras = additionalQuestions({
      workType: "salaried",
      existingEmi: 10_000,
      spouseIncome: 20_000,
      propertyValue: 10_00_000,
      purpose: "business",
    });
    for (const q of extras) {
      expect(q.moves.length, q.id).toBeGreaterThan(0);
    }
  });

  it("must-set stays in the assignment band of 8–10", () => {
    for (const workType of ["salaried", "self_employed", "informal"] as const) {
      const n = mustQuestions({ workType }).length;
      expect(n, workType).toBeGreaterThanOrEqual(8);
      expect(n, workType).toBeLessThanOrEqual(10);
    }
    expect(QUESTIONS.filter((q) => q.must).length).toBeLessThanOrEqual(10);
  });

  it("each path only asks a short extra list", () => {
    expect(
      additionalQuestions({
        workType: "salaried",
        existingEmi: 14_000,
        purpose: "wedding",
        loanGuess: "personal",
      }).length,
    ).toBeLessThanOrEqual(5);
    expect(
      additionalQuestions({
        workType: "self_employed",
        purpose: "business",
        existingEmi: 0,
      }).length,
    ).toBeLessThanOrEqual(6);
    expect(
      additionalQuestions({
        workType: "informal",
        purpose: "vehicle",
        existingEmi: 8_500,
        loanGuess: "two_wheeler",
      }).length,
    ).toBeLessThanOrEqual(5);
  });

  it("ITR extra answer moves Ravi's lender book", () => {
    const without = { ...PERSONAS[1].answers, itrAnnual: undefined };
    const a = assess(without);
    const b = assess(PERSONAS[1].answers);
    expect(b.income.lender).toBeGreaterThan(a.income.lender);
  });
});

describe("don't borrow is reachable without Anita", () => {
  it("fires when existing EMIs already fill FOIR", () => {
    const r = assess({
      purpose: "other",
      amountWanted: 2_00_000,
      loanGuess: "personal",
      age: 40,
      workType: "salaried",
      incomeMonthly: 40_000,
      existingEmi: 22_000,
      expenses: 18_000,
      scoreBand: "700_749",
      bounced12m: false,
      dependents: 2,
      emergencyMonths: 1,
    });
    expect(r.verdict).toBe("dont_borrow");
  });
});
