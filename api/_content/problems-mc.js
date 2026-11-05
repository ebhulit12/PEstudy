/* Mechanical Components — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const rad = (d) => (d * PI) / 180;

  /* ---------------------------------- Gears ---------------------------------- */
  add({
    id: 'mc-gear-center', topic: 'mc', sub: 'Gears', title: 'Center distance of a spur gear pair', diff: 1,
    gen(r) {
      const N1 = r.pick([16, 18, 20, 24]), ratio = r.pick([2, 2.5, 3, 4]), Pd = r.pick([4, 6, 8, 10, 12]);
      const N2 = N1 * ratio, C = (N1 + N2) / (2 * Pd);
      return {
        prompt: `A <b>${N1}-tooth</b> spur pinion drives a gear for a <b>${ratio}:1</b> speed reduction. The diametral pitch is <b>${Pd} teeth/in</b>. What is the center distance?`,
        answer: C, unit: 'in',
        steps: [
          { t: 'Gear tooth count from the speed ratio:', m: R`N_2 = ${ratio}(${N1}) = ${N2}\ \text{teeth}` },
          { t: 'Pitch diameters:', m: R`d_1 = \frac{N_1}{P_d} = ${fm(N1 / Pd, 4)}\ \text{in} \qquad d_2 = \frac{N_2}{P_d} = ${fm(N2 / Pd, 4)}\ \text{in}` },
          { t: 'Center distance is the average of the pitch diameters:', m: R`C = \frac{d_1 + d_2}{2} = \frac{N_1 + N_2}{2P_d} = ${fm(C, 4)}\ \text{in}` }
        ],
        distract: [(N1 + N2) / Pd, (N2 - N1) / (2 * Pd), N2 / (2 * Pd)]
      };
    }
  });

  add({
    id: 'mc-gear-force', topic: 'mc', sub: 'Gears', title: 'Total tooth force on a spur pinion', diff: 2,
    gen(r) {
      const H = r.pick([5, 10, 15, 20, 30]), n = r.pick([900, 1150, 1750]), d = r.pick([3, 4, 5, 6]), phi = r.pick([20, 25]);
      const V = (PI * d * n) / 12, Wt = (33000 * H) / V, Wr = Wt * Math.tan(rad(phi)), W = Wt / Math.cos(rad(phi));
      return {
        prompt: `A spur pinion with a <b>${d} in</b> pitch diameter transmits <b>${H} hp</b> at <b>${n} rpm</b>. The pressure angle is <b>${phi}°</b>. What is the total (resultant) force between the teeth?`,
        answer: W, unit: 'lbf',
        steps: [
          { t: 'Pitch-line velocity:', m: R`V = \frac{\pi d n}{12} = \frac{\pi(${d})(${n})}{12} = ${fm(V, 4)}\ \text{ft/min}` },
          { t: 'Tangential (transmitted) load:', m: R`W_t = \frac{33{,}000H}{V} = ${fm(Wt, 4)}\ \text{lbf}` },
          { t: 'The tooth force acts along the line of action, at the pressure angle to the tangent. Its radial component is \\(W_r = W_t\\tan\\phi\\).', m: R`W_r = ${fm(Wt, 4)}\tan ${phi}^\circ = ${fm(Wr, 4)}\ \text{lbf}` },
          { t: 'Resultant force:', m: R`W = \frac{W_t}{\cos\phi} = \frac{${fm(Wt, 4)}}{\cos ${phi}^\circ} = ${fm(W, 4)}\ \text{lbf}` }
        ],
        distract: [Wt, Wr, Wt * Math.cos(rad(phi))]
      };
    }
  });

  const LEWIS_Y = { 18: 0.309, 20: 0.322, 24: 0.337, 30: 0.359 };
  add({
    id: 'mc-gear-lewis', topic: 'mc', sub: 'Gears', title: 'Lewis bending stress with velocity factor', diff: 3, video: true, fig: 'gears',
    gen(r) {
      const N = r.pick([18, 20, 24, 30]), Pd = r.pick([6, 8, 10]), Fw = r.pick([1, 1.25, 1.5]), n = r.pick([1150, 1750]), H = r.pick([3, 5, 7.5, 10]);
      const Y = LEWIS_Y[N], d = N / Pd, V = (PI * d * n) / 12, Wt = (33000 * H) / V, Kv = (1200 + V) / 1200;
      const s = (Kv * Wt * Pd) / (Fw * Y);
      return {
        prompt: `A <b>${N}-tooth</b>, 20° full-depth steel spur pinion with <b>P<sub>d</sub> = ${Pd}</b> and face width <b>${Fw} in</b> transmits <b>${H} hp</b> at <b>${n} rpm</b>. The teeth have a cut (milled) profile; the Lewis form factor is <b>Y = ${Y}</b>. Using the Lewis equation with the Barth velocity factor, find the bending stress.`,
        answer: s, unit: 'psi',
        fig: { name: 'gears', data: { a: `N = ${N}` } },
        steps: [
          { t: 'Pitch diameter and pitch-line velocity:', m: R`d = \frac{${N}}{${Pd}} = ${fm(d, 4)}\ \text{in} \qquad V = \frac{\pi d n}{12} = ${fm(V, 4)}\ \text{ft/min}` },
          { t: 'Transmitted load:', m: R`W_t = \frac{33{,}000(${H})}{${fm(V, 4)}} = ${fm(Wt, 4)}\ \text{lbf}` },
          { t: 'Barth velocity factor for cut or milled teeth (for cast teeth it would be (600 + V)/600):', m: R`K_v = \frac{1200 + V}{1200} = ${fm(Kv, 4)}` },
          { t: 'Lewis bending equation (diametral pitch form):', m: R`\sigma = \frac{K_v W_t P_d}{F Y} = \frac{${fm(Kv, 4)}(${fm(Wt, 4)})(${Pd})}{${Fw}(${Y})} = ${fm(s, 4)}\ \text{psi}` }
        ],
        distract: [(Wt * Pd) / (Fw * Y), (((600 + V) / 600) * Wt * Pd) / (Fw * Y), (Kv * Wt) / (Fw * Y * Pd)]
      };
    }
  });

  add({
    id: 'mc-helical-thrust', topic: 'mc', sub: 'Gears', title: 'Axial thrust from a helical gear', diff: 2,
    gen(r) {
      const T = r.pick([1500, 2500, 4000, 6000]), d = r.pick([3, 4, 5, 6]), psi = r.pick([15, 20, 25, 30]);
      const Wt = (2 * T) / d, Wa = Wt * Math.tan(rad(psi));
      return {
        prompt: `A helical pinion with a pitch diameter of <b>${d} in</b> and a helix angle of <b>${psi}°</b> transmits a torque of <b>${f(T, 5)} lbf·in</b>. What axial thrust must the shaft bearings carry?`,
        answer: Wa, unit: 'lbf',
        steps: [
          { t: 'Tangential load at the pitch circle:', m: R`W_t = \frac{T}{d/2} = \frac{2(${T})}{${d}} = ${fm(Wt, 4)}\ \text{lbf}` },
          { t: 'The helix angle tilts the tooth force, producing an axial component:', m: R`W_a = W_t\tan\psi = ${fm(Wt, 4)}\tan ${psi}^\circ = ${fm(Wa, 4)}\ \text{lbf}` }
        ],
        distract: [Wt * Math.sin(rad(psi)), Wt / Math.tan(rad(psi)), Wt]
      };
    }
  });

  add({
    id: 'mc-planetary', topic: 'mc', sub: 'Gears', title: 'Planetary gear train — arm speed', diff: 3, video: true,
    gen(r) {
      const Ns = r.pick([20, 24, 30]), Np = r.pick([16, 18, 20, 24]), n = r.pick([1200, 1750, 1800, 3600]);
      const Nr = Ns + 2 * Np, nA = (n * Ns) / (Ns + Nr);
      return {
        prompt: `In a simple planetary train, the <b>${Ns}-tooth</b> sun gear is the input at <b>${n} rpm</b>, the planets have <b>${Np} teeth</b>, and the internal ring gear is held fixed. The arm (planet carrier) is the output. What is the arm speed?`,
        answer: nA, unit: 'rpm',
        steps: [
          { t: 'For the planets to mesh with both sun and ring, the ring tooth count is fixed by geometry:', m: R`N_r = N_s + 2N_p = ${Ns} + 2(${Np}) = ${Nr}` },
          { t: 'Train value from sun (first) to ring (last) with the arm held: external mesh reverses direction, the internal mesh does not.', m: R`e = \left(-\frac{N_s}{N_p}\right)\left(\frac{N_p}{N_r}\right) = -\frac{${Ns}}{${Nr}}` },
          { t: 'Planetary equation with the ring fixed (n<sub>L</sub> = 0):', m: R`\frac{n_L - n_A}{n_F - n_A} = e \;\Rightarrow\; \frac{0 - n_A}{${n} - n_A} = -\frac{${Ns}}{${Nr}}` },
          { t: 'Solve for the arm speed (same direction as the sun):', m: R`n_A = n_s\frac{N_s}{N_s + N_r} = ${n}\cdot\frac{${Ns}}{${Ns + Nr}} = ${fm(nA, 4)}\ \text{rpm}` }
        ],
        distract: [(n * Ns) / Nr, (n * Nr) / (Ns + Nr), (n * Ns) / Np]
      };
    }
  });

  add({
    id: 'mc-worm', topic: 'mc', sub: 'Gears', title: 'Worm gear output torque', diff: 2,
    gen(r) {
      const Nw = r.pick([1, 2, 4]), Ng = r.pick([30, 40, 50, 60]), n = r.pick([1150, 1750]), H = r.pick([2, 3, 5, 7.5]), eta = r.pick([0.7, 0.75, 0.8, 0.85]);
      const ng = (n * Nw) / Ng, T = (63025 * eta * H) / ng;
      return {
        prompt: `A worm with <b>${Nw}</b> thread${Nw > 1 ? 's' : ''} (start${Nw > 1 ? 's' : ''}) drives a <b>${Ng}-tooth</b> worm gear. The worm turns at <b>${n} rpm</b> and receives <b>${H} hp</b>. If the gearset efficiency is <b>${Math.round(eta * 100)}%</b>, what is the output torque on the gear shaft?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'The speed ratio of a worm set is the gear tooth count over the number of worm threads:', m: R`m_G = \frac{N_G}{N_W} = \frac{${Ng}}{${Nw}} = ${fm(Ng / Nw, 4)} \qquad n_G = \frac{${n}}{${fm(Ng / Nw, 4)}} = ${fm(ng, 4)}\ \text{rpm}` },
          { t: 'Output power after friction losses:', m: R`H_{out} = \eta H = ${eta}(${H}) = ${fm(eta * H, 4)}\ \text{hp}` },
          { t: 'Output torque:', m: R`T = \frac{63{,}025\,H_{out}}{n_G} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [(63025 * H) / ng, (63025 * eta * H) / n, (63025 * eta * H) / (n / Ng)]
      };
    }
  });

  /* --------------------------------- Bearings --------------------------------- */
  add({
    id: 'mc-bearing-reqc', topic: 'mc', sub: 'Bearings', title: 'Required catalog rating for a design life', diff: 2,
    gen(r) {
      const roller = r.next() < 0.3, a = roller ? 10 / 3 : 3;
      const Lh = r.pick([5000, 10000, 20000, 30000]), n = r.pick([500, 900, 1200, 1750]), F = r.pick([400, 600, 800, 1200]), af = r.pick([1, 1.2, 1.5]);
      const L = 60 * n * Lh, C = af * F * Math.pow(L / 1e6, 1 / a);
      return {
        prompt: `A <b>${roller ? 'cylindrical roller' : 'deep-groove ball'}</b> bearing must carry a radial load of <b>${F} lbf</b> at <b>${n} rpm</b> for an L<sub>10</sub> life of <b>${f(Lh, 5)} h</b>. ${af > 1 ? `Use an application factor of <b>${af}</b>. ` : ''}What minimum basic dynamic load rating C (based on 10⁶ revolutions) should be specified?`,
        answer: C, unit: 'lbf', tol: 0.03,
        steps: [
          { t: 'Required life in revolutions:', m: R`L = 60\,n\,L_h = 60(${n})(${Lh}) = ${fm(L, 4)}\ \text{rev}` },
          { t: `Rearrange the life equation, with a = ${roller ? '10/3 (roller)' : '3 (ball)'}${af > 1 ? ' and the design load multiplied by the application factor' : ''}:`, m: R`C = ${af > 1 ? 'a_f' : ''}F\left(\frac{L}{10^6}\right)^{1/a} = ${af > 1 ? af + '(' + F + ')' : F}\left(${fm(L / 1e6, 4)}\right)^{1/${roller ? '(10/3)' : '3'}} = ${fm(C, 4)}\ \text{lbf}` }
        ],
        distract: [F * Math.pow(L / 1e6, 1 / a), af * F * Math.pow(L / 1e6, 1 / (roller ? 3 : 10 / 3)), af * F * (L / 1e6)]
      };
    }
  });

  add({
    id: 'mc-bearing-equiv', topic: 'mc', sub: 'Bearings', title: 'Ball bearing life under combined loads', diff: 3, video: true,
    gen(r) {
      const Fr = r.pick([500, 750, 1000, 1500]), ratio = r.pick([0.4, 0.5, 0.6, 0.8]), Fa = Fr * ratio;
      const Y = r.pick([1.31, 1.45, 1.55, 1.71]), X = 0.56, C = r.pick([6000, 8000, 10000, 12000]), n = r.pick([600, 900, 1200, 1800]);
      const Pe = X * Fr + Y * Fa, Lh = (Math.pow(C / Pe, 3) * 1e6) / (60 * n);
      return {
        prompt: `A deep-groove ball bearing (inner ring rotating) carries a radial load of <b>${f(Fr, 5)} lbf</b> and a thrust load of <b>${f(Fa, 5)} lbf</b> at <b>${n} rpm</b>. Its rating is C = <b>${f(C, 5)} lbf</b> (10⁶ rev). For this F<sub>a</sub>/C<sub>0</sub>, the catalog gives e = 0.30, and for F<sub>a</sub>/F<sub>r</sub> &gt; e: <b>X = 0.56, Y = ${Y}</b>. Find the L<sub>10</sub> life in hours.`,
        answer: Lh, unit: 'h', tol: 0.03,
        steps: [
          { t: `Check which X, Y apply: F<sub>a</sub>/F<sub>r</sub> = ${f(ratio)} &gt; e = 0.30, so use X = 0.56 and Y = ${Y} (V = 1 for a rotating inner ring).`, m: R`\frac{F_a}{V F_r} = \frac{${Fa}}{${Fr}} = ${fm(ratio)} > 0.30` },
          { t: 'Equivalent radial load:', m: R`P = X V F_r + Y F_a = 0.56(${Fr}) + ${Y}(${fm(Fa, 4)}) = ${fm(Pe, 4)}\ \text{lbf}` },
          { t: 'Life in revolutions (ball bearing, a = 3), then hours:', m: R`L_{10} = \left(\frac{${C}}{${fm(Pe, 4)}}\right)^3 10^6 \qquad L_h = \frac{L_{10}}{60n} = ${fm(Lh, 4)}\ \text{h}` }
        ],
        distract: [(Math.pow(C / Fr, 3) * 1e6) / (60 * n), (Math.pow(C / (Fr + Fa), 3) * 1e6) / (60 * n), (Math.pow(C / Pe, 10 / 3) * 1e6) / (60 * n)]
      };
    }
  });

  add({
    id: 'mc-petroff', topic: 'mc', sub: 'Bearings', title: 'Journal bearing friction loss (Petroff)', diff: 3,
    gen(r) {
      const D = r.pick([1, 1.5, 2, 3]), LD = r.pick([1, 1.5]), c = r.pick([0.0015, 0.002, 0.003]), mu = r.pick([2, 3, 4, 6]) * 1e-6, n = r.pick([900, 1200, 1800, 3600]);
      const rr = D / 2, L = D * LD, N = n / 60;
      const T = (4 * PI * PI * Math.pow(rr, 3) * L * mu * N) / c, H = (T * n) / 63025;
      return {
        prompt: `A lightly loaded journal bearing has a journal diameter of <b>${D} in</b>, length <b>${f(L)} in</b>, and radial clearance <b>${c} in</b>. The oil viscosity is <b>${f(mu * 1e6)} µreyn</b> and the journal turns at <b>${n} rpm</b>. Using Petroff's equation, what power (hp) is lost to friction?`,
        answer: H, unit: 'hp',
        steps: [
          { t: 'Convert speed to rev/s and viscosity to reyn (lbf·s/in²):', m: R`N = \frac{${n}}{60} = ${fm(N, 4)}\ \text{rev/s} \qquad \mu = ${fm(mu * 1e6)}\times10^{-6}\ \text{reyn} \qquad r = ${fm(rr)}\ \text{in}` },
          { t: 'Petroff friction torque (concentric journal, light load):', m: R`T = \frac{4\pi^2 r^3 L \mu N}{c} = \frac{4\pi^2(${fm(rr)})^3(${fm(L)})(${fm(mu)})(${fm(N, 4)})}{${c}} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Power lost:', m: R`H = \frac{T n}{63{,}025} = \frac{${fm(T, 4)}(${n})}{63{,}025} = ${fm(H, 4)}\ \text{hp}` }
        ],
        distract: [H * 60, H * 8, (T * N) / 63025]
      };
    }
  });

  /* ---------------------------------- Springs ---------------------------------- */
  add({
    id: 'mc-spring-solid', topic: 'mc', sub: 'Springs', title: 'Force to close a spring solid', diff: 2,
    gen(r) {
      const d = r.pick([0.105, 0.125, 0.148, 0.177]), C = r.pick([7, 8, 9, 10]), Na = r.pick([6, 8, 10, 12]);
      const D = C * d, G = 11.5e6, k = (G * d ** 4) / (8 * D ** 3 * Na);
      const Nt = Na + 2, Ls = d * Nt, L0 = +(Ls + r.pick([0.75, 1, 1.5, 2])).toFixed(2);
      const F = k * (L0 - Ls);
      return {
        prompt: `A music-wire (G = 11.5×10⁶ psi) compression spring with <b>squared and ground</b> ends has wire diameter <b>${d} in</b>, mean coil diameter <b>${f(D, 4)} in</b>, <b>${Na} active coils</b>, and a free length of <b>${L0} in</b>. What force compresses it to its solid length?`,
        answer: F, unit: 'lbf',
        steps: [
          { t: 'Spring rate:', m: R`k = \frac{Gd^4}{8D^3N_a} = \frac{(11.5\times10^6)(${d})^4}{8(${fm(D, 4)})^3(${Na})} = ${fm(k, 4)}\ \text{lbf/in}` },
          { t: 'Squared and ground ends add one inactive coil at each end. The solid length is the total coils times the wire diameter:', m: R`N_t = N_a + 2 = ${Nt} \qquad L_s = dN_t = ${d}(${Nt}) = ${fm(Ls, 4)}\ \text{in}` },
          { t: 'Force to close solid:', m: R`F_s = k(L_0 - L_s) = ${fm(k, 4)}(${L0} - ${fm(Ls, 4)}) = ${fm(F, 4)}\ \text{lbf}` }
        ],
        distract: [k * (L0 - d * Na), k * L0, k * (L0 - d * (Na + 1))]
      };
    }
  });

  add({
    id: 'mc-spring-combo', topic: 'mc', sub: 'Springs', title: 'Deflection of springs in series or parallel', diff: 1,
    gen(r) {
      const k1 = r.pick([50, 80, 100, 150]), k2 = r.pick([60, 120, 200, 250]), F = r.pick([60, 100, 150, 240]), series = r.next() < 0.5;
      const keq = series ? 1 / (1 / k1 + 1 / k2) : k1 + k2, delta = F / keq;
      return {
        prompt: `Two coil springs, k₁ = <b>${k1} lbf/in</b> and k₂ = <b>${k2} lbf/in</b>, are arranged <b>${series ? 'in series (end to end)' : 'in parallel (side by side, sharing the load)'}</b> and support a <b>${F} lbf</b> load. What is the total deflection?`,
        answer: delta, unit: 'in',
        steps: [
          { t: series ? 'In series, each spring carries the full load and the deflections add, so the compliances add:' : 'In parallel, both springs deflect equally and their forces add, so the stiffnesses add:', m: series ? R`\frac{1}{k_{eq}} = \frac{1}{${k1}} + \frac{1}{${k2}} \;\Rightarrow\; k_{eq} = ${fm(keq, 4)}\ \text{lbf/in}` : R`k_{eq} = k_1 + k_2 = ${keq}\ \text{lbf/in}` },
          { t: 'Deflection:', m: R`\delta = \frac{F}{k_{eq}} = \frac{${F}}{${fm(keq, 4)}} = ${fm(delta, 4)}\ \text{in}` }
        ],
        distract: [series ? F / (k1 + k2) : F * (1 / k1 + 1 / k2), F / k1, F / Math.max(k1, k2)]
      };
    }
  });

  /* ---------------------------- Belts, pulleys & chains ---------------------------- */
  add({
    id: 'mc-vbelt', topic: 'mc', sub: 'Belts, pulleys & chains', title: 'V-belt power with wedge friction', diff: 3, video: true, fig: 'belt',
    gen(r) {
      const F1 = r.pick([120, 150, 200, 250]), fr = r.pick([0.13, 0.15, 0.2]), groove = r.pick([34, 36, 38, 40]), th = r.pick([150, 160, 170]), V = r.pick([2500, 3000, 4000]);
      const fe = fr / Math.sin(rad(groove / 2)), ratio = Math.exp(fe * rad(th)), F2 = F1 / ratio, H = ((F1 - F2) * V) / 33000;
      return {
        prompt: `A V-belt runs in sheave grooves with an included angle of <b>${groove}°</b>. The coefficient of friction is <b>${fr}</b>, the wrap on the small sheave is <b>${th}°</b>, and the allowable tight-side tension is <b>${F1} lbf</b>. At <b>${f(V, 5)} ft/min</b>, what power can one belt transmit (hp)? Neglect centrifugal tension.`,
        answer: H, unit: 'hp',
        steps: [
          { t: 'The groove wedges the belt, raising the normal force. The effective friction coefficient uses half the groove angle:', m: R`f' = \frac{f}{\sin(\beta/2)} = \frac{${fr}}{\sin ${groove / 2}^\circ} = ${fm(fe, 4)}` },
          { t: 'Belt-friction relation with the wrap in radians:', m: R`\frac{F_1}{F_2} = e^{f'\phi} = e^{${fm(fe, 4)}(${fm(rad(th), 4)})} = ${fm(ratio, 4)} \;\Rightarrow\; F_2 = ${fm(F2, 4)}\ \text{lbf}` },
          { t: 'Power from the net pull:', m: R`H = \frac{(F_1 - F_2)V}{33{,}000} = \frac{(${fm(F1 - F2, 4)})(${V})}{33{,}000} = ${fm(H, 4)}\ \text{hp}` }
        ],
        distract: [((F1 - F1 / Math.exp(fr * rad(th))) * V) / 33000, ((F1 - F1 / Math.exp((fr / Math.sin(rad(groove))) * rad(th))) * V) / 33000, (F1 * V) / 33000]
      };
    }
  });

  add({
    id: 'mc-belt-wrap', topic: 'mc', sub: 'Belts, pulleys & chains', title: 'Wrap angle on the small pulley', diff: 2,
    gen(r) {
      const d = r.pick([4, 5, 6, 8]), D = d * r.pick([2, 2.5, 3]), C = r.pick([24, 30, 36, 48]);
      const phi = PI - 2 * Math.asin((D - d) / (2 * C)), deg = (phi * 180) / PI;
      return {
        prompt: `An open flat-belt drive connects a <b>${d} in</b> driver pulley to a <b>${f(D)} in</b> driven pulley at a center distance of <b>${C} in</b>. What is the angle of wrap on the small pulley, in degrees?`,
        answer: deg, unit: '°', tol: 0.01,
        steps: [
          { t: 'For an open belt, the wrap on the small pulley is less than 180° by twice the angle the belt tilts:', m: R`\phi_d = \pi - 2\sin^{-1}\frac{D - d}{2C}` },
          { t: 'Evaluate.', m: R`\phi_d = 180^\circ - 2\sin^{-1}\frac{${f(D)} - ${d}}{2(${C})} = 180^\circ - 2(${fm(Math.asin((D - d) / (2 * C)) * 180 / PI, 4)}^\circ) = ${fm(deg, 4)}^\circ` }
        ],
        distract: [360 - deg, 180 - (Math.asin((D - d) / (2 * C)) * 180) / PI, 180 - (2 * Math.atan((D - d) / C) * 180) / PI]
      };
    }
  });

  add({
    id: 'mc-chain', topic: 'mc', sub: 'Belts, pulleys & chains', title: 'Roller chain tension', diff: 2,
    gen(r) {
      const chain = r.pick([{ no: 40, p: 0.5 }, { no: 50, p: 0.625 }, { no: 60, p: 0.75 }, { no: 80, p: 1 }]);
      const N = r.pick([17, 19, 21, 25]), n = r.pick([300, 600, 900, 1200]), H = r.pick([3, 5, 10, 15]);
      const V = (N * chain.p * n) / 12, Fc = (33000 * H) / V;
      return {
        prompt: `A No. <b>${chain.no}</b> roller chain (pitch <b>${chain.p} in</b>) runs on a <b>${N}-tooth</b> driving sprocket at <b>${n} rpm</b>, transmitting <b>${H} hp</b>. What is the average tension in the tight strand?`,
        answer: Fc, unit: 'lbf',
        steps: [
          { t: 'Each revolution advances the chain N pitches:', m: R`V = \frac{N p n}{12} = \frac{${N}(${chain.p})(${n})}{12} = ${fm(V, 4)}\ \text{ft/min}` },
          { t: 'Chain tension from power:', m: R`F = \frac{33{,}000H}{V} = \frac{33{,}000(${H})}{${fm(V, 4)}} = ${fm(Fc, 4)}\ \text{lbf}` }
        ],
        distract: [(33000 * H) / (N * chain.p * n), (63025 * H) / n, (33000 * H) / ((PI * (chain.p / Math.sin(PI / N)) * n) / 12) * 1.3]
      };
    }
  });

  /* ------------------------------ Clutches & brakes ------------------------------ */
  add({
    id: 'mc-band-brake', topic: 'mc', sub: 'Clutches & brakes', title: 'Band brake torque capacity', diff: 2,
    gen(r) {
      const D = r.pick([12, 16, 18, 24]), th = r.pick([210, 225, 240, 270]), fr = r.pick([0.25, 0.3, 0.35]), P1 = r.pick([400, 600, 800, 1000]);
      const P2 = P1 / Math.exp(fr * rad(th)), T = ((P1 - P2) * D) / 2;
      return {
        prompt: `A band brake wraps <b>${th}°</b> around a <b>${D} in</b> drum. The coefficient of friction is <b>${fr}</b> and the band can safely carry <b>${P1} lbf</b> on its tight side. What braking torque can it produce?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Band tensions follow the same capstan relation as belts (wrap in radians):', m: R`\frac{P_1}{P_2} = e^{f\theta} = e^{${fr}(${fm(rad(th), 4)})} = ${fm(Math.exp(fr * rad(th)), 4)} \;\Rightarrow\; P_2 = ${fm(P2, 4)}\ \text{lbf}` },
          { t: 'Braking torque is the tension difference times the drum radius:', m: R`T = (P_1 - P_2)\frac{D}{2} = (${fm(P1 - P2, 4)})(${D / 2}) = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [(P1 * D) / 2, ((P1 + P2) * D) / 2, ((P1 - P2) * D)]
      };
    }
  });

  add({
    id: 'mc-brake-temp', topic: 'mc', sub: 'Clutches & brakes', title: 'Brake drum temperature rise', diff: 2,
    gen(r) {
      const I = r.pick([5, 8, 12, 20]), n = r.pick([600, 900, 1200]), W = r.pick([25, 40, 60, 80]);
      const w = (2 * PI * n) / 60, E = 0.5 * I * w * w, Btu = E / 778.17, dT = Btu / (W * 0.12);
      return {
        prompt: `A machine with a mass moment of inertia of <b>${I} slug·ft²</b> spinning at <b>${n} rpm</b> is stopped by a brake. All the kinetic energy is absorbed by the <b>${W} lbm</b> steel drum (c = 0.12 Btu/lbm·°F) with no heat loss. What is the drum's temperature rise?`,
        answer: dT, unit: '°F',
        steps: [
          { t: 'Kinetic energy to absorb:', m: R`\omega = \frac{2\pi(${n})}{60} = ${fm(w, 4)}\ \text{rad/s} \qquad E = \tfrac12 I\omega^2 = ${fm(E, 4)}\ \text{ft}\cdot\text{lbf}` },
          { t: 'Convert to Btu (1 Btu = 778.17 ft·lbf):', m: R`E = \frac{${fm(E, 4)}}{778.17} = ${fm(Btu, 4)}\ \text{Btu}` },
          { t: 'Temperature rise:', m: R`\Delta T = \frac{E}{mc} = \frac{${fm(Btu, 4)}}{${W}(0.12)} = ${fm(dT, 4)}\ ^\circ\text{F}` }
        ],
        distract: [E / (W * 0.12), (I * w * w) / 778.17 / (W * 0.12), (0.5 * I * n * n) / 778.17 / (W * 0.12)]
      };
    }
  });

  add({
    id: 'mc-clutch-up', topic: 'mc', sub: 'Clutches & brakes', title: 'Disc clutch torque — uniform pressure', diff: 2,
    gen(r) {
      const D = r.pick([8, 10, 12, 14]), d = r.pick([4, 5, 6]), F = r.pick([500, 800, 1000, 1200]), fr = r.pick([0.25, 0.3, 0.35]), N = r.pick([2, 4]);
      const T = ((N * fr * F) / 3) * ((D ** 3 - d ** 3) / (D ** 2 - d ** 2));
      return {
        prompt: `A <b>new</b> multi-disc clutch has <b>${N}</b> friction surfaces, outside diameter <b>${D} in</b>, inside diameter <b>${d} in</b>, f = <b>${fr}</b>, and an actuating force of <b>${F} lbf</b>. Assuming uniform pressure, what torque can it transmit?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'A new (unworn) clutch is modeled with uniform pressure. The friction force acts at an effective radius of (D³ − d³)/(3(D² − d²)) per surface:', m: R`T = N\,\frac{fF}{3}\,\frac{D^3 - d^3}{D^2 - d^2}` },
          { t: 'Evaluate.', m: R`T = ${N}\cdot\frac{${fr}(${F})}{3}\cdot\frac{${D}^3 - ${d}^3}{${D}^2 - ${d}^2} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: `For comparison, uniform wear gives Nf F(D + d)/4 = ${f((N * fr * F * (D + d)) / 4, 4)} lbf·in, slightly less. That's why worn-in clutches are designed with uniform wear.` }
        ],
        distract: [(N * fr * F * (D + d)) / 4, ((fr * F) / 3) * ((D ** 3 - d ** 3) / (D ** 2 - d ** 2)), N * fr * F * ((D ** 3 - d ** 3) / (D ** 2 - d ** 2))]
      };
    }
  });

  add({
    id: 'mc-clutch-force', topic: 'mc', sub: 'Clutches & brakes', title: 'Clutch actuating force for a required torque', diff: 2,
    gen(r) {
      const H = r.pick([10, 15, 20, 30]), n = r.pick([900, 1200, 1750]), Ks = r.pick([1.25, 1.5, 2]), D = r.pick([8, 10, 12]), d = r.pick([5, 6]), fr = r.pick([0.25, 0.3]), N = r.pick([2, 4, 6]);
      const T = (63025 * H * Ks) / n, F = (4 * T) / (N * fr * (D + d));
      return {
        prompt: `A dry multi-disc clutch must transmit <b>${H} hp</b> at <b>${n} rpm</b> with a service factor of <b>${Ks}</b>. It has <b>${N}</b> friction surfaces, D = <b>${D} in</b>, d = <b>${d} in</b>, f = <b>${fr}</b>. Assuming uniform wear, what actuating force is required?`,
        answer: F, unit: 'lbf',
        steps: [
          { t: 'Design torque including the service factor:', m: R`T = K_s\,\frac{63{,}025H}{n} = ${Ks}\cdot\frac{63{,}025(${H})}{${n}} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Uniform-wear torque T = Nf F(D + d)/4, solved for F:', m: R`F = \frac{4T}{Nf(D + d)} = \frac{4(${fm(T, 4)})}{${N}(${fr})(${D + d})} = ${fm(F, 4)}\ \text{lbf}` }
        ],
        distract: [F / Ks, (4 * T) / (fr * (D + d)), (2 * T) / (N * fr * (D + d))]
      };
    }
  });

  /* -------------------------------- Power screws -------------------------------- */
  add({
    id: 'mc-screw-lower', topic: 'mc', sub: 'Power screws', title: 'Torque to lower a load — square thread', diff: 2,
    gen(r) {
      const d = r.pick([1.5, 2, 2.5]), p = r.pick([0.2, 0.25]), F = r.pick([3000, 5000, 8000]), fr = r.pick([0.12, 0.15, 0.18]);
      const dm = d - p / 2, l = p, T = ((F * dm) / 2) * ((PI * fr * dm - l) / (PI * dm + fr * l));
      return {
        prompt: `A single-start square-thread screw (major diameter <b>${d} in</b>, pitch <b>${p} in</b>, thread friction <b>${fr}</b>) supports <b>${f(F, 5)} lbf</b>. Neglecting collar friction, what torque is needed to <b>lower</b> the load?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Mean diameter and lead:', m: R`d_m = ${d} - \frac{${p}}{2} = ${fm(dm, 4)}\ \text{in} \qquad l = ${p}\ \text{in}` },
          { t: 'Lowering torque for a square thread:', m: R`T_L = \frac{Fd_m}{2}\left(\frac{\pi f d_m - l}{\pi d_m + fl}\right)` },
          { t: 'Evaluate. A positive result means the screw is self-locking: you must push it down.', m: R`T_L = \frac{${F}(${fm(dm, 4)})}{2}\left(\frac{\pi(${fr})(${fm(dm, 4)}) - ${p}}{\pi(${fm(dm, 4)}) + ${fr}(${p})}\right) = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [((F * dm) / 2) * ((l + PI * fr * dm) / (PI * dm - fr * l)), ((F * d) / 2) * ((PI * fr * d - l) / (PI * d + fr * l)), ((F * dm) / 2) * ((PI * fr * dm) / (PI * dm))]
      };
    }
  });

  add({
    id: 'mc-acme-collar', topic: 'mc', sub: 'Power screws', title: 'Acme screw jack with collar friction', diff: 3, video: true,
    gen(r) {
      const d = r.pick([1, 1.25, 1.5]), p = r.pick([0.2, 0.25]), F = r.pick([2000, 3000, 5000]), fr = r.pick([0.1, 0.12, 0.15]), fc = r.pick([0.08, 0.1, 0.12]), dc = r.pick([1.5, 2, 2.5]);
      const dm = d - p / 2, l = p, sec = 1 / Math.cos(rad(14.5));
      const Ts = ((F * dm) / 2) * ((l + PI * fr * dm * sec) / (PI * dm - fr * l * sec)), Tc = (F * fc * dc) / 2, T = Ts + Tc;
      return {
        prompt: `A screw jack uses a single-start <b>Acme</b> thread (major diameter <b>${d} in</b>, pitch <b>${p} in</b>, thread friction <b>${fr}</b>). The load rests on a thrust collar with mean diameter <b>${dc} in</b> and friction <b>${fc}</b>. What total torque raises <b>${f(F, 5)} lbf</b>?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Geometry: mean diameter and lead. An Acme thread has a 29° included angle, so the thread angle is α = 14.5°.', m: R`d_m = ${fm(dm, 4)}\ \text{in} \qquad l = ${p}\ \text{in} \qquad \sec\alpha = \sec 14.5^\circ = ${fm(sec, 4)}` },
          { t: 'Thread torque. For Acme threads, f is multiplied by sec α:', m: R`T_s = \frac{Fd_m}{2}\left(\frac{l + \pi f d_m\sec\alpha}{\pi d_m - fl\sec\alpha}\right) = ${fm(Ts, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Collar torque:', m: R`T_c = \frac{Ff_cd_c}{2} = \frac{${F}(${fc})(${dc})}{2} = ${fm(Tc, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Total raising torque:', m: R`T = T_s + T_c = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` }
        ],
        distract: [Ts, ((F * dm) / 2) * ((l + PI * fr * dm) / (PI * dm - fr * l)) + Tc, Ts + F * fc * dc]
      };
    }
  });

  add({
    id: 'mc-screw-eff', topic: 'mc', sub: 'Power screws', title: 'Efficiency of a double-start power screw', diff: 3,
    gen(r) {
      const d = r.pick([1, 1.25, 1.5, 2]), p = r.pick([0.2, 0.25, 0.333]), F = r.pick([2000, 4000, 6000]), fr = r.pick([0.08, 0.1, 0.12, 0.15]);
      const dm = d - p / 2, l = 2 * p;
      const T = ((F * dm) / 2) * ((l + PI * fr * dm) / (PI * dm - fr * l)), e = ((F * l) / (2 * PI * T)) * 100;
      const T1 = ((F * dm) / 2) * ((p + PI * fr * dm) / (PI * dm - fr * p)), e1 = ((F * p) / (2 * PI * T1)) * 100;
      return {
        prompt: `A <b>double-start</b> square-thread power screw has a major diameter of <b>${d} in</b>, pitch <b>${p} in</b>, and thread friction <b>${fr}</b>. Neglecting collar friction, what is its efficiency when raising a load?`,
        answer: e, unit: '%',
        steps: [
          { t: 'A double-start thread advances two pitches per turn:', m: R`l = 2p = ${fm(l, 4)}\ \text{in} \qquad d_m = d - \frac{p}{2} = ${fm(dm, 4)}\ \text{in}` },
          { t: `Raising torque (any load works; use F = ${f(F, 5)} lbf):`, m: R`T_R = \frac{Fd_m}{2}\left(\frac{l + \pi f d_m}{\pi d_m - fl}\right) = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'Efficiency = work out / work in per revolution:', m: R`e = \frac{Fl}{2\pi T_R} = \frac{${F}(${fm(l, 4)})}{2\pi(${fm(T, 4)})} = ${fm(e, 3)}\%` },
          { t: `A single-start screw of the same size would be only ${f(e1, 3)}% efficient. More starts raise efficiency but can lose self-locking.` }
        ],
        distract: [e1, (l / (PI * dm)) * 100, 100 - e]
      };
    }
  });

  /* ------------------------------- Shafts & keys ------------------------------- */
  add({
    id: 'mc-shaft-tresca', topic: 'mc', sub: 'Shafts & keys', title: 'Shaft diameter for bending + torsion (max shear)', diff: 3, video: true, fig: 'shaft',
    gen(r) {
      const M = r.pick([3000, 5000, 8000, 12000]), T = r.pick([2000, 4000, 6000, 10000]), Sy = r.pick([50, 60, 71, 85]), n = r.pick([2, 2.5, 3]);
      const d = Math.cbrt(((32 * n) / (PI * Sy * 1000)) * Math.sqrt(M * M + T * T));
      const dvm = Math.cbrt(((16 * n) / (PI * Sy * 1000)) * Math.sqrt(4 * M * M + 3 * T * T));
      return {
        prompt: `A solid steel shaft (S<sub>y</sub> = <b>${Sy} ksi</b>) carries a static bending moment of <b>${f(M, 5)} lbf·in</b> and a torque of <b>${f(T, 5)} lbf·in</b>. Using the maximum-shear-stress theory with a design factor of <b>${n}</b>, what minimum diameter is required?`,
        answer: d, unit: 'in',
        fig: { name: 'shaft', data: { T: 'T', M: 'M', d: 'd = ?' } },
        steps: [
          { t: 'Bending and torsion at the outer fiber combine into a maximum shear stress:', m: R`\tau_{max} = \sqrt{\left(\frac{\sigma}{2}\right)^2 + \tau^2} = \frac{16}{\pi d^3}\sqrt{M^2 + T^2}` },
          { t: 'Maximum-shear (Tresca) allowable: τ<sub>max</sub> = S<sub>y</sub>/(2n). Solve for d:', m: R`d = \left[\frac{32n}{\pi S_y}\sqrt{M^2 + T^2}\right]^{1/3}` },
          { t: 'Evaluate.', m: R`d = \left[\frac{32(${n})}{\pi(${Sy * 1000})}\sqrt{${M}^2 + ${T}^2}\right]^{1/3} = ${fm(d, 4)}\ \text{in}` },
          { t: `The distortion-energy (von Mises) theory would give a slightly smaller ${f(dvm, 4)} in, since Tresca is the conservative choice.` }
        ],
        distract: [dvm, Math.cbrt(((32) / (PI * Sy * 1000)) * Math.sqrt(M * M + T * T)), Math.cbrt(((32 * n) / (PI * Sy * 1000)) * (M + T))]
      };
    }
  });

  add({
    id: 'mc-shaft-twist', topic: 'mc', sub: 'Shafts & keys', title: 'Angle of twist of a steel shaft', diff: 1, fig: 'shaft',
    gen(r) {
      const d = r.pick([1, 1.25, 1.5, 2]), L = r.pick([24, 36, 48, 60]), T = r.pick([2000, 4000, 6000, 8000]), G = 11.5e6;
      const J = (PI * d ** 4) / 32, phi = (T * L) / (J * G), deg = (phi * 180) / PI;
      return {
        prompt: `A <b>${d} in</b> solid steel shaft (G = 11.5×10⁶ psi), <b>${L} in</b> long, transmits <b>${f(T, 5)} lbf·in</b> of torque. What is the angle of twist in degrees?`,
        answer: deg, unit: '°',
        steps: [
          { t: 'Polar moment of inertia of a solid round section:', m: R`J = \frac{\pi d^4}{32} = \frac{\pi(${d})^4}{32} = ${fm(J, 4)}\ \text{in}^4` },
          { t: 'Angle of twist (radians), then degrees:', m: R`\phi = \frac{TL}{JG} = \frac{${T}(${L})}{${fm(J, 4)}(11.5\times10^6)} = ${fm(phi, 4)}\ \text{rad} = ${fm(deg, 4)}^\circ` }
        ],
        distract: [phi, (T * L) / (((PI * d ** 4) / 64) * G) * (180 / PI), deg / 12]
      };
    }
  });

  add({
    id: 'mc-critical-speed', topic: 'mc', sub: 'Shafts & keys', title: 'Critical speed of a shaft carrying a disk', diff: 3, video: true,
    gen(r) {
      const L = r.pick([24, 30, 36, 48]), d = r.pick([1, 1.25, 1.5, 2]), W = r.pick([50, 100, 150, 200]), E = 30e6, g = 386.1;
      const I = (PI * d ** 4) / 64, delta = (W * L ** 3) / (48 * E * I), w = Math.sqrt(g / delta), ncr = (w * 60) / (2 * PI);
      return {
        prompt: `A <b>${W} lbf</b> disk is mounted at the middle of a <b>${d} in</b> steel shaft (E = 30×10⁶ psi) that is simply supported on bearings <b>${L} in</b> apart. Neglecting the shaft's own mass, what is the first critical speed in rpm?`,
        answer: ncr, unit: 'rpm',
        steps: [
          { t: 'Static deflection under the disk (simply supported, center load):', m: R`I = \frac{\pi(${d})^4}{64} = ${fm(I, 4)}\ \text{in}^4 \qquad \delta = \frac{WL^3}{48EI} = ${fm(delta, 4)}\ \text{in}` },
          { t: 'The critical speed equals the lateral natural frequency. Use g = 386.1 in/s² since δ is in inches:', m: R`\omega_{cr} = \sqrt{\frac{g}{\delta}} = \sqrt{\frac{386.1}{${fm(delta, 4)}}} = ${fm(w, 4)}\ \text{rad/s}` },
          { t: 'Convert to rpm.', m: R`n_{cr} = \frac{60\,\omega_{cr}}{2\pi} = ${fm(ncr, 4)}\ \text{rpm}` }
        ],
        distract: [(Math.sqrt(32.174 / delta) * 60) / (2 * PI), w, (Math.sqrt(g / ((W * L ** 3) / (3 * E * I))) * 60) / (2 * PI)]
      };
    }
  });

  add({
    id: 'mc-key-length', topic: 'mc', sub: 'Shafts & keys', title: 'Required length of a square key', diff: 3,
    gen(r) {
      const D = r.pick([1, 1.5, 2, 2.5]), w = D / 4, T = r.pick([3000, 5000, 8000, 12000]), Sy = r.pick([50, 60, 70]), n = r.pick([2, 2.5, 3]);
      const F = (2 * T) / D, Ssy = 0.577 * Sy * 1000, Ls = (F * n) / (w * Ssy), Lb = (2 * F * n) / (w * Sy * 1000), L = Math.max(Ls, Lb);
      return {
        prompt: `A <b>${w} in</b> square key (S<sub>y</sub> = <b>${Sy} ksi</b>) connects a hub to a <b>${D} in</b> shaft transmitting <b>${f(T, 5)} lbf·in</b>. Using a design factor of <b>${n}</b> and the distortion-energy shear strength, what minimum key length satisfies both shear and bearing (crushing)?`,
        answer: L, unit: 'in',
        steps: [
          { t: 'Force at the shaft surface:', m: R`F = \frac{2T}{D} = \frac{2(${T})}{${D}} = ${fm(F, 4)}\ \text{lbf}` },
          { t: 'Shear on the key area wL, with S<sub>sy</sub> = 0.577 S<sub>y</sub>:', m: R`L_{shear} = \frac{Fn}{wS_{sy}} = \frac{${fm(F, 4)}(${n})}{${w}(${fm(Ssy, 4)})} = ${fm(Ls, 4)}\ \text{in}` },
          { t: 'Bearing on half the key height (h/2) against the full yield strength:', m: R`L_{bearing} = \frac{2Fn}{hS_y} = \frac{2(${fm(F, 4)})(${n})}{${w}(${Sy * 1000})} = ${fm(Lb, 4)}\ \text{in}` },
          { t: 'The larger value governs. For square keys, crushing always controls (2 &gt; 1/0.577).', m: R`L = ${fm(L, 4)}\ \text{in}` }
        ],
        distract: [Ls, L / n, (T * n) / (w * Sy * 1000)]
      };
    }
  });

  /* ---------------------------- Pressure vessels & piping ---------------------------- */
  add({
    id: 'mc-asme-shell', topic: 'mc', sub: 'Pressure vessels & piping', title: 'ASME Section VIII shell thickness', diff: 2, fig: 'vessel',
    gen(r) {
      const Pp = r.pick([150, 250, 300, 400, 500]), Di = r.pick([24, 36, 48, 60]), S = r.pick([17500, 20000]), E = r.pick([0.7, 0.85, 1]), CA = r.pick([0, 0.0625, 0.125]);
      const R0 = Di / 2, t0 = (Pp * R0) / (S * E - 0.6 * Pp), t = t0 + CA;
      return {
        prompt: `A cylindrical vessel with an inside diameter of <b>${Di} in</b> is designed to ASME BPVC Section VIII, Div. 1 for an internal pressure of <b>${Pp} psi</b>. The allowable stress is <b>${f(S, 5)} psi</b>, the longitudinal weld joint efficiency is <b>${E}</b>${CA ? `, and the corrosion allowance is <b>${CA} in</b>` : ''}. What minimum shell thickness is required (circumferential stress)?`,
        answer: t, unit: 'in',
        fig: { name: 'vessel', data: { p: `${Pp} psi` } },
        steps: [
          { t: 'ASME VIII Div. 1 formula for circumferential stress (longitudinal joints), with R = inside radius:', m: R`t = \frac{PR}{SE - 0.6P}` },
          { t: 'Evaluate.', m: R`t = \frac{${Pp}(${R0})}{${S}(${E}) - 0.6(${Pp})} = ${fm(t0, 4)}\ \text{in}` },
          { t: CA ? 'Add the corrosion allowance:' : 'No corrosion allowance applies.', m: CA ? R`t_{req} = ${fm(t0, 4)} + ${CA} = ${fm(t, 4)}\ \text{in}` : R`t_{req} = ${fm(t, 4)}\ \text{in}` }
        ],
        distract: [t0 + (CA ? 0 : 0.0625), (Pp * Di) / (S * E - 0.6 * Pp) + CA, (Pp * R0) / (S * E) + CA]
      };
    }
  });

  add({
    id: 'mc-thick-cyl', topic: 'mc', sub: 'Pressure vessels & piping', title: 'Thick-walled cylinder — max hoop stress', diff: 2,
    gen(r) {
      const ri = r.pick([1, 1.5, 2, 3]), k = r.pick([1.3, 1.5, 1.75, 2]), ro = ri * k, p = r.pick([5000, 8000, 10000, 15000]);
      const s = (p * (ro * ro + ri * ri)) / (ro * ro - ri * ri);
      return {
        prompt: `A thick-walled hydraulic cylinder has an inside radius of <b>${ri} in</b> and an outside radius of <b>${f(ro, 4)} in</b>. At an internal pressure of <b>${f(p, 5)} psi</b> (no external pressure), what is the maximum tangential (hoop) stress?`,
        answer: s, unit: 'psi',
        steps: [
          { t: `Wall ratio r<sub>o</sub>/r<sub>i</sub> = ${k}, so thin-wall theory doesn't apply. Use Lamé's equation. The hoop stress is largest at the inner surface (r = r<sub>i</sub>):`, m: R`\sigma_t = \frac{p_i r_i^2}{r_o^2 - r_i^2}\left(1 + \frac{r_o^2}{r^2}\right) \;\xrightarrow{r = r_i}\; \sigma_t = p_i\frac{r_o^2 + r_i^2}{r_o^2 - r_i^2}` },
          { t: 'Evaluate.', m: R`\sigma_t = ${p}\cdot\frac{${fm(ro, 4)}^2 + ${ri}^2}{${fm(ro, 4)}^2 - ${ri}^2} = ${fm(s, 4)}\ \text{psi}` },
          { t: `Thin-wall theory would predict pr/t = ${f((p * ri) / (ro - ri), 4)} psi, which is unconservative here.` }
        ],
        distract: [(p * ri) / (ro - ri), (p * ri * ri) / (ro * ro - ri * ri), (p * (ro * ro + ri * ri)) / (ro * ro)]
      };
    }
  });

  /* ----------------------- Motors, engines & hydraulics ----------------------- */
  add({
    id: 'mc-motor-torque', topic: 'mc', sub: 'Motors & engines', title: 'Induction motor full-load torque from slip', diff: 2,
    gen(r) {
      const poles = r.pick([2, 4, 6]), s = r.pick([2, 3, 4, 5]), H = r.pick([5, 10, 25, 50]);
      const ns = (120 * 60) / poles, n = ns * (1 - s / 100), T = (5252 * H) / n;
      return {
        prompt: `A <b>${H} hp</b>, <b>${poles}-pole</b>, 60 Hz induction motor runs at <b>${s}%</b> slip at full load. What is its full-load torque in lbf·ft?`,
        answer: T, unit: 'lbf·ft',
        steps: [
          { t: 'Synchronous speed:', m: R`n_s = \frac{120f}{p} = \frac{120(60)}{${poles}} = ${ns}\ \text{rpm}` },
          { t: 'Actual rotor speed with slip:', m: R`n = n_s(1 - s) = ${ns}(1 - ${s / 100}) = ${fm(n, 4)}\ \text{rpm}` },
          { t: 'Torque:', m: R`T = \frac{5252H}{n} = \frac{5252(${H})}{${fm(n, 4)}} = ${fm(T, 4)}\ \text{lbf}\cdot\text{ft}` }
        ],
        distract: [(5252 * H) / ns, (63025 * H) / n, (5252 * H) / (ns * s / 100)]
      };
    }
  });

  add({
    id: 'mc-engine-bhp', topic: 'mc', sub: 'Motors & engines', title: 'Engine brake horsepower from bmep', diff: 3,
    gen(r) {
      const bmep = r.pick([90, 110, 125, 150]), B = r.pick([3.5, 4, 4.5]), S = r.pick([3.5, 4, 4.5]), nc = r.pick([4, 6, 8]), N = r.pick([2000, 2500, 3000, 3600]);
      const A = (PI * B * B) / 4, hp = (bmep * (S / 12) * A * (N / 2) * nc) / 33000;
      return {
        prompt: `A <b>${nc}-cylinder, four-stroke</b> engine has a <b>${B} in</b> bore and a <b>${S} in</b> stroke. At <b>${N} rpm</b> the brake mean effective pressure is <b>${bmep} psi</b>. What brake horsepower does it develop?`,
        answer: hp, unit: 'hp',
        steps: [
          { t: 'Piston area and stroke in feet:', m: R`A = \frac{\pi(${B})^2}{4} = ${fm(A, 4)}\ \text{in}^2 \qquad L = \frac{${S}}{12} = ${fm(S / 12, 4)}\ \text{ft}` },
          { t: 'A four-stroke cylinder fires once every two revolutions, so there are N/2 power strokes per minute per cylinder:', m: R`\text{bhp} = \frac{\text{bmep}\cdot L\cdot A\cdot (N/2)\cdot n_c}{33{,}000}` },
          { t: 'Evaluate.', m: R`\text{bhp} = \frac{${bmep}(${fm(S / 12, 4)})(${fm(A, 4)})(${N / 2})(${nc})}{33{,}000} = ${fm(hp, 4)}\ \text{hp}` }
        ],
        distract: [hp * 2, hp * 12, hp / nc]
      };
    }
  });

  add({
    id: 'mc-cyl-retract', topic: 'mc', sub: 'Hydraulic & pneumatic components', title: 'Hydraulic cylinder retract force', diff: 1, fig: 'cylinder',
    gen(r) {
      const D = r.pick([2, 2.5, 3, 4, 5]), dr = r.pick([1, 1.25, 1.5]), p = r.pick([1000, 1500, 2000, 3000]);
      const A = (PI * (D * D - dr * dr)) / 4, F = p * A;
      return {
        prompt: `A double-acting hydraulic cylinder has a <b>${D} in</b> bore and a <b>${dr} in</b> rod. With <b>${f(p, 5)} psi</b> applied to the rod end, what force does it develop while retracting?`,
        answer: F, unit: 'lbf',
        fig: { name: 'cylinder', data: {} },
        steps: [
          { t: 'On the rod end, the pressure acts on the annulus around the rod:', m: R`A_{ann} = \frac{\pi(D^2 - d^2)}{4} = \frac{\pi(${D}^2 - ${dr}^2)}{4} = ${fm(A, 4)}\ \text{in}^2` },
          { t: 'Force:', m: R`F = pA_{ann} = ${p}(${fm(A, 4)}) = ${fm(F, 4)}\ \text{lbf}` }
        ],
        distract: [(p * PI * D * D) / 4, (p * PI * dr * dr) / 4, (p * PI * (D - dr) ** 2) / 4]
      };
    }
  });

  add({
    id: 'mc-hyd-motor', topic: 'mc', sub: 'Hydraulic & pneumatic components', title: 'Hydraulic motor torque and speed', diff: 2,
    gen(r) {
      const Dm = r.pick([1, 2, 3, 5]), dp = r.pick([1000, 1500, 2000, 3000]), Q = r.pick([5, 10, 15, 20]);
      const T = (dp * Dm) / (2 * PI), n = (231 * Q) / Dm, H = (T * n) / 63025;
      return {
        prompt: `An ideal hydraulic motor with a displacement of <b>${Dm} in³/rev</b> receives <b>${Q} gpm</b> with a pressure drop of <b>${f(dp, 5)} psi</b> across it. What output torque does it produce?`,
        answer: T, unit: 'lbf·in',
        steps: [
          { t: 'Work per revolution = pressure × displacement = 2π × torque:', m: R`T = \frac{\Delta p\,D_m}{2\pi} = \frac{${dp}(${Dm})}{2\pi} = ${fm(T, 4)}\ \text{lbf}\cdot\text{in}` },
          { t: 'For completeness, speed and power (1 gal = 231 in³):', m: R`n = \frac{231Q}{D_m} = ${fm(n, 4)}\ \text{rpm} \qquad H = \frac{Tn}{63{,}025} = ${fm(H, 4)}\ \text{hp}` },
          { t: `Check: hydraulic power Δp·Q/1714 = ${f((dp * Q) / 1714, 4)} hp, which matches, as it should for an ideal motor.` }
        ],
        distract: [dp * Dm, (dp * Dm) / PI, (dp * Dm) / (2 * PI * 12)]
      };
    }
  });

  /* ---------------------------- Mechanisms & flywheels ---------------------------- */
  add({
    id: 'mc-slider-crank', topic: 'mc', sub: 'Mechanisms & flywheels', title: 'Piston velocity in a slider-crank', diff: 3,
    gen(r) {
      const rc = r.pick([1.5, 2, 2.5, 3]), lr = r.pick([3.5, 4, 4.5]), l = rc * lr, n = r.pick([600, 1200, 1800, 3000]), th = r.pick([30, 45, 60, 90, 120]);
      const w = (2 * PI * n) / 60, v = rc * w * (Math.sin(rad(th)) + (rc / (2 * l)) * Math.sin(rad(2 * th)));
      return {
        prompt: `A slider-crank mechanism has a <b>${rc} in</b> crank and a <b>${f(l)} in</b> connecting rod. The crank turns at <b>${n} rpm</b>. Using the standard approximation, what is the piston speed when the crank is <b>${th}°</b> from top dead center?`,
        answer: v, unit: 'in/s',
        steps: [
          { t: 'Crank angular velocity:', m: R`\omega = \frac{2\pi(${n})}{60} = ${fm(w, 4)}\ \text{rad/s}` },
          { t: 'Approximate piston velocity, keeping the first-order connecting-rod term:', m: R`v \approx r\omega\left(\sin\theta + \frac{r}{2l}\sin 2\theta\right)` },
          { t: 'Evaluate.', m: R`v = ${rc}(${fm(w, 4)})\left(\sin ${th}^\circ + \frac{${rc}}{2(${f(l)})}\sin ${2 * th}^\circ\right) = ${fm(v, 4)}\ \text{in/s}` }
        ],
        distract: [rc * w, rc * w * Math.sin(rad(th)), rc * n * (Math.sin(rad(th)) + (rc / (2 * l)) * Math.sin(rad(2 * th)))]
      };
    }
  });

  add({
    id: 'mc-flywheel-rim', topic: 'mc', sub: 'Mechanisms & flywheels', title: 'Rim weight of a flywheel', diff: 2,
    gen(r) {
      const dE = r.pick([1500, 2500, 4000, 6000]), n = r.pick([300, 450, 600, 900]), Cs = r.pick([0.02, 0.03, 0.05]), rm = r.pick([12, 15, 18, 24]);
      const w = (2 * PI * n) / 60, I = dE / (Cs * w * w), rf = rm / 12, m = I / (rf * rf), W = m * 32.174;
      return {
        prompt: `A flywheel must absorb an energy fluctuation of <b>${f(dE, 5)} ft·lbf</b> with C<sub>s</sub> = <b>${Cs}</b> at a mean speed of <b>${n} rpm</b>. Treating it as a thin rim with a mean radius of <b>${rm} in</b> (neglect the hub and arms), what rim weight is needed?`,
        answer: W, unit: 'lbf',
        steps: [
          { t: 'Required inertia from the speed fluctuation:', m: R`\omega = ${fm(w, 4)}\ \text{rad/s} \qquad I = \frac{\Delta E}{C_s\omega^2} = ${fm(I, 4)}\ \text{slug}\cdot\text{ft}^2` },
          { t: 'For a thin rim, I = m r². Use r in feet:', m: R`m = \frac{I}{r^2} = \frac{${fm(I, 4)}}{(${fm(rf, 4)})^2} = ${fm(m, 4)}\ \text{slug}` },
          { t: 'Weight:', m: R`W = mg = ${fm(m, 4)}(32.174) = ${fm(W, 4)}\ \text{lbf}` }
        ],
        distract: [2 * W, m, (I / (rm * rm)) * 32.174]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
