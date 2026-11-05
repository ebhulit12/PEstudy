/* Parameterized (randomized) numeric problems with step-by-step solutions.
   gen(rng) returns:
     prompt   – HTML (KaTeX allowed)
     answer   – Number
     unit     – string
     tol      – relative tolerance (default 0.02)
     steps    – [{ t: explanation HTML, m: LaTeX (display) }]
     distract – likely wrong answers (used to build multiple-choice in exam mode)
     fig      – optional { name, data } for FIG generators */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt;
  const P = [];
  const add = (p) => P.push(p);
  const PI = Math.PI;

  /* ======================= BASIC ENGINEERING PRACTICE ======================= */
  add({
    id: 'bep-pw', topic: 'bep', sub: 'Economic analysis', title: 'Present worth of annual savings', diff: 1, video: true,
    gen(r) {
      const A = r.pick([4000, 5000, 6500, 8000, 12000]);
      const i = r.pick([0.05, 0.06, 0.08, 0.1]);
      const n = r.pick([5, 8, 10, 12, 15]);
      const fac = (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
      const ans = A * fac;
      return {
        prompt: `A machine upgrade saves <b>$${f(A, 6)}</b> per year (end of year) for <b>${n} years</b>. At an interest rate of <b>${Math.round(i * 100)}%</b> per year, what is the maximum amount that should be spent on the upgrade today?`,
        answer: ans, unit: '$',
        steps: [
          { t: 'The maximum justifiable cost equals the present worth of the uniform annual savings. Use the uniform-series present-worth factor (P/A, i, n).', m: R`(P/A,i,n) = \frac{(1+i)^n - 1}{i(1+i)^n}` },
          { t: 'Plug in the interest rate and number of years.', m: R`(P/A,${Math.round(i * 100)}\%,${n}) = \frac{(${(1 + i).toFixed(2)})^{${n}} - 1}{${i}(${(1 + i).toFixed(2)})^{${n}}} = ${fm(fac, 4)}` },
          { t: 'Multiply by the annual savings.', m: R`P = A\,(P/A) = ${fm(A, 6)} \times ${fm(fac, 4)} = \$${fm(ans, 4)}` }
        ],
        distract: [A * n, A * n / Math.pow(1 + i, n), A * (Math.pow(1 + i, n) - 1) / i]
      };
    }
  });

  add({
    id: 'bep-eac', topic: 'bep', sub: 'Economic analysis', title: 'Equivalent annual cost of a machine', diff: 2,
    gen(r) {
      const C = r.pick([40000, 55000, 75000, 90000]);
      const S = r.pick([5000, 8000, 10000]);
      const OM = r.pick([2000, 3500, 4000, 6000]);
      const i = r.pick([0.06, 0.08, 0.1, 0.12]);
      const n = r.pick([6, 8, 10]);
      const g = Math.pow(1 + i, n);
      const AP = (i * g) / (g - 1), AF = i / (g - 1);
      const ans = C * AP - S * AF + OM;
      return {
        prompt: `A CNC machine costs <b>$${f(C, 6)}</b>, has a salvage value of <b>$${f(S, 6)}</b> after <b>${n} years</b>, and annual operating &amp; maintenance cost of <b>$${f(OM, 6)}</b>. With interest at <b>${Math.round(i * 100)}%</b>, what is the equivalent uniform annual cost?`,
        answer: ans, unit: '$/yr',
        steps: [
          { t: 'Convert the first cost to an annual amount with the capital recovery factor, subtract the annualized salvage with the sinking fund factor, then add annual O&amp;M.', m: R`\text{EAC} = C(A/P) - S(A/F) + \text{O\&M}` },
          { t: 'Compute the factors.', m: R`(A/P) = \frac{i(1+i)^n}{(1+i)^n - 1} = ${fm(AP, 4)} \qquad (A/F) = \frac{i}{(1+i)^n - 1} = ${fm(AF, 4)}` },
          { t: 'Combine.', m: R`\text{EAC} = ${fm(C, 6)}(${fm(AP, 4)}) - ${fm(S, 6)}(${fm(AF, 4)}) + ${fm(OM, 6)} = \$${fm(ans, 4)}/\text{yr}` }
        ],
        distract: [C * AP + OM, (C - S) / n + OM, C * AP - S * AP + OM]
      };
    }
  });

  add({
    id: 'bep-torque', topic: 'bep', sub: 'Units & conversions', title: 'Motor torque from horsepower', diff: 1,
    gen(r) {
      const H = r.pick([5, 7.5, 10, 15, 20, 25, 40, 50]);
      const n = r.pick([870, 1150, 1750, 3450]);
      const T = (63025 * H) / n;
      return {
        prompt: `A <b>${H} hp</b> electric motor runs at <b>${n} rpm</b>. What torque (lbf·in) does it deliver at full load?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Power equals torque times angular velocity. In US units with hp and rpm, the constant is 63,025 for lbf·in.', m: R`H = \frac{T n}{63{,}025} \;\Rightarrow\; T = \frac{63{,}025\,H}{n}` },
          { t: 'Substitute.', m: R`T = \frac{63{,}025(${H})}{${n}} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [(5252 * H) / n, (33000 * H) / n, (63025 * H) / n / 12]
      };
    }
  });

  add({
    id: 'bep-cpm', topic: 'bep', sub: 'Project management', title: 'Critical path duration', diff: 1,
    gen(r) {
      const A = r.int(2, 5), B = r.int(3, 7), C = r.int(2, 6), D = r.int(4, 8), E = r.int(1, 4);
      // A -> B -> E ; A -> C -> D -> E
      const p1 = A + B + E, p2 = A + C + D + E;
      const ans = Math.max(p1, p2);
      return {
        prompt: `A project has activities (durations in weeks): A = ${A} (start), B = ${B} (after A), C = ${C} (after A), D = ${D} (after C), E = ${E} (after B and D). What is the minimum project duration?`,
        answer: ans, unit: 'weeks', tol: 0.001,
        steps: [
          { t: 'List every path from start to finish.', m: R`\text{A–B–E} = ${A}+${B}+${E} = ${p1} \qquad \text{A–C–D–E} = ${A}+${C}+${D}+${E} = ${p2}` },
          { t: 'The critical path is the longest path; it sets the minimum project duration. Activities on it have zero float.', m: R`T = \max(${p1}, ${p2}) = ${ans}\ \text{weeks}` }
        ],
        distract: [Math.min(p1, p2), A + B + C + D + E, ans + 1]
      };
    }
  });

  /* ======================= ENGINEERING SCIENCE & MECHANICS ======================= */
  add({
    id: 'esm-react', topic: 'esm', sub: 'Statics', title: 'Beam support reaction', diff: 1, video: true, fig: 'beam',
    gen(r) {
      const L = r.pick([10, 12, 16, 20]);
      const a = r.int(2, L - 2);
      const Pl = r.pick([800, 1200, 1500, 2000, 2500]);
      const w = r.pick([50, 100, 150, 200]);
      const RA = (Pl * (L - a)) / L + (w * L) / 2;
      return {
        prompt: `A simply supported beam spans <b>${L} ft</b> between pin A (left) and roller B. It carries a uniform load of <b>${w} lbf/ft</b> over the full span plus a point load of <b>${f(Pl, 5)} lbf</b> located <b>${a} ft</b> from A. Find the vertical reaction at A.`,
        answer: RA, unit: 'lbf',
        fig: { name: 'beam', data: { P: `${f(Pl, 5)} lbf`, w: `${w} lbf/ft`, a: a / L, L: `${L} ft` } },
        steps: [
          { t: 'Draw the FBD. Replace the distributed load by its resultant wL acting at midspan. Sum moments about B to eliminate R<sub>B</sub>.', m: R`\sum M_B = 0:\quad R_A L - P(L - a) - wL\cdot\frac{L}{2} = 0` },
          { t: 'Solve for R<sub>A</sub>.', m: R`R_A = \frac{P(L-a)}{L} + \frac{wL}{2} = \frac{${Pl}(${L - a})}{${L}} + \frac{${w}(${L})}{2}` },
          { t: 'Evaluate.', m: R`R_A = ${fm((Pl * (L - a)) / L, 4)} + ${fm((w * L) / 2, 4)} = ${fm(RA, 4)}\ \text{lbf}` }
        ],
        distract: [(Pl * a) / L + (w * L) / 2, (Pl * (L - a)) / L + w * L, Pl / 2 + (w * L) / 2]
      };
    }
  });

  add({
    id: 'esm-incline', topic: 'esm', sub: 'Statics', title: 'Pushing a block up an incline', diff: 1, video: true, fig: 'incline',
    gen(r) {
      const W = r.pick([100, 150, 200, 250, 400]);
      const th = r.pick([15, 20, 25, 30, 35]);
      const mu = r.pick([0.15, 0.2, 0.25, 0.3, 0.35]);
      const t = (th * PI) / 180;
      const Fp = W * (Math.sin(t) + mu * Math.cos(t));
      return {
        prompt: `A <b>${W} lbf</b> crate is pushed up a <b>${th}°</b> incline at constant speed by a force parallel to the incline. The coefficient of kinetic friction is <b>${mu}</b>. What force is required?`,
        answer: Fp, unit: 'lbf',
        fig: { name: 'incline', data: { theta: th, W: `${W} lbf` } },
        steps: [
          { t: 'Resolve the weight into components parallel and normal to the incline. The normal force is N = W cos θ.', m: R`N = W\cos\theta = ${W}\cos ${th}^\circ = ${fm(W * Math.cos(t), 4)}\ \text{lbf}` },
          { t: 'Constant speed means zero acceleration. Friction opposes motion (acts down the slope).', m: R`\sum F_\parallel = 0:\quad F = W\sin\theta + \mu N` },
          { t: 'Evaluate.', m: R`F = ${W}\sin${th}^\circ + ${mu}(${fm(W * Math.cos(t), 4)}) = ${fm(Fp, 4)}\ \text{lbf}` }
        ],
        distract: [W * (Math.sin(t) - mu * Math.cos(t)), W * (Math.cos(t) + mu * Math.sin(t)), W * Math.sin(t)]
      };
    }
  });

  add({
    id: 'esm-flywheel-rev', topic: 'esm', sub: 'Kinematics', title: 'Revolutions during uniform deceleration', diff: 1,
    gen(r) {
      const n0 = r.pick([600, 900, 1200, 1800, 3600]);
      const t = r.pick([10, 15, 20, 30, 45]);
      const rev = (n0 / 60) * t / 2;
      return {
        prompt: `A flywheel spinning at <b>${n0} rpm</b> decelerates uniformly to rest in <b>${t} s</b>. How many revolutions does it make while stopping?`,
        answer: rev, unit: 'rev',
        steps: [
          { t: 'With uniform deceleration, the average speed is half the initial speed.', m: R`\theta = \frac{\omega_0 + \omega}{2}\,t = \frac{\omega_0}{2}t` },
          { t: 'Work in rev/s to get revolutions directly.', m: R`\omega_0 = \frac{${n0}}{60} = ${fm(n0 / 60, 4)}\ \text{rev/s} \quad\Rightarrow\quad \theta = \frac{${fm(n0 / 60, 4)}}{2}(${t}) = ${fm(rev, 4)}\ \text{rev}` }
        ],
        distract: [(n0 / 60) * t, rev * 2 * PI, (n0 * t) / 2]
      };
    }
  });

  add({
    id: 'esm-disk-torque', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Torque to spin up a disk', diff: 2, video: true,
    gen(r) {
      const W = r.pick([50, 80, 120, 200, 300]);
      const D = r.pick([12, 18, 24, 30, 36]);
      const n = r.pick([600, 900, 1200, 1800]);
      const t = r.pick([2, 3, 4, 5, 8]);
      const m = W / 32.174, rr = D / 2 / 12;
      const I = 0.5 * m * rr * rr;
      const w = (2 * PI * n) / 60, al = w / t;
      const T = I * al;
      return {
        prompt: `A solid steel disk weighs <b>${W} lbf</b> and has a diameter of <b>${D} in</b>. What constant torque (ft·lbf) is required to accelerate it from rest to <b>${n} rpm</b> in <b>${t} s</b>? Neglect bearing friction.`,
        answer: T, unit: 'ft·lbf',
        steps: [
          { t: 'Convert weight to mass in slugs and radius to feet.', m: R`m = \frac{W}{g} = \frac{${W}}{32.174} = ${fm(m, 4)}\ \text{slug} \qquad r = \frac{${D}/2}{12} = ${fm(rr, 4)}\ \text{ft}` },
          { t: 'Mass moment of inertia of a solid disk about its axis:', m: R`I = \tfrac12 m r^2 = \tfrac12(${fm(m, 4)})(${fm(rr, 4)})^2 = ${fm(I, 4)}\ \text{slug}\cdot\text{ft}^2` },
          { t: 'Angular acceleration from rest:', m: R`\omega = \frac{2\pi(${n})}{60} = ${fm(w, 4)}\ \text{rad/s} \qquad \alpha = \frac{\omega}{t} = ${fm(al, 4)}\ \text{rad/s}^2` },
          { t: 'Apply Newton’s second law for rotation.', m: R`T = I\alpha = ${fm(I, 4)} \times ${fm(al, 4)} = ${fm(T, 4)}\ \text{ft}\cdot\text{lbf}` }
        ],
        distract: [T * 2, W * rr * rr * 0.5 * al, T * 32.174 / 12]
      };
    }
  });

  add({
    id: 'esm-spring-launch', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Spring launcher velocity (work–energy)', diff: 2,
    gen(r) {
      const k = r.pick([20, 40, 50, 80, 100]);
      const x = r.pick([2, 3, 4, 5, 6]);
      const W = r.pick([2, 5, 8, 10]);
      const E = 0.5 * k * x * x / 12; // ft-lbf
      const m = W / 32.174;
      const v = Math.sqrt((2 * E) / m);
      return {
        prompt: `A spring with stiffness <b>${k} lbf/in</b> is compressed <b>${x} in</b> and released, pushing a <b>${W} lbf</b> block along a frictionless horizontal surface. What is the block's speed (ft/s) when it leaves the spring?`,
        answer: v, unit: 'ft/s',
        steps: [
          { t: 'Spring potential energy converts entirely to kinetic energy. Compute the stored energy and convert in·lbf to ft·lbf.', m: R`U = \tfrac12 kx^2 = \tfrac12(${k})(${x})^2 = ${fm(0.5 * k * x * x, 4)}\ \text{in}\cdot\text{lbf} = ${fm(E, 4)}\ \text{ft}\cdot\text{lbf}` },
          { t: 'Mass in slugs:', m: R`m = ${W}/32.174 = ${fm(m, 4)}\ \text{slug}` },
          { t: 'Solve the energy balance for v.', m: R`\tfrac12 mv^2 = U \Rightarrow v = \sqrt{\frac{2(${fm(E, 4)})}{${fm(m, 4)}}} = ${fm(v, 4)}\ \text{ft/s}` }
        ],
        distract: [v * Math.sqrt(12), Math.sqrt((2 * E) / W), v / Math.sqrt(2)]
      };
    }
  });

  /* ======================= MATERIAL PROPERTIES ======================= */
  const MATS = [
    { name: 'steel', E: 30e6, a: 6.5e-6 },
    { name: 'aluminum', E: 10e6, a: 12.8e-6 },
    { name: 'brass', E: 15e6, a: 10.4e-6 }
  ];
  add({
    id: 'mat-thermal', topic: 'mat', sub: 'Physical properties', title: 'Thermal stress in a restrained bar', diff: 1, video: true,
    gen(r) {
      const m = r.pick(MATS);
      const dT = r.pick([50, 75, 100, 120, 150]);
      const L = r.pick([24, 36, 48, 60]);
      const s = m.E * m.a * dT;
      return {
        prompt: `A <b>${L} in</b> long ${m.name} bar (E = ${f(m.E / 1e6)}×10⁶ psi, α = ${f(m.a * 1e6)}×10⁻⁶ /°F) is fixed rigidly between two walls at room temperature. It is then heated uniformly by <b>${dT} °F</b>. What is the compressive stress in the bar?`,
        answer: s, unit: 'psi',
        steps: [
          { t: 'If the bar were free, it would expand by δ = αLΔT. The walls prevent this, so they push back with exactly the force needed to compress it by that amount.', m: R`\delta_T = \alpha L \Delta T \qquad \delta_P = \frac{PL}{AE}` },
          { t: 'Compatibility: δ<sub>T</sub> = δ<sub>P</sub>. The length L cancels — a common distractor is to multiply by L.', m: R`\sigma = \frac{P}{A} = E\alpha\Delta T` },
          { t: 'Evaluate.', m: R`\sigma = (${fm(m.E)})(${fm(m.a)})(${dT}) = ${fm(s, 4)}\ \text{psi (compression)}` }
        ],
        distract: [s * L, m.a * dT * L, s / 2]
      };
    }
  });

  add({
    id: 'mat-elong', topic: 'mat', sub: 'Mechanical properties', title: 'Axial elongation of a rod', diff: 1,
    gen(r) {
      const m = r.pick(MATS);
      const d = r.pick([0.5, 0.75, 1, 1.25]);
      const L = r.pick([36, 48, 72, 96]);
      const Pl = r.pick([2000, 4000, 5000, 8000]);
      const A = (PI * d * d) / 4;
      const del = (Pl * L) / (A * m.E);
      return {
        prompt: `A <b>${d} in</b> diameter ${m.name} rod (E = ${f(m.E / 1e6)}×10⁶ psi), <b>${L} in</b> long, carries an axial tensile load of <b>${f(Pl, 5)} lbf</b>. What is its elongation?`,
        answer: del, unit: 'in',
        steps: [
          { t: 'Cross-sectional area:', m: R`A = \frac{\pi d^2}{4} = \frac{\pi(${d})^2}{4} = ${fm(A, 4)}\ \text{in}^2` },
          { t: 'Elastic axial deformation:', m: R`\delta = \frac{PL}{AE} = \frac{${Pl}(${L})}{${fm(A, 4)}(${fm(m.E)})} = ${fm(del, 4)}\ \text{in}` }
        ],
        distract: [(Pl * L) / ((PI * d * d) * m.E), (Pl * L) / ((PI * d * d / 4) * m.E) * 4, del * 12]
      };
    }
  });

  add({
    id: 'mat-poisson', topic: 'mat', sub: 'Mechanical properties', title: 'Diameter change (Poisson effect)', diff: 2,
    gen(r) {
      const d = r.pick([1, 1.5, 2]);
      const Pl = r.pick([20000, 30000, 40000, 50000]);
      const nu = 0.3, E = 30e6;
      const A = (PI * d * d) / 4;
      const eps = Pl / A / E;
      const dd = nu * eps * d;
      return {
        prompt: `A <b>${d} in</b> diameter steel bar (E = 30×10⁶ psi, ν = 0.30) is loaded in axial tension by <b>${f(Pl, 5)} lbf</b>. By how much does its diameter decrease? (Give the magnitude in inches.)`,
        answer: dd, unit: 'in',
        steps: [
          { t: 'Axial stress and strain:', m: R`\sigma = \frac{P}{A} = \frac{${Pl}}{${fm(A, 4)}} = ${fm(Pl / A, 4)}\ \text{psi} \qquad \varepsilon = \frac{\sigma}{E} = ${fm(eps, 4)}` },
          { t: 'Lateral strain is −ν times the axial strain.', m: R`\varepsilon_{lat} = -\nu\varepsilon = -${fm(nu * eps, 4)}` },
          { t: 'Change in diameter:', m: R`|\Delta d| = \nu\varepsilon d = ${fm(dd, 4)}\ \text{in}` }
        ],
        distract: [eps * d, dd / nu * 0.5, dd * 2]
      };
    }
  });

  add({
    id: 'mat-true', topic: 'mat', sub: 'Mechanical properties', title: 'True stress from engineering stress', diff: 1,
    gen(r) {
      const s = r.pick([52000, 60000, 68000, 75000]);
      const e = r.pick([0.08, 0.1, 0.12, 0.15, 0.18]);
      const st = s * (1 + e);
      return {
        prompt: `During a tensile test (before necking), the engineering stress is <b>${f(s, 5)} psi</b> at an engineering strain of <b>${e}</b>. What is the true stress?`,
        answer: st, unit: 'psi',
        steps: [
          { t: 'Before necking, volume is conserved so A₀L₀ = AL. This gives:', m: R`\sigma_T = \sigma(1 + \varepsilon)` },
          { t: 'Evaluate.', m: R`\sigma_T = ${fm(s, 5)}(1 + ${e}) = ${fm(st, 4)}\ \text{psi}` }
        ],
        distract: [s * Math.log(1 + e), s / (1 + e), s * (1 - e)]
      };
    }
  });

  add({
    id: 'mat-endurance', topic: 'mat', sub: 'Mechanical properties', title: 'Corrected endurance limit (Marin)', diff: 2, video: true,
    gen(r) {
      const Sut = r.pick([68, 76, 85, 95, 110, 120]);
      const d = r.pick([0.75, 1, 1.25, 1.5, 2]);
      const Sep = 0.5 * Sut;
      const ka = 2.7 * Math.pow(Sut, -0.265);
      const kb = 0.879 * Math.pow(d, -0.107);
      const Se = ka * kb * Sep;
      return {
        prompt: `A rotating steel shaft (machined surface) of diameter <b>${d} in</b> has S<sub>ut</sub> = <b>${Sut} ksi</b>. Estimate the corrected endurance limit S<sub>e</sub> for fully reversed bending, using Marin surface and size factors only (all other factors = 1).`,
        answer: Se, unit: 'ksi', tol: 0.03,
        steps: [
          { t: 'Uncorrected endurance limit for steel with S<sub>ut</sub> ≤ 200 ksi:', m: R`S_e' = 0.5S_{ut} = 0.5(${Sut}) = ${fm(Sep, 4)}\ \text{ksi}` },
          { t: 'Surface factor for a machined surface (a = 2.70, b = −0.265, S<sub>ut</sub> in ksi):', m: R`k_a = 2.70(${Sut})^{-0.265} = ${fm(ka, 4)}` },
          { t: 'Size factor for a rotating round shaft, 0.11 ≤ d ≤ 2 in:', m: R`k_b = 0.879(${d})^{-0.107} = ${fm(kb, 4)}` },
          { t: 'Combine:', m: R`S_e = k_a k_b S_e' = (${fm(ka, 4)})(${fm(kb, 4)})(${fm(Sep, 4)}) = ${fm(Se, 4)}\ \text{ksi}` }
        ],
        distract: [Sep, ka * Sep, kb * Sep]
      };
    }
  });

  add({
    id: 'mat-hb', topic: 'mat', sub: 'Mechanical properties', title: 'Tensile strength from Brinell hardness', diff: 1,
    gen(r) {
      const HB = r.pick([149, 170, 197, 217, 248, 285, 321]);
      const Sut = 0.495 * HB;
      return {
        prompt: `A steel part has a Brinell hardness of <b>${HB} HB</b>. Estimate its ultimate tensile strength in ksi.`,
        answer: Sut, unit: 'ksi', tol: 0.04,
        steps: [
          { t: 'For steels there is a well-known empirical correlation between Brinell hardness and tensile strength.', m: R`S_{ut} \approx 0.495\,\text{HB}\ \text{ksi} \;\;(\approx 500\,\text{HB psi})` },
          { t: 'Evaluate.', m: R`S_{ut} \approx 0.495(${HB}) = ${fm(Sut, 3)}\ \text{ksi}` }
        ],
        distract: [HB / 2 * 0.6, HB * 0.3, HB]
      };
    }
  });

  /* ======================= STRENGTH OF MATERIALS ======================= */
  add({
    id: 'som-bend', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Max bending stress — center-loaded beam', diff: 1, video: true, fig: 'beam',
    gen(r) {
      const Pl = r.pick([500, 800, 1000, 1500, 2000]);
      const L = r.pick([48, 60, 72, 96]);
      const b = r.pick([1, 1.5, 2]);
      const h = r.pick([3, 4, 5, 6]);
      const M = (Pl * L) / 4, I = (b * h ** 3) / 12, c = h / 2, s = (M * c) / I;
      return {
        prompt: `A simply supported rectangular beam (<b>${b} in</b> wide × <b>${h} in</b> deep) spans <b>${L} in</b> and carries a <b>${f(Pl, 5)} lbf</b> load at midspan. Neglecting self-weight, what is the maximum bending stress?`,
        answer: s, unit: 'psi',
        fig: { name: 'beam', data: { P: `${f(Pl, 5)} lbf`, a: 0.5, L: `${L} in` } },
        steps: [
          { t: 'Maximum moment for a center point load on a simple span occurs under the load:', m: R`M_{max} = \frac{PL}{4} = \frac{${Pl}(${L})}{4} = ${fm(M, 5)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Section properties (bending about the strong axis):', m: R`I = \frac{bh^3}{12} = \frac{${b}(${h})^3}{12} = ${fm(I, 4)}\ \text{in}^4 \qquad c = h/2 = ${c}\ \text{in}` },
          { t: 'Flexure formula:', m: R`\sigma_{max} = \frac{Mc}{I} = \frac{${fm(M, 5)}(${c})}{${fm(I, 4)}} = ${fm(s, 4)}\ \text{psi}` }
        ],
        distract: [(Pl * L / 8) * c / I, (M * h) / I, (M * c) / ((h * b ** 3) / 12)]
      };
    }
  });

  add({
    id: 'som-uniform-S', topic: 'som', sub: 'Shear & moment diagrams', title: 'Required section modulus — uniform load', diff: 2,
    gen(r) {
      const w = r.pick([400, 600, 800, 1000, 1500]);
      const L = r.pick([12, 16, 20, 24]);
      const sa = r.pick([20000, 24000, 30000]);
      const M = (w * L * L) / 8 * 12; // lbf-in
      const S = M / sa;
      return {
        prompt: `A simply supported steel beam spans <b>${L} ft</b> and carries a uniform load of <b>${w} lbf/ft</b> (including self-weight). The allowable bending stress is <b>${f(sa, 5)} psi</b>. What minimum elastic section modulus S (in³) is required?`,
        answer: S, unit: 'in³',
        steps: [
          { t: 'Maximum moment at midspan for a uniform load:', m: R`M_{max} = \frac{wL^2}{8} = \frac{${w}(${L})^2}{8} = ${fm(M / 12, 5)}\ \text{ft}\cdot\text{lbf} = ${fm(M, 5)}\ \text{in}\cdot\text{lbf}` },
          { t: 'Since σ = M/S, the required section modulus is:', m: R`S_{req} = \frac{M_{max}}{\sigma_{allow}} = \frac{${fm(M, 5)}}{${fm(sa, 5)}} = ${fm(S, 4)}\ \text{in}^3` }
        ],
        distract: [S / 12, S * 2, (w * L * L) / 2 * 12 / sa]
      };
    }
  });

  add({
    id: 'som-torsion', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Torsional shear stress in a solid shaft', diff: 1, fig: 'shaft',
    gen(r) {
      const T = r.pick([2000, 3500, 5000, 8000, 12000]);
      const d = r.pick([1, 1.25, 1.5, 1.75, 2]);
      const tau = (16 * T) / (PI * d ** 3);
      return {
        prompt: `A solid circular shaft of diameter <b>${d} in</b> transmits a torque of <b>${f(T, 5)} lbf·in</b>. What is the maximum shear stress?`,
        answer: tau, unit: 'psi',
        fig: { name: 'shaft', data: { T: `${f(T, 5)} lbf·in`, d: `d = ${d} in` } },
        steps: [
          { t: 'Torsion formula for a round shaft; for a solid section J = πd⁴/32 and r = d/2, which simplifies to:', m: R`\tau_{max} = \frac{Tr}{J} = \frac{16T}{\pi d^3}` },
          { t: 'Evaluate.', m: R`\tau_{max} = \frac{16(${T})}{\pi(${d})^3} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [(32 * T) / (PI * d ** 3), (16 * T) / (PI * d ** 4), (8 * T) / (PI * d ** 3)]
      };
    }
  });

  add({
    id: 'som-combined', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'Shaft factor of safety — von Mises', diff: 2, video: true, fig: 'shaft',
    gen(r) {
      const d = r.pick([1, 1.25, 1.5, 2]);
      const M = r.pick([3000, 5000, 6000, 8000]);
      const T = r.pick([2000, 4000, 6000, 9000]);
      const Sy = r.pick([50000, 60000, 71000, 85000]);
      const s = (32 * M) / (PI * d ** 3), t = (16 * T) / (PI * d ** 3);
      const vm = Math.sqrt(s * s + 3 * t * t);
      const n = Sy / vm;
      const tr = Sy / Math.sqrt(s * s + 4 * t * t);
      return {
        prompt: `A <b>${d} in</b> solid steel shaft (S<sub>y</sub> = <b>${f(Sy / 1000)} ksi</b>) is subjected at its critical section to a bending moment of <b>${f(M, 5)} lbf·in</b> and a torque of <b>${f(T, 5)} lbf·in</b> (static). Using the distortion-energy (von Mises) theory, find the factor of safety against yielding.`,
        answer: n, unit: '', tol: 0.02,
        fig: { name: 'shaft', data: { T: 'T', M: 'M', d: `d = ${d} in` } },
        steps: [
          { t: 'Bending stress at the outer fiber:', m: R`\sigma = \frac{32M}{\pi d^3} = \frac{32(${M})}{\pi(${d})^3} = ${fm(s, 4)}\ \text{psi}` },
          { t: 'Torsional shear stress at the same point:', m: R`\tau = \frac{16T}{\pi d^3} = ${fm(t, 4)}\ \text{psi}` },
          { t: 'von Mises equivalent stress for this σ–τ state:', m: R`\sigma' = \sqrt{\sigma^2 + 3\tau^2} = \sqrt{${fm(s, 4)}^2 + 3(${fm(t, 4)})^2} = ${fm(vm, 4)}\ \text{psi}` },
          { t: 'Factor of safety. (Tresca would give n = ' + f(tr, 3) + ', more conservative.)', m: R`n = \frac{S_y}{\sigma'} = \frac{${fm(Sy, 5)}}{${fm(vm, 4)}} = ${fm(n, 3)}` }
        ],
        distract: [tr, Sy / s, Sy / (s + t)]
      };
    }
  });

  add({
    id: 'som-mohr', topic: 'som', sub: 'Stress types & transformations (Mohr)', title: 'Principal stress & max in-plane shear', diff: 2, video: true, fig: 'mohr',
    gen(r) {
      const sx = r.pick([12, 15, 20, 25, -8, 30]);
      const sy = r.pick([-10, -5, 0, 4, 6]);
      const txy = r.pick([6, 8, 10, 12]);
      const c = (sx + sy) / 2, R0 = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2);
      const s1 = c + R0;
      return {
        prompt: `At a point in a machine part, the plane-stress state is σ<sub>x</sub> = <b>${sx} ksi</b>, σ<sub>y</sub> = <b>${sy} ksi</b>, τ<sub>xy</sub> = <b>${txy} ksi</b>. What is the maximum principal stress σ₁?`,
        answer: s1, unit: 'ksi',
        fig: { name: 'mohr', data: {} },
        steps: [
          { t: 'Mohr’s circle center (average normal stress):', m: R`C = \frac{\sigma_x + \sigma_y}{2} = \frac{${sx} + (${sy})}{2} = ${fm(c, 4)}\ \text{ksi}` },
          { t: 'Radius of the circle — this is also the maximum in-plane shear stress:', m: R`R = \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2} = \sqrt{(${fm((sx - sy) / 2, 4)})^2 + ${txy}^2} = ${fm(R0, 4)}\ \text{ksi}` },
          { t: 'Principal stresses:', m: R`\sigma_1 = C + R = ${fm(s1, 4)}\ \text{ksi} \qquad \sigma_2 = C - R = ${fm(c - R0, 4)}\ \text{ksi}` }
        ],
        distract: [R0, c - R0, c + Math.sqrt((sx - sy) ** 2 + txy ** 2)]
      };
    }
  });

  add({
    id: 'som-euler', topic: 'som', sub: 'Failure modes (buckling, creep, fracture)', title: 'Euler buckling load', diff: 2, video: true, fig: 'column',
    gen(r) {
      const d = r.pick([0.75, 1, 1.25]);
      const L = r.pick([40, 48, 60, 72]);
      const end = r.pick([{ n: 'pinned at both ends', K: 1 }, { n: 'fixed at the base and free at the top', K: 2 }, { n: 'fixed at both ends (use theoretical K = 0.5)', K: 0.5 }]);
      const E = 30e6;
      const I = (PI * d ** 4) / 64;
      const Le = end.K * L;
      const Pcr = (PI * PI * E * I) / (Le * Le);
      const slender = Le / (d / 4);
      return {
        prompt: `A solid round steel column (E = 30×10⁶ psi, S<sub>y</sub> = 36 ksi) is <b>${d} in</b> in diameter and <b>${L} in</b> long, <b>${end.n}</b>. What is the critical buckling load?`,
        answer: Pcr, unit: 'lbf',
        fig: { name: 'column', data: { L: `${L} in` } },
        steps: [
          { t: `Effective length factor K = ${end.K}, so L<sub>e</sub> = KL = ${f(Le)} in.`, m: R`L_e = KL = ${end.K}(${L}) = ${fm(Le)}\ \text{in}` },
          { t: 'Check that Euler applies: slenderness ratio vs. the transition value.', m: R`r = \frac{d}{4} = ${fm(d / 4)}\ \text{in} \quad \frac{L_e}{r} = ${fm(slender, 3)} \quad \left(\frac{L_e}{r}\right)_1 = \sqrt{\frac{2\pi^2E}{S_y}} = ${fm(Math.sqrt((2 * PI * PI * E) / 36000), 3)}` },
          { t: slender > Math.sqrt((2 * PI * PI * E) / 36000) ? 'The column is long (above the transition), so the Euler formula is valid.' : 'Note: this column is intermediate — in practice you would use the Johnson formula. Here we compute the Euler value as asked.', m: R`I = \frac{\pi d^4}{64} = ${fm(I, 4)}\ \text{in}^4` },
          { t: 'Euler critical load:', m: R`P_{cr} = \frac{\pi^2 EI}{L_e^2} = \frac{\pi^2(30\times10^6)(${fm(I, 4)})}{(${fm(Le)})^2} = ${fm(Pcr, 4)}\ \text{lbf}` }
        ],
        distract: [(PI * PI * E * I) / (L * L), (PI * PI * E * ((PI * d ** 4) / 32)) / (Le * Le), Pcr * 4]
      };
    }
  });

  add({
    id: 'som-hoop', topic: 'som', sub: 'Stress types & transformations (Mohr)', title: 'Hoop stress in a thin-walled vessel', diff: 1, fig: 'vessel',
    gen(r) {
      const p = r.pick([150, 250, 300, 400, 600]);
      const D = r.pick([24, 30, 36, 48]);
      const t = r.pick([0.25, 0.375, 0.5]);
      const sh = (p * D) / (2 * t);
      return {
        prompt: `A cylindrical air receiver has an inside diameter of <b>${D} in</b> and wall thickness <b>${t} in</b>. At an internal pressure of <b>${p} psig</b>, what is the hoop (circumferential) stress? Use thin-wall theory.`,
        answer: sh, unit: 'psi',
        fig: { name: 'vessel', data: { p: `p = ${p} psi` } },
        steps: [
          { t: `Check thin-wall validity: D/t = ${f(D / t)} > 20 ✓. Cutting the cylinder lengthwise, pressure force pDL is resisted by two walls of area tL.`, m: R`\sigma_h = \frac{pD}{2t}` },
          { t: 'Evaluate. (Longitudinal stress would be half of this.)', m: R`\sigma_h = \frac{${p}(${D})}{2(${t})} = ${fm(sh, 4)}\ \text{psi}` }
        ],
        distract: [sh / 2, sh * 2, (p * D) / t / 4]
      };
    }
  });

  add({
    id: 'som-cant', topic: 'som', sub: 'Stress–strain & deflection', title: 'Cantilever tip deflection', diff: 1, fig: 'cantilever',
    gen(r) {
      const Pl = r.pick([100, 200, 300, 500]);
      const L = r.pick([20, 24, 30, 36]);
      const b = r.pick([1, 1.5, 2]);
      const h = r.pick([1, 1.5, 2, 2.5]);
      const m = r.pick(MATS.slice(0, 2));
      const I = (b * h ** 3) / 12;
      const y = (Pl * L ** 3) / (3 * m.E * I);
      return {
        prompt: `A ${m.name} cantilever (E = ${f(m.E / 1e6)}×10⁶ psi) of rectangular cross-section <b>${b} in</b> wide × <b>${h} in</b> deep and length <b>${L} in</b> carries a <b>${Pl} lbf</b> load at its free end. Find the tip deflection.`,
        answer: y, unit: 'in',
        fig: { name: 'cantilever', data: { P: `${Pl} lbf`, L: `${L} in` } },
        steps: [
          { t: 'Area moment of inertia:', m: R`I = \frac{bh^3}{12} = ${fm(I, 4)}\ \text{in}^4` },
          { t: 'Cantilever with end load (beam tables):', m: R`y_{max} = \frac{PL^3}{3EI} = \frac{${Pl}(${L})^3}{3(${fm(m.E)})(${fm(I, 4)})} = ${fm(y, 4)}\ \text{in}` }
        ],
        distract: [(Pl * L ** 3) / (48 * m.E * I), (Pl * L ** 3) / (8 * m.E * I), (Pl * L ** 3) / (3 * m.E * ((h * b ** 3) / 12))]
      };
    }
  });

  add({
    id: 'som-goodman', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'Fatigue factor of safety — Modified Goodman', diff: 2, video: true,
    gen(r) {
      const Sut = r.pick([80, 95, 110, 125]);
      const Se = +(Sut * r.pick([0.32, 0.36, 0.4])).toFixed(1);
      const smax = r.pick([30, 36, 40, 45]);
      const smin = r.pick([-10, 0, 5, 10]);
      const sa = (smax - smin) / 2, sm = (smax + smin) / 2;
      const n = 1 / (sa / Se + sm / Sut);
      return {
        prompt: `A steel link has S<sub>ut</sub> = <b>${Sut} ksi</b> and a fully corrected endurance limit S<sub>e</sub> = <b>${Se} ksi</b>. The stress at the critical location (already including K<sub>f</sub>) fluctuates between <b>${smin} ksi</b> and <b>${smax} ksi</b>. Find the fatigue factor of safety using the Modified Goodman criterion.`,
        answer: n, unit: '',
        steps: [
          { t: 'Split the cycle into alternating and mean components.', m: R`\sigma_a = \frac{\sigma_{max} - \sigma_{min}}{2} = ${fm(sa, 4)}\ \text{ksi} \qquad \sigma_m = \frac{\sigma_{max} + \sigma_{min}}{2} = ${fm(sm, 4)}\ \text{ksi}` },
          { t: 'Modified Goodman line:', m: R`\frac{1}{n} = \frac{\sigma_a}{S_e} + \frac{\sigma_m}{S_{ut}} = \frac{${fm(sa, 4)}}{${Se}} + \frac{${fm(sm, 4)}}{${Sut}} = ${fm(1 / n, 4)}` },
          { t: 'Invert.', m: R`n = ${fm(n, 3)}` }
        ],
        distract: [Se / sa, 1 / (sa / Se + sm / (Sut * 0.8)), Sut / smax]
      };
    }
  });

  /* ======================= VIBRATION ======================= */
  add({
    id: 'vib-static', topic: 'vib', sub: 'Natural frequency', title: 'Natural frequency from static deflection', diff: 1, video: true, fig: 'springMass',
    gen(r) {
      const d = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.4, 0.5]);
      const fn = Math.sqrt(386.1 / d) / (2 * PI);
      return {
        prompt: `A machine sits on spring isolators which compress <b>${d} in</b> under its weight. What is the natural frequency of vertical vibration, in Hz?`,
        answer: fn, unit: 'Hz',
        fig: { name: 'springMass', data: {} },
        steps: [
          { t: 'Because k δ<sub>st</sub> = W = mg, the ratio k/m equals g/δ<sub>st</sub>. Use g in in/s² since δ is in inches.', m: R`\omega_n = \sqrt{\frac{k}{m}} = \sqrt{\frac{g}{\delta_{st}}} = \sqrt{\frac{386.1}{${d}}} = ${fm(2 * PI * fn, 4)}\ \text{rad/s}` },
          { t: 'Convert rad/s to Hz.', m: R`f_n = \frac{\omega_n}{2\pi} = ${fm(fn, 4)}\ \text{Hz}` }
        ],
        distract: [2 * PI * fn, Math.sqrt(32.174 / d) / (2 * PI), fn * 60]
      };
    }
  });

  add({
    id: 'vib-zeta', topic: 'vib', sub: 'Damping', title: 'Damping ratio of a spring–mass–damper', diff: 2, fig: 'springMass',
    gen(r) {
      const W = r.pick([50, 100, 200, 386.1]);
      const k = r.pick([200, 500, 800, 1200]);
      const c = r.pick([2, 3, 5, 8]);
      const m = W / 386.1;
      const z = c / (2 * Math.sqrt(k * m));
      return {
        prompt: `A <b>${W} lbf</b> mass is supported by a spring of stiffness <b>${k} lbf/in</b> and a viscous damper with c = <b>${c} lbf·s/in</b>. What is the damping ratio ζ?`,
        answer: z, unit: '',
        fig: { name: 'springMass', data: { c: 'c' } },
        steps: [
          { t: 'Units are in inches, so convert weight to mass using g = 386.1 in/s².', m: R`m = \frac{${W}}{386.1} = ${fm(m, 4)}\ \text{lbf}\cdot\text{s}^2/\text{in}` },
          { t: 'Critical damping coefficient:', m: R`c_c = 2\sqrt{km} = 2\sqrt{${k}(${fm(m, 4)})} = ${fm(2 * Math.sqrt(k * m), 4)}\ \text{lbf}\cdot\text{s/in}` },
          { t: 'Damping ratio:', m: R`\zeta = \frac{c}{c_c} = ${fm(z, 3)}` }
        ],
        distract: [c / (2 * Math.sqrt(k * W)), c / Math.sqrt(k * m), c / (2 * Math.sqrt(k * (W / 32.174)))]
      };
    }
  });

  add({
    id: 'vib-tr', topic: 'vib', sub: 'Forced vibration & isolation', title: 'Transmissibility of an undamped isolator', diff: 2, video: true,
    gen(r) {
      const n = r.pick([1200, 1750, 1800, 3600]);
      const fn = r.pick([5, 6, 8, 10]);
      const ff = n / 60, rr = ff / fn;
      const TR = 1 / Math.abs(1 - rr * rr);
      return {
        prompt: `A pump running at <b>${n} rpm</b> is mounted on undamped isolators giving a natural frequency of <b>${fn} Hz</b>. What fraction of the unbalance force is transmitted to the floor (transmissibility)?`,
        answer: TR, unit: '',
        steps: [
          { t: 'Forcing frequency in Hz and the frequency ratio:', m: R`f = \frac{${n}}{60} = ${fm(ff, 4)}\ \text{Hz} \qquad r = \frac{f}{f_n} = ${fm(rr, 4)}` },
          { t: 'r > √2, so the mounts isolate. For zero damping:', m: R`TR = \frac{1}{|1 - r^2|} = \frac{1}{|1 - ${fm(rr * rr, 4)}|} = ${fm(TR, 3)}` },
          { t: `So about ${f(TR * 100, 2)}% of the force is transmitted — an isolation efficiency of ${f((1 - TR) * 100, 3)}%.` }
        ],
        distract: [1 - TR, 1 / (rr * rr), 1 / Math.abs(1 - rr)]
      };
    }
  });

  add({
    id: 'vib-logdec', topic: 'vib', sub: 'Damping', title: 'Damping ratio from logarithmic decrement', diff: 2,
    gen(r) {
      const x0 = r.pick([1, 0.8, 0.5]);
      const N = r.pick([3, 4, 5, 6]);
      const ratio = r.pick([0.3, 0.4, 0.5, 0.6]);
      const xN = +(x0 * ratio).toFixed(3);
      const d = Math.log(x0 / xN) / N;
      const z = d / Math.sqrt(4 * PI * PI + d * d);
      return {
        prompt: `In a free-vibration test, the amplitude decays from <b>${x0} in</b> to <b>${xN} in</b> over <b>${N}</b> complete cycles. Estimate the damping ratio ζ.`,
        answer: z, unit: '', tol: 0.03,
        steps: [
          { t: 'Logarithmic decrement averaged over N cycles:', m: R`\delta = \frac1N\ln\frac{x_0}{x_N} = \frac{1}{${N}}\ln\frac{${x0}}{${xN}} = ${fm(d, 4)}` },
          { t: 'Damping ratio:', m: R`\zeta = \frac{\delta}{\sqrt{4\pi^2 + \delta^2}} = ${fm(z, 3)}` }
        ],
        distract: [Math.log(x0 / xN) / (2 * PI), d, z * N]
      };
    }
  });

  /* ======================= MECHANICAL COMPONENTS ======================= */
  add({
    id: 'mc-gear-wt', topic: 'mc', sub: 'Gears', title: 'Transmitted load on a spur gear', diff: 2, video: true, fig: 'gears',
    gen(r) {
      const N = r.pick([16, 18, 20, 24, 30]);
      const Pd = r.pick([4, 5, 6, 8, 10]);
      const n = r.pick([900, 1150, 1750]);
      const H = r.pick([5, 10, 15, 20, 30]);
      const d = N / Pd, V = (PI * d * n) / 12, Wt = (33000 * H) / V;
      return {
        prompt: `A <b>${N}-tooth</b> spur pinion with diametral pitch <b>P = ${Pd} teeth/in</b> runs at <b>${n} rpm</b> and transmits <b>${H} hp</b>. What is the tangential (transmitted) load W<sub>t</sub>?`,
        answer: Wt, unit: 'lbf',
        fig: { name: 'gears', data: { a: `pinion N=${N}` } },
        steps: [
          { t: 'Pitch diameter:', m: R`d = \frac{N}{P} = \frac{${N}}{${Pd}} = ${fm(d, 4)}\ \text{in}` },
          { t: 'Pitch-line velocity in ft/min:', m: R`V = \frac{\pi d n}{12} = \frac{\pi(${fm(d, 4)})(${n})}{12} = ${fm(V, 4)}\ \text{ft/min}` },
          { t: 'Transmitted load from power:', m: R`W_t = \frac{33{,}000H}{V} = \frac{33{,}000(${H})}{${fm(V, 4)}} = ${fm(Wt, 4)}\ \text{lbf}` }
        ],
        distract: [(33000 * H) / (PI * d * n), (63025 * H) / n, Wt * Math.tan((20 * PI) / 180)]
      };
    }
  });

  add({
    id: 'mc-train', topic: 'mc', sub: 'Gears', title: 'Compound gear train output speed', diff: 1,
    gen(r) {
      const n = r.pick([1200, 1750, 1800, 3600]);
      const N1 = r.pick([16, 18, 20]), N2 = r.pick([48, 54, 60, 72]), N3 = r.pick([15, 18, 20, 24]), N4 = r.pick([45, 60, 64, 80]);
      const out = n * (N1 / N2) * (N3 / N4);
      return {
        prompt: `In a compound gear train, input gear 1 (<b>${N1} T</b>) at <b>${n} rpm</b> drives gear 2 (<b>${N2} T</b>). Gear 3 (<b>${N3} T</b>) is keyed to the same shaft as gear 2 and drives gear 4 (<b>${N4} T</b>). What is the speed of gear 4?`,
        answer: out, unit: 'rpm',
        steps: [
          { t: 'Train value = product of driver teeth / product of driven teeth.', m: R`e = \frac{N_1 N_3}{N_2 N_4} = \frac{${N1}\cdot${N3}}{${N2}\cdot${N4}} = ${fm((N1 * N3) / (N2 * N4), 4)}` },
          { t: 'Output speed:', m: R`n_4 = e\,n_1 = ${fm((N1 * N3) / (N2 * N4), 4)}(${n}) = ${fm(out, 4)}\ \text{rpm}` }
        ],
        distract: [n * (N1 / N4), n * (N2 / N1) * (N4 / N3), n * (N1 / N2)]
      };
    }
  });

  add({
    id: 'mc-bearing', topic: 'mc', sub: 'Bearings', title: 'Rolling bearing L10 life', diff: 2, video: true,
    gen(r) {
      const roller = r.next() < 0.35;
      const C = r.pick([3500, 5000, 6200, 8000, 11000]);
      const F = r.pick([600, 800, 1000, 1500]);
      const n = r.pick([500, 900, 1200, 1750]);
      const a = roller ? 10 / 3 : 3;
      const L = Math.pow(C / F, a) * 1e6;
      const Lh = L / (60 * n);
      return {
        prompt: `A <b>${roller ? 'cylindrical roller' : 'deep-groove ball'}</b> bearing has a basic dynamic load rating C = <b>${f(C, 5)} lbf</b> (rated at 10⁶ revolutions). It carries a pure radial load of <b>${F} lbf</b> at <b>${n} rpm</b>. What is its L<sub>10</sub> life in hours?`,
        answer: Lh, unit: 'h', tol: 0.03,
        steps: [
          { t: `Life exponent: a = ${roller ? '10/3 for roller bearings' : '3 for ball bearings'}.`, m: R`L_{10} = \left(\frac{C}{P}\right)^a(10^6) = \left(\frac{${C}}{${F}}\right)^{${roller ? '10/3' : '3'}}(10^6) = ${fm(L, 4)}\ \text{rev}` },
          { t: 'Convert revolutions to hours.', m: R`L_h = \frac{L_{10}}{60n} = \frac{${fm(L, 4)}}{60(${n})} = ${fm(Lh, 4)}\ \text{h}` }
        ],
        distract: [Math.pow(C / F, roller ? 3 : 10 / 3) * 1e6 / (60 * n), L / n, (C / F) * 1e6 / (60 * n)]
      };
    }
  });

  add({
    id: 'mc-spring-k', topic: 'mc', sub: 'Springs', title: 'Helical compression spring rate', diff: 1,
    gen(r) {
      const d = r.pick([0.08, 0.105, 0.125, 0.148, 0.177]);
      const C = r.pick([6, 7, 8, 9, 10]);
      const D = +(C * d).toFixed(3);
      const Na = r.pick([6, 8, 10, 12]);
      const G = 11.5e6;
      const k = (G * d ** 4) / (8 * D ** 3 * Na);
      return {
        prompt: `A helical compression spring is made of music wire (G = 11.5×10⁶ psi) with wire diameter <b>${d} in</b>, mean coil diameter <b>${D} in</b>, and <b>${Na}</b> active coils. What is the spring rate?`,
        answer: k, unit: 'lbf/in',
        steps: [
          { t: 'Spring rate for a helical spring (direct shear contribution neglected):', m: R`k = \frac{Gd^4}{8D^3N_a}` },
          { t: 'Evaluate.', m: R`k = \frac{(11.5\times10^6)(${d})^4}{8(${D})^3(${Na})} = ${fm(k, 4)}\ \text{lbf/in}` }
        ],
        distract: [(G * d ** 4) / (8 * D ** 3 * (Na + 2)), (G * d ** 3) / (8 * D ** 3 * Na), (G * d ** 4) / (64 * D ** 3 * Na)]
      };
    }
  });

  add({
    id: 'mc-spring-tau', topic: 'mc', sub: 'Springs', title: 'Spring shear stress with curvature correction', diff: 2, video: true,
    gen(r) {
      const d = r.pick([0.105, 0.125, 0.148, 0.177, 0.207]);
      const C = r.pick([6, 7, 8, 9, 10]);
      const D = C * d;
      const F = r.pick([20, 30, 40, 50]);
      const KB = (4 * C + 2) / (4 * C - 3);
      const tau = (KB * 8 * F * D) / (PI * d ** 3);
      return {
        prompt: `A helical spring with wire diameter <b>${d} in</b> and mean coil diameter <b>${f(D, 4)} in</b> supports an axial load of <b>${F} lbf</b>. Using the Bergsträsser factor, find the maximum shear stress in the wire.`,
        answer: tau, unit: 'psi',
        steps: [
          { t: 'Spring index:', m: R`C = \frac{D}{d} = \frac{${f(D, 4)}}{${d}} = ${C}` },
          { t: 'Bergsträsser factor (accounts for direct shear and curvature):', m: R`K_B = \frac{4C + 2}{4C - 3} = \frac{${4 * C + 2}}{${4 * C - 3}} = ${fm(KB, 4)}` },
          { t: 'Maximum shear stress:', m: R`\tau = K_B\frac{8FD}{\pi d^3} = ${fm(KB, 4)}\cdot\frac{8(${F})(${f(D, 4)})}{\pi(${d})^3} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [(8 * F * D) / (PI * d ** 3), (1 + 0.5 / C) * (8 * F * D) / (PI * d ** 3), (KB * 16 * F * D) / (PI * d ** 3)]
      };
    }
  });

  add({
    id: 'mc-screw', topic: 'mc', sub: 'Power screws', title: 'Torque to raise a load — square-thread screw', diff: 3, video: true,
    gen(r) {
      const d = r.pick([1, 1.25, 1.5, 2]);
      const p = r.pick([0.2, 0.25, 0.333]);
      const F = r.pick([2000, 4000, 6000, 8000]);
      const fr = r.pick([0.08, 0.1, 0.12, 0.15]);
      const dm = d - p / 2, l = p;
      const T = ((F * dm) / 2) * ((l + PI * fr * dm) / (PI * dm - fr * l));
      const eff = (F * l) / (2 * PI * T);
      return {
        prompt: `A single-start square-thread power screw has a major diameter of <b>${d} in</b> and pitch of <b>${p} in</b>. The thread friction coefficient is <b>${fr}</b>. Neglecting collar friction, what torque is needed to raise a <b>${f(F, 5)} lbf</b> load?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Mean diameter and lead (single start → lead = pitch):', m: R`d_m = d - \frac{p}{2} = ${d} - \frac{${p}}{2} = ${fm(dm, 4)}\ \text{in} \qquad l = ${p}\ \text{in}` },
          { t: 'Raising torque for a square thread:', m: R`T_R = \frac{Fd_m}{2}\left(\frac{l + \pi f d_m}{\pi d_m - fl}\right)` },
          { t: 'Evaluate.', m: R`T_R = \frac{${F}(${fm(dm, 4)})}{2}\left(\frac{${p} + \pi(${fr})(${fm(dm, 4)})}{\pi(${fm(dm, 4)}) - ${fr}(${p})}\right) = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: `Efficiency e = Fl/(2πT) = ${f(eff * 100, 3)}%. The screw is self-locking because πfd<sub>m</sub> = ${f(PI * fr * dm, 3)} > l = ${p}.` }
        ],
        distract: [((F * d) / 2) * ((l + PI * fr * d) / (PI * d - fr * l)), ((F * dm) / 2) * ((PI * fr * dm - l) / (PI * dm + fr * l)), (F * l) / (2 * PI)]
      };
    }
  });

  add({
    id: 'mc-belt', topic: 'mc', sub: 'Belts, pulleys & chains', title: 'Flat belt power capacity', diff: 2, fig: 'belt',
    gen(r) {
      const F1 = r.pick([150, 200, 250, 300]);
      const fr = r.pick([0.25, 0.3, 0.35]);
      const th = r.pick([150, 160, 165, 170]);
      const V = r.pick([2000, 2500, 3000, 3500]);
      const ratio = Math.exp(fr * (th * PI) / 180);
      const F2 = F1 / ratio;
      const H = ((F1 - F2) * V) / 33000;
      return {
        prompt: `A flat belt has a maximum allowable tension of <b>${F1} lbf</b>, a coefficient of friction of <b>${fr}</b>, and wraps <b>${th}°</b> around the smaller pulley. At a belt speed of <b>${f(V, 5)} ft/min</b>, what is the maximum power it can transmit (hp)? Neglect centrifugal tension.`,
        answer: H, unit: 'hp',
        fig: { name: 'belt', data: {} },
        steps: [
          { t: 'Wrap angle in radians and the belt-friction (capstan) relation:', m: R`\phi = ${th}^\circ\cdot\frac{\pi}{180} = ${fm((th * PI) / 180, 4)}\ \text{rad} \qquad \frac{F_1}{F_2} = e^{f\phi} = ${fm(ratio, 4)}` },
          { t: 'Slack-side tension:', m: R`F_2 = \frac{${F1}}{${fm(ratio, 4)}} = ${fm(F2, 4)}\ \text{lbf}` },
          { t: 'Power from net belt pull:', m: R`H = \frac{(F_1 - F_2)V}{33{,}000} = \frac{(${fm(F1 - F2, 4)})(${V})}{33{,}000} = ${fm(H, 4)}\ \text{hp}` }
        ],
        distract: [(F1 * V) / 33000, ((F1 - F1 / Math.exp(fr * PI)) * V) / 33000, ((F1 - F2) * V) / 550]
      };
    }
  });

  add({
    id: 'mc-clutch', topic: 'mc', sub: 'Clutches & brakes', title: 'Disc clutch torque — uniform wear', diff: 2,
    gen(r) {
      const D = r.pick([8, 10, 12, 14]);
      const d = r.pick([4, 5, 6]);
      const F = r.pick([500, 800, 1000, 1200]);
      const fr = r.pick([0.25, 0.3, 0.35, 0.4]);
      const N = r.pick([2, 2, 4]);
      const T = (N * fr * F * (D + d)) / 4;
      return {
        prompt: `A dry multi-disc clutch has <b>${N}</b> friction surfaces, outside diameter <b>${D} in</b>, inside diameter <b>${d} in</b>, coefficient of friction <b>${fr}</b>, and actuating force <b>${F} lbf</b>. Assuming uniform wear, what torque can it transmit?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Uniform wear: friction acts effectively at the mean radius (D + d)/4 for each friction surface.', m: R`T = N\,\frac{fF(D + d)}{4}` },
          { t: 'Evaluate.', m: R`T = ${N}\cdot\frac{${fr}(${F})(${D} + ${d})}{4} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [(fr * F * (D + d)) / 4, ((N * fr * F) / 3) * ((D ** 3 - d ** 3) / (D ** 2 - d ** 2)), (N * fr * F * (D + d)) / 2]
      };
    }
  });

  add({
    id: 'mc-shaft-d', topic: 'mc', sub: 'Shafts & keys', title: 'Minimum shaft diameter for torsion', diff: 2,
    gen(r) {
      const H = r.pick([10, 20, 25, 40, 50, 75]);
      const n = r.pick([300, 600, 900, 1200]);
      const ta = r.pick([6000, 8000, 10000, 12000]);
      const T = (63025 * H) / n;
      const d = Math.cbrt((16 * T) / (PI * ta));
      return {
        prompt: `A solid line shaft transmits <b>${H} hp</b> at <b>${n} rpm</b>. If the allowable shear stress is <b>${f(ta, 5)} psi</b>, what minimum diameter is required (torsion only)?`,
        answer: d, unit: 'in',
        steps: [
          { t: 'Torque:', m: R`T = \frac{63{,}025H}{n} = \frac{63{,}025(${H})}{${n}} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Solve τ = 16T/(πd³) for d.', m: R`d = \left(\frac{16T}{\pi\tau_{allow}}\right)^{1/3} = \left(\frac{16(${fm(T, 4)})}{\pi(${ta})}\right)^{1/3} = ${fm(d, 4)}\ \text{in}` }
        ],
        distract: [Math.cbrt((32 * T) / (PI * ta)), Math.sqrt((16 * T) / (PI * ta)), Math.cbrt((16 * (5252 * H / n)) / (PI * ta))]
      };
    }
  });

  add({
    id: 'mc-flywheel', topic: 'mc', sub: 'Mechanisms & flywheels', title: 'Flywheel inertia for speed fluctuation', diff: 2,
    gen(r) {
      const dE = r.pick([800, 1200, 2000, 3000]);
      const n = r.pick([300, 600, 900, 1200]);
      const Cs = r.pick([0.02, 0.03, 0.05]);
      const w = (2 * PI * n) / 60;
      const I = dE / (Cs * w * w);
      return {
        prompt: `A punch press flywheel must supply <b>${dE} ft·lbf</b> of energy per stroke while its speed drops from its average of <b>${n} rpm</b> with a coefficient of speed fluctuation C<sub>s</sub> = <b>${Cs}</b>. What mass moment of inertia (slug·ft²) is required?`,
        answer: I, unit: 'slug·ft²',
        steps: [
          { t: 'Average angular speed:', m: R`\omega = \frac{2\pi(${n})}{60} = ${fm(w, 4)}\ \text{rad/s}` },
          { t: 'Energy change related to speed fluctuation:', m: R`\Delta E = \tfrac12 I(\omega_{max}^2 - \omega_{min}^2) = C_s I\omega^2` },
          { t: 'Solve for I.', m: R`I = \frac{\Delta E}{C_s\omega^2} = \frac{${dE}}{${Cs}(${fm(w, 4)})^2} = ${fm(I, 4)}\ \text{slug}\cdot\text{ft}^2` }
        ],
        distract: [(2 * dE) / (Cs * w * w), dE / (Cs * n * n), dE / (w * w)]
      };
    }
  });

  add({
    id: 'mc-cyl', topic: 'mc', sub: 'Hydraulic & pneumatic components', title: 'Hydraulic cylinder speed & force', diff: 1, fig: 'cylinder',
    gen(r) {
      const D = r.pick([2, 2.5, 3, 4, 5]);
      const Q = r.pick([5, 8, 10, 15, 20]);
      const p = r.pick([1000, 1500, 2000, 2500]);
      const A = (PI * D * D) / 4;
      const v = (Q * 231) / 60 / A;
      return {
        prompt: `A hydraulic cylinder with a <b>${D} in</b> bore is supplied with <b>${Q} gpm</b> at <b>${p} psi</b>. What is the extension speed of the rod (in/s)?`,
        answer: v, unit: 'in/s',
        fig: { name: 'cylinder', data: {} },
        steps: [
          { t: 'Piston (cap-end) area:', m: R`A = \frac{\pi D^2}{4} = ${fm(A, 4)}\ \text{in}^2` },
          { t: 'Convert flow to in³/s (1 gal = 231 in³):', m: R`Q = \frac{${Q}(231)}{60} = ${fm((Q * 231) / 60, 4)}\ \text{in}^3/\text{s}` },
          { t: `Speed v = Q/A. (The extension force would be pA = ${f(p * A, 4)} lbf — pressure doesn't affect speed.)`, m: R`v = \frac{${fm((Q * 231) / 60, 4)}}{${fm(A, 4)}} = ${fm(v, 4)}\ \text{in/s}` }
        ],
        distract: [(Q * 231) / A, v * 60, (Q * 231) / 60 / (PI * D * D)]
      };
    }
  });

  add({
    id: 'mc-hydpower', topic: 'mc', sub: 'Hydraulic & pneumatic components', title: 'Pump input power', diff: 1,
    gen(r) {
      const p = r.pick([1500, 2000, 2500, 3000]);
      const Q = r.pick([8, 10, 15, 20, 30]);
      const eta = r.pick([0.8, 0.85, 0.9]);
      const H = (p * Q) / 1714 / eta;
      return {
        prompt: `A hydraulic pump delivers <b>${Q} gpm</b> at <b>${p} psi</b>. Its overall efficiency is <b>${Math.round(eta * 100)}%</b>. What input power (hp) is required?`,
        answer: H, unit: 'hp',
        steps: [
          { t: 'Hydraulic (fluid) power in hp:', m: R`H_{hyd} = \frac{pQ}{1714} = \frac{${p}(${Q})}{1714} = ${fm((p * Q) / 1714, 4)}\ \text{hp}` },
          { t: 'Divide by efficiency for the shaft input power.', m: R`H_{in} = \frac{H_{hyd}}{\eta} = ${fm(H, 4)}\ \text{hp}` }
        ],
        distract: [(p * Q) / 1714, (p * Q * eta) / 1714, (p * Q) / 1714 / eta / 0.746]
      };
    }
  });

  /* ======================= JOINTS & FASTENERS ======================= */
  const BOLTS = [
    { s: '3/8-16 UNC', d: 0.375, At: 0.0775 },
    { s: '1/2-13 UNC', d: 0.5, At: 0.1419 },
    { s: '5/8-11 UNC', d: 0.625, At: 0.226 },
    { s: '3/4-10 UNC', d: 0.75, At: 0.334 }
  ];
  add({
    id: 'jf-preload', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bolt preload & tightening torque', diff: 2, video: true, fig: 'bolt',
    gen(r) {
      const b = r.pick(BOLTS);
      const g = r.pick([{ n: 'SAE grade 5', Sp: 85000 }, { n: 'SAE grade 8', Sp: 120000 }]);
      const K = r.pick([0.2, 0.18, 0.15]);
      const Fi = 0.75 * b.At * g.Sp;
      const T = (K * Fi * b.d) / 12;
      return {
        prompt: `A <b>${b.s}</b> ${g.n} bolt (S<sub>p</sub> = ${g.Sp / 1000} ksi, A<sub>t</sub> = ${b.At} in²) is to be preloaded to 75% of proof load for a reusable connection. With a torque coefficient K = <b>${K}</b>, what tightening torque (lbf·ft) is required?`,
        answer: T, unit: 'lbf·ft',
        fig: { name: 'bolt', data: {} },
        steps: [
          { t: 'Recommended preload for reusable connections:', m: R`F_i = 0.75A_tS_p = 0.75(${b.At})(${g.Sp}) = ${fm(Fi, 4)}\ \text{lbf}` },
          { t: 'Torque–preload relation (d = nominal diameter):', m: R`T = KF_id = ${K}(${fm(Fi, 4)})(${b.d}) = ${fm(T * 12, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Convert to lbf·ft.', m: R`T = \frac{${fm(T * 12, 4)}}{12} = ${fm(T, 4)}\ \text{lbf}\cdot\text{ft}` }
        ],
        distract: [T * 12, (K * 0.9 * b.At * g.Sp * b.d) / 12, (K * Fi * b.d * 0.5) / 12]
      };
    }
  });

  add({
    id: 'jf-joint', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bolt load with joint stiffness', diff: 2, video: true, fig: 'bolt',
    gen(r) {
      const kb = r.pick([2, 3, 4, 5]); // Mlbf/in
      const km = r.pick([10, 12, 15, 18, 20]);
      const Fi = r.pick([6000, 8000, 10000, 12000]);
      const Pl = r.pick([2000, 3000, 4000, 5000]);
      const C = kb / (kb + km);
      const Fb = Fi + C * Pl;
      const P0 = Fi / (1 - C);
      return {
        prompt: `In a bolted joint, the bolt stiffness is k<sub>b</sub> = <b>${kb}×10⁶ lbf/in</b> and member stiffness k<sub>m</sub> = <b>${km}×10⁶ lbf/in</b>. Each bolt is preloaded to <b>${f(Fi, 5)} lbf</b> and then an external separating load of <b>${f(Pl, 5)} lbf</b> per bolt is applied. What is the resulting bolt tension?`,
        answer: Fb, unit: 'lbf',
        fig: { name: 'bolt', data: {} },
        steps: [
          { t: 'Joint stiffness constant — the fraction of external load carried by the bolt:', m: R`C = \frac{k_b}{k_b + k_m} = \frac{${kb}}{${kb} + ${km}} = ${fm(C, 4)}` },
          { t: 'Bolt load:', m: R`F_b = F_i + CP = ${Fi} + ${fm(C, 4)}(${Pl}) = ${fm(Fb, 4)}\ \text{lbf}` },
          { t: `Check separation: P₀ = F<sub>i</sub>/(1 − C) = ${f(P0, 4)} lbf > P, so the joint stays closed.` }
        ],
        distract: [Fi + Pl, Fi + (1 - C) * Pl, Fi - C * Pl]
      };
    }
  });

  add({
    id: 'jf-pin', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Clevis pin in double shear', diff: 1,
    gen(r) {
      const F = r.pick([3000, 5000, 8000, 10000]);
      const d = r.pick([0.375, 0.5, 0.625, 0.75]);
      const tau = F / (2 * ((PI * d * d) / 4));
      return {
        prompt: `A clevis pin of diameter <b>${d} in</b> connects a rod to a fork (clevis). The rod carries <b>${f(F, 5)} lbf</b> in tension. What is the average shear stress in the pin?`,
        answer: tau, unit: 'psi',
        steps: [
          { t: 'A clevis puts the pin in double shear — two shear planes share the load.', m: R`A_{shear} = 2\cdot\frac{\pi d^2}{4} = 2\cdot\frac{\pi(${d})^2}{4} = ${fm(2 * ((PI * d * d) / 4), 4)}\ \text{in}^2` },
          { t: 'Average shear stress:', m: R`\tau = \frac{F}{A} = \frac{${F}}{${fm(2 * ((PI * d * d) / 4), 4)}} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [tau * 2, F / (PI * d * d), F / (2 * PI * d)]
      };
    }
  });

  add({
    id: 'jf-weld', topic: 'jf', sub: 'Welding & brazing', title: 'Fillet weld throat shear', diff: 1, video: true, fig: 'weld',
    gen(r) {
      const F = r.pick([10000, 15000, 20000, 25000]);
      const h = r.pick([0.25, 0.3125, 0.375, 0.5]);
      const L = r.pick([3, 4, 5, 6]);
      const tau = F / (0.707 * h * 2 * L);
      return {
        prompt: `A bar is attached to a plate by two parallel fillet welds, each <b>${L} in</b> long with a leg size of <b>${h} in</b>. The bar carries <b>${f(F, 5)} lbf</b> parallel to the welds. What is the shear stress on the weld throat?`,
        answer: tau, unit: 'psi',
        fig: { name: 'weld', data: { F: `${f(F, 5)} lbf`, label: `two fillets, h = ${h} in, L = ${L} in` } },
        steps: [
          { t: 'Throat thickness of a 45° fillet weld:', m: R`t = 0.707h = 0.707(${h}) = ${fm(0.707 * h, 4)}\ \text{in}` },
          { t: 'Total throat area for both welds:', m: R`A = 0.707h(2L) = ${fm(0.707 * h, 4)}(${2 * L}) = ${fm(0.707 * h * 2 * L, 4)}\ \text{in}^2` },
          { t: 'Throat shear stress:', m: R`\tau = \frac{F}{A} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [F / (h * 2 * L), tau * 2, F / (0.707 * h * L)]
      };
    }
  });

  add({
    id: 'jf-key', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Shear stress in a square key', diff: 1,
    gen(r) {
      const D = r.pick([1.5, 2, 2.5, 3]);
      const w = D / 4;
      const L = r.pick([1.5, 2, 2.5, 3]);
      const T = r.pick([5000, 8000, 10000, 15000]);
      const F = (2 * T) / D;
      const tau = F / (w * L);
      return {
        prompt: `A <b>${w} in</b> square key, <b>${L} in</b> long, connects a gear hub to a <b>${D} in</b> shaft transmitting <b>${f(T, 5)} lbf·in</b>. What is the shear stress in the key?`,
        answer: tau, unit: 'psi',
        steps: [
          { t: 'The key transmits torque as a force at the shaft surface:', m: R`F = \frac{T}{D/2} = \frac{2(${T})}{${D}} = ${fm(F, 4)}\ \text{lbf}` },
          { t: 'Shear area is the key width times its length:', m: R`\tau = \frac{F}{wL} = \frac{${fm(F, 4)}}{${w}(${L})} = ${fm(tau, 4)}\ \text{psi}` },
          { t: `For comparison, the bearing (crushing) stress on the key side is F/(L·w/2) = ${f(F / (L * w / 2), 4)} psi.` }
        ],
        distract: [T / D / (w * L), F / (L * w / 2), (2 * T) / (D * w * w)]
      };
    }
  });

  add({
    id: 'jf-press', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Press-fit interface pressure', diff: 3,
    gen(r) {
      const D = r.pick([1, 1.5, 2, 2.5]);
      const Do = D * r.pick([1.75, 2, 2.5]);
      const dd = r.pick([0.001, 0.0015, 0.002]);
      const E = 30e6;
      const R0 = D / 2, ro = Do / 2, del = dd / 2;
      const p = ((E * del) / (2 * R0)) * (1 - (R0 * R0) / (ro * ro));
      return {
        prompt: `A steel hub (outside diameter <b>${f(Do, 4)} in</b>) is press-fit onto a solid steel shaft of nominal diameter <b>${D} in</b> with a <b>diametral</b> interference of <b>${dd} in</b>. E = 30×10⁶ psi for both. What is the interface pressure?`,
        answer: p, unit: 'psi',
        steps: [
          { t: 'Convert diametral interference to radial interference δ — a very common trap.', m: R`\delta = \frac{${dd}}{2} = ${fm(del, 4)}\ \text{in} \qquad R = ${R0}\ \text{in} \qquad r_o = ${fm(ro, 4)}\ \text{in}` },
          { t: 'Same-material press fit with a solid shaft (r<sub>i</sub> = 0):', m: R`p = \frac{E\delta}{2R}\left(1 - \frac{R^2}{r_o^2}\right)` },
          { t: 'Evaluate.', m: R`p = \frac{(30\times10^6)(${fm(del, 4)})}{2(${R0})}\left(1 - \frac{${R0}^2}{${fm(ro, 4)}^2}\right) = ${fm(p, 4)}\ \text{psi}` }
        ],
        distract: [p * 2, ((E * del) / (2 * R0)), p / 2]
      };
    }
  });

  /* ======================= SUPPORTIVE KNOWLEDGE ======================= */
  add({
    id: 'sk-fit', topic: 'sk', sub: 'Fits & tolerances / GD&T', title: 'Maximum clearance of a fit', diff: 1,
    gen(r) {
      const D = r.pick([0.75, 1, 1.5, 2]);
      const th = r.pick([0.001, 0.0012, 0.0016, 0.002]);
      const a = r.pick([0.0005, 0.0008, 0.001, 0.0015]);
      const ts = r.pick([0.0006, 0.0008, 0.001]);
      const hmax = D + th, smin = D - a - ts, smax = D - a;
      const cmax = hmax - smin;
      return {
        prompt: `A hole is dimensioned <b>${D.toFixed(4)} +${th.toFixed(4)}/−0.0000 in</b>. The mating shaft is <b>${smax.toFixed(4)} +0.0000/−${ts.toFixed(4)} in</b>. What is the maximum clearance?`,
        answer: cmax, unit: 'in', tol: 0.01,
        steps: [
          { t: 'Maximum clearance occurs with the largest hole and the smallest shaft (both at LMC).', m: R`\text{hole}_{max} = ${hmax.toFixed(4)}\ \text{in} \qquad \text{shaft}_{min} = ${smin.toFixed(4)}\ \text{in}` },
          { t: `Subtract. (Minimum clearance — the allowance — is ${D.toFixed(4)} − ${smax.toFixed(4)} = ${a.toFixed(4)} in.)`, m: R`c_{max} = ${hmax.toFixed(4)} - ${smin.toFixed(4)} = ${cmax.toFixed(4)}\ \text{in}` }
        ],
        distract: [a, th + ts, th + a]
      };
    }
  });

  add({
    id: 'sk-stack', topic: 'sk', sub: 'Fits & tolerances / GD&T', title: 'Tolerance stack-up — RSS', diff: 2,
    gen(r) {
      const ts = [r.pick([0.002, 0.003, 0.005]), r.pick([0.001, 0.002, 0.004]), r.pick([0.003, 0.005, 0.006]), r.pick([0.001, 0.002, 0.003])];
      const wc = ts.reduce((s, x) => s + x, 0);
      const rss = Math.sqrt(ts.reduce((s, x) => s + x * x, 0));
      return {
        prompt: `Four parts stack end-to-end with bilateral tolerances of ±${ts.join(', ±')} in. Using the root-sum-square (statistical) method, what is the tolerance on the overall length (± value)?`,
        answer: rss, unit: 'in',
        steps: [
          { t: 'RSS assumes independent, normally distributed dimensions centered on nominal:', m: R`t_{RSS} = \sqrt{\textstyle\sum t_i^2} = \sqrt{${ts.map((x) => x + '^2').join(' + ')}}` },
          { t: `Evaluate. (Worst-case stack would be ±${f(wc, 3)} in.)`, m: R`t_{RSS} = \pm ${fm(rss, 3)}\ \text{in}` }
        ],
        distract: [wc, wc / 4, rss * 2]
      };
    }
  });

  add({
    id: 'sk-reliab', topic: 'sk', sub: 'Quality, reliability & statistics', title: 'System reliability (series + parallel)', diff: 1,
    gen(r) {
      const Ra = r.pick([0.95, 0.97, 0.98, 0.99]);
      const Rb = r.pick([0.8, 0.85, 0.9]);
      const Rc = r.pick([0.96, 0.98, 0.99]);
      const Rp = 1 - (1 - Rb) ** 2;
      const Rs = Ra * Rp * Rc;
      return {
        prompt: `A conveyor drive consists of a motor (R = ${Ra}) in series with two identical redundant gearboxes in parallel (each R = ${Rb}), followed by a head shaft (R = ${Rc}) in series. What is the system reliability?`,
        answer: Rs, unit: '', tol: 0.002,
        steps: [
          { t: 'Parallel (redundant) block: the block fails only if both fail.', m: R`R_{par} = 1 - (1 - ${Rb})^2 = ${fm(Rp, 4)}` },
          { t: 'Series: multiply reliabilities.', m: R`R_{sys} = ${Ra}(${fm(Rp, 4)})(${Rc}) = ${fm(Rs, 4)}` }
        ],
        distract: [Ra * Rb * Rc, Ra * Rb * Rb * Rc, 1 - (1 - Ra) * (1 - Rb) * (1 - Rc)]
      };
    }
  });

  add({
    id: 'sk-turn', topic: 'sk', sub: 'Manufacturing processes', title: 'Turning time on a lathe', diff: 1,
    gen(r) {
      const D = r.pick([1, 1.5, 2, 3, 4]);
      const V = r.pick([300, 400, 500, 600]);
      const fd = r.pick([0.005, 0.008, 0.01, 0.012]);
      const L = r.pick([4, 6, 8, 10, 12]);
      const N = (12 * V) / (PI * D);
      const t = L / (fd * N);
      return {
        prompt: `A <b>${D} in</b> diameter bar is turned over a length of <b>${L} in</b> at a cutting speed of <b>${V} sfm</b> and a feed of <b>${fd} in/rev</b>. How long (minutes) does one pass take?`,
        answer: t, unit: 'min',
        steps: [
          { t: 'Spindle speed from surface speed (V in ft/min, D in inches):', m: R`N = \frac{12V}{\pi D} = \frac{12(${V})}{\pi(${D})} = ${fm(N, 4)}\ \text{rpm}` },
          { t: 'Feed rate = f·N, so time = L / (fN).', m: R`t = \frac{L}{fN} = \frac{${L}}{${fd}(${fm(N, 4)})} = ${fm(t, 3)}\ \text{min}` }
        ],
        distract: [L / (fd * ((V) / (PI * D))), L / (fd * ((12 * V) / D)), t * 2]
      };
    }
  });

  add({
    id: 'sk-cpk', topic: 'sk', sub: 'Quality, reliability & statistics', title: 'Process capability index Cpk', diff: 1,
    gen(r) {
      const nom = r.pick([1.0, 0.75, 2.5]);
      const tol = r.pick([0.003, 0.004, 0.005]);
      const shift = r.pick([0.0005, 0.001, -0.0008, 0.0012]);
      const sig = r.pick([0.0005, 0.0006, 0.0008]);
      const mu = nom + shift;
      const usl = nom + tol, lsl = nom - tol;
      const cpk = Math.min(usl - mu, mu - lsl) / (3 * sig);
      return {
        prompt: `A shaft diameter is specified as <b>${nom.toFixed(3)} ± ${tol} in</b>. The process mean is <b>${mu.toFixed(4)} in</b> with standard deviation <b>${sig} in</b>. What is C<sub>pk</sub>?`,
        answer: cpk, unit: '',
        steps: [
          { t: 'Limits:', m: R`USL = ${usl.toFixed(4)} \qquad LSL = ${lsl.toFixed(4)}` },
          { t: 'C<sub>pk</sub> uses the distance from the mean to the nearer limit:', m: R`C_{pk} = \min\left(\frac{USL - \mu}{3\sigma}, \frac{\mu - LSL}{3\sigma}\right) = \min(${fm((usl - mu) / (3 * sig), 3)}, ${fm((mu - lsl) / (3 * sig), 3)}) = ${fm(cpk, 3)}` },
          { t: `For comparison C<sub>p</sub> = (USL − LSL)/6σ = ${f((2 * tol) / (6 * sig), 3)} — C<sub>pk</sub> is lower because the process is off-center.` }
        ],
        distract: [(2 * tol) / (6 * sig), Math.max(usl - mu, mu - lsl) / (3 * sig), cpk * 2]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
