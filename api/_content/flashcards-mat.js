/* Material Properties — additional flashcards: [topic, front, back]. */
window.FLASHCARDS = (window.FLASHCARDS || []).concat([
  ['mat', 'Thermal stress with an initial gap g', R`\(\sigma = E\dfrac{\alpha L\Delta T - g}{L}\)`],
  ['mat', 'Two-material thermal force (bolt + sleeve)', R`\(F = \dfrac{(\alpha_a - \alpha_s)\Delta T}{1/(A_sE_s) + 1/(A_aE_a)}\)`],
  ['mat', 'Percent reduction of area', R`\(\%RA = (A_0 - A_f)/A_0\)`],
  ['mat', 'True strain from areas', R`\(\varepsilon_T = \ln(A_0/A)\)`],
  ['mat', 'Hollomon strain hardening', R`\(\sigma_T = K\varepsilon_T^n\); necking at \(\varepsilon_T = n\)`],
  ['mat', 'Lever rule', 'Phase fraction = opposite lever arm / total tie-line length'],
  ['mat', 'Fe–C key compositions', 'Ferrite 0.022% C · eutectoid 0.76% C · cementite 6.7% C'],
  ['mat', 'Corrosion rate from weight loss', R`\(\text{mpy} = \dfrac{534W}{\rho At}\) (mg, g/cm³, in², h)`],
  ['mat', 'Rule of mixtures (parallel / transverse)', R`\(E_\parallel = V_fE_f + V_mE_m,\ 1/E_\perp = V_f/E_f + V_m/E_m\)`],
  ['mat', 'Hall–Petch', R`\(\sigma_y = \sigma_0 + k\,d^{-1/2}\)`],
  ['mat', 'PREN (pitting resistance)', '%Cr + 3.3×%Mo + 16×%N'],
  ['mat', 'Stainless families', 'Austenitic 300 (non-magnetic) · ferritic 400 · martensitic 410/440 · duplex · PH 17-4']
].map(([topic, front, back]) => ({ id: 'fc-' + topic + '-' + front.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40), topic, front, back })));
