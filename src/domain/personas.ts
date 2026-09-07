import type { Answers } from "./types";

export type Persona = {
  id: "priya" | "ravi" | "anita";
  name: string;
  city: string;
  line: string;
  ask: string;
  answers: Answers;
};

export const PERSONAS: Persona[] = [
  {
    id: "priya",
    name: "Priya",
    city: "Bengaluru · salaried",
    line: "Software engineer, five years at a large MNC. Net ₹1,10,000. Car EMI ₹14,000, two years left. Score 780. Rent ₹28,000.",
    ask: "Wants ₹8,00,000 personal loan for a wedding.",
    answers: {
      purpose: "wedding",
      amountWanted: 8_00_000,
      loanGuess: "personal",
      age: 29,
      workType: "salaried",
      incomeMonthly: 1_10_000,
      existingEmi: 14_000,
      expenses: 42_000,
      scoreBand: "750_799",
      scoreExact: 780,
      employerKind: "mnc",
      jobYears: 5,
      variableShare: 0,
      cardUtil: 20,
      dependents: 0,
      emergencyMonths: 4,
      bounced12m: false,
      existingRate: 11,
      spouseIncome: 0,
      upcomingExpense: 0,
      cityTier: "metro",
      emiMonthsLeft: 24,
      unemployedAdults: 0,
    },
  },
  {
    id: "ravi",
    name: "Ravi",
    city: "Mysuru · shop owner",
    line: "Kirana for 14 years. Cash ₹40,000–80,000; ITR ₹4,20,000 a year. Shop worth ₹45,00,000, no loan on it. No credit score. Wife earns ₹18,000.",
    ask: "Wants ₹15,00,000 for a second stock line and a delivery vehicle.",
    answers: {
      purpose: "business",
      amountWanted: 15_00_000,
      loanGuess: "personal",
      age: 42,
      workType: "self_employed",
      cashLow: 40_000,
      cashHigh: 80_000,
      existingEmi: 0,
      expenses: 22_000,
      scoreBand: "unknown",
      businessYears: 14,
      itrAnnual: 4_20_000,
      propertyValue: 45_00_000,
      propertyEncumbered: false,
      dependents: 0,
      emergencyMonths: 2,
      bounced12m: false,
      spouseIncome: 18_000,
      extraEarn: 18_000,
      cityTier: "tier2",
      goldValue: 0,
      unemployedAdults: 0,
      upcomingExpense: 0,
    },
  },
  {
    id: "anita",
    name: "Anita",
    city: "Hubballi · gig + tailoring",
    line: "Delivery rider and home tailoring, ₹26,000–30,000. Two children. Husband out of work 8 months. Three app loans, ₹35,000 still due at 30%+. One EMI bounced last month.",
    ask: "Wants ₹1,50,000 for an electric scooter to double delivery runs.",
    answers: {
      purpose: "vehicle",
      amountWanted: 1_50_000,
      loanGuess: "two_wheeler",
      age: 35,
      workType: "informal",
      cashLow: 26_000,
      cashHigh: 30_000,
      existingEmi: 8_500,
      expenses: 18_000,
      scoreBand: "unknown",
      dependents: 2,
      unemployedAdults: 1,
      emergencyMonths: 0.5,
      bounced12m: true,
      existingRate: 32,
      spouseIncome: 0,
      extraEarn: 8_000,
      cityTier: "tier2",
      goldValue: 0,
      emiMonthsLeft: 5,
      upcomingExpense: 0,
    },
  },
];

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
