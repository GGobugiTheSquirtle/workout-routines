// js/data/motivation.js — Context-aware motivation messages
// 2026-04-03 16:30

const Motivation = {
  start: [
    '오늘도 왔네요. 이미 절반은 한 겁니다.',
    '시작이 반이에요. 나머지 반은 끝내는 거죠.',
    '어제보다 한 발 더. 오늘의 목표입니다.',
    '당신의 몸은 기억하고 있어요. 다시 깨워봅시다.',
  ],

  setComplete(exerciseName, reps, previousBest) {
    if (previousBest && reps > previousBest) {
      return `${exerciseName} ${reps}회 — 기록 갱신! (이전 최고: ${previousBest})`;
    }
    return `${exerciseName} ${reps}회 완료.`;
  },

  sessionComplete(totalSets, weekCount) {
    return `총 ${totalSets}세트 완료. 이번 주 ${weekCount}회째입니다.`;
  },

  returnMessages: {
    2: '쉬는 것도 훈련입니다. 5분 스트레칭만 어때요?',
    3: null, // dynamic
    7: '일주일 만이네요. 돌아온 것 자체가 대단합니다.',
    14: '2주 만이에요. 몸이 기다리고 있었을 거예요.',
  },

  getReturnMessage(daysSince, lastLog) {
    if (daysSince >= 14) return this.returnMessages[14];
    if (daysSince >= 7) return this.returnMessages[7];
    if (daysSince >= 3 && lastLog) {
      const exName = Exercises[lastLog.exercise]?.name || lastLog.exercise;
      return `마지막에 ${exName} ${lastLog.reps}회를 해냈죠. 거기서 이어갈까요?`;
    }
    if (daysSince >= 2) return this.returnMessages[2];
    return null;
  },

  getStartMessage() {
    return this.start[Math.floor(Math.random() * this.start.length)];
  },

  streakMessage(streak) {
    if (streak === 3) return '3일 연속! 습관이 싹트고 있어요.';
    if (streak === 7) return '7일 연속! 한 주를 완벽하게 보냈습니다.';
    if (streak === 14) return '2주 연속! 몸이 달라지기 시작합니다.';
    if (streak === 30) return '30일! 이제 운동 없는 하루가 어색해질 거예요.';
    if (streak === 100) return '100일 달성! 전설적인 꾸준함입니다.';
    if (streak > 0 && streak % 10 === 0) return `${streak}일 연속! 꾸준함이 곧 실력입니다.`;
    return null;
  },
};
