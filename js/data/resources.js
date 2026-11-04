/* External resources. YouTube links are search queries (always current) rather than
   specific videos that may disappear. */
(function () {
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  window.RESOURCES = {
    official: [
      { name: 'NCEES — PE Mechanical exam page', url: 'https://ncees.org/exams/pe-exam/mechanical/', note: 'Exam specifications, CBT format, scheduling, approved calculators. Confirm the current MDM spec here.' },
      { name: 'MyNCEES account', url: 'https://account.ncees.org/', note: 'Register, schedule at Pearson VUE, and download the free PE Mechanical Reference Handbook (PDF).' },
      { name: 'NCEES calculator policy', url: 'https://ncees.org/exams/calculator-policy/', note: 'Casio fx-115/fx-991, HP 33s/35s, TI-30X/TI-36X models only. Practice on the exact model you will bring.' },
      { name: 'NCEES PE Mechanical MDM Practice Exam', url: 'https://account.ncees.org/', note: 'Official 80-question practice exam (purchase through MyNCEES/the NCEES store). The closest thing to the real exam — save it for the final 2–3 weeks.' }
    ],
    books: [
      { name: 'Shigley’s Mechanical Engineering Design (Budynas & Nisbett)', note: 'The core machine design text; most handbook equations trace back to it. Great for learning, not allowed in the exam.' },
      { name: 'PPI Mechanical Engineering Reference Manual (MERM)', url: 'https://ppi2pass.com/', note: 'Broad review with lots of examples. PPI also sells MDM practice problems and exams.' },
      { name: 'Engineering Pro Guides — Machine Design & Materials', url: 'https://www.engproguides.com/', note: 'MDM-specific practice exams and technical study guides written around the CBT handbook.' },
      { name: 'School of PE / other live review courses', url: 'https://www.schoolofpe.com/', note: 'Structured live/online reviews if you prefer an instructor-led schedule.' },
      { name: 'Machinery’s Handbook', note: 'Excellent desk reference for fits, threads and manufacturing data (not allowed in the exam).' }
    ],
    free: [
      { name: 'MIT OpenCourseWare — mechanical design & mechanics courses', url: 'https://ocw.mit.edu/search/?d=Mechanical%20Engineering', note: 'Free lecture notes/videos: Elements of Mechanical Design, Mechanics & Materials, Dynamics.' },
      { name: 'Engineering ToolBox', url: 'https://www.engineeringtoolbox.com/', note: 'Quick property tables and conversions for self-study.' }
    ],
    videoSearches: {
      bep: [['Engineering economics PE exam examples', yt('engineering economics present worth annual worth example problems')], ['Reading engineering drawings & weld symbols', yt('AWS weld symbols explained')], ['Critical path method example', yt('critical path method example problem')]],
      esm: [['Statics — beam reactions & friction', yt('statics beam reactions friction incline example')], ['Rigid body dynamics', yt('rigid body dynamics moment of inertia torque example')], ['Work–energy & impulse–momentum', yt('work energy method dynamics example problem')]],
      mat: [['Iron–carbon phase diagram explained', yt('iron carbon phase diagram explained')], ['Heat treatment of steel', yt('heat treatment of steel annealing normalizing quenching tempering')], ['Galvanic corrosion', yt('galvanic corrosion explained')], ['Marin factors / endurance limit', yt('Marin factors endurance limit Shigley example')]],
      som: [['Mohr’s circle', yt('mohrs circle explained example')], ['Shear & moment diagrams', yt('shear and moment diagrams example')], ['von Mises vs Tresca', yt('von mises tresca failure theory example')], ['Goodman fatigue diagram', yt('modified goodman fatigue example shigley')], ['Euler column buckling', yt('euler buckling column example problem')]],
      vib: [['Spring–mass natural frequency', yt('natural frequency spring mass system example')], ['Damping ratio & log decrement', yt('logarithmic decrement damping ratio example')], ['Vibration isolation & transmissibility', yt('vibration isolation transmissibility example')]],
      mc: [['Bearing life calculation', yt('ball bearing L10 life calculation example')], ['Spur gear forces', yt('spur gear transmitted load example shigley')], ['Helical spring design', yt('helical compression spring design example')], ['Power screws', yt('power screw torque raise lower example')], ['Clutches & brakes', yt('disc clutch uniform wear uniform pressure example')], ['Shaft design DE-Goodman', yt('shaft design DE Goodman Shigley example')], ['Belt drives', yt('flat belt drive tension power example')]],
      jf: [['Bolted joint preload & stiffness', yt('bolted joint stiffness preload example shigley')], ['Fillet weld design', yt('fillet weld throat shear design example')], ['Press fit / shrink fit', yt('press fit interference pressure example')], ['Eccentric bolt group', yt('eccentric loading bolt group shear example')]],
      sk: [['GD&T fundamentals', yt('GD&T basics position MMC bonus tolerance')], ['Limits & fits', yt('limits and fits ISO hole basis explained')], ['Machining calculations', yt('machining speed feed time calculation turning')], ['Process capability Cp Cpk', yt('process capability Cp Cpk explained example')]],
      general: [['PE Mechanical MDM exam walkthroughs', yt('PE mechanical machine design and materials practice problem')], ['How to use the NCEES PE handbook (CBT)', yt('NCEES PE mechanical reference handbook search tips CBT')]]
    }
  };
})();
