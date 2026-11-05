/* Basic Engineering Practice — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['bep', 'Sinking fund factor (A/F)', R`\(\dfrac{i}{(1+i)^n - 1}\)`],
  ['bep', 'Compound amount (F/P)', R`\((1+i)^n\)`],
  ['bep', 'Arithmetic gradient (P/G)', R`\(\dfrac{(1+i)^n - in - 1}{i^2(1+i)^n}\)`],
  ['bep', 'Effective annual rate', R`\(i_e = (1 + r/m)^m - 1\); continuous \(e^r - 1\)`],
  ['bep', 'Capitalized cost (perpetual)', R`\(P = A/i\)`],
  ['bep', 'Break-even quantity', R`\(Q = \dfrac{FC}{p - v}\)`],
  ['bep', 'Straight-line book value', R`\(BV_j = C - j\dfrac{C - S}{n}\)`],
  ['bep', 'Earned value indices', R`CPI = EV/AC, SPI = EV/PV, EAC = BAC/CPI`],
  ['bep', 'PERT expected time & σ', R`\(t_e = \dfrac{a + 4m + b}{6},\ \sigma = \dfrac{b - a}{6}\)`],
  ['bep', 'Total float', 'LS − ES = LF − EF'],
  ['bep', '1 ksi in MPa · 1 lbf in N', '6.895 MPa · 4.448 N'],
  ['bep', '1 hp in kW · 1 N·m in lbf·ft', '0.7457 kW · 0.7376 lbf·ft']
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
