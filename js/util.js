/* Shared helpers: seeded RNG, number formatting, math rendering, DOM helpers. */
(function (global) {
  'use strict';

  // ---------- Seeded RNG (mulberry32) ----------
  function makeRng(seed) {
    let a = (seed >>> 0) || 1;
    const next = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next,
      /** pick one element */
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      /** value in [lo, hi] on a step grid */
      range: (lo, hi, step = 1) => {
        const n = Math.round((hi - lo) / step);
        return +(lo + Math.floor(next() * (n + 1)) * step).toFixed(10);
      },
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      shuffle: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }
    };
  }
  const newSeed = () => Math.floor(Math.random() * 2 ** 31);

  // ---------- Number formatting ----------
  /** Round to `sig` significant figures and return a Number. */
  function sigRound(x, sig = 3) {
    if (!isFinite(x) || x === 0) return x;
    const d = Math.ceil(Math.log10(Math.abs(x)));
    const p = sig - d;
    const m = Math.pow(10, p);
    return Math.round(x * m) / m;
  }
  /** Text formatting with thousands separators. */
  function fmt(x, sig = 3) {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    const r = sigRound(x, sig);
    const abs = Math.abs(r);
    if (abs !== 0 && (abs < 1e-4 || abs >= 1e9)) return r.toExponential(sig - 1);
    const decimals = Math.max(0, Math.min(8, sig - Math.floor(Math.log10(abs || 1)) - 1));
    return r.toLocaleString('en-US', { maximumFractionDigits: decimals });
  }
  /** Same, but safe inside KaTeX (commas become {,}). */
  function fm(x, sig = 3) {
    const s = fmt(x, sig);
    if (s.includes('e')) {
      const [m, e] = s.split('e');
      return `${m}\\times10^{${parseInt(e, 10)}}`;
    }
    return s.replace(/,/g, '{,}');
  }

  // ---------- Multiple-choice builder for numeric answers ----------
  function makeChoices(answer, distractors, rng, sig = 3) {
    const out = [answer];
    const close = (a, b) => Math.abs(a - b) <= 0.04 * Math.max(Math.abs(a), Math.abs(b));
    const pool = (distractors || []).filter((d) => isFinite(d) && d !== 0);
    const factors = rng.shuffle([0.5, 0.67, 0.8, 1.25, 1.5, 2, 0.6, 1.4, 3, 0.33]);
    for (const d of pool.concat(factors.map((f) => answer * f))) {
      if (out.length >= 4) break;
      if (!out.some((o) => close(o, d))) out.push(d);
    }
    const shuffled = rng.shuffle(out);
    return { choices: shuffled.map((v) => v), correct: shuffled.indexOf(answer) };
  }

  // ---------- DOM helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function renderMath(el) {
    if (!el) return;
    if (global.renderMathInElement) {
      try {
        global.renderMathInElement(el, {
          delimiters: [
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } catch (e) { /* ignore */ }
    } else {
      // KaTeX may still be loading; retry shortly
      if (!el.__mathRetry) {
        el.__mathRetry = true;
        setTimeout(() => renderMath(el), 400);
      }
    }
  }
  /** Strip HTML + LaTeX to produce speakable text. */
  function speakable(html) {
    return String(html)
      .replace(/\\\[[\s\S]*?\\\]/g, ' ')
      .replace(/\\\([\s\S]*?\\\)/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'show';
    clearTimeout(t.__h);
    t.__h = setTimeout(() => (t.className = ''), 2200);
  }
  function download(filename, text, type = 'application/json') {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // ---------- Dates ----------
  const DAY = 86400000;
  function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function isoDate(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function niceDate(d, opts) {
    return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' });
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
  }

  global.R = String.raw;
  global.U = {
    makeRng, newSeed, sigRound, fmt, fm, makeChoices,
    $, $$, esc, renderMath, speakable, toast, download,
    DAY, parseDate, isoDate, today, daysBetween, addDays, niceDate, fmtTime
  };
})(window);
