/* Joints & Fasteners — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const BOLTS = [
    { s: '3/8-16 UNC', d: 0.375, At: 0.0775 }, { s: '1/2-13 UNC', d: 0.5, At: 0.1419 },
    { s: '5/8-11 UNC', d: 0.625, At: 0.226 }, { s: '3/4-10 UNC', d: 0.75, At: 0.334 }
  ];
  const GRADES = [{ n: 'SAE grade 5', Sp: 85, Sut: 120, Se: 18.6 }, { n: 'SAE grade 8', Sp: 120, Sut: 150, Se: 23.2 }];

  /* ------------------------------- Bolted joints ------------------------------- */
  add({
    id: 'jf-bolt-group', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Eccentrically loaded bolt group', diff: 3, video: true,
    gen(r) {
      const s = r.pick([3, 4, 5, 6]), e = r.pick([8, 10, 12, 16]), Pl = r.pick([2000, 3000, 4000, 6000]);
      const rr = s / Math.SQRT2, F1 = Pl / 4, F2 = (Pl * e * rr) / (4 * rr * rr);
      const R0 = Math.sqrt(F1 * F1 + F2 * F2 + 2 * F1 * F2 * Math.cos(PI / 4));
      return {
        prompt: `A bracket is attached to a column by <b>four bolts</b> in a square pattern, <b>${s} in</b> on a side. A vertical load of <b>${f(Pl, 5)} lbf</b> acts <b>${e} in</b> horizontally from the centroid of the bolt group. What is the shear force on the most heavily loaded bolt?`,
        answer: R0, unit: 'lbf',
        steps: [
          { t: 'Replace the eccentric load with a force at the centroid plus a moment. Primary (direct) shear, shared equally:', m: R`F' = \frac{P}{n} = \frac{${Pl}}{4} = ${fm(F1, 4)}\ \text{lbf}\ (\text{downward on each bolt})` },
          { t: 'Each bolt is at the same distance from the centroid:', m: R`r = \frac{s}{\sqrt2} = ${fm(rr, 4)}\ \text{in} \qquad M = Pe = ${fm(Pl * e, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Secondary (moment) shear, perpendicular to each radius:', m: R`F'' = \frac{Mr}{\sum r_j^2} = \frac{${fm(Pl * e, 4)}(${fm(rr, 4)})}{4(${fm(rr, 4)})^2} = ${fm(F2, 4)}\ \text{lbf}` },
          { t: 'On the two bolts nearest the load, the secondary force has a downward component, at 45° to the primary force. Add the vectors:', m: R`F_{max} = \sqrt{F'^2 + F''^2 + 2F'F''\cos 45^\circ} = ${fm(R0, 4)}\ \text{lbf}` }
        ],
        distract: [F1 + F2, Math.sqrt(F1 * F1 + F2 * F2), F2]
      };
    }
  });

  add({
    id: 'jf-bolt-stiffness', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bolt stiffness with threaded and unthreaded lengths', diff: 3, fig: 'bolt',
    gen(r) {
      const b = r.pick(BOLTS), lt = r.pick([0.5, 0.75, 1]), ld = r.pick([0.75, 1, 1.5, 2]), E = 30e6;
      const Ad = (PI * b.d * b.d) / 4, kb = (Ad * b.At * E) / (Ad * lt + b.At * ld);
      return {
        prompt: `A <b>${b.s}</b> steel bolt (E = 30×10⁶ psi, A<sub>t</sub> = ${b.At} in²) clamps a joint. Within the grip, <b>${ld} in</b> of the shank is unthreaded and <b>${lt} in</b> is threaded. What is the bolt stiffness?`,
        answer: kb / 1e6, unit: '×10⁶ lbf/in',
        steps: [
          { t: 'Major-diameter (shank) area:', m: R`A_d = \frac{\pi(${b.d})^2}{4} = ${fm(Ad, 4)}\ \text{in}^2` },
          { t: 'The shank and threaded portions act like springs in series:', m: R`\frac{1}{k_b} = \frac{l_d}{A_dE} + \frac{l_t}{A_tE} \;\Rightarrow\; k_b = \frac{A_dA_tE}{A_dl_t + A_tl_d}` },
          { t: 'Evaluate.', m: R`k_b = \frac{${fm(Ad, 4)}(${b.At})(30\times10^6)}{${fm(Ad, 4)}(${lt}) + ${b.At}(${ld})} = ${fm(kb, 4)}\ \text{lbf/in}` }
        ],
        distract: [(Ad * E) / (lt + ld) / 1e6, (b.At * E) / (lt + ld) / 1e6, ((Ad + b.At) * E) / (lt + ld) / 1e6]
      };
    }
  });

  add({
    id: 'jf-separation', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Factor of safety against joint separation', diff: 2, fig: 'bolt',
    gen(r) {
      const kb = r.pick([2, 3, 4]), km = r.pick([8, 10, 12, 15]), Fi = r.pick([5000, 7000, 9000]), Pl = r.pick([3000, 4000, 5000, 6000]);
      const C = kb / (kb + km), n0 = Fi / (Pl * (1 - C));
      return {
        prompt: `A gasketless bolted joint has k<sub>b</sub> = <b>${kb}×10⁶ lbf/in</b> and k<sub>m</sub> = <b>${km}×10⁶ lbf/in</b>. Each bolt is preloaded to <b>${f(Fi, 5)} lbf</b> and carries an external separating load of <b>${f(Pl, 5)} lbf</b>. What is the factor of safety against joint separation?`,
        answer: n0, unit: '',
        steps: [
          { t: 'Joint constant:', m: R`C = \frac{k_b}{k_b + k_m} = ${fm(C, 4)}` },
          { t: 'The members carry the share (1 − C) of the external load, which relieves their compression. Separation occurs when that relief equals the preload:', m: R`n_0 = \frac{F_i}{P(1 - C)} = \frac{${Fi}}{${Pl}(1 - ${fm(C, 4)})} = ${fm(n0, 3)}` }
        ],
        distract: [Fi / Pl, Fi / (Pl * C), (Fi / (1 - C)) / (Pl * 2)]
      };
    }
  });

  add({
    id: 'jf-load-factor', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bolt load factor (overload to reach proof)', diff: 3, fig: 'bolt',
    gen(r) {
      const b = r.pick(BOLTS), g = r.pick(GRADES), C = r.pick([0.15, 0.2, 0.25, 0.3]), Pl = r.pick([1500, 2500, 3500]);
      const Fp = b.At * g.Sp * 1000, Fi = 0.75 * Fp, nL = (Fp - Fi) / (C * Pl);
      return {
        prompt: `A <b>${b.s}</b> ${g.n} bolt (S<sub>p</sub> = ${g.Sp} ksi, A<sub>t</sub> = ${b.At} in²) is preloaded to 75% of its proof load. The joint constant is C = <b>${C}</b> and the external load per bolt is <b>${f(Pl, 5)} lbf</b>. What is the load factor n<sub>L</sub>: the multiple of the external load that would bring the bolt to its proof load?`,
        answer: nL, unit: '',
        steps: [
          { t: 'Proof load and preload:', m: R`F_p = A_tS_p = ${fm(Fp, 4)}\ \text{lbf} \qquad F_i = 0.75F_p = ${fm(Fi, 4)}\ \text{lbf}` },
          { t: 'Bolt load under n<sub>L</sub>·P: F<sub>b</sub> = F<sub>i</sub> + C n<sub>L</sub> P. Set it equal to the proof load:', m: R`n_L = \frac{F_p - F_i}{CP} = \frac{${fm(Fp - Fi, 4)}}{${C}(${Pl})} = ${fm(nL, 3)}` },
          { t: `Compare the yield factor of safety n<sub>p</sub> = F<sub>p</sub>/(CP + F<sub>i</sub>) = ${f(Fp / (C * Pl + Fi), 3)}. It's close to 1 because the bolt is deliberately preloaded near proof.` }
        ],
        distract: [Fp / (C * Pl + Fi), (Fp - Fi) / Pl, Fp / (C * Pl)]
      };
    }
  });

  add({
    id: 'jf-bolt-fatigue', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Fatigue factor of safety of a preloaded bolt', diff: 3, video: true, fig: 'bolt',
    gen(r) {
      const b = r.pick(BOLTS), g = r.pick(GRADES), C = r.pick([0.2, 0.25, 0.3]), Pl = r.pick([2000, 3000, 4000, 5000]);
      const Fi = 0.75 * b.At * g.Sp * 1000;
      const sa = (C * Pl) / (2 * b.At) / 1000, si = Fi / b.At / 1000, sm = sa + si;
      const nf = (g.Se * (g.Sut - si)) / (g.Sut * sa + g.Se * (sm - si));
      return {
        prompt: `A <b>${b.s}</b> ${g.n} bolt with rolled threads (S<sub>ut</sub> = ${g.Sut} ksi, fully corrected endurance strength S<sub>e</sub> = ${g.Se} ksi, S<sub>p</sub> = ${g.Sp} ksi, A<sub>t</sub> = ${b.At} in²) is preloaded to 75% of proof. The external load per bolt cycles between <b>0 and ${f(Pl, 5)} lbf</b> and C = <b>${C}</b>. Using the Goodman criterion along the preload load line, find the fatigue factor of safety.`,
        answer: nf, unit: '',
        steps: [
          { t: 'Preload stress and the fluctuating part. The bolt only sees C·P of the external load:', m: R`\sigma_i = \frac{F_i}{A_t} = ${fm(si, 4)}\ \text{ksi} \qquad \sigma_a = \frac{CP}{2A_t} = ${fm(sa, 4)}\ \text{ksi} \qquad \sigma_m = \sigma_a + \sigma_i = ${fm(sm, 4)}\ \text{ksi}` },
          { t: 'The stress state starts at the preload, so the load line begins at (σ<sub>i</sub>, 0). Goodman factor of safety along that line (Shigley):', m: R`n_f = \frac{S_e(S_{ut} - \sigma_i)}{S_{ut}\sigma_a + S_e(\sigma_m - \sigma_i)}` },
          { t: 'Evaluate.', m: R`n_f = \frac{${g.Se}(${g.Sut} - ${fm(si, 4)})}{${g.Sut}(${fm(sa, 4)}) + ${g.Se}(${fm(sm - si, 4)})} = ${fm(nf, 3)}` },
          { t: 'Preload keeps σ<sub>a</sub> small (only C·P/2A<sub>t</sub>). That is why preloaded bolts survive fatigue despite the high mean stress.' }
        ],
        distract: [g.Se / sa, 1 / (sa / g.Se + sm / g.Sut), (g.Se * g.Sut) / (g.Sut * ((Pl / (2 * b.At)) / 1000) + g.Se * sm)]
      };
    }
  });

  add({
    id: 'jf-preload-stretch', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bolt elongation at preload', diff: 2, fig: 'bolt',
    gen(r) {
      const b = r.pick(BOLTS), g = r.pick(GRADES), kb = r.pick([2, 3, 4, 5]) * 1e6;
      const Fi = 0.75 * b.At * g.Sp * 1000, d = Fi / kb;
      return {
        prompt: `A <b>${b.s}</b> ${g.n} bolt (S<sub>p</sub> = ${g.Sp} ksi, A<sub>t</sub> = ${b.At} in²) with a stiffness of <b>${kb / 1e6}×10⁶ lbf/in</b> is preloaded to 75% of its proof load. How much does the bolt stretch?`,
        answer: d * 1000, unit: '×10⁻³ in (mils)',
        steps: [
          { t: 'Preload:', m: R`F_i = 0.75A_tS_p = 0.75(${b.At})(${g.Sp * 1000}) = ${fm(Fi, 4)}\ \text{lbf}` },
          { t: 'Elongation:', m: R`\delta = \frac{F_i}{k_b} = \frac{${fm(Fi, 4)}}{${fm(kb)}} = ${fm(d, 4)}\ \text{in} = ${fm(d * 1000, 4)}\ \text{mils}` },
          { t: 'Measuring bolt stretch, by micrometer or ultrasonic, sets the preload far more accurately than torque, which can scatter ±25% or more.' }
        ],
        distract: [(b.At * g.Sp * 1000) / kb * 1000, (0.9 * b.At * g.Sp * 1000) / kb * 1000, (Fi / kb) * 1000 * 12]
      };
    }
  });

  add({
    id: 'jf-plate-bearing', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Bearing stress on a bolted plate', diff: 1,
    gen(r) {
      const F = r.pick([6000, 9000, 12000, 18000]), n = r.pick([2, 3, 4]), d = r.pick([0.5, 0.625, 0.75]), t = r.pick([0.25, 0.375, 0.5]);
      const s = F / (n * d * t);
      return {
        prompt: `A lap joint carries <b>${f(F, 5)} lbf</b> through <b>${n}</b> bolts of <b>${d} in</b> diameter in a <b>${t} in</b> thick plate. Assuming the load is shared equally, what is the bearing stress between each bolt and the plate?`,
        answer: s, unit: 'psi',
        steps: [
          { t: 'Each bolt bears on a projected area d × t:', m: R`A_b = d\,t = ${d}(${t}) = ${fm(d * t, 4)}\ \text{in}^2` },
          { t: 'Bearing stress:', m: R`\sigma_b = \frac{F/n}{dt} = \frac{${F}/${n}}{${fm(d * t, 4)}} = ${fm(s, 4)}\ \text{psi}` }
        ],
        distract: [F / (n * ((PI * d * d) / 4)), F / (d * t), F / (n * PI * d * t)]
      };
    }
  });

  add({
    id: 'jf-rivet-joint', topic: 'jf', sub: 'Bolts, screws & rivets', title: 'Allowable load of a riveted lap joint', diff: 2,
    gen(r) {
      const n = r.pick([3, 4, 5]), d = r.pick([0.5, 0.625, 0.75]), t = r.pick([0.25, 0.3125, 0.375]), w = r.pick([4, 5, 6]);
      const ts = r.pick([12000, 15000]), sb = r.pick([30000, 36000]), st = r.pick([18000, 20000]);
      const Fs = n * ts * ((PI * d * d) / 4), Fb = n * sb * d * t, Ft = (w - d) * t * st;
      const Fa = Math.min(Fs, Fb, Ft), mode = Fa === Fs ? 'rivet shear' : Fa === Fb ? 'bearing' : 'plate tension';
      return {
        prompt: `Two <b>${t} in</b> plates, <b>${w} in</b> wide, are joined in a single-shear lap joint by <b>${n}</b> rivets of <b>${d} in</b> diameter in a single line along the load (so one rivet hole is in any cross-section). Allowables: rivet shear <b>${f(ts, 5)} psi</b>, bearing <b>${f(sb, 5)} psi</b>, plate tension (net section) <b>${f(st, 5)} psi</b>. What is the allowable joint load?`,
        answer: Fa, unit: 'lbf',
        steps: [
          { t: 'Rivet shear capacity (single shear):', m: R`F_s = n\,\tau_a\frac{\pi d^2}{4} = ${n}(${ts})\frac{\pi(${d})^2}{4} = ${fm(Fs, 4)}\ \text{lbf}` },
          { t: 'Bearing capacity:', m: R`F_b = n\,\sigma_b\,d\,t = ${n}(${sb})(${d})(${t}) = ${fm(Fb, 4)}\ \text{lbf}` },
          { t: 'Net-section tension (width minus one hole):', m: R`F_t = (w - d)\,t\,\sigma_t = (${w} - ${d})(${t})(${st}) = ${fm(Ft, 4)}\ \text{lbf}` },
          { t: `The joint is limited by the weakest mode, <b>${mode}</b>:`, m: R`F_{allow} = \min(F_s, F_b, F_t) = ${fm(Fa, 4)}\ \text{lbf}` },
          { t: `Joint efficiency = F<sub>allow</sub>/(w·t·σ<sub>t</sub>) = ${f((100 * Fa) / (w * t * st), 3)}%.` }
        ],
        distract: [Math.max(Fs, Fb, Ft), [Fs, Fb, Ft].sort((a, b2) => a - b2)[1], w * t * st]
      };
    }
  });

  /* ---------------------------------- Welds ---------------------------------- */
  add({
    id: 'jf-weld-size', topic: 'jf', sub: 'Welding & brazing', title: 'Required fillet weld leg size', diff: 2, fig: 'weld',
    gen(r) {
      const F = r.pick([20000, 30000, 40000, 60000]), L = r.pick([4, 6, 8]), Sexx = r.pick([60, 70]);
      const ta = 0.3 * Sexx * 1000, h = F / (0.707 * 2 * L * ta);
      return {
        prompt: `A plate is connected by <b>two</b> longitudinal fillet welds, each <b>${L} in</b> long, made with E${Sexx}XX electrodes. Using the AISC allowable throat shear of 0.30 S<sub>EXX</sub>, what minimum leg size is needed to carry <b>${f(F, 5)} lbf</b>?`,
        answer: h, unit: 'in',
        fig: { name: 'weld', data: { F: `${f(F, 5)} lbf`, label: `two welds, L = ${L} in` } },
        steps: [
          { t: 'Allowable shear stress on the throat:', m: R`\tau_{allow} = 0.30S_{EXX} = 0.30(${Sexx * 1000}) = ${fm(ta, 4)}\ \text{psi}` },
          { t: 'Throat area = 0.707·h·(total weld length). Solve F = τ<sub>allow</sub>·A for h:', m: R`h = \frac{F}{0.707\,L_{tot}\,\tau_{allow}} = \frac{${F}}{0.707(${2 * L})(${fm(ta, 4)})} = ${fm(h, 4)}\ \text{in}` },
          { t: 'Round up to the next standard size (in 1/16 in steps) and check the AISC minimum size for the plate thickness.' }
        ],
        distract: [F / (2 * L * ta), F / (0.707 * L * ta), F / (0.707 * 2 * L * Sexx * 1000)]
      };
    }
  });

  add({
    id: 'jf-weld-bending', topic: 'jf', sub: 'Welding & brazing', title: 'Welded bracket — combined shear and bending', diff: 3, video: true, fig: 'weld',
    gen(r) {
      const b = r.pick([2, 3, 4]), d = r.pick([4, 6, 8]), Lc = r.pick([4, 6, 8, 10]), Pl = r.pick([3000, 5000, 8000]), h = r.pick([0.25, 0.3125, 0.375]);
      const A = 0.707 * h * 2 * b, t1 = Pl / A, Iu = (b * d * d) / 2, I = 0.707 * h * Iu, M = Pl * Lc, sg = (M * (d / 2)) / I;
      const tau = Math.sqrt(t1 * t1 + sg * sg);
      return {
        prompt: `A cantilever bracket is welded to a column with <b>two horizontal fillet welds</b> (top and bottom), each <b>${b} in</b> long and <b>${d} in</b> apart, leg size <b>${h} in</b>. A vertical load of <b>${f(Pl, 5)} lbf</b> acts <b>${Lc} in</b> from the column face. Treating the welds as lines, what is the maximum resultant stress on the weld throat?`,
        answer: tau, unit: 'psi',
        fig: { name: 'weld', data: { F: `${f(Pl, 5)} lbf`, label: `two welds b = ${b} in, d = ${d} in apart` } },
        steps: [
          { t: 'Primary (direct) shear over the total throat area:', m: R`A = 0.707h(2b) = ${fm(A, 4)}\ \text{in}^2 \qquad \tau' = \frac{P}{A} = ${fm(t1, 4)}\ \text{psi}` },
          { t: 'Unit second moment of two parallel horizontal weld lines separated by d (about their centroid):', m: R`I_u = \frac{bd^2}{2} = ${fm(Iu, 4)}\ \text{in}^3 \qquad I = 0.707h\,I_u = ${fm(I, 4)}\ \text{in}^4` },
          { t: 'Bending stress on the throat from M = PL:', m: R`\sigma'' = \frac{M(d/2)}{I} = \frac{${fm(M, 4)}(${d / 2})}{${fm(I, 4)}} = ${fm(sg, 4)}\ \text{psi}` },
          { t: 'The two components are perpendicular. Combine them vectorially (conventional weld approach):', m: R`\tau = \sqrt{\tau'^2 + \sigma''^2} = ${fm(tau, 4)}\ \text{psi}` }
        ],
        distract: [t1 + sg, sg, (M * (d / 2)) / ((h * b * d * d) / 2)]
      };
    }
  });

  add({
    id: 'jf-weld-torsion', topic: 'jf', sub: 'Welding & brazing', title: 'Circular fillet weld in torsion', diff: 2,
    gen(r) {
      const D = r.pick([2, 3, 4, 6]), T = r.pick([10000, 20000, 30000, 50000]), h = r.pick([0.1875, 0.25, 0.3125]);
      const rr = D / 2, Ju = 2 * PI * rr ** 3, J = 0.707 * h * Ju, tau = (T * rr) / J;
      return {
        prompt: `A round bar of <b>${D} in</b> diameter is welded all around to a plate with a <b>${h} in</b> fillet weld. The bar transmits a torque of <b>${f(T, 5)} lbf·in</b>. What is the shear stress on the weld throat?`,
        answer: tau, unit: 'psi',
        steps: [
          { t: 'Treat the weld as a circular line. Unit polar moment of a circle of radius r:', m: R`J_u = 2\pi r^3 = 2\pi(${rr})^3 = ${fm(Ju, 4)}\ \text{in}^3 \qquad J = 0.707h\,J_u = ${fm(J, 4)}\ \text{in}^4` },
          { t: 'Torsional shear on the throat:', m: R`\tau = \frac{Tr}{J} = \frac{${T}(${rr})}{${fm(J, 4)}} = ${fm(tau, 4)}\ \text{psi}` },
          { t: 'Equivalently τ = T/(0.707h·2πr²): the torque divided by the throat area times the radius.' }
        ],
        distract: [(T * rr) / (h * Ju), T / (0.707 * h * 2 * PI * rr), (16 * T) / (PI * D ** 3)]
      };
    }
  });

  /* ----------------------------- Pins, keys & fits ----------------------------- */
  add({
    id: 'jf-pin-size', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Clevis pin diameter for an allowable shear', diff: 2,
    gen(r) {
      const F = r.pick([5000, 8000, 12000, 20000]), ta = r.pick([10000, 15000, 20000]);
      const d = Math.sqrt((2 * F) / (PI * ta));
      return {
        prompt: `A clevis pin carries <b>${f(F, 5)} lbf</b> in double shear. If the allowable shear stress is <b>${f(ta, 5)} psi</b>, what minimum pin diameter is required?`,
        answer: d, unit: 'in',
        steps: [
          { t: 'Double shear: two cross-sections share the load.', m: R`\tau = \frac{F}{2(\pi d^2/4)} \le \tau_a` },
          { t: 'Solve for d.', m: R`d = \sqrt{\frac{2F}{\pi\tau_a}} = \sqrt{\frac{2(${F})}{\pi(${ta})}} = ${fm(d, 4)}\ \text{in}` },
          { t: 'Also check bearing of the pin on the clevis and the rod eye, and bending of the pin if the clevis gap is large.' }
        ],
        distract: [Math.sqrt((4 * F) / (PI * ta)), Math.sqrt(F / (PI * ta)), (2 * F) / (PI * ta)]
      };
    }
  });

  add({
    id: 'jf-shrink-temp', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Temperature to heat a hub for shrink fitting', diff: 2,
    gen(r) {
      const D = r.pick([2, 3, 4, 6]), id = r.pick([0.001, 0.0015, 0.002, 0.003]) * D / 2, cl = r.pick([0.001, 0.002]), a = 6.5e-6;
      const dT = (id + cl) / (a * D);
      return {
        prompt: `A steel hub (α = 6.5×10⁻⁶ /°F) is to be shrink-fit onto a <b>${D} in</b> steel shaft with a diametral interference of <b>${f(id, 3)} in</b>. For assembly, the bore must also have <b>${cl} in</b> of diametral clearance. How much must the hub be heated above the shaft temperature?`,
        answer: dT, unit: '°F',
        steps: [
          { t: 'The bore must grow by the interference plus the assembly clearance:', m: R`\Delta D = \delta + c = ${f(id, 3)} + ${cl} = ${fm(id + cl, 4)}\ \text{in}` },
          { t: 'Thermal growth of the bore diameter:', m: R`\Delta D = \alpha D\,\Delta T \;\Rightarrow\; \Delta T = \frac{${fm(id + cl, 4)}}{(6.5\times10^{-6})(${D})} = ${fm(dT, 4)}\ ^\circ\text{F}` },
          { t: 'Keep the hub below its tempering temperature (often ~400–500 °F for hardened parts), or cool the shaft instead (dry ice/LN₂).' }
        ],
        distract: [id / (a * D), (id + cl) / (a * (D / 2)), (id + cl) / a]
      };
    }
  });

  add({
    id: 'jf-press-torque', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Torque capacity of a press fit', diff: 3, video: true,
    gen(r) {
      const D = r.pick([1.5, 2, 2.5, 3]), Do = D * r.pick([2, 2.5]), dd = r.pick([0.0015, 0.002, 0.0025]), L = r.pick([2, 2.5, 3]), fr = r.pick([0.12, 0.15]);
      const E = 30e6, R0 = D / 2, ro = Do / 2, del = dd / 2, p = ((E * del) / (2 * R0)) * (1 - (R0 * R0) / (ro * ro)), T = 2 * PI * fr * p * R0 * R0 * L;
      return {
        prompt: `A steel gear hub (OD <b>${f(Do)} in</b>, length <b>${L} in</b>) is pressed onto a <b>${D} in</b> solid steel shaft with a diametral interference of <b>${dd} in</b> (E = 30×10⁶ psi for both). With a coefficient of friction of <b>${fr}</b>, what torque can the fit transmit before slipping?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Radial interference and interface pressure (same material, solid shaft):', m: R`\delta = \frac{${dd}}{2} = ${fm(del, 4)}\ \text{in} \qquad p = \frac{E\delta}{2R}\left(1 - \frac{R^2}{r_o^2}\right) = ${fm(p, 4)}\ \text{psi}` },
          { t: 'Friction force acts around the full contact area 2πRL, at radius R:', m: R`T = 2\pi f p R^2 L = 2\pi(${fr})(${fm(p, 4)})(${R0})^2(${L}) = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: `The axial force to press it on would be 2πfpRL = ${f(2 * PI * fr * p * R0 * L, 4)} lbf.` }
        ],
        distract: [2 * PI * fr * p * R0 * L, 2 * PI * fr * (p * 2) * R0 * R0 * L, PI * fr * p * R0 * R0 * L]
      };
    }
  });

  add({
    id: 'jf-hub-hoop', topic: 'jf', sub: 'Pins, keys & press/shrink fits', title: 'Hub hoop stress from a press fit', diff: 2,
    gen(r) {
      const p = r.pick([5000, 8000, 10000, 12000]), D = r.pick([1.5, 2, 3]), Do = D * r.pick([1.5, 2, 2.5]);
      const R0 = D / 2, ro = Do / 2, s = (p * (ro * ro + R0 * R0)) / (ro * ro - R0 * R0);
      return {
        prompt: `A press fit produces an interface pressure of <b>${f(p, 5)} psi</b> between a <b>${D} in</b> shaft and a hub with an outside diameter of <b>${f(Do)} in</b>. What is the tangential (hoop) stress at the hub bore?`,
        answer: s, unit: 'psi',
        steps: [
          { t: 'The hub is a thick cylinder under internal pressure p at radius R. Its hoop stress is greatest at the bore:', m: R`\sigma_t = p\,\frac{r_o^2 + R^2}{r_o^2 - R^2}` },
          { t: 'Evaluate (tensile).', m: R`\sigma_t = ${p}\cdot\frac{${fm(ro, 4)}^2 + ${R0}^2}{${fm(ro, 4)}^2 - ${R0}^2} = ${fm(s, 4)}\ \text{psi}` },
          { t: 'The shaft surface is in compression (σ<sub>t</sub> = σ<sub>r</sub> = −p for a solid shaft).' }
        ],
        distract: [p, (p * R0) / (ro - R0), (p * R0 * R0) / (ro * ro - R0 * R0)]
      };
    }
  });

  /* --------------------------------- Adhesives --------------------------------- */
  add({
    id: 'jf-adhesive-lap', topic: 'jf', sub: 'Adhesives', title: 'Overlap length of a bonded lap joint', diff: 1,
    gen(r) {
      const F = r.pick([1500, 2500, 4000, 6000]), b = r.pick([1, 1.5, 2]), ta = r.pick([1000, 1500, 2000, 2500]), n = r.pick([2, 3]);
      const L = (F * n) / (b * ta);
      return {
        prompt: `Two strips <b>${b} in</b> wide are bonded in a single-lap joint with an epoxy having an average lap-shear strength of <b>${f(ta, 5)} psi</b>. What overlap length is needed to carry <b>${f(F, 5)} lbf</b> with a design factor of <b>${n}</b>?`,
        answer: L, unit: 'in',
        steps: [
          { t: 'Average shear on the bonded area b × L:', m: R`\tau_{avg} = \frac{F}{bL} \le \frac{\tau_{ult}}{n}` },
          { t: 'Solve for L.', m: R`L = \frac{nF}{b\,\tau_{ult}} = \frac{${n}(${F})}{${b}(${ta})} = ${fm(L, 4)}\ \text{in}` },
          { t: 'The real shear stress peaks at the ends of the overlap (and peel stresses appear), so doubling the overlap does <i>not</i> double strength. Tapered adherends or double laps help.' }
        ],
        distract: [F / (b * ta), (F * n) / ta, (F * n) / (2 * b * ta)]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
