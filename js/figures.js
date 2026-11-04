/* Lightweight SVG figure generators for problems and video walkthroughs. */
(function (global) {
  'use strict';
  const S = (w, h, body) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">
      <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-accent"/></marker></defs>
      ${body}</svg>`;
  const T = (x, y, s, cls = '') => `<text x="${x}" y="${y}" class="ftxt ${cls}" text-anchor="middle">${s}</text>`;
  const pin = (x, y) => `<path d="M${x},${y} l-12,18 h24 z" class="stroke"/><line x1="${x - 16}" y1="${y + 18}" x2="${x + 16}" y2="${y + 18}" class="stroke"/>`;
  const roller = (x, y) => `<path d="M${x},${y} l-12,14 h24 z" class="stroke"/><circle cx="${x - 6}" cy="${y + 18}" r="3.5" class="stroke"/><circle cx="${x + 6}" cy="${y + 18}" r="3.5" class="stroke"/>`;
  const arrowDown = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="accent" marker-end="url(#arr)"/>`;

  const F = {
    beam(d = {}) {
      const L = 300, x0 = 50, y = 100;
      const ax = x0 + L * (d.a != null ? d.a : 0.5);
      let b = `<rect x="${x0}" y="${y - 8}" width="${L}" height="16" class="part"/>`;
      b += pin(x0, y + 8) + roller(x0 + L, y + 8);
      if (d.w) {
        for (let i = 0; i <= 10; i++) b += arrowDown(x0 + (L * i) / 10, y - 40, y - 10);
        b += `<line x1="${x0}" y1="${y - 40}" x2="${x0 + L}" y2="${y - 40}" class="accent"/>` + T(x0 + L / 2 + 70, y - 48, d.w);
      }
      if (d.P) b += `<line x1="${ax}" y1="${y - 75}" x2="${ax}" y2="${y - 10}" class="accent thick" marker-end="url(#arr)"/>` + T(ax, y - 80, d.P);
      b += `<line x1="${x0}" y1="${y + 50}" x2="${x0 + L}" y2="${y + 50}" class="dim" marker-start="url(#arr)" marker-end="url(#arr)"/>` + T(x0 + L / 2, y + 66, d.L || 'L');
      b += T(x0, y + 44, 'A', 'small') + T(x0 + L, y + 44, 'B', 'small');
      return S(400, 180, b);
    },
    cantilever(d = {}) {
      const x0 = 60, L = 280, y = 90;
      let b = `<rect x="${x0 - 20}" y="${y - 50}" width="20" height="100" class="hatch"/>`;
      b += `<rect x="${x0}" y="${y - 8}" width="${L}" height="16" class="part"/>`;
      b += `<line x1="${x0 + L}" y1="${y - 70}" x2="${x0 + L}" y2="${y - 10}" class="accent thick" marker-end="url(#arr)"/>` + T(x0 + L, y - 76, d.P || 'P');
      b += `<path d="M${x0},${y + 8} Q${x0 + L * 0.6},${y + 10} ${x0 + L},${y + 34}" class="dash"/>`;
      b += `<line x1="${x0}" y1="${y + 60}" x2="${x0 + L}" y2="${y + 60}" class="dim" marker-start="url(#arr)" marker-end="url(#arr)"/>` + T(x0 + L / 2, y + 76, d.L || 'L');
      return S(400, 170, b);
    },
    incline(d = {}) {
      const th = ((d.theta || 30) * Math.PI) / 180;
      const x0 = 40, y0 = 180, len = 320;
      const x1 = x0 + len * Math.cos(th), y1 = y0 - len * Math.sin(th);
      const mx = x0 + 0.55 * len * Math.cos(th), my = y0 - 0.55 * len * Math.sin(th);
      const deg = -(d.theta || 30);
      let b = `<path d="M${x0},${y0} L${x1},${y0} L${x1},${y1} Z" class="part light"/>`;
      b += `<g transform="translate(${mx},${my}) rotate(${deg})"><rect x="-25" y="-36" width="50" height="36" class="part"/>${T(0, -13, d.W || 'W')}
        <line x1="-90" y1="-18" x2="-30" y2="-18" class="accent thick" marker-end="url(#arr)"/>${T(-70, -26, 'F', 'small')}</g>`;
      b += T(x0 + 55, y0 - 8, `θ = ${d.theta || 'θ'}°`, 'small');
      return S(400, 200, b);
    },
    shaft(d = {}) {
      let b = `<rect x="60" y="80" width="280" height="40" rx="4" class="part"/>`;
      b += `<ellipse cx="60" cy="100" rx="10" ry="20" class="part"/>`;
      b += `<path d="M350,70 a20,30 0 1,1 0,60" class="accent thick" marker-end="url(#arr)"/>` + T(375, 60, d.T || 'T');
      if (d.M) b += `<path d="M40,130 a25,25 0 0,1 0,-60" class="accent" marker-end="url(#arr)"/>` + T(22, 60, d.M);
      b += T(200, 145, d.d || 'd', 'small');
      return S(400, 170, b);
    },
    gears(d = {}) {
      const r1 = 45, r2 = 80, cx1 = 120, cx2 = cx1 + r1 + r2, cy = 100;
      const teeth = (cx, cy, r, n) => {
        let p = '';
        for (let i = 0; i < n; i++) {
          const a = (i / n) * 2 * Math.PI;
          p += `<line x1="${cx + r * Math.cos(a)}" y1="${cy + r * Math.sin(a)}" x2="${cx + (r + 7) * Math.cos(a)}" y2="${cy + (r + 7) * Math.sin(a)}" class="stroke"/>`;
        }
        return p;
      };
      let b = `<circle cx="${cx1}" cy="${cy}" r="${r1}" class="part"/><circle cx="${cx2}" cy="${cy}" r="${r2}" class="part light"/>`;
      b += teeth(cx1, cy, r1, 16) + teeth(cx2, cy, r2, 28);
      b += `<circle cx="${cx1}" cy="${cy}" r="5" class="stroke"/><circle cx="${cx2}" cy="${cy}" r="5" class="stroke"/>`;
      b += T(cx1, cy + r1 + 28, d.a || 'pinion') + T(cx2, cy + r2 + 22, d.b || 'gear');
      return S(400, 210, b);
    },
    column(d = {}) {
      let b = `<rect x="185" y="30" width="30" height="140" class="part"/>`;
      b += `<line x1="200" y1="0" x2="200" y2="26" class="accent thick" marker-end="url(#arr)"/>` + T(232, 18, d.P || 'P');
      b += pin(200, 170) + `<circle cx="200" cy="30" r="4" class="stroke"/>`;
      b += `<path d="M200,30 Q235,100 200,170" class="dash"/>`;
      b += `<line x1="260" y1="30" x2="260" y2="170" class="dim" marker-start="url(#arr)" marker-end="url(#arr)"/>` + T(285, 105, d.L || 'L');
      return S(400, 200, b);
    },
    bolt(d = {}) {
      let b = `<rect x="110" y="60" width="180" height="40" class="part light"/><rect x="110" y="100" width="180" height="40" class="part light"/>`;
      b += `<rect x="185" y="40" width="30" height="120" class="part"/><rect x="170" y="28" width="60" height="16" class="part"/><rect x="170" y="156" width="60" height="16" class="part"/>`;
      b += `<line x1="200" y1="20" x2="200" y2="0" class="accent thick" marker-end="url(#arr)"/><line x1="200" y1="180" x2="200" y2="200" class="accent thick" marker-end="url(#arr)"/>`;
      b += T(260, 15, d.P || 'P (external)', 'small') + T(330, 104, 'members', 'small');
      return S(400, 205, b);
    },
    weld(d = {}) {
      let b = `<rect x="40" y="70" width="200" height="60" class="part light"/><rect x="160" y="90" width="200" height="20" class="part"/>`;
      b += `<path d="M160,90 l0,-12 l12,12 z M160,110 l0,12 l12,-12 z" class="fill-accent"/>`;
      b += `<line x1="280" y1="100" x2="380" y2="100" class="accent thick" marker-end="url(#arr)"/>` + T(355, 90, d.F || 'F');
      b += T(150, 160, d.label || 'fillet welds, leg h, length L each', 'small');
      return S(400, 175, b);
    },
    vessel(d = {}) {
      let b = `<rect x="80" y="60" width="240" height="80" rx="40" class="part light"/>`;
      b += `<rect x="88" y="68" width="224" height="64" rx="32" class="stroke dash"/>`;
      b += T(200, 106, d.p || 'p (internal)');
      b += `<line x1="200" y1="60" x2="200" y2="20" class="accent" marker-end="url(#arr)"/><line x1="200" y1="140" x2="200" y2="180" class="accent" marker-end="url(#arr)"/>`;
      b += T(240, 30, 'σ hoop', 'small');
      return S(400, 195, b);
    },
    mohr(d = {}) {
      let b = `<line x1="20" y1="110" x2="380" y2="110" class="stroke"/><line x1="200" y1="10" x2="200" y2="200" class="stroke"/>`;
      b += `<circle cx="230" cy="110" r="80" class="accent" fill="none"/>`;
      b += `<line x1="170" y1="60" x2="290" y2="160" class="dash"/>` + `<circle cx="170" cy="60" r="4" class="fill-accent"/><circle cx="290" cy="160" r="4" class="fill-accent"/>`;
      b += T(310, 125, 'σ₁', 'small') + T(160, 125, 'σ₂', 'small') + T(372, 100, 'σ', 'small') + T(212, 20, 'τ', 'small');
      return S(400, 210, b);
    },
    cylinder() {
      let b = `<rect x="60" y="70" width="200" height="60" class="part light"/><rect x="100" y="76" width="16" height="48" class="part"/>`;
      b += `<rect x="116" y="92" width="240" height="16" class="part"/>`;
      b += `<line x1="70" y1="160" x2="70" y2="130" class="accent" marker-end="url(#arr)"/>` + T(70, 180, 'Q in', 'small');
      b += `<line x1="300" y1="60" x2="370" y2="60" class="accent thick" marker-end="url(#arr)"/>` + T(335, 50, 'F, v', 'small');
      return S(400, 195, b);
    },
    belt() {
      let b = `<circle cx="110" cy="100" r="50" class="part light"/><circle cx="300" cy="100" r="35" class="part light"/>`;
      b += `<line x1="110" y1="50" x2="300" y2="65" class="accent thick"/><line x1="110" y1="150" x2="300" y2="135" class="stroke thick"/>`;
      b += T(205, 45, 'F₁ (tight)', 'small') + T(205, 168, 'F₂ (slack)', 'small');
      return S(400, 185, b);
    }
  };
  F.springMass = function (d = {}) {
    let zig = 'M220,20 v15';
    for (let i = 0; i < 6; i++) zig += ` l${i % 2 ? -16 : 16},8 l${i % 2 ? 16 : -16},8`;
    zig += ' v15';
    let b = `<rect x="140" y="8" width="120" height="12" class="hatch"/><path d="${zig}" class="stroke"/>` + T(262, 80, d.k || 'k', 'small');
    if (d.c) b += `<path d="M175,20 v35 M163,55 h24 v30 h-24 M167,70 h16 M175,70 v65" class="stroke"/>` + T(140, 80, d.c, 'small');
    else b = b.replace('M220,20', 'M200,20').replace('x="262"', 'x="240"');
    b += `<rect x="150" y="${d.c ? 135 : 140}" width="100" height="44" rx="4" class="part"/>` + T(200, d.c ? 162 : 167, d.m || 'm');
    return S(400, 195, b);
  };

  global.FIG = F;
})(window);
