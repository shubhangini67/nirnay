import { useMemo, useState } from "react";
import { offerView } from "../domain/assess";
import { inr, mid, pct } from "../domain/money";
import type { Answers, Assessment, Knobs } from "../domain/types";

export function Offer({
  answers,
  result,
  knobs,
}: {
  answers: Answers;
  result: Assessment;
  knobs: Knobs;
}) {
  const [rate, setRate] = useState(
    String(answers.offerRate ?? Math.round(mid(result.rate.low, result.rate.high) * 10) / 10),
  );
  const [fee, setFee] = useState(String(answers.offerFee ?? 2));

  const view = useMemo(() => {
    const r = Number(rate);
    const f = Number(fee);
    if (!result.ready || !Number.isFinite(r) || !Number.isFinite(f)) return null;
    return offerView(answers, r, f, knobs);
  }, [answers, rate, fee, knobs, result.ready]);

  if (!result.ready) {
    return (
      <main className="page">
        <h1>Finish the self-check first.</h1>
        <p>Then paste the quote they gave you.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="eyebrow">Offer checker</p>
      <h1>They quoted a rate. Is it fair?</h1>
      <p className="lede">
        Your fair band is {pct(result.rate.low)}–{pct(result.rate.high)}. Type their headline rate and fee. We add GST
        and show all-in APR, the way a Key Facts Statement is supposed to.
      </p>
      <div className="grid2">
        <label>
          Headline rate %
          <input className="field" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <label>
          Processing fee %
          <input className="field" value={fee} onChange={(e) => setFee(e.target.value)} />
        </label>
      </div>
      {view ? (
        <section className="panel">
          <p className={`verdict ${view.tag === "fair" ? "borrow" : view.tag === "predatory" ? "dont_borrow" : "borrow_less"}`}>
            {view.tag.replaceAll("_", " ")}
          </p>
          <p className="lede">{view.say}</p>
          <p>
            Their APR, fee included: <b>{pct(view.quotedApr)}</b>. Your all-in band: {pct(view.fair.aprLow)}–
            {pct(view.fair.aprHigh)}.
          </p>
          <p>
            Also refuse any EMI above {inr(result.emiCeiling)}, even if the rate looks pretty.
          </p>
        </section>
      ) : null}
    </main>
  );
}
