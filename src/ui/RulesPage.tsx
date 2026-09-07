import { CATALOG } from "../domain/constants";

export function RulesPage() {
  return (
    <main className="page">
      <p className="eyebrow">Same table as RULES.md</p>
      <h1>Every number has a why.</h1>
      <p className="lede">
        If a cell says “my judgement”, it is my judgement. I will change it in the workshop if you ask.
      </p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>What</th>
              <th>Value</th>
              <th>Why</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {CATALOG.map((row) => (
              <tr key={row.id}>
                <td>
                  <b>{row.what}</b>
                </td>
                <td>{row.value}</td>
                <td>{row.why}</td>
                <td>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
