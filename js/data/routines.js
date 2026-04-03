// js/data/routines.js — 4-phase 2-split routines
// 2026-04-03 15:30

const Routines = {
  phases: ['intro', 'beginner', 'intermediate', 'advanced'],

  phaseNames: {
    intro: '입문', beginner: '초급',
    intermediate: '중급', advanced: '고급',
  },

  phaseColors: {
    intro: '#2ecc71', beginner: '#3498db',
    intermediate: '#e67e22', advanced: '#e74c3c',
  },

  // === Warmup protocol (all phases) ===
  warmup: {
    name: '워밍업',
    duration: 300,
    steps: [
      { name: '관절 원돌리기', duration: 60, desc: '손목→팔꿈치→어깨→고관절→무릎→발목, 각 10회' },
      { name: '견갑골 활성화', duration: 60, desc: '월 슬라이드 + 밴드 풀어파트' },
      { name: '힙힌지 드릴', duration: 60, desc: '맨몸 굿모닝 10회' },
      { name: '동적 스트레칭', duration: 60, desc: '월드 그레이티스트 스트레칭 좌우 3회' },
      { name: '첫 종목 경량 세트', duration: 60, desc: '50% 강도로 8회' },
    ],
  },

  // === Cooldown protocol (split-specific) ===
  cooldown: {
    A: { name: '쿨다운 (상체)', duration: 120, steps: [
      { name: '호흡 정리', duration: 30, desc: '심호흡 5회' },
      { name: '대흉근 스트레칭', duration: 45, desc: '문틀 스트레칭 좌우' },
      { name: '어깨 스트레칭', duration: 45, desc: '크로스바디 스트레칭 좌우' },
    ]},
    B: { name: '쿨다운 (하체)', duration: 120, steps: [
      { name: '호흡 정리', duration: 30, desc: '심호흡 5회' },
      { name: '고관절굴곡근 스트레칭', duration: 45, desc: '하프닐링 스트레칭 좌우' },
      { name: '햄스트링 스트레칭', duration: 45, desc: '스탠딩 햄 스트레칭 좌우' },
    ]},
  },

  // === Rest time recommendations (seconds) ===
  restTimes: {
    intro: 60, beginner: 75,
    intermediate: 90, advanced: 90,
  },

  // === Routines per phase ===
  intro: {
    A: {
      name: 'Push + Core',
      exercises: [
        { id: 'incline_pushup', sets: 3, reps: '8-12', rest: 60 },
        { id: 'dip_negative', sets: 3, reps: '5', rest: 60, note: '5초 하강' },
        { id: 'dead_hang', sets: 3, reps: '15-30초', rest: 60, unit: 'sec' },
        { id: 'plank', sets: 3, reps: '20-30초', rest: 45, unit: 'sec' },
      ],
    },
    B: {
      name: '하체 + Hinge',
      exercises: [
        { id: 'bodyweight_squat', sets: 3, reps: '12-15', rest: 60, note: '밴드 착용' },
        { id: 'lunge', sets: 3, reps: '8/측', rest: 60 },
        { id: 'glute_bridge', sets: 3, reps: '12-15', rest: 45 },
        { id: 'kb_deadlift', sets: 3, reps: '10', rest: 60, note: '12kg' },
      ],
    },
  },

  beginner: {
    A: {
      name: 'Push + Pull',
      exercises: [
        { id: 'pushup', sets: 3, reps: '8-12', rest: 75 },
        { id: 'dip', sets: 3, reps: '5-8', rest: 75 },
        { id: 'band_pullup', sets: 3, reps: '3-5', rest: 90 },
        { id: 'hanging_knee_raise', sets: 3, reps: '8', rest: 60 },
      ],
    },
    B: {
      name: '하체 + Swing',
      exercises: [
        { id: 'band_squat', sets: 3, reps: '12-15', rest: 75, note: '풀 ROM' },
        { id: 'bulgarian_split_squat', sets: 3, reps: '8/측', rest: 75 },
        { id: 'kb_swing', sets: 5, reps: '10', rest: 60, note: '12kg' },
        { id: 'single_leg_glute_bridge', sets: 3, reps: '10/측', rest: 45 },
      ],
    },
  },

  intermediate: {
    A: {
      name: 'Push + Pull',
      exercises: [
        { id: 'deep_pushup', sets: 4, reps: '8-12', rest: 90 },
        { id: 'dip', sets: 4, reps: '8-12', rest: 90 },
        { id: 'pullup', sets: 4, reps: '5-8', rest: 90 },
        { id: 'kb_press', sets: 3, reps: '8/측', rest: 75, note: '16kg' },
      ],
    },
    B: {
      name: '하체 + Posterior',
      exercises: [
        { id: 'pistol_squat', sets: 4, reps: '5/측', rest: 90 },
        { id: 'band_squat', sets: 4, reps: '12', rest: 75, note: '딥' },
        { id: 'kb_swing', sets: 5, reps: '15', rest: 60, note: '16kg' },
        { id: 'nordic_curl', sets: 3, reps: '5', rest: 90, note: '네거티브' },
      ],
    },
  },

  advanced: {
    A: {
      name: 'Push + Pull',
      exercises: [
        { id: 'archer_pushup', sets: 4, reps: '6-8/측', rest: 90 },
        { id: 'weighted_dip', sets: 4, reps: '6-8', rest: 90, note: '케틀벨' },
        { id: 'lsit_pullup', sets: 4, reps: '6-8', rest: 90 },
        { id: 'kb_tgu', sets: 3, reps: '3/측', rest: 90, note: '16kg' },
      ],
    },
    B: {
      name: '하체 + Posterior',
      exercises: [
        { id: 'pistol_squat', sets: 4, reps: '5/측', rest: 90, note: '풀 ROM' },
        { id: 'goblet_squat', sets: 4, reps: '10', rest: 75, note: '16kg' },
        { id: 'kb_swing', sets: 6, reps: '20', rest: 60, note: '16kg EMOM' },
        { id: 'nordic_curl', sets: 4, reps: '5', rest: 90, note: '풀 ROM' },
      ],
    },
  },

  getTodayRoutine(phase, split) {
    return this[phase]?.[split] || null;
  },
};
