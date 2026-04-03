// js/data/motivation.js — Motivation messages
// 2026-04-03 15:30
// Placeholder — full implementation in Chunk 5
const Motivation = {
  start: ['오늘도 왔네요. 이미 절반은 한 겁니다.'],
  getStartMessage() { return this.start[Math.floor(Math.random() * this.start.length)]; },
  getReturnMessage() { return null; },
  streakMessage() { return null; },
  setComplete(name, reps) { return `${name} ${reps}회 완료.`; },
  sessionComplete(sets, week) { return `총 ${sets}세트 완료.`; },
};
