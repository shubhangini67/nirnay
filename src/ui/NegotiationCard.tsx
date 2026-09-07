import { inr, monthsLabel, pct } from "../domain/money";
import { productLabel } from "../domain/questions";
import { downloadReceipt } from "../domain/receipt";
import type { Assessment } from "../domain/types";

export function NegotiationCard({
  result,
  onOffer,
}: {
  result: Assessment;
  onOffer: () => void;
}) {
  if (!result.ready) {
    return (
      <main className="page">
        <h1>Finish the must questions first.</h1>
      </main>
    );
  }

  const say =
    result.verdict === "dont_borrow"
      ? `Fair for me is not a new loan. If you still quote ${inr(result.lenderAmount.low)}–${inr(result.lenderAmount.high)}, that is a sales pitch, not a household number.`
      : `Fair for my profile on a ${productLabel(result.product)} is ${pct(result.rate.low)}–${pct(result.rate.high)} (all-in APR about ${pct(result.rate.aprLow)}–${pct(result.rate.aprHigh)}). I will not agree to an EMI above ${inr(result.emiCeiling)}, or a ticket above ${inr(result.useAmount)}.`;

  return (
    <main className="page">
      <p className="eyebrow no-print">Hold this up at the desk · print it if you want</p>
      <div className="card-wrap">
      <div className="card-sheet">
        <header>
          <div>
            <p className="eyebrow">Nirnay walk-in card</p>
            <h1>My number, not yours.</h1>
          </div>
          <strong>
            {result.verdict === "dont_borrow" ? "DON’T BORROW" : result.verdict === "borrow_less" ? "BORROW LESS" : "BORROW"}
          </strong>
        </header>
        <p className="say">{say}</p>
        <div className="grid2">
          <div>
            <p className="k">Fair rate</p>
            <p>
              <b>
                {pct(result.rate.low)} – {pct(result.rate.high)}
              </b>
            </p>
            <p>{result.rateWhy}</p>
          </div>
          <div>
            <p className="k">All-in APR (fee + GST)</p>
            <p>
              <b>
                {pct(result.rate.aprLow)} – {pct(result.rate.aprHigh)}
              </b>
            </p>
            <p>Typical fee used: {pct(result.feePct)} of the ticket.</p>
          </div>
          <div>
            <p className="k">I will take at most</p>
            <p>
              <b>{inr(result.useAmount)}</b>
            </p>
            <p>{result.useAmountWhy}</p>
          </div>
          <div>
            <p className="k">You may sanction</p>
            <p>
              <b>
                {inr(result.lenderAmount.low)} – {inr(result.lenderAmount.high)}
              </b>
            </p>
            <p>That is your grid. It is not what my kitchen can carry.</p>
          </div>
          <div>
            <p className="k">EMI ceiling</p>
            <p>
              <b>{inr(result.emiCeiling)}</b> / month
            </p>
            <p>
              Tenure I will discuss: {monthsLabel(result.recommendedTenure)}. {result.emiCeilingWhy}
            </p>
          </div>
          <div>
            <p className="k">Product</p>
            <p>
              <b>{productLabel(result.product)}</b>
            </p>
            <p>{result.productWhy}</p>
          </div>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Stress: {result.stress.story} Confidence {pct(result.confidence * 100, 0)}.
        </p>
      </div>
      </div>
      <div className="row no-print" style={{ marginTop: "1rem", justifyContent: "center" }}>
        <button className="btn primary" onClick={() => downloadReceipt(result)}>
          Download receipt
        </button>
        <button className="btn" onClick={() => window.print()}>
          Print this card
        </button>
        <button className="ghost" onClick={onOffer}>
          They already quoted a rate
        </button>
      </div>
    </main>
  );
}
