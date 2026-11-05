/* Supportive Knowledge — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  /** Standard normal CDF (Abramowitz & Stegun 7.1.26 via erf), |error| < 1.5e-7. */
  const Phi = (z) => {
    const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
  };

  /* ------------------------------ Manufacturing ------------------------------ */
  add({
    id: 'sk-mrr', topic: 'sk', sub: 'Manufacturing processes', title: 'Material removal rate in turning', diff: 1,
    gen(r) {
      const V = r.pick([300, 400, 500, 700]), fd = r.pick([0.008, 0.01, 0.012, 0.015]), d = r.pick([0.05, 0.1, 0.125, 0.15]);
      const MRR = 12 * V * fd * d;
      return {
        prompt: `A steel shaft is turned at a cutting speed of <b>${V} sfm</b> with a feed of <b>${fd} in/rev</b> and a depth of cut of <b>${d} in</b>. What is the material removal rate?`,
        answer: MRR, unit: 'in³/min',
        steps: [
          { t: 'In turning, the removed cross-section (feed × depth) sweeps past the tool at the cutting speed. Convert V to in/min:', m: R`\text{MRR} = 12\,V f d` },
          { t: 'Evaluate.', m: R`\text{MRR} = 12(${V})(${fd})(${d}) = ${fm(MRR, 4)}\ \text{in}^3/\text{min}` },
          { t: 'Power at the tool ≈ MRR × unit power (e.g., ~1 hp·min/in³ for medium-carbon steel).' }
        ],
        distract: [V * fd * d, 12 * V * fd, (12 * V * fd * d) / PI]
      };
    }
  });

  add({
    id: 'sk-taylor', topic: 'sk', sub: 'Manufacturing processes', title: 'Tool life after a speed change (Taylor)', diff: 2, video: true,
    gen(r) {
      const n = r.pick([0.125, 0.25, 0.3]), V1 = r.pick([300, 400, 500]), T1 = r.pick([30, 45, 60]), k = r.pick([1.2, 1.25, 1.5]);
      const V2 = V1 * k, T2 = T1 * Math.pow(V1 / V2, 1 / n);
      return {
        prompt: `A ${n === 0.125 ? 'high-speed steel' : 'carbide'} tool lasts <b>${T1} min</b> at <b>${V1} sfm</b>. The Taylor exponent is n = <b>${n}</b>. If the cutting speed is increased to <b>${f(V2)} sfm</b>, what is the new tool life?`,
        answer: T2, unit: 'min',
        steps: [
          { t: 'Taylor tool-life equation, with C the same at both speeds:', m: R`V_1T_1^n = V_2T_2^n = C` },
          { t: 'Solve for T₂:', m: R`T_2 = T_1\left(\frac{V_1}{V_2}\right)^{1/n} = ${T1}\left(\frac{${V1}}{${f(V2)}}\right)^{1/${n}} = ${fm(T2, 4)}\ \text{min}` },
          { t: `A ${Math.round((k - 1) * 100)}% speed increase cuts tool life by ${f((1 - T2 / T1) * 100, 3)}%. Tool life is very sensitive to speed.` }
        ],
        distract: [T1 / k, T1 * Math.pow(V1 / V2, n), T1 * (V1 / V2) ** 2]
      };
    }
  });

  add({
    id: 'sk-milling-time', topic: 'sk', sub: 'Manufacturing processes', title: 'Time for a face/slab milling pass', diff: 2,
    gen(r) {
      const D = r.pick([2, 3, 4]), nt = r.pick([4, 6, 8]), ft = r.pick([0.004, 0.006, 0.008]), V = r.pick([300, 400, 600]), L = r.pick([8, 12, 18, 24]);
      const N = (12 * V) / (PI * D), fr = N * nt * ft, t = (L + D) / fr;
      return {
        prompt: `A <b>${D} in</b> diameter, <b>${nt}-tooth</b> milling cutter runs at <b>${V} sfm</b> with a chip load of <b>${ft} in/tooth</b>. How long does it take to mill a <b>${L} in</b> long surface if the approach plus overtravel allowance equals one cutter diameter?`,
        answer: t, unit: 'min',
        steps: [
          { t: 'Spindle speed:', m: R`N = \frac{12V}{\pi D} = \frac{12(${V})}{\pi(${D})} = ${fm(N, 4)}\ \text{rpm}` },
          { t: 'Table feed rate:', m: R`f_r = N\,n_t\,f_t = ${fm(N, 4)}(${nt})(${ft}) = ${fm(fr, 4)}\ \text{in/min}` },
          { t: 'Cutting time including the allowance:', m: R`t = \frac{L + D}{f_r} = \frac{${L} + ${D}}{${fm(fr, 4)}} = ${fm(t, 3)}\ \text{min}` }
        ],
        distract: [L / fr, (L + D) / (N * ft), (L + D) / ((V / (PI * D)) * nt * ft)]
      };
    }
  });

  add({
    id: 'sk-bend-allowance', topic: 'sk', sub: 'Manufacturing processes', title: 'Sheet-metal bend allowance', diff: 2,
    gen(r) {
      const t = r.pick([0.0625, 0.09, 0.125]), Rb = r.pick([0.125, 0.1875, 0.25, 0.5]), ang = r.pick([45, 60, 90, 120]);
      const K = Rb < 2 * t ? 0.33 : 0.5, BA = ((ang * PI) / 180) * (Rb + K * t);
      return {
        prompt: `A <b>${t} in</b> thick sheet is bent through <b>${ang}°</b> with an inside bend radius of <b>${Rb} in</b>. Using a neutral-axis factor of K = <b>${K}</b>${K === 0.33 ? ' (R &lt; 2t)' : ' (R ≥ 2t)'}, what is the bend allowance (developed length of the bend)?`,
        answer: BA, unit: 'in',
        steps: [
          { t: 'During bending, the neutral axis shifts toward the inside of the bend, at a distance Kt from the inner surface:', m: R`BA = \alpha\,(R + Kt)\quad(\alpha \text{ in radians})` },
          { t: 'Evaluate.', m: R`BA = \frac{${ang}\pi}{180}(${Rb} + ${K}(${t})) = ${fm((ang * PI) / 180, 4)}(${fm(Rb + K * t, 4)}) = ${fm(BA, 4)}\ \text{in}` }
        ],
        distract: [((ang * PI) / 180) * Rb, ((ang * PI) / 180) * (Rb + t), ang * (Rb + K * t)]
      };
    }
  });

  /* ------------------------------ Fits & GD&T ------------------------------ */
  add({
    id: 'sk-mmc-bonus', topic: 'sk', sub: 'Fits & tolerances / GD&T', title: 'Position tolerance with MMC bonus', diff: 2, video: true,
    gen(r) {
      const nom = r.pick([0.25, 0.375, 0.5, 0.75]), tolp = r.pick([0.003, 0.005, 0.008]), pos = r.pick([0.005, 0.01, 0.014]);
      const made = +(nom + r.pick([0.25, 0.5, 0.75, 1]) * tolp).toFixed(4), total = pos + (made - nom);
      return {
        prompt: `A hole is dimensioned <b>Ø${nom.toFixed(3)} +${tolp.toFixed(3)}/−0.000 in</b> with a position tolerance of <b>Ø${pos.toFixed(3)} at MMC</b>. The hole is produced at <b>Ø${made.toFixed(4)} in</b>. What total position tolerance zone diameter is allowed for this part?`,
        answer: total, unit: 'in', tol: 0.005,
        steps: [
          { t: 'For a hole (internal feature), MMC is the smallest size, the most material left in the part:', m: R`\text{MMC} = ${nom.toFixed(3)}\ \text{in}` },
          { t: 'Bonus tolerance equals the departure of the actual size from MMC:', m: R`\text{bonus} = ${made.toFixed(4)} - ${nom.toFixed(3)} = ${fm(made - nom, 4)}\ \text{in}` },
          { t: 'Total allowed position tolerance:', m: R`\varnothing\,${pos.toFixed(3)} + ${fm(made - nom, 4)} = \varnothing\,${fm(total, 4)}\ \text{in}` },
          { t: 'The bonus maxes out at LMC (here ' + (pos + tolp).toFixed(3) + ' in). Without the Ⓜ modifier (RFS), no bonus applies.' }
        ],
        distract: [pos, pos + tolp, pos - (made - nom)]
      };
    }
  });

  add({
    id: 'sk-virtual-condition', topic: 'sk', sub: 'Fits & tolerances / GD&T', title: 'Virtual condition of a pin', diff: 2,
    gen(r) {
      const nom = r.pick([0.25, 0.5, 0.625, 1]), pm = r.pick([0.001, 0.002, 0.003]), g = r.pick([0.002, 0.003, 0.005]);
      const MMC = nom + pm, VC = MMC + g;
      return {
        prompt: `A pin is dimensioned <b>Ø${nom.toFixed(3)} ± ${pm.toFixed(3)} in</b> with a perpendicularity tolerance of <b>Ø${g.toFixed(3)} at MMC</b> to datum A. What is the pin's virtual condition, i.e., the smallest gauge hole it must always fit?`,
        answer: VC, unit: 'in', tol: 0.001,
        steps: [
          { t: 'For a pin (external feature), MMC is the largest size:', m: R`\text{MMC} = ${nom.toFixed(3)} + ${pm.toFixed(3)} = ${MMC.toFixed(3)}\ \text{in}` },
          { t: 'Virtual condition for an external feature = MMC + geometric tolerance at MMC:', m: R`VC = ${MMC.toFixed(3)} + ${g.toFixed(3)} = ${VC.toFixed(3)}\ \text{in}` },
          { t: 'A functional gauge hole of this size, perpendicular to datum A, accepts every good part. For holes, VC = MMC − tolerance.' }
        ],
        distract: [MMC - g, nom + g, MMC]
      };
    }
  });

  add({
    id: 'sk-min-interference', topic: 'sk', sub: 'Fits & tolerances / GD&T', title: 'Minimum and maximum interference of a force fit', diff: 1,
    gen(r) {
      const D = r.pick([1, 1.5, 2, 3]), th = r.pick([0.001, 0.0012, 0.0016]), ts = r.pick([0.0006, 0.001]), base = r.pick([0.0015, 0.002, 0.0025]);
      const hmax = D + th, smin = D + base, smax = smin + ts, imin = smin - hmax, imax = smax - D;
      return {
        prompt: `A hub bore is <b>${D.toFixed(4)} +${th.toFixed(4)}/−0.0000 in</b> and the shaft is <b>${smin.toFixed(4)} +${ts.toFixed(4)}/−0.0000 in</b>. What is the <b>minimum</b> interference?`,
        answer: imin, unit: 'in', tol: 0.02,
        steps: [
          { t: 'Minimum interference = smallest shaft − largest hole (the loosest condition):', m: R`i_{min} = ${smin.toFixed(4)} - ${hmax.toFixed(4)} = ${imin.toFixed(4)}\ \text{in}` },
          { t: `Maximum interference = largest shaft − smallest hole = ${smax.toFixed(4)} − ${D.toFixed(4)} = ${imax.toFixed(4)} in. Use it for the stress check; use the minimum for the torque-capacity check.` }
        ],
        distract: [imax, smin - D, base]
      };
    }
  });

  /* ---------------------------- Quality & reliability ---------------------------- */
  add({
    id: 'sk-out-of-spec', topic: 'sk', sub: 'Quality, reliability & statistics', title: 'Percent out of specification (normal distribution)', diff: 2, video: true,
    gen(r) {
      const mu = r.pick([1, 2.5, 0.75]), sig = r.pick([0.0008, 0.001, 0.0012]), zU = r.pick([1.5, 2, 2.5]), zL = r.pick([2, 2.5, 3]);
      const usl = mu + zU * sig, lsl = mu - zL * sig, out = (1 - Phi(zU) + (1 - Phi(zL))) * 100;
      return {
        prompt: `Bore diameters are normally distributed with mean <b>${mu.toFixed(4)} in</b> and standard deviation <b>${sig} in</b>. The specification is <b>${lsl.toFixed(4)}</b> to <b>${usl.toFixed(4)} in</b>. What percentage of parts will be out of specification?`,
        answer: out, unit: '%', tol: 0.03,
        steps: [
          { t: 'Standardize each limit:', m: R`z_U = \frac{USL - \mu}{\sigma} = \frac{${usl.toFixed(4)} - ${mu.toFixed(4)}}{${sig}} = ${fm(zU, 3)} \qquad z_L = \frac{\mu - LSL}{\sigma} = ${fm(zL, 3)}` },
          { t: 'Tail areas from the standard normal table (Φ = cumulative probability):', m: R`P(z > ${fm(zU, 3)}) = 1 - \Phi(${fm(zU, 3)}) = ${fm(1 - Phi(zU), 4)} \qquad P(z < -${fm(zL, 3)}) = ${fm(1 - Phi(zL), 4)}` },
          { t: 'Total fraction out of spec:', m: R`${fm(1 - Phi(zU), 4)} + ${fm(1 - Phi(zL), 4)} = ${fm(out / 100, 4)} = ${fm(out, 3)}\%` }
        ],
        distract: [(1 - Phi(zU)) * 100, (2 * (1 - Phi(Math.min(zU, zL)))) * 100, (1 - Phi(zU) + (1 - Phi(zL))) * 50]
      };
    }
  });

  add({
    id: 'sk-exp-reliability', topic: 'sk', sub: 'Quality, reliability & statistics', title: 'Reliability with a constant failure rate', diff: 1,
    gen(r) {
      const mtbf = r.pick([5000, 10000, 20000, 50000]), t = r.pick([1000, 2000, 5000, 8760]);
      const R0 = Math.exp(-t / mtbf);
      return {
        prompt: `A sensor has a constant failure rate with an MTBF of <b>${f(mtbf, 6)} h</b>. What is the probability that it operates without failure for <b>${f(t, 5)} h</b>?`,
        answer: R0, unit: '', tol: 0.005,
        steps: [
          { t: 'Constant failure rate (exponential distribution):', m: R`\lambda = \frac{1}{\text{MTBF}} = \frac{1}{${mtbf}} = ${fm(1 / mtbf, 4)}\ \text{h}^{-1}` },
          { t: 'Reliability:', m: R`R(t) = e^{-\lambda t} = e^{-${t}/${mtbf}} = ${fm(R0, 4)}` },
          { t: 'Note: at t = MTBF, R = e⁻¹ = 36.8%. Most units fail before the "mean" time.' }
        ],
        distract: [1 - t / mtbf, Math.exp(-mtbf / t), 1 - Math.exp(-t / mtbf)]
      };
    }
  });

  add({
    id: 'sk-stress-strength', topic: 'sk', sub: 'Quality, reliability & statistics', title: 'Reliability from stress–strength interference', diff: 3,
    gen(r) {
      const muS = r.pick([60, 70, 80]), sS = r.pick([3, 4, 5]), mus = r.pick([45, 50, 55]), ss = r.pick([4, 5, 6]);
      const z = (muS - mus) / Math.sqrt(sS * sS + ss * ss), R0 = Phi(z);
      return {
        prompt: `A part's strength is normally distributed with mean <b>${muS} ksi</b> and standard deviation <b>${sS} ksi</b>. The applied stress is normal with mean <b>${mus} ksi</b> and standard deviation <b>${ss} ksi</b>. What is the reliability, the probability that strength exceeds stress?`,
        answer: R0, unit: '', tol: 0.003,
        steps: [
          { t: 'The margin m = S − σ is also normal:', m: R`\mu_m = ${muS} - ${mus} = ${muS - mus}\ \text{ksi} \qquad \sigma_m = \sqrt{${sS}^2 + ${ss}^2} = ${fm(Math.sqrt(sS * sS + ss * ss), 4)}\ \text{ksi}` },
          { t: 'Failure when m &lt; 0. Standardize:', m: R`z = \frac{\mu_m}{\sigma_m} = ${fm(z, 4)}` },
          { t: 'Reliability from the normal table:', m: R`R = \Phi(${fm(z, 3)}) = ${fm(R0, 4)}` },
          { t: `The mean factor of safety ${f(muS / mus, 3)} alone says nothing about reliability. Variability matters.` }
        ],
        distract: [Phi((muS - mus) / (sS + ss)), Phi((muS - mus) / sS), 1 - Phi(z)]
      };
    }
  });

  /* ---------------------------- Testing & instrumentation ---------------------------- */
  add({
    id: 'sk-strain-gauge', topic: 'sk', sub: 'Testing & instrumentation', title: 'Stress from a strain gauge resistance change', diff: 2,
    gen(r) {
      const R0 = r.pick([120, 350]), GF = r.pick([2, 2.05, 2.1]), E = r.pick([30e6, 10e6]), eps = r.pick([200, 400, 600, 900]) * 1e-6;
      const dR = +(GF * eps * R0).toFixed(4), e2 = dR / (R0 * GF), s = E * e2;
      return {
        prompt: `A <b>${R0} Ω</b> strain gauge (gauge factor <b>${GF}</b>) bonded to a ${E === 30e6 ? 'steel' : 'aluminum'} member (E = ${E / 1e6}×10⁶ psi) aligned with a uniaxial stress shows a resistance increase of <b>${dR} Ω</b>. What is the stress in the member?`,
        answer: s, unit: 'psi',
        steps: [
          { t: 'Gauge factor definition: GF = (ΔR/R)/ε. Solve for strain:', m: R`\varepsilon = \frac{\Delta R}{R\cdot GF} = \frac{${dR}}{${R0}(${GF})} = ${fm(e2 * 1e6, 4)}\ \mu\varepsilon` },
          { t: 'Uniaxial stress (Hooke’s law):', m: R`\sigma = E\varepsilon = ${fm(E)}(${fm(e2, 4)}) = ${fm(s, 4)}\ \text{psi}` },
          { t: 'Resistance increased, so the member is in tension.' }
        ],
        distract: [(E * dR) / R0, E * dR * GF / R0, (E * dR) / (R0 * GF) / 1000]
      };
    }
  });

  add({
    id: 'sk-bridge', topic: 'sk', sub: 'Testing & instrumentation', title: 'Strain from a Wheatstone bridge output', diff: 3, video: true,
    gen(r) {
      const cfg = r.pick([{ n: 'quarter bridge (one active gauge)', k: 1 }, { n: 'half bridge with two active gauges on opposite faces of a beam in bending', k: 2 }, { n: 'full bridge with four active gauges (two in tension, two in compression)', k: 4 }]);
      const Vex = r.pick([5, 10]), GF = 2, Vo = r.pick([1, 2, 3, 5]) * 1e-3;
      const eps = (4 * Vo) / (cfg.k * GF * Vex);
      return {
        prompt: `A strain-gauge circuit is wired as a <b>${cfg.n}</b>, gauge factor <b>${GF}</b>, excitation <b>${Vex} V</b>. The output reads <b>${f(Vo * 1000)} mV</b>. Using the small-strain approximation, what is the bending strain at the gauge location?`,
        answer: eps * 1e6, unit: 'με',
        steps: [
          { t: 'Small-strain bridge output; N is the number of active arms adding their signals:', m: R`\frac{V_o}{V_{ex}} \approx \frac{N\cdot GF\cdot\varepsilon}{4}` },
          { t: `Here N = ${cfg.k}. Solve for ε:`, m: R`\varepsilon = \frac{4V_o}{N\cdot GF\cdot V_{ex}} = \frac{4(${fm(Vo)})}{${cfg.k}(${GF})(${Vex})} = ${fm(eps * 1e6, 4)}\ \mu\varepsilon` },
          { t: 'More active arms mean more output per unit strain, and adjacent active arms cancel temperature effects.' }
        ],
        distract: [((4 * Vo) / (GF * Vex)) * 1e6, (Vo / (GF * Vex)) * 1e6, ((4 * Vo) / (cfg.k * Vex)) * 1e6]
      };
    }
  });

  add({
    id: 'sk-rtd', topic: 'sk', sub: 'Testing & instrumentation', title: 'Temperature from an RTD reading', diff: 1,
    gen(r) {
      const R0 = r.pick([100, 1000]), alpha = 0.00385, T = r.pick([50, 80, 120, 200, 250]);
      const Rt = +(R0 * (1 + alpha * T)).toFixed(2), T2 = (Rt / R0 - 1) / alpha;
      return {
        prompt: `A platinum RTD (R₀ = <b>${R0} Ω</b> at 0 °C, α = <b>0.00385 /°C</b>) reads <b>${Rt} Ω</b> in a hydraulic oil line. Using the linear approximation, what is the oil temperature?`,
        answer: T2, unit: '°C',
        steps: [
          { t: 'Linear RTD relation:', m: R`R_T = R_0(1 + \alpha T)` },
          { t: 'Solve for T.', m: R`T = \frac{R_T/R_0 - 1}{\alpha} = \frac{${Rt}/${R0} - 1}{0.00385} = ${fm(T2, 4)}\ ^\circ\text{C}` },
          { t: `That’s ${f(T2 * 1.8 + 32, 4)} °F. For high accuracy, use the Callendar–Van Dusen equation.` }
        ],
        distract: [(Rt - R0) / alpha, (Rt / R0) / alpha, T2 * 1.8 + 32]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
