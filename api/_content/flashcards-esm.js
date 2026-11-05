/* Engineering Science & Mechanics — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['esm', 'Planar equilibrium equations', R`\(\sum F_x = 0,\ \sum F_y = 0,\ \sum M = 0\)`],
  ['esm', 'Composite centroid', R`\(\bar y = \dfrac{\sum A_i\bar y_i}{\sum A_i}\)`],
  ['esm', 'Parallel-axis theorem (area)', R`\(I = I_c + Ad^2\)`],
  ['esm', 'Rectangle I about its base', R`\(bh^3/3\)`],
  ['esm', 'Triangle centroid', 'h/3 from the base'],
  ['esm', 'Ladder on smooth wall: μ needed', R`\(\mu_{min} = \dfrac{1}{2\tan\theta}\)`],
  ['esm', 'Projectile range (level ground)', R`\(R = \dfrac{v_0^2\sin 2\theta}{g}\)`],
  ['esm', 'Projectile max height', R`\(H = \dfrac{v_0^2\sin^2\theta}{2g}\)`],
  ['esm', 'Normal & tangential acceleration', R`\(a_n = r\omega^2 = v^2/r,\ a_t = r\alpha\)`],
  ['esm', 'Atwood machine acceleration', R`\(a = g\dfrac{m_1 - m_2}{m_1 + m_2}\)`],
  ['esm', 'Rolling body down an incline', R`\(v = \sqrt{\dfrac{2gh}{1 + k^2/r^2}}\)`],
  ['esm', 'Coefficient of restitution', R`\(e = \dfrac{v_2' - v_1'}{v_1 - v_2}\)`],
  ['esm', 'Impulse–momentum', R`\(\bar F\Delta t = m\Delta v\)`],
  ['esm', 'Max speed on a flat curve', R`\(v = \sqrt{\mu gR}\)`],
  ['esm', 'mph to ft/s', '1 mph = 1.4667 ft/s (60 mph = 88 ft/s)'],
  ['esm', 'Slender rod I about end vs center', R`\(mL^2/3\) vs \(mL^2/12\)`]
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
