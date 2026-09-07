import { assess } from "./assess";
import { PERSONAS } from "./personas";
import { isAnswered, visibleQuestions } from "./questions";
import { inr, pct } from "./money";

/** Used by RUNTHROUGHS.md — keep the markdown in sync with this dump. */
export function dumpPersona(id: "priya" | "ravi" | "anita"): string {
  const p = PERSONAS.find((x) => x.id === id)!;
  const r = assess(p.answers);
  const vis = visibleQuestions(p.answers);
  const lines = [
    `# ${p.name}`,
    p.city,
    p.ask,
    "",
    "## Questions asked",
    ...vis.map((q) => {
      const v = p.answers[q.field];
      const shown = v === undefined ? "—" : v === null ? "skipped" : String(v);
      return `- ${q.must ? "MUST" : "extra"} ${q.title} → ${shown}`;
    }),
    "",
    "## Outputs",
    `- O1 ${r.verdict}: ${r.verdictWhy}`,
    `- Product: ${r.product} — ${r.productWhy}`,
    `- O2 lender ${inr(r.lenderAmount.low)}–${inr(r.lenderAmount.high)}`,
    `- O2 household ${inr(r.householdAmount.low)}–${inr(r.householdAmount.high)}; use ${inr(r.useAmount)}`,
    `- O3 ${pct(r.rate.low)}–${pct(r.rate.high)}; APR ${pct(r.rate.aprLow)}–${pct(r.rate.aprHigh)}`,
    `- O4 EMI ceiling ${inr(r.emiCeiling)}`,
    `- Confidence ${pct(r.confidence * 100, 0)}`,
    "",
    vis.filter((q) => isAnswered(p.answers, q)).length + " answers given",
  ];
  return lines.join("\n");
}
