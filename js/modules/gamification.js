// js/modules/gamification.js — Level-up checks and phase transitions
// 2026-04-03 16:30

const Gamification = {
  checkLevelUp(state) {
    const phase = state.current_phase;
    let criteriaKey;
    if (phase === 'intro') criteriaKey = 'intro_to_beginner';
    else if (phase === 'beginner') criteriaKey = 'beginner_to_intermediate';
    else if (phase === 'intermediate') criteriaKey = 'intermediate_to_advanced';
    else return null;

    const criteria = Progressions.criteria[criteriaKey];
    if (!criteria) return null;

    const logs = Storage.getLogs();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksStr = twoWeeksAgo.toISOString().slice(0, 10);
    const recentLogs = logs.filter(l => l.date >= twoWeeksStr);

    const results = criteria.tests.map(test => {
      const exLogs = recentLogs.filter(l => l.exercise === test.exercise);
      let met = false;

      if (test.metric === 'reps') {
        const maxReps = Math.max(0, ...exLogs.map(l => l.reps));
        met = maxReps >= test.value;
      } else if (test.metric === 'seconds') {
        const maxSec = Math.max(0, ...exLogs.map(l => l.reps));
        met = maxSec >= test.value;
      } else if (test.metric === 'form_check') {
        met = exLogs.length >= 5;
      }

      return { ...test, met };
    });

    const allMet = results.every(r => r.met);
    return { eligible: allMet, nextPhase: criteria.to, criteria: results };
  },

  getBlockInfo(state) {
    if (!state.last_workout_date) return Progressions.getBlockWeek(0);
    const start = state.training_start_date || state.last_workout_date;
    const weeksSince = Math.floor(
      (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return Progressions.getBlockWeek(weeksSince);
  },

  applyPhaseUp(state, nextPhase) {
    const badgeMap = {
      beginner: 'phase_beginner',
      intermediate: 'phase_intermediate',
      advanced: 'phase_advanced',
    };
    const badge = badgeMap[nextPhase];
    const badges = [...(state.badges || [])];
    if (badge && !badges.includes(badge)) badges.push(badge);

    return Storage.updateState({
      current_phase: nextPhase,
      xp: state.xp + Progressions.xp.level_up,
      badges,
    });
  },
};
