/* Engineering Science & Mechanics — additional parameterized problems (see problems.js for the format).
   Keep the layout: every problem is a top-level `  add({ … });` block (the free-sample builder relies on it). */
(function () {
  'use strict';
  const fm = U.fm, f = U.fmt, PI = Math.PI;
  const P = [];
  const add = (p) => P.push(p);
  const rad = (d) => (d * PI) / 180;
  const g = 32.174;

  /* ---------------------------------- Statics ---------------------------------- */
  add({
    id: 'esm-two-bar', topic: 'esm', sub: 'Statics', title: 'Forces in a two-bar bracket', diff: 2,
    gen(r) {
      const W = r.pick([500, 1000, 1500, 2000]), th = r.pick([30, 40, 45, 50, 60]);
      const Fbc = W / Math.sin(rad(th)), Fab = W / Math.tan(rad(th));
      return {
        prompt: `A wall bracket has a horizontal member AB and a strut BC that rises to the wall at <b>${th}°</b> above the horizontal (both pin-connected two-force members). A <b>${f(W, 5)} lbf</b> load hangs from joint B. What is the force in the horizontal member AB?`,
        answer: Fab, unit: 'lbf',
        steps: [
          { t: 'Both members are two-force members, so their forces act along their axes. Equilibrium of joint B, vertically: only the strut BC has a vertical component.', m: R`\sum F_y = 0:\quad F_{BC}\sin ${th}^\circ = ${W} \;\Rightarrow\; F_{BC} = ${fm(Fbc, 4)}\ \text{lbf}` },
          { t: 'Horizontally, AB balances the horizontal component of BC:', m: R`\sum F_x = 0:\quad F_{AB} = F_{BC}\cos ${th}^\circ = \frac{W}{\tan ${th}^\circ} = ${fm(Fab, 4)}\ \text{lbf}` },
          { t: 'Which member is in tension depends on the geometry. If AB ties back to the wall and BC is a strut beneath it, AB is in tension and BC in compression.' }
        ],
        distract: [Fbc, W * Math.tan(rad(th)), W * Math.cos(rad(th))]
      };
    }
  });

  add({
    id: 'esm-centroid-t', topic: 'esm', sub: 'Statics', title: 'Centroid of a T-section', diff: 2,
    gen(r) {
      const bf = r.pick([4, 6, 8]), tf = r.pick([0.5, 0.75, 1]), hw = r.pick([4, 6, 8]), tw = r.pick([0.5, 0.75, 1]);
      const A1 = bf * tf, y1 = hw + tf / 2, A2 = tw * hw, y2 = hw / 2, yb = (A1 * y1 + A2 * y2) / (A1 + A2);
      return {
        prompt: `A T-section has a flange <b>${bf} in × ${tf} in</b> on top of a web <b>${tw} in</b> thick and <b>${hw} in</b> tall. How far is its centroid above the bottom of the web?`,
        answer: yb, unit: 'in',
        steps: [
          { t: 'Split into two rectangles and locate each one’s centroid from the bottom:', m: R`A_1 = ${fm(A1, 4)}\ \text{in}^2,\ \bar y_1 = ${fm(y1, 4)}\ \text{in} \qquad A_2 = ${fm(A2, 4)}\ \text{in}^2,\ \bar y_2 = ${fm(y2, 4)}\ \text{in}` },
          { t: 'Area-weighted average:', m: R`\bar y = \frac{\sum A_i\bar y_i}{\sum A_i} = \frac{${fm(A1, 4)}(${fm(y1, 4)}) + ${fm(A2, 4)}(${fm(y2, 4)})}{${fm(A1 + A2, 4)}} = ${fm(yb, 4)}\ \text{in}` }
        ],
        distract: [(y1 + y2) / 2, (hw + tf) / 2, (A1 * y1 + A2 * y2) / A1]
      };
    }
  });

  add({
    id: 'esm-parallel-axis', topic: 'esm', sub: 'Statics', title: 'Moment of inertia of a T-section (parallel axis)', diff: 3, video: true,
    gen(r) {
      const bf = r.pick([4, 6, 8]), tf = r.pick([0.5, 0.75, 1]), hw = r.pick([4, 6, 8]), tw = r.pick([0.5, 0.75, 1]);
      const A1 = bf * tf, y1 = hw + tf / 2, A2 = tw * hw, y2 = hw / 2, yb = (A1 * y1 + A2 * y2) / (A1 + A2);
      const I1 = (bf * tf ** 3) / 12 + A1 * (y1 - yb) ** 2, I2 = (tw * hw ** 3) / 12 + A2 * (y2 - yb) ** 2, I = I1 + I2;
      return {
        prompt: `For a T-section with a <b>${bf} × ${tf} in</b> flange on top of a <b>${tw} in</b> thick × <b>${hw} in</b> tall web, find the area moment of inertia about the horizontal axis through the centroid.`,
        answer: I, unit: 'in⁴',
        steps: [
          { t: 'First locate the centroid (from the bottom of the web):', m: R`\bar y = \frac{${fm(A1, 4)}(${fm(y1, 4)}) + ${fm(A2, 4)}(${fm(y2, 4)})}{${fm(A1 + A2, 4)}} = ${fm(yb, 4)}\ \text{in}` },
          { t: 'Flange: own centroidal I plus the parallel-axis transfer term:', m: R`I_1 = \frac{${bf}(${tf})^3}{12} + ${fm(A1, 4)}(${fm(y1 - yb, 4)})^2 = ${fm(I1, 4)}\ \text{in}^4` },
          { t: 'Web:', m: R`I_2 = \frac{${tw}(${hw})^3}{12} + ${fm(A2, 4)}(${fm(y2 - yb, 4)})^2 = ${fm(I2, 4)}\ \text{in}^4` },
          { t: 'Total about the centroidal axis:', m: R`I = I_1 + I_2 = ${fm(I, 4)}\ \text{in}^4` }
        ],
        distract: [(bf * tf ** 3) / 12 + (tw * hw ** 3) / 12, I1 + (tw * hw ** 3) / 12, (bf * (hw + tf) ** 3) / 12]
      };
    }
  });

  add({
    id: 'esm-ladder', topic: 'esm', sub: 'Statics', title: 'Minimum friction to keep a ladder from slipping', diff: 2,
    gen(r) {
      const th = r.pick([55, 60, 65, 70, 75]);
      const mu = 1 / (2 * Math.tan(rad(th)));
      return {
        prompt: `A uniform ladder rests against a smooth (frictionless) vertical wall, making an angle of <b>${th}°</b> with the floor. What minimum coefficient of static friction at the floor prevents it from slipping (no one on the ladder)?`,
        answer: mu, unit: '',
        steps: [
          { t: 'Forces: weight W at the midpoint, horizontal wall reaction N<sub>w</sub> (no friction there), floor normal N<sub>f</sub> = W and floor friction F = N<sub>w</sub>.', m: R`\sum F_y = 0:\ N_f = W \qquad \sum F_x = 0:\ F = N_w` },
          { t: 'Moments about the foot of the ladder (length L):', m: R`N_w L\sin\theta = W\frac{L}{2}\cos\theta \;\Rightarrow\; N_w = \frac{W}{2\tan\theta}` },
          { t: 'Required friction F ≤ μN<sub>f</sub>:', m: R`\mu_{min} = \frac{F}{N_f} = \frac{1}{2\tan\theta} = \frac{1}{2\tan ${th}^\circ} = ${fm(mu, 3)}` }
        ],
        distract: [1 / Math.tan(rad(th)), Math.tan(rad(th)) / 2, 1 / (2 * Math.sin(rad(th)))]
      };
    }
  });

  add({
    id: 'esm-capstan', topic: 'esm', sub: 'Statics', title: 'Holding force on a rope wrapped around a post', diff: 1,
    gen(r) {
      const T1 = r.pick([500, 1000, 2000, 5000]), turns = r.pick([1, 1.5, 2, 3]), mu = r.pick([0.2, 0.25, 0.3]);
      const th = 2 * PI * turns, T2 = T1 / Math.exp(mu * th);
      return {
        prompt: `A dock line wraps <b>${turns} full turn${turns === 1 ? '' : 's'}</b> around a bollard (μ = <b>${mu}</b>). The boat pulls on the loaded end with <b>${f(T1, 5)} lbf</b>. What holding force is needed on the free end to prevent slipping?`,
        answer: T2, unit: 'lbf',
        steps: [
          { t: 'Wrap angle in radians:', m: R`\theta = 2\pi(${turns}) = ${fm(th, 4)}\ \text{rad}` },
          { t: 'Capstan (belt-friction) equation, with T₁ the loaded end:', m: R`\frac{T_1}{T_2} = e^{\mu\theta} = e^{${mu}(${fm(th, 4)})} = ${fm(Math.exp(mu * th), 4)}` },
          { t: 'Holding force:', m: R`T_2 = \frac{${T1}}{${fm(Math.exp(mu * th), 4)}} = ${fm(T2, 4)}\ \text{lbf}` }
        ],
        distract: [T1 / Math.exp(mu * turns * 360), T1 * (1 - mu), T1 / (1 + mu * th)]
      };
    }
  });

  /* --------------------------------- Kinematics --------------------------------- */
  add({
    id: 'esm-projectile', topic: 'esm', sub: 'Kinematics', title: 'Range of a projectile on level ground', diff: 2,
    gen(r) {
      const v0 = r.pick([40, 60, 80, 100]), th = r.pick([20, 30, 40, 45, 55]);
      const R0 = (v0 * v0 * Math.sin(rad(2 * th))) / g, H = (v0 * v0 * Math.sin(rad(th)) ** 2) / (2 * g);
      return {
        prompt: `A part is ejected from a machine at <b>${v0} ft/s</b>, <b>${th}°</b> above the horizontal, and lands at the same elevation. Neglecting air resistance, how far does it travel horizontally?`,
        answer: R0, unit: 'ft',
        steps: [
          { t: 'Time of flight from the vertical motion (returns to the same height):', m: R`t = \frac{2v_0\sin\theta}{g} = \frac{2(${v0})\sin ${th}^\circ}{32.174} = ${fm((2 * v0 * Math.sin(rad(th))) / g, 4)}\ \text{s}` },
          { t: 'Horizontal velocity is constant, so range = v<sub>0</sub>cos θ × t:', m: R`R = \frac{v_0^2\sin 2\theta}{g} = \frac{${v0}^2\sin ${2 * th}^\circ}{32.174} = ${fm(R0, 4)}\ \text{ft}` },
          { t: `The peak height would be v<sub>0</sub>²sin²θ/(2g) = ${f(H, 3)} ft.` }
        ],
        distract: [(v0 * v0) / g, (v0 * v0 * Math.sin(rad(th))) / g, R0 / 2]
      };
    }
  });

  add({
    id: 'esm-stopping', topic: 'esm', sub: 'Kinematics', title: 'Stopping distance under constant deceleration', diff: 1,
    gen(r) {
      const mph = r.pick([30, 45, 55, 65]), a = r.pick([10, 15, 20, 25]), tr = r.pick([0, 0.5, 1]);
      const v = (mph * 5280) / 3600, s = v * tr + (v * v) / (2 * a);
      return {
        prompt: `A forklift traveling at <b>${mph} mph</b> brakes with a constant deceleration of <b>${a} ft/s²</b>${tr ? ` after a reaction time of <b>${tr} s</b>` : ''}. What is the total stopping distance?`,
        answer: s, unit: 'ft',
        steps: [
          { t: 'Convert speed to ft/s (1 mph = 1.4667 ft/s):', m: R`v_0 = ${mph}\cdot\frac{5280}{3600} = ${fm(v, 4)}\ \text{ft/s}` },
          { t: tr ? 'Distance during the reaction time (constant speed):' : 'There is no reaction-time distance in this case.', m: R`s_1 = v_0t_r = ${fm(v * tr, 4)}\ \text{ft}` },
          { t: 'Braking distance from v² = v₀² − 2as with v = 0:', m: R`s_2 = \frac{v_0^2}{2a} = \frac{${fm(v, 4)}^2}{2(${a})} = ${fm((v * v) / (2 * a), 4)}\ \text{ft} \qquad s = ${fm(s, 4)}\ \text{ft}` }
        ],
        distract: [(mph * mph) / (2 * a) + mph * tr, (v * v) / a + v * tr, (v * v) / (2 * a)]
      };
    }
  });

  add({
    id: 'esm-total-accel', topic: 'esm', sub: 'Kinematics', title: 'Total acceleration of a point on a spinning wheel', diff: 2,
    gen(r) {
      const rr = r.pick([0.5, 1, 1.5, 2]), n = r.pick([60, 120, 300, 600]), al = r.pick([5, 10, 20, 40]);
      const w = (2 * PI * n) / 60, an = rr * w * w, at = rr * al, a = Math.sqrt(an * an + at * at);
      return {
        prompt: `A grinding wheel of radius <b>${rr} ft</b> is speeding up. At the instant it turns at <b>${n} rpm</b>, its angular acceleration is <b>${al} rad/s²</b>. What is the magnitude of the total acceleration of a point on its rim?`,
        answer: a, unit: 'ft/s²',
        steps: [
          { t: 'Angular speed in rad/s:', m: R`\omega = \frac{2\pi(${n})}{60} = ${fm(w, 4)}\ \text{rad/s}` },
          { t: 'Normal (centripetal) and tangential components:', m: R`a_n = r\omega^2 = ${fm(an, 4)}\ \text{ft/s}^2 \qquad a_t = r\alpha = ${fm(at, 4)}\ \text{ft/s}^2` },
          { t: 'They are perpendicular:', m: R`a = \sqrt{a_n^2 + a_t^2} = ${fm(a, 4)}\ \text{ft/s}^2` }
        ],
        distract: [an + at, an, rr * n * n]
      };
    }
  });

  add({
    id: 'esm-rolling-wheel', topic: 'esm', sub: 'Kinematics', title: 'Wheel speed when rolling without slipping', diff: 1,
    gen(r) {
      const mph = r.pick([10, 20, 30, 60]), D = r.pick([18, 24, 28, 30]);
      const v = (mph * 5280) / 3600, rr = D / 2 / 12, w = v / rr, n = (w * 60) / (2 * PI);
      return {
        prompt: `A cart wheel of <b>${D} in</b> diameter rolls without slipping at <b>${mph} mph</b>. What is the wheel's rotational speed in rpm?`,
        answer: n, unit: 'rpm',
        steps: [
          { t: 'Convert the speed and radius:', m: R`v = ${fm(v, 4)}\ \text{ft/s} \qquad r = \frac{${D}/2}{12} = ${fm(rr, 4)}\ \text{ft}` },
          { t: 'Rolling without slip means the contact point is momentarily at rest, so v = rω:', m: R`\omega = \frac{v}{r} = ${fm(w, 4)}\ \text{rad/s} \qquad n = \frac{60\omega}{2\pi} = ${fm(n, 4)}\ \text{rpm}` },
          { t: 'The top of the wheel moves at 2v; the contact point at zero.' }
        ],
        distract: [w, n * 2, (v * 60) / (PI * rr * 2) / 12]
      };
    }
  });

  /* ----------------------------------- Dynamics ----------------------------------- */
  add({
    id: 'esm-elevator', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Cable tension in an accelerating elevator', diff: 1,
    gen(r) {
      const W = r.pick([2000, 3000, 4000, 5000]), a = r.pick([2, 4, 6, 8]), up = r.next() < 0.6;
      const T = W * (1 + (up ? a : -a) / g);
      return {
        prompt: `An elevator car with its load weighs <b>${f(W, 5)} lbf</b>. What is the cable tension while it ${up ? '<b>accelerates upward</b>' : '<b>accelerates downward</b>'} at <b>${a} ft/s²</b>?`,
        answer: T, unit: 'lbf',
        steps: [
          { t: 'Mass and Newton’s second law (positive upward):', m: R`m = \frac{W}{g} = \frac{${W}}{32.174} = ${fm(W / g, 4)}\ \text{slug} \qquad T - W = m a` },
          { t: up ? 'Upward acceleration adds to the weight:' : 'Downward acceleration (a negative) reduces the tension:', m: R`T = W\left(1 ${up ? '+' : '-'} \frac{a}{g}\right) = ${W}\left(1 ${up ? '+' : '-'} \frac{${a}}{32.174}\right) = ${fm(T, 4)}\ \text{lbf}` }
        ],
        distract: [W, W * (1 + (up ? -a : a) / g), W + W * a]
      };
    }
  });

  add({
    id: 'esm-atwood', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Two weights over a pulley (Atwood machine)', diff: 2, video: true,
    gen(r) {
      const W1 = r.pick([60, 80, 100, 150]), W2 = r.pick([20, 30, 40, 50]);
      const a = (g * (W1 - W2)) / (W1 + W2), T = (2 * W1 * W2) / (W1 + W2);
      return {
        prompt: `Weights of <b>${W1} lbf</b> and <b>${W2} lbf</b> hang from opposite ends of a cord over a frictionless, massless pulley and are released from rest. What is the acceleration of the system?`,
        answer: a, unit: 'ft/s²',
        steps: [
          { t: 'FBD of each mass (heavier one moves down). Same cord tension T and same acceleration magnitude a:', m: R`m_1a = W_1 - T \qquad m_2a = T - W_2` },
          { t: 'Add the two equations to eliminate T:', m: R`a = g\,\frac{W_1 - W_2}{W_1 + W_2} = 32.174\cdot\frac{${W1} - ${W2}}{${W1} + ${W2}} = ${fm(a, 4)}\ \text{ft/s}^2` },
          { t: `Tension: T = 2W₁W₂/(W₁ + W₂) = ${f(T, 4)} lbf. It's between the two weights, as it must be.` }
        ],
        distract: [(g * (W1 - W2)) / W1, g, (g * W2) / (W1 + W2)]
      };
    }
  });

  add({
    id: 'esm-roll-incline', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Speed of a body rolling down an incline', diff: 3, video: true, fig: 'incline',
    gen(r) {
      const shape = r.pick([{ n: 'solid cylinder', k: 0.5 }, { n: 'thin-walled pipe (hoop)', k: 1 }, { n: 'solid sphere', k: 0.4 }]);
      const h = r.pick([4, 6, 8, 10, 12]), th = r.pick([15, 20, 30]);
      const v = Math.sqrt((2 * g * h) / (1 + shape.k)), vs = Math.sqrt(2 * g * h);
      return {
        prompt: `A <b>${shape.n}</b> starts from rest and rolls without slipping down a ${th}° ramp, dropping a vertical height of <b>${h} ft</b>. What is the speed of its center at the bottom?`,
        answer: v, unit: 'ft/s',
        fig: { name: 'incline', data: { theta: th, W: '' } },
        steps: [
          { t: `Rolling without slip does no friction work, so energy is conserved. For a ${shape.n}, I = ${shape.k === 0.5 ? '½' : shape.k === 1 ? '1' : '2/5'}·mr², and ω = v/r:`, m: R`mgh = \tfrac12mv^2 + \tfrac12I\omega^2 = \tfrac12mv^2\left(1 + \frac{k^2}{r^2}\right),\quad \frac{k^2}{r^2} = ${shape.k}` },
          { t: 'Solve for v. Mass and radius cancel, and so does the ramp angle.', m: R`v = \sqrt{\frac{2gh}{1 + k^2/r^2}} = \sqrt{\frac{2(32.174)(${h})}{${1 + shape.k}}} = ${fm(v, 4)}\ \text{ft/s}` },
          { t: `A frictionless sliding block would reach √(2gh) = ${f(vs, 3)} ft/s. Rotation stores part of the energy.` }
        ],
        distract: [vs, Math.sqrt((2 * g * h) / (1 + 1 - shape.k + 0.0001)), Math.sqrt(g * h)]
      };
    }
  });

  add({
    id: 'esm-collision', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Velocities after a direct central impact', diff: 3, video: true,
    gen(r) {
      const W1 = r.pick([10, 20, 40]), W2 = r.pick([10, 30, 50]), v1 = r.pick([10, 15, 20]), v2 = r.pick([0, -5, 5]), e = r.pick([0.4, 0.6, 0.8]);
      const m1 = W1 / g, m2 = W2 / g;
      const v1p = (m1 * v1 + m2 * v2 - m2 * e * (v1 - v2)) / (m1 + m2), v2p = v1p + e * (v1 - v2);
      return {
        prompt: `A <b>${W1} lbf</b> carriage moving at <b>${v1} ft/s</b> strikes a <b>${W2} lbf</b> carriage moving at <b>${v2} ft/s</b> on the same straight track (positive in the same direction). The coefficient of restitution is <b>${e}</b>. What is the velocity of the <b>second</b> carriage just after impact?`,
        answer: v2p, unit: 'ft/s',
        steps: [
          { t: 'Conservation of linear momentum (masses ∝ weights, so g cancels):', m: R`W_1v_1 + W_2v_2 = W_1v_1' + W_2v_2' \;\Rightarrow\; ${W1}(${v1}) + ${W2}(${v2}) = ${W1}v_1' + ${W2}v_2'` },
          { t: 'Coefficient of restitution (separation speed / approach speed):', m: R`e = \frac{v_2' - v_1'}{v_1 - v_2} \;\Rightarrow\; v_2' - v_1' = ${e}(${v1 - v2}) = ${fm(e * (v1 - v2), 4)}` },
          { t: 'Solve the two equations together.', m: R`v_1' = ${fm(v1p, 4)}\ \text{ft/s} \qquad v_2' = ${fm(v2p, 4)}\ \text{ft/s}` }
        ],
        distract: [v1p, (W1 * v1 + W2 * v2) / (W1 + W2), v1 * e]
      };
    }
  });

  add({
    id: 'esm-impulse', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Average impact force from impulse–momentum', diff: 2,
    gen(r) {
      const W = r.pick([2, 5, 10, 20]), v = r.pick([20, 30, 40, 60]), dt = r.pick([0.005, 0.01, 0.02, 0.05]), bounce = r.next() < 0.4, e = 0.5;
      const dv = bounce ? v * (1 + e) : v, F = ((W / g) * dv) / dt;
      return {
        prompt: `A <b>${W} lbf</b> hammer head moving at <b>${v} ft/s</b> strikes a die and ${bounce ? `rebounds at <b>${e * v} ft/s</b>` : '<b>comes to rest</b>'}. The contact lasts <b>${dt} s</b>. What is the average contact force?`,
        answer: F, unit: 'lbf',
        steps: [
          { t: 'Impulse equals the change in momentum (taking the approach direction as positive):', m: R`\bar F\,\Delta t = m\,\Delta v \qquad m = \frac{${W}}{32.174} = ${fm(W / g, 4)}\ \text{slug}` },
          { t: bounce ? 'The velocity reverses, so the change is the approach speed plus the rebound speed:' : 'The velocity goes from v to zero:', m: R`\Delta v = ${bounce ? `${v} + ${e * v}` : `${v} - 0`} = ${dv}\ \text{ft/s}` },
          { t: 'Average force:', m: R`\bar F = \frac{m\,\Delta v}{\Delta t} = \frac{${fm(W / g, 4)}(${dv})}{${dt}} = ${fm(F, 4)}\ \text{lbf}` }
        ],
        distract: [(W * dv) / dt, ((W / g) * v) / dt * (bounce ? 0.5 : 2), ((W / g) * dv * dv) / (2 * dt)]
      };
    }
  });

  add({
    id: 'esm-hoist', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Motor power for a hoist', diff: 1,
    gen(r) {
      const W = r.pick([1000, 2000, 4000, 6000]), v = r.pick([30, 60, 90, 120]), eta = r.pick([0.7, 0.8, 0.85, 0.9]);
      const H = (W * v) / (33000 * eta);
      return {
        prompt: `A hoist lifts <b>${f(W, 5)} lbf</b> at a constant <b>${v} ft/min</b>. The overall efficiency of the drive train is <b>${Math.round(eta * 100)}%</b>. What motor output power is required (hp)?`,
        answer: H, unit: 'hp',
        steps: [
          { t: 'At constant speed the hoist force equals the weight. Useful power = force × velocity:', m: R`P_{out} = Wv = ${W}(${v}) = ${fm(W * v, 4)}\ \text{ft}\cdot\text{lbf/min}` },
          { t: 'Convert (1 hp = 33,000 ft·lbf/min) and divide by efficiency:', m: R`H = \frac{Wv}{33{,}000\,\eta} = \frac{${fm(W * v, 4)}}{33{,}000(${eta})} = ${fm(H, 4)}\ \text{hp}` }
        ],
        distract: [(W * v) / 33000, (W * v * eta) / 33000, (W * v) / (550 * eta)]
      };
    }
  });

  add({
    id: 'esm-curve', topic: 'esm', sub: 'Dynamics (forces, energy, momentum)', title: 'Maximum speed on a flat curve', diff: 2,
    gen(r) {
      const R0 = r.pick([50, 100, 200, 300]), mu = r.pick([0.3, 0.5, 0.7]);
      const v = Math.sqrt(mu * g * R0), mph = (v * 3600) / 5280;
      return {
        prompt: `A vehicle travels around a flat (unbanked) curve of radius <b>${R0} ft</b>. If the tire–road coefficient of friction is <b>${mu}</b>, what is the maximum speed (mph) before it slides outward?`,
        answer: mph, unit: 'mph',
        steps: [
          { t: 'Friction supplies the centripetal force. Sliding impends when it reaches μN = μmg:', m: R`\mu mg = \frac{mv^2}{R}` },
          { t: 'Mass cancels:', m: R`v = \sqrt{\mu gR} = \sqrt{${mu}(32.174)(${R0})} = ${fm(v, 4)}\ \text{ft/s} = ${fm(mph, 4)}\ \text{mph}` }
        ],
        distract: [v, Math.sqrt(g * R0) * 0.6818, Math.sqrt(mu * R0) * 0.6818]
      };
    }
  });

  window.PROBLEMS = (window.PROBLEMS || []).concat(P);
})();
