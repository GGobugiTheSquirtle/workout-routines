// js/data/progressions.js — Level criteria, XP, badges
// 2026-04-03 15:30

const Progressions = {
  // === Level-up criteria ===
  criteria: {
    intro_to_beginner: {
      from: 'intro', to: 'beginner',
      tests: [
        { exercise: 'pushup', metric: 'reps', value: 10, desc: '풀 푸시업 10개' },
        { exercise: 'dip_negative', metric: 'reps', value: 5, desc: '딥스 네거티브 5초×5회' },
        { exercise: 'dead_hang', metric: 'seconds', value: 30, desc: '데드행 30초' },
        { exercise: 'bodyweight_squat', metric: 'reps', value: 20, desc: '풀ROM 스쿼트 20개' },
      ],
    },
    beginner_to_intermediate: {
      from: 'beginner', to: 'intermediate',
      tests: [
        { exercise: 'pushup', metric: 'reps', value: 20, desc: '푸시업 20개' },
        { exercise: 'dip', metric: 'reps', value: 8, desc: '딥스 8개' },
        { exercise: 'pullup', metric: 'reps', value: 1, desc: '클린 턱걸이 1개' },
        { exercise: 'band_squat', metric: 'reps', value: 15, desc: '밴드 스쿼트 15개' },
        { exercise: 'kb_swing', metric: 'form_check', value: true, desc: '스윙 12kg×10×5 폼OK' },
      ],
    },
    intermediate_to_advanced: {
      from: 'intermediate', to: 'advanced',
      tests: [
        { exercise: 'deep_pushup', metric: 'reps', value: 15, desc: '딥 푸시업 15개' },
        { exercise: 'dip', metric: 'reps', value: 12, desc: '딥스 12개' },
        { exercise: 'pullup', metric: 'reps', value: 8, desc: '턱걸이 8개' },
        { exercise: 'pistol_squat', metric: 'reps', value: 1, desc: '피스톨 스쿼트 1개/측' },
        { exercise: 'kb_swing', metric: 'form_check', value: true, desc: '스윙 16kg×15×5' },
      ],
    },
  },

  // === XP System ===
  xp: {
    attendance: 50,
    set_complete: 10,
    routine_complete: 100,
    level_up: 500,
    return_bonus_mult: 2,
  },

  xpPerLevel: 300,

  getLevelFromXP(xp) {
    return Math.floor(xp / this.xpPerLevel) + 1;
  },

  getXPProgress(xp) {
    const current = xp % this.xpPerLevel;
    return { current, needed: this.xpPerLevel, percent: Math.round((current / this.xpPerLevel) * 100) };
  },

  getPhaseFromLevel(level) {
    if (level <= 10) return 'intro';
    if (level <= 20) return 'beginner';
    if (level <= 30) return 'intermediate';
    return 'advanced';
  },

  // === Badges ===
  badges: {
    first_workout:   { name: '복귀전사', icon: '🎖️', desc: '첫 운동 완료' },
    streak_3:        { name: '3일 연속', icon: '🔥', desc: '3일 연속 운동' },
    streak_7:        { name: '7일 연속', icon: '🔥', desc: '7일 연속 운동' },
    streak_30:       { name: '30일 연속', icon: '💎', desc: '30일 연속 운동' },
    streak_100:      { name: '100일 연속', icon: '👑', desc: '100일 연속 운동' },
    first_pullup:    { name: '첫 풀업', icon: '💪', desc: '턱걸이 1회 달성' },
    swing_master:    { name: '스윙마스터', icon: '🏋️', desc: '케틀벨 스윙 도입' },
    phase_beginner:  { name: '초급 진입', icon: '⬆️', desc: '입문→초급 승급' },
    phase_intermediate: { name: '중급 진입', icon: '⬆️', desc: '초급→중급 승급' },
    phase_advanced:  { name: '고급 진입', icon: '⬆️', desc: '중급→고급 승급' },
    workout_10:      { name: '10회 달성', icon: '🎯', desc: '총 10회 운동' },
    workout_50:      { name: '50회 달성', icon: '🎯', desc: '총 50회 운동' },
    workout_100:     { name: '100회 달성', icon: '🏆', desc: '총 100회 운동' },
  },

  // === 4-Week Block Periodization ===
  getBlockWeek(weeksSinceStart) {
    const weekInBlock = (weeksSinceStart % 4) + 1;
    const blockDescriptions = {
      1: { name: '적응', rpe: '6-7', volumeMod: 1.0 },
      2: { name: '과부하', rpe: '8-9', volumeMod: 1.1 },
      3: { name: '과부하', rpe: '8-9', volumeMod: 1.15 },
      4: { name: '디로드', rpe: '5-6', volumeMod: 0.5 },
    };
    return blockDescriptions[weekInBlock];
  },

  // === Streak logic ===
  streak: {
    shieldsPerMonth: 2,

    calculateStreak(lastWorkoutDate, currentStreak, shieldsRemaining) {
      const today = new Date().toISOString().slice(0, 10);
      if (!lastWorkoutDate) return { streak: 0, shieldsUsed: 0 };

      const last = new Date(lastWorkoutDate);
      const now = new Date(today);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        return { streak: currentStreak, shieldsUsed: 0 };
      } else if (diffDays === 2 && shieldsRemaining > 0) {
        return { streak: currentStreak, shieldsUsed: 1 };
      } else if (diffDays <= 3 && shieldsRemaining >= diffDays - 1) {
        return { streak: currentStreak, shieldsUsed: diffDays - 1 };
      } else {
        return { streak: 0, shieldsUsed: 0 };
      }
    },
  },
};
