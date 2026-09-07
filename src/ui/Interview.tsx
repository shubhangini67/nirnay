import { useMemo, useState } from "react";
import { inr, pct } from "../domain/money";
import { downloadReceipt } from "../domain/receipt";
import {
  isAnswered,
  nextQuestion,
  progress,
  type Question,
  visibleQuestions,
} from "../domain/questions";
import type { Answers, Assessment } from "../domain/types";

export function Interview({
  answers,
  setAnswers,
  result,
  onDone,
  onReset,
}: {
  answers: Answers;
  setAnswers: (a: Answers | ((p: Answers) => Answers)) => void;
  result: Assessment;
  onDone: () => void;
  onReset: () => void;
}) {
  const q = nextQuestion(answers);
  const prog = progress(answers);
  const vis = visibleQuestions(answers);
  const [draft, setDraft] = useState("");

  const currentValue = q ? answers[q.field] : undefined;

  const live = useMemo(() => {
    if (!result.ready) return null;
    return result;
  }, [result]);

  function write(field: keyof Answers, value: unknown) {
    setAnswers((prev) => ({ ...prev, [field]: value as never }));
    setDraft("");
  }

  function submitMoney(question: Question) {
    const raw = draft.replace(/[₹,\s]/g, "");
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    write(question.field, n);
  }

  if (!q) {
    return (
      <main className="page">
        <p className="eyebrow">All questions that apply are done</p>
        <h1>That’s enough to print a brief.</h1>
        <p className="lede">You can still go back, or open the four numbers now.</p>
        <div className="row">
          <button className="btn primary" onClick={onDone}>
            See my numbers
          </button>
          {result.ready ? (
            <button className="ghost" onClick={() => downloadReceipt(result)}>
              Download receipt
            </button>
          ) : null}
          <button
            className="ghost"
            onClick={() => {
              const answered = [...vis].reverse().find((item) => isAnswered(answers, item));
              if (!answered) return;
              setAnswers((prev) => {
                const next = { ...prev };
                delete next[answered.field];
                return next;
              });
            }}
          >
            Back
          </button>
          <button className="ghost" onClick={onReset}>
            Start over
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page ask-layout">
      <section className="q-slab">
        <p className="q-kicker">
          {q.must
            ? `Must question ${prog.mustDone + 1} of ${prog.mustTotal}`
            : `Extra — optional. Must-set is done (${prog.mustTotal} questions). Skip any or all.`}
        </p>
        <h1 className="q-title">{q.title}</h1>
        <p className="q-help">{q.help}</p>
        <div className="moves">
          {q.moves.map((m) => (
            <span key={m}>moves {m}</span>
          ))}
        </div>

        {q.kind === "choice" || q.kind === "score" ? (
          <div className="choices">
            {q.choices?.map((c) => (
              <button
                key={c.value}
                className={String(currentValue) === c.value ? "choice on" : "choice"}
                onClick={() => write(q.field, c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : null}

        {q.kind === "yesno" ? (
          <div className="choices">
            <button className="choice" onClick={() => write(q.field, true)}>
              Yes
            </button>
            <button className="choice" onClick={() => write(q.field, false)}>
              No
            </button>
          </div>
        ) : null}

        {q.kind === "money" || q.kind === "number" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.kind === "money") submitMoney(q);
              else {
                const n = Number(draft);
                if (!Number.isFinite(n)) return;
                write(q.field, n);
              }
            }}
          >
            <input
              className="field"
              inputMode="decimal"
              placeholder={q.placeholder ?? (q.kind === "money" ? "0" : "")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            {q.suffix ? <p className="q-help">{q.suffix}</p> : null}
            <button className="btn primary" type="submit">
              Continue
            </button>
          </form>
        ) : null}

        <div className="actions" style={{ marginTop: "1rem" }}>
          {!q.must ? (
            <>
              <button className="btn primary" onClick={onDone}>
                Skip extras — see my numbers
              </button>
              <button className="skip" onClick={() => write(q.field, null)}>
                Skip this one — keep the band wide
              </button>
            </>
          ) : null}
          <button
            className="ghost"
            onClick={() => {
              const answered = [...vis].reverse().find((item) => isAnswered(answers, item));
              if (!answered) return;
              setAnswers((prev) => {
                const next = { ...prev };
                delete next[answered.field];
                return next;
              });
              setDraft("");
            }}
          >
            Back
          </button>
          <button className="ghost" onClick={onReset}>
            Reset
          </button>
        </div>
      </section>

      <aside className="rail">
        <div className="panel">
          <h2>How tight is this?</h2>
          <p>
            Must {prog.mustDone}/{prog.mustTotal}
            {prog.mustDone >= prog.mustTotal
              ? ` · extras optional (${vis.filter((x) => !x.must).length})`
              : ""}
          </p>
          <div className="meter">
            <i style={{ width: `${(prog.mustDone / Math.max(1, prog.mustTotal)) * 100}%` }} />
          </div>
          {live ? (
            <>
              <div className="band">
                <p>
                  <b>Safe amount</b>
                  <br />
                  {inr(live.householdAmount.low)} – {inr(live.householdAmount.high)}
                </p>
                <p>
                  <b>Fair rate</b>
                  <br />
                  {pct(live.rate.low)} – {pct(live.rate.high)}
                </p>
                <p>
                  <b>Confidence</b> {pct(live.confidence * 100, 0)}
                </p>
              </div>
              <p className="why">{live.confidenceWhy}</p>
              <button className="btn wide" onClick={onDone} style={{ marginTop: "0.8rem" }}>
                See full brief
              </button>
            </>
          ) : (
            <p className="why">
              Wide ranges until the must questions are done. We will not invent a tight number from a blank.
            </p>
          )}
        </div>
        <p className="why" style={{ marginTop: "0.8rem" }}>
          A salaried engineer, a kirana owner, and a rider do not see the same list. Hidden questions are not
          counted as skipped.
        </p>
        <ol style={{ fontSize: "0.85rem", color: "var(--muted)", paddingLeft: "1.1rem" }}>
          {vis.map((item) => (
            <li key={item.id}>
              {item.title.slice(0, 42)}
              {isAnswered(answers, item) ? " ✓" : ""}
            </li>
          ))}
        </ol>
      </aside>
    </main>
  );
}
