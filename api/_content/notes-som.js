/* Strength of Materials — additional study-note sections. */
(window.NOTES.som = window.NOTES.som || []).push(
  {
    title: 'Indeterminate members, composites & energy methods',
    html: R`
<ul>
<li><b>Recipe for statically indeterminate problems:</b> (1) equilibrium equations, (2) compatibility (geometry of deformation), (3) force–deformation relations (δ = PL/AE, φ = TL/JG, beam tables). Solve together.</li>
<li><b>Parallel axial members</b> (rigid cap, equal strain): load splits by stiffness \(P_i = P\,E_iA_i/\sum E_jA_j\); stresses are in the ratio of the moduli.</li>
<li><b>Series members</b> (same force): deformations add, \(\delta = P\sum L_i/(A_iE_i)\).</li>
<li><b>Common indeterminate beams:</b> propped cantilever with uniform load \(R_{prop} = 3wL/8\), \(M_{fixed} = wL^2/8\); fixed–fixed with uniform load \(M_{end} = wL^2/12\), \(M_{mid} = wL^2/24\), \(y_{max} = wL^4/384EI\); fixed–fixed with center load \(M_{end} = M_{mid} = PL/8\), \(y = PL^3/192EI\).</li>
<li><b>Strain energy:</b> \(U = \dfrac{P^2L}{2AE} + \dfrac{T^2L}{2GJ} + \displaystyle\int\dfrac{M^2}{2EI}dx\). <b>Castigliano:</b> \(\delta_i = \partial U/\partial P_i\). For an indeterminate reaction R, set \(\partial U/\partial R = 0\).</li>
<li><b>Impact loading:</b> a weight W dropped from height h onto an elastic member: \(\delta_{max} = \delta_{st}\left(1 + \sqrt{1 + 2h/\delta_{st}}\right)\). Sudden application (h = 0) doubles static values.</li>
<li><b>Eccentric loads:</b> \(\sigma = P/A \pm Pec/I\). For a rectangle, no tension occurs if the load stays inside the middle third (the kern).</li>
</ul>`
  },
  {
    title: 'Worked example: fatigue check of a shouldered shaft',
    html: R`
<p><b>Problem.</b> A 1.25 in machined steel shaft (S<sub>ut</sub> = 100 ksi, S<sub>y</sub> = 80 ksi) rotates with a steady bending moment of 2000 lbf·in at a shoulder fillet (K<sub>t</sub> = 1.7, notch sensitivity q = 0.85) and carries a steady torque of 3000 lbf·in (K<sub>ts</sub> = 1.5, q<sub>s</sub> = 0.9). Find the fatigue factor of safety (DE-Goodman).</p>
<ol class="steps">
<li><b>Endurance limit:</b> \(S_e' = 0.5(100) = 50\) ksi; \(k_a = 2.70(100)^{-0.265} = 0.797\); \(k_b = 0.879(1.25)^{-0.107} = 0.858\); \(S_e = 0.797(0.858)(50) = 34.2\) ksi.</li>
<li><b>Fatigue stress concentration:</b> \(K_f = 1 + 0.85(0.7) = 1.60\); \(K_{fs} = 1 + 0.9(0.5) = 1.45\).</li>
<li><b>Stresses:</b> rotating bending is fully reversed: \(\sigma_a = K_f\dfrac{32M}{\pi d^3} = 1.60\dfrac{32(2000)}{\pi(1.25)^3} = 16.7\) ksi, \(\sigma_m = 0\). Steady torque is mean: \(\tau_m = K_{fs}\dfrac{16T}{\pi d^3} = 1.45\dfrac{16(3000)}{\pi(1.25)^3} = 11.3\) ksi.</li>
<li><b>von Mises components:</b> \(\sigma_a' = 16.7\) ksi, \(\sigma_m' = \sqrt{3}(11.3) = 19.6\) ksi.</li>
<li><b>Goodman:</b> \(\dfrac1n = \dfrac{16.7}{34.2} + \dfrac{19.6}{100} = 0.685 \Rightarrow n = 1.46\).</li>
<li><b>First-cycle yield (Langer):</b> \(\sigma_{max}' = \sqrt{16.7^2 + 3(11.3)^2} = 25.8\) ksi → \(n_y = 80/25.8 = 3.1\) ✓.</li>
</ol>
<div class="callout">Common traps: forgetting that rotating bending is fully reversed; applying K<sub>t</sub> instead of K<sub>f</sub>; mixing ksi and psi in Marin factors.</div>`
  }
);
