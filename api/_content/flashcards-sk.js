/* Supportive Knowledge — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['sk', 'Material removal rate (turning)', R`\(\text{MRR} = 12Vfd\) in³/min`],
  ['sk', 'Taylor tool life — new life after speed change', R`\(T_2 = T_1(V_1/V_2)^{1/n}\)`],
  ['sk', 'Milling table feed', R`\(f_r = N\,n_t\,f_t\)`],
  ['sk', 'Bend allowance', R`\(BA = \alpha(R + Kt)\), K ≈ 0.33–0.5`],
  ['sk', 'MMC bonus tolerance (hole)', 'Bonus = actual size − MMC (smallest hole)'],
  ['sk', 'Virtual condition', 'External: MMC + tol · Internal: MMC − tol'],
  ['sk', 'Min / max interference', 'Min = smallest shaft − largest hole · Max = largest shaft − smallest hole'],
  ['sk', 'Standard normal z', R`\(z = (x - \mu)/\sigma\); Φ(1) = 0.841, Φ(2) = 0.977, Φ(3) = 0.99865`],
  ['sk', 'Exponential reliability', R`\(R = e^{-t/\text{MTBF}}\); R(MTBF) = 36.8%`],
  ['sk', 'Stress–strength interference', R`\(z = \dfrac{\mu_S - \mu_\sigma}{\sqrt{\sigma_S^2 + \sigma_\sigma^2}},\ R = \Phi(z)\)`],
  ['sk', 'Wheatstone bridge output', R`\(V_o/V_{ex} \approx N\cdot GF\cdot\varepsilon/4\)`],
  ['sk', 'RTD resistance', R`\(R_T = R_0(1 + \alpha T)\), Pt α = 0.00385/°C`],
  ['sk', 'Nyquist sampling', R`\(f_s > 2f_{max}\)`],
  ['sk', 'Weibull shape β meaning', 'β < 1 infant mortality · β = 1 random · β > 1 wear-out']
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
