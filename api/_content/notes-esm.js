/* Engineering Science & Mechanics — additional study-note sections. */
(window.NOTES.esm = window.NOTES.esm || []).push(
  {
    title: 'Trusses, frames, friction & area properties',
    html: R`
<ul>
<li><b>Supports:</b> roller = 1 reaction; pin = 2; fixed = 2 forces + moment. A planar body is determinate if it has 3 independent reactions (and is not partially constrained).</li>
<li><b>Two- and three-force members:</b> two-force: the force acts along the line joining the pins. Three non-parallel forces in equilibrium must be concurrent.</li>
<li><b>Trusses:</b> method of joints (ΣF<sub>x</sub> = ΣF<sub>y</sub> = 0 at each pin, start where ≤ 2 unknowns); method of sections (cut ≤ 3 members, take moments where two unknowns intersect). Zero-force members: two non-collinear members at an unloaded joint, or the third member where two are collinear.</li>
<li><b>Frames and machines</b> contain multi-force members, so dismember them and use action–reaction at every pin.</li>
<li><b>Friction:</b> impending slip F = μ<sub>s</sub>N; sliding μ<sub>k</sub>N. Tipping vs. sliding: compare the force needed for each. Wedges: FBD of each piece with friction on every sliding face. Rope on a drum: \(T_1/T_2 = e^{\mu\theta}\).</li>
<li><b>Centroids:</b> \(\bar x = \sum A_i\bar x_i/\sum A_i\) (subtract holes as negative areas). Triangle h/3 from the base; semicircle \(4r/3\pi\) from the diameter; quarter circle \(4r/3\pi\) from each edge.</li>
<li><b>Second moments:</b> rectangle \(bh^3/12\) (centroid), \(bh^3/3\) (base); triangle \(bh^3/36\) (centroid); circle \(\pi d^4/64\); transfer with \(I = I_c + Ad^2\). Never transfer between two non-centroidal axes directly.</li>
</ul>`
  },
  {
    title: 'Worked example: energy method with rotation',
    html: R`
<p><b>Problem.</b> A 200 lbf drum (solid cylinder, radius 1.5 ft) is mounted on a frictionless axle. A cable wrapped around it supports a 50 lbf weight. The system starts from rest. Find the weight’s speed after it falls 6 ft.</p>
<ol class="steps">
<li><b>Masses:</b> drum \(m_d = 200/32.174 = 6.22\) slug, \(I = \tfrac12 m_dr^2 = \tfrac12(6.22)(1.5)^2 = 6.99\) slug·ft². Weight \(m = 50/32.174 = 1.554\) slug.</li>
<li><b>Kinematic link:</b> cable doesn’t slip, so \(\omega = v/r\).</li>
<li><b>Work–energy:</b> \(Wh = \tfrac12mv^2 + \tfrac12I\omega^2 = \tfrac12v^2\left(m + I/r^2\right)\).</li>
<li>\(50(6) = \tfrac12v^2(1.554 + 6.99/2.25) = \tfrac12v^2(4.66)\) → \(v = \sqrt{600/4.66} = 11.3\) ft/s.</li>
<li><b>Check:</b> free fall would give \(\sqrt{2(32.174)(6)} = 19.6\) ft/s. The drum’s inertia "adds" \(I/r^2 = 3.11\) slug of effective mass.</li>
</ol>
<div class="callout">The effective-mass trick (m<sub>eff</sub> = m + I/r²) also gives the acceleration directly: a = W/m<sub>eff</sub> = 50/4.66 = 10.7 ft/s².</div>`
  }
);
