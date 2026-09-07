import { CATALOG, MULTIPLE, R, RATE, defaultKnobs, feeAllIn } from "./constants";
import {
  aprFromFee,
  clamp,
  emi,
  inr,
  mid,
  monthsLabel,
  pct,
  principalFromEmi,
  roundTicket,
} from "./money";
import { missingMust, productLabel } from "./questions";
import type {
  Alternative,
  Answers,
  Assessment,
  BindingLimit,
  Knobs,
  Product,
  RateBand,
  ScoreBand,
  Verdict,
} from "./types";

export { CATALOG, defaultKnobs };

function consumptionPurpose(a: Answers): boolean {
  return a.purpose === "wedding" || a.purpose === "other";
}

function scoreTier(band: ScoreBand | undefined, exact?: number): "super" | "prime" | "good" | "fair" | "thin" | "unknown" {
  const n = exact;
  if (n != null) {
    if (n >= 800) return "super";
    if (n >= 750) return "prime";
    if (n >= 700) return "good";
    if (n >= 650) return "fair";
    return "thin";
  }
  switch (band) {
    case "800_plus":
      return "super";
    case "750_799":
      return "prime";
    case "700_749":
      return "good";
    case "650_699":
      return "fair";
    case "below_650":
      return "thin";
    default:
      return "unknown";
  }
}

function typicalCash(a: Answers): number {
  const lo = a.cashLow ?? 0;
  const hi = a.cashHigh ?? lo;
  if (lo && hi) return (lo + hi) / 2;
  return a.incomeMonthly ?? lo;
}

export function recogniseIncome(a: Answers, knobs: Knobs = defaultKnobs()): {
  lender: number;
  household: number;
  whyLender: string;
  whyHousehold: string;
} {
  const spouse = a.spouseIncome ?? 0;
  const co = a.coApplicant === true || (a.coApplicant == null && spouse > 0);
  const spouseL = spouse * (co ? 1 : R.spouseLenderShare);
  const spouseH = spouse * R.spouseHouseShare;
  let extraEarn = 0;
  if (a.extraEarn != null && a.extraEarn > 0) extraEarn = a.extraEarn * R.extraEarnCounted;

  if (a.workType === "salaried") {
    const net = a.incomeMonthly ?? 0;
    const varShare = a.variableShare == null ? 0 : clamp(a.variableShare, 0, 80) / 100;
    const counted = net * (1 - varShare) + net * varShare * R.variableCounted;
    return {
      lender: counted + spouseL,
      household: counted + spouseH + extraEarn,
      whyLender:
        varShare > 0
          ? `Salary after tax, with only half of the ${pct(varShare * 100, 0)} variable slice counted.`
          : "Full take-home salary. We did not invent a bonus.",
      whyHousehold:
        spouse > 0
          ? "Household adds most of the spouse's pay. Extra earn from the loan is counted at 35% if you stated it."
          : "Same salary on the household book, plus 35% of any extra the loan is supposed to earn.",
    };
  }

  const low = a.cashLow ?? typicalCash(a);
  const typical = typicalCash(a);

  if (a.workType === "self_employed") {
    const itrM = a.itrAnnual != null ? a.itrAnnual / 12 : null;
    let lender = itrM ?? typical * R.cashLenderShareIfNoItr;
    if (a.gstRegistered === true) lender *= 1 + R.gstBoostIfRegistered;
    lender += spouseL;
    const household = low + spouseH + extraEarn;
    return {
      lender,
      household,
      whyLender: itrM
        ? `The branch will use ITR (${inr(a.itrAnnual ?? 0)} / 12)${a.gstRegistered ? ", with a small GST-file lift" : ""}. Not the till.`
        : "No ITR, so the lender book counts only half of typical cash.",
      whyHousehold: `The house uses a slow month (${inr(low)}), not a good month. EMI does not wait for a fat week.`,
    };
  }

  // informal
  const lender = typical * R.informalLenderShare + spouseL;
  const household = low + spouseH + extraEarn;
  void knobs;
  return {
    lender,
    household,
    whyLender: "Gig and cash income is counted at 40% on the lender book. Platform payouts do not survive a spreadsheet at face value.",
    whyHousehold: `The house uses the slow month (${inr(low)}). Fat weeks do not raise the ceiling.`,
  };
}

export function pickProduct(a: Answers): { product: Product; why: string; routedAwayFromAsk: boolean } {
  const asked = a.loanGuess && a.loanGuess !== "unsure" ? a.loanGuess : null;
  const property = a.propertyValue ?? 0;
  const free = property > 0 && a.propertyEncumbered !== true;
  const ask = a.amountWanted ?? 0;
  const gold = a.goldValue ?? 0;

  if (a.purpose === "home" || asked === "home") {
    return { product: "home", why: "The purpose is a house, so this is a home loan.", routedAwayFromAsk: asked != null && asked !== "home" };
  }

  const thinOrBurnt =
    a.workType === "informal" || a.bounced12m === true || (a.existingRate ?? 0) >= 24;
  if ((a.purpose === "gold" || asked === "gold" || (thinOrBurnt && gold >= 40_000)) && gold > 0) {
    return {
      product: "gold",
      why: "Gold is the cheaper, cleaner door on a thin or already-stressed file.",
      routedAwayFromAsk: asked != null && asked !== "gold",
    };
  }

  if (
    free &&
    property >= R.lapMinProperty &&
    property >= ask * R.lapCover &&
    (a.purpose === "business" || a.workType === "self_employed" || asked === "lap")
  ) {
    return {
      product: "lap",
      why: `You have an unencumbered property worth ${inr(property)}. Pledging it is cheaper and larger than an unsecured loan. This is the loan you should walk in for.`,
      routedAwayFromAsk: asked != null && asked !== "lap",
    };
  }

  if (a.purpose === "vehicle" && ask <= R.twoWheelerCap) {
    return {
      product: "two_wheeler",
      why: "The ask is a vehicle under the two-wheeler cap, so this is a two-wheeler loan — not a personal loan in disguise.",
      routedAwayFromAsk: asked != null && asked !== "two_wheeler",
    };
  }

  if (a.purpose === "business" && !(free && property >= R.lapMinProperty)) {
    return {
      product: "business",
      why: "Business purpose without enough free property to pledge, so this is unsecured business credit.",
      routedAwayFromAsk: asked != null && asked !== "business",
    };
  }

  const product: Product = asked ?? "personal";
  return {
    product,
    why:
      product === "personal"
        ? "No pledged asset that beats unsecured, so this stays a personal loan."
        : `We kept the ${productLabel(product)} you walked in asking for.`,
    routedAwayFromAsk: false,
  };
}

function pair(low: number, high: number): [number, number] {
  return [low, high];
}

function headlineRate(a: Answers, product: Product): [number, number] {
  const tier = scoreTier(a.scoreBand, a.scoreExact);
  if (product === "gold") return pair(RATE.gold[0], RATE.gold[1]);
  if (product === "home") {
    if (tier === "unknown") return pair(RATE.home.unknown[0], RATE.home.unknown[1]);
    return pair(RATE.home[tier][0], RATE.home[tier][1]);
  }
  if (product === "lap") {
    if (tier === "unknown") return pair(RATE.lap.unknown[0], RATE.lap.unknown[1]);
    return pair(RATE.lap[tier][0], RATE.lap[tier][1]);
  }
  if (product === "two_wheeler") {
    if (tier === "unknown") return pair(RATE.twoWheeler.unknown[0], RATE.twoWheeler.unknown[1]);
    if (a.workType === "informal") return pair(RATE.twoWheeler.informal[0], RATE.twoWheeler.informal[1]);
    if (tier === "super" || tier === "prime") return pair(RATE.twoWheeler.prime[0], RATE.twoWheeler.prime[1]);
    return pair(RATE.twoWheeler.standard[0], RATE.twoWheeler.standard[1]);
  }
  if (product === "business") {
    if (tier === "unknown") return pair(RATE.business.unknown[0], RATE.business.unknown[1]);
    if (a.itrAnnual && a.itrAnnual > 0) return pair(RATE.business.documented[0], RATE.business.documented[1]);
    return pair(RATE.business.thin[0], RATE.business.thin[1]);
  }
  if (tier === "unknown") {
    if (a.workType === "informal") return pair(RATE.personal.unknownInformal[0], RATE.personal.unknownInformal[1]);
    if (a.workType === "self_employed") return pair(RATE.personal.unknownSelf[0], RATE.personal.unknownSelf[1]);
    return pair(RATE.personal.unknownSalaried[0], RATE.personal.unknownSalaried[1]);
  }
  return pair(RATE.personal[tier][0], RATE.personal[tier][1]);
}

export function rateBandFor(a: Answers, product: Product, knobs: Knobs): RateBand {
  let [low, high] = headlineRate(a, product);
  const notes: string[] = [];

  const mnc = a.employerKind === "mnc" || a.employerKind === "govt";
  if (mnc && product === "personal") {
    low -= R.mncGovtCut;
    high -= R.mncGovtCut;
    notes.push("MNC / government files are priced a little better (−0.50pp)");
  }
  if (a.workType === "salaried" && a.jobYears != null && a.jobYears < 1) {
    low += R.shortJobBump;
    high += R.shortJobBump;
    notes.push("job under a year (+1.25pp)");
  }
  if (
    (a.workType === "salaried" && (a.jobYears ?? 0) >= 5) ||
    (a.workType === "self_employed" && (a.businessYears ?? 0) >= 10)
  ) {
    low -= R.longStableCut;
    high -= R.longStableCut;
    notes.push("long vintage (−0.25pp)");
  }
  if (a.workType === "self_employed" && a.businessYears != null && a.businessYears < 3) {
    low += R.youngBizBump;
    high += R.youngBizBump;
    notes.push("young business (+1.25pp)");
  }
  if (a.cardUtil != null && a.cardUtil >= R.cardUtilFlag * 100) {
    high += R.cardUtilBump;
    notes.push("card utilisation ≥ 75% (high end only)");
  }
  if (a.bounced12m === true) {
    low += knobs.bounceRateBump;
    high += knobs.bounceRateBump;
    notes.push(`a bounce in 12 months (+${knobs.bounceRateBump}pp)`);
  } else if (a.bounced12m == null && a.existingEmi && a.existingEmi > 0) {
    high += R.unknownBounceWiden;
    notes.push("bounce unanswered — we widened the top, we did not invent a stain");
  }

  if (product === "personal") {
    low = Math.max(low, R.personalFloor);
  }
  if (high < low) high = low + 1.5;

  const fee = feeAllIn(product);
  const tenure = tenureFor(a, product);
  const aprLow = aprFromFee(1_00_000, low, tenure, fee);
  const aprHigh = aprFromFee(1_00_000, high, tenure, fee);

  return { low, high, aprLow, aprHigh };
}

function tenureFor(a: Answers, product: Product): number {
  const maxAge = product === "personal" || product === "business" || product === "two_wheeler" ? R.maxAgeUnsecured : R.maxAgeSecured;
  const byAge = Math.max(12, (maxAge - (a.age ?? 35)) * 12);
  return Math.min(R.defaultTenure[product], R.maxTenure[product], byAge);
}

function maxTenureFor(a: Answers, product: Product): number {
  const maxAge = product === "personal" || product === "business" || product === "two_wheeler" ? R.maxAgeUnsecured : R.maxAgeSecured;
  const byAge = Math.max(12, (maxAge - (a.age ?? 35)) * 12);
  return Math.min(R.maxTenure[product], byAge);
}

function foirPair(a: Answers, product: Product, knobs: Knobs): { lender: number; household: number } {
  const tier = scoreTier(a.scoreBand, a.scoreExact);
  const prime = a.workType === "salaried" && (tier === "super" || tier === "prime") && (a.employerKind === "mnc" || a.employerKind === "govt" || (a.jobYears ?? 0) >= 3);
  const informal = a.workType === "informal";

  if (product === "lap") return { lender: R.foirLender.lap, household: R.foirHouse.lap };
  if (product === "home") return { lender: R.foirLender.home, household: R.foirHouse.home };
  if (product === "gold") return { lender: R.foirLender.gold, household: R.foirHouse.gold };
  if (product === "two_wheeler") {
    return {
      lender: R.foirLender.twoWheeler,
      household: informal ? knobs.householdFoirInformal : R.foirHouse.twoWheeler,
    };
  }
  if (product === "business") return { lender: R.foirLender.business, household: R.foirHouse.business };
  if (informal) return { lender: R.foirLender.personalThin, household: knobs.householdFoirInformal };
  if (prime) return { lender: R.foirLender.personalPrime, household: knobs.householdFoirPersonal };
  if (tier === "thin" || tier === "fair") return { lender: R.foirLender.personalThin, household: R.foirHouse.personalStandard };
  return { lender: R.foirLender.personalStandard, household: R.foirHouse.personalStandard };
}

function buffer(a: Answers, householdIncome: number): number {
  const deps = a.dependents ?? 0;
  const unemp = a.unemployedAdults ?? 0;
  let b = Math.max(R.bufferFloor, householdIncome * R.bufferOfIncome);
  b += deps * R.perDependent;
  b += unemp * R.perUnemployedAdult;
  return b;
}

function multipleBand(a: Answers, product: Product, lenderIncome: number): [number, number] {
  const tier = scoreTier(a.scoreBand, a.scoreExact);
  if (product === "lap") return [lenderIncome * MULTIPLE.lap[0], lenderIncome * MULTIPLE.lap[1]];
  if (product === "home") return [lenderIncome * MULTIPLE.home[0], lenderIncome * MULTIPLE.home[1]];
  if (product === "gold") return [0, Infinity];
  if (product === "business") {
    const doc = a.itrAnnual && a.itrAnnual > 0;
    const m = doc ? MULTIPLE.business.documented : MULTIPLE.business.thin;
    return [lenderIncome * m[0], lenderIncome * m[1]];
  }
  const table = MULTIPLE.personal;
  let pairM: readonly [number, number];
  if (tier === "unknown") {
    pairM =
      a.workType === "informal"
        ? table.unknownInformal
        : a.workType === "self_employed"
          ? table.unknownSelf
          : table.unknownSalaried;
  } else {
    pairM = table[tier];
  }
  let [lo, hi] = pairM;
  if (a.employerKind === "mnc" || a.employerKind === "govt") {
    lo += 1;
    hi += 2;
  }
  if (a.workType === "salaried" && a.jobYears != null && a.jobYears < 1) {
    lo = Math.max(3, lo - 3);
    hi = Math.max(lo + 2, hi - 4);
  }
  return [lenderIncome * lo, lenderIncome * hi];
}

function ltvCap(a: Answers, product: Product, knobs: Knobs): [number, number] | null {
  if (product === "lap") {
    const v = a.propertyEncumbered ? 0 : (a.propertyValue ?? 0);
    return [v * knobs.lapLtvLow, v * knobs.lapLtvHigh];
  }
  if (product === "home") {
    const v = a.propertyValue ?? 0;
    if (v <= 0) return null;
    return [v * R.ltv.homeLow, v * R.ltv.homeHigh];
  }
  if (product === "gold") {
    const v = a.goldValue ?? 0;
    return [v * R.ltv.goldLow, v * R.ltv.goldHigh];
  }
  return null;
}

function widen(low: number, high: number, factor: number): [number, number] {
  const m = mid(low, high);
  const span = Math.max(high - low, m * 0.08);
  const extra = span * factor;
  return [Math.max(0, low - extra / 2), high + extra / 2];
}

export function assess(a: Answers, knobs: Knobs = defaultKnobs()): Assessment {
  const missing = missingMust(a).map((q) => q.id);
  const empty = emptyAssessment(missing);
  if (missing.length) return empty;

  const income = recogniseIncome(a, knobs);
  const { product, why: productWhy, routedAwayFromAsk } = pickProduct(a);
  const foir = foirPair(a, product, knobs);
  const rates = rateBandFor(a, product, knobs);
  const rateWhyBits: string[] = [];
  if (a.scoreBand === "unknown") {
    rateWhyBits.push("Score is unknown, so this is a wide band — not a 300, and not a made-up 780.");
  } else {
    rateWhyBits.push(`For a ${productLabel(product)} and the score you gave, headline pricing sits near ${pct(rates.low)}–${pct(rates.high)}.`);
  }
  const tenure = tenureFor(a, product);
  const maxTen = maxTenureFor(a, product);
  const fee = feeAllIn(product);
  const existing = a.existingEmi ?? 0;
  const expenses = a.expenses ?? 0;
  const buf = buffer(a, income.household);
  const surplus = income.household - expenses - existing - buf;

  const lenderRoom = Math.max(0, income.lender * foir.lender - existing);
  let houseRoom = Math.max(0, Math.min(income.household * foir.household - existing, surplus));

  if (consumptionPurpose(a)) {
    houseRoom *= 1 - knobs.consumptionHaircut;
  }
  const unsecured =
    product === "personal" || product === "business" || product === "two_wheeler";
  if (
    unsecured &&
    a.emergencyMonths != null &&
    a.emergencyMonths < R.emergencyOkMonths
  ) {
    houseRoom *= R.thinSavingsHaircut;
  }
  if (a.upcomingExpense != null && a.upcomingExpense > 0) {
    houseRoom = Math.max(0, houseRoom - (a.upcomingExpense * R.upcomingExpenseHaircut) / 12);
  }
  if (a.bounced12m === true) {
    houseRoom = Math.min(houseRoom, income.household * R.bounceNewEmiCap);
  }

  const quoteRate = mid(rates.low, rates.high);
  let housePrincipal = principalFromEmi(houseRoom, quoteRate, tenure);
  let lenderPrincipalLow = principalFromEmi(lenderRoom, rates.high, tenure);
  let lenderPrincipalHigh = principalFromEmi(lenderRoom, rates.low, maxTen);

  const [, multHi] = multipleBand(a, product, income.lender);
  lenderPrincipalLow = Math.min(lenderPrincipalLow, multHi);
  lenderPrincipalHigh = Math.min(lenderPrincipalHigh, multHi);
  housePrincipal = Math.min(housePrincipal, multHi);

  const ltv = ltvCap(a, product, knobs);
  if (ltv) {
    lenderPrincipalLow = Math.min(lenderPrincipalLow, ltv[1]);
    lenderPrincipalHigh = Math.min(lenderPrincipalHigh, ltv[1]);
    housePrincipal = Math.min(housePrincipal, ltv[0] > 0 ? ltv[1] : 0);
  }

  if (product === "two_wheeler") {
    lenderPrincipalLow = Math.min(lenderPrincipalLow, R.twoWheelerCap);
    lenderPrincipalHigh = Math.min(lenderPrincipalHigh, R.twoWheelerCap);
    housePrincipal = Math.min(housePrincipal, R.twoWheelerCap);
  }

  if (consumptionPurpose(a)) {
    const cap = (a.incomeMonthly ?? income.household) * R.consumptionMonthsCap;
    housePrincipal = Math.min(housePrincipal, cap);
  }

  if (a.bounced12m === true) {
    lenderPrincipalLow *= 0.45;
    lenderPrincipalHigh *= 0.7;
  }

  const skipped: string[] = [];
  if (a.scoreBand === "unknown") skipped.push("credit score");
  if (a.emergencyMonths == null && (a.workType === "salaried" || a.workType === "informal")) skipped.push("emergency savings");
  if (a.workType === "informal" && a.bounced12m == null) skipped.push("bounce history");
  if (a.workType === "self_employed" && a.itrAnnual == null) skipped.push("ITR");
  if (a.workType === "informal" && a.dependents == null) skipped.push("dependents");

  let widenFactor = 0;
  if (a.scoreBand === "unknown") widenFactor += 0.35;
  if (a.emergencyMonths == null && (a.workType === "salaried" || a.workType === "informal")) widenFactor += R.bandWidenPerSkip;
  if (a.workType === "informal" && a.bounced12m == null) widenFactor += R.bandWidenPerSkip * 0.6;
  if (a.workType === "informal" && a.dependents == null) widenFactor += R.bandWidenPerSkip * 0.4;

  let houseLow = housePrincipal * (a.emergencyMonths == null ? 0.9 : 0.92);
  let houseHigh = housePrincipal;
  [houseLow, houseHigh] = widen(houseLow, houseHigh, widenFactor);

  let lendLow = lenderPrincipalLow;
  let lendHigh = Math.max(lenderPrincipalLow, lenderPrincipalHigh);
  [lendLow, lendHigh] = widen(lendLow, lendHigh, widenFactor * 0.5);

  if (houseHigh < R.minLoan) {
    houseLow = 0;
    houseHigh = 0;
  }
  if (lendHigh < R.minLoan) {
    lendLow = 0;
    lendHigh = 0;
  }

  houseLow = roundTicket(houseLow);
  houseHigh = roundTicket(houseHigh);
  lendLow = roundTicket(lendLow);
  lendHigh = roundTicket(lendHigh);
  if (houseHigh < houseLow) houseHigh = houseLow;
  if (lendHigh < lendLow) lendHigh = lendLow;

  const alreadyMaxed = existing >= income.lender * foir.lender - 200;
  const highCost = (a.existingRate ?? 0) >= knobs.highCostDebt;
  const bounceFire = a.bounced12m === true && highCost;
  const surplusTight = income.household > 0 && surplus < income.household * R.surplusFloor && existing > 0;

  let binding: BindingLimit = "foir";
  const foirHouseRoom = income.household * foir.household - existing;
  if (alreadyMaxed) binding = "already_maxed";
  else if (surplus + 1 < foirHouseRoom) binding = "residual";
  else if (ltv && ltv[1] < houseHigh + 1 && product === "lap") binding = "ltv";
  else if (consumptionPurpose(a) && houseHigh <= (a.incomeMonthly ?? income.household) * R.consumptionMonthsCap + 1)
    binding = "consumption_cap";
  else if (a.bounced12m === true) binding = "bounce";
  else if (product === "two_wheeler" && houseHigh >= R.twoWheelerCap) binding = "two_wheeler_cap";

  const ask = a.amountWanted ?? 0;
  let verdict: Verdict = "borrow";
  let verdictWhy = "";

  if (bounceFire || alreadyMaxed || houseHigh <= 0 || (surplusTight && a.workType === "informal")) {
    verdict = "dont_borrow";
    if (bounceFire) {
      verdictWhy = `Don't borrow. An EMI already bounced, and you are paying ${pct(a.existingRate ?? 0, 0)} on existing debt. A new loan is more fuel. Clear the costly paper first.`;
    } else if (alreadyMaxed) {
      verdictWhy = `Don't borrow. Existing EMIs of ${inr(existing)} already fill the lender's ${pct(foir.lender * 100, 0)} FOIR on recognised income of ${inr(income.lender)}. There is no room.`;
    } else {
      verdictWhy = `Don't borrow. After rent, food, current EMIs and a cash buffer, the house cannot carry a new EMI. A counter may still try to sell you one. Refuse it.`;
    }
  } else if (
    ask > houseHigh * 1.04 ||
    (consumptionPurpose(a) && ask > houseHigh * 0.88)
  ) {
    verdict = "borrow_less";
    verdictWhy = consumptionPurpose(a)
      ? `Borrow less than ${inr(ask)}. A wedding should not sit on the last rupee of your ceiling. The house can honestly carry about ${inr(houseLow)}–${inr(houseHigh)}.`
      : `Borrow less than ${inr(ask)}. The house can carry about ${inr(houseLow)}–${inr(houseHigh)}. Take that number to the branch, not the sanction they will try to print.`;
  } else {
    verdict = "borrow";
    verdictWhy = `This ask fits the household ceiling of ${inr(houseHigh)} on a ${productLabel(product)}. Walk in for that product, at a fair rate of ${pct(rates.low)}–${pct(rates.high)}.`;
  }

  if (product === "two_wheeler" && verdict === "dont_borrow" && lendHigh < 70_000) {
    lendLow = 70_000;
    lendHigh = 1_20_000;
  }

  const useAmount =
    verdict === "dont_borrow"
      ? 0
      : verdict === "borrow_less"
        ? roundTicket(Math.min(ask, houseHigh * (consumptionPurpose(a) ? 0.88 : 1)))
        : Math.min(ask, houseHigh);
  const useAmountWhy =
    verdict === "dont_borrow"
      ? "Use ₹0. The number you should carry into the branch is zero, even if a counter quotes more."
      : `Use ${inr(useAmount)} — the household ceiling, not the ${inr(lendHigh)} a lender might still sanction.`;

  const shownEmi =
    verdict === "dont_borrow" ? 0 : Math.max(0, Math.round(houseRoom / 10) * 10);

  const bindingWhy = whyBinding(binding, {
    foir: foir.household,
    income: income.household,
    existing,
    surplus,
    room: houseRoom,
    product,
    consumption: consumptionPurpose(a),
  });

  const tenureRows = uniqueMonths([
    Math.max(12, Math.min(24, maxTen)),
    Math.max(12, Math.min(36, maxTen)),
    tenure,
    Math.max(12, Math.min(60, maxTen)),
    maxTen,
  ]).map((m) => {
    const ticket = verdict === "dont_borrow" ? 0 : Math.min(ask, houseHigh) || houseHigh;
    return {
      months: m,
      emi: Math.round(emi(ticket, quoteRate, m) / 10) * 10,
      label: monthsLabel(m),
    };
  });

  const ticket = verdict === "dont_borrow" ? 0 : Math.min(ask || houseHigh, houseHigh);
  const baseEmi = emi(ticket, quoteRate, tenure);
  const incomeDrop = knobs.stressIncomeDrop;
  const stressedIncome = income.household * (1 - incomeDrop);
  const stressedFoir = existing + baseEmi > 0 ? (existing + baseEmi) / Math.max(1, stressedIncome) : 0;
  const rateStressEmi = emi(ticket, quoteRate + knobs.stressRateBump, tenure);
  const rateFoir = (existing + rateStressEmi) / Math.max(1, income.household);
  const incomeWorse = stressedFoir >= rateFoir;
  const stressFoir = incomeWorse ? stressedFoir : rateFoir;
  const stillFits = stressFoir <= foir.household + 0.02 && ticket > 0;

  const stress = {
    kind: (incomeWorse ? "income" : "rate") as "income" | "rate",
    emi: Math.round((incomeWorse ? baseEmi : rateStressEmi) / 10) * 10,
    foir: stressFoir,
    story: incomeWorse
      ? `If income drops ${pct(incomeDrop * 100, 0)}, this EMI plus current EMIs eats ${pct(stressedFoir * 100, 0)} of a thinner month.`
      : `If the rate resets +${knobs.stressRateBump.toFixed(1)}pp, EMI becomes ${inr(rateStressEmi)} and FOIR becomes ${pct(rateFoir * 100, 0)}.`,
    stillFits,
  };

  let waitStory: string | null = null;
  if ((a.emiMonthsLeft ?? 0) >= 6 && existing > 0 && verdict !== "borrow") {
    const laterRoom = houseRoom + existing;
    const laterTicket = roundTicket(principalFromEmi(laterRoom, quoteRate, tenure));
    waitStory = `Your current EMI of ${inr(existing)} ends in about ${a.emiMonthsLeft} months. If you wait, household room jumps and a ticket near ${inr(laterTicket)} starts to fit without stretching.`;
  }

  const { confidence, confidenceWhy } = confidenceOf(a, skipped);

  const guesses: string[] = [];
  if (a.scoreBand === "unknown") guesses.push("Rate is a wide band because the score is unknown. A bureau pull at the branch can move this a lot.");
  if (a.emergencyMonths == null) guesses.push("Savings months were skipped, so the low end of the safe amount is wider. We did not assume you have nothing.");
  if (a.bounced12m == null) guesses.push("Bounce history was skipped. We did not mark the file clean and we did not mark it stained.");
  if (a.workType === "self_employed" && a.itrAnnual == null) guesses.push("No ITR, so the lender book is a haircut on cash. A filed return would raise what the branch can sanction.");
  if (product === "lap") guesses.push("We assumed an unencumbered shop can take a LAP. A lawyer or the bank's legal team might disagree.");
  guesses.push("Rates are reasoned 2026 walk-in bands, not a live HDFC / Bajaj / Shriram grid.");

  const alternatives = buildAlternatives(a, {
    product,
    verdict,
    houseHigh,
    gold: a.goldValue ?? 0,
    existing,
    highCost,
  });

  const emiCeilingWhy =
    shownEmi <= 0
      ? "The monthly ceiling is ₹0. Any new EMI is a stretch."
      : `Do not agree to more than ${inr(shownEmi)} a month. That is household FOIR of ${pct(foir.household * 100, 0)} on ${inr(income.household)}, minus current EMIs of ${inr(existing)}${consumptionPurpose(a) ? ", then a 15% cut because this loan buys a party, not a machine" : ""}. ${bindingWhy}`;

  return {
    ready: true,
    missingMust: [],
    product,
    productWhy,
    routedAwayFromAsk,
    verdict,
    verdictWhy,
    lenderAmount: { low: lendLow, high: lendHigh },
    householdAmount: { low: houseLow, high: houseHigh },
    useAmount,
    useAmountWhy,
    binding,
    rate: rates,
    rateWhy: rateWhyBits.join(" "),
    feePct: fee * 100,
    emiCeiling: shownEmi,
    emiCeilingWhy,
    recommendedTenure: tenure,
    maxTenure: maxTen,
    tenureRows,
    stress,
    waitStory,
    confidence,
    confidenceWhy,
    guesses,
    skippedWideners: skipped,
    alternatives,
    income,
    foir,
    existingEmi: existing,
    surplus,
  };
}

function whyBinding(
  binding: BindingLimit,
  ctx: {
    foir: number;
    income: number;
    existing: number;
    surplus: number;
    room: number;
    product: Product;
    consumption: boolean;
  },
): string {
  switch (binding) {
    case "residual":
      return `The leftover after spend and a cash buffer (${inr(Math.max(0, ctx.surplus))}) is tighter than FOIR, so leftover cash is the ceiling — not the bank's ratio.`;
    case "already_maxed":
      return "Current EMIs already fill the ratio. There is no second ticket.";
    case "ltv":
      return "The shop's value, not your income, is what caps a LAP.";
    case "consumption_cap":
      return "A wedding is capped at eight months of take-home so you do not finance a party with years of interest.";
    case "bounce":
      return "A recent bounce caps any new EMI at 8% of household income.";
    case "two_wheeler_cap":
      return "Two-wheeler tickets stop at ₹2,50,000 in this model.";
    case "multiple":
      return "Income-multiple grids cap the sanction before FOIR does.";
    case "age":
      return "Tenure is cut so the loan ends before typical retirement age.";
    default:
      return `Household FOIR of ${pct(ctx.foir * 100, 0)} on ${inr(ctx.income)} minus current EMIs of ${inr(ctx.existing)} is what sets this ceiling.`;
  }
}

function confidenceOf(a: Answers, skipped: string[]): { confidence: number; confidenceWhy: string } {
  const visMust = missingMust(a);
  void visMust;
  const addFields: (keyof Answers)[] = [
    "employerKind",
    "jobYears",
    "businessYears",
    "itrAnnual",
    "propertyValue",
    "dependents",
    "emergencyMonths",
    "bounced12m",
    "existingRate",
    "spouseIncome",
    "extraEarn",
    "emiMonthsLeft",
  ];
  const relevant = addFields.filter((f) => {
    if (f === "employerKind" || f === "jobYears") return a.workType === "salaried";
    if (f === "businessYears" || f === "itrAnnual" || f === "spouseIncome") return a.workType === "self_employed";
    if (f === "propertyValue") return a.workType === "self_employed" || a.purpose === "business";
    if (f === "dependents" || f === "existingRate") return a.workType === "informal";
    if (f === "bounced12m") return a.workType === "informal";
    if (f === "emergencyMonths") return a.workType === "salaried" || a.workType === "informal";
    if (f === "extraEarn") return a.purpose === "business";
    if (f === "emiMonthsLeft") return a.workType === "salaried" && (a.existingEmi ?? 0) > 0;
    return true;
  });
  const answered = relevant.filter((f) => a[f] !== undefined).length;
  const addScore = relevant.length ? answered / relevant.length : 1;
  let c = R.confidenceMust + R.confidenceAdd * addScore;
  if (a.scoreBand === "unknown") c = Math.min(c, R.unknownScoreCap);
  c = clamp(c, 0.28, 0.92);
  const why =
    a.scoreBand === "unknown"
      ? `Confidence is ${pct(c * 100, 0)} and capped because the score is unknown. Extra answers cannot fake a tight rate.`
      : skipped.length
        ? `Confidence is ${pct(c * 100, 0)}. Skipped ${skipped.join(", ")}, so bands stay wider.`
        : `Confidence is ${pct(c * 100, 0)} because the must-set is complete and most extra questions that apply were answered.`;
  return { confidence: c, confidenceWhy: why };
}

function buildAlternatives(
  a: Answers,
  ctx: { product: Product; verdict: Verdict; houseHigh: number; gold: number; existing: number; highCost: boolean },
): Alternative[] {
  const out: Alternative[] = [];
  if (ctx.verdict === "dont_borrow" && ctx.highCost) {
    out.push({
      title: "Clear the costly loans first",
      why: "App paper at 24%+ is the fire. A gold loan or a family top-up at a lower rate to kill that EMI is the only borrowing that might still make sense.",
      product: ctx.gold >= 30_000 ? "gold" : undefined,
    });
  }
  if (ctx.gold >= 40_000 && ctx.product !== "gold") {
    out.push({
      title: "Ask for gold, not a new unsecured EMI",
      why: `Jewellery around ${inr(ctx.gold)} can raise 65–75% as a gold loan, usually cheaper than a thin-file personal or two-wheeler loan.`,
      product: "gold",
    });
  }
  if (ctx.product === "lap") {
    out.push({
      title: "Do not walk in for a personal loan",
      why: "Unsecured will be smaller, costlier, and easier to reject. The shop is the product.",
    });
  }
  if (ctx.verdict === "borrow_less" && consumptionPurpose(a)) {
    out.push({
      title: "Cut the event, or wait",
      why: "A smaller wedding, or waiting until a current EMI ends, is cheaper than stretching eight lakhs of unsecured paper.",
    });
  }
  if (ctx.verdict === "dont_borrow" && a.purpose === "vehicle") {
    out.push({
      title: "A used scooter, or wait for a second earner",
      why: "Doubling delivery runs is a real idea. Financing it on top of bounced 30% app loans is how the idea fails.",
    });
  }
  if (a.extraEarn && a.extraEarn > 0 && ctx.verdict !== "dont_borrow") {
    out.push({
      title: "Treat extra earn as a bonus, not a plan",
      why: "We already counted only 35% of the extra the loan is supposed to make. If that extra does not show up, the EMI still does.",
    });
  }
  return out.slice(0, 4);
}

function uniqueMonths(xs: number[]): number[] {
  return [...new Set(xs.map((m) => Math.round(m / 6) * 6 || m))].filter((m) => m >= 12).sort((a, b) => a - b);
}

function emptyAssessment(missingMust: string[]): Assessment {
  const zeroBand = { low: 0, high: 0, aprLow: 0, aprHigh: 0 };
  return {
    ready: false,
    missingMust,
    product: "personal",
    productWhy: "",
    routedAwayFromAsk: false,
    verdict: "borrow_less",
    verdictWhy: "Answer the must questions first.",
    lenderAmount: { low: 0, high: 0 },
    householdAmount: { low: 0, high: 0 },
    useAmount: 0,
    useAmountWhy: "",
    binding: "foir",
    rate: zeroBand,
    rateWhy: "",
    feePct: 0,
    emiCeiling: 0,
    emiCeilingWhy: "",
    recommendedTenure: 48,
    maxTenure: 60,
    tenureRows: [],
    stress: { kind: "income", emi: 0, foir: 0, story: "", stillFits: false },
    waitStory: null,
    confidence: 0,
    confidenceWhy: "",
    guesses: [],
    skippedWideners: [],
    alternatives: [],
    income: { lender: 0, household: 0, whyLender: "", whyHousehold: "" },
    foir: { lender: 0, household: 0 },
    existingEmi: 0,
    surplus: 0,
  };
}

export function offerView(
  a: Answers,
  quotedRate: number,
  quotedFeePct: number,
  knobs: Knobs = defaultKnobs(),
): {
  fair: RateBand;
  quotedApr: number;
  tag: "fair" | "a_bit_high" | "expensive" | "predatory";
  say: string;
} {
  const r = assess(a, knobs);
  const tenure = r.recommendedTenure;
  const fee = quotedFeePct / 100;
  const quotedApr = aprFromFee(a.amountWanted || r.useAmount || 1_00_000, quotedRate, tenure, fee);
  if (r.verdict === "dont_borrow") {
    return {
      fair: r.rate,
      quotedApr,
      tag: quotedRate >= 24 ? "predatory" : "expensive",
      say: `Even at ${pct(quotedRate)}, the answer is still don't borrow. Your EMI ceiling is ₹0. A pretty rate is how a counter books a bad file.`,
    };
  }
  let tag: "fair" | "a_bit_high" | "expensive" | "predatory" = "fair";
  if (quotedApr > 28 || quotedRate >= 24) tag = "predatory";
  else if (quotedRate > r.rate.high + 2) tag = "expensive";
  else if (quotedRate > r.rate.high + 0.35) tag = "a_bit_high";
  const say =
    tag === "fair"
      ? `This quote sits inside your fair band of ${pct(r.rate.low)}–${pct(r.rate.high)} (APR about ${pct(r.rate.aprLow)}–${pct(r.rate.aprHigh)}). You can take it if the EMI also stays under ${inr(r.emiCeiling)}.`
      : tag === "a_bit_high"
        ? `Headline ${pct(quotedRate)} is a little above your fair high of ${pct(r.rate.high)}. Ask them to match ${pct(r.rate.high)} or explain the extra in writing on the Key Facts Statement.`
        : tag === "expensive"
          ? `Fair for this file is ${pct(r.rate.low)}–${pct(r.rate.high)}. ${pct(quotedRate)} is selling you the spread. Walk, or ask for a secured product.`
          : `${pct(quotedRate)} is in payday territory. Do not sign. If you already have loans this costly, this app will tell you not to add another.`;
  return { fair: r.rate, quotedApr, tag, say };
}
