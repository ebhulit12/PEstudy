/* Mechanical Components — additional study-note sections (appended after the base sections). */
(window.NOTES.mc = window.NOTES.mc || []).push(
  {
    title: 'Pressure vessels & piping (ASME)',
    html: R`
<p><b>ASME BPVC Section VIII, Div. 1</b> (internal pressure, R = inside radius, S = allowable stress, E = weld joint efficiency):</p>
<table class="tbl"><tr><th>Component</th><th>Required thickness</th></tr>
<tr><td>Cylindrical shell (circumferential stress)</td><td>\(t = \dfrac{PR}{SE - 0.6P}\)</td></tr>
<tr><td>Cylindrical shell (longitudinal stress)</td><td>\(t = \dfrac{PR}{2SE + 0.4P}\)</td></tr>
<tr><td>Spherical shell / hemispherical head</td><td>\(t = \dfrac{PR}{2SE - 0.2P}\)</td></tr>
<tr><td>2:1 ellipsoidal head (D = inside diameter)</td><td>\(t = \dfrac{PD}{2SE - 0.2P}\)</td></tr></table>
<p>Add the <b>corrosion allowance</b> to the calculated thickness. Joint efficiency E depends on weld type and the extent of radiography (e.g., 1.0 full RT, 0.85 spot RT, 0.70 none for double-welded butt joints).</p>
<p><b>Thick walls:</b> when \(r_o/r_i \gtrsim 1.1\), use Lamé. Hoop stress is maximum at the bore: \(\sigma_t = p\dfrac{r_o^2 + r_i^2}{r_o^2 - r_i^2}\). Radial stress there is \(-p\).</p>
<p><b>Piping (ASME B31.1 power / B31.3 process):</b> minimum wall \(t = \dfrac{PD_o}{2(SE + PY)} + c\) (Y ≈ 0.4 for ferritic steel below ~900 °F; c = mechanical/corrosion allowance), then add mill tolerance (−12.5% for seamless pipe). <b>Schedule</b> sets wall thickness for a given NPS. Allow for thermal expansion with loops, bends or expansion joints.</p>
<p><b>Testing:</b> hydrostatic test typically at 1.3× MAWP (VIII-1, adjusted for temperature). Pneumatic tests are used only when water can't be, because compressed gas stores far more energy.</p>
<div class="callout">📖 <b>Handbook:</b> search “ASME”, “thin-walled”, “thick-walled cylinder”. Know which radius (inside vs. mean) the formula uses.</div>`
  },
  {
    title: 'Mechanisms: linkages, cams & gear trains',
    html: R`
<ul>
<li><b>Mobility (Gruebler/Kutzbach):</b> \(M = 3(n - 1) - 2j_1 - j_2\) for planar linkages (n links including ground, j₁ full joints, j₂ half joints).</li>
<li><b>Grashof (4-bar):</b> \(s + l \le p + q\) means at least one link can rotate fully. Shortest link grounded gives a double-crank; adjacent to ground, a crank-rocker; as coupler, a double-rocker.</li>
<li><b>Slider-crank:</b> \(x = r\cos\theta + \sqrt{l^2 - r^2\sin^2\theta}\); velocity \(v \approx r\omega(\sin\theta + \tfrac{r}{2l}\sin 2\theta)\); acceleration \(a \approx r\omega^2(\cos\theta + \tfrac{r}{l}\cos 2\theta)\). Stroke = 2r.</li>
<li><b>Instant centers:</b> Kennedy's theorem (any three bodies have collinear instant centers) gives quick velocity ratios: \(\omega_3/\omega_2 = \overline{I_{12}I_{23}}/\overline{I_{13}I_{23}}\).</li>
<li><b>Quick-return:</b> time ratio = forward crank angle / return crank angle.</li>
<li><b>Cams:</b> displacement diagrams: uniform motion (infinite acceleration at the ends, avoid), simple harmonic (finite acceleration, jerk spikes), cycloidal (zero end acceleration, best at high speed). Pressure angle ≲ 30° for translating roller followers.</li>
<li><b>Gear trains:</b> train value \(e = \prod N_{driver}/\prod N_{driven}\). <b>Planetary:</b> \((n_L - n_A)/(n_F - n_A) = e\) with the arm held stationary when computing e; ring teeth \(N_r = N_s + 2N_p\).</li>
</ul>`
  },
  {
    title: 'Worked example: checking a spur gear drive',
    html: R`
<p><b>Problem.</b> A 20-tooth, 20° full-depth pinion (P<sub>d</sub> = 8, face F = 1.25 in, cut teeth, Y = 0.322) drives a 60-tooth gear. The pinion runs at 1750 rpm transmitting 7.5 hp. Find the center distance, gear speed, transmitted load, bearing load and Lewis stress.</p>
<ol class="steps">
<li><b>Geometry:</b> \(d_p = 20/8 = 2.5\) in, \(d_g = 60/8 = 7.5\) in, \(C = (2.5 + 7.5)/2 = 5.0\) in. Gear speed \(n_g = 1750(20/60) = 583\) rpm.</li>
<li><b>Velocity:</b> \(V = \pi(2.5)(1750)/12 = 1145\) ft/min.</li>
<li><b>Loads:</b> \(W_t = 33{,}000(7.5)/1145 = 216\) lbf; \(W_r = 216\tan 20^\circ = 78.7\) lbf; resultant on each shaft \(W = 216/\cos 20^\circ = 230\) lbf.</li>
<li><b>Velocity factor:</b> \(K_v = (1200 + 1145)/1200 = 1.95\).</li>
<li><b>Bending stress:</b> \(\sigma = \dfrac{K_vW_tP_d}{FY} = \dfrac{1.95(216)(8)}{1.25(0.322)} \approx 8{,}400\) psi. Compare with the allowable for the pinion material (with a factor of safety). The pinion is critical because its smaller Y gives higher stress.</li>
<li><b>Torque check:</b> pinion \(T = 63{,}025(7.5)/1750 = 270\) lbf·in \(= W_t d_p/2 = 216(1.25)\) ✓.</li>
</ol>
<div class="callout">Exam pattern: multi-part gear questions are usually chained. Keep W<sub>t</sub> and V from earlier parts rather than recomputing with rounding.</div>`
  }
);
