# Five-minute walkthrough

**Video:** [nirnay-mu.vercel.app/walkthrough.html](https://nirnay-mu.vercel.app/walkthrough.html)  
**Live app:** [nirnay-mu.vercel.app](https://nirnay-mu.vercel.app)

The player is a timed tour of the same screens you would click in five minutes. Pause it. Open the live app in another tab and follow along.

---

## Minute 1 — the cover

You land on a daylight cover, not a banking dashboard. One sentence: walk in with your number, not theirs. Four outputs in plain words. Three borrowers as stories. Privacy is a footer.

Click **Priya** for a finished brief. Or **Start the self-check** for the questions.

## Minute 2 — questions

Nine must questions, one at a time, large type. After that a short extra list — each extra wears a chip: *moves rate*, *moves amount*. Skip one, or skip the rest and go straight to the brief. Skip keeps the band wide. It does not invent a zero.

A salaried path never asks for ITR. A shop path never asks MNC vs government. The rail on the right starts empty, then shows live bands once the must-set is done.

## Minute 3 — the brief (Priya)

Four numbered blocks. Two amounts are visually twins so you cannot miss that they differ. Every block has a why in one or two sentences. Tenure table. One bad-month paragraph. The car EMI ending in 24 months produces a wait-vs-now note.

Ochre notes are guesses. I tell you what I do not know.

**Priya in one line:** borrow less than ₹8L. Use ~₹7.3L. Fair 10.8–12.8%. EMI ceiling ₹21,760.

Then open **Ravi**: personal-loan ask becomes a shop LAP. Unknown score is a wide band, not 300. Use ₹15L.

Then **Anita**: don’t borrow. Bounce plus 32% app paper. Household ₹0. A scooter counter may still pitch ₹70k–₹1.2L.

## Minute 4 — the card and the offer

**Walk-in card** is a stamped sheet. Print it. The sentence at the top is what you actually say at the desk.

**Check an offer:** paste 14% and 2% fee on Priya’s file. It says a bit high. Ask them to match 12.8% on the Key Facts Statement.

## Minute 5 — the workshop

Load Ravi. Drag household FOIR or LAP LTV. The brief moves. That is the whole company: lending judgement as rules a borrower can see and a machine can run.

---

## Design decisions

- **Client-only.** No login, no bureau, no database. The brief forbids stored PII. Hash routes so a static host is enough.
- **Two books.** Lender income and household income are supposed to disagree. The borrower uses the household number.
- **Unknown is never zero.** “I don’t know my score” is a wide band, not 300. Skipped savings are not an empty FD.
- **Don’t is a real answer.** Anita is the proof. A sales pitch is still shown so she is armed tomorrow.
- **Ravi is routed to LAP.** Collateral and purpose beat the product he walked in asking for.
- **A wedding should not sit on the last rupee** of the ceiling, even if the EMI “fits”.
- **Must-set of nine.** Extras only if they move a number. After the must-set you can skip the rest.
- **Rules live in one file.** `src/domain/constants.ts` feeds the UI, the workshop, the tests, and `RULES.md`. The follow-up is a slider, not a hunt through screens.
- **Vite, not Next.** No server. The engine is framework-free TypeScript so a FOIR change does not touch React.

---

## Limitations

- Rate bands are reasoned from public product pages, not a live HDFC / Bajaj / Shriram feed this week.
- ITR, GST, and cash till are what the borrower types. There is no bank-statement scrape.
- I assume an unencumbered kirana premises of ₹45L can take a LAP. A lawyer might disagree.
- Extra earn from a second stock line is counted at 35%, household book only. That is still a guess.
- APR-including-fee follows the spirit of an RBI Key Facts Statement. It is not a legal opinion.
- Home-loan tables exist so the router is honest. None of the three borrowers use them in depth.

These are written as ochre guesses on the brief, and as “what I do not know” in `RULES.md`.

---

## What I would build next

- Bank-statement photo → 6-month average income, still on-device.
- A Hindi copy pass. The engine does not care about language.
- A “kill the 30% app loans first” planner for Anita that sequences gold vs family vs waiting.
- City rent bands only as a *default* if someone refuses to type expenses — still labelled a guess.

---

## What I intentionally excluded

- A bureau pull, a login, or a database. They store people and slow the first run from the README.
- A chatbot. Then I cannot stand by the questions.
- Extra must-questions. Nine is enough.
- Pixel-perfect bank branding. The brief said product craft, not a clone of a lender app.
- A machine-learning model that pretends to know next week’s grid.
- Depth on home loans beyond the routing table. The three borrowers do not need it.

I would keep Anita as don’t borrow, Ravi on the shop, and unknown as unknown.
