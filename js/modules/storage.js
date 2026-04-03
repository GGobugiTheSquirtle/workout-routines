// js/modules/storage.js — LocalStorage CRUD + sync queue
// 2026-04-03 15:30

const Storage = {
  // === Workout Logs ===
  getLogs(fromDate = null) {
    const logs = JSON.parse(localStorage.getItem('workout_logs') || '[]');
    if (!fromDate) return logs;
    return logs.filter((l) => l.date >= fromDate);
  },

  saveLog(log) {
    const logs = this.getLogs();
    log.created_at = new Date().toISOString();
    logs.push(log);
    localStorage.setItem('workout_logs', JSON.stringify(logs));
    this.addToSyncQueue('log', log);
    return log;
  },

  // === User State ===
  getState() {
    return JSON.parse(localStorage.getItem('user_state') || JSON.stringify({
      current_phase: 'intro',
      level: 1,
      xp: 0,
      streak: 0,
      best_streak: 0,
      shields_remaining: 2,
      shields_reset_date: new Date().toISOString().slice(0, 7),
      exercise_levels: {},
      badges: [],
      total_workouts: 0,
      last_workout_date: null,
      schedule: { 1: 'A', 3: 'B' }, // dow → split, default Mon=A, Wed=B
      theme: 'dark',
    }));
  },

  saveState(state) {
    state.updated_at = new Date().toISOString();
    localStorage.setItem('user_state', JSON.stringify(state));
    this.addToSyncQueue('state', state);
  },

  updateState(updates) {
    const state = this.getState();
    Object.assign(state, updates);
    this.saveState(state);
    return state;
  },

  // === Pain Reports ===
  getPainReports() {
    return JSON.parse(localStorage.getItem('pain_reports') || '[]');
  },

  savePainReport(report) {
    const reports = this.getPainReports();
    report.created_at = new Date().toISOString();
    reports.push(report);
    localStorage.setItem('pain_reports', JSON.stringify(reports));
    this.addToSyncQueue('pain', report);
  },

  // === Sync Queue ===
  addToSyncQueue(type, data) {
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    queue.push({ type, data, timestamp: new Date().toISOString() });
    localStorage.setItem('sync_queue', JSON.stringify(queue));
  },

  getSyncQueue() {
    return JSON.parse(localStorage.getItem('sync_queue') || '[]');
  },

  clearSyncQueue() {
    localStorage.setItem('sync_queue', '[]');
  },

  // === Helpers ===
  getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  getThisWeekDates() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  },
};
