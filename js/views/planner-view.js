/* Study planner UI: settings form, generated timeline, weekly task lists, calendar export. */
(function (global) {
  'use strict';
  const { $, $$, esc, fmt } = U;
  const VIEWS = (global.VIEWS = global.VIEWS || {});
  const RATING = ['', '1 · New to me', '2 · Rusty', '3 · Okay', '4 · Solid', '5 · Strong'];

  VIEWS.planner = function (el, params, q) {
    const plan = Store.s.plan;
    const s = plan ? plan.settings : Planner.defaultSettings();
    const editing = !plan || q.edit;

    el.innerHTML = `
      <div class="page-head"><h1>🗓️ Study Planner</h1>
      <p class="muted">Enter your exam date and availability. The planner splits your time into <b>Learn</b> → <b>Practice exams</b> → <b>Final review</b> phases and allocates hours by NCEES topic weight and how confident you feel (and, once you have data, your actual accuracy).</p></div>
      <form class="card planner-form ${editing ? '' : 'collapsed'}" id="pf">
        <div class="card-head"><h2>Plan settings</h2>${plan ? '<button type="button" class="btn small" id="toggleForm">' + (editing ? 'Hide' : 'Edit settings') + '</button>' : ''}</div>
        <div class="form-body">
          <div class="grid3">
            <label>Start date<input type="date" id="ps" value="${s.startDate}"></label>
            <label>Exam date<input type="date" id="pe" value="${s.examDate}"></label>
            <label>Study hours per week<input type="number" id="ph" min="2" max="40" step="1" value="${s.hoursPerWeek}"></label>
          </div>
          <div class="days"><span>Study days:</span>${Planner.DOW.map((d, i) => `<label class="daychk"><input type="checkbox" data-dow="${i}" ${s.days[i] ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div>
          <p class="muted small" id="hint"></p>
          <h3>Self-assessment</h3>
          <div class="ratings">${SPEC.topics.map((t) => `
            <div class="rating-row"><span class="dot" style="background:${t.color}"></span><span class="rname">${t.name}<small class="muted"> ${t.range[0]}–${t.range[1]}Q</small></span>
            <input type="range" min="1" max="5" step="1" value="${s.ratings[t.id] || 3}" data-rate="${t.id}"><span class="rval" id="rv-${t.id}">${RATING[s.ratings[t.id] || 3]}</span></div>`).join('')}</div>
          <label class="chk"><input type="checkbox" id="pu" ${s.useStats !== false ? 'checked' : ''}> Blend in my measured accuracy (topics with 8+ attempts)</label>
          <div class="row gap"><button class="btn primary big" type="submit">${plan ? '♻️ Regenerate plan' : '✨ Generate my plan'}</button>
          ${plan ? '<span class="muted small">Regenerating keeps your completed-task history; tasks are re-laid from the start date.</span>' : ''}</div>
        </div>
      </form>
      <div id="planOut"></div>`;

    const hint = () => {
      const a = U.parseDate($('#ps', el).value || U.isoDate(U.today())), b = U.parseDate($('#pe', el).value || U.isoDate(U.today()));
      const d = U.daysBetween(a, b), wks = d / 7;
      const nd = $$('[data-dow]', el).filter((c) => c.checked).length;
      const h = +$('#ph', el).value || 0;
      const total = Math.round(wks * h);
      $('#hint', el).innerHTML = d > 0 ? `${d} days (${fmt(wks, 2)} weeks) · ~${total} total study hours · ${nd ? fmt(h / nd, 2) : 0} h per study day. <b>${total < 150 ? 'Many candidates report 200–300 hours of prep; consider adding hours if you can.' : total > 350 ? 'That’s a very thorough plan — watch for burnout and schedule rest.' : 'That’s in the commonly recommended 200–300 hour range.'}</b>` : '<span class="bad">Exam date must be after the start date.</span>';
    };
    $$('input', $('#pf', el)).forEach((i) => i.addEventListener('input', hint));
    $$('[data-rate]', el).forEach((r) => r.addEventListener('input', () => ($('#rv-' + r.dataset.rate, el).textContent = RATING[r.value])));
    hint();
    const tf = $('#toggleForm', el);
    if (tf) tf.addEventListener('click', () => { const f = $('#pf', el); f.classList.toggle('collapsed'); tf.textContent = f.classList.contains('collapsed') ? 'Edit settings' : 'Hide'; });

    $('#pf', el).addEventListener('submit', (e) => {
      e.preventDefault();
      const ns = {
        startDate: $('#ps', el).value, examDate: $('#pe', el).value, hoursPerWeek: +$('#ph', el).value,
        days: Planner.DOW.map((_, i) => $(`[data-dow="${i}"]`, el).checked),
        ratings: Object.fromEntries($$('[data-rate]', el).map((r) => [r.dataset.rate, +r.value])),
        useStats: $('#pu', el).checked
      };
      try {
        Store.s.plan = Planner.generate(ns);
        Store.save();
        U.toast('Study plan generated 🎉');
        location.hash = '#/planner';
        VIEWS.planner(el, [], {});
        updateCountdown();
      } catch (err) { U.toast(err.message); }
    });

    if (plan) renderPlan($('#planOut', el), plan);
  };

  function renderPlan(out, plan) {
    const prog = Planner.progress(plan);
    const t = U.isoDate(U.today());
    const maxH = Math.max(...plan.allocation.map((a) => a.hours));
    out.innerHTML = `
      <div class="card">
        <div class="card-head"><h2>Your timeline</h2>
          <div class="row gap"><button class="btn small" id="ics">📅 Export to calendar (.ics)</button><button class="btn small" onclick="window.print()">🖨 Print</button></div></div>
        ${phaseStrip(plan)}
        <div class="plan-stats">
          <div><b>${plan.nWeeks}</b> weeks</div><div><b>${Math.round(plan.nWeeks * plan.settings.hoursPerWeek)}</b> planned hours</div>
          <div><b>${prog.done}</b>/${prog.total} tasks done</div>
          <div class="${prog.behind > 0 ? 'bad' : 'ok'}"><b>${prog.behind > 0 ? prog.behind + ' behind' : 'On track'}</b></div>
        </div>
        <div class="progress-line"><div style="width:${prog.total ? (100 * prog.done) / prog.total : 0}%"></div></div>
        ${prog.behind > 3 ? `<div class="callout warn">You're ${prog.behind} tasks behind. Consider regenerating the plan from today (edit settings → start date = today) so the remaining work is re-spread realistically.</div>` : ''}
      </div>
      <div class="card"><h2>Learning-phase hour allocation</h2>
        <p class="muted small">Based on spec weight × confidence${plan.settings.useStats ? ' (blended with measured accuracy)' : ''}.</p>
        ${plan.allocation.map((a) => { const tp = SPEC.byId[a.topic]; return `<div class="bar-row"><span class="bar-label">${tp.name}</span><div class="bar"><div style="width:${(100 * a.hours) / maxH}%;background:${tp.color}"></div></div><span class="bar-val">${fmt(a.hours, 2)} h</span></div>`; }).join('')}
      </div>
      <div class="weeks">${plan.weeks.map((w) => {
        const cur = w.start <= t && t <= w.end, past = w.end < t;
        const dn = w.tasks.filter((k) => Store.s.planDone[k.id]).length;
        const hours = w.tasks.reduce((s, k) => s + k.minutes, 0) / 60;
        return `<details class="card week ${w.phase} ${cur ? 'current' : ''} ${past ? 'past' : ''}" ${cur ? 'open' : ''}>
          <summary><span class="wk-n">Week ${w.idx + 1}</span><span class="wk-dates">${U.niceDate(U.parseDate(w.start))} – ${U.niceDate(U.parseDate(w.end))}</span>
            <span class="phase-tag ${w.phase}">${w.phase === 'learn' ? 'Learn' : w.phase === 'practice' ? 'Practice exams' : 'Final review'}</span>
            <span class="wk-focus">${w.focus.map((f) => `<span class="dot" style="background:${SPEC.byId[f.topic].color}" title="${SPEC.byId[f.topic].name}"></span>${SPEC.byId[f.topic].short}`).join(' · ')}</span>
            <span class="spacer"></span><span class="muted small">${fmt(hours, 2)} h · ${dn}/${w.tasks.length}${cur ? ' · <b>this week</b>' : ''}</span></summary>
          <ul class="tasks">${w.tasks.map((k) => taskLi(k)).join('')}</ul></details>`;
      }).join('')}</div>`;
    bindTasks(out);
    $('#ics', out).addEventListener('click', () => U.download('pe-mdm-study-plan.ics', Planner.toICS(plan), 'text/calendar'));
  }
})(window);
