// js/data/exercises.js — Exercise definitions + form guides
// 2026-04-03 15:30

const Exercises = {
  // === Push ===
  incline_pushup: {
    id: 'incline_pushup', name: '인클라인 푸시업', category: 'push',
    equipment: '푸시업바 (높은단)',
    guide: [
      '손 위치: 어깨 바로 아래, 손가락 전방',
      '팔꿈치 45도 이내 (화살표 형태)',
      '코어 브레이싱 — 골반 처짐/들림 없이',
      '흉곽까지 Full ROM',
    ],
  },
  pushup: {
    id: 'pushup', name: '푸시업', category: 'push',
    equipment: '맨몸 또는 푸시업바',
    guide: [
      '손 위치: 어깨 바로 아래',
      '팔꿈치 45도 (T자 금지)',
      '코어 브레이싱 유지',
      '흉곽 바닥 터치 Full ROM',
    ],
  },
  deep_pushup: {
    id: 'deep_pushup', name: '딥 푸시업', category: 'push',
    equipment: '푸시업바',
    guide: [
      '푸시업바로 ROM 증가',
      '어깨보다 아래로 내려가기',
      '코어 유지, 팔꿈치 45도',
      'Stretched position에서 1초 정지',
    ],
  },
  archer_pushup: {
    id: 'archer_pushup', name: '아처 푸시업', category: 'push',
    equipment: '맨몸',
    guide: [
      '넓은 간격, 한쪽 팔에 체중 집중',
      '보조 팔은 편 상태 유지',
      '코어 회전 최소화',
      '좌우 교대 수행',
    ],
  },

  // === Dips ===
  dip_negative: {
    id: 'dip_negative', name: '딥스 네거티브', category: 'push',
    equipment: '치닝디핑',
    guide: [
      '어깨 내림(depression) 유지',
      '5초 천천히 하강',
      '팔꿈치 90도까지만',
      '상단으로 점프해서 복귀',
    ],
  },
  dip: {
    id: 'dip', name: '딥스', category: 'push',
    equipment: '치닝디핑',
    guide: [
      '어깨 내림 유지, 으쓱 금지',
      '팔꿈치 90도까지만 (과도한 ROM → 어깨 충돌)',
      '약간 전경(forward lean)',
      'Soft lockout (완전 잠금 금지)',
    ],
  },
  weighted_dip: {
    id: 'weighted_dip', name: '웨이티드 딥스', category: 'push',
    equipment: '치닝디핑 + 케틀벨',
    guide: [
      '케틀벨을 발 사이에 끼우거나 벨트 사용',
      '기본 딥스 폼 동일 유지',
      '너무 무거우면 폼 붕괴 — RPE 8 이내',
      '팔꿈치 90도 제한 엄수',
    ],
  },

  // === Pull ===
  dead_hang: {
    id: 'dead_hang', name: '데드행', category: 'pull',
    equipment: '치닝디핑',
    guide: [
      '능동적 어깨 팩킹 (scapular depression + retraction)',
      '어깨너비 그립, 엄지 감싸쥐기',
      '팔 완전히 편 상태에서 시작',
      '흔들림 최소화',
    ],
  },
  band_pullup: {
    id: 'band_pullup', name: '밴드 어시스트 턱걸이', category: 'pull',
    equipment: '치닝디핑 + 밴드',
    guide: [
      '밴드에 한발 또는 양무릎 올리기',
      '반동(kipping) 절대 금지',
      '턱이 바 위로 올라올 때까지',
      '3-5초 제어된 하강',
    ],
  },
  pullup: {
    id: 'pullup', name: '턱걸이', category: 'pull',
    equipment: '치닝디핑',
    guide: [
      '능동적 어깨 팩킹으로 시작',
      '반동 금지 — 회전근개 부상 주원인',
      '턱이 바 위로',
      '제어된 하강 (3초)',
    ],
  },
  lsit_pullup: {
    id: 'lsit_pullup', name: 'L-sit 턱걸이', category: 'pull',
    equipment: '치닝디핑',
    guide: [
      '다리를 수평으로 들어 L자 유지',
      '코어 텐션 상시 유지',
      '턱걸이 폼 동일',
      '힘들면 무릎 굽혀서 시작',
    ],
  },

  // === Core ===
  plank: {
    id: 'plank', name: '플랭크', category: 'core',
    equipment: '요가매트',
    guide: [
      '어깨 바로 아래 팔꿈치',
      '머리~발끝 일직선',
      '둔근+코어 수축',
      '호흡 유지 (멈추지 않기)',
    ],
  },
  hanging_knee_raise: {
    id: 'hanging_knee_raise', name: '행잉 니레이즈', category: 'core',
    equipment: '치닝디핑',
    guide: [
      '데드행 자세에서 시작',
      '무릎을 가슴까지 당기기',
      '반동 최소화',
      '천천히 내리기 (2초)',
    ],
  },

  // === Lower Body ===
  bodyweight_squat: {
    id: 'bodyweight_squat', name: '맨몸 스쿼트', category: 'legs',
    equipment: '스쿼트밴드 (선택)',
    guide: [
      '발 어깨너비, 발끝 15-30도 외회전',
      '무릎은 발끝 방향 추적 (valgus 금지)',
      '힙힌지 먼저 시작',
      '허리 중립 유지',
    ],
  },
  lunge: {
    id: 'lunge', name: '런지', category: 'legs',
    equipment: '맨몸',
    guide: [
      '한 발 앞으로 크게 내딛기',
      '양 무릎 90도',
      '앞무릎이 발끝 넘지 않게',
      '상체 수직 유지',
    ],
  },
  band_squat: {
    id: 'band_squat', name: '밴드 스쿼트', category: 'legs',
    equipment: '스쿼트밴드',
    guide: [
      '밴드를 무릎 위에 착용',
      '외회전 텐션 의식하며 스쿼트',
      '풀 ROM (가능한 깊게)',
      '둔근 활성화 집중',
    ],
  },
  bulgarian_split_squat: {
    id: 'bulgarian_split_squat', name: '불가리안 스플릿 스쿼트', category: 'legs',
    equipment: '의자/벤치',
    guide: [
      '뒷발을 벤치에 올리기',
      '앞무릎 90도까지 하강',
      '상체 약간 전경 허용',
      '둔근+대퇴사두 집중',
    ],
  },
  pistol_squat: {
    id: 'pistol_squat', name: '피스톨 스쿼트', category: 'legs',
    equipment: '맨몸',
    guide: [
      '한발로 서서 다른 발 앞으로 뻗기',
      '천천히 앉기, 밸런스 유지',
      '무릎이 발끝 방향 추적',
      '처음엔 문틀 잡고 보조 가능',
    ],
  },
  goblet_squat: {
    id: 'goblet_squat', name: '케틀벨 고블릿 스쿼트', category: 'legs',
    equipment: '케틀벨 16kg',
    guide: [
      '케틀벨을 가슴 앞에서 두 손으로 잡기',
      '팔꿈치가 무릎 안쪽을 밀어내기',
      '풀 ROM 스쿼트',
      '상체 직립 유지',
    ],
  },

  // === Hinge/Posterior ===
  glute_bridge: {
    id: 'glute_bridge', name: '글루트브릿지', category: 'posterior',
    equipment: '요가매트',
    guide: [
      '등 대고 누워 무릎 굽히기',
      '발로 밀어 엉덩이 들기',
      '상단에서 둔근 스퀴즈 2초',
      '허리 과신전 금지',
    ],
  },
  single_leg_glute_bridge: {
    id: 'single_leg_glute_bridge', name: '싱글레그 글루트브릿지', category: 'posterior',
    equipment: '요가매트',
    guide: [
      '한 다리를 들고 브릿지',
      '골반 수평 유지 (기울어짐 금지)',
      '상단에서 둔근 스퀴즈',
      '좌우 교대 수행',
    ],
  },
  kb_deadlift: {
    id: 'kb_deadlift', name: '케틀벨 데드리프트', category: 'posterior',
    equipment: '케틀벨 12kg',
    guide: [
      '케틀벨을 발 사이에 놓기',
      '힙힌지로 잡기 (스쿼트 아님)',
      '등 중립, 코어 브레이싱',
      '둔근/햄으로 일어서기',
    ],
  },
  kb_swing: {
    id: 'kb_swing', name: '케틀벨 스윙', category: 'posterior',
    equipment: '케틀벨 12/16kg',
    guide: [
      '힙힌지가 핵심 — 스쿼트 패턴 아님',
      '팔이 아닌 둔근/햄 폭발력으로 추진',
      '코어 브레이싱 + 글루트 스퀴즈로 상단 잠금',
      '12kg부터 시작, 16kg는 최소 4주 후',
    ],
  },
  nordic_curl: {
    id: 'nordic_curl', name: '노르딕컬', category: 'posterior',
    equipment: '고정점 (치닝디핑 하단 등)',
    guide: [
      '무릎 꿇고 발목 고정',
      '몸 일직선 유지하며 천천히 하강',
      '손으로 바닥 짚어 보조 가능',
      '네거티브(하강)만 먼저 연습',
    ],
  },

  // === Shoulder ===
  kb_press: {
    id: 'kb_press', name: '케틀벨 프레스', category: 'push',
    equipment: '케틀벨 16kg',
    guide: [
      '케틀벨을 어깨 높이 랙 포지션',
      '코어 수축 후 머리 위로 프레스',
      '팔꿈치 완전 잠금 (오버헤드)',
      '천천히 내리기',
    ],
  },
  kb_tgu: {
    id: 'kb_tgu', name: '케틀벨 TGU', category: 'full_body',
    equipment: '케틀벨 16kg',
    guide: [
      '누워서 케틀벨을 한 손으로 들기',
      '시선은 항상 케틀벨',
      '단계별로 일어서기 (7단계)',
      '처음엔 맨손으로 동작 학습',
    ],
  },
};
