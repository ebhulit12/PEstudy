/* Vibration — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const gin = 386.1;

  add({
    id: 'vib-cantilever-mass', topic: 'vib', sub: 'Natural frequency', title: 'Natural frequency of a mass on a cantilever', diff: 2, fig: 'cantilever',
    gen(r) {
      const W = r.pick([10, 20, 50, 100]), L = r.pick([12, 18, 24, 36]), b = r.pick([1, 1.5, 2]), h = r.pick([0.25, 0.375, 0.5]), E = 30e6;
      const I = (b * h ** 3) / 12, k = (3 * E * I) / L ** 3, m = W / gin, fn = Math.sqrt(k / m) / (2 * PI);
      return {
        prompt: `A <b>${W} lbf</b> instrument is mounted at the free end of a steel cantilever (E = 30×10⁶ psi), <b>${L} in</b> long, with a <b>${b} in</b> wide × <b>${h} in</b> thick rectangular section. Neglecting the beam's mass, what is the natural frequency of vertical vibration?`,
        answer: fn, unit: 'Hz',
        fig: { name: 'cantilever', data: { P: `${W} lbf`, L: `${L} in` } },
        steps: [
          { t: 'Beam stiffness at the tip (end load on a cantilever):', m: R`I = \frac{bh^3}{12} = ${fm(I, 4)}\ \text{in}^4 \qquad k = \frac{3EI}{L^3} = ${fm(k, 4)}\ \text{lbf/in}` },
          { t: 'Mass in lbf·s²/in (inches are used throughout):', m: R`m = \frac{W}{386.1} = ${fm(m, 4)}\ \text{lbf}\cdot\text{s}^2/\text{in}` },
          { t: 'Natural frequency:', m: R`f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}} = \frac{1}{2\pi}\sqrt{\frac{${fm(k, 4)}}{${fm(m, 4)}}} = ${fm(fn, 4)}\ \text{Hz}` },
          { t: 'Check: the static deflection δ = W/k gives the same answer through f<sub>n</sub> = 3.13/√δ.' }
        ],
        distract: [Math.sqrt(k / m), Math.sqrt(((48 * E * I) / L ** 3) / m) / (2 * PI), Math.sqrt(k / (W / 32.174)) / (2 * PI)]
      };
    }
  });

  add({
    id: 'vib-torsional', topic: 'vib', sub: 'Natural frequency', title: 'Torsional natural frequency of a disk on a shaft', diff: 2, video: true, fig: 'shaft',
    gen(r) {
      const d = r.pick([0.5, 0.75, 1]), L = r.pick([12, 18, 24, 36]), W = r.pick([20, 50, 100]), D = r.pick([8, 12, 16]), G = 11.5e6;
      const J = (PI * d ** 4) / 32, kt = (G * J) / L, I = 0.5 * (W / gin) * (D / 2) ** 2, fn = Math.sqrt(kt / I) / (2 * PI);
      return {
        prompt: `A <b>${W} lbf</b> solid disk, <b>${D} in</b> in diameter, is fixed to the end of a <b>${d} in</b> steel shaft (G = 11.5×10⁶ psi) that is <b>${L} in</b> long and clamped at its other end. What is the torsional natural frequency?`,
        answer: fn, unit: 'Hz',
        fig: { name: 'shaft', data: { T: '', d: `d = ${d} in` } },
        steps: [
          { t: 'Torsional stiffness of the shaft:', m: R`J = \frac{\pi d^4}{32} = ${fm(J, 4)}\ \text{in}^4 \qquad k_t = \frac{GJ}{L} = ${fm(kt, 4)}\ \text{lbf}\cdot\text{in/rad}` },
          { t: 'Mass moment of inertia of the disk (inch units):', m: R`I = \tfrac12\frac{W}{386.1}r^2 = \tfrac12\cdot\frac{${W}}{386.1}(${D / 2})^2 = ${fm(I, 4)}\ \text{lbf}\cdot\text{in}\cdot\text{s}^2` },
          { t: 'Torsional analog of √(k/m):', m: R`f_n = \frac{1}{2\pi}\sqrt{\frac{k_t}{I}} = ${fm(fn, 4)}\ \text{Hz}` }
        ],
        distract: [Math.sqrt(kt / I), Math.sqrt(kt / ((W / gin) * (D / 2) ** 2)) / (2 * PI), Math.sqrt(((G * (PI * d ** 4) / 64) / L) / I) / (2 * PI)]
      };
    }
  });

  add({
    id: 'vib-pendulum', topic: 'vib', sub: 'Natural frequency', title: 'Period of a simple pendulum', diff: 1,
    gen(r) {
      const L = r.pick([12, 24, 36, 48, 60]);
      const T = 2 * PI * Math.sqrt(L / gin);
      return {
        prompt: `A hook block hangs from an overhead crane on a cable, with its center of mass <b>${L} in</b> below the trolley. Treating it as a simple pendulum (small swings), what is its period of oscillation?`,
        answer: T, unit: 's',
        steps: [
          { t: 'For small angles, sin θ ≈ θ and the pendulum is a linear oscillator:', m: R`\omega_n = \sqrt{\frac{g}{L}} = \sqrt{\frac{386.1}{${L}}} = ${fm(Math.sqrt(gin / L), 4)}\ \text{rad/s}` },
          { t: 'Period:', m: R`T = \frac{2\pi}{\omega_n} = 2\pi\sqrt{\frac{L}{g}} = ${fm(T, 4)}\ \text{s}` },
          { t: 'The mass cancels, so only the length matters.' }
        ],
        distract: [Math.sqrt(gin / L) / (2 * PI), 2 * PI * Math.sqrt(L / 32.174), Math.sqrt(L / gin)]
      };
    }
  });

  add({
    id: 'vib-damped-freq', topic: 'vib', sub: 'Damping', title: 'Damped natural frequency', diff: 1,
    gen(r) {
      const fn = r.pick([5, 10, 15, 25]), z = r.pick([0.05, 0.1, 0.2, 0.3, 0.5]);
      const fd = fn * Math.sqrt(1 - z * z);
      return {
        prompt: `A machine mount has an undamped natural frequency of <b>${fn} Hz</b> and a damping ratio of <b>${z}</b>. At what frequency does it oscillate freely after a bump?`,
        answer: fd, unit: 'Hz', tol: 0.005,
        steps: [
          { t: 'Free underdamped oscillation occurs at the damped natural frequency:', m: R`f_d = f_n\sqrt{1 - \zeta^2} = ${fn}\sqrt{1 - ${z}^2} = ${fm(fd, 4)}\ \text{Hz}` },
          { t: `For light damping the shift is tiny (ζ = 0.1 lowers the frequency by only 0.5%). The amplitude decays as e<sup>−ζω<sub>n</sub>t</sup>.` }
        ],
        distract: [fn * (1 - z), fn * Math.sqrt(1 + z * z), fn * (1 - z * z)]
      };
    }
  });

  add({
    id: 'vib-forced-amplitude', topic: 'vib', sub: 'Forced vibration & isolation', title: 'Steady-state amplitude under a harmonic force', diff: 2, fig: 'springMass',
    gen(r) {
      const F0 = r.pick([20, 50, 100]), k = r.pick([500, 1000, 2000]), z = r.pick([0.05, 0.1, 0.2]), rr = r.pick([0.5, 0.8, 1.2, 1.5, 2]);
      const X = (F0 / k) / Math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2);
      return {
        prompt: `A spring–mass–damper (k = <b>${k} lbf/in</b>, ζ = <b>${z}</b>) is driven by a harmonic force of amplitude <b>${F0} lbf</b> at a frequency ratio r = ω/ω<sub>n</sub> = <b>${rr}</b>. What is the steady-state displacement amplitude?`,
        answer: X, unit: 'in',
        fig: { name: 'springMass', data: { c: 'c' } },
        steps: [
          { t: 'Static deflection under the force amplitude:', m: R`X_{st} = \frac{F_0}{k} = \frac{${F0}}{${k}} = ${fm(F0 / k, 4)}\ \text{in}` },
          { t: 'Dynamic magnification factor:', m: R`M = \frac{1}{\sqrt{(1 - r^2)^2 + (2\zeta r)^2}} = \frac{1}{\sqrt{(1 - ${fm(rr * rr, 4)})^2 + (2\cdot${z}\cdot${rr})^2}} = ${fm(X / (F0 / k), 4)}` },
          { t: 'Amplitude:', m: R`X = M\,X_{st} = ${fm(X, 4)}\ \text{in}` }
        ],
        distract: [F0 / k, (F0 / k) / Math.abs(1 - rr * rr), (F0 / k) / (2 * z)]
      };
    }
  });

  add({
    id: 'vib-damped-tr', topic: 'vib', sub: 'Forced vibration & isolation', title: 'Force transmitted through damped isolators', diff: 2,
    gen(r) {
      const F0 = r.pick([200, 500, 1000]), z = r.pick([0.05, 0.1, 0.2, 0.3]), rr = r.pick([2, 2.5, 3, 4]);
      const TR = Math.sqrt((1 + (2 * z * rr) ** 2) / ((1 - rr * rr) ** 2 + (2 * z * rr) ** 2)), Ft = TR * F0;
      return {
        prompt: `A compressor produces a harmonic shaking force of <b>${F0} lbf</b>. It sits on isolators with damping ratio <b>${z}</b>, and the operating frequency is <b>${rr}×</b> the natural frequency. What force amplitude is transmitted to the floor?`,
        answer: Ft, unit: 'lbf',
        steps: [
          { t: 'Force transmissibility with damping:', m: R`TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1 - r^2)^2 + (2\zeta r)^2}} = \sqrt{\frac{1 + (${fm(2 * z * rr, 4)})^2}{(1 - ${rr * rr})^2 + (${fm(2 * z * rr, 4)})^2}} = ${fm(TR, 4)}` },
          { t: 'Transmitted force:', m: R`F_T = TR\cdot F_0 = ${fm(TR, 4)}(${F0}) = ${fm(Ft, 4)}\ \text{lbf}` },
          { t: `Undamped, TR would be ${f(1 / (rr * rr - 1), 3)}. Above r = √2, damping <i>increases</i> transmission.` }
        ],
        distract: [F0 / (rr * rr - 1), F0 / Math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2), F0 * (1 - TR)]
      };
    }
  });

  add({
    id: 'vib-unbalance', topic: 'vib', sub: 'Forced vibration & isolation', title: 'Vibration amplitude from a rotating unbalance', diff: 3, video: true,
    gen(r) {
      const Wt = r.pick([200, 400, 800]), ue = r.pick([0.5, 1, 2, 4]), k = r.pick([2000, 5000, 10000]), z = r.pick([0.05, 0.1, 0.15]), n = r.pick([900, 1200, 1800, 3600]);
      const M = Wt / gin, wn = Math.sqrt(k / M), w = (2 * PI * n) / 60, rr = w / wn;
      const me = ue / gin, X = ((me / M) * rr * rr) / Math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2);
      return {
        prompt: `A <b>${Wt} lbf</b> fan on spring mounts (total k = <b>${f(k, 5)} lbf/in</b>, ζ = <b>${z}</b>) runs at <b>${n} rpm</b>. Its rotor has an unbalance of <b>${ue} lbf·in</b> (weight × eccentricity). What is the steady-state vertical vibration amplitude?`,
        answer: X * 1000, unit: 'mils',
        steps: [
          { t: 'Natural and forcing frequencies (inch units):', m: R`M = \frac{${Wt}}{386.1} = ${fm(M, 4)} \qquad \omega_n = \sqrt{\frac{k}{M}} = ${fm(wn, 4)}\ \text{rad/s} \qquad \omega = ${fm(w, 4)}\ \text{rad/s} \qquad r = ${fm(rr, 4)}` },
          { t: 'Unbalance m<sub>0</sub>e in mass units, and the rotating-unbalance response (force F = m<sub>0</sub>eω² grows with speed):', m: R`m_0e = \frac{${ue}}{386.1} = ${fm(me, 4)}\ \text{lbf}\cdot\text{s}^2 \qquad X = \frac{m_0e}{M}\cdot\frac{r^2}{\sqrt{(1 - r^2)^2 + (2\zeta r)^2}}` },
          { t: 'Evaluate.', m: R`X = \frac{${fm(me, 4)}}{${fm(M, 4)}}\cdot\frac{${fm(rr * rr, 4)}}{\sqrt{(1 - ${fm(rr * rr, 4)})^2 + (${fm(2 * z * rr, 4)})^2}} = ${fm(X, 4)}\ \text{in} = ${fm(X * 1000, 4)}\ \text{mils}` },
          { t: 'Far above resonance (r ≫ 1), X approaches m<sub>0</sub>e/M. That is the rotor’s mass center staying still while the frame orbits.' }
        ],
        distract: [(me / M) * 1000, (((me * w * w) / k) / Math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2)) * 1000 * 1.5, ((me / M) * rr * rr) / Math.abs(1 - rr * rr) * 1000 * 2]
      };
    }
  });

  add({
    id: 'vib-isolator-design', topic: 'vib', sub: 'Forced vibration & isolation', title: 'Isolator static deflection for a target transmissibility', diff: 3,
    gen(r) {
      const n = r.pick([600, 900, 1200, 1750, 3600]), TR = r.pick([0.05, 0.1, 0.15, 0.2]);
      const f0 = n / 60, rr = Math.sqrt(1 + 1 / TR), fn = f0 / rr, wn = 2 * PI * fn, d = gin / (wn * wn);
      return {
        prompt: `A pump running at <b>${n} rpm</b> must be isolated so that only <b>${Math.round(TR * 100)}%</b> of its shaking force reaches the floor. Assuming undamped isolators, what minimum static deflection must the isolators have under the pump's weight?`,
        answer: d, unit: 'in',
        steps: [
          { t: 'Undamped isolation (r > √2): TR = 1/(r² − 1). Solve for the required frequency ratio:', m: R`r^2 = 1 + \frac{1}{TR} = 1 + \frac{1}{${TR}} = ${fm(rr * rr, 4)} \;\Rightarrow\; r = ${fm(rr, 4)}` },
          { t: 'Maximum allowable natural frequency:', m: R`f_n = \frac{f}{r} = \frac{${n}/60}{${fm(rr, 4)}} = ${fm(fn, 4)}\ \text{Hz}` },
          { t: 'Static deflection that gives this f<sub>n</sub> (ω<sub>n</sub>² = g/δ):', m: R`\delta_{st} = \frac{g}{(2\pi f_n)^2} = \frac{386.1}{(2\pi\cdot${fm(fn, 4)})^2} = ${fm(d, 4)}\ \text{in}` },
          { t: 'Softer mounts (larger δ) give better isolation, at the cost of larger motion when starting through resonance.' }
        ],
        distract: [gin / (2 * PI * f0) ** 2, 32.174 / (wn * wn), gin / (2 * PI * (f0 / Math.sqrt(1 / TR))) ** 2]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
