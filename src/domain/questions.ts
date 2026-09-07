import type { Answers, OutputKind, Product, Purpose, ScoreBand, WorkType } from "./types";

export type QuestionKind = "choice" | "money" | "number" | "yesno" | "score";

export type Choice = { value: string; label: string; hint?: string };

export type Question = {
  id: string;
  field: keyof Answers;
  must: boolean;
  title: string;
  help: string;
  moves: OutputKind[];
  kind: QuestionKind;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  choices?: Choice[];
  showIf: (a: Answers) => boolean;
};

const purposes: Choice[] = [
  { value: "wedding", label: "A wedding or a big personal event" },
  { value: "business", label: "My shop or work — stock, machine, vehicle for work" },
  { value: "vehicle", label: "A scooter, bike or car" },
  { value: "home", label: "A house — buy or repair" },
  { value: "education", label: "School or college fees" },
  { value: "medical", label: "A medical bill" },
  { value: "gold", label: "I want to pledge gold" },
  { value: "other", label: "Something else" },
];

const products: Choice[] = [
  { value: "unsure", label: "I am not sure — you pick" },
  { value: "personal", label: "Personal loan" },
  { value: "business", label: "Business loan, no shop pledged" },
  { value: "lap", label: "Loan against my shop or house" },
  { value: "two_wheeler", label: "Two-wheeler loan" },
  { value: "gold", label: "Gold loan" },
  { value: "home", label: "Home loan" },
];

const work: Choice[] = [
  { value: "salaried", label: "Salary — company pays me every month" },
  { value: "self_employed", label: "My own shop or business" },
  { value: "informal", label: "Daily work, gig apps, cash jobs" },
];

const scores: Choice[] = [
  { value: "unknown", label: "I do not know" },
  { value: "800_plus", label: "800 or more" },
  { value: "750_799", label: "750 to 799" },
  { value: "700_749", label: "700 to 749" },
  { value: "650_699", label: "650 to 699" },
  { value: "below_650", label: "Below 650" },
];

export const QUESTIONS: Question[] = [
  {
    id: "purpose",
    field: "purpose",
    must: true,
    title: "What is the money for?",
    help: "A wedding loan and a shop loan are not the same risk. This picks the product and whether we cut the ceiling.",
    moves: ["verdict", "amount", "rate", "emi"],
    kind: "choice",
    choices: purposes,
    showIf: () => true,
  },
  {
    id: "amount",
    field: "amountWanted",
    must: true,
    title: "How much do you want to take?",
    help: "This is your ask. We will say if it is too much.",
    moves: ["verdict", "amount", "emi"],
    kind: "money",
    placeholder: "800000",
    showIf: () => true,
  },
  {
    id: "loanGuess",
    field: "loanGuess",
    must: true,
    title: "What kind of loan are you walking in for?",
    help: "We may change this. A shop owner asking for a personal loan should usually pledge the shop instead.",
    moves: ["verdict", "amount", "rate"],
    kind: "choice",
    choices: products,
    showIf: () => true,
  },
  {
    id: "age",
    field: "age",
    must: true,
    title: "How old are you?",
    help: "Tenure has to end before typical retirement on unsecured loans.",
    moves: ["amount", "emi"],
    kind: "number",
    min: 18,
    max: 70,
    suffix: "years",
    showIf: () => true,
  },
  {
    id: "work",
    field: "workType",
    must: true,
    title: "How do you earn?",
    help: "Salary, a shop, and gig income are three different files. You will not see the other person's questions after this.",
    moves: ["verdict", "amount", "rate"],
    kind: "choice",
    choices: work,
    showIf: () => true,
  },
  {
    id: "income",
    field: "incomeMonthly",
    must: true,
    title: "What hits your account in a normal month, after tax?",
    help: "Take-home, not CTC. We do not guess a bonus if you do not say so.",
    moves: ["verdict", "amount", "emi"],
    kind: "money",
    showIf: (a) => a.workType === "salaried",
  },
  {
    id: "cashLow",
    field: "cashLow",
    must: true,
    title: "What do you take home in a typical month?",
    help: "Use a slow month, not the best week. EMI does not wait for a fat week.",
    moves: ["verdict", "amount", "emi"],
    kind: "money",
    showIf: (a) => a.workType === "self_employed" || a.workType === "informal",
  },
  {
    id: "existingEmi",
    field: "existingEmi",
    must: true,
    title: "What do you already pay in EMIs every month?",
    help: "Car, phone, apps, everything. Type 0 if none. This is why a new loan may not fit.",
    moves: ["verdict", "amount", "emi"],
    kind: "money",
    showIf: () => true,
  },
  {
    id: "expenses",
    field: "expenses",
    must: true,
    title: "Household spend in a month — rent, food, school, everything except EMIs?",
    help: "If you skip this we cannot run. Surplus is not FOIR.",
    moves: ["verdict", "amount", "emi"],
    kind: "money",
    showIf: () => true,
  },
  {
    id: "score",
    field: "scoreBand",
    must: true,
    title: "Do you know your credit score?",
    help: "CIBIL, Experian, CRIF — any of them. 'I do not know' is allowed. It is not a 300.",
    moves: ["rate", "amount"],
    kind: "score",
    choices: scores,
    showIf: () => true,
  },

  {
    id: "employer",
    field: "employerKind",
    must: false,
    title: "What kind of company pays you?",
    help: "MNC and government files are priced a little better.",
    moves: ["rate", "amount"],
    kind: "choice",
    choices: [
      { value: "mnc", label: "Large multinational" },
      { value: "govt", label: "Government or PSU" },
      { value: "private", label: "Indian private company" },
      { value: "other", label: "Other" },
    ],
    showIf: (a) => a.workType === "salaried",
  },
  {
    id: "jobYears",
    field: "jobYears",
    must: false,
    title: "How many years in this job?",
    help: "Under a year costs you rate. Five years plus is a small cut.",
    moves: ["rate", "amount"],
    kind: "number",
    min: 0,
    max: 40,
    step: 0.5,
    suffix: "years",
    showIf: (a) => a.workType === "salaried",
  },
  {
    id: "bizYears",
    field: "businessYears",
    must: false,
    title: "How many years has this shop or business been running?",
    help: "For a self-employed file, vintage is the bureau.",
    moves: ["rate", "amount"],
    kind: "number",
    min: 0,
    max: 50,
    suffix: "years",
    showIf: (a) => a.workType === "self_employed",
  },
  {
    id: "itr",
    field: "itrAnnual",
    must: false,
    title: "What profit does your last ITR show, for the year?",
    help: "The branch will use this, not the till. Skip if you have not filed.",
    moves: ["amount", "rate"],
    kind: "money",
    showIf: (a) => a.workType === "self_employed",
  },
  {
    id: "property",
    field: "propertyValue",
    must: false,
    title: "If you own a shop or house you could pledge, roughly what is it worth?",
    help: "Type 0 if none. This is how a personal-loan ask becomes a cheaper LAP.",
    moves: ["verdict", "amount", "rate"],
    kind: "money",
    showIf: (a) => a.workType === "self_employed" || a.purpose === "business",
  },
  {
    id: "dependents",
    field: "dependents",
    must: false,
    title: "How many people do you support who do not earn?",
    help: "Children, and adults at home with no pay. Each one adds ₹2,500 we refuse to turn into EMI.",
    moves: ["amount", "emi"],
    kind: "number",
    min: 0,
    max: 12,
    showIf: (a) => a.workType === "informal",
  },
  {
    id: "savings",
    field: "emergencyMonths",
    must: false,
    title: "If income stopped, how many months could you run on savings?",
    help: "Under 3 months we cut the safe EMI on unsecured loans. Skip and we only widen the low end — silence is not an empty FD.",
    moves: ["amount", "emi"],
    kind: "number",
    min: 0,
    max: 24,
    suffix: "months",
    showIf: (a) => a.workType === "salaried" || a.workType === "informal",
  },
  {
    id: "bounce",
    field: "bounced12m",
    must: false,
    title: "Did any EMI bounce in the last 12 months?",
    help: "A bounce plus costly app loans is a don't-borrow.",
    moves: ["verdict", "rate", "amount"],
    kind: "yesno",
    showIf: (a) => a.workType === "informal",
  },
  {
    id: "existingRate",
    field: "existingRate",
    must: false,
    title: "Roughly what interest are you already paying on those EMIs?",
    help: "App loans at 30% plus a bounce is how we fire don't-borrow.",
    moves: ["verdict", "rate"],
    kind: "number",
    min: 0,
    max: 80,
    suffix: "%",
    showIf: (a) => a.workType === "informal" && (a.existingEmi ?? 0) > 0,
  },
  {
    id: "spouse",
    field: "spouseIncome",
    must: false,
    title: "Does a spouse or partner earn? Their monthly take-home.",
    help: "We count 90% on the household book and 65% on the lender book. I do not treat them as a co-applicant unless you say they will sign.",
    moves: ["amount", "emi"],
    kind: "money",
    showIf: (a) => a.workType === "self_employed",
  },
  {
    id: "earn",
    field: "extraEarn",
    must: false,
    title: "If this loan is for work, how much extra will it earn each month?",
    help: "We believe 35% of that number, household book only.",
    moves: ["amount", "emi", "verdict"],
    kind: "money",
    showIf: (a) => a.purpose === "business",
  },
  {
    id: "emiLeft",
    field: "emiMonthsLeft",
    must: false,
    title: "On your biggest current loan, how many months are left?",
    help: "If a car EMI ends in two years, waiting can be cheaper than stretching today.",
    moves: ["verdict", "emi"],
    kind: "number",
    min: 0,
    max: 240,
    suffix: "months",
    showIf: (a) => a.workType === "salaried" && (a.existingEmi ?? 0) > 0,
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => q.showIf(answers));
}

export function mustQuestions(answers: Answers): Question[] {
  return visibleQuestions(answers).filter((q) => q.must);
}

export function additionalQuestions(answers: Answers): Question[] {
  return visibleQuestions(answers).filter((q) => !q.must);
}

export function isAnswered(answers: Answers, q: Question): boolean {
  const v = answers[q.field];
  return v !== undefined;
}

export function missingMust(answers: Answers): Question[] {
  return mustQuestions(answers).filter((q) => !isAnswered(answers, q));
}

export function nextQuestion(answers: Answers): Question | null {
  const list = visibleQuestions(answers);
  const must = list.find((q) => q.must && !isAnswered(answers, q));
  if (must) return must;
  const add = list.find((q) => !q.must && !isAnswered(answers, q));
  return add ?? null;
}

export function progress(answers: Answers): { done: number; total: number; mustDone: number; mustTotal: number } {
  const vis = visibleQuestions(answers);
  const must = vis.filter((q) => q.must);
  return {
    done: vis.filter((q) => isAnswered(answers, q)).length,
    total: vis.length,
    mustDone: must.filter((q) => isAnswered(answers, q)).length,
    mustTotal: must.length,
  };
}

export function productLabel(p: Product): string {
  return {
    personal: "personal loan",
    home: "home loan",
    lap: "loan against property (shop / house)",
    gold: "gold loan",
    two_wheeler: "two-wheeler loan",
    business: "unsecured business loan",
  }[p];
}

export function purposeLabel(p: Purpose): string {
  return {
    wedding: "a wedding",
    business: "the business",
    vehicle: "a vehicle",
    home: "a house",
    education: "education",
    medical: "a medical bill",
    gold: "gold",
    other: "this need",
  }[p];
}

export function workLabel(w: WorkType): string {
  return {
    salaried: "salaried",
    self_employed: "self-employed",
    informal: "informal / gig",
  }[w];
}

export function scoreLabel(s: ScoreBand): string {
  return {
    unknown: "not known",
    below_650: "below 650",
    "650_699": "650–699",
    "700_749": "700–749",
    "750_799": "750–799",
    "800_plus": "800+",
  }[s];
}
