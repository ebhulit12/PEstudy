/* Material Properties — additional study-note sections. */
(window.NOTES.mat = window.NOTES.mat || []).push(
  {
    title: 'Phase diagrams, the lever rule & material selection',
    html: R`
<ul>
<li><b>Reading a binary diagram:</b> at a temperature–composition point, draw a horizontal tie line across the two-phase field. Its ends give each phase’s composition.</li>
<li><b>Lever rule:</b> fraction of phase α = (C<sub>β</sub> − C₀)/(C<sub>β</sub> − C<sub>α</sub>). Use the opposite arm.</li>
<li><b>Fe–Fe₃C:</b> ferrite holds ≤ 0.022% C; eutectoid 0.76% C at 727 °C (1341 °F) → pearlite; cementite 6.7% C. Hypoeutectoid steel: proeutectoid ferrite + pearlite with \(W_p = (C_0 - 0.022)/(0.76 - 0.022)\). Hypereutectoid: proeutectoid cementite + pearlite.</li>
<li><b>Cast irons</b> (&gt; ~2% C): gray (graphite flakes, good damping and machinability, weak in tension), ductile/nodular (Mg-treated spheroids, ductile), white (hard, brittle), malleable (heat-treated white iron).</li>
<li><b>Aluminum alloys:</b> heat-treatable 2xxx, 6xxx, 7xxx (precipitation hardening: solution treat → quench → age); non-heat-treatable 1xxx, 3xxx, 5xxx (strain hardening, H tempers).</li>
<li><b>Selection indices (Ashby):</b> light, stiff tie: maximize E/ρ; light, stiff beam: E<sup>1/2</sup>/ρ; light, strong beam: σ<sub>f</sub><sup>2/3</sup>/ρ; springs (max stored energy): σ<sub>f</sub>²/E.</li>
<li><b>Polymers:</b> thermoplastics (re-meltable: PE, PP, nylon, PC) vs. thermosets (cross-linked: epoxy, phenolic). Design below the glass-transition temperature T<sub>g</sub> for stiffness, and allow for creep.</li>
</ul>`
  },
  {
    title: 'Worked example: steel bolt and aluminum sleeve heated',
    html: R`
<p><b>Problem.</b> A 1/2 in steel bolt (A = 0.196 in², E = 30 Mpsi, α = 6.5 µ/°F) clamps an aluminum sleeve (A = 0.785 in², E = 10 Mpsi, α = 12.8 µ/°F), snug at 70 °F. Find the bolt stress at 270 °F.</p>
<ol class="steps">
<li><b>Mismatch strain:</b> \((\alpha_a - \alpha_s)\Delta T = (12.8 - 6.5)(10^{-6})(200) = 1.26\times10^{-3}\).</li>
<li><b>Compliances:</b> \(1/(A_sE_s) = 1/(0.196\cdot30\times10^6) = 1.70\times10^{-7}\); \(1/(A_aE_a) = 1/(0.785\cdot10\times10^6) = 1.27\times10^{-7}\) (per lbf, per unit length).</li>
<li><b>Force:</b> \(F = 1.26\times10^{-3}/(2.97\times10^{-7}) = 4{,}240\) lbf (bolt tension = sleeve compression).</li>
<li><b>Stresses:</b> bolt \(4240/0.196 = 21{,}600\) psi tension; sleeve \(4240/0.785 = 5{,}400\) psi compression.</li>
</ol>
<div class="callout">Sign check: the higher-α part (aluminum) ends up in compression when heated, and in tension (or loose) when cooled. Thermal cycling can therefore loosen mixed-material joints.</div>`
  }
);
