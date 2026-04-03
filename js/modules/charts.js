// js/modules/charts.js — uPlot chart rendering (lazy loaded)
// 2026-04-03 16:30

const Charts = {
  _loaded: false,

  async load() {
    if (this._loaded) return;
    await Promise.all([
      this._loadCSS('https://cdn.jsdelivr.net/npm/uplot@1/dist/uPlot.min.css'),
      this._loadScript('https://cdn.jsdelivr.net/npm/uplot@1/dist/uPlot.iife.min.js'),
    ]);
    this._loaded = true;
  },

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  },

  _loadCSS(href) {
    return new Promise((resolve) => {
      if (document.querySelector(`link[href="${href}"]`)) { resolve(); return; }
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href; l.onload = resolve;
      document.head.appendChild(l);
    });
  },

  renderExerciseChart(container, exerciseId, logs) {
    if (!window.uPlot) return;

    const filtered = logs
      .filter(l => l.exercise === exerciseId)
      .reduce((acc, l) => {
        if (!acc[l.date] || l.reps > acc[l.date]) acc[l.date] = l.reps;
        return acc;
      }, {});

    const dates = Object.keys(filtered).sort();
    if (dates.length < 2) {
      container.innerHTML = '<p style="text-align:center; color:var(--pico-muted-color); padding:2rem;">데이터가 부족합니다. (최소 2일 기록 필요)</p>';
      return;
    }

    const timestamps = dates.map(d => new Date(d).getTime() / 1000);
    const reps = dates.map(d => filtered[d]);

    const opts = {
      width: container.clientWidth,
      height: 200,
      scales: { x: { time: true } },
      axes: [
        { space: 50 },
        { label: '최대 횟수', size: 50 },
      ],
      series: [
        {},
        { label: Exercises[exerciseId]?.name || exerciseId, stroke: '#3498db', width: 2, fill: 'rgba(52,152,219,0.1)' },
      ],
    };

    container.innerHTML = '';
    new uPlot(opts, [timestamps, reps], container);
  },
};
