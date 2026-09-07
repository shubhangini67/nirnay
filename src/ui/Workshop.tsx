import { useEffect } from "react";
import { defaultKnobs } from "../domain/assess";
import { inr, pct } from "../domain/money";
import { productLabel } from "../domain/questions";
import { PERSONAS } from "../domain/personas";
import type { Assessment, Knobs } from "../domain/types";

export function Workshop({
  knobs,
  setKnobs,
  result,
  onPersona,
}: {
  knobs: Knobs;
  setKnobs: (k: Knobs) => void;
  result: Assessment;
  onPersona: (id: string) => void;
}) {
  useEffect(() => {
    if (!result.ready) onPersona("priya");
    // Load once when the panel would otherwise be empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="page lab">
      <aside className="panel">
        <p className="eyebrow">Live follow-up</p>
        <h2>Change a rule. Watch the brief move.</h2>
        <p className="why">
          This is the same engine the screens use. Load a borrower, drag a threshold, defend the new number.
        </p>
        {PERSONAS.map((p) => (
          <button key={p.id} className="btn ghost load-btn" onClick={() => onPersona(p.id)}>
            Load {p.name}
          </button>
        ))}
        <button className="ghost load-btn" onClick={() => setKnobs(defaultKnobs())}>
          Reset rules
        </button>
        <label>
          Household FOIR — personal ({pct(knobs.householdFoirPersonal * 100, 0)})
          <input
            className="slider"
            type="range"
            min={0.25}
            max={0.5}
            step={0.01}
            value={knobs.householdFoirPersonal}
            onChange={(e) => setKnobs({ ...knobs, householdFoirPersonal: Number(e.target.value) })}
          />
        </label>
        <label>
          Household FOIR — informal ({pct(knobs.householdFoirInformal * 100, 0)})
          <input
            className="slider"
            type="range"
            min={0.18}
            max={0.4}
            step={0.01}
            value={knobs.householdFoirInformal}
            onChange={(e) => setKnobs({ ...knobs, householdFoirInformal: Number(e.target.value) })}
          />
        </label>
        <label>
          Wedding haircut ({pct(knobs.consumptionHaircut * 100, 0)})
          <input
            className="slider"
            type="range"
            min={0}
            max={0.35}
            step={0.01}
            value={knobs.consumptionHaircut}
            onChange={(e) => setKnobs({ ...knobs, consumptionHaircut: Number(e.target.value) })}
          />
        </label>
        <label>
          LAP LTV low ({pct(knobs.lapLtvLow * 100, 0)})
          <input
            className="slider"
            type="range"
            min={0.35}
            max={0.7}
            step={0.01}
            value={knobs.lapLtvLow}
            onChange={(e) => setKnobs({ ...knobs, lapLtvLow: Number(e.target.value) })}
          />
        </label>
        <label>
          Bounce rate bump ({knobs.bounceRateBump.toFixed(1)} pp)
          <input
            className="slider"
            type="range"
            min={0}
            max={6}
            step={0.25}
            value={knobs.bounceRateBump}
            onChange={(e) => setKnobs({ ...knobs, bounceRateBump: Number(e.target.value) })}
          />
        </label>
        <label>
          High-cost debt fire ({knobs.highCostDebt}%)
          <input
            className="slider"
            type="range"
            min={18}
            max={36}
            step={1}
            value={knobs.highCostDebt}
            onChange={(e) => setKnobs({ ...knobs, highCostDebt: Number(e.target.value) })}
          />
        </label>
        <label>
          Stress income drop ({pct(knobs.stressIncomeDrop * 100, 0)})
          <input
            className="slider"
            type="range"
            min={0.1}
            max={0.4}
            step={0.01}
            value={knobs.stressIncomeDrop}
            onChange={(e) => setKnobs({ ...knobs, stressIncomeDrop: Number(e.target.value) })}
          />
        </label>
      </aside>
      <section>
        {result.ready ? (
          <div className="panel">
            <p className={`verdict ${result.verdict}`}>{result.verdict.replace("_", " ")}</p>
            <h2 style={{ marginTop: 8 }}>{productLabel(result.product)}</h2>
            <p>{result.verdictWhy}</p>
            <table>
              <tbody>
                <tr>
                  <th>Household amount</th>
                  <td>
                    {inr(result.householdAmount.low)} – {inr(result.householdAmount.high)}
                  </td>
                </tr>
                <tr>
                  <th>Lender amount</th>
                  <td>
                    {inr(result.lenderAmount.low)} – {inr(result.lenderAmount.high)}
                  </td>
                </tr>
                <tr>
                  <th>Fair rate</th>
                  <td>
                    {pct(result.rate.low)} – {pct(result.rate.high)}
                  </td>
                </tr>
                <tr>
                  <th>EMI ceiling</th>
                  <td>{inr(result.emiCeiling)}</td>
                </tr>
                <tr>
                  <th>Use this ticket</th>
                  <td>{inr(result.useAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel">
            <h2>Pick a borrower</h2>
            <p className="lede">Click Load Priya, Ravi or Anita on the left. Their brief will appear here, then drag a slider to watch the numbers move.</p>
            <button className="btn primary" onClick={() => onPersona("priya")}>
              Load Priya now
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
