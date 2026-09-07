/** Indian rupee grouping: ₹1,10,000 */
export function inr(value: number, compact = false): string {
  const n = Math.round(value);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (compact && abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 1 : 2)} Cr`;
  }
  if (compact && abs >= 1_00_000) {
    const lakh = abs / 1_00_000;
    const digits = lakh >= 10 ? 1 : 2;
    return `${sign}₹${lakh.toFixed(digits)} L`;
  }
  const s = String(abs);
  if (s.length <= 3) return `${sign}₹${s}`;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${sign}₹${parts.join(",")},${last3}`;
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function monthsLabel(m: number): string {
  if (m % 12 === 0) {
    const y = m / 12;
    return y === 1 ? "1 year" : `${y} years`;
  }
  return `${m} months`;
}

/** Standard reducing-balance EMI. */
export function emi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  const pow = (1 + r) ** months;
  return (principal * r * pow) / (pow - 1);
}

export function principalFromEmi(monthly: number, annualPct: number, months: number): number {
  if (monthly <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return monthly * months;
  const pow = (1 + r) ** months;
  return (monthly * (pow - 1)) / (r * pow);
}

/**
 * APR as the IRR on net disbursal (principal minus fee), paid back by the EMI stream.
 * Newton on monthly rate, then ×12. In the spirit of RBI KFS — not a legal calculator.
 */
export function aprFromFee(
  principal: number,
  annualPct: number,
  months: number,
  feeFraction: number,
): number {
  const net = principal * (1 - feeFraction);
  if (net <= 0 || principal <= 0) return annualPct;
  const instalment = emi(principal, annualPct, months);
  let r = annualPct / 100 / 12;
  for (let i = 0; i < 20; i++) {
    let npv = -net;
    let d = 0;
    for (let t = 1; t <= months; t++) {
      const disc = (1 + r) ** t;
      npv += instalment / disc;
      d -= (t * instalment) / ((1 + r) ** (t + 1));
    }
    if (Math.abs(d) < 1e-12) break;
    const next = r - npv / d;
    if (!Number.isFinite(next) || next <= -0.5) break;
    r = next;
    if (Math.abs(npv) < 0.5) break;
  }
  return Math.max(annualPct, r * 12 * 100);
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function roundTicket(n: number): number {
  if (n <= 0) return 0;
  if (n < 50_000) return Math.round(n / 1_000) * 1_000;
  if (n < 5_00_000) return Math.round(n / 5_000) * 5_000;
  return Math.round(n / 10_000) * 10_000;
}

export function mid(low: number, high: number): number {
  return (low + high) / 2;
}
