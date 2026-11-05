/* Joints & Fasteners — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['jf', 'Bolt stiffness (shank + thread in series)', R`\(k_b = \dfrac{A_dA_tE}{A_dl_t + A_tl_d}\)`],
  ['jf', 'Bolt load factor', R`\(n_L = \dfrac{S_pA_t - F_i}{CP}\)`],
  ['jf', 'Bolt yield factor of safety', R`\(n_p = \dfrac{S_pA_t}{CP + F_i}\)`],
  ['jf', 'Separation factor of safety', R`\(n_0 = \dfrac{F_i}{P(1 - C)}\)`],
  ['jf', 'Bolt alternating stress', R`\(\sigma_a = \dfrac{CP}{2A_t}\) (load 0 → P)`],
  ['jf', 'Bolt fatigue (Goodman, preload line)', R`\(n_f = \dfrac{S_e(S_{ut} - \sigma_i)}{S_{ut}\sigma_a + S_e(\sigma_m - \sigma_i)}\)`],
  ['jf', 'Endurance strength, rolled threads (SAE 5 / 8)', '18.6 ksi / 23.2 ksi (fully corrected)'],
  ['jf', 'Secondary shear in a bolt group', R`\(F_i'' = \dfrac{Mr_i}{\sum r_j^2}\)`],
  ['jf', 'Plate bearing stress', R`\(\sigma_b = \dfrac{F}{n\,d\,t}\)`],
  ['jf', 'AISC fillet weld allowable', R`\(0.30\,S_{EXX}\) on the throat (E70 → 21 ksi)`],
  ['jf', 'Weld group — two horizontal lines (b long, d apart)', R`\(I_u = \dfrac{bd^2}{2}\)`],
  ['jf', 'Circular weld in torsion', R`\(J_u = 2\pi r^3,\ \tau = \dfrac{Tr}{0.707hJ_u}\)`],
  ['jf', 'Weld in torsion (general)', R`\(\tau'' = \dfrac{Mr}{J},\ J = 0.707h\,J_u\)`],
  ['jf', 'Shrink-fit heating', R`\(\Delta T = \dfrac{\delta + c}{\alpha D}\)`],
  ['jf', 'Hub hoop stress at bore (press fit)', R`\(\sigma_t = p\dfrac{r_o^2 + R^2}{r_o^2 - R^2}\)`],
  ['jf', 'Press fit axial force', R`\(F = 2\pi fpRL\)`],
  ['jf', 'Adhesive lap shear (average)', R`\(\tau = F/(bL)\)`],
  ['jf', 'Metric bolt class 8.8', 'Sut ≈ 800 MPa, yield ≈ 0.8 Sut, proof 600 MPa'],
  ['jf', 'E7018 electrode', '70 ksi tensile · all positions · low-hydrogen']
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
