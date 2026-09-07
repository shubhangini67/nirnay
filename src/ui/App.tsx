import { useEffect, useMemo, useState } from "react";
import { assess, defaultKnobs } from "../domain/assess";
import { PERSONAS } from "../domain/personas";
import type { Answers, Knobs } from "../domain/types";
import { Brief } from "./Brief";
import { Home } from "./Home";
import { Interview } from "./Interview";
import { NegotiationCard } from "./NegotiationCard";
import { Offer } from "./Offer";
import { RulesPage } from "./RulesPage";
import { Workshop } from "./Workshop";

export type Route = "home" | "ask" | "brief" | "card" | "offer" | "workshop" | "rules";

function parseHash(): Route {
  const h = location.hash.replace("#/", "").replace("#", "") || "home";
  if (["ask", "brief", "card", "offer", "workshop", "rules"].includes(h)) return h as Route;
  return "home";
}

const KEY = "nirnay-answers-v1";

function loadAnswers(): Answers {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

export function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const [knobs, setKnobs] = useState<Knobs>(defaultKnobs);

  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(answers));
  }, [answers]);

  const result = useMemo(() => assess(answers, knobs), [answers, knobs]);

  function go(r: Route) {
    location.hash = r === "home" ? "" : `/${r}`;
  }

  function loadPersona(id: string, stay = false) {
    const p = PERSONAS.find((x) => x.id === id);
    if (!p) return;
    setAnswers({ ...p.answers });
    if (!stay) go("brief");
  }

  function reset() {
    setAnswers({});
    go("ask");
  }

  return (
    <div className="shell">
      <header className="top">
        <a className="brand" href="#/" onClick={() => go("home")}>
          <span className="mark">न</span>
          <span className="wordmark">
            <b>Nirnay</b>
            <em>your number, before theirs</em>
          </span>
        </a>
        <nav className="nav">
          {(
            [
              ["home", "Home"],
              ["ask", "Questions"],
              ["brief", "Your brief"],
              ["card", "Walk-in card"],
              ["offer", "Check an offer"],
              ["workshop", "Rule workshop"],
              ["rules", "Rules"],
            ] as const
          ).map(([id, label]) => (
            <a
              key={id}
              className={route === id ? "active" : ""}
              href={id === "home" ? "#/" : `#/${id}`}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      {route === "home" && (
        <Home
          onStart={() => {
            setAnswers({});
            go("ask");
          }}
          onPersona={loadPersona}
        />
      )}
      {route === "ask" && (
        <Interview
          answers={answers}
          setAnswers={setAnswers}
          result={result}
          onDone={() => go("brief")}
          onReset={reset}
        />
      )}
      {route === "brief" && (
        <Brief
          result={result}
          onCard={() => go("card")}
          onOffer={() => go("offer")}
          onAsk={() => go("ask")}
        />
      )}
      {route === "card" && <NegotiationCard result={result} onOffer={() => go("offer")} />}
      {route === "offer" && <Offer answers={answers} result={result} knobs={knobs} />}
      {route === "workshop" && (
        <Workshop knobs={knobs} setKnobs={setKnobs} result={result} onPersona={(id) => loadPersona(id, true)} />
      )}
      {route === "rules" && <RulesPage />}

      <footer className="footer">
        Nothing is stored on a server. Numbers are a self-check, not a sanction letter. Nirnay does not pull a bureau.
      </footer>
    </div>
  );
}
