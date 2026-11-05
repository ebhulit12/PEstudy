/* Strength of Materials — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['som', 'Load sharing in a composite axial member', R`\(P_i = P\dfrac{E_iA_i}{\sum E_jA_j}\)`],
  ['som', 'Propped cantilever, uniform load: prop reaction', R`\(R = 3wL/8\), fixed-end moment \(wL^2/8\)`],
  ['som', 'Fixed–fixed beam, uniform load: end moment', R`\(M = wL^2/12\); midspan \(wL^2/24\)`],
  ['som', 'Fixed–fixed beam, center load: max deflection', R`\(y = PL^3/192EI\)`],
  ['som', 'Max shear stress — solid circular beam', R`\(\tau_{max} = \dfrac{4V}{3A}\)`],
  ['som', 'Principal angle', R`\(\tan 2\theta_p = \dfrac{2\tau_{xy}}{\sigma_x - \sigma_y}\)`],
  ['som', 'Absolute max shear (σz = 0, σ1, σ2 > 0)', R`\(\tau_{abs} = \sigma_1/2\)`],
  ['som', 'von Mises, general plane stress', R`\(\sigma' = \sqrt{\sigma_x^2 - \sigma_x\sigma_y + \sigma_y^2 + 3\tau_{xy}^2}\)`],
  ['som', 'Coulomb–Mohr (σ1 ≥ 0 ≥ σ3)', R`\(\dfrac1n = \dfrac{\sigma_1}{S_{ut}} - \dfrac{\sigma_3}{S_{uc}}\)`],
  ['som', 'Soderberg fatigue line', R`\(\dfrac1n = \dfrac{\sigma_a}{S_e} + \dfrac{\sigma_m}{S_y}\)`],
  ['som', 'S–N line constants (10³–10⁶)', R`\(a = \dfrac{(fS_{ut})^2}{S_e},\ b = -\tfrac13\log\dfrac{fS_{ut}}{S_e}\)`],
  ['som', 'Johnson column formula', R`\(\dfrac{P_{cr}}{A} = S_y - \left(\dfrac{S_y}{2\pi}\dfrac{KL}{r}\right)^2\dfrac1E\)`],
  ['som', 'Column transition slenderness', R`\(\left(\dfrac{KL}{r}\right)_1 = \sqrt{\dfrac{2\pi^2E}{S_y}}\)`],
  ['som', 'Radius of gyration — solid circle', R`\(r = d/4\)`],
  ['som', 'Critical crack length', R`\(a_c = \dfrac1\pi\left(\dfrac{K_{Ic}}{Y\sigma}\right)^2\)`],
  ['som', 'Stress concentration — plate with hole (wide plate)', R`\(K_t \to 3\) as \(d/w \to 0\)`],
  ['som', 'Eccentric axial load stress', R`\(\sigma = \dfrac{P}{A} \pm \dfrac{Pec}{I}\)`],
  ['som', 'Impact factor, suddenly applied load', '2 × the static stress / deflection'],
  ['som', 'Castigliano’s theorem', R`\(\delta_i = \partial U/\partial P_i\)`],
  ['som', 'Strain energy — axial, torsion, bending', R`\(\dfrac{P^2L}{2AE},\ \dfrac{T^2L}{2GJ},\ \displaystyle\int\dfrac{M^2}{2EI}dx\)`]
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
