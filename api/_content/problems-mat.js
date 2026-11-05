/* Material Properties — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const MATS = [
    { name: 'steel', E: 30e6, a: 6.5e-6 },
    { name: 'aluminum', E: 10e6, a: 12.8e-6 },
    { name: 'brass', E: 15e6, a: 10.4e-6 }
  ];

  add({
    id: 'mat-thermal-free', topic: 'mat', sub: 'Physical properties', title: 'Free thermal expansion of a bar', diff: 1,
    gen(r) {
      const m = r.pick(MATS), L = r.pick([24, 48, 72, 120]), dT = r.pick([80, 120, 200, 300]);
      const d = m.a * L * dT;
      return {
        prompt: `A <b>${L} in</b> ${m.name} rod (α = ${f(m.a * 1e6)}×10⁻⁶ /°F) is free to expand. How much longer does it get when heated by <b>${dT} °F</b>?`,
        answer: d, unit: 'in',
        steps: [
          { t: 'Unrestrained thermal strain produces no stress, only elongation:', m: R`\delta = \alpha L\Delta T = (${fm(m.a)})(${L})(${dT}) = ${fm(d, 4)}\ \text{in}` }
        ],
        distract: [m.a * dT, d * 12, m.E * m.a * dT]
      };
    }
  });

  add({
    id: 'mat-thermal-gap', topic: 'mat', sub: 'Physical properties', title: 'Thermal stress after a gap closes', diff: 2,
    gen(r) {
      const m = r.pick(MATS), L = r.pick([48, 60, 96, 120]), dT = r.pick([100, 150, 200]);
      const free = m.a * L * dT, g = +(free * r.pick([0.25, 0.4, 0.5, 0.6])).toFixed(4);
      const s = (m.E * (free - g)) / L;
      return {
        prompt: `A <b>${L} in</b> ${m.name} rail (E = ${f(m.E / 1e6)}×10⁶ psi, α = ${f(m.a * 1e6)}×10⁻⁶ /°F) is installed with a <b>${g} in</b> gap between its end and a rigid stop. It is then heated by <b>${dT} °F</b>. What compressive stress develops in the rail?`,
        answer: s, unit: 'psi',
        steps: [
          { t: 'Free expansion if unrestrained:', m: R`\delta_T = \alpha L\Delta T = ${fm(free, 4)}\ \text{in}` },
          { t: `The free expansion exceeds the gap (${g} in), so the stop is reached. The excess must be suppressed elastically:`, m: R`\delta_{excess} = ${fm(free, 4)} - ${g} = ${fm(free - g, 4)}\ \text{in}` },
          { t: 'Stress needed to compress the bar by the excess:', m: R`\sigma = \frac{E\,\delta_{excess}}{L} = \frac{${fm(m.E)}(${fm(free - g, 4)})}{${L}} = ${fm(s, 4)}\ \text{psi}` }
        ],
        distract: [m.E * m.a * dT, (m.E * g) / L, (m.E * free) / L / 2]
      };
    }
  });

  add({
    id: 'mat-bimetal', topic: 'mat', sub: 'Physical properties', title: 'Steel bolt clamping an aluminum sleeve — heating', diff: 3, video: true,
    gen(r) {
      const db = r.pick([0.5, 0.625, 0.75]), Do = r.pick([1.25, 1.5]), Di = db + 0.0625, dT = r.pick([100, 150, 200]);
      const Es = 30e6, as = 6.5e-6, Ea = 10e6, aa = 12.8e-6;
      const As = (PI * db * db) / 4, Aa = (PI * (Do * Do - Di * Di)) / 4;
      const F = ((aa - as) * dT) / (1 / (As * Es) + 1 / (Aa * Ea)), sb = F / As;
      return {
        prompt: `A <b>${db} in</b> steel bolt (E = 30×10⁶ psi, α = 6.5×10⁻⁶ /°F) passes through an aluminum sleeve (E = 10×10⁶ psi, α = 12.8×10⁻⁶ /°F, OD <b>${Do} in</b>, ID <b>${f(Di, 4)} in</b>) of the same length. The nut is snug (zero preload) at room temperature. The assembly is heated <b>${dT} °F</b>. What tensile stress develops in the bolt?`,
        answer: sb, unit: 'psi',
        steps: [
          { t: 'Areas (use the shank area for the bolt):', m: R`A_s = ${fm(As, 4)}\ \text{in}^2 \qquad A_a = \frac{\pi(${Do}^2 - ${f(Di, 4)}^2)}{4} = ${fm(Aa, 4)}\ \text{in}^2` },
          { t: 'Aluminum wants to grow more than steel, so the sleeve pushes the bolt into tension (force F) and the bolt squeezes the sleeve (same F, compression). Compatibility: both end up with the same length.', m: R`\alpha_aL\Delta T - \frac{FL}{A_aE_a} = \alpha_sL\Delta T + \frac{FL}{A_sE_s}` },
          { t: 'Solve for F (L cancels):', m: R`F = \frac{(\alpha_a - \alpha_s)\Delta T}{\frac{1}{A_sE_s} + \frac{1}{A_aE_a}} = \frac{(${fm(aa - as)})(${dT})}{${fm(1 / (As * Es), 4)} + ${fm(1 / (Aa * Ea), 4)}} = ${fm(F, 4)}\ \text{lbf}` },
          { t: 'Bolt stress:', m: R`\sigma_b = \frac{F}{A_s} = ${fm(sb, 4)}\ \text{psi}` }
        ],
        distract: [Es * (aa - as) * dT, ((aa - as) * dT * As * Es) / As, (Ea * (aa - as) * dT)]
      };
    }
  });

  add({
    id: 'mat-resilience', topic: 'mat', sub: 'Mechanical properties', title: 'Modulus of resilience', diff: 1,
    gen(r) {
      const m = r.pick([{ n: 'spring steel', Sy: 160, E: 30 }, { n: 'structural steel', Sy: 36, E: 29 }, { n: '7075-T6 aluminum', Sy: 73, E: 10.4 }, { n: 'Ti-6Al-4V', Sy: 128, E: 16.5 }]);
      const Ur = (m.Sy * 1000) ** 2 / (2 * m.E * 1e6);
      return {
        prompt: `What is the modulus of resilience of <b>${m.n}</b> (S<sub>y</sub> = <b>${m.Sy} ksi</b>, E = <b>${m.E}×10⁶ psi</b>)?`,
        answer: Ur, unit: 'in·lbf/in³',
        steps: [
          { t: 'Resilience is the elastic strain energy per unit volume at yield, the area under the linear part of the stress–strain curve:', m: R`U_r = \tfrac12 S_y\varepsilon_y = \frac{S_y^2}{2E}` },
          { t: 'Evaluate.', m: R`U_r = \frac{(${m.Sy * 1000})^2}{2(${m.E}\times10^6)} = ${fm(Ur, 4)}\ \text{in}\cdot\text{lbf/in}^3` },
          { t: 'High-strength, low-modulus materials store the most elastic energy. That’s why springs use high-strength steels.' }
        ],
        distract: [(m.Sy * 1000) ** 2 / (m.E * 1e6), (m.Sy * 1000) / (2 * m.E * 1e6), Ur / 12]
      };
    }
  });

  add({
    id: 'mat-ductility', topic: 'mat', sub: 'Mechanical properties', title: 'Percent reduction of area from a tensile test', diff: 1,
    gen(r) {
      const d0 = r.pick([0.505, 0.5]), df = +(d0 * r.pick([0.55, 0.65, 0.75, 0.85])).toFixed(3), L0 = 2, Lf = +(L0 * (1 + r.pick([0.12, 0.2, 0.28, 0.35]))).toFixed(2);
      const RA = (1 - (df / d0) ** 2) * 100, EL = ((Lf - L0) / L0) * 100;
      return {
        prompt: `A standard tensile specimen with an initial diameter of <b>${d0} in</b> and a <b>${L0} in</b> gauge length fractures with a final neck diameter of <b>${df} in</b> and a final gauge length of <b>${Lf} in</b>. What is the percent reduction of area?`,
        answer: RA, unit: '%',
        steps: [
          { t: 'Reduction of area compares the original and final cross-sections:', m: R`\%RA = \frac{A_0 - A_f}{A_0}\times100 = \left[1 - \left(\frac{d_f}{d_0}\right)^2\right]\times100` },
          { t: 'Evaluate.', m: R`\%RA = \left[1 - \left(\frac{${df}}{${d0}}\right)^2\right]\times100 = ${fm(RA, 4)}\%` },
          { t: `Percent elongation would be (L<sub>f</sub> − L₀)/L₀ = ${f(EL, 3)}%. Both are ductility measures.` }
        ],
        distract: [(1 - df / d0) * 100, EL, (df / d0) ** 2 * 100]
      };
    }
  });

  add({
    id: 'mat-modulus-test', topic: 'mat', sub: 'Mechanical properties', title: 'Elastic modulus from tensile test data', diff: 1,
    gen(r) {
      const d = 0.505, A = (PI * d * d) / 4, L = 2, m = r.pick(MATS), Pl = r.pick([3000, 4000, 5000, 6000]);
      const dl = +((Pl / A / m.E) * L).toFixed(5), E = (Pl / A) / (dl / L);
      return {
        prompt: `In the elastic range, a <b>${d} in</b> diameter specimen with a <b>${L} in</b> gauge length elongates <b>${dl} in</b> under a load of <b>${f(Pl, 5)} lbf</b>. What is the modulus of elasticity?`,
        answer: E / 1e6, unit: '×10⁶ psi',
        steps: [
          { t: 'Stress and strain:', m: R`\sigma = \frac{P}{A} = \frac{${Pl}}{${fm(A, 4)}} = ${fm(Pl / A, 4)}\ \text{psi} \qquad \varepsilon = \frac{\delta}{L} = \frac{${dl}}{${L}} = ${fm(dl / L, 4)}` },
          { t: 'Hooke’s law:', m: R`E = \frac{\sigma}{\varepsilon} = ${fm(E, 4)}\ \text{psi} = ${fm(E / 1e6, 4)}\times10^6\ \text{psi}` },
          { t: `That matches ${m.name}.` }
        ],
        distract: [(Pl / A / dl) / 1e6, (Pl / (PI * d * d) / (dl / L)) / 1e6, ((Pl / A) / (dl / L)) / 1e6 / 2]
      };
    }
  });

  add({
    id: 'mat-true-strain-area', topic: 'mat', sub: 'Mechanical properties', title: 'True strain at fracture from area reduction', diff: 2,
    gen(r) {
      const RA = r.pick([0.3, 0.45, 0.6, 0.7]), A0 = r.pick([0.2, 0.196]), Af = A0 * (1 - RA);
      const et = Math.log(A0 / Af);
      return {
        prompt: `A ductile steel bar necks and fractures with a <b>${Math.round(RA * 100)}%</b> reduction of area. What is the true strain at fracture (in the neck)?`,
        answer: et, unit: '',
        steps: [
          { t: 'Plastic deformation conserves volume, so in the neck the true strain can be found from the area ratio:', m: R`\varepsilon_T = \ln\frac{L}{L_0} = \ln\frac{A_0}{A}` },
          { t: 'With A<sub>f</sub> = (1 − RA)A₀:', m: R`\varepsilon_f = \ln\frac{1}{1 - RA} = \ln\frac{1}{1 - ${RA}} = ${fm(et, 4)}` },
          { t: 'The ln(1 + ε) formula only applies before necking. After necking, use areas.' }
        ],
        distract: [RA, Math.log(1 + RA), RA / (1 - RA)]
      };
    }
  });

  add({
    id: 'mat-flow-stress', topic: 'mat', sub: 'Heat treatment & processing effects', title: 'Flow stress of a strain-hardening metal', diff: 2,
    gen(r) {
      const m = r.pick([{ n: 'annealed 1020 steel', K: 77, nn: 0.26 }, { n: '304 stainless steel', K: 185, nn: 0.45 }, { n: 'annealed copper', K: 46, nn: 0.54 }, { n: '6061-O aluminum', K: 30, nn: 0.2 }]);
      const e = r.pick([0.05, 0.1, 0.2, 0.3, 0.5]), s = m.K * e ** m.nn;
      return {
        prompt: `For <b>${m.n}</b>, the true stress–strain curve in the plastic range follows σ = Kεⁿ with K = <b>${m.K} ksi</b> and n = <b>${m.nn}</b>. What true stress is required to deform it to a true strain of <b>${e}</b> (e.g., in a cold-forming operation)?`,
        answer: s, unit: 'ksi',
        steps: [
          { t: 'Hollomon power law:', m: R`\sigma_T = K\varepsilon_T^n = ${m.K}(${e})^{${m.nn}}` },
          { t: 'Evaluate.', m: R`\sigma_T = ${fm(s, 4)}\ \text{ksi}` },
          { t: 'The exponent n is the strain-hardening exponent. Necking in tension begins when the true strain equals n, so a larger n means more uniform elongation and better formability.' }
        ],
        distract: [m.K * e, m.K * m.nn * e, m.K * Math.pow(e, 1 / m.nn)]
      };
    }
  });

  add({
    id: 'mat-lever-rule', topic: 'mat', sub: 'Heat treatment & processing effects', title: 'Lever rule — fraction of pearlite in a slowly cooled steel', diff: 3, video: true,
    gen(r) {
      const C = r.pick([0.2, 0.3, 0.4, 0.45, 0.6]);
      const fp = (C - 0.022) / (0.76 - 0.022), fa = 1 - fp;
      return {
        prompt: `A plain-carbon steel with <b>${C}% C</b> is slowly cooled (equilibrium) to just below the eutectoid temperature (727 °C). Using the Fe–Fe₃C diagram (eutectoid at 0.76% C; maximum carbon in ferrite 0.022% C), what mass fraction of the microstructure is pearlite?`,
        answer: fp * 100, unit: '%',
        steps: [
          { t: `A hypoeutectoid steel (&lt; 0.76% C) forms proeutectoid ferrite first. Just above 727 °C, the remaining austenite has the eutectoid composition, and all of it transforms to pearlite.`, m: R`\text{tie line: } \alpha\ (0.022\%\text{C}) \;\longleftrightarrow\; \gamma\ (0.76\%\text{C})` },
          { t: 'Lever rule (the fraction of a phase is the opposite lever arm over the total):', m: R`W_{pearlite} = \frac{C_0 - 0.022}{0.76 - 0.022} = \frac{${C} - 0.022}{0.738} = ${fm(fp, 4)}` },
          { t: `So ${f(fp * 100, 3)}% pearlite and ${f(fa * 100, 3)}% proeutectoid ferrite. More carbon gives more pearlite, which means higher strength and lower ductility.`, m: R`W_p = ${fm(fp * 100, 4)}\%` }
        ],
        distract: [(C / 0.76) * 100, fa * 100, ((C - 0.022) / (6.7 - 0.022)) * 100]
      };
    }
  });

  add({
    id: 'mat-corrosion-rate', topic: 'mat', sub: 'Chemical properties & corrosion', title: 'Corrosion rate from coupon weight loss', diff: 2,
    gen(r) {
      const m = r.pick([{ n: 'carbon steel', rho: 7.86 }, { n: 'aluminum', rho: 2.7 }, { n: 'brass', rho: 8.5 }]);
      const W = r.pick([150, 250, 400, 800]), A = r.pick([4, 6, 10]), t = r.pick([500, 720, 1000, 2000]);
      const mpy = (534 * W) / (m.rho * A * t);
      return {
        prompt: `A <b>${m.n}</b> coupon (density <b>${m.rho} g/cm³</b>) with an exposed area of <b>${A} in²</b> loses <b>${W} mg</b> after <b>${t} h</b> in a cooling-water test loop. What is the corrosion rate in mils per year (mpy)?`,
        answer: mpy, unit: 'mpy',
        steps: [
          { t: 'Standard weight-loss formula (ASTM G31 form) with W in mg, ρ in g/cm³, A in in² and t in hours:', m: R`\text{mpy} = \frac{534\,W}{\rho A t}` },
          { t: 'Evaluate.', m: R`\text{mpy} = \frac{534(${W})}{${m.rho}(${A})(${t})} = ${fm(mpy, 4)}\ \text{mpy}` },
          { t: 'Rough guide for steels: &lt; 1 mpy outstanding, 1–5 excellent, 5–20 good, 20–50 fair, &gt; 50 poor.' }
        ],
        distract: [(534 * W) / (A * t), (W * 8.76) / (m.rho * A * t), mpy * 25.4]
      };
    }
  });

  add({
    id: 'mat-composite', topic: 'mat', sub: 'Mechanical properties', title: 'Longitudinal modulus of a fiber composite (rule of mixtures)', diff: 2,
    gen(r) {
      const fib = r.pick([{ n: 'carbon', E: 33 }, { n: 'E-glass', E: 10.5 }, { n: 'aramid (Kevlar)', E: 18 }]), Em = r.pick([0.4, 0.5]), Vf = r.pick([0.4, 0.5, 0.6]);
      const Ec = Vf * fib.E + (1 - Vf) * Em, Et = 1 / (Vf / fib.E + (1 - Vf) / Em);
      return {
        prompt: `A unidirectional ${fib.n}–epoxy laminate has a fiber volume fraction of <b>${Vf}</b>. The fiber modulus is <b>${fib.E}×10⁶ psi</b> and the epoxy modulus is <b>${Em}×10⁶ psi</b>. What is the composite modulus parallel to the fibers?`,
        answer: Ec, unit: '×10⁶ psi',
        steps: [
          { t: 'Loading parallel to the fibers is iso-strain: fibers and matrix stretch together, so the moduli average by volume fraction:', m: R`E_\parallel = V_fE_f + V_mE_m` },
          { t: 'Evaluate.', m: R`E_\parallel = ${Vf}(${fib.E}) + ${1 - Vf}(${Em}) = ${fm(Ec, 4)}\times10^6\ \text{psi}` },
          { t: `Transverse (iso-stress) loading is far weaker: 1/E⊥ = V<sub>f</sub>/E<sub>f</sub> + V<sub>m</sub>/E<sub>m</sub> gives ${f(Et, 3)}×10⁶ psi.` }
        ],
        distract: [Et, Vf * fib.E, (fib.E + Em) / 2]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
