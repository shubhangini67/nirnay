import { inr, monthsLabel, pct } from "../domain/money";
import { productLabel } from "../domain/questions";
import { downloadReceipt } from "../domain/receipt";
import type { Assessment, Verdict } from "../domain/types";

const VERDICT: Record<Verdict, string> = {
  borrow: "Borrow",
  borrow_less: "Borrow less",
  dont_borrow: "Don’t borrow",
};

export function Brief({
  result,
  onCard,
  onOffer,
  onAsk,
}: {
  result: Assessment;
  onCard: () => void;
  onOffer: () => void;
  onAsk: () => void;
}) {
  if (!result.ready) {
    return (
      <main className="page">
        <h1>We still need the basics.</h1>
        <p className="lede">The must questions are enough to print all four numbers, with wide bands.</p>
        <button className="btn primary" onClick={onAsk}>
          Continue questions
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <section className={`verdict-hero ${result.verdict}`}>
        <p className="eyebrow">Your brief · confidence {pct(result.confidence * 100, 0)}</p>
        <span className={`verdict ${result.verdict}`}>{VERDICT[result.verdict]}</span>
        <h1>{VERDICT[result.verdict]}.</h1>
        <p className="lede" style={{ marginBottom: 0 }}>
          {result.verdictWhy}
        </p>
      </section>

      <div className="vs">
        <article className="panel out">
          <div className="k">O2 · Lender may sanction</div>
          <div className="v">
            {inr(result.lenderAmount.low, true)} – {inr(result.lenderAmount.high, true)}
          </div>
          <p className="sub">Their book. Documents, FOIR, LTV.</p>
        </article>
        <div className="vs-mid">use →</div>
        <article className="panel out">
          <div className="k">O2 · You can safely carry</div>
          <div className="v">
            {inr(result.householdAmount.low, true)} – {inr(result.householdAmount.high, true)}
          </div>
          <p className="sub">
            {result.verdict === "borrow_less" && result.useAmount < result.householdAmount.low
              ? "What the house can carry. The walk-in ticket below is a tighter wedding cap, not a point inside this band."
              : result.useAmountWhy}
          </p>
        </article>
      </div>

      <section className="outputs">
        <article className="panel out">
          <div className="k">Product</div>
          <div className="v" style={{ fontSize: "1.35rem" }}>
            {productLabel(result.product)}
          </div>
          <p className="note">{result.productWhy}</p>
        </article>
        <article className="panel out">
          <div className="k">O3 · Fair headline rate</div>
          <div className="v">
            {pct(result.rate.low)} – {pct(result.rate.high)}
          </div>
          <p className="note">
            All-in APR including fee + GST: {pct(result.rate.aprLow)} – {pct(result.rate.aprHigh)}. Fee used{" "}
            {pct(result.feePct)}. {result.rateWhy}
          </p>
        </article>
        <article className="panel out">
          <div className="k">O4 · EMI you should not cross</div>
          <div className="v">{inr(result.emiCeiling)}</div>
          <p className="note">{result.emiCeilingWhy}</p>
        </article>
        <article className="panel out">
          <div className="k">
            {result.verdict === "borrow_less" && result.useAmount < result.householdAmount.low
              ? "Walk-in ticket · conservative wedding cap"
              : "Walk-in ticket · use this"}
          </div>
          <div className="v">{inr(result.useAmount, true)}</div>
          <p className="note">{result.useAmountWhy}</p>
        </article>
      </section>

      <div className="row no-print" style={{ margin: "0.2rem 0 1.2rem" }}>
        <button className="btn primary" onClick={onCard}>
          Open walk-in card
        </button>
        <button className="ghost" onClick={() => downloadReceipt(result)}>
          Download receipt
        </button>
        <button className="ghost" onClick={onOffer}>
          Check a lender’s quote
        </button>
        <button className="ghost" onClick={onAsk}>
          Change answers
        </button>
      </div>

      <section className="panel">
        <h2>Tenure trade-off</h2>
        <p className="note">
          Quoted on {monthsLabel(result.recommendedTenure)}. Longer looks cheaper. It is not cheaper.
        </p>
        <table>
          <thead>
            <tr>
              <th>Tenure</th>
              <th>EMI on the household ticket</th>
            </tr>
          </thead>
          <tbody>
            {result.tenureRows.map((row) => (
              <tr key={row.months}>
                <td>{row.label}</td>
                <td>{inr(row.emi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: "0.8rem" }}>
        <h2>One bad month</h2>
        <p>{result.stress.story}</p>
        <p>
          {result.stress.stillFits
            ? "It still fits household FOIR, barely. Do not add another EMI on top."
            : "It does not fit a bad month. If you still borrow, keep the ticket at the household number, not the lender’s."}
        </p>
      </section>

      {result.waitStory ? (
        <section className="panel" style={{ marginTop: "0.8rem" }}>
          <h2>Wait vs borrow now</h2>
          <p>{result.waitStory}</p>
        </section>
      ) : null}

      <section className="panel" style={{ marginTop: "0.8rem" }}>
        <h2>Why these two incomes differ</h2>
        <p>
          Lender recognises {inr(result.income.lender)} a month. {result.income.whyLender}
        </p>
        <p>
          The house plans on {inr(result.income.household)}. {result.income.whyHousehold}
        </p>
      </section>

      {result.alternatives.length ? (
        <div className="alts">
          {result.alternatives.map((alt) => (
            <article key={alt.title}>
              <b>{alt.title}</b>
              <p style={{ margin: "0.3rem 0 0" }}>{alt.why}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="alts">
        {result.guesses.map((g) => (
          <article className="guess" key={g}>
            {g}
          </article>
        ))}
      </div>
    </main>
  );
}
