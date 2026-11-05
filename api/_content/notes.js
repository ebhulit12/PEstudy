/* Study notes by topic. Each section: { title, html }. Math uses KaTeX delimiters \( \) and \[ \].
   "📖 Handbook" callouts suggest search terms for the NCEES PE Mechanical Reference Handbook (the only
   reference allowed in the CBT exam) — practice searching it with Ctrl+F. */

window.NOTES = {
  bep: [
    {
      title: 'Units, conversions & the gc trap',
      html: R`
<p>The exam is mostly US customary. The single biggest source of errors is mass vs. force. In USCS, \(1\ \text{lbf}\) accelerates \(1\ \text{slug}\) at \(1\ \text{ft/s}^2\), and \(1\ \text{slug} = 32.174\ \text{lbm}\).</p>
\[ m\,[\text{slug}] = \frac{W\,[\text{lbf}]}{g}, \qquad g = 32.174\ \text{ft/s}^2 = 386.1\ \text{in/s}^2 \]
<p>When stiffness is in lbf/in, use mass in <b>lbf·s²/in</b> (\(m = W/386.1\)). Mixing in/ft is the #1 vibration mistake.</p>
<table class="tbl"><tr><th>Quantity</th><th>Handy conversion</th></tr>
<tr><td>Power</td><td>1 hp = 550 ft·lbf/s = 33,000 ft·lbf/min = 745.7 W</td></tr>
<tr><td>Torque–power</td><td>\(H_{hp} = \dfrac{T_{\text{lbf·in}}\, n_{rpm}}{63{,}025} = \dfrac{T_{\text{lbf·ft}}\, n_{rpm}}{5252}\)</td></tr>
<tr><td>Power (SI)</td><td>\(P = T\omega\), \(\omega = 2\pi n/60\)</td></tr>
<tr><td>Pressure</td><td>1 psi = 6.895 kPa; 1 ksi = 6.895 MPa; 1 atm = 14.696 psi</td></tr>
<tr><td>Energy</td><td>1 Btu = 778.17 ft·lbf</td></tr>
<tr><td>Hydraulic power</td><td>\(H_{hp} = \dfrac{p_{psi}\,Q_{gpm}}{1714}\); 1 gal = 231 in³</td></tr>
<tr><td>Modulus</td><td>Steel E ≈ 30×10⁶ psi (207 GPa), G ≈ 11.5×10⁶ psi</td></tr>
</table>
<div class="callout">📖 <b>Handbook:</b> search “conversion factors”, “Units”. Know where the conversion table is so you never waste time.</div>`
    },
    {
      title: 'Engineering economics',
      html: R`
<p>Expect 1–3 questions. Draw a cash-flow diagram every time. Interest factors:</p>
<table class="tbl"><tr><th>Factor</th><th>Formula</th><th>Use</th></tr>
<tr><td>(F/P, i, n)</td><td>\((1+i)^n\)</td><td>single amount → future</td></tr>
<tr><td>(P/F, i, n)</td><td>\((1+i)^{-n}\)</td><td>future → present</td></tr>
<tr><td>(P/A, i, n)</td><td>\(\dfrac{(1+i)^n-1}{i(1+i)^n}\)</td><td>uniform series → present</td></tr>
<tr><td>(A/P, i, n)</td><td>\(\dfrac{i(1+i)^n}{(1+i)^n-1}\)</td><td>capital recovery</td></tr>
<tr><td>(A/F, i, n)</td><td>\(\dfrac{i}{(1+i)^n-1}\)</td><td>sinking fund</td></tr>
<tr><td>(F/A, i, n)</td><td>\(\dfrac{(1+i)^n-1}{i}\)</td><td>uniform series → future</td></tr></table>
<p><b>Equivalent annual cost</b> of a machine: \(\text{EAC} = C\,(A/P) - S\,(A/F) + \text{annual O\&M}\).</p>
<p><b>Comparing alternatives:</b> use the same study period (or EAC for unequal lives). Higher present worth of benefits minus costs wins. Break-even: set the two cost expressions equal and solve.</p>
<p><b>Depreciation (straight-line):</b> \(D = (C - S)/n\). Book value after \(j\) years: \(C - jD\).</p>
<div class="callout">📖 <b>Handbook:</b> “Engineering Economics”, “Factor Name”, “Nonannual compounding”. Interest tables are provided — but computing from the formula on your calculator is often faster.</div>`
    },
    {
      title: 'Technical drawings, symbols & project management',
      html: R`
<ul>
<li><b>Orthographic projection:</b> US uses <i>third-angle</i> (top view above front view, right view to the right). ISO/Europe uses first-angle. Recognize the truncated-cone projection symbol.</li>
<li><b>Line types:</b> visible (thick continuous), hidden (dashed), center (long-short-long), phantom (long-short-short-long), section/cutting-plane lines with arrows showing view direction.</li>
<li><b>Section views:</b> full, half, offset, broken-out, revolved, removed. Hatching = cut material.</li>
<li><b>Weld symbols (AWS A2.4):</b> arrow side symbol is <i>below</i> the reference line; other side is above. Fillet = triangle; flag = field weld; circle = all-around. Size to the left, length (and pitch) to the right of the symbol.</li>
<li><b>Thread callout:</b> <code>1/2-13 UNC-2A</code> → 1/2" major dia., 13 threads/in, coarse series, class 2 fit, A = external (B = internal).</li>
<li><b>Surface finish:</b> Ra in µin (US) — check-mark symbol; lay symbols (=, ⊥, X, M, C, R).</li>
</ul>
<p><b>Project management:</b> Critical path = longest path through the network; activities on it have zero float. Total float = LS − ES = LF − EF. Earned value: CPI = EV/AC, SPI = EV/PV (&lt;1 means over budget / behind schedule).</p>`
    }
  ],

  esm: [
    {
      title: 'Statics',
      html: R`
<p>Equilibrium: \(\sum F_x = 0,\ \sum F_y = 0,\ \sum M = 0\). Always draw the free-body diagram (FBD) and pick a moment point that eliminates unknowns.</p>
<ul>
<li><b>Simply supported beam, load P at distance a from A</b> (span L, b = L − a): \(R_A = Pb/L\), \(R_B = Pa/L\).</li>
<li><b>Uniform load w over span:</b> \(R_A = R_B = wL/2\). Replace distributed loads with their resultant at the centroid.</li>
<li><b>Two-force members</b> (trusses, links) carry force only along their axis. Method of joints / method of sections.</li>
<li><b>Friction:</b> \(F \le \mu_s N\) (impending), \(F = \mu_k N\) (sliding). Block on incline pushed up at constant speed with force parallel to slope: \(F = W(\sin\theta + \mu\cos\theta)\). Self-locking if \(\mu \ge \tan\theta\).</li>
<li><b>Belt friction (capstan):</b> \(F_1/F_2 = e^{\mu\theta}\), θ in radians.</li>
<li><b>Centroids/area moments:</b> parallel-axis theorem \(I = I_c + Ad^2\).</li>
</ul>
<table class="tbl"><tr><th>Section</th><th>\(I_c\)</th><th>\(J\)</th></tr>
<tr><td>Rectangle b×h</td><td>\(bh^3/12\)</td><td>—</td></tr>
<tr><td>Solid circle d</td><td>\(\pi d^4/64\)</td><td>\(\pi d^4/32\)</td></tr>
<tr><td>Hollow circle</td><td>\(\pi (d_o^4-d_i^4)/64\)</td><td>\(\pi (d_o^4-d_i^4)/32\)</td></tr></table>`
    },
    {
      title: 'Kinematics',
      html: R`
<p><b>Constant acceleration</b> (linear / rotational analogs):</p>
\[ v = v_0 + at \quad s = v_0 t + \tfrac12 a t^2 \quad v^2 = v_0^2 + 2as \]
\[ \omega = \omega_0 + \alpha t \quad \theta = \omega_0 t + \tfrac12 \alpha t^2 \quad \omega^2 = \omega_0^2 + 2\alpha\theta \]
<p>Relations: \(v = r\omega\), \(a_t = r\alpha\), \(a_n = r\omega^2 = v^2/r\). Convert rpm: \(\omega = 2\pi n/60\).</p>
<p><b>Projectile:</b> \(x = v_0\cos\theta\,t\), \(y = v_0\sin\theta\,t - \tfrac12 g t^2\). Range on level ground \(R = v_0^2\sin 2\theta/g\).</p>
<p><b>Relative motion / mechanisms:</b> \(\vec v_B = \vec v_A + \vec\omega\times\vec r_{B/A}\). Instant centers are a fast route for 4-bar and slider-crank velocity questions. Slider-crank piston velocity is maximum near (not exactly at) 90° crank angle.</p>
<p><b>Grashof criterion (4-bar):</b> \(s + l \le p + q\) → at least one link can fully rotate.</p>`
    },
    {
      title: 'Dynamics: force, energy, momentum',
      html: R`
<ul>
<li><b>Newton:</b> \(\sum F = ma\), \(\sum M_G = I_G\alpha\) (rotation about fixed axis O: \(\sum M_O = I_O \alpha\)).</li>
<li><b>Mass moments of inertia:</b> solid disk/cylinder \(I = \tfrac12 mr^2\); thin ring \(mr^2\); slender rod about center \(mL^2/12\), about end \(mL^2/3\); solid sphere \(\tfrac25 mr^2\). Radius of gyration \(k = \sqrt{I/m}\).</li>
<li><b>Work–energy:</b> \(T_1 + U_{1\to2} = T_2\), with \(T = \tfrac12 mv^2 + \tfrac12 I\omega^2\). Spring energy \(\tfrac12 kx^2\); gravity \(mgh\).</li>
<li><b>Rolling without slip:</b> \(v = r\omega\) and \(T = \tfrac12 mv^2(1 + k^2/r^2)\).</li>
<li><b>Impulse–momentum:</b> \(\int F\,dt = m\Delta v\); angular \(\int M\,dt = I\Delta\omega\). Coefficient of restitution \(e = (v_2' - v_1')/(v_1 - v_2)\).</li>
<li><b>Power:</b> \(P = Fv = T\omega\).</li>
</ul>
<div class="callout">⚠️ Watch units: weight in lbf → divide by g for slugs. If length is in inches, use g = 386.1 in/s² and mass in lbf·s²/in.</div>`
    }
  ],

  mat: [
    {
      title: 'Stress–strain & mechanical properties',
      html: R`
<ul>
<li><b>Hooke's law:</b> \(\sigma = E\varepsilon\), \(\tau = G\gamma\), \(G = \dfrac{E}{2(1+\nu)}\). Axial deformation \(\delta = \dfrac{PL}{AE}\).</li>
<li><b>Poisson:</b> \(\varepsilon_{lat} = -\nu\,\varepsilon_{axial}\). Steel ν ≈ 0.29–0.30, aluminum ≈ 0.33.</li>
<li><b>Yield strength</b> \(S_y\): 0.2% offset method when no distinct yield point. <b>Ultimate</b> \(S_{ut}\): max engineering stress.</li>
<li><b>Ductility:</b> % elongation, % reduction in area. Ductile ≳ 5% elongation.</li>
<li><b>Toughness</b> = area under stress–strain curve; <b>resilience</b> = area to yield \(= S_y^2/(2E)\).</li>
<li><b>True vs. engineering</b> (valid up to necking): \(\sigma_T = \sigma(1+\varepsilon)\), \(\varepsilon_T = \ln(1+\varepsilon)\).</li>
<li><b>Hardness:</b> Brinell (HB), Rockwell (HRB soft, HRC hard), Vickers, Knoop (micro). For steels \(S_{ut} \approx 0.495\,\text{HB}\) ksi \(\approx 500\,\text{HB}\) psi.</li>
<li><b>Impact toughness:</b> Charpy/Izod. BCC metals (carbon steel) show a <i>ductile-to-brittle transition temperature</i>; FCC (Al, Cu, austenitic stainless) do not.</li>
</ul>
<table class="tbl"><tr><th>Material</th><th>E (Mpsi)</th><th>α (µin/in·°F)</th><th>ρ (lb/in³)</th></tr>
<tr><td>Carbon steel</td><td>30</td><td>6.5</td><td>0.283</td></tr>
<tr><td>Stainless (304)</td><td>28</td><td>9.6</td><td>0.29</td></tr>
<tr><td>Aluminum</td><td>10</td><td>12.8</td><td>0.098</td></tr>
<tr><td>Titanium</td><td>16.5</td><td>4.9</td><td>0.16</td></tr>
<tr><td>Brass</td><td>15</td><td>10.4</td><td>0.31</td></tr>
<tr><td>Gray cast iron</td><td>~14</td><td>6.0</td><td>0.26</td></tr></table>`
    },
    {
      title: 'Thermal properties & thermal stress',
      html: R`
<p>Free thermal strain: \(\varepsilon_T = \alpha\Delta T\) → \(\delta_T = \alpha L \Delta T\).</p>
<p>If fully restrained: \(\sigma = E\alpha\Delta T\) (independent of length and area!). If partially restrained (gap g): \(\sigma = E(\alpha L\Delta T - g)/L\) once the gap closes.</p>
<p>Two-material assemblies (e.g., steel bolt clamping aluminum): compatibility — final lengths equal; equilibrium — forces equal and opposite.</p>
<p>Thermal conductivity k, specific heat c, melting point — also physical properties that may appear in material selection questions.</p>`
    },
    {
      title: 'Iron–carbon diagram & heat treatment',
      html: R`
<ul>
<li><b>Phases:</b> ferrite α (BCC, soft), austenite γ (FCC, stable above A₃/A₁), cementite Fe₃C (hard, brittle), pearlite (lamellar α + Fe₃C), martensite (BCT, hard, from rapid quench), bainite (intermediate cooling).</li>
<li><b>Eutectoid:</b> 0.76–0.8% C at 1341 °F (727 °C). Hypoeutectoid &lt; 0.8% C; hypereutectoid &gt; 0.8% C.</li>
<li><b>Annealing:</b> heat into austenite, furnace cool → coarse pearlite, softest, max ductility, relieves stress.</li>
<li><b>Normalizing:</b> austenitize, air cool → finer pearlite, a bit stronger than annealed, uniform grain.</li>
<li><b>Quench & temper:</b> quench → martensite (hard, brittle); temper (reheat below A₁) trades hardness for toughness.</li>
<li><b>Hardenability</b> (depth of hardening) ≠ hardness. Measured by the <i>Jominy end-quench</i> test. Alloying (Cr, Mo, Ni, Mn) increases hardenability. Max hardness depends mainly on carbon content.</li>
<li><b>Case hardening:</b> carburizing, nitriding, carbonitriding, induction/flame hardening — hard wear surface, tough core; adds compressive residual stress (good for fatigue).</li>
<li><b>Cold work</b> raises strength/hardness and lowers ductility (strain hardening); recrystallization annealing reverses it.</li>
<li><b>Precipitation (age) hardening:</b> Al alloys (2xxx, 6xxx, 7xxx), 17-4PH stainless: solution treat → quench → age.</li>
</ul>
<p><b>AISI/SAE steel designation:</b> 10XX plain carbon, last two digits = carbon in hundredths of a % (1045 → 0.45% C). 41XX Cr-Mo, 43XX Ni-Cr-Mo, 86XX Ni-Cr-Mo.</p>
<p><b>Aluminum:</b> 1xxx pure, 2xxx Cu, 3xxx Mn, 5xxx Mg, 6xxx Mg-Si, 7xxx Zn. Tempers: -O annealed, -H strain hardened, -T6 solution treated & artificially aged.</p>`
    },
    {
      title: 'Corrosion & chemical properties',
      html: R`
<ul>
<li><b>Galvanic corrosion:</b> two dissimilar metals + electrolyte. The <i>anodic</i> (more active, higher in the galvanic series: Mg, Zn, Al, steel) corrodes; cathodic (noble: stainless passive, Ti, graphite, Au) is protected. Avoid small anode/large cathode area ratios.</li>
<li><b>Protection:</b> coatings, cathodic protection (sacrificial Zn/Mg anodes or impressed current), insulating dissimilar metals, material selection, inhibitors.</li>
<li><b>Forms:</b> uniform, pitting, crevice, intergranular (sensitized stainless — Cr carbides at grain boundaries after 800–1500 °F exposure; use L grades like 304L/316L), stress-corrosion cracking (tensile stress + specific environment, e.g., chlorides on austenitic SS), erosion, fretting, hydrogen embrittlement (high-strength steels, plating).</li>
<li><b>Stainless:</b> ≥ 10.5% Cr forms passive Cr₂O₃ film. Austenitic (300 series, non-magnetic, not hardenable by HT), ferritic (430), martensitic (410, 440C — hardenable), duplex, PH (17-4).</li>
</ul>`
    },
    {
      title: 'Fatigue, creep & fracture (material side)',
      html: R`
<p><b>Endurance limit estimate (steels, Shigley):</b> \(S_e' = 0.5\,S_{ut}\) for \(S_{ut} \le 200\) ksi; \(S_e' = 100\) ksi otherwise. Non-ferrous metals (Al) have no true endurance limit — use fatigue strength at a stated number of cycles.</p>
<p><b>Marin factors:</b> \(S_e = k_a k_b k_c k_d k_e k_f S_e'\)</p>
<ul>
<li>Surface \(k_a = a S_{ut}^b\) (ksi): ground a=1.34, b=−0.085; machined/cold-drawn a=2.70, b=−0.265; hot-rolled a=14.4, b=−0.718; as-forged a=39.9, b=−0.995.</li>
<li>Size (rotating round, bending/torsion) \(k_b = 0.879\,d^{-0.107}\) for 0.11 ≤ d ≤ 2 in; \(k_b = 1\) for axial.</li>
<li>Load \(k_c\): 1 bending, 0.85 axial, 0.59 torsion (if using with shear).</li>
<li>Reliability \(k_e\): 50% → 1.0, 90% → 0.897, 99% → 0.814, 99.9% → 0.753.</li>
</ul>
<p><b>Creep:</b> time-dependent deformation at elevated temperature (≈ T &gt; 0.4 T<sub>melt</sub> absolute). Primary, secondary (steady-state, design region), tertiary.</p>
<p><b>Fracture mechanics:</b> \(K_I = Y\sigma\sqrt{\pi a}\); fracture when \(K_I \ge K_{Ic}\). Plane strain toughness \(K_{Ic}\) is a material property.</p>`
    }
  ],

  som: [
    {
      title: 'Axial, torsion, bending & transverse shear',
      html: R`
<table class="tbl"><tr><th>Load</th><th>Stress</th><th>Deformation</th></tr>
<tr><td>Axial</td><td>\(\sigma = P/A\)</td><td>\(\delta = PL/AE\)</td></tr>
<tr><td>Torsion (round)</td><td>\(\tau = Tr/J\); solid: \(16T/\pi d^3\)</td><td>\(\phi = TL/JG\)</td></tr>
<tr><td>Bending</td><td>\(\sigma = Mc/I = M/S\); solid round: \(32M/\pi d^3\)</td><td>beam tables</td></tr>
<tr><td>Transverse shear</td><td>\(\tau = VQ/Ib\); rect max \(1.5V/A\); solid circle max \(4V/3A\)</td><td>usually negligible</td></tr>
</table>
<p><b>Shear & moment diagrams:</b> \(dV/dx = -w\), \(dM/dx = V\). Max moment occurs where V = 0. Key cases:</p>
<ul>
<li>Simply supported, center load: \(M_{max} = PL/4\), \(y_{max} = PL^3/48EI\)</li>
<li>Simply supported, uniform w: \(M_{max} = wL^2/8\), \(y_{max} = 5wL^4/384EI\)</li>
<li>Cantilever, end load: \(M_{max} = PL\), \(y_{max} = PL^3/3EI\)</li>
<li>Cantilever, uniform w: \(M_{max} = wL^2/2\), \(y_{max} = wL^4/8EI\)</li>
</ul>
<p>Superposition works for linear-elastic deflections. Statically indeterminate beams → compatibility (e.g., propped cantilever).</p>
<div class="callout">📖 <b>Handbook:</b> search “Beam Deflection Formulas” or “Simply Supported” — the beam table is a major time-saver.</div>`
    },
    {
      title: 'Stress transformation & Mohr’s circle',
      html: R`
\[ \sigma_{1,2} = \frac{\sigma_x + \sigma_y}{2} \pm \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2} \qquad \tau_{max,in\text{-}plane} = \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2} \]
<p>Principal angle: \(\tan 2\theta_p = \dfrac{2\tau_{xy}}{\sigma_x - \sigma_y}\). Max shear plane is 45° from principal planes.</p>
<p><b>Absolute max shear</b> (3-D): \(\tau_{abs} = (\sigma_{max} - \sigma_{min})/2\) considering σ₃ (often 0 in plane stress). If σ₁ and σ₂ have the same sign, \(\tau_{abs} = \sigma_1/2\).</p>`
    },
    {
      title: 'Static failure theories',
      html: R`
<p><b>Ductile materials:</b></p>
<ul>
<li><b>Distortion energy (von Mises)</b> — most accurate for ductile. \(\sigma' = \sqrt{\sigma_1^2 - \sigma_1\sigma_2 + \sigma_2^2}\) or \(\sigma' = \sqrt{\sigma_x^2 - \sigma_x\sigma_y + \sigma_y^2 + 3\tau_{xy}^2}\). Shaft (σ, τ): \(\sigma' = \sqrt{\sigma^2 + 3\tau^2}\). \(n = S_y/\sigma'\). Shear yield \(S_{sy} = 0.577 S_y\).</li>
<li><b>Maximum shear stress (Tresca)</b> — conservative. \(n = \dfrac{S_y}{\sigma_1 - \sigma_3}\); shaft: \(n = S_y / \sqrt{\sigma^2 + 4\tau^2}\). \(S_{sy} = 0.5 S_y\).</li>
</ul>
<p><b>Brittle materials:</b> maximum normal stress (Rankine), Coulomb–Mohr, modified Mohr. Cast iron is much stronger in compression than tension.</p>
<p><b>Stress concentration:</b> \(\sigma_{max} = K_t \sigma_{nom}\). For ductile materials under static load, \(K_t\) is often ignored (local yielding redistributes). For fatigue use \(K_f = 1 + q(K_t - 1)\).</p>`
    },
    {
      title: 'Fatigue design (variable loading)',
      html: R`
<p>\(\sigma_m = (\sigma_{max} + \sigma_{min})/2\), \(\sigma_a = (\sigma_{max} - \sigma_{min})/2\). Apply \(K_f\) to both (for ductile, conventional approach).</p>
<table class="tbl"><tr><th>Criterion</th><th>Factor of safety</th></tr>
<tr><td>Modified Goodman</td><td>\(\dfrac{1}{n} = \dfrac{\sigma_a}{S_e} + \dfrac{\sigma_m}{S_{ut}}\)</td></tr>
<tr><td>Soderberg (conservative)</td><td>\(\dfrac{1}{n} = \dfrac{\sigma_a}{S_e} + \dfrac{\sigma_m}{S_{y}}\)</td></tr>
<tr><td>Gerber</td><td>\(\dfrac{n\sigma_a}{S_e} + \left(\dfrac{n\sigma_m}{S_{ut}}\right)^2 = 1\)</td></tr>
<tr><td>Langer (first-cycle yield)</td><td>\(n_y = \dfrac{S_y}{\sigma_a + \sigma_m}\)</td></tr></table>
<p><b>Finite life (S–N, Basquin):</b> \(S_f = aN^b\), with \(a = (fS_{ut})^2/S_e\), \(b = -\tfrac13\log(fS_{ut}/S_e)\), f ≈ 0.9 at 10³ cycles. Miner's rule for cumulative damage: \(\sum n_i/N_i = 1\).</p>
<p><b>Combined (shafts):</b> use von Mises on alternating and mean components separately: \(\sigma_a' = \sqrt{\sigma_a^2 + 3\tau_a^2}\), \(\sigma_m' = \sqrt{\sigma_m^2 + 3\tau_m^2}\).</p>`
    },
    {
      title: 'Columns, pressure vessels & interference',
      html: R`
<p><b>Euler buckling</b> (long columns): \(P_{cr} = \dfrac{\pi^2 EI}{(KL)^2}\). End conditions K: pinned-pinned 1.0, fixed-free 2.0, fixed-pinned 0.7 (theory) / 0.8 (recommended), fixed-fixed 0.5 (theory) / 0.65.</p>
<p>Slenderness \(KL/r\), \(r = \sqrt{I/A}\) (solid round: r = d/4). Transition slenderness \((KL/r)_1 = \sqrt{2\pi^2E/S_y}\). Below it use <b>Johnson</b>: \(\dfrac{P_{cr}}{A} = S_y - \left(\dfrac{S_y KL}{2\pi r}\right)^2\dfrac{1}{E}\).</p>
<p><b>Thin-walled vessels</b> (D/t &gt; 20): hoop \(\sigma_h = pD/2t\), longitudinal \(\sigma_l = pD/4t\), sphere \(pD/4t\). Hoop stress governs → longitudinal seams are critical.</p>
<p><b>Thick-walled (Lamé):</b> \(\sigma_t = \dfrac{p_i r_i^2}{r_o^2 - r_i^2}\left(1 + \dfrac{r_o^2}{r^2}\right)\), max at inner surface; radial \(\sigma_r = -p_i\) at inner surface.</p>
<p><b>ASME BPVC Sec. VIII Div. 1</b> cylindrical shell (circumferential stress): \(t = \dfrac{PR}{SE - 0.6P}\), R = inside radius, S = allowable, E = joint efficiency.</p>`
    }
  ],

  vib: [
    {
      title: 'Free vibration',
      html: R`
\[ \omega_n = \sqrt{\frac{k}{m}} \qquad f_n = \frac{\omega_n}{2\pi} \qquad \omega_n = \sqrt{\frac{g}{\delta_{st}}} \]
<p>Static-deflection shortcut is powerful: \(f_n\,[\text{Hz}] \approx 3.13/\sqrt{\delta_{st}\,[\text{in}]}\).</p>
<p><b>Springs:</b> parallel \(k = k_1 + k_2\); series \(1/k = 1/k_1 + 1/k_2\). Beam stiffness: cantilever \(3EI/L^3\), simply supported center \(48EI/L^3\), fixed-fixed center \(192EI/L^3\). Axial rod \(AE/L\), torsional shaft \(k_t = GJ/L\) with \(\omega_n = \sqrt{k_t/I}\).</p>
<p><b>Rayleigh / energy method</b> and effective mass: a spring's own mass adds about \(m_s/3\).</p>`
    },
    {
      title: 'Damping',
      html: R`
\[ \zeta = \frac{c}{c_c} = \frac{c}{2\sqrt{km}} = \frac{c}{2m\omega_n} \qquad \omega_d = \omega_n\sqrt{1-\zeta^2} \]
<p>Underdamped ζ &lt; 1 (oscillates), critically damped ζ = 1 (fastest return, no overshoot), overdamped ζ &gt; 1.</p>
<p><b>Logarithmic decrement:</b> \(\delta = \dfrac1N\ln\dfrac{x_0}{x_N}\), \(\zeta = \dfrac{\delta}{\sqrt{4\pi^2 + \delta^2}} \approx \dfrac{\delta}{2\pi}\).</p>`
    },
    {
      title: 'Forced vibration, isolation & critical speed',
      html: R`
<p>Frequency ratio \(r = \omega/\omega_n\). Magnification factor (force excitation):</p>
\[ \frac{X}{F_0/k} = \frac{1}{\sqrt{(1-r^2)^2 + (2\zeta r)^2}} \qquad TR = \sqrt{\frac{1 + (2\zeta r)^2}{(1-r^2)^2 + (2\zeta r)^2}} \]
<p>Undamped: \(TR = 1/|1 - r^2|\). <b>Isolation only occurs for r &gt; √2.</b> Above √2, adding damping <i>increases</i> transmissibility. Isolation efficiency = 1 − TR.</p>
<p><b>Rotating unbalance</b> \(m_0 e\): \(F_0 = m_0 e\omega^2\).</p>
<p><b>Shaft critical speed</b> (Rayleigh): \(\omega_{cr} = \sqrt{\dfrac{g\sum W_i y_i}{\sum W_i y_i^2}}\); single mass \(\omega_{cr} = \sqrt{g/\delta_{st}}\). Operate well away from critical speed (typically below 0.7× or above 1.4×).</p>`
    }
  ],

  mc: [
    {
      title: 'Shafts & keys',
      html: R`
<p>Torque from power: \(T = 63{,}025\,H/n\) (lbf·in, hp, rpm).</p>
<p><b>Static sizing, torsion only:</b> \(d = \left(\dfrac{16T}{\pi\tau_{allow}}\right)^{1/3}\).</p>
<p><b>Combined bending + torsion (von Mises):</b> \(\sigma = 32M/\pi d^3\), \(\tau = 16T/\pi d^3\), \(\sigma' = \sqrt{\sigma^2 + 3\tau^2}\).</p>
<p><b>DE-Goodman fatigue sizing (Shigley):</b></p>
\[ d = \left\{\frac{16n}{\pi}\left(\frac{1}{S_e}\left[4(K_fM_a)^2 + 3(K_{fs}T_a)^2\right]^{1/2} + \frac{1}{S_{ut}}\left[4(K_fM_m)^2 + 3(K_{fs}T_m)^2\right]^{1/2}\right)\right\}^{1/3} \]
<p>Rotating shaft with steady loads: bending is fully reversed (\(M_a = M\)), steady torque is mean (\(T_m = T\)).</p>
<p><b>Keys:</b> force at shaft surface \(F = 2T/D\). Shear \(\tau = F/(wL)\); bearing (crushing) on square key \(\sigma = F/(L\,h/2)\). Square key width ≈ D/4. Keys are designed to fail before the shaft/hub.</p>`
    },
    {
      title: 'Rolling-element bearings',
      html: R`
\[ L_{10} = \left(\frac{C}{P}\right)^a \times 10^6\ \text{rev} \qquad a = 3\ \text{(ball)},\ 10/3\ \text{(roller)} \qquad L_h = \frac{L_{10}}{60n} \]
<p>Check the catalog rating basis — some (e.g., Timken) rate at 90×10⁶ rev. Equivalent load \(P = XVF_r + YF_a\) (V = 1.2 if outer ring rotates relative to load, for some references). Reliability other than 90%: Weibull adjustment.</p>
<p>Doubling the load reduces ball bearing life by \(2^3 = 8\times\).</p>
<p><b>Journal (sliding) bearings:</b> Sommerfeld number \(S = (r/c)^2\,\mu N/P\) (N in rev/s, P = load/projected area). Petroff (lightly loaded): \(T = \dfrac{4\pi^2 r^3 L\mu N}{c}\). Raimondi–Boyd charts give friction, flow, and minimum film thickness. PV value limits for bushings.</p>`
    },
    {
      title: 'Gears',
      html: R`
<ul>
<li><b>Spur gear geometry:</b> \(d = N/P_d\) (diametral pitch, US), \(d = mN\) (module, SI). Circular pitch \(p = \pi/P_d\). Addendum \(1/P_d\), dedendum \(1.25/P_d\). Center distance \((d_1 + d_2)/2\).</li>
<li><b>Speed ratio:</b> \(n_1/n_2 = N_2/N_1 = d_2/d_1\). Gear train value \(e = \dfrac{\prod N_{drivers}}{\prod N_{driven}}\); idlers don't change ratio, only direction.</li>
<li><b>Forces:</b> pitch-line velocity \(V = \pi d n/12\) (ft/min, d in in). Transmitted load \(W_t = 33{,}000\,H/V\). Radial \(W_r = W_t\tan\phi\). Helical: \(W_a = W_t\tan\psi\).</li>
<li><b>Lewis bending:</b> \(\sigma = \dfrac{K_v W_t P_d}{F Y}\). AGMA: \(\sigma = W_t K_o K_v K_s \dfrac{P_d}{F}\dfrac{K_m K_B}{J}\).</li>
<li><b>Contact (pitting) stress:</b> AGMA \(\sigma_c = C_p\sqrt{W_t K_o K_v K_s \dfrac{K_m}{d_P F}\dfrac{C_f}{I}}\).</li>
<li><b>Interference:</b> 20° full-depth spur pinion — minimum ≈ 18 teeth meshing with a rack (≈13 with mating pinion of equal size).</li>
<li><b>Planetary trains:</b> \(\dfrac{n_L - n_A}{n_F - n_A} = e\) (L = last, F = first, A = arm).</li>
<li><b>Worm gears:</b> ratio = \(N_G/N_W\) (number of worm threads/starts). Can be self-locking.</li>
</ul>`
    },
    {
      title: 'Springs',
      html: R`
<p>Spring index \(C = D/d\) (mean coil dia. / wire dia.), typically 4–12.</p>
\[ k = \frac{G d^4}{8 D^3 N_a} \qquad \tau = K_B\frac{8FD}{\pi d^3} \qquad K_B = \frac{4C + 2}{4C - 3}\ \ (\text{Bergsträsser}) \]
<p>Wahl factor (alternative): \(K_W = \dfrac{4C - 1}{4C - 4} + \dfrac{0.615}{C}\). Direct shear factor \(K_s = 1 + 0.5/C\) (used for static loading with set removed).</p>
<p><b>Active coils:</b> squared & ground ends \(N_a = N_t - 2\); squared \(N_t - 2\); plain \(N_t\); plain & ground \(N_t - 1\). Solid length (sq & ground) \(L_s = d N_t\).</p>
<p><b>Buckling:</b> check free length / D ratio (≲ 4 for parallel ends). <b>Surge:</b> natural frequency \(f = \dfrac{d}{2\pi D^2 N_a}\sqrt{\dfrac{Gg}{32\rho}}\) (fixed–fixed ends: \(\tfrac12\sqrt{k/m}\)) — keep ≥ 15–20× operating frequency.</p>
<p>Strength: \(S_{ut} = A/d^m\) (music wire, oil-tempered, chrome-vanadium, etc.); \(S_{sy} \approx 0.45 S_{ut}\) for many spring wires.</p>`
    },
    {
      title: 'Belts, chains, clutches & brakes',
      html: R`
<p><b>Flat/V-belts:</b> \(\dfrac{F_1 - F_c}{F_2 - F_c} = e^{f\phi}\) (V-belt: use \(f/\sin(\beta/2)\)). Power \(H = (F_1 - F_2)V/33{,}000\) hp, V in ft/min. Centrifugal tension \(F_c = mV^2\) — often neglected at low speed. Wrap angle on small pulley: \(\phi = \pi - 2\sin^{-1}\dfrac{D - d}{2C}\).</p>
<p><b>Roller chain:</b> pitch velocity \(V = Npn/12\). Chordal action → use ≥ 17 teeth on small sprocket; odd tooth counts with even-numbered links.</p>
<p><b>Disc clutches/brakes</b> (N friction surfaces):</p>
<ul>
<li>Uniform wear (worn-in, conservative for torque): \(T = N\,\dfrac{fF(D + d)}{4}\); \(F = \dfrac{\pi p_a d (D - d)}{2}\) (p<sub>a</sub> at inner diameter).</li>
<li>Uniform pressure (new): \(T = N\,\dfrac{fF}{3}\dfrac{D^3 - d^3}{D^2 - d^2}\).</li>
<li>Optimal torque capacity at \(d \approx 0.577 D\).</li>
</ul>
<p><b>Band brake:</b> \(P_1/P_2 = e^{f\phi}\), \(T = (P_1 - P_2)D/2\). <b>Short-shoe drum brakes:</b> moment balance about the pivot — check self-energizing / self-locking conditions.</p>
<p><b>Energy & temperature rise:</b> \(\Delta T = E/(mc)\).</p>`
    },
    {
      title: 'Power screws',
      html: R`
<p>Square thread, mean diameter \(d_m = d - p/2\), lead \(l = n_{starts}\,p\).</p>
\[ T_R = \frac{F d_m}{2}\left(\frac{l + \pi f d_m}{\pi d_m - f l}\right) + \frac{F f_c d_c}{2} \qquad T_L = \frac{F d_m}{2}\left(\frac{\pi f d_m - l}{\pi d_m + f l}\right) + \frac{F f_c d_c}{2} \]
<p>Acme: replace f with \(f\sec\alpha\) where α = 14.5°. <b>Self-locking</b> when \(\pi f d_m > l\) (i.e., \(f > \tan\lambda\)). Efficiency \(e = Fl/(2\pi T_R)\).</p>`
    },
    {
      title: 'Flywheels, hydraulics & motors',
      html: R`
<p><b>Flywheel:</b> \(\Delta E = \tfrac12 I(\omega_{max}^2 - \omega_{min}^2) = C_s I\omega_{avg}^2\), coefficient of speed fluctuation \(C_s = (\omega_{max} - \omega_{min})/\omega_{avg}\).</p>
<p><b>Hydraulic cylinders:</b> extend force \(F = p\pi D^2/4\); retract force \(p\pi(D^2 - d^2)/4\). Speed \(v = Q/A\). Hydraulic power \(H = pQ/1714\) (psi, gpm). Pump power = hydraulic power / efficiency. Pascal’s law: pressure equal throughout a static fluid. Accumulators store energy; relief valves set max pressure; flow control valves set speed (meter-in / meter-out).</p>
<p><b>Electric motors:</b> synchronous speed \(n_s = 120f/p\) (p = poles). Induction motor slip \(s = (n_s - n)/n_s\). 3-phase power \(P = \sqrt3\,V I\,\text{pf}\,\eta\).</p>
<p><b>Engines:</b> brake power = indicated power − friction power. Mean effective pressure \(\text{BHP} = \dfrac{\text{bmep}\,L A N n}{33{,}000\,(\times 2\ \text{for 4-stroke})}\).</p>`
    }
  ],

  jf: [
    {
      title: 'Bolted joints — preload & load sharing',
      html: R`
<p><b>Preload (Shigley recommendation):</b> \(F_i = 0.75 A_t S_p\) reusable; \(0.90 A_t S_p\) permanent. Tightening torque \(T = K F_i d\), K ≈ 0.2 (dry/unlubricated), 0.15–0.18 lubricated.</p>
<table class="tbl"><tr><th>UNC size</th><th>A<sub>t</sub> (in²)</th><th></th><th>SAE grade</th><th>S<sub>p</sub> (ksi)</th></tr>
<tr><td>1/4-20</td><td>0.0318</td><td></td><td>2 (≤3/4)</td><td>55</td></tr>
<tr><td>5/16-18</td><td>0.0524</td><td></td><td>5 (1/4–1)</td><td>85</td></tr>
<tr><td>3/8-16</td><td>0.0775</td><td></td><td>8</td><td>120</td></tr>
<tr><td>1/2-13</td><td>0.1419</td><td></td><td>ISO 8.8</td><td>600 MPa</td></tr>
<tr><td>5/8-11</td><td>0.226</td><td></td><td>ISO 10.9</td><td>830 MPa</td></tr>
<tr><td>3/4-10</td><td>0.334</td><td></td><td>ISO 12.9</td><td>970 MPa</td></tr></table>
<p><b>Joint constant:</b> \(C = \dfrac{k_b}{k_b + k_m}\). Under external tensile load P per bolt:</p>
\[ F_b = F_i + CP \qquad F_m = F_i - (1 - C)P \qquad P_0 = \frac{F_i}{1 - C}\ (\text{separation}) \]
<p>Bolt stiffness \(k_b = \dfrac{A_d A_t E}{A_d l_t + A_t l_d}\). Members are typically 3–5× stiffer than the bolt, so the bolt sees only a small fraction of P — that's why preload improves fatigue life.</p>
<p><b>Factors of safety:</b> yield \(n_p = \dfrac{S_pA_t}{CP + F_i}\), load factor \(n_L = \dfrac{S_pA_t - F_i}{CP}\), separation \(n_0 = \dfrac{F_i}{P(1 - C)}\).</p>`
    },
    {
      title: 'Bolts & pins in shear; bolt groups',
      html: R`
<ul>
<li>Single shear \(\tau = F/A\); double shear (clevis) \(\tau = F/(2A)\).</li>
<li>Bearing on plate \(\sigma_b = F/(d\,t)\); tear-out; net-section tension \(F/[(w - d)t]\).</li>
<li><b>Eccentric shear loads on a bolt group:</b> find centroid of the group; primary shear \(F/n\) per bolt; secondary \(F_i'' = \dfrac{M r_i}{\sum r_j^2}\) perpendicular to r<sub>i</sub>. Add vectorially; the bolt farthest from the centroid on the load side is critical.</li>
</ul>`
    },
    {
      title: 'Welded joints',
      html: R`
<p>Fillet weld with leg h: throat \(t = 0.707h\). Throat area \(A = 0.707 h L\). Design on <b>throat shear</b> for both parallel and transverse loading (conservative).</p>
\[ \tau = \frac{F}{0.707\,h\,L_{total}} \]
<p><b>Welds as lines</b> (unit properties): \(\tau'' = \dfrac{Mr}{J}\), \(J = 0.707h\,J_u\); bending \(\sigma = \dfrac{M}{0.707h\,I_u}\). Combine primary and secondary shear vectorially.</p>
<p><b>Allowable (AISC):</b> weld metal shear on throat \(0.30\,S_{ut,electrode}\) (E70XX → 21 ksi). Electrode E70XX: 70 ksi tensile strength. Base metal shear ≤ 0.40 S<sub>y</sub>.</p>
<p><b>Processes:</b> SMAW (stick), GMAW (MIG), GTAW (TIG, best quality, thin/non-ferrous), FCAW, SAW (high deposition, flat position). Brazing uses filler above 840 °F (450 °C) without melting base metal; soldering below.</p>
<p><b>Weld fatigue:</b> use K<sub>f</sub> per weld type (e.g., toe of transverse fillet 1.5, end of parallel fillet 2.7).</p>`
    },
    {
      title: 'Press & shrink fits; adhesives; rivets',
      html: R`
<p>Interface pressure (same material, hub outer radius r<sub>o</sub>, shaft inner radius r<sub>i</sub>, nominal radius R, <b>radial</b> interference δ):</p>
\[ p = \frac{E\delta}{2R^3}\left[\frac{(r_o^2 - R^2)(R^2 - r_i^2)}{r_o^2 - r_i^2}\right] \]
<p>Solid shaft (r<sub>i</sub> = 0): \(p = \dfrac{E\delta}{2R}\left(1 - \dfrac{R^2}{r_o^2}\right)\). Note: diametral interference = 2δ.</p>
<p>Torque capacity \(T = 2\pi f p R^2 L\); axial force \(F = 2\pi f p R L\). Hub hoop stress at bore: \(\sigma_t = p\,\dfrac{r_o^2 + R^2}{r_o^2 - R^2}\).</p>
<p>Shrink-fit temperature: \(\Delta T = \delta_{diametral}/(\alpha D)\) plus assembly clearance.</p>
<p><b>Adhesives:</b> strongest in shear, weak in peel/cleavage. Lap joint stress peaks at the overlap ends. Surface prep is critical. Epoxies (structural), cyanoacrylates (fast), anaerobics (thread lockers), silicones (flexible, sealing).</p>
<p><b>Rivets:</b> analyzed like bolts in shear and bearing; joint efficiency = strength of joint / strength of solid plate.</p>`
    }
  ],

  sk: [
    {
      title: 'Fits, tolerances & GD&T',
      html: R`
<ul>
<li><b>Allowance</b> = tightest condition = MMC hole − MMC shaft (min clearance or max interference).</li>
<li>Max clearance = largest hole − smallest shaft. Min clearance = smallest hole − largest shaft (negative → interference).</li>
<li><b>ANSI fit classes:</b> RC (running/sliding clearance), LC (locational clearance), LT (transition), LN (locational interference), FN (force/shrink).</li>
<li><b>ISO:</b> hole basis H7/g6 (sliding), H7/h6 (locational clearance), H7/k6 (transition), H7/p6 (locational interference), H7/s6 (medium drive). Capital = hole, lowercase = shaft.</li>
<li><b>Tolerance stack-up:</b> worst case \(t = \sum t_i\); statistical RSS \(t = \sqrt{\sum t_i^2}\).</li>
</ul>
<p><b>GD&T (ASME Y14.5):</b> form (flatness, straightness, circularity, cylindricity — no datum), orientation (parallelism, perpendicularity, angularity), location (position, concentricity, symmetry), profile (line, surface), runout (circular, total). MMC Ⓜ allows <i>bonus tolerance</i> as the feature departs from MMC. Virtual condition (external feature, MMC) = MMC size + geometric tolerance. Rule #1: perfect form at MMC (envelope principle).</p>`
    },
    {
      title: 'Manufacturing processes',
      html: R`
<ul>
<li><b>Machining:</b> spindle speed \(N = 12V/(\pi D)\) rpm (V sfm, D in). Turning time \(t = L/(fN)\). Material removal rate (turning) \(\text{MRR} = 12Vfd\) in³/min. Taylor tool life \(VT^n = C\).</li>
<li><b>Casting:</b> sand (cheap, rough), investment (precise, complex), die (high volume, non-ferrous). Chvorinov's rule: \(t_s = B(V/A)^2\). Allow shrinkage, draft, fillets.</li>
<li><b>Forming:</b> forging (grain flow, strength), rolling, extrusion, drawing, sheet metal (bending: minimum bend radius, springback). Hot working above recrystallization temperature.</li>
<li><b>Joining:</b> see Joints & Fasteners.</li>
<li><b>Additive manufacturing:</b> FDM, SLA, SLS, DMLS — anisotropic properties, surface finish post-processing.</li>
<li><b>Finishing:</b> grinding, honing, lapping, polishing; shot peening adds compressive residual stress (fatigue ↑).</li>
<li><b>Typical achievable tolerances:</b> sand casting ±0.03 in; machining ±0.001–0.005; grinding ±0.0002.</li>
</ul>`
    },
    {
      title: 'Quality, reliability & statistics',
      html: R`
<ul>
<li>Normal distribution: ±1σ 68.3%, ±2σ 95.4%, ±3σ 99.73%. \(z = (x - \mu)/\sigma\).</li>
<li><b>Process capability:</b> \(C_p = \dfrac{USL - LSL}{6\sigma}\), \(C_{pk} = \min\left(\dfrac{USL - \mu}{3\sigma}, \dfrac{\mu - LSL}{3\sigma}\right)\). C<sub>pk</sub> ≥ 1.33 is a common target.</li>
<li><b>Reliability:</b> series \(R = \prod R_i\); parallel \(R = 1 - \prod(1 - R_i)\). Constant failure rate: \(R(t) = e^{-\lambda t}\), MTBF = 1/λ.</li>
<li><b>Interference theory:</b> stress and strength both normal → \(z = -\dfrac{\mu_S - \mu_\sigma}{\sqrt{\hat\sigma_S^2 + \hat\sigma_\sigma^2}}\), reliability = 1 − Φ(z).</li>
<li><b>Weibull:</b> \(R = \exp\left[-\left(\dfrac{x - x_0}{\theta - x_0}\right)^b\right]\) — used for bearing life at other reliabilities.</li>
<li>FMEA: RPN = Severity × Occurrence × Detection.</li>
</ul>`
    },
    {
      title: 'Codes, standards, testing & design considerations',
      html: R`
<ul>
<li><b>Codes:</b> ASME BPVC (pressure vessels — Sec. VIII), ASME B31 (piping: B31.1 power, B31.3 process), ASME Y14.5 (GD&T), AGMA (gears), AWS D1.1 (structural welding), AISC (steel construction), ANSI/ABMA (bearings), ASTM (material specs & test methods), SAE J429 (bolt grades), OSHA (machine guarding).</li>
<li><b>Testing:</b> tensile (ASTM E8), hardness (E10 Brinell, E18 Rockwell), Charpy impact (E23), fatigue (rotating beam, R.R. Moore). NDT: visual, dye penetrant (surface cracks), magnetic particle (surface/near-surface, ferromagnetic only), ultrasonic (internal), radiography (internal volumetric), eddy current (conductive, surface).</li>
<li><b>Instrumentation:</b> strain gauge \(GF = \dfrac{\Delta R/R}{\varepsilon}\); Wheatstone bridge (quarter, half, full — full bridge most sensitive and temp-compensated). Accuracy vs. precision. Thermocouples, RTDs, LVDTs, load cells.</li>
<li><b>Factor of safety</b> = strength / stress (or capacity / load). Design factor applied up front.</li>
<li><b>Computational methods:</b> FEA — mesh convergence, boundary conditions, singularities at sharp corners/point loads.</li>
</ul>`
    }
  ]
};
