import { inr, monthsLabel, pct } from "./money";
import { productLabel } from "./questions";
import type { Assessment } from "./types";

const VERDICT = {
  borrow: "Borrow",
  borrow_less: "Borrow less",
  dont_borrow: "Don't borrow",
} as const;

export function receiptHtml(result: Assessment): string {
  const v = VERDICT[result.verdict];
  const say =
    result.verdict === "dont_borrow"
      ? `Fair for me is not a new loan. If you still quote ${inr(result.lenderAmount.low)}–${inr(result.lenderAmount.high)}, that is a sales pitch, not a household number.`
      : `Fair for my profile on a ${productLabel(result.product)} is ${pct(result.rate.low)}–${pct(result.rate.high)} (all-in APR about ${pct(result.rate.aprLow)}–${pct(result.rate.aprHigh)}). I will not agree to an EMI above ${inr(result.emiCeiling)}, or a ticket above ${inr(result.useAmount)}.`;

  const tenure = result.tenureRows
    .map((row) => `<tr><td>${row.label}</td><td>${inr(row.emi)}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Nirnay receipt</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; color: #12241f; padding: 0 1.2rem 3rem; }
    h1 { font-size: 1.8rem; margin: 0 0 .4rem; }
    .muted { color: #5b6e68; }
    .box { border: 1px solid #d4e0db; padding: 1rem 1.1rem; margin: .8rem 0; }
    table { width: 100%; border-collapse: collapse; }
    td, th { text-align: left; padding: .4rem 0; border-bottom: 1px solid #d4e0db; }
    .stamp { font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
  </style>
</head>
<body>
  <p class="muted">Nirnay · self-check receipt · ${new Date().toLocaleString("en-IN")}</p>
  <h1>Walk-in receipt</h1>
  <p class="stamp">${v}</p>
  <p>${result.verdictWhy}</p>
  <div class="box">
    <p><b>Say this at the desk</b></p>
    <p>${say}</p>
  </div>
  <table>
    <tr><th>Product</th><td>${productLabel(result.product)}</td></tr>
    <tr><th>Use this ticket</th><td>${inr(result.useAmount)}</td></tr>
    <tr><th>Household amount</th><td>${inr(result.householdAmount.low)} – ${inr(result.householdAmount.high)}</td></tr>
    <tr><th>Lender may sanction</th><td>${inr(result.lenderAmount.low)} – ${inr(result.lenderAmount.high)}</td></tr>
    <tr><th>Fair rate</th><td>${pct(result.rate.low)} – ${pct(result.rate.high)}</td></tr>
    <tr><th>All-in APR</th><td>${pct(result.rate.aprLow)} – ${pct(result.rate.aprHigh)}</td></tr>
    <tr><th>EMI ceiling</th><td>${inr(result.emiCeiling)} / month · ${monthsLabel(result.recommendedTenure)}</td></tr>
    <tr><th>Confidence</th><td>${pct(result.confidence * 100, 0)}</td></tr>
  </table>
  <h2>Tenure</h2>
  <table>${tenure}</table>
  <p>${result.stress.story}</p>
  <p class="muted">Not a sanction letter. No bureau pull. Numbers come only from what you typed.</p>
</body>
</html>`;
}

export function downloadReceipt(result: Assessment): void {
  const blob = new Blob([receiptHtml(result)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nirnay-receipt-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
