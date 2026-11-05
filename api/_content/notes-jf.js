/* Joints & Fasteners — additional study-note sections. */
(window.NOTES.jf = window.NOTES.jf || []).push(
  {
    title: 'Bolt fatigue & joint design checks',
    html: R`
<p>A preloaded tension bolt sees a mean stress near its preload and only a small alternating stress, because the members absorb most of the external load.</p>
<ul>
<li>\(\sigma_i = F_i/A_t\); for load cycling 0 → P: \(\sigma_a = \dfrac{CP}{2A_t}\), \(\sigma_m = \sigma_a + \sigma_i\).</li>
<li><b>Goodman along the load line</b> starting at the preload: \(n_f = \dfrac{S_e(S_{ut} - \sigma_i)}{S_{ut}\sigma_a + S_e(\sigma_m - \sigma_i)}\).</li>
<li><b>Fully corrected endurance strengths</b> (Shigley, rolled threads, includes K<sub>f</sub>): SAE 5: 18.6 ksi; SAE 8: 23.2 ksi; ISO 8.8: 129 MPa; ISO 10.9: 162 MPa.</li>
<li><b>Full set of checks for a tension joint:</b> yield \(n_p = \dfrac{S_pA_t}{CP + F_i}\) · load factor \(n_L = \dfrac{S_pA_t - F_i}{CP}\) · separation \(n_0 = \dfrac{F_i}{P(1 - C)}\) · fatigue n<sub>f</sub>.</li>
<li><b>Member stiffness</b> k<sub>m</sub> is usually computed from pressure frusta (30° cones, Shigley) or the Wileman exponential fit: \(k_m = EdA\,e^{B(d/l)}\) (steel: A = 0.787, B = 0.629).</li>
<li><b>Gaskets:</b> a soft full-face gasket makes k<sub>m</sub> small, so C is large and the bolt carries most of the load. Use enough bolts so that the bolt spacing is about 3–6 diameters for a good seal.</li>
</ul>
<div class="callout">Exam tip: problems often give k<sub>b</sub> and k<sub>m</sub> directly. Read whether the external load is per bolt or total.</div>`
  },
  {
    title: 'Worked example: eccentric bolt group',
    html: R`
<p><b>Problem.</b> Four 3/4 in bolts in a 4 in × 4 in square pattern hold a bracket. A 5,000 lbf vertical load acts 10 in from the group centroid. Find the maximum bolt shear stress.</p>
<ol class="steps">
<li><b>Centroid:</b> center of the square. Each bolt is \(r = 4/\sqrt2 = 2.83\) in away; \(\sum r^2 = 4(2.83)^2 = 32\) in².</li>
<li><b>Primary shear:</b> \(F' = 5000/4 = 1250\) lbf (downward).</li>
<li><b>Moment:</b> \(M = 5000(10) = 50{,}000\) lbf·in; secondary \(F'' = Mr/\sum r^2 = 50{,}000(2.83)/32 = 4419\) lbf, perpendicular to each radius.</li>
<li><b>Critical bolts:</b> the two on the load side, where F″ has a downward component at 45° to F′: \(F = \sqrt{1250^2 + 4419^2 + 2(1250)(4419)\cos45^\circ} = 5376\) lbf.</li>
<li><b>Shear stress</b> (shank in the shear plane): \(\tau = 5376/(\pi(0.75)^2/4) = 12{,}170\) psi.</li>
</ol>
<div class="callout">The moment term dominates. Spreading the bolts (larger Σr²) is much more effective than adding bolts near the centroid.</div>`
  }
);
