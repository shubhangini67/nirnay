export type WorkType = "salaried" | "self_employed" | "informal";

export type Purpose =
  | "wedding"
  | "business"
  | "vehicle"
  | "home"
  | "education"
  | "medical"
  | "gold"
  | "other";

export type Product =
  | "personal"
  | "home"
  | "lap"
  | "gold"
  | "two_wheeler"
  | "business";

export type ScoreBand =
  | "unknown"
  | "below_650"
  | "650_699"
  | "700_749"
  | "750_799"
  | "800_plus";

export type EmployerKind = "mnc" | "govt" | "private" | "other";
export type CityTier = "metro" | "tier2" | "tier3";
export type Verdict = "borrow" | "borrow_less" | "dont_borrow";

export type BindingLimit =
  | "foir"
  | "residual"
  | "ltv"
  | "multiple"
  | "consumption_cap"
  | "bounce"
  | "two_wheeler_cap"
  | "age"
  | "already_maxed";

export type OutputKind = "verdict" | "amount" | "rate" | "emi";

export type Answers = {
  purpose?: Purpose;
  amountWanted?: number;
  loanGuess?: Product | "unsure";
  age?: number;
  workType?: WorkType;
  incomeMonthly?: number;
  cashLow?: number;
  cashHigh?: number;
  existingEmi?: number;
  expenses?: number;
  scoreBand?: ScoreBand;
  scoreExact?: number;

  employerKind?: EmployerKind | null;
  jobYears?: number | null;
  variableShare?: number | null;
  cardUtil?: number | null;
  businessYears?: number | null;
  itrAnnual?: number | null;
  propertyValue?: number | null;
  propertyEncumbered?: boolean | null;
  goldValue?: number | null;
  dependents?: number | null;
  emergencyMonths?: number | null;
  bounced12m?: boolean | null;
  existingRate?: number | null;
  spouseIncome?: number | null;
  coApplicant?: boolean | null;
  upcomingExpense?: number | null;
  extraEarn?: number | null;
  offerRate?: number | null;
  offerFee?: number | null;
  cityTier?: CityTier | null;
  emiMonthsLeft?: number | null;
  unemployedAdults?: number | null;
  gstRegistered?: boolean | null;
};

export type Knobs = {
  householdFoirPersonal: number;
  householdFoirInformal: number;
  consumptionHaircut: number;
  lapLtvLow: number;
  lapLtvHigh: number;
  bounceRateBump: number;
  highCostDebt: number;
  stressIncomeDrop: number;
  stressRateBump: number;
};

export type MoneyBand = { low: number; high: number };

export type RateBand = { low: number; high: number; aprLow: number; aprHigh: number };

export type Alternative = {
  title: string;
  why: string;
  product?: Product;
};

export type Assessment = {
  ready: boolean;
  missingMust: string[];
  product: Product;
  productWhy: string;
  routedAwayFromAsk: boolean;
  verdict: Verdict;
  verdictWhy: string;
  lenderAmount: MoneyBand;
  householdAmount: MoneyBand;
  useAmount: number;
  useAmountWhy: string;
  binding: BindingLimit;
  rate: RateBand;
  rateWhy: string;
  feePct: number;
  emiCeiling: number;
  emiCeilingWhy: string;
  recommendedTenure: number;
  maxTenure: number;
  tenureRows: { months: number; emi: number; label: string }[];
  stress: {
    kind: "income" | "rate";
    emi: number;
    foir: number;
    story: string;
    stillFits: boolean;
  };
  waitStory: string | null;
  confidence: number;
  confidenceWhy: string;
  guesses: string[];
  skippedWideners: string[];
  alternatives: Alternative[];
  income: {
    lender: number;
    household: number;
    whyLender: string;
    whyHousehold: string;
  };
  foir: { lender: number; household: number };
  existingEmi: number;
  surplus: number;
};

export type RuleRow = {
  id: string;
  what: string;
  value: string;
  why: string;
  source: string;
};
