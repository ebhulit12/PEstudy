/* Vibration — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['vib', 'Torsional natural frequency', R`\(\omega_n = \sqrt{k_t/I}\), \(k_t = GJ/L\)`],
  ['vib', 'Simple pendulum period', R`\(T = 2\pi\sqrt{L/g}\)`],
  ['vib', 'Magnification factor (force excitation)', R`\(\dfrac{X}{F_0/k} = \dfrac{1}{\sqrt{(1 - r^2)^2 + (2\zeta r)^2}}\)`],
  ['vib', 'Amplitude at resonance', R`\(X = \dfrac{F_0/k}{2\zeta}\)`],
  ['vib', 'Rotating unbalance amplitude', R`\(X = \dfrac{m_0e}{M}\dfrac{r^2}{\sqrt{(1 - r^2)^2 + (2\zeta r)^2}}\)`],
  ['vib', 'Isolator design (undamped)', R`\(r^2 = 1 + 1/TR\) → \(f_n = f/r\) → \(\delta = g/\omega_n^2\)`],
  ['vib', 'Damped transmissibility', R`\(TR = \sqrt{\dfrac{1 + (2\zeta r)^2}{(1 - r^2)^2 + (2\zeta r)^2}}\)`],
  ['vib', 'Quality factor', R`\(Q \approx 1/(2\zeta)\)`],
  ['vib', 'Effective mass of a spring', R`\(m_{eff} = m + m_s/3\)`],
  ['vib', 'Vibration analysis frequencies', '1× unbalance · 2× misalignment/looseness · gear mesh = teeth × rpm']
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
