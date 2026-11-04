/* NCEES PE Mechanical: Machine Design & Materials — exam specification outline.
   Question ranges are approximate (per the NCEES CBT spec). Always confirm the
   current version at ncees.org before your exam. */
window.SPEC = {
  examName: 'PE Mechanical: Machine Design and Materials',
  totalQuestions: 80,
  appointmentHours: 9,
  examMinutes: 480,
  topics: [
    {
      id: 'bep', area: 'Principles', name: 'Basic Engineering Practice', short: 'Eng. Practice', range: [8, 12], color: '#6366f1', order: 1,
      subs: ['Engineering terms, symbols & technical drawings', 'Economic analysis', 'Units & conversions', 'Project management']
    },
    {
      id: 'esm', area: 'Principles', name: 'Engineering Science & Mechanics', short: 'Statics/Dynamics', range: [9, 14], color: '#0ea5e9', order: 2,
      subs: ['Statics', 'Kinematics', 'Dynamics (forces, energy, momentum)']
    },
    {
      id: 'mat', area: 'Principles', name: 'Material Properties', short: 'Materials', range: [7, 11], color: '#14b8a6', order: 3,
      subs: ['Physical properties', 'Chemical properties & corrosion', 'Mechanical properties', 'Heat treatment & processing effects']
    },
    {
      id: 'som', area: 'Principles', name: 'Strength of Materials', short: 'Strength of Mat.', range: [9, 14], color: '#22c55e', order: 4,
      subs: ['Shear & moment diagrams', 'Stress types & transformations (Mohr)', 'Stress–strain & deflection', 'Load types (axial, bending, torsion, shear)', 'Failure theories (static & fatigue)', 'Failure modes (buckling, creep, fracture)']
    },
    {
      id: 'vib', area: 'Principles', name: 'Vibration', short: 'Vibration', range: [4, 6], color: '#eab308', order: 5,
      subs: ['Natural frequency', 'Damping', 'Forced vibration & isolation']
    },
    {
      id: 'mc', area: 'Applications', name: 'Mechanical Components', short: 'Components', range: [16, 24], color: '#f97316', order: 6,
      subs: ['Pressure vessels & piping', 'Bearings', 'Gears', 'Springs', 'Belts, pulleys & chains', 'Clutches & brakes', 'Power screws', 'Shafts & keys', 'Mechanisms & flywheels', 'Hydraulic & pneumatic components', 'Motors & engines']
    },
    {
      id: 'jf', area: 'Applications', name: 'Joints & Fasteners', short: 'Joints/Fasteners', range: [9, 14], color: '#ef4444', order: 7,
      subs: ['Welding & brazing', 'Bolts, screws & rivets', 'Pins, keys & press/shrink fits', 'Adhesives']
    },
    {
      id: 'sk', area: 'Applications', name: 'Supportive Knowledge', short: 'Supportive', range: [7, 11], color: '#a855f7', order: 8,
      subs: ['Manufacturing processes', 'Fits & tolerances / GD&T', 'Codes & standards', 'Quality, reliability & statistics', 'Testing & instrumentation', 'Design & analysis considerations']
    }
  ]
};
window.SPEC.byId = Object.fromEntries(window.SPEC.topics.map((t) => [t.id, t]));
window.SPEC.weight = (id) => {
  const t = window.SPEC.byId[id];
  return (t.range[0] + t.range[1]) / 2;
};
