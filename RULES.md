# RULES.md

Every number the screens show is named in `src/domain/constants.ts`. This file is the human copy: **what · value · why · source**.

I am not a credit officer and I did not pull a live bank grid this week. Where I am guessing, the last column says so.

## Order of steps

1. **Two incomes.** Payslip, ITR and till cash are three different rupees. The lender book and the household book are supposed to disagree.
2. **Product.** Collateral and purpose can beat what they walked in asking for. A kirana personal-loan ask becomes a shop-secured LAP.
3. **Rate as a band.** Unknown score is a wide band. It is never 300.
4. **Two amounts.** What a lender may sanction (FOIR on documents, LTV, multiples). What the house can carry (tighter FOIR, leftover cash after spend, buffers). The borrower should **use the household number**.
5. **Verdict.** Don't borrow is a real answer.
6. **EMI ceiling and one stress case.** Income −25% or rate +250 bps, whichever is worse for FOIR.
7. **Silence widens.** I do not invent a tight number from a blank. Skipped savings are not an empty FD.

## Thresholds

| What | Value | Why | Source |
|---|---|---|---|
| Lender FOIR — prime personal | 48% | Private-bank unsecured grids for 750+ salaried files often sit near half of net. I sit one notch under 50% folklore so I do not flit a sanction the branch will not print. | My judgement. No statute publishes FOIR |
| Household FOIR — prime personal | 36% | The extra 12 points on the sanction letter is how Bengaluru rent + a car EMI becomes 65% of pay. | My judgement |
| Lender FOIR — ordinary personal | 42% | Default unsecured grid when the file is ordinary. | My judgement |
| Lender FOIR — thin / informal unsecured | 35% | Thin files get less FOIR, not more. | My judgement |
| Household FOIR — informal | 28% | A rider's week can vanish. A 36% FOIR that an MNC salary can service will bounce on a rain week. | My judgement |
| FOIR — LAP | 50% lender / 40% household | The shop is a second way out, so the grid loosens. The kitchen still has to pay if custom is slow. | My judgement, typical NBFC LAP |
| FOIR — home | 50% / 40% | Home grids are looser because the asset is the house they live in. Unused by the three personas. | My judgement. RBI caps LTV, not FOIR ([5]) |
| FOIR — two-wheeler | 45% lender / 32% household (28% if informal) | Short tenor, small ticket. Informal still uses the 28% household cap. | My judgement |
| FOIR — gold | 50% / 35% | Metal is liquid. FOIR is secondary to LTV. | My judgement |
| FOIR — unsecured business | 45% / 35% | Between personal and LAP. | My judgement |
| Residual buffer | ₹8,000 floor, or 12% of household income, plus ₹2,500 per dependent and ₹4,000 per unemployed adult | FOIR alone pretends expenses do not exist. Rupee floors beat pure percentages on thin files. | My judgement |
| Metro friction | +4% of income, only if expenses were missing | Bengaluru rent is not Mysuru rent. The must-set already asks expenses, so this is a backstop, not a double-count. | My judgement |
| Variable pay counted | 50% of the variable slice. Unanswered = 0 extra, band widened | Bonus is real until the year it is not. I will not invent a 10% variable mix on a clean CTC. | My judgement |
| Spouse income, lender | 65%, or 100% if they will co-apply | Most grids haircut the second income unless it is formally added. | My judgement |
| Spouse income, household | 90% | The house can plan on more than a banker will. | My judgement |
| Self-employed lender income | ITR ÷ 12. Cash till is ignored on the lender book | A branch underwrites the return, not the drawer. | My judgement |
| Self-employed, no ITR | Lender counts 50% of typical cash | Undocumented cash is not bankable rupee-for-rupee. | My judgement |
| Informal lender income | 40% of a typical month | Platform payouts plus cash tailoring rarely survive a spreadsheet at face value. | My judgement |
| Household cash | The slow month, not the midpoint | EMI does not wait for a fat week. | My judgement |
| GST-registered shop | +8% on lender-recognised income | A GST file is easier to underwrite than a pure cash kirana. A small lift, not a rewrite of the ITR. | My judgement |
| Extra monthly earn from the loan | 35% counted, household book only | Everyone over-forecasts the second stock line. Optimism must not raise the lender book. | My judgement |
| Wedding / consumption haircut | 15% off household EMI room | A wedding does not earn. | My judgement |
| Consumption principal cap | 8× monthly take-home | Beyond eight months of pay you are financing a party with years of interest. | My judgement |
| Wedding "borrow less" | Ask sits above 88% of household high | A wedding should not sit on the last rupee of the ceiling even if the EMI "fits". | My judgement |
| Emergency savings &lt; 3 months | Household EMI × 0.70, **unsecured products only** | The first shock becomes a second loan. A pledged shop or gold is already an airbag, so I do not haircut LAP/gold the same way. | My judgement |
| Emergency savings unanswered | Do not haircut the midpoint. Widen the low end | Silence is not an empty FD. Unknown is never zero. | My judgement |
| Upcoming large bill | 10% of the bill, spread over 12 months, comes out of EMI room | Next year's school fees are not free just because they are not an EMI yet. | My judgement |
| Bounce in last 12 months | +2.5pp rate; lender ticket ×0.45–0.7; new EMI capped at 8% of household income | The file is already talking. | My judgement |
| Bounce unanswered | +0.75pp on the **top** of the band only | Assuming a clean file would narrow a verdict we have no basis to narrow. Assuming a bounce would invent a stain. | My judgement |
| Don't-borrow fire | Bounce **and** existing rate ≥ 24%; **or** existing EMIs already fill lender FOIR; **or** leftover cash is negative / under 8% of income on an informal file | App / payday paper is the fire. A new scooter is more fuel. | My judgement |
| Card utilisation ≥ 75% | +0.75pp on the high end only | High utilisation is a surcharge. I do not move the low end — a good score can still print a decent offer. | My judgement |
| MNC / government | −0.50pp | These files are priced better. Personal-loan floor still 10.75%. | My judgement |
| Job tenure &lt; 1 year | +1.25pp, and income multiple cut | Flight risk. | My judgement |
| Job ≥ 5 years or business ≥ 10 years | −0.25pp | Stability notch, not a new product. | My judgement |
| Business &lt; 3 years | +1.25pp | Vintage is the self-employed bureau. | My judgement |
| Personal-loan headline floor | 10.75% | MNC notches must not push unsecured PL into home-loan territory. | My judgement |
| Processing fee + GST | Personal 1.5%, home 0.5%, LAP 1%, gold 1%, two-wheeler 2%, business 2% — then × 1.18 | All-in cost. A 12% sticker with a fee is not 12%. APR is the IRR on net disbursal, in the spirit of the KFS. | Fee %: my judgement. GST 18% on banking services: [2]. APR / KFS: [1] |
| Shop / commercial LTV | 48–58% | A kirana premises is not a Bandra flat. RBI home-loan LTV does not apply to a shop. | My judgement. Home LTV ceiling is [5] |
| Home LTV | 75–85% | Inside RBI housing-finance LTV caps (90 / 80 / 75 by ticket). Unused by the three personas. | [5] |
| Gold LTV | 65–75% | I stay at or under the 75% bank gold-loan LTV ceiling. | [3] |
| Two-wheeler ticket cap | ₹2,50,000 | An e-scooter is not a car loan. | My judgement |
| Informal 2W "don't" lender band | ₹70,000–₹1,20,000 sales pitch, ₹0 household | A prudent FOIR after app EMIs is ~₹0. A scooter counter may still try to book. Hiding that pitch leaves her unarmed. | My judgement |
| Max age at maturity | 58 unsecured / 70 secured | Typical Indian grids, a little tighter than 60 on unsecured. | Typical bank grids + my judgement |
| Max tenure | PL 60m, home 240m, LAP 180m, gold 36m, 2W 48m, business 84m | Product practice, not a wish. | My judgement |
| Default tenure for the quoted ticket | PL 48m, LAP 108m, 2W 36m, gold 24m, business 60m, home 180m | Longer tenure makes a dangerous ticket look cheap. I quote a middle tenor, then show the trade-off. | My judgement |
| Stress case | Income −25% **or** rate +250 bps, worse FOIR wins | Informal and bonus-linked pay already move. Rate resets happen. Household high stays the normal-month ceiling. | My judgement |
| Minimum ticket | ₹20,000 | Below this I print zero rather than a toy loan. | My judgement |
| Confidence mix | 55% must-set + 45% extra | The must-set has to work on its own. Extra answers earn the rest. | My judgement |
| Confidence cap if score unknown | 56% | I will not claim a tight rate without a bureau. | My judgement |
| Band widen for silence | Unknown score +35% of span; each other skip about +10% on the household amount | Fewer answers, wider band, and the app says so. | My judgement |
| Wait vs now | If a current EMI has ≥ 6 months left and the verdict is not a clean borrow | Priya's car EMI ending in 24 months is a real option. Stretching today is not the only story. | My judgement |

## Rate tables (headline %, 2026)

Not a live market feed. Anchored to advertised pages I could open ([4], [6], [7]), then widened for thin files.

**Personal loan**

| Bureau | Low | High |
|---|---|---|
| 800+ | 10.75 | 12.25 |
| 750–799 | 11.25 | 13.5 |
| 700–749 | 13.25 | 16.5 |
| 650–699 | 16.5 | 20.5 |
| &lt;650 | 20.5 | 27 |
| Unknown, salaried | 13 | 20.5 |
| Unknown, self-employed | 15.5 | 22.5 |
| Unknown, informal | 18.5 | 28 |

**LAP** — unknown file uses 10.75–14 (we price the shop, not a 300 CIBIL). Then vintage notches.

**Gold** — 9.75–14.25, metal-priced.

**Two-wheeler** — prime 11.25–14.75; informal 15.5–21; unknown 13.5–19.

**Unsecured business** — documented 13.75–18; thin 16.25–22.5.

**Home** — 8.15–11.75 by bureau. Unused by the three personas.

## Income multiples (monthly, before FOIR / LTV bind)

| File | Multiple |
|---|---|
| PL 800+ | 16–22× |
| PL 750–799 | 14–20× |
| PL 700–749 | 10–16× |
| PL unknown salaried | 8–16× |
| PL informal | 3–7× |
| Unsecured business, with ITR | 10–20× |
| LAP | 20–42×, then LTV usually binds |

MNC/govt adds +1 to +2×. Job tenure under a year subtracts.

## Product routing

| Condition | Product |
|---|---|
| Purpose is a house | Home loan |
| Gold pledged and the file is informal, bounced, or they asked for gold | Gold loan |
| Shop / house free, value ≥ 1.5× the ask (and ≥ ₹5L), business purpose or self-employed | **LAP** — this is the Ravi rule |
| Vehicle purpose, ask ≤ ₹2.5L | Two-wheeler |
| Business purpose, not enough collateral | Unsecured business |
| Else | What they walked in with, defaulting to personal |

## Verdict

| Fire | When |
|---|---|
| **Don't borrow** | Existing EMIs already at or above lender FOIR; **or** a bounce plus existing rate ≥ 24%; **or** leftover cash is gone on an informal file; **or** household high rounds to nothing |
| **Borrow less** | Ask &gt; household high; **or** a wedding/consumption ask sits above 88% of household high |
| **Borrow** | Ask fits the household number and the product is honest |

The number the borrower should **use** is always the household number. The lender number is what the branch can sell.

## Question design

Nine must questions produce all four outputs with wide bands and low confidence. Salary vs cash is one slot, not two: salaried people type take-home; shop and gig earners type a typical month.

Every extra question is wired to at least one output (`moves` on the question). If it never moves a number, it is not in the list. There is a test for that. Extras stay short (about 4–5 on a path). After the must-set, the app lets you skip the rest and still print a brief.

Adaptive paths: a salaried file sees employer, job years, savings, and months left on an EMI if there is one. A kirana owner sees vintage, ITR, shop value, spouse income, and extra earn. A rider sees dependents, savings, bounce, and the rate on existing app loans. They do not see each other's list.

## What I do not know

- **Live 2026 bank grids.** I do not have HDFC / Bajaj / Shriram rate cards as of this week. The bands are reasoned, not scraped.
- **City-level living costs as a table.** Expenses are a must question. I do not keep a CPI file for Hubballi.
- **Actual CIBIL commercial scores, GST returns, bank-statement averaging.** The app only has what the borrower says.
- **Whether a particular shop is mortgageable.** I assume an unencumbered kirana premises of ₹45L can take a LAP. A lawyer might disagree.
- **Recovery of the second stock line.** I count 35% of whatever they claim it will earn. That is still a guess.
- **RBI circulars I have not re-read this week.** APR-including-fee is in the spirit of fair-practice disclosure, not a legal opinion.

The app surfaces guesses as ochre notes on the brief. If a must-question is skipped, we do not compute. If an extra question is skipped, we widen, and we say so.

## References

Public pages I actually opened. Rate and FOIR cells that still say “my judgement” are still my judgement.

1. RBI — Key Facts Statement (KFS) for loans and advances, circular RBI/2024-25/18 dated 15 April 2024. APR must include charges levied by the lender. https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12663&Mode=0
2. CBIC — Notification No. 11/2017-Central Tax (Rate). Banking and other financial services (heading 9971) at 18% GST. That is why fee is multiplied by 1.18. https://cbic-gst.gov.in/pdf/central-tax-rate/notfctn-11-2017-cgst-rate-english.pdf
3. RBI — Lending against gold jewellery, LTV not exceeding 75%. https://www.rbi.org.in/commonman/English/scripts/Notification.aspx?Id=1323
4. HDFC Bank — Personal loan, advertised 9.99%–24% and processing fee + GST. I still floor a typical unsecured walk-in at 10.75%. https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan
5. RBI — Housing finance LTV caps for individuals: 90% up to ₹30 lakh, 80% up to ₹75 lakh, 75% above that. Master Directions – Housing Finance Companies. https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12939
6. SBI — Published loan-scheme interest rates. https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates
7. ICICI Bank — Home loan product page (advertised floating bands). https://www.icicibank.com/personal-banking/loans/home-loan
