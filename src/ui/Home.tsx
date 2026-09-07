import { PERSONAS } from "../domain/personas";

export function Home({
  onStart,
  onPersona,
}: {
  onStart: () => void;
  onPersona: (id: string) => void;
}) {
  return (
    <main className="page">
      <div className="hero">
        <div>
          <p className="pill">India · rupees · no login</p>
          <h1>
            Walk in with <span className="grad-text">your number</span>, not theirs.
          </h1>
          <p className="lede">
            Answer a few questions. Get four numbers a lender already has and you usually don’t: whether to
            borrow, how much is safe, what rate is fair, and the EMI you should not cross. Then hold up one
            page at the desk.
          </p>
          <div className="row">
            <button className="btn primary" onClick={onStart}>
              Start the self-check
            </button>
            <a className="ghost" href="#/rules">
              Read the rules
            </a>
          </div>
        </div>
        <aside className="hero-card">
          <p className="eyebrow">The four outputs</p>
          <ol>
            <li>Should you borrow at all?</li>
            <li>What the bank may give vs what you can carry</li>
            <li>A fair rate band, plus all-in APR with fees</li>
            <li>The EMI ceiling, with one bad-month test</li>
          </ol>
        </aside>
      </div>

      <section className="step-rail">
        <button type="button" onClick={onStart}>
          <div className="n">01</div>
          <strong>Borrow / less / don’t</strong>
          <span>Don’t is a real answer. Start here →</span>
        </button>
        <button type="button" onClick={onStart}>
          <div className="n">02</div>
          <strong>Two amounts</strong>
          <span>Lender book vs household book. Start here →</span>
        </button>
        <button type="button" onClick={onStart}>
          <div className="n">03</div>
          <strong>Fair rate</strong>
          <span>A band, never a fake exact %. Start here →</span>
        </button>
        <button type="button" onClick={onStart}>
          <div className="n">04</div>
          <strong>EMI ceiling</strong>
          <span>Plus one bad-month test. Start here →</span>
        </button>
      </section>

      <p className="eyebrow">Try the three borrowers</p>
      <div className="stories">
        {PERSONAS.map((p) => (
          <article className="story" key={p.id}>
            <div className={`avatar ${p.id}`}>{p.name[0]}</div>
            <div>
              <h3>{p.name}</h3>
              <p>{p.city}</p>
              <p>{p.line}</p>
              <p className="ask">
                <b>{p.ask}</b>
              </p>
            </div>
            <button className="btn primary" onClick={() => onPersona(p.id)}>
              Open {p.name}
            </button>
          </article>
        ))}
      </div>

      <p className="privacy">
        No account. No bureau pull. Nothing leaves this browser. Nine must questions print a wide
        answer. A short extra list follows — skip it if you want, and the band stays wide.
      </p>
    </main>
  );
}
