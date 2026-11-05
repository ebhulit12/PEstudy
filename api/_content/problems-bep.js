/* Basic Engineering Practice — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt;
  const P = [];
  const add = (p) => P.push(p);
  const pct = (i) => Math.round(i * 1000) / 10;
  const AP = (i, n) => (i * (1 + i) ** n) / ((1 + i) ** n - 1);
  const AF = (i, n) => i / ((1 + i) ** n - 1);
  const PA = (i, n) => ((1 + i) ** n - 1) / (i * (1 + i) ** n);

  /* ------------------------------ Economic analysis ------------------------------ */
  add({
    id: 'bep-future-worth', topic: 'bep', sub: 'Economic analysis', title: 'Future value of a single deposit', diff: 1,
    gen(r) {
      const Pv = r.pick([5000, 10000, 25000, 50000]), i = r.pick([0.04, 0.05, 0.06, 0.08]), n = r.pick([5, 10, 15, 20]);
      const F = Pv * (1 + i) ** n;
      return {
        prompt: `A firm sets aside <b>$${f(Pv, 6)}</b> today for a future equipment overhaul. At <b>${pct(i)}%</b> interest compounded annually, how much will be available in <b>${n} years</b>?`,
        answer: F, unit: '$',
        steps: [
          { t: 'Single-payment compound amount factor:', m: R`(F/P, i, n) = (1 + i)^n = (${(1 + i).toFixed(2)})^{${n}} = ${fm((1 + i) ** n, 4)}` },
          { t: 'Future value:', m: R`F = P(F/P) = ${fm(Pv, 6)}(${fm((1 + i) ** n, 4)}) = \$${fm(F, 4)}` }
        ],
        distract: [Pv * (1 + i * n), Pv / (1 + i) ** n, Pv * (1 + i) ** (n - 1)]
      };
    }
  });

  add({
    id: 'bep-sinking-fund', topic: 'bep', sub: 'Economic analysis', title: 'Annual deposit to reach a future amount', diff: 1,
    gen(r) {
      const F = r.pick([50000, 100000, 250000]), i = r.pick([0.04, 0.05, 0.06, 0.07]), n = r.pick([5, 8, 10, 15]);
      const A = F * AF(i, n);
      return {
        prompt: `A plant needs <b>$${f(F, 6)}</b> in <b>${n} years</b> to replace a press. What equal end-of-year deposit into an account earning <b>${pct(i)}%</b> is required?`,
        answer: A, unit: '$/yr',
        steps: [
          { t: 'Sinking fund factor:', m: R`(A/F, i, n) = \frac{i}{(1 + i)^n - 1} = \frac{${i}}{(${(1 + i).toFixed(2)})^{${n}} - 1} = ${fm(AF(i, n), 4)}` },
          { t: 'Annual deposit:', m: R`A = F(A/F) = ${fm(F, 6)}(${fm(AF(i, n), 4)}) = \$${fm(A, 4)}/\text{yr}` }
        ],
        distract: [F / n, F * AP(i, n), F / ((1 + i) ** n) / n]
      };
    }
  });

  add({
    id: 'bep-effective-rate', topic: 'bep', sub: 'Economic analysis', title: 'Effective annual interest rate', diff: 2,
    gen(r) {
      const rr = r.pick([0.06, 0.08, 0.1, 0.12, 0.18]), m = r.pick([{ k: 4, n: 'quarterly' }, { k: 12, n: 'monthly' }, { k: 365, n: 'daily' }]);
      const ie = (1 + rr / m.k) ** m.k - 1;
      return {
        prompt: `A loan has a nominal annual interest rate of <b>${pct(rr)}%</b> compounded <b>${m.n}</b>. What is the effective annual interest rate?`,
        answer: ie * 100, unit: '%',
        steps: [
          { t: `Interest per compounding period (m = ${m.k} periods per year):`, m: R`i_{period} = \frac{r}{m} = \frac{${rr}}{${m.k}} = ${fm(rr / m.k, 4)}` },
          { t: 'Compound over one year:', m: R`i_{eff} = \left(1 + \frac{r}{m}\right)^m - 1 = (1 + ${fm(rr / m.k, 4)})^{${m.k}} - 1 = ${fm(ie, 4)} = ${fm(ie * 100, 4)}\%` },
          { t: `Continuous compounding would give e<sup>r</sup> − 1 = ${f((Math.exp(rr) - 1) * 100, 4)}%, the upper limit.` }
        ],
        distract: [rr * 100, (Math.exp(rr) - 1) * 100 + 0.3, (rr / m.k) * 100]
      };
    }
  });

  add({
    id: 'bep-payback', topic: 'bep', sub: 'Economic analysis', title: 'Simple payback period', diff: 1,
    gen(r) {
      const C = r.pick([24000, 36000, 50000, 80000]), S = r.pick([6000, 8000, 10000, 15000]), om = r.pick([0, 1000, 2000]);
      const pb = C / (S - om);
      return {
        prompt: `A variable-frequency drive costs <b>$${f(C, 6)}</b> installed. It saves <b>$${f(S, 6)}</b> per year in energy${om ? ` but adds <b>$${f(om, 6)}</b> per year in maintenance` : ''}. What is the simple payback period?`,
        answer: pb, unit: 'years',
        steps: [
          { t: 'Net annual cash flow:', m: R`\text{net savings} = ${S}${om ? ' - ' + om : ''} = \$${fm(S - om, 4)}/\text{yr}` },
          { t: 'Simple payback ignores the time value of money:', m: R`\text{payback} = \frac{\text{first cost}}{\text{net annual savings}} = \frac{${C}}{${S - om}} = ${fm(pb, 3)}\ \text{years}` },
          { t: 'Discounted payback (using an interest rate) is always longer. Payback ignores cash flows after the payback point, so use present worth or annual worth to choose among alternatives.' }
        ],
        distract: [C / S, (S - om) / C, C / (S + om)]
      };
    }
  });

  add({
    id: 'bep-unequal-lives', topic: 'bep', sub: 'Economic analysis', title: 'Comparing machines with unequal lives (EUAC)', diff: 3, video: true,
    gen(r) {
      const i = r.pick([0.06, 0.08, 0.1]);
      const A = { C: r.pick([20000, 25000, 30000]), om: r.pick([5000, 6000, 7000]), S: r.pick([2000, 3000]), n: r.pick([4, 5]) };
      const B = { C: r.pick([40000, 45000, 55000]), om: r.pick([2500, 3000, 3500]), S: r.pick([5000, 8000]), n: r.pick([8, 10]) };
      const eu = (m) => m.C * AP(i, m.n) - m.S * AF(i, m.n) + m.om;
      const ea = eu(A), eb = eu(B), diff = Math.abs(ea - eb), better = ea < eb ? 'A' : 'B';
      return {
        prompt: `Two compressors are being compared at <b>${pct(i)}%</b> interest.<br>Machine A: cost <b>$${f(A.C, 6)}</b>, O&amp;M <b>$${f(A.om, 6)}/yr</b>, salvage <b>$${f(A.S, 6)}</b> after <b>${A.n} yr</b>.<br>Machine B: cost <b>$${f(B.C, 6)}</b>, O&amp;M <b>$${f(B.om, 6)}/yr</b>, salvage <b>$${f(B.S, 6)}</b> after <b>${B.n} yr</b>.<br>Assuming repeatability, by how much per year is the cheaper machine's equivalent uniform annual cost lower?`,
        answer: diff, unit: '$/yr',
        steps: [
          { t: 'Lives differ, so compare equivalent uniform annual cost (EUAC). Each life cycle repeats, so one cycle’s EUAC applies forever.', m: R`\text{EUAC} = C(A/P, i, n) - S(A/F, i, n) + \text{O\&M}` },
          { t: 'Machine A:', m: R`\text{EUAC}_A = ${A.C}(${fm(AP(i, A.n), 4)}) - ${A.S}(${fm(AF(i, A.n), 4)}) + ${A.om} = \$${fm(ea, 4)}` },
          { t: 'Machine B:', m: R`\text{EUAC}_B = ${B.C}(${fm(AP(i, B.n), 4)}) - ${B.S}(${fm(AF(i, B.n), 4)}) + ${B.om} = \$${fm(eb, 4)}` },
          { t: `Machine ${better} is cheaper by:`, m: R`|\text{EUAC}_A - \text{EUAC}_B| = \$${fm(diff, 4)}/\text{yr}` }
        ],
        distract: [Math.abs(A.C / A.n + A.om - (B.C / B.n + B.om)), Math.abs(A.C * AP(i, A.n) + A.om - (B.C * AP(i, B.n) + B.om)), Math.abs(ea - eb) * 2]
      };
    }
  });

  add({
    id: 'bep-gradient', topic: 'bep', sub: 'Economic analysis', title: 'Present worth of rising maintenance costs', diff: 3, video: true,
    gen(r) {
      const A1 = r.pick([1000, 2000, 3000]), G = r.pick([200, 300, 500]), i = r.pick([0.06, 0.08, 0.1]), n = r.pick([5, 8, 10]);
      const PG = ((1 + i) ** n - i * n - 1) / (i * i * (1 + i) ** n), Pw = A1 * PA(i, n) + G * PG;
      return {
        prompt: `Maintenance on a machine costs <b>$${f(A1, 6)}</b> at the end of year 1 and increases by <b>$${G}</b> each year after that. At <b>${pct(i)}%</b> interest, what is the present worth of the maintenance costs over <b>${n} years</b>?`,
        answer: Pw, unit: '$',
        steps: [
          { t: 'Split the cash flow into a uniform series A₁ plus an arithmetic gradient G. The gradient starts at zero in year 1 and reaches (n − 1)G in year n.', m: R`P = A_1(P/A, i, n) + G(P/G, i, n)` },
          { t: 'Uniform series part:', m: R`(P/A, i, n) = ${fm(PA(i, n), 4)} \;\Rightarrow\; ${A1}(${fm(PA(i, n), 4)}) = \$${fm(A1 * PA(i, n), 4)}` },
          { t: 'Gradient factor:', m: R`(P/G, i, n) = \frac{(1 + i)^n - in - 1}{i^2(1 + i)^n} = ${fm(PG, 4)} \;\Rightarrow\; ${G}(${fm(PG, 4)}) = \$${fm(G * PG, 4)}` },
          { t: 'Total present worth:', m: R`P = \$${fm(Pw, 4)}` }
        ],
        distract: [A1 * PA(i, n), (A1 + G * (n - 1) / 2) * n, A1 * PA(i, n) + G * PA(i, n) * n / 2]
      };
    }
  });

  add({
    id: 'bep-breakeven', topic: 'bep', sub: 'Economic analysis', title: 'Break-even production volume', diff: 1,
    gen(r) {
      const FC = r.pick([50000, 120000, 200000, 300000]), price = r.pick([25, 40, 60, 85]), vc = Math.round(price * r.pick([0.4, 0.5, 0.6]));
      const Q = FC / (price - vc);
      return {
        prompt: `Tooling for a new bracket has fixed costs of <b>$${f(FC, 6)}</b> per year. Each bracket sells for <b>$${price}</b> and has a variable cost of <b>$${vc}</b>. How many brackets per year must be sold to break even?`,
        answer: Q, unit: 'units/yr',
        steps: [
          { t: 'At break-even, revenue equals total cost:', m: R`pQ = FC + vQ \;\Rightarrow\; Q_{BE} = \frac{FC}{p - v}` },
          { t: 'Evaluate. Each unit contributes p − v toward fixed costs.', m: R`Q_{BE} = \frac{${FC}}{${price} - ${vc}} = ${fm(Q, 4)}\ \text{units/yr}` }
        ],
        distract: [FC / price, FC / vc, FC / (price + vc)]
      };
    }
  });

  add({
    id: 'bep-depreciation', topic: 'bep', sub: 'Economic analysis', title: 'Straight-line depreciation and book value', diff: 1,
    gen(r) {
      const C = r.pick([60000, 85000, 120000]), S = r.pick([5000, 10000, 15000]), n = r.pick([5, 7, 10]), j = r.int(2, n - 1);
      const D = (C - S) / n, BV = C - j * D;
      return {
        prompt: `A machine tool costs <b>$${f(C, 6)}</b>, has a salvage value of <b>$${f(S, 6)}</b>, and a depreciable life of <b>${n} years</b>. Using straight-line depreciation, what is its book value at the end of year <b>${j}</b>?`,
        answer: BV, unit: '$',
        steps: [
          { t: 'Annual straight-line depreciation:', m: R`D = \frac{C - S}{n} = \frac{${C} - ${S}}{${n}} = \$${fm(D, 4)}/\text{yr}` },
          { t: 'Book value after j years:', m: R`BV_j = C - jD = ${C} - ${j}(${fm(D, 4)}) = \$${fm(BV, 4)}` }
        ],
        distract: [C - (j * C) / n, C - (j + 1) * D, S + j * D]
      };
    }
  });

  add({
    id: 'bep-capitalized', topic: 'bep', sub: 'Economic analysis', title: 'Capitalized cost of a permanent facility', diff: 2,
    gen(r) {
      const C = r.pick([200000, 500000, 1000000]), A = r.pick([10000, 20000, 40000]), i = r.pick([0.05, 0.06, 0.08]);
      const CC = C + A / i;
      return {
        prompt: `A permanent cooling-water intake costs <b>$${f(C, 7)}</b> to build and <b>$${f(A, 6)}</b> per year to maintain forever. At <b>${pct(i)}%</b> interest, what is its capitalized cost?`,
        answer: CC, unit: '$',
        steps: [
          { t: 'The present worth of a perpetual annual cost is A/i (the limit of P/A as n → ∞):', m: R`P_{maint} = \frac{A}{i} = \frac{${A}}{${i}} = \$${fm(A / i, 4)}` },
          { t: 'Capitalized cost = first cost + present worth of the perpetual costs:', m: R`CC = ${fm(C, 7)} + ${fm(A / i, 4)} = \$${fm(CC, 4)}` }
        ],
        distract: [C + A * i * 100, A / i, C + A * PA(i, 30)]
      };
    }
  });

  /* ---------------------------------- Units ---------------------------------- */
  const CONV = [
    { from: 'MPa', to: 'ksi', k: 1 / 6.894757, vals: [200, 250, 350, 500, 690], what: 'a yield strength of', note: '1 ksi = 6.895 MPa', tf: R`\text{MPa}`, tt: R`\text{ksi}` },
    { from: 'N·m', to: 'lbf·ft', k: 0.737562, vals: [50, 120, 300, 750], what: 'a bolt torque of', note: '1 N·m = 0.7376 lbf·ft', tf: R`\text{N}\cdot\text{m}`, tt: R`\text{lbf}\cdot\text{ft}` },
    { from: 'kW', to: 'hp', k: 1 / 0.745700, vals: [7.5, 15, 37, 75, 110], what: 'a motor rating of', note: '1 hp = 0.7457 kW', tf: R`\text{kW}`, tt: R`\text{hp}` },
    { from: 'kg/m³', to: 'lbm/ft³', k: 0.0624280, vals: [1000, 2700, 7850, 8900], what: 'a density of', note: '1 lbm/ft³ = 16.018 kg/m³', tf: R`\text{kg/m}^3`, tt: R`\text{lbm/ft}^3` },
    { from: 'GPa', to: 'Mpsi (10⁶ psi)', unit: 'Mpsi', k: 1 / 6.894757, vals: [70, 110, 200, 207], what: 'an elastic modulus of', note: '1 Mpsi = 6.895 GPa', tf: R`\text{GPa}`, tt: R`\text{Mpsi}` },
    { from: 'L/min', to: 'gpm', k: 1 / 3.785412, vals: [20, 40, 75, 150], what: 'a pump flow of', note: '1 gal = 3.785 L', tf: R`\text{L/min}`, tt: R`\text{gpm}` }
  ];
  add({
    id: 'bep-convert', topic: 'bep', sub: 'Units & conversions', title: 'SI to US customary conversion', diff: 1,
    gen(r) {
      const c = r.pick(CONV), v = r.pick(c.vals), ans = v * c.k;
      return {
        prompt: `A European supplier's data sheet lists ${c.what} <b>${v} ${c.from}</b>. What is this in <b>${c.to}</b>?`,
        answer: ans, unit: c.unit || c.to,
        steps: [
          { t: `Conversion factor: ${c.note}.`, m: R`${v}\ ${c.tf} \times ${fm(c.k, 5)} = ${fm(ans, 4)}\ ${c.tt}` },
          { t: 'Write the factor as a fraction equal to 1 and check that the units cancel. Multiplying when you should divide is the classic slip.' }
        ],
        distract: [v / c.k, v * c.k * 10, v * c.k * 0.5]
      };
    }
  });

  /* ------------------------------ Project management ------------------------------ */
  add({
    id: 'bep-float', topic: 'bep', sub: 'Project management', title: 'Total float of a non-critical activity', diff: 2,
    gen(r) {
      const A = r.int(2, 5), C = r.int(3, 6), D = r.int(4, 8), E = r.int(1, 4);
      const B = r.int(2, C + D - 1); // keep A–B–E shorter than A–C–D–E
      const crit = A + C + D + E, viaB = A + B + E, fl = crit - viaB;
      return {
        prompt: `A project network (durations in weeks): A = ${A} (start); B = ${B} and C = ${C} both follow A; D = ${D} follows C; E = ${E} follows both B and D. What is the total float of activity <b>B</b>?`,
        answer: fl, unit: 'weeks', tol: 0.001,
        steps: [
          { t: 'Path durations:', m: R`\text{A–B–E} = ${A}+${B}+${E} = ${viaB} \qquad \text{A–C–D–E} = ${A}+${C}+${D}+${E} = ${crit}` },
          { t: 'The critical path is A–C–D–E. Forward pass: B can start at week ' + A + ' (ES) and finish by ' + (A + B) + ' (EF). Backward pass: E must start by ' + (crit - E) + ', so B’s late finish is ' + (crit - E) + '.', m: R`\text{TF}_B = LF - EF = ${crit - E} - ${A + B} = ${fl}\ \text{weeks}` },
          { t: 'B can slip by that much without delaying the project.' }
        ],
        distract: [crit - B, 0, fl + E]
      };
    }
  });

  add({
    id: 'bep-earned-value', topic: 'bep', sub: 'Project management', title: 'Estimate at completion from earned value', diff: 2,
    gen(r) {
      const BAC = r.pick([200000, 400000, 750000]), done = r.pick([0.3, 0.4, 0.5, 0.6]), over = r.pick([1.1, 1.15, 1.2, 0.95]);
      const EV = done * BAC, AC = Math.round((EV * over) / 1000) * 1000, CPI = EV / AC, EAC = BAC / CPI;
      return {
        prompt: `A machine-design project has a budget at completion of <b>$${f(BAC, 7)}</b>. It is <b>${Math.round(done * 100)}%</b> complete, and the actual cost to date is <b>$${f(AC, 7)}</b>. If the current cost performance continues, what is the estimate at completion (EAC)?`,
        answer: EAC, unit: '$',
        steps: [
          { t: 'Earned value is the budgeted cost of the work actually done:', m: R`EV = ${done}(${fm(BAC, 7)}) = \$${fm(EV, 4)}` },
          { t: 'Cost performance index:', m: R`CPI = \frac{EV}{AC} = \frac{${fm(EV, 4)}}{${fm(AC, 4)}} = ${fm(CPI, 4)}\ (${CPI < 1 ? 'over budget' : 'under budget'})` },
          { t: 'Estimate at completion assuming the same efficiency:', m: R`EAC = \frac{BAC}{CPI} = \frac{${fm(BAC, 7)}}{${fm(CPI, 4)}} = \$${fm(EAC, 4)}` }
        ],
        distract: [BAC * CPI, AC + (BAC - EV), BAC + (AC - EV) * 2]
      };
    }
  });

  add({
    id: 'bep-pert', topic: 'bep', sub: 'Project management', title: 'PERT expected duration of a path', diff: 2,
    gen(r) {
      const acts = [0, 1, 2].map(() => { const m = r.int(3, 8); return { a: m - r.int(1, 2), m, b: m + r.int(2, 6) }; });
      const te = acts.map((x) => (x.a + 4 * x.m + x.b) / 6), T = te.reduce((s, x) => s + x, 0);
      const sd = Math.sqrt(acts.reduce((s, x) => s + ((x.b - x.a) / 6) ** 2, 0));
      return {
        prompt: `The critical path of a test-rig build has three activities with (optimistic, most likely, pessimistic) durations in days of <b>(${acts.map((x) => `${x.a}, ${x.m}, ${x.b}`).join(')</b>, <b>(')})</b>. What is the PERT expected duration of the path?`,
        answer: T, unit: 'days',
        steps: [
          { t: 'PERT (beta-distribution) expected time for each activity:', m: R`t_e = \frac{a + 4m + b}{6} \;\Rightarrow\; ${te.map((x) => fm(x, 4)).join(',\ ')}\ \text{days}` },
          { t: 'Path expected duration is the sum:', m: R`T_e = ${te.map((x) => fm(x, 4)).join(' + ')} = ${fm(T, 4)}\ \text{days}` },
          { t: `Path standard deviation √Σ((b − a)/6)² = ${f(sd, 3)} days, used to estimate the probability of finishing by a deadline (z = (T − T<sub>e</sub>)/σ).` }
        ],
        distract: [acts.reduce((s, x) => s + x.m, 0), acts.reduce((s, x) => s + (x.a + x.m + x.b) / 3, 0), acts.reduce((s, x) => s + x.b, 0)]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
