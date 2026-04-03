// js/app.js — Alpine.js SPA core + page components
// 2026-04-03 16:00

document.addEventListener('alpine:init', () => {

  // ==================== APP SHELL ====================
  Alpine.data('app', () => ({
    page: 'home',

    init() {
      this.page = this.getPageFromHash();
      window.addEventListener('hashchange', () => {
        this.page = this.getPageFromHash();
      });
      if (!window.location.hash) {
        window.location.hash = '#/home';
      }
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
      }
      // Auto-sync on startup
      if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured() && navigator.onLine) {
        SheetsAPI.sync().catch(console.warn);
      }
      window.addEventListener('online', () => {
        if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
          SheetsAPI.sync().catch(console.warn);
        }
      });
    },

    getPageFromHash() {
      const hash = window.location.hash.replace('#/', '') || 'home';
      const valid = ['home', 'workout', 'history', 'progress', 'settings'];
      return valid.includes(hash) ? hash : 'home';
    },

    navigate(page) { window.location.hash = `#/${page}`; },

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    },
  }));

  // ==================== HOME PAGE ====================
  Alpine.data('homePage', () => ({
    state: Storage.getState(),

    get level() { return Progressions.getLevelFromXP(this.state.xp); },
    get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
    get xpProgress() { return Progressions.getXPProgress(this.state.xp); },
    get recentBadges() { return (this.state.badges || []).slice(-5); },

    get schedule() {
      return this.state.schedule || { 1: 'A', 3: 'B' };
    },
    get todaySplit() {
      const dow = new Date().getDay();
      return this.schedule[dow] || null;
    },
    get isRestDay() { return this.todaySplit === null; },
    get todayRoutine() {
      if (this.isRestDay) return null;
      return Routines.getTodayRoutine(this.state.current_phase, this.todaySplit);
    },
    get todayRoutineName() {
      if (this.isRestDay) return '휴식일';
      return this.todayRoutine?.name || '';
    },
    get todayExerciseSummary() {
      if (this.isRestDay) return '오늘은 휴식일입니다.';
      if (!this.todayRoutine) return '';
      return this.todayRoutine.exercises.map(e => {
        const ex = Exercises[e.id];
        return `${ex?.name || e.id} ${e.sets}×${e.reps}`;
      }).join(' · ');
    },

    get greeting() {
      const hour = new Date().getHours();
      if (hour < 12) return '좋은 아침이에요';
      if (hour < 18) return '오늘도 왔네요';
      return '저녁 운동 시작!';
    },

    get motivationMsg() {
      const s = this.state;
      if (typeof Motivation !== 'undefined') {
        if (s.last_workout_date) {
          const daysSince = Math.floor((Date.now() - new Date(s.last_workout_date).getTime()) / (1000 * 60 * 60 * 24));
          const lastLog = Storage.getLogs().slice(-1)[0];
          const returnMsg = Motivation.getReturnMessage(daysSince, lastLog);
          if (returnMsg) return returnMsg;
        }
        const streakMsg = Motivation.streakMessage(s.streak);
        if (streakMsg) return streakMsg;
        if (s.total_workouts === 0) return '첫 운동을 시작해볼까요? 시작이 반입니다.';
        return Motivation.getStartMessage();
      }
      if (s.total_workouts === 0) return '첫 운동을 시작해볼까요? 시작이 반입니다.';
      return null;
    },

    get weekDays() {
      const labels = ['월', '화', '수', '목', '금', '토', '일'];
      const weekDates = Storage.getThisWeekDates();
      const logs = Storage.getLogs();
      const logDates = new Set(logs.map(l => l.date));
      const today = Storage.getTodayStr();
      return weekDates.map((date, i) => ({
        label: labels[i],
        date,
        status: logDates.has(date) ? 'done' : date > today ? 'future' : 'rest',
      }));
    },
  }));

  // ==================== WORKOUT PAGE ====================
  Alpine.data('workoutPage', () => ({
    phase: 'idle',
    warmupIdx: 0,
    cooldownIdx: 0,
    currentExIdx: 0,
    currentSetIdx: 0,
    repCount: 0,
    rpeValue: null,
    timerDisplay: '0:00',
    restRemaining: 0,
    setResults: [],
    sessionLogs: [],
    sessionStart: null,
    xpEarned: 0,
    newBadges: [],
    totalSets: 0,
    sessionDuration: '0:00',
    levelUpInfo: null,

    get state() { return Storage.getState(); },
    get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
    get splitLabel() {
      const schedule = this.state.schedule || { 1: 'A', 3: 'B' };
      const dow = new Date().getDay();
      return schedule[dow] || 'A';
    },
    get routine() { return Routines.getTodayRoutine(this.state.current_phase, this.splitLabel); },
    get splitName() { return this.routine?.name || ''; },
    get exercises() { return this.routine?.exercises || []; },
    get currentExercise() { return this.exercises[this.currentExIdx] || {}; },
    get currentExInfo() { return Exercises[this.currentExercise.id] || {}; },
    get warmupStep() { return Routines.warmup.steps[this.warmupIdx]; },
    get blockInfo() { return Gamification.getBlockInfo(this.state); },
    get preWorkoutAlerts() { return Safety.getPreWorkoutAlerts(this.splitLabel, this.state); },

    getCooldownStep() {
      const cd = Routines.cooldown[this.splitLabel];
      return cd?.steps[this.cooldownIdx] || null;
    },

    get nextExerciseName() {
      if (this.currentSetIdx + 1 < this.currentExercise.sets) {
        return this.currentExInfo.name + ' 세트 ' + (this.currentSetIdx + 2);
      }
      const nextEx = this.exercises[this.currentExIdx + 1];
      return nextEx ? Exercises[nextEx.id]?.name : '쿨다운';
    },

    // --- Warmup ---
    startWarmup() {
      WakeLock.acquire();
      this.sessionStart = Date.now();
      this.phase = 'warmup';
      this.warmupIdx = 0;
      this._runWarmupTimer();
    },
    _runWarmupTimer() {
      const step = Routines.warmup.steps[this.warmupIdx];
      if (!step) { this._startExercise(); return; }
      Timer.start(step.duration,
        (r) => { this.timerDisplay = Timer.formatTime(r); },
        () => { this.nextWarmupStep(); }
      );
    },
    nextWarmupStep() {
      Timer.stop();
      this.warmupIdx++;
      if (this.warmupIdx >= Routines.warmup.steps.length) {
        this._startExercise();
      } else {
        this._runWarmupTimer();
      }
    },

    // --- Exercise ---
    _startExercise() {
      this.phase = 'exercise';
      this.currentExIdx = 0;
      this.currentSetIdx = 0;
      this._initSets();
    },
    _initSets() {
      const ex = this.currentExercise;
      this.setResults = Array.from({ length: ex.sets }, () => ({ reps: 0, completed: false }));
      this.repCount = this._parseTargetReps(ex.reps);
      this.currentSetIdx = 0;
    },
    _parseTargetReps(reps) {
      if (typeof reps === 'number') return reps;
      const str = String(reps);
      const rangeMatch = str.match(/(\d+)-(\d+)/);
      if (rangeMatch) return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
      const numMatch = str.match(/(\d+)/);
      return numMatch ? parseInt(numMatch[1]) : 10;
    },

    completeSet() {
      Haptic.medium();
      this.setResults[this.currentSetIdx] = {
        reps: this.repCount,
        completed: true,
        timestamp: new Date().toISOString(),
      };
      this.sessionLogs.push({
        date: Storage.getTodayStr(),
        routine: this.splitLabel === 'A' ? 'push_pull' : 'lower_posterior',
        exercise: this.currentExercise.id,
        set_num: this.currentSetIdx + 1,
        reps: this.repCount,
        level: this.state.current_phase,
      });
      this.totalSets++;
      this.currentSetIdx++;

      // Pain check (safety mechanism #1)
      if (Safety.shouldShowPainCheck(this.currentExercise.id, this.state)) {
        this.phase = 'pain_check';
        return;
      }
      this._afterPainCheck();
    },

    _afterPainCheck() {
      if (this.currentSetIdx >= this.currentExercise.sets) {
        this.phase = 'rpe';
        this.rpeValue = null;
      } else {
        this._startRest();
      }
    },

    submitPainCheck(hasPain) {
      if (hasPain) {
        Storage.savePainReport({
          date: Storage.getTodayStr(),
          exercise: this.currentExercise.id,
          body_part: 'general',
          severity: 'reported',
          action_taken: 'stopped_exercise',
        });
        this.currentSetIdx = this.currentExercise.sets;
        this.phase = 'rpe';
        this.rpeValue = null;
      } else {
        this._afterPainCheck();
      }
    },

    // --- Rest ---
    _startRest() {
      this.phase = 'rest';
      this.restRemaining = this.currentExercise.rest || 60;
      Timer.start(this.restRemaining,
        (r) => { this.timerDisplay = Timer.formatTime(r); this.restRemaining = r; },
        () => { this.phase = 'exercise'; }
      );
    },
    addRestTime(seconds) {
      Timer.stop();
      this.restRemaining += seconds;
      Timer.start(this.restRemaining,
        (r) => { this.timerDisplay = Timer.formatTime(r); this.restRemaining = r; },
        () => { this.phase = 'exercise'; }
      );
    },
    skipRest() {
      Timer.stop();
      this.phase = 'exercise';
    },

    // --- RPE ---
    submitRPE() {
      this.sessionLogs
        .filter(l => l.exercise === this.currentExercise.id && !l.rpe)
        .forEach(l => { l.rpe = this.rpeValue; });

      this.currentExIdx++;
      if (this.currentExIdx >= this.exercises.length) {
        this._startCooldown();
      } else {
        this._initSets();
        this.phase = 'exercise';
      }
    },

    // --- Cooldown ---
    _startCooldown() {
      const cd = Routines.cooldown[this.splitLabel];
      if (!cd) { this._finishSession(); return; }
      this.cooldownIdx = 0;
      this.phase = 'cooldown';
      this._runCooldownTimer();
    },
    _runCooldownTimer() {
      const cd = Routines.cooldown[this.splitLabel];
      const step = cd.steps[this.cooldownIdx];
      if (!step) { this._finishSession(); return; }
      Timer.start(step.duration,
        (r) => { this.timerDisplay = Timer.formatTime(r); },
        () => { this.nextCooldownStep(); }
      );
    },
    nextCooldownStep() {
      Timer.stop();
      this.cooldownIdx++;
      const cd = Routines.cooldown[this.splitLabel];
      if (this.cooldownIdx >= cd.steps.length) {
        this._finishSession();
      } else {
        this._runCooldownTimer();
      }
    },

    // --- Finish ---
    _finishSession() {
      Timer.stop();
      WakeLock.release();

      const durationSec = Math.round((Date.now() - this.sessionStart) / 1000);
      this.sessionDuration = Timer.formatTime(durationSec);

      this.sessionLogs.forEach(log => {
        log.duration_sec = durationSec;
        Storage.saveLog(log);
      });

      const state = Storage.getState();
      let xp = Progressions.xp.attendance
        + (this.totalSets * Progressions.xp.set_complete)
        + Progressions.xp.routine_complete;

      // Return bonus
      if (state.last_workout_date) {
        const daysSince = Math.floor((Date.now() - new Date(state.last_workout_date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 3) xp *= Progressions.xp.return_bonus_mult;
      }
      this.xpEarned = xp;

      // Streak
      const streakResult = Progressions.streak.calculateStreak(
        state.last_workout_date, state.streak, state.shields_remaining
      );

      // Badges
      this.newBadges = [];
      const checkBadge = (id) => {
        if (!state.badges.includes(id)) { state.badges.push(id); this.newBadges.push(id); }
      };
      if (state.total_workouts === 0) checkBadge('first_workout');
      const newStreak = streakResult.streak + 1;
      if (newStreak >= 3) checkBadge('streak_3');
      if (newStreak >= 7) checkBadge('streak_7');
      if (newStreak >= 30) checkBadge('streak_30');
      if (newStreak >= 100) checkBadge('streak_100');
      if (state.total_workouts + 1 >= 10) checkBadge('workout_10');
      if (state.total_workouts + 1 >= 50) checkBadge('workout_50');
      if (state.total_workouts + 1 >= 100) checkBadge('workout_100');

      Storage.updateState({
        xp: state.xp + xp,
        level: Progressions.getLevelFromXP(state.xp + xp),
        streak: newStreak,
        best_streak: Math.max(state.best_streak || 0, newStreak),
        shields_remaining: state.shields_remaining - streakResult.shieldsUsed,
        total_workouts: state.total_workouts + 1,
        last_workout_date: Storage.getTodayStr(),
        badges: state.badges,
      });

      // Level-up check
      const levelUpResult = Gamification.checkLevelUp(Storage.getState());
      if (levelUpResult?.eligible) {
        this.levelUpInfo = levelUpResult;
      }

      this.phase = 'done';
    },

    acceptLevelUp() {
      if (this.levelUpInfo) {
        Gamification.applyPhaseUp(Storage.getState(), this.levelUpInfo.nextPhase);
        this.newBadges.push('phase_' + this.levelUpInfo.nextPhase);
        this.levelUpInfo = null;
      }
    },
  }));

  // ==================== HISTORY PAGE ====================
  Alpine.data('historyPage', () => ({
    currentMonth: new Date(),
    selectedDate: null,

    get monthLabel() {
      return this.currentMonth.getFullYear() + '년 ' + (this.currentMonth.getMonth() + 1) + '월';
    },

    get calendarDays() {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const logs = Storage.getLogs();
      const logDates = new Set(logs.map(l => l.date));
      const today = Storage.getTodayStr();

      let startOffset = (firstDay.getDay() + 6) % 7;
      const days = [];

      for (let i = 0; i < startOffset; i++) {
        days.push({ date: 'empty-' + i, num: '', hasWorkout: false, isToday: false });
      }
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
          date: dateStr,
          num: d,
          hasWorkout: logDates.has(dateStr),
          isToday: dateStr === today,
        });
      }
      return days;
    },

    get selectedLogs() {
      if (!this.selectedDate) return [];
      return Storage.getLogs().filter(l => l.date === this.selectedDate);
    },

    selectDate(date) { this.selectedDate = date; },
    prevMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1); },
    nextMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1); },
    getExName(id) { return Exercises[id]?.name || id; },
  }));

  // ==================== PROGRESS PAGE ====================
  Alpine.data('progressPage', () => ({
    state: Storage.getState(),
    selectedExercise: 'pushup',

    get level() { return Progressions.getLevelFromXP(this.state.xp); },
    get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
    get xpProgress() { return Progressions.getXPProgress(this.state.xp); },

    get trackedExercises() {
      const logs = Storage.getLogs();
      return [...new Set(logs.map(l => l.exercise))];
    },

    hasBadge(id) { return (this.state.badges || []).includes(id); },
    getExName(id) { return Exercises[id]?.name || id; },

    async loadCharts() {
      await Charts.load();
      this.renderChart();
    },

    renderChart() {
      const container = this.$refs.chartContainer;
      if (!container) return;
      Charts.renderExerciseChart(container, this.selectedExercise, Storage.getLogs());
    },
  }));

  // ==================== SETTINGS PAGE ====================
  Alpine.data('settingsPage', () => ({
    state: Storage.getState(),
    sheetsUrl: localStorage.getItem('sheets_url') || '',
    apiKey: localStorage.getItem('sheets_api_key') || '',
    syncStatus: '',

    get currentTheme() { return document.documentElement.getAttribute('data-theme'); },
    get level() { return Progressions.getLevelFromXP(this.state.xp); },
    get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
    get schedule() { return this.state.schedule || { 1: 'A', 3: 'B' }; },

    // Convert template loop index (0=Mon) to JS getDay() (0=Sun,1=Mon)
    getScheduleForDow(templateIdx) {
      const dow = templateIdx === 6 ? 0 : templateIdx + 1; // 6(일)→0, 0(월)→1, ...
      return this.schedule[dow] || '';
    },
    updateSchedule(templateIdx, value) {
      const dow = templateIdx === 6 ? 0 : templateIdx + 1;
      const schedule = { ...this.schedule };
      if (value) { schedule[dow] = value; } else { delete schedule[dow]; }
      this.state = Storage.updateState({ schedule });
    },

    saveSheetsConfig() {
      localStorage.setItem('sheets_url', this.sheetsUrl);
      localStorage.setItem('sheets_api_key', this.apiKey);
      this.syncStatus = '✓ 설정 저장됨';
    },

    async syncNow() {
      this.syncStatus = '⟳ 동기화 중...';
      try {
        if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isConfigured()) {
          await SheetsAPI.sync();
          this.syncStatus = '✓ 동기화 완료';
        } else {
          this.syncStatus = '⚠ Sheets API 미설정';
        }
      } catch (e) {
        this.syncStatus = '✗ 실패: ' + e.message;
      }
    },

    exportData() {
      const data = {
        workout_logs: Storage.getLogs(),
        user_state: Storage.getState(),
        pain_reports: Storage.getPainReports(),
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-backup-${Storage.getTodayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.workout_logs) localStorage.setItem('workout_logs', JSON.stringify(data.workout_logs));
          if (data.user_state) localStorage.setItem('user_state', JSON.stringify(data.user_state));
          if (data.pain_reports) localStorage.setItem('pain_reports', JSON.stringify(data.pain_reports));
          this.state = Storage.getState();
          alert('데이터 가져오기 완료!');
        } catch (err) {
          alert('파일 형식 오류: ' + err.message);
        }
      };
      reader.readAsText(file);
    },

    resetConfirm() {
      if (confirm('정말 모든 데이터를 삭제하시겠습니까?')) {
        localStorage.clear();
        window.location.reload();
      }
    },
  }));

});
