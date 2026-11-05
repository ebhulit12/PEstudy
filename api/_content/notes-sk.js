/* Supportive Knowledge — additional study-note sections. */
(window.NOTES.sk = window.NOTES.sk || []).push(
  {
    title: 'Machining economics & process selection',
    html: R`
<ul>
<li><b>Turning:</b> \(N = 12V/\pi D\); time \(t = L/(fN)\); \(\text{MRR} = 12Vfd\). <b>Drilling:</b> add ≈ 0.3D for the drill point to the hole depth. <b>Milling:</b> \(f_r = N n_t f_t\), time \(t = (L + \text{allowance})/f_r\).</li>
<li><b>Taylor tool life:</b> \(VT^n = C\). Typical n: HSS ≈ 0.125, carbide ≈ 0.25, ceramic ≈ 0.5–0.7. Extended form: \(VT^nf^ad^b = C\).</li>
<li><b>Cutting power:</b> \(P = \text{MRR}\times u\) (unit power: aluminum ≈ 0.3, cast iron ≈ 0.8, steel ≈ 1–2 hp·min/in³). Divide by spindle efficiency for motor power.</li>
<li><b>Cost per part</b> = machining + tool cost share + handling. A minimum-cost speed exists because higher speed cuts time but uses up tools faster.</li>
<li><b>Process selection by volume and tolerance:</b> machining (flexible, ±0.001 in); die casting / injection molding (high volume, tooling cost); sand casting (large and cheap, ±0.03 in); forging (strength, grain flow); stamping (sheet, high volume); additive (complex, low volume, anisotropic).</li>
<li><b>Surface finish</b> (Ra, μin): sand casting 250–1000, turning/milling 32–250, grinding 8–63, honing/lapping 2–16. Finer finish costs roughly exponentially more.</li>
</ul>`
  },
  {
    title: 'Worked example: GD&T bonus tolerance and fit check',
    html: R`
<p><b>Problem.</b> Holes: Ø0.500 +0.006/−0.000 with position Ø0.008 Ⓜ. Mating pins: Ø0.4950 ± 0.0005 with position Ø0.004 Ⓜ. Will every acceptable pin assemble into every acceptable hole?</p>
<ol class="steps">
<li><b>Hole virtual condition</b> (internal: MMC − tol): 0.500 − 0.008 = <b>0.492</b> in. This is the smallest "effective" hole, a perfect cylinder always clear inside every good hole.</li>
<li><b>Pin virtual condition</b> (external: MMC + tol): 0.4955 + 0.004 = <b>0.4995</b> in. This is the largest "effective" pin.</li>
<li><b>Check:</b> the pin VC (0.4995) is larger than the hole VC (0.492), so in the worst case the parts may <b>not</b> assemble.</li>
<li><b>Fix:</b> require pin VC ≤ hole VC. For example, reduce the hole position tolerance to Ø0.0005 (0.500 − 0.0005 = 0.4995). Or, more practically, enlarge the hole to Ø0.508 (VC 0.500), or reduce the pin diameter.</li>
<li><b>Bonus in practice:</b> a hole made at 0.504 may be off position by up to Ø0.008 + 0.004 = Ø0.012, and the MMC modifier allows that without risking assembly.</li>
</ol>
<div class="callout">Floating-fastener formula: H = F + T (hole MMC = fastener MMC + position tolerance). For fixed fasteners (studs, press pins): H = F + 2T.</div>`
  }
);
