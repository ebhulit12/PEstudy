/* Basic Engineering Practice — additional study-note sections. */
(window.NOTES.bep = window.NOTES.bep || []).push(
  {
    title: 'Comparing alternatives: PW, AW, IRR, B/C & replacement',
    html: R`
<ul>
<li><b>Present worth (PW):</b> discount everything to time 0 at the MARR. Use a common study period (LCM of lives, or a planning horizon with salvage estimates).</li>
<li><b>Annual worth / EUAC:</b> \(\text{EUAC} = C(A/P) - S(A/F) + \text{O\&M}\). It handles unequal lives directly (repeatability assumption) and is the usual exam shortcut.</li>
<li><b>Capitalized cost</b> (infinite life): \(CC = C + A/i\) (+ periodic replacements converted to an annual amount, then divided by i).</li>
<li><b>Rate of return:</b> IRR solves PW = 0. For mutually exclusive choices, do an <i>incremental</i> analysis on (higher-cost − lower-cost): choose the higher-cost option if ΔIRR ≥ MARR.</li>
<li><b>Benefit–cost ratio:</b> B/C = PW(benefits)/PW(costs) ≥ 1 is acceptable; compare incrementally.</li>
<li><b>Gradients:</b> arithmetic \(P = G(P/G)\), where the gradient starts at 0 in year 1. Geometric (growth g ≠ i): \(P = A_1\dfrac{1 - (1+g)^n(1+i)^{-n}}{i - g}\).</li>
<li><b>Replacement:</b> evaluate the defender with its <i>current market value</i> as first cost (sunk cost and book value are irrelevant), then compare remaining-life EUAC vs. the challenger’s EUAC.</li>
<li><b>Inflation:</b> real rate \(i' = \dfrac{1 + i}{1 + f} - 1\). Use market rates with inflated (actual) dollars, or real rates with constant dollars, but never mix them.</li>
</ul>`
  },
  {
    title: 'Worked example: two pumps with unequal lives',
    html: R`
<p><b>Problem.</b> Pump A: $12,000, O&amp;M $2,400/yr, salvage $1,000, 5-yr life. Pump B: $20,000, O&amp;M $1,500/yr, salvage $3,000, 10-yr life. MARR 8%. Which is cheaper?</p>
<ol class="steps">
<li><b>Factors at 8%:</b> (A/P,8%,5) = 0.2505, (A/F,8%,5) = 0.1705; (A/P,8%,10) = 0.1490, (A/F,8%,10) = 0.0690.</li>
<li><b>EUAC<sub>A</sub></b> = 12,000(0.2505) − 1,000(0.1705) + 2,400 = 3,006 − 171 + 2,400 = <b>$5,235/yr</b>.</li>
<li><b>EUAC<sub>B</sub></b> = 20,000(0.1490) − 3,000(0.0690) + 1,500 = 2,980 − 207 + 1,500 = <b>$4,274/yr</b>.</li>
<li><b>Decision:</b> Pump B saves ≈ $962/yr, despite its higher first cost.</li>
<li><b>Present-worth check</b> over the 10-year LCM: PW = EUAC × (P/A,8%,10) = EUAC × 6.710, giving A: $35,130 vs. B: $28,680. Same decision.</li>
</ol>
<div class="callout">Speed tip: compute factors directly on the calculator, e.g., (A/P) = i/(1 − (1+i)<sup>−n</sup>). That’s often faster than looking them up in the handbook tables.</div>`
  }
);
