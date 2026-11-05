/* Vibration — additional study-note sections. */
(window.NOTES.vib = window.NOTES.vib || []).push(
  {
    title: 'Rotating machinery: unbalance, balancing & diagnostics',
    html: R`
<ul>
<li><b>Rotating unbalance:</b> force \(F = m_0e\omega^2\). Response \(X = \dfrac{m_0e}{M}\dfrac{r^2}{\sqrt{(1 - r^2)^2 + (2\zeta r)^2}}\). Below resonance X grows with speed; far above it, X → m₀e/M.</li>
<li><b>Balancing:</b> single-plane (static) for thin disks; two-plane (dynamic) for long rotors with couple unbalance. Balance quality grade (ISO 21940-11, G-numbers): \(G = e\,\omega\) (mm/s); e.g., G6.3 for fans and pumps, G2.5 for turbines and machine tools.</li>
<li><b>Critical speeds:</b> lateral \(\omega_{cr} = \sqrt{g/\delta}\) for a single mass; Rayleigh for several masses. Run below ≈ 0.7ω<sub>cr</sub> or above ≈ 1.4ω<sub>cr</sub>, and pass through quickly.</li>
<li><b>Torsional systems:</b> \(\omega_n = \sqrt{k_t/I}\); two disks on a shaft: \(\omega_n = \sqrt{k_t(I_1 + I_2)/(I_1I_2)}\) with a node between them.</li>
<li><b>Diagnostics (spectrum):</b> 1× running speed = unbalance or bent shaft; 2× = misalignment or looseness; sub-synchronous (≈0.42–0.48×) = oil whirl in journal bearings; bearing defect frequencies (BPFO, BPFI, BSF, FTF) are non-integer multiples; gear mesh frequency = teeth × rpm (with sidebands for eccentricity).</li>
<li><b>Vibration absorber:</b> tuned to the forcing frequency, \(\omega_a = \sqrt{k_a/m_a} = \omega\), it cancels the main mass’s motion at that frequency.</li>
</ul>`
  }
);
