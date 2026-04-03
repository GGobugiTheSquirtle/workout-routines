// js/modules/safety.js — 6 safety mechanisms
// 2026-04-03 16:30

const Safety = {
  // 1. Pain check — should show after set?
  shouldShowPainCheck(exerciseId, state) {
    const phase = state.current_phase;
    const exerciseLevels = state.exercise_levels || {};
    const exWeeks = exerciseLevels[exerciseId]?.weeks || 0;
    if (phase === 'intro') return true;
    if (exWeeks < 2) return true;
    return false;
  },

  // 2. RPE overload warning
  checkRPEOverload(exerciseId) {
    const logs = Storage.getLogs();
    const recent = logs.filter(l => l.exercise === exerciseId && l.rpe).slice(-6);
    const highRPE = recent.filter(l => l.rpe >= 9);
    return highRPE.length >= 4;
  },

  // 3. Weekly volume spike
  checkVolumeSurge() {
    const logs = Storage.getLogs();
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const thisWeekStr = thisWeekStart.toISOString().slice(0, 10);
    const lastWeekStr = lastWeekStart.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const thisWeekSets = logs.filter(l => l.date >= thisWeekStr && l.date <= todayStr).length;
    const lastWeekSets = logs.filter(l => l.date >= lastWeekStr && l.date < thisWeekStr).length;

    if (lastWeekSets === 0) return false;
    return (thisWeekSets / lastWeekSets) > 1.2;
  },

  // 4. Rest day compliance
  checkRestDayCompliance(split) {
    const logs = Storage.getLogs();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const yesterdayLogs = logs.filter(l => l.date === yesterdayStr);
    if (yesterdayLogs.length === 0) return true;

    const yesterdayRoutine = yesterdayLogs[0]?.routine;
    const todayRoutine = split === 'A' ? 'push_pull' : 'lower_posterior';
    return yesterdayRoutine !== todayRoutine;
  },

  // 5. Return after gap
  checkReturnAfterGap(state) {
    if (!state.last_workout_date) return null;
    const daysSince = Math.floor(
      (Date.now() - new Date(state.last_workout_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= 3) {
      return {
        days: daysSince,
        message: `${daysSince}일 만에 돌아왔군요! 마지막 세션의 80%로 시작하세요.`,
        reducedVolume: 0.8,
      };
    }
    return null;
  },

  // 6. Form reminder — should show?
  shouldShowFormReminder(exerciseId, state) {
    const exerciseLevels = state.exercise_levels || {};
    const exWeeks = exerciseLevels[exerciseId]?.weeks || 0;
    return exWeeks < 4;
  },

  // Get all pre-workout alerts
  getPreWorkoutAlerts(split, state) {
    const alerts = [];

    if (this.checkVolumeSurge()) {
      alerts.push({
        type: 'warning',
        message: '주간 볼륨이 20% 이상 증가했습니다. 부상 위험이 올라갈 수 있습니다.',
      });
    }

    if (!this.checkRestDayCompliance(split)) {
      alerts.push({
        type: 'warning',
        message: '동일 부위가 48시간 미경과 — 회복 부족 가능. 다른 부위나 휴식을 권장합니다.',
      });
    }

    const gap = this.checkReturnAfterGap(state);
    if (gap) {
      alerts.push({ type: 'info', message: gap.message });
    }

    const routine = Routines.getTodayRoutine(state.current_phase, split);
    if (routine) {
      routine.exercises.forEach(ex => {
        if (this.checkRPEOverload(ex.id)) {
          alerts.push({
            type: 'danger',
            message: `${Exercises[ex.id]?.name}: RPE 과부하 감지 — 볼륨을 줄이거나 디로드를 고려하세요.`,
          });
        }
      });
    }

    return alerts;
  },
};
