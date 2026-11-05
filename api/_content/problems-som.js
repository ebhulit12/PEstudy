/* Strength of Materials — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const rad = (d) => (d * PI) / 180;

  add({
    id: 'som-shear-rect', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Maximum transverse shear in a rectangular beam', diff: 2, fig: 'beam',
    gen(r) {
      const Pl = r.pick([2000, 4000, 6000, 10000]), b = r.pick([1.5, 2, 3]), h = r.pick([4, 6, 8]);
      const V = Pl / 2, tau = (1.5 * V) / (b * h);
      return {
        prompt: `A simply supported rectangular timber beam, <b>${b} in</b> wide × <b>${h} in</b> deep, carries a <b>${f(Pl, 5)} lbf</b> load at midspan. Neglecting self-weight, what is the maximum transverse shear stress?`,
        answer: tau, unit: 'psi',
        fig: { name: 'beam', data: { P: `${f(Pl, 5)} lbf`, a: 0.5 } },
        steps: [
          { t: 'By symmetry each support carries half the load, so the shear force magnitude is P/2 everywhere:', m: R`V_{max} = \frac{P}{2} = ${fm(V, 4)}\ \text{lbf}` },
          { t: 'For a rectangle, τ = VQ/(Ib) peaks at the neutral axis at 1.5× the average shear:', m: R`\tau_{max} = \frac{3V}{2A} = \frac{3(${fm(V, 4)})}{2(${b})(${h})} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [V / (b * h), (1.5 * Pl) / (b * h), (4 * V) / (3 * b * h)]
      };
    }
  });

  add({
    id: 'som-ss-uniform-defl', topic: 'som', sub: 'Stress–strain & deflection', title: 'Midspan deflection — uniform load on a steel beam', diff: 2, fig: 'beam',
    gen(r) {
      const w = r.pick([200, 400, 600, 800]), L = r.pick([12, 16, 20, 24]), I = r.pick([82.7, 118, 170, 204, 291]);
      const E = 29e6, wi = w / 12, Li = L * 12, y = (5 * wi * Li ** 4) / (384 * E * I);
      return {
        prompt: `A simply supported W-shape steel beam (E = 29×10⁶ psi, I = <b>${I} in⁴</b>) spans <b>${L} ft</b> and carries a uniform load of <b>${w} lbf/ft</b>. What is the midspan deflection?`,
        answer: y, unit: 'in',
        fig: { name: 'beam', data: { w: `${w} lbf/ft`, L: `${L} ft` } },
        steps: [
          { t: 'Convert to consistent units (inches):', m: R`w = \frac{${w}}{12} = ${fm(wi, 4)}\ \text{lbf/in} \qquad L = ${L}(12) = ${Li}\ \text{in}` },
          { t: 'Beam-table deflection for a simple span with a uniform load:', m: R`y_{max} = \frac{5wL^4}{384EI} = \frac{5(${fm(wi, 4)})(${Li})^4}{384(29\times10^6)(${I})} = ${fm(y, 4)}\ \text{in}` },
          { t: `Serviceability check: L/360 = ${f(Li / 360, 3)} in.` }
        ],
        distract: [(5 * w * Li ** 4) / (384 * E * I), (wi * Li ** 4) / (8 * E * I), (5 * wi * L ** 4) / (384 * E * I) * 1728]
      };
    }
  });

  add({
    id: 'som-propped', topic: 'som', sub: 'Shear & moment diagrams', title: 'Propped cantilever — reaction at the prop', diff: 3,
    gen(r) {
      const w = r.pick([300, 500, 800, 1200]), L = r.pick([10, 12, 16, 20]);
      const Rb = (3 * w * L) / 8, Ma = (w * L * L) / 8;
      return {
        prompt: `A beam of span <b>${L} ft</b> is fixed at end A and simply supported (propped) at end B. It carries a uniform load of <b>${w} lbf/ft</b> and has constant EI. What is the vertical reaction at the prop B?`,
        answer: Rb, unit: 'lbf',
        steps: [
          { t: 'The beam is statically indeterminate (one redundant). Remove the prop and use superposition: the cantilever tip deflection from the load must be cancelled by the prop force R<sub>B</sub>.', m: R`\delta_{w} = \frac{wL^4}{8EI} \qquad \delta_{R} = \frac{R_BL^3}{3EI}` },
          { t: 'Compatibility: the deflection at B is zero.', m: R`\frac{R_BL^3}{3EI} = \frac{wL^4}{8EI} \;\Rightarrow\; R_B = \frac{3wL}{8}` },
          { t: 'Evaluate.', m: R`R_B = \frac{3(${w})(${L})}{8} = ${fm(Rb, 4)}\ \text{lbf}` },
          { t: `Then R<sub>A</sub> = 5wL/8 = ${f((5 * w * L) / 8, 4)} lbf and the fixed-end moment is wL²/8 = ${f(Ma, 4)} ft·lbf.` }
        ],
        distract: [(w * L) / 2, (5 * w * L) / 8, (w * L) / 8]
      };
    }
  });

  add({
    id: 'som-composite', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Load sharing in a steel–aluminum composite post', diff: 3, video: true,
    gen(r) {
      const ds = r.pick([1, 1.25, 1.5]), Do = r.pick([2.5, 3, 3.5]), Di = Do - r.pick([0.25, 0.5]), Pl = r.pick([20000, 30000, 40000, 50000]);
      const Es = 30e6, Ea = 10e6, As = (PI * ds * ds) / 4, Aa = (PI * (Do * Do - Di * Di)) / 4;
      const Ps = (Pl * Es * As) / (Es * As + Ea * Aa), ss = Ps / As;
      return {
        prompt: `A short post is made of a <b>${ds} in</b> solid steel rod (E = 30×10⁶ psi) inside an aluminum tube (E = 10×10⁶ psi, OD <b>${Do} in</b>, ID <b>${f(Di)} in</b>) of the same length. A rigid cap applies <b>${f(Pl, 5)} lbf</b> of compression to both. What is the compressive stress in the steel rod?`,
        answer: ss, unit: 'psi',
        steps: [
          { t: 'Areas:', m: R`A_s = \frac{\pi(${ds})^2}{4} = ${fm(As, 4)}\ \text{in}^2 \qquad A_a = \frac{\pi(${Do}^2 - ${f(Di)}^2)}{4} = ${fm(Aa, 4)}\ \text{in}^2` },
          { t: 'The rigid cap forces equal shortening (compatibility): P<sub>s</sub>L/(A<sub>s</sub>E<sub>s</sub>) = P<sub>a</sub>L/(A<sub>a</sub>E<sub>a</sub>). With P<sub>s</sub> + P<sub>a</sub> = P, each member carries load in proportion to its axial stiffness:', m: R`P_s = P\,\frac{E_sA_s}{E_sA_s + E_aA_a} = ${Pl}\cdot\frac{${fm(Es * As, 4)}}{${fm(Es * As + Ea * Aa, 4)}} = ${fm(Ps, 4)}\ \text{lbf}` },
          { t: 'Steel stress:', m: R`\sigma_s = \frac{P_s}{A_s} = ${fm(ss, 4)}\ \text{psi}` },
          { t: `The aluminum stress is ${f((Pl - Ps) / Aa, 4)} psi, exactly E<sub>a</sub>/E<sub>s</sub> = 1/3 of the steel stress, because the strains are equal.` }
        ],
        distract: [Pl / (As + Aa), (Pl * As) / (As + Aa) / As, Pl / As]
      };
    }
  });

  add({
    id: 'som-kt-plate', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Peak stress at a hole in a tension plate', diff: 2,
    gen(r) {
      const w = r.pick([2, 2.5, 3, 4]), dh = r.pick([0.5, 0.75, 1]), t = r.pick([0.25, 0.375, 0.5]), Pl = r.pick([5000, 8000, 12000]);
      const ratio = dh / w, Kt = +(3 - 3.14 * ratio + 3.667 * ratio ** 2 - 1.527 * ratio ** 3).toFixed(2);
      const snom = Pl / ((w - dh) * t), smax = Kt * snom;
      return {
        prompt: `A flat bar <b>${w} in</b> wide and <b>${t} in</b> thick has a central hole of diameter <b>${dh} in</b> and carries <b>${f(Pl, 5)} lbf</b> in tension. For d/w = ${f(ratio, 3)}, the stress concentration factor (based on the net section) is <b>K<sub>t</sub> = ${Kt}</b>. What is the maximum stress at the edge of the hole?`,
        answer: smax, unit: 'psi',
        steps: [
          { t: 'K<sub>t</sub> charts for this geometry use the net-section nominal stress:', m: R`\sigma_{nom} = \frac{P}{(w - d)t} = \frac{${Pl}}{(${w} - ${dh})(${t})} = ${fm(snom, 4)}\ \text{psi}` },
          { t: 'Peak stress:', m: R`\sigma_{max} = K_t\sigma_{nom} = ${Kt}(${fm(snom, 4)}) = ${fm(smax, 4)}\ \text{psi}` },
          { t: 'For a ductile material under static load this local peak is usually tolerable (local yielding). For fatigue, use K<sub>f</sub> = 1 + q(K<sub>t</sub> − 1).' }
        ],
        distract: [Kt * (Pl / (w * t)), snom, (Kt * Pl) / (w * t) * (w / (w - dh)) * 1.5]
      };
    }
  });

  add({
    id: 'som-abs-shear', topic: 'som', sub: 'Stress types & transformations (Mohr)', title: 'Absolute maximum shear stress (3-D Mohr)', diff: 3, video: true, fig: 'mohr',
    gen(r) {
      const sx = r.pick([12, 16, 20, 24]), sy = r.pick([6, 8, 10]), txy = r.pick([3, 4, 5]);
      const c = (sx + sy) / 2, R0 = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2), s1 = c + R0, s2 = c - R0;
      const tabs = Math.max(s1, s2, 0) / 2 - Math.min(s1, s2, 0) / 2;
      return {
        prompt: `At the free surface of a pressure-vessel nozzle, the plane stresses are σ<sub>x</sub> = <b>${sx} ksi</b>, σ<sub>y</sub> = <b>${sy} ksi</b>, τ<sub>xy</sub> = <b>${txy} ksi</b> (σ<sub>z</sub> = 0). What is the <b>absolute</b> maximum shear stress?`,
        answer: tabs, unit: 'ksi',
        fig: { name: 'mohr', data: {} },
        steps: [
          { t: 'In-plane principal stresses:', m: R`C = ${fm(c, 4)},\ R = \sqrt{${fm((sx - sy) / 2, 4)}^2 + ${txy}^2} = ${fm(R0, 4)} \;\Rightarrow\; \sigma_1 = ${fm(s1, 4)},\ \sigma_2 = ${fm(s2, 4)}\ \text{ksi}` },
          { t: 'The out-of-plane principal stress is σ<sub>z</sub> = 0. Both in-plane principals are tensile, so the three principals ordered are:', m: R`\sigma_{max} = ${fm(s1, 4)},\quad \sigma_{min} = 0` },
          { t: 'The absolute max shear comes from the largest of the three Mohr circles:', m: R`\tau_{abs} = \frac{\sigma_{max} - \sigma_{min}}{2} = \frac{${fm(s1, 4)} - 0}{2} = ${fm(tabs, 4)}\ \text{ksi}` },
          { t: `The in-plane maximum (R = ${f(R0, 3)} ksi) would underestimate it. This matters for Tresca checks.` }
        ],
        distract: [R0, (s1 + s2) / 2, s1]
      };
    }
  });

  add({
    id: 'som-principal-angle', topic: 'som', sub: 'Stress types & transformations (Mohr)', title: 'Orientation of the principal planes', diff: 2, fig: 'mohr',
    gen(r) {
      const sx = r.pick([10, 15, 20, 25]), sy = r.pick([-10, -5, 0, 4]), txy = r.pick([4, 6, 8, 10]);
      const th = (0.5 * Math.atan2(2 * txy, sx - sy) * 180) / PI;
      return {
        prompt: `For σ<sub>x</sub> = <b>${sx} ksi</b>, σ<sub>y</sub> = <b>${sy} ksi</b> and τ<sub>xy</sub> = <b>${txy} ksi</b>, at what angle θ<sub>p</sub> (measured counterclockwise from the x-axis) does the maximum principal stress σ₁ act?`,
        answer: th, unit: '°',
        steps: [
          { t: 'Principal angle from the transformation equations:', m: R`\tan 2\theta_p = \frac{2\tau_{xy}}{\sigma_x - \sigma_y} = \frac{2(${txy})}{${sx} - (${sy})} = ${fm((2 * txy) / (sx - sy), 4)}` },
          { t: 'Since σ<sub>x</sub> &gt; σ<sub>y</sub> and τ<sub>xy</sub> &gt; 0, 2θ<sub>p</sub> is in the first quadrant and gives σ₁:', m: R`\theta_p = \tfrac12\tan^{-1}(${fm((2 * txy) / (sx - sy), 4)}) = ${fm(th, 4)}^\circ` },
          { t: 'The other principal plane (σ₂) is 90° away, and the maximum-shear planes are at ±45° from these.' }
        ],
        distract: [2 * th, th + 45, (Math.atan((2 * txy) / (sx - sy)) * 180) / PI / 1 + 90]
      };
    }
  });

  add({
    id: 'som-vm-plane', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'von Mises factor of safety for plane stress', diff: 2,
    gen(r) {
      const sx = r.pick([20, 30, 40, -20]), sy = r.pick([-15, -10, 10, 15]), txy = r.pick([8, 12, 15, 20]), Sy = r.pick([50, 60, 80, 100]);
      const vm = Math.sqrt(sx * sx - sx * sy + sy * sy + 3 * txy * txy), n = Sy / vm;
      const c = (sx + sy) / 2, R0 = Math.sqrt(((sx - sy) / 2) ** 2 + txy ** 2), s1 = c + R0, s2 = c - R0;
      const tr = Sy / (Math.max(s1, s2, 0) - Math.min(s1, s2, 0));
      return {
        prompt: `A ductile steel part (S<sub>y</sub> = <b>${Sy} ksi</b>) has a plane stress state σ<sub>x</sub> = <b>${sx} ksi</b>, σ<sub>y</sub> = <b>${sy} ksi</b>, τ<sub>xy</sub> = <b>${txy} ksi</b>. Using the distortion-energy theory, what is the factor of safety against yielding?`,
        answer: n, unit: '',
        steps: [
          { t: 'von Mises equivalent stress for general plane stress:', m: R`\sigma' = \sqrt{\sigma_x^2 - \sigma_x\sigma_y + \sigma_y^2 + 3\tau_{xy}^2} = \sqrt{${sx}^2 - (${sx})(${sy}) + (${sy})^2 + 3(${txy})^2} = ${fm(vm, 4)}\ \text{ksi}` },
          { t: 'Factor of safety:', m: R`n = \frac{S_y}{\sigma'} = \frac{${Sy}}{${fm(vm, 4)}} = ${fm(n, 3)}` },
          { t: `Tresca would give ${f(tr, 3)}, which is the same or more conservative.` }
        ],
        distract: [tr, Sy / Math.sqrt(sx * sx + sy * sy + 3 * txy * txy), Sy / Math.max(Math.abs(s1), Math.abs(s2))]
      };
    }
  });

  add({
    id: 'som-coulomb-mohr', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'Brittle material — Coulomb–Mohr factor of safety', diff: 3,
    gen(r) {
      const Sut = r.pick([25, 30, 35, 40]), Suc = Sut * r.pick([3, 3.5, 4]), s1 = r.pick([6, 8, 10, 12]), s3 = -r.pick([10, 15, 20, 30]);
      const n = 1 / (s1 / Sut - s3 / Suc);
      return {
        prompt: `A gray cast-iron bracket (S<sub>ut</sub> = <b>${Sut} ksi</b>, S<sub>uc</sub> = <b>${f(Suc)} ksi</b>) has principal stresses σ₁ = <b>${s1} ksi</b> and σ₃ = <b>${s3} ksi</b> (σ₂ = 0) at its critical point. Using the Coulomb–Mohr (internal friction) theory, what is the factor of safety?`,
        answer: n, unit: '',
        steps: [
          { t: 'Cast iron is brittle and much stronger in compression, so ductile theories don\'t apply. With σ₁ ≥ 0 ≥ σ₃, Coulomb–Mohr gives:', m: R`\frac{1}{n} = \frac{\sigma_1}{S_{ut}} - \frac{\sigma_3}{S_{uc}}` },
          { t: 'Evaluate (σ₃ is negative, so the second term adds).', m: R`\frac{1}{n} = \frac{${s1}}{${Sut}} - \frac{${s3}}{${f(Suc)}} = ${fm(1 / n, 4)} \;\Rightarrow\; n = ${fm(n, 3)}` }
        ],
        distract: [Sut / s1, Suc / Math.abs(s3), 1 / (s1 / Sut + Math.abs(s3) / Sut)]
      };
    }
  });

  add({
    id: 'som-soderberg', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'Fatigue factor of safety — Soderberg line', diff: 2,
    gen(r) {
      const Sy = r.pick([60, 70, 80]), Sut = Sy + r.pick([15, 20, 30]), Se = +(Sut * r.pick([0.3, 0.35, 0.4])).toFixed(1);
      const smax = r.pick([25, 30, 35]), smin = r.pick([0, 5, 10]);
      const sa = (smax - smin) / 2, sm = (smax + smin) / 2, n = 1 / (sa / Se + sm / Sy), ng = 1 / (sa / Se + sm / Sut);
      return {
        prompt: `A steel part (S<sub>y</sub> = <b>${Sy} ksi</b>, S<sub>ut</sub> = <b>${Sut} ksi</b>, corrected S<sub>e</sub> = <b>${Se} ksi</b>) has a stress (including K<sub>f</sub>) that fluctuates between <b>${smin}</b> and <b>${smax} ksi</b>. Using the Soderberg criterion, what is the fatigue factor of safety?`,
        answer: n, unit: '',
        steps: [
          { t: 'Alternating and mean components:', m: R`\sigma_a = ${fm(sa, 4)}\ \text{ksi} \qquad \sigma_m = ${fm(sm, 4)}\ \text{ksi}` },
          { t: 'Soderberg uses the yield strength on the mean-stress axis, which also guards against first-cycle yielding:', m: R`\frac1n = \frac{\sigma_a}{S_e} + \frac{\sigma_m}{S_y} = \frac{${fm(sa, 4)}}{${Se}} + \frac{${fm(sm, 4)}}{${Sy}} = ${fm(1 / n, 4)} \;\Rightarrow\; n = ${fm(n, 3)}` },
          { t: `Modified Goodman would give ${f(ng, 3)}, which is less conservative.` }
        ],
        distract: [ng, Se / sa, Sy / smax]
      };
    }
  });

  add({
    id: 'som-sn-life', topic: 'som', sub: 'Failure theories (static & fatigue)', title: 'Finite fatigue life from the S–N curve', diff: 3, video: true,
    gen(r) {
      const Sut = r.pick([80, 90, 105, 120]), Se = +(Sut * r.pick([0.35, 0.4, 0.45])).toFixed(1), fr = 0.9;
      const sa = +(r.range(Se * 1.1, fr * Sut * 0.95, 0.5)).toFixed(1);
      const a = (fr * Sut) ** 2 / Se, b = -(1 / 3) * Math.log10((fr * Sut) / Se), N = Math.pow(sa / a, 1 / b);
      return {
        prompt: `A rotating steel shaft (S<sub>ut</sub> = <b>${Sut} ksi</b>, corrected S<sub>e</sub> = <b>${Se} ksi</b>) sees a fully reversed stress of <b>${sa} ksi</b>. Using the Shigley S–N line between 10³ and 10⁶ cycles with fatigue strength fraction f = 0.9, estimate the life in cycles.`,
        answer: N, unit: 'cycles', tol: 0.04,
        steps: [
          { t: 'The S–N line S<sub>f</sub> = aN<sup>b</sup> passes through (10³, fS<sub>ut</sub>) and (10⁶, S<sub>e</sub>):', m: R`a = \frac{(fS_{ut})^2}{S_e} = \frac{(0.9\cdot${Sut})^2}{${Se}} = ${fm(a, 4)}\ \text{ksi} \qquad b = -\tfrac13\log\frac{fS_{ut}}{S_e} = ${fm(b, 4)}` },
          { t: 'Solve the line for N at the applied stress:', m: R`N = \left(\frac{\sigma_a}{a}\right)^{1/b} = \left(\frac{${sa}}{${fm(a, 4)}}\right)^{1/(${fm(b, 4)})} = ${fm(N, 3)}\ \text{cycles}` },
          { t: 'σ<sub>a</sub> is above S<sub>e</sub>, so the life is finite (between 10³ and 10⁶ cycles).' }
        ],
        distract: [Math.pow(sa / a, b), N * 10, Math.pow(sa / ((Sut ** 2) / Se), 1 / b)]
      };
    }
  });

  add({
    id: 'som-miner', topic: 'som', sub: 'Failure theories (static & fatigue)', title: "Remaining life by Miner's rule", diff: 2,
    gen(r) {
      const N1 = r.pick([2e4, 5e4, 8e4]), N2 = r.pick([1e5, 2e5, 3e5]), N3 = r.pick([5e5, 8e5, 1e6]);
      const n1 = Math.round(N1 * r.pick([0.2, 0.25, 0.3])), n2 = Math.round(N2 * r.pick([0.2, 0.3, 0.4]));
      const used = n1 / N1 + n2 / N2, n3 = (1 - used) * N3;
      return {
        prompt: `A component has fatigue lives of N₁ = <b>${f(N1, 5)}</b>, N₂ = <b>${f(N2, 6)}</b> and N₃ = <b>${f(N3, 7)}</b> cycles at three stress levels. It has already seen <b>${f(n1, 6)}</b> cycles at level 1 and <b>${f(n2, 6)}</b> cycles at level 2. Using Miner's rule, how many more cycles can it take at level 3?`,
        answer: n3, unit: 'cycles',
        steps: [
          { t: "Miner's rule: failure when the damage fractions sum to 1.", m: R`\sum\frac{n_i}{N_i} = 1` },
          { t: 'Damage used so far:', m: R`D = \frac{${n1}}{${N1}} + \frac{${n2}}{${N2}} = ${fm(n1 / N1, 4)} + ${fm(n2 / N2, 4)} = ${fm(used, 4)}` },
          { t: 'Remaining cycles at level 3:', m: R`n_3 = (1 - D)N_3 = (1 - ${fm(used, 4)})(${N3}) = ${fm(n3, 4)}\ \text{cycles}` }
        ],
        distract: [N3 - n1 - n2, used * N3, (1 - n1 / N1) * N3]
      };
    }
  });

  add({
    id: 'som-johnson', topic: 'som', sub: 'Failure modes (buckling, creep, fracture)', title: 'Intermediate column — Johnson formula', diff: 3, video: true, fig: 'column',
    gen(r) {
      const d = r.pick([1.5, 2, 2.5]), Sy = r.pick([36, 50, 60]), E = 30e6, K = 1;
      const rg = d / 4, trans = Math.sqrt((2 * PI * PI * E) / (Sy * 1000));
      const L = Math.round((r.pick([0.4, 0.5, 0.6, 0.7]) * trans * rg) / 0.5) * 0.5;
      const sl = (K * L) / rg, A = (PI * d * d) / 4;
      const Pcr = A * (Sy * 1000 - ((Sy * 1000 * sl) / (2 * PI)) ** 2 / E), Peuler = (PI * PI * E * ((PI * d ** 4) / 64)) / (L * L);
      return {
        prompt: `A pinned-pinned solid round steel strut (E = 30×10⁶ psi, S<sub>y</sub> = <b>${Sy} ksi</b>) is <b>${d} in</b> in diameter and <b>${L} in</b> long. What is its critical buckling load?`,
        answer: Pcr, unit: 'lbf',
        fig: { name: 'column', data: { L: `${L} in` } },
        steps: [
          { t: 'Slenderness ratio (r = d/4 for a solid circle):', m: R`\frac{KL}{r} = \frac{1(${L})}{${fm(rg, 4)}} = ${fm(sl, 4)}` },
          { t: 'Transition slenderness between the Johnson and Euler regions:', m: R`\left(\frac{KL}{r}\right)_1 = \sqrt{\frac{2\pi^2E}{S_y}} = ${fm(trans, 4)}` },
          { t: 'KL/r is below the transition, so this is an <b>intermediate</b> column: use Johnson. (Euler would give an unconservative ' + f(Peuler, 3) + ' lbf.)', m: R`\frac{P_{cr}}{A} = S_y - \left(\frac{S_y}{2\pi}\frac{KL}{r}\right)^2\frac{1}{E}` },
          { t: 'Evaluate.', m: R`P_{cr} = ${fm(A, 4)}\left[${Sy * 1000} - \left(\frac{${Sy * 1000}(${fm(sl, 4)})}{2\pi}\right)^2\frac{1}{30\times10^6}\right] = ${fm(Pcr, 4)}\ \text{lbf}` }
        ],
        distract: [Peuler, A * Sy * 1000, A * (Sy * 1000 - ((Sy * 1000 * sl) / PI) ** 2 / E)]
      };
    }
  });

  add({
    id: 'som-euler-size', topic: 'som', sub: 'Failure modes (buckling, creep, fracture)', title: 'Diameter of a long column for a design load', diff: 3, fig: 'column',
    gen(r) {
      const Pl = r.pick([2000, 3000, 5000, 8000]), L = r.pick([60, 72, 96, 120]), n = r.pick([2, 2.5, 3]), E = 30e6;
      const end = r.pick([{ t: 'pinned at both ends', K: 1 }, { t: 'fixed at the base and free at the top', K: 2 }]);
      const Le = end.K * L, d = Math.pow((64 * n * Pl * Le * Le) / (PI ** 3 * E), 0.25);
      return {
        prompt: `A solid round steel column (E = 30×10⁶ psi), <b>${L} in</b> long and <b>${end.t}</b>, must support <b>${f(Pl, 5)} lbf</b> with a buckling factor of safety of <b>${n}</b>. Assuming Euler buckling governs, what minimum diameter is required?`,
        answer: d, unit: 'in',
        fig: { name: 'column', data: { L: `${L} in` } },
        steps: [
          { t: `Effective length (K = ${end.K}) and required critical load:`, m: R`L_e = ${Le}\ \text{in} \qquad P_{cr} = nP = ${n}(${Pl}) = ${fm(n * Pl, 4)}\ \text{lbf}` },
          { t: 'Set Euler P<sub>cr</sub> = π²EI/L<sub>e</sub>² with I = πd⁴/64 and solve for d:', m: R`d = \left(\frac{64\,nP\,L_e^2}{\pi^3E}\right)^{1/4} = \left(\frac{64(${fm(n * Pl, 4)})(${Le})^2}{\pi^3(30\times10^6)}\right)^{1/4} = ${fm(d, 4)}\ \text{in}` },
          { t: `Check that it's really long: L<sub>e</sub>/r = ${f(Le / (d / 4), 3)}, which should exceed the transition slenderness (≈ 109 for S<sub>y</sub> = 50 ksi).` }
        ],
        distract: [Math.pow((64 * Pl * Le * Le) / (PI ** 3 * E), 0.25), Math.pow((64 * n * Pl * L * L) / (PI ** 3 * E), 0.25), Math.pow((32 * n * Pl * Le * Le) / (PI ** 3 * E), 0.25)]
      };
    }
  });

  add({
    id: 'som-kic', topic: 'som', sub: 'Failure modes (buckling, creep, fracture)', title: 'Critical crack size from fracture toughness', diff: 2,
    gen(r) {
      const KIc = r.pick([25, 40, 60, 80]), s = r.pick([30, 40, 50, 60]), Y = r.pick([1, 1.12]);
      const a = Math.pow(KIc / (Y * s), 2) / PI;
      return {
        prompt: `A high-strength steel plate (K<sub>Ic</sub> = <b>${KIc} ksi·√in</b>) carries a nominal tensile stress of <b>${s} ksi</b>. For a ${Y === 1 ? 'through-thickness center crack in a wide plate (Y = 1.0)' : 'edge crack (Y = 1.12)'}, what crack size a will cause fracture?`,
        answer: a, unit: 'in',
        steps: [
          { t: 'Fracture occurs when the stress intensity reaches the plane-strain toughness:', m: R`K_I = Y\sigma\sqrt{\pi a} = K_{Ic}` },
          { t: 'Solve for the critical crack size a:', m: R`a_c = \frac{1}{\pi}\left(\frac{K_{Ic}}{Y\sigma}\right)^2 = \frac{1}{\pi}\left(\frac{${KIc}}{${Y}(${s})}\right)^2 = ${fm(a, 4)}\ \text{in}` },
          { t: 'For a center crack, a is the half-length, so the total crack is 2a. Inspection intervals are set so cracks are found well before a<sub>c</sub>.' }
        ],
        distract: [Math.pow(KIc / (Y * s), 2), 2 * a, KIc / (Y * s * Math.sqrt(PI))]
      };
    }
  });

  add({
    id: 'som-cant-round', topic: 'som', sub: 'Load types (axial, bending, torsion, shear)', title: 'Bending stress in a cantilevered round pin', diff: 1, fig: 'cantilever',
    gen(r) {
      const Pl = r.pick([200, 400, 600, 1000]), L = r.pick([2, 3, 4, 6]), d = r.pick([0.5, 0.75, 1]);
      const M = Pl * L, s = (32 * M) / (PI * d ** 3);
      return {
        prompt: `A <b>${d} in</b> diameter steel pin is cantilevered from a bracket and carries <b>${Pl} lbf</b> at <b>${L} in</b> from the support. What is the maximum bending stress?`,
        answer: s, unit: 'psi',
        fig: { name: 'cantilever', data: { P: `${Pl} lbf`, L: `${L} in` } },
        steps: [
          { t: 'Maximum moment at the fixed support:', m: R`M = PL = ${Pl}(${L}) = ${fm(M, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'For a solid round section, S = πd³/32:', m: R`\sigma = \frac{32M}{\pi d^3} = \frac{32(${fm(M, 4)})}{\pi(${d})^3} = ${fm(s, 4)}\ \text{psi}` }
        ],
        distract: [(16 * M) / (PI * d ** 3), (32 * M) / (PI * d ** 4), (32 * Pl) / (PI * d ** 3)]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
