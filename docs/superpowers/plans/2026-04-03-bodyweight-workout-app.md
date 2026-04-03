# Bodyweight Workout App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first PWA bodyweight workout app with 4-phase curriculum, gamification, Google Sheets sync, and safety systems — hosted on GitHub Pages.

**Architecture:** Hash-based SPA using Alpine.js for reactive UI, Pico CSS for styling with dark/light toggle. Data flows LocalStorage (primary) ↔ Google Sheets (backup via Apps Script). Service Worker for offline support.

**Tech Stack:** Alpine.js 3.x, Pico CSS 2.x, uPlot (lazy), Google Apps Script, Service Worker, GitHub Pages

---

## Chunk 1: Project Foundation & Core Shell

### Task 1: Initialize Git Repository & Project Structure

**Files:**
- Create: `.gitignore`
- Create: `CLAUDE.md`

> **Note:** `agents/` 디렉토리의 5개 agent.md 파일은 이미 brainstorming 단계에서 생성됨. 이 Task에서는 git에 추가만 한다.

- [ ] **Step 1: Initialize git repo**

```bash
cd f:/Apps_home/workout_routines
git init
```

- [ ] **Step 2: Create .gitignore**

```gitignore
# OS
.DS_Store
Thumbs.db
Desktop.ini

# IDE
.vscode/
.idea/

# Superpowers brainstorm artifacts
.superpowers/brainstorm/

# Internal state
.bkit/

# Environment
.env
```

- [ ] **Step 3: Create CLAUDE.md**

프로젝트 전용 CLAUDE.md — 기술 스택, 컨벤션, 에이전트 팀 참조 정보를 기록.

```markdown
# Bodyweight Workout App

## Tech Stack
- Alpine.js 3.x (CDN, no build)
- Pico CSS 2.x (CDN, semantic HTML)
- uPlot (lazy-loaded for charts)
- Google Apps Script → Google Sheets
- GitHub Pages hosting
- Service Worker for offline PWA

## Conventions
- 한국어 UI, 영어 코드
- Hash-based SPA routing (#/home, #/workout, etc.)
- LocalStorage = primary storage, Sheets = backup
- Mobile-first, touch targets min 48px, key actions 64px+
- Timestamps on code changes: # 2026-MM-DD HH:MM

## Agent Team
See agents/ directory for 5 expert agent definitions:
- exercise-programmer.md — routine design, progression
- exercise-scientist.md — scientific basis
- form-safety.md — form guides, injury prevention
- behavioral-coach.md — motivation, gamification
- app-developer.md — technical implementation

## Spec
docs/superpowers/specs/2026-04-03-bodyweight-workout-app-design.md
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore CLAUDE.md agents/ docs/superpowers/specs/
git commit -m "chore: initialize project with gitignore, CLAUDE.md, agents, and spec"
```

---

### Task 2: Create SPA Shell (index.html + Alpine.js + Pico CSS)

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

- [ ] **Step 1: Create index.html — SPA entry point with CDN imports**

```html
<!DOCTYPE html>
<html lang="ko" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1a1a2e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>맨몸운동 트레이너</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" href="assets/icons/icon-192.png">
</head>
<body x-data="app" x-init="init()">

  <!-- Main Content Area -->
  <main class="container app-main">
    <!-- Home -->
    <div x-show="page === 'home'" x-cloak>
      <div id="page-home"></div>
    </div>
    <!-- Workout -->
    <div x-show="page === 'workout'" x-cloak>
      <div id="page-workout"></div>
    </div>
    <!-- History -->
    <div x-show="page === 'history'" x-cloak>
      <div id="page-history"></div>
    </div>
    <!-- Progress -->
    <div x-show="page === 'progress'" x-cloak>
      <div id="page-progress"></div>
    </div>
    <!-- Settings -->
    <div x-show="page === 'settings'" x-cloak>
      <div id="page-settings"></div>
    </div>
  </main>

  <!-- Bottom Tab Navigation -->
  <nav class="bottom-nav" role="tablist">
    <a role="tab" :class="{ active: page === 'home' }" @click.prevent="navigate('home')" href="#/home">
      <span class="tab-icon">🏠</span><span class="tab-label">Home</span>
    </a>
    <a role="tab" :class="{ active: page === 'workout' }" @click.prevent="navigate('workout')" href="#/workout">
      <span class="tab-icon">💪</span><span class="tab-label">Workout</span>
    </a>
    <a role="tab" :class="{ active: page === 'history' }" @click.prevent="navigate('history')" href="#/history">
      <span class="tab-icon">📋</span><span class="tab-label">History</span>
    </a>
    <a role="tab" :class="{ active: page === 'progress' }" @click.prevent="navigate('progress')" href="#/progress">
      <span class="tab-icon">📈</span><span class="tab-label">Progress</span>
    </a>
    <a role="tab" :class="{ active: page === 'settings' }" @click.prevent="navigate('settings')" href="#/settings">
      <span class="tab-icon">⚙️</span><span class="tab-label">Settings</span>
    </a>
  </nav>

  <!-- App code MUST load before Alpine.js (Alpine auto-inits on load) -->
  <script src="js/app.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create css/style.css — Mobile-first custom styles**

```css
/* === Layout === */
[x-cloak] { display: none !important; }

:root {
  --bottom-nav-height: 60px;
  --touch-min: 48px;
  --touch-lg: 64px;
}

.app-main {
  padding-bottom: calc(var(--bottom-nav-height) + 16px);
  min-height: 100vh;
}

/* === Bottom Navigation === */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--pico-background-color);
  border-top: 1px solid var(--pico-muted-border-color);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--pico-muted-color);
  font-size: 0.7rem;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav a.active {
  color: var(--pico-primary);
}

.tab-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.tab-label {
  font-size: 0.65rem;
  font-weight: 500;
}

/* === Touch Targets === */
.btn-lg {
  min-height: var(--touch-lg);
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
}

.btn-round {
  width: var(--touch-min);
  height: var(--touch-min);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* === Typography for workout mode === */
.text-workout-lg {
  font-size: 3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.text-workout-md {
  font-size: 1.5rem;
  font-weight: 600;
}

.text-workout-sm {
  font-size: 0.85rem;
  color: var(--pico-muted-color);
}

/* === Cards === */
.card {
  border: 1px solid var(--pico-muted-border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.card-highlight {
  border-color: var(--pico-primary);
  border-width: 2px;
}

/* === Progress bar === */
.progress-bar {
  background: var(--pico-muted-border-color);
  border-radius: 20px;
  height: 8px;
  overflow: hidden;
}

.progress-bar-fill {
  background: var(--pico-primary);
  height: 100%;
  border-radius: 20px;
  transition: width 0.3s ease;
}

/* === Set indicators === */
.set-indicator {
  width: var(--touch-lg);
  height: var(--touch-lg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.set-done {
  background: var(--pico-ins-color);
  color: #fff;
}

.set-current {
  background: var(--pico-primary);
  color: #fff;
  box-shadow: 0 0 0 3px rgba(var(--pico-primary-rgb, 52, 152, 219), 0.3);
}

.set-pending {
  background: var(--pico-muted-border-color);
  color: var(--pico-muted-color);
}

/* === Heatmap === */
.heatmap {
  display: flex;
  gap: 6px;
}

.heatmap-cell {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 6px;
  text-align: center;
}

.heatmap-active {
  background: var(--pico-ins-color);
}

.heatmap-rest {
  background: var(--pico-muted-border-color);
  opacity: 0.3;
}

.heatmap-future {
  border: 2px dashed var(--pico-muted-border-color);
}

/* === Badge === */
.badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* === Safety alerts === */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.alert-warning {
  background: rgba(230, 126, 34, 0.15);
  border-left: 4px solid #e67e22;
}

.alert-danger {
  background: rgba(231, 76, 60, 0.15);
  border-left: 4px solid #e74c3c;
}

.alert-info {
  background: rgba(52, 152, 219, 0.15);
  border-left: 4px solid #3498db;
}

.alert-success {
  background: rgba(46, 204, 113, 0.15);
  border-left: 4px solid #2ecc71;
}
```

- [ ] **Step 3: Create js/app.js — Alpine.js app core with hash router**

```javascript
// js/app.js — Alpine.js SPA core
// 2026-04-03

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    page: 'home',

    init() {
      // Hash router
      this.page = this.getPageFromHash();
      window.addEventListener('hashchange', () => {
        this.page = this.getPageFromHash();
      });

      // Set initial hash if none
      if (!window.location.hash) {
        window.location.hash = '#/home';
      }

      // Load theme preference
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    },

    getPageFromHash() {
      const hash = window.location.hash.replace('#/', '') || 'home';
      const valid = ['home', 'workout', 'history', 'progress', 'settings'];
      return valid.includes(hash) ? hash : 'home';
    },

    navigate(page) {
      window.location.hash = `#/${page}`;
    },

    // Theme toggle
    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    },
  }));
});
```

- [ ] **Step 4: Open in browser and verify**

Run: `start http://localhost:5500` (or Live Server)
Expected: Dark-themed app shell with 5 bottom tabs, hash routing works between tabs.

- [ ] **Step 5: Commit**

```bash
git add index.html css/ js/app.js
git commit -m "feat: create SPA shell with Alpine.js router and Pico CSS dark/light"
```

---

### Task 3: PWA Setup (manifest + Service Worker)

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `assets/icons/` (placeholder icons)

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "맨몸운동 트레이너",
  "short_name": "운동트레이너",
  "description": "맨몸운동 커리큘럼 앱 — 초급부터 고급까지",
  "start_url": "./index.html#/home",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Create sw.js — Service Worker with Cache First strategy**

```javascript
// sw.js — Service Worker
// 2026-04-03

const CACHE_NAME = 'workout-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Cache First for static, Network First for API
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network First for Google Apps Script API
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache First for everything else
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

- [ ] **Step 3: Register Service Worker in app.js init()**

Add to `init()` in app.js:

```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
```

- [ ] **Step 4: Create placeholder PWA icons using inline SVG → PNG**

Create `assets/icons/` directory. Generate simple colored square icons with text:

```html
<!-- Save this as a temp HTML file, open in browser, right-click save images -->
<!-- Or use the following canvas script in browser console: -->
```

```javascript
// Run in browser console to generate icons
function makeIcon(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);
  // Circle
  ctx.fillStyle = '#3498db';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size*0.35, 0, Math.PI*2);
  ctx.fill();
  // Text
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size*0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💪', size/2, size/2);
  // Download
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = `icon-${size}.png`;
  a.click();
}
makeIcon(192);
makeIcon(512);
```

Place downloaded files in `assets/icons/icon-192.png` and `assets/icons/icon-512.png`.

- [ ] **Step 5: Commit**

```bash
git add manifest.json sw.js assets/
git commit -m "feat: add PWA manifest and service worker with offline support"
```

---

## Chunk 2: Data Layer (Storage + Exercise Data)

### Task 4: LocalStorage CRUD Module

**Files:**
- Create: `js/modules/storage.js`

- [ ] **Step 1: Create storage.js — LocalStorage abstraction with sync queue**

```javascript
// js/modules/storage.js — LocalStorage CRUD + sync queue
// 2026-04-03

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
      current_phase: 'intro',    // intro, beginner, intermediate, advanced
      level: 1,
      xp: 0,
      streak: 0,
      best_streak: 0,
      shields_remaining: 2,
      shields_reset_date: new Date().toISOString().slice(0, 7), // YYYY-MM
      exercise_levels: {},
      badges: [],
      total_workouts: 0,
      last_workout_date: null,
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
```

- [ ] **Step 2: Import storage.js in index.html**

Add before app.js script tag:
```html
<script src="js/modules/storage.js"></script>
```

- [ ] **Step 3: Verify in browser console**

```javascript
Storage.getState(); // should return default state
Storage.updateState({ level: 2 });
Storage.getState().level; // should be 2
```

- [ ] **Step 4: Commit**

```bash
git add js/modules/storage.js index.html
git commit -m "feat: add LocalStorage CRUD module with sync queue"
```

---

### Task 5: Exercise & Routine Data Definitions

**Files:**
- Create: `js/data/exercises.js`
- Create: `js/data/routines.js`
- Create: `js/data/progressions.js`

- [ ] **Step 1: Create exercises.js — Exercise database with form guides**

```javascript
// js/data/exercises.js — Exercise definitions + form guides
// 2026-04-03

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
```

- [ ] **Step 2: Create routines.js — 4-phase routine definitions**

```javascript
// js/data/routines.js — 4-phase 2-split routines
// 2026-04-03

const Routines = {
  // === Phase definitions ===
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
    duration: 300, // 5 minutes
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
    intro: 60,
    beginner: 75,
    intermediate: 90,
    advanced: 90,
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

  // Helper: get today's routine
  getTodayRoutine(phase, split) {
    return this[phase]?.[split] || null;
  },
};
```

- [ ] **Step 3: Create progressions.js — Level-up criteria & XP system**

```javascript
// js/data/progressions.js — Level criteria, XP, badges
// 2026-04-03

const Progressions = {
  // === Level-up criteria ===
  // All criteria must be met for 2 consecutive weeks
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
    attendance: 50,       // 앱 출석 (운동 시작)
    set_complete: 10,     // 세트 완료
    routine_complete: 100, // 풀 루틴 완료
    level_up: 500,        // 레벨업 보너스
    return_bonus_mult: 2, // 3일+ 공백 후 복귀 배수
  },

  // XP needed per level (cumulative)
  xpPerLevel: 300, // 300 XP per level (Lv1→Lv2 = 300XP)

  getLevelFromXP(xp) {
    return Math.floor(xp / this.xpPerLevel) + 1;
  },

  getXPProgress(xp) {
    const current = xp % this.xpPerLevel;
    return { current, needed: this.xpPerLevel, percent: Math.round((current / this.xpPerLevel) * 100) };
  },

  // Level → Phase mapping
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
        // Same day or next day — streak continues
        return { streak: currentStreak, shieldsUsed: 0 };
      } else if (diffDays === 2 && shieldsRemaining > 0) {
        // Missed 1 day — use shield
        return { streak: currentStreak, shieldsUsed: 1 };
      } else if (diffDays <= 3 && shieldsRemaining >= diffDays - 1) {
        // Missed 2 days — use 2 shields
        return { streak: currentStreak, shieldsUsed: diffDays - 1 };
      } else {
        // Streak broken
        return { streak: 0, shieldsUsed: 0 };
      }
    },
  },
};
```

- [ ] **Step 4: Import data files in index.html**

Add before app.js:
```html
<script src="js/data/exercises.js"></script>
<script src="js/data/routines.js"></script>
<script src="js/data/progressions.js"></script>
```

- [ ] **Step 5: Verify data loads in browser console**

```javascript
Exercises.pushup.name; // "푸시업"
Routines.intro.A.exercises.length; // 4
Progressions.badges.first_workout.name; // "복귀전사"
```

- [ ] **Step 6: Commit**

```bash
git add js/data/
git commit -m "feat: add exercise DB, 4-phase routines, and progression system data"
```

---

## Chunk 3: Home Dashboard & Workout Execution

### Task 6: Home Dashboard Page

**Files:**
- Modify: `index.html` — replace `<div id="page-home">` placeholder
- Modify: `js/app.js` — add dashboard computed properties

- [ ] **Step 1: Add Home page template inside x-show="page === 'home'" div in index.html**

Replace `<div id="page-home"></div>` with the full dashboard template:

```html
<div x-data="homePage">
  <!-- Greeting + Streak -->
  <div style="margin-bottom: 1rem;">
    <h2 x-text="greeting" style="margin-bottom: 0.25rem;"></h2>
    <p class="text-workout-sm" x-text="'연속 ' + state.streak + '일째 · Lv.' + level + ' ' + phaseName"></p>
  </div>

  <!-- Weekly Heatmap -->
  <div style="margin-bottom: 1rem;">
    <small class="text-workout-sm">이번 주</small>
    <div class="heatmap" style="margin-top: 0.4rem;">
      <template x-for="(day, i) in weekDays" :key="i">
        <div style="flex:1; text-align:center;">
          <small x-text="day.label" class="text-workout-sm" style="font-size:0.7rem;"></small>
          <div class="heatmap-cell"
               :class="day.status === 'done' ? 'heatmap-active' : day.status === 'rest' ? 'heatmap-rest' : 'heatmap-future'"
               style="margin-top:4px;"></div>
        </div>
      </template>
    </div>
  </div>

  <!-- Today's Routine Card -->
  <div class="card card-highlight" style="margin-bottom: 1rem;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
      <div>
        <small class="text-workout-sm">오늘의 루틴</small>
        <h3 x-text="todaySplit + '분할: ' + todayRoutineName" style="margin:0;"></h3>
      </div>
      <small class="text-workout-sm">~25분</small>
    </div>
    <p class="text-workout-sm" x-text="todayExerciseSummary" style="line-height:1.8;"></p>
    <button class="btn-lg" style="width:100%; margin-top:0.75rem;" @click="$data.$root.navigate('workout')">
      운동 시작하기
    </button>
  </div>

  <!-- Level Progress -->
  <div style="margin-bottom: 1rem;">
    <small class="text-workout-sm" x-text="phaseName + ' 진행도'"></small>
    <div class="progress-bar" style="margin-top:0.4rem;">
      <div class="progress-bar-fill" :style="'width:' + xpProgress.percent + '%'"></div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:0.25rem;">
      <small class="text-workout-sm" x-text="'Lv.' + level"></small>
      <small class="text-workout-sm" x-text="xpProgress.percent + '%'"></small>
    </div>
  </div>

  <!-- Recent Badges -->
  <div x-show="recentBadges.length > 0">
    <small class="text-workout-sm">최근 획득 뱃지</small>
    <div style="display:flex; gap:8px; margin-top:0.4rem;">
      <template x-for="b in recentBadges" :key="b">
        <div class="badge" :style="'background: rgba(128,128,128,0.15);'" :title="Progressions.badges[b]?.name">
          <span x-text="Progressions.badges[b]?.icon || '🏅'"></span>
        </div>
      </template>
    </div>
  </div>

  <!-- Motivation Message -->
  <div class="alert alert-info" style="margin-top:1rem;" x-show="motivationMsg">
    <span x-text="motivationMsg"></span>
  </div>
</div>
```

- [ ] **Step 2: Add homePage Alpine component in app.js**

```javascript
Alpine.data('homePage', () => ({
  state: Storage.getState(),

  get level() { return Progressions.getLevelFromXP(this.state.xp); },
  get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
  get xpProgress() { return Progressions.getXPProgress(this.state.xp); },
  get recentBadges() { return (this.state.badges || []).slice(-5); },

  get schedule() {
    // User-customizable schedule stored in state, default: Mon=A, Wed=B
    return this.state.schedule || { 1: 'A', 3: 'B' }; // dow → split mapping
  },

  get todaySplit() {
    const dow = new Date().getDay(); // 0=Sun
    return this.schedule[dow] || null; // null = rest day
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
    if (this.isRestDay) return '오늘은 휴식일입니다. 충분히 쉬세요.';
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
    // Use Motivation module if available
    if (typeof Motivation !== 'undefined') {
      if (s.last_workout_date) {
        const daysSince = Math.floor((Date.now() - new Date(s.last_workout_date).getTime()) / (1000*60*60*24));
        const lastLog = Storage.getLogs().slice(-1)[0];
        const returnMsg = Motivation.getReturnMessage(daysSince, lastLog);
        if (returnMsg) return returnMsg;
      }
      const streakMsg = Motivation.streakMessage(s.streak);
      if (streakMsg) return streakMsg;
      if (s.total_workouts === 0) return '첫 운동을 시작해볼까요? 시작이 반입니다.';
      return Motivation.getStartMessage();
    }
    // Fallback
    if (s.total_workouts === 0) return '첫 운동을 시작해볼까요? 시작이 반입니다.';
    if (s.streak >= 7) return `${s.streak}일 연속! 꾸준함이 곧 실력입니다.`;
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
```

- [ ] **Step 3: Verify Home page renders**

Expected: Dashboard with greeting, weekly heatmap, routine card, level progress bar.

- [ ] **Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add Home dashboard with heatmap, routine card, level progress"
```

---

### Task 7: Workout Execution Page

**Files:**
- Modify: `index.html` — replace `<div id="page-workout">`
- Create: `js/modules/timer.js`
- Create: `js/utils/wakelock.js`
- Create: `js/utils/haptic.js`
- Modify: `js/app.js` — add workoutPage component

- [ ] **Step 1: Create js/utils/wakelock.js**

```javascript
// js/utils/wakelock.js — Screen wake lock for workout sessions
// 2026-04-03

const WakeLock = {
  _lock: null,

  async acquire() {
    if ('wakeLock' in navigator) {
      try {
        this._lock = await navigator.wakeLock.request('screen');
      } catch (e) { /* ignore if not supported */ }
    }
  },

  async release() {
    if (this._lock) {
      await this._lock.release();
      this._lock = null;
    }
  },
};
```

- [ ] **Step 2: Create js/utils/haptic.js**

```javascript
// js/utils/haptic.js — Haptic feedback utility
// 2026-04-03

const Haptic = {
  light()  { navigator.vibrate?.(30); },
  medium() { navigator.vibrate?.(50); },
  heavy()  { navigator.vibrate?.([50, 30, 50]); },
};
```

- [ ] **Step 3: Create js/modules/timer.js**

```javascript
// js/modules/timer.js — Rest timer with auto-start
// 2026-04-03

const Timer = {
  _interval: null,
  _callback: null,

  start(seconds, onTick, onDone) {
    this.stop();
    let remaining = seconds;
    this._callback = onTick;
    onTick(remaining);

    this._interval = setInterval(() => {
      remaining--;
      onTick(remaining);
      if (remaining <= 0) {
        this.stop();
        Haptic.heavy();
        if (onDone) onDone();
      }
    }, 1000);
  },

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },
};
```

- [ ] **Step 4: Add Workout page template in index.html**

Replace `<div id="page-workout"></div>`:

```html
<div x-data="workoutPage">
  <!-- Pre-workout / Warmup -->
  <template x-if="phase === 'idle'">
    <div style="text-align:center; padding-top:2rem;">
      <h2 x-text="splitName"></h2>
      <p class="text-workout-sm" x-text="phaseName + ' · ' + splitLabel + '분할'"></p>
      <button class="btn-lg" style="width:100%; margin-top:2rem;" @click="startWarmup()">
        워밍업 시작 (5분)
      </button>
    </div>
  </template>

  <!-- Warmup Phase -->
  <template x-if="phase === 'warmup'">
    <div style="text-align:center; padding-top:1rem;">
      <small class="text-workout-sm">워밍업</small>
      <h3 x-text="warmupStep.name"></h3>
      <p class="text-workout-sm" x-text="warmupStep.desc"></p>
      <div class="text-workout-lg" style="margin:1.5rem 0;" x-text="timerDisplay"></div>
      <button class="btn-lg" style="width:100%;" @click="nextWarmupStep()">다음</button>
    </div>
  </template>

  <!-- Exercise Phase -->
  <template x-if="phase === 'exercise'">
    <div>
      <!-- Header -->
      <div style="text-align:center; padding:0.5rem 0; background:var(--pico-card-background-color); border-radius:8px; margin-bottom:1rem;">
        <small class="text-workout-sm" x-text="phaseName + ' · ' + splitLabel + '분할 · ' + splitName"></small>
        <div style="font-weight:600;" x-text="'종목 ' + (currentExIdx+1) + '/' + exercises.length + ' · 세트 ' + (currentSetIdx+1) + '/' + currentExercise.sets"></div>
      </div>

      <!-- Exercise Name -->
      <div style="text-align:center; margin-bottom:1rem;">
        <h2 x-text="currentExInfo.name" style="margin-bottom:0.25rem;"></h2>
        <p class="text-workout-sm" x-text="'목표: ' + currentExercise.reps + ' · ' + currentExercise.sets + '세트'"></p>
        <p class="text-workout-sm" x-show="currentExercise.note" x-text="currentExercise.note"></p>
      </div>

      <!-- Set Indicators -->
      <div style="display:flex; gap:8px; justify-content:center; margin-bottom:1.5rem;">
        <template x-for="(s, i) in setResults" :key="i">
          <div class="set-indicator"
               :class="i < currentSetIdx ? 'set-done' : i === currentSetIdx ? 'set-current' : 'set-pending'"
               x-text="i < currentSetIdx ? ('✓' + s.reps) : (i === currentSetIdx ? (currentSetIdx+1) : (i+1))">
          </div>
        </template>
      </div>

      <!-- Rep Counter -->
      <div style="text-align:center; margin-bottom:1.5rem;">
        <div class="text-workout-lg" x-text="repCount"></div>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:0.75rem;">
          <button class="btn-round" @click="repCount = Math.max(0, repCount - 1)">−</button>
          <button class="btn-round" @click="repCount++">+</button>
        </div>
      </div>

      <!-- Complete Set Button (thumb zone) -->
      <button class="btn-lg" style="width:100%;" @click="completeSet()">
        ✓ 세트 완료
      </button>

      <!-- Form Guide (collapsible) -->
      <details style="margin-top:1rem;">
        <summary style="cursor:pointer; font-size:0.9rem;">📖 폼 가이드</summary>
        <div style="padding:0.5rem 0; font-size:0.85rem; color:var(--pico-muted-color);">
          <template x-for="tip in currentExInfo.guide || []" :key="tip">
            <p x-text="'• ' + tip" style="margin:0.25rem 0;"></p>
          </template>
        </div>
      </details>
    </div>
  </template>

  <!-- Rest Timer -->
  <template x-if="phase === 'rest'">
    <div style="text-align:center; padding-top:2rem;">
      <small class="text-workout-sm">휴식 중...</small>
      <div class="text-workout-lg" style="margin:1.5rem 0; font-size:4rem;" x-text="timerDisplay"></div>
      <p class="text-workout-sm" x-text="'권장 휴식: ' + currentExercise.rest + '초'"></p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:1.5rem;">
        <button @click="addRestTime(30)" style="min-height:var(--touch-min);">+30초</button>
        <button class="btn-lg" @click="skipRest()" style="background:var(--pico-ins-color); color:#fff;">건너뛰기</button>
      </div>
      <div class="alert alert-info" style="margin-top:1.5rem; text-align:left;">
        <small>다음: <strong x-text="nextExerciseName"></strong></small>
      </div>
    </div>
  </template>

  <!-- Pain Check (Safety mechanism #1) -->
  <template x-if="phase === 'pain_check'">
    <div style="text-align:center; padding-top:2rem;">
      <h3>관절 통증이 있나요?</h3>
      <p class="text-workout-sm" x-text="currentExInfo.name + ' 수행 후'"></p>
      <div style="display:flex; gap:12px; justify-content:center; margin:1.5rem 0;">
        <button class="btn-lg" style="flex:1; background:var(--pico-ins-color); color:#fff;" @click="submitPainCheck(false)">
          아니오, 괜찮아요
        </button>
        <button class="btn-lg" style="flex:1; background:var(--pico-del-color); color:#fff;" @click="submitPainCheck(true)">
          네, 통증 있어요
        </button>
      </div>
      <small class="text-workout-sm">"네" 선택 시 이 종목은 중단되고 대체 동작이 안내됩니다.</small>
    </div>
  </template>

  <!-- RPE Check (after each exercise) -->
  <template x-if="phase === 'rpe'">
    <div style="text-align:center; padding-top:2rem;">
      <h3 x-text="currentExInfo.name + ' 완료!'"></h3>
      <p class="text-workout-sm">오늘 RPE는? (1-10)</p>
      <div style="display:flex; gap:6px; justify-content:center; margin:1.5rem 0; flex-wrap:wrap;">
        <template x-for="n in [5,6,7,8,9,10]" :key="n">
          <button class="btn-round" :class="rpeValue === n ? 'set-current' : ''"
                  @click="rpeValue = n" x-text="n"
                  style="width:48px; height:48px;"></button>
        </template>
      </div>
      <button class="btn-lg" style="width:100%;" @click="submitRPE()" :disabled="!rpeValue">확인</button>
    </div>
  </template>

  <!-- Cooldown Phase -->
  <template x-if="phase === 'cooldown'">
    <div style="text-align:center; padding-top:1rem;">
      <small class="text-workout-sm">쿨다운</small>
      <h3 x-text="getCooldownStep()?.name || '완료'"></h3>
      <p class="text-workout-sm" x-text="getCooldownStep()?.desc || ''"></p>
      <div class="text-workout-lg" style="margin:1.5rem 0;" x-text="timerDisplay"></div>
      <button class="btn-lg" style="width:100%;" @click="nextCooldownStep()">다음</button>
    </div>
  </template>

  <!-- Session Complete -->
  <template x-if="phase === 'done'">
    <div style="text-align:center; padding-top:2rem;">
      <h2>운동 완료! 🎉</h2>
      <div style="margin:1.5rem 0;">
        <p>총 <strong x-text="totalSets + '세트'"></strong> 완료</p>
        <p>소요 시간: <strong x-text="sessionDuration"></strong></p>
        <p x-show="xpEarned > 0">획득 XP: <strong x-text="'+' + xpEarned"></strong></p>
      </div>
      <template x-if="newBadges.length > 0">
        <div style="margin-bottom:1.5rem;">
          <p class="text-workout-sm">새로운 뱃지!</p>
          <div style="display:flex; gap:8px; justify-content:center;">
            <template x-for="b in newBadges" :key="b">
              <div class="badge" style="background:rgba(241,196,15,0.2);">
                <span x-text="Progressions.badges[b]?.icon || '🏅'"></span>
              </div>
            </template>
          </div>
        </div>
      </template>
      <button class="btn-lg" style="width:100%;" @click="$data.$root.navigate('home')">홈으로</button>
    </div>
  </template>
</div>
```

- [ ] **Step 5: Add workoutPage Alpine component in app.js**

This is a large component — create it in a separate section of app.js:

```javascript
Alpine.data('workoutPage', () => ({
  phase: 'idle',     // idle, warmup, exercise, rest, pain_check, rpe, cooldown, done
  warmupIdx: 0,
  cooldownIdx: 0,
  currentExIdx: 0,
  currentSetIdx: 0,
  repCount: 0,
  rpeValue: null,
  painResponse: null,
  timerDisplay: '0:00',
  restRemaining: 0,
  setResults: [],
  sessionLogs: [],
  sessionStart: null,
  xpEarned: 0,
  newBadges: [],
  totalSets: 0,
  sessionDuration: '0:00',

  get state() { return Storage.getState(); },
  get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
  get splitLabel() {
    // Use user-customizable schedule, same as homePage
    const schedule = this.state.schedule || { 1: 'A', 3: 'B' };
    const dow = new Date().getDay();
    return schedule[dow] || 'A'; // fallback A if somehow accessed on rest day
  },
  get routine() { return Routines.getTodayRoutine(this.state.current_phase, this.splitLabel); },
  get splitName() { return this.routine?.name || ''; },
  get exercises() { return this.routine?.exercises || []; },
  get currentExercise() { return this.exercises[this.currentExIdx] || {}; },
  get currentExInfo() { return Exercises[this.currentExercise.id] || {}; },
  get warmupStep() { return Routines.warmup.steps[this.warmupIdx]; },
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

  startWarmup() {
    WakeLock.acquire();
    this.sessionStart = Date.now();
    this.phase = 'warmup';
    this.warmupIdx = 0;
    this.startWarmupTimer();
  },

  startWarmupTimer() {
    const step = Routines.warmup.steps[this.warmupIdx];
    if (!step) { this.startExercise(); return; }
    Timer.start(step.duration,
      (r) => { this.timerDisplay = Timer.formatTime(r); },
      () => { this.nextWarmupStep(); }
    );
  },

  nextWarmupStep() {
    Timer.stop();
    this.warmupIdx++;
    if (this.warmupIdx >= Routines.warmup.steps.length) {
      this.startExercise();
    } else {
      this.startWarmupTimer();
    }
  },

  startExercise() {
    this.phase = 'exercise';
    this.currentExIdx = 0;
    this.currentSetIdx = 0;
    this.initSets();
  },

  initSets() {
    const ex = this.currentExercise;
    this.setResults = Array.from({ length: ex.sets }, () => ({ reps: 0, completed: false }));
    this.repCount = this.parseTargetReps(ex.reps);
    this.currentSetIdx = 0;
  },

  parseTargetReps(reps) {
    if (typeof reps === 'number') return reps;
    const str = String(reps);
    // "8-12" → 10, "8/측" → 8, "15-30초" → 20
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

    // Save individual set log
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

    // Safety: Pain check after set (mechanism #1)
    if (Safety.shouldShowPainCheck(this.currentExercise.id, this.state)) {
      this.painResponse = null;
      this.phase = 'pain_check';
      return;
    }

    this.afterPainCheck();
  },

  // Called after pain check (or skipped if not needed)
  afterPainCheck() {
    if (this.currentSetIdx >= this.currentExercise.sets) {
      // All sets done for this exercise → RPE check
      this.phase = 'rpe';
      this.rpeValue = null;
    } else {
      // Start rest timer
      this.startRest();
    }
  },

  submitPainCheck(hasPain) {
    if (hasPain) {
      // Save pain report
      Storage.savePainReport({
        date: Storage.getTodayStr(),
        exercise: this.currentExercise.id,
        body_part: 'general', // user can specify
        severity: 'reported',
        action_taken: 'stopped_exercise',
      });
      // Skip remaining sets of this exercise → move to RPE
      this.currentSetIdx = this.currentExercise.sets;
      this.phase = 'rpe';
      this.rpeValue = null;
    } else {
      this.afterPainCheck();
    }
  },

  startRest() {
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

  submitRPE() {
    // Add RPE to session logs for this exercise
    this.sessionLogs
      .filter(l => l.exercise === this.currentExercise.id && !l.rpe)
      .forEach(l => { l.rpe = this.rpeValue; });

    // Move to next exercise or cooldown
    this.currentExIdx++;
    if (this.currentExIdx >= this.exercises.length) {
      this.startCooldown(); // Issue #5: go to cooldown before finishing
    } else {
      this.initSets();
      this.phase = 'exercise';
    }
  },

  // Cooldown phase (Issue #5)
  startCooldown() {
    const cooldownData = Routines.cooldown[this.splitLabel];
    if (!cooldownData) { this.finishSession(); return; }
    this.cooldownIdx = 0;
    this.phase = 'cooldown';
    this.startCooldownTimer();
  },

  startCooldownTimer() {
    const cooldownData = Routines.cooldown[this.splitLabel];
    const step = cooldownData.steps[this.cooldownIdx];
    if (!step) { this.finishSession(); return; }
    Timer.start(step.duration,
      (r) => { this.timerDisplay = Timer.formatTime(r); },
      () => { this.nextCooldownStep(); }
    );
  },

  nextCooldownStep() {
    Timer.stop();
    this.cooldownIdx++;
    const cooldownData = Routines.cooldown[this.splitLabel];
    if (this.cooldownIdx >= cooldownData.steps.length) {
      this.finishSession();
    } else {
      this.startCooldownTimer();
    }
  },

  finishSession() {
    Timer.stop();
    WakeLock.release();

    // Calculate duration
    const durationSec = Math.round((Date.now() - this.sessionStart) / 1000);
    this.sessionDuration = Timer.formatTime(durationSec);

    // Save logs
    this.sessionLogs.forEach(log => {
      log.duration_sec = durationSec;
      Storage.saveLog(log);
    });

    // Update state
    const state = Storage.getState();
    let xp = Progressions.xp.attendance + (this.totalSets * Progressions.xp.set_complete) + Progressions.xp.routine_complete;

    // Return bonus
    if (state.last_workout_date) {
      const daysSince = Math.floor((Date.now() - new Date(state.last_workout_date).getTime()) / (1000*60*60*24));
      if (daysSince >= 3) xp *= Progressions.xp.return_bonus_mult;
    }

    this.xpEarned = xp;

    // Streak calculation
    const streakResult = Progressions.streak.calculateStreak(
      state.last_workout_date, state.streak, state.shields_remaining
    );

    // Check new badges
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

    this.phase = 'done';
  },
}));
```

- [ ] **Step 6: Import utility files in index.html**

Add before timer.js and app.js:
```html
<script src="js/utils/wakelock.js"></script>
<script src="js/utils/haptic.js"></script>
<script src="js/modules/timer.js"></script>
```

- [ ] **Step 7: Verify full workout flow**

Test: Navigate to Workout tab → Start Warmup → Complete exercises → RPE → Session Summary.

- [ ] **Step 8: Commit**

```bash
git add js/utils/ js/modules/timer.js index.html js/app.js
git commit -m "feat: add workout execution with timer, sets, RPE, and session tracking"
```

---

## Chunk 4: History, Progress, Settings & Safety

### Task 8: History Page

**Files:**
- Modify: `index.html` — replace `<div id="page-history">`
- Modify: `js/app.js` — add historyPage component

- [ ] **Step 1: Add History template in index.html**

Replace `<div id="page-history"></div>`:

```html
<div x-data="historyPage">
  <h2>운동 기록</h2>

  <!-- Month selector -->
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
    <button class="btn-round" @click="prevMonth()">◀</button>
    <span x-text="monthLabel" style="font-weight:600;"></span>
    <button class="btn-round" @click="nextMonth()">▶</button>
  </div>

  <!-- Calendar grid -->
  <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center; margin-bottom:1.5rem;">
    <template x-for="label in ['월','화','수','목','금','토','일']">
      <small class="text-workout-sm" x-text="label"></small>
    </template>
    <template x-for="day in calendarDays" :key="day.date">
      <div @click="day.hasWorkout && selectDate(day.date)"
           style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:8px; font-size:0.85rem; cursor:pointer;"
           :style="day.hasWorkout ? 'background:var(--pico-ins-color); color:#fff;' : ''"
           :class="day.isToday ? 'card-highlight' : ''"
           x-text="day.num || ''">
      </div>
    </template>
  </div>

  <!-- Selected date detail -->
  <template x-if="selectedDate">
    <div>
      <h3 x-text="selectedDate + ' 기록'"></h3>
      <template x-for="log in selectedLogs" :key="log.exercise + log.set_num">
        <div class="card" style="padding:0.5rem 0.75rem;">
          <div style="display:flex; justify-content:space-between;">
            <span x-text="getExName(log.exercise)"></span>
            <span class="text-workout-sm" x-text="'세트' + log.set_num + ': ' + log.reps + '회'"></span>
          </div>
          <small x-show="log.rpe" class="text-workout-sm" x-text="'RPE ' + log.rpe"></small>
        </div>
      </template>
      <p x-show="selectedLogs.length === 0" class="text-workout-sm">기록이 없습니다.</p>
    </div>
  </template>
</div>
```

- [ ] **Step 2: Add historyPage component in app.js**

```javascript
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

    // Offset for Monday start
    let startOffset = (firstDay.getDay() + 6) % 7;
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) days.push({ date: '', num: '', hasWorkout: false, isToday: false });

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
```

- [ ] **Step 3: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add History page with calendar view and daily log detail"
```

---

### Task 9: Progress Page (Charts + Badges)

**Files:**
- Modify: `index.html` — replace `<div id="page-progress">`
- Create: `js/modules/charts.js`
- Modify: `js/app.js` — add progressPage component

- [ ] **Step 1: Add uPlot CDN to index.html head (lazy loaded)**

```html
<!-- uPlot loaded on-demand in charts.js -->
```

- [ ] **Step 2: Create js/modules/charts.js — Chart rendering with lazy uPlot load**

```javascript
// js/modules/charts.js — uPlot chart rendering (lazy loaded)
// 2026-04-03

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
        // Group by date, take max reps per day
        if (!acc[l.date] || l.reps > acc[l.date]) acc[l.date] = l.reps;
        return acc;
      }, {});

    const dates = Object.keys(filtered).sort();
    if (dates.length < 2) return;

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
```

- [ ] **Step 3: Add Progress template in index.html**

Replace `<div id="page-progress"></div>`:

```html
<div x-data="progressPage" x-init="loadCharts()">
  <h2>진행도</h2>

  <!-- Phase Progress Bar -->
  <div style="margin-bottom:1.5rem;">
    <small class="text-workout-sm" x-text="phaseName + ' 진행도'"></small>
    <div class="progress-bar" style="margin-top:0.4rem;">
      <div class="progress-bar-fill" :style="'width:' + xpProgress.percent + '%'"></div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:0.25rem;">
      <small class="text-workout-sm" x-text="'Lv.' + level"></small>
      <small class="text-workout-sm" x-text="'XP: ' + state.xp + ' / ' + (level * Progressions.xpPerLevel)"></small>
    </div>
  </div>

  <!-- Stats Overview -->
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:1.5rem;">
    <div class="card" style="text-align:center;">
      <div style="font-size:1.5rem; font-weight:700;" x-text="state.total_workouts"></div>
      <small class="text-workout-sm">총 운동</small>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:1.5rem; font-weight:700;" x-text="state.streak"></div>
      <small class="text-workout-sm">연속일</small>
    </div>
    <div class="card" style="text-align:center;">
      <div style="font-size:1.5rem; font-weight:700;" x-text="state.best_streak || 0"></div>
      <small class="text-workout-sm">최장 연속</small>
    </div>
  </div>

  <!-- Exercise Charts -->
  <h3>종목별 성장</h3>
  <div style="margin-bottom:1rem;">
    <select x-model="selectedExercise" @change="renderChart()" style="width:100%;">
      <template x-for="ex in trackedExercises" :key="ex">
        <option :value="ex" x-text="getExName(ex)"></option>
      </template>
    </select>
  </div>
  <div x-ref="chartContainer" style="margin-bottom:1.5rem; min-height:200px;"></div>

  <!-- Badge Collection -->
  <h3>뱃지 컬렉션</h3>
  <div style="display:flex; flex-wrap:wrap; gap:8px;">
    <template x-for="(badge, id) in Progressions.badges" :key="id">
      <div class="badge"
           :style="hasBadge(id) ? 'background:rgba(241,196,15,0.2);' : 'background:rgba(128,128,128,0.1); opacity:0.3;'"
           :title="badge.name + ': ' + badge.desc">
        <span x-text="badge.icon"></span>
      </div>
    </template>
  </div>
</div>
```

- [ ] **Step 4: Add progressPage component in app.js**

```javascript
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
    const logs = Storage.getLogs();
    Charts.renderExerciseChart(container, this.selectedExercise, logs);
  },
}));
```

- [ ] **Step 5: Import charts.js in index.html**

```html
<script src="js/modules/charts.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add js/modules/charts.js index.html js/app.js
git commit -m "feat: add Progress page with lazy-loaded charts and badge collection"
```

---

### Task 10: Settings Page (Theme + Schedule + Data)

**Files:**
- Modify: `index.html` — replace `<div id="page-settings">`
- Modify: `js/app.js` — add settingsPage component

- [ ] **Step 1: Add Settings template in index.html**

Replace `<div id="page-settings"></div>`:

```html
<div x-data="settingsPage">
  <h2>설정</h2>

  <!-- Theme Toggle -->
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span>다크/라이트 모드</span>
      <button @click="$data.$root.toggleTheme()" style="min-width:80px;"
              x-text="currentTheme === 'dark' ? '🌙 다크' : '☀️ 라이트'"></button>
    </div>
  </div>

  <!-- Current Phase Info -->
  <div class="card">
    <h4>현재 단계</h4>
    <p x-text="phaseName + ' (Lv.' + level + ')'"></p>
    <small class="text-workout-sm">총 운동: <span x-text="state.total_workouts"></span>회</small>
  </div>

  <!-- Schedule Adjustment (Issue #7) -->
  <div class="card">
    <h4>주간 스케줄</h4>
    <p class="text-workout-sm" style="margin-bottom:0.75rem;">운동일에 A 또는 B 분할을 배정하세요. 빈칸 = 휴식일.</p>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center;">
      <template x-for="(label, i) in ['월','화','수','목','금','토','일']" :key="i">
        <div>
          <small class="text-workout-sm" x-text="label"></small>
          <select style="padding:4px; text-align:center; font-size:0.85rem;"
                  :value="schedule[i+1===7?0:i+1] || ''"
                  @change="updateSchedule(i+1===7?0:i+1, $event.target.value)">
            <option value="">휴</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
      </template>
    </div>
    <small class="text-workout-sm" style="margin-top:0.5rem; display:block;">기본: 월(A) · 수(B) · 나머지 휴식</small>
  </div>

  <!-- Google Sheets Sync -->
  <div class="card">
    <h4>Google Sheets 동기화</h4>
    <div style="margin-bottom:0.75rem;">
      <label>Apps Script URL</label>
      <input type="url" x-model="sheetsUrl" placeholder="https://script.google.com/macros/s/..." style="width:100%;">
    </div>
    <div style="margin-bottom:0.75rem;">
      <label>API Key</label>
      <input type="text" x-model="apiKey" placeholder="your-api-key" style="width:100%;">
    </div>
    <div style="display:flex; gap:8px;">
      <button @click="saveSheetsConfig()" style="flex:1;">저장</button>
      <button @click="syncNow()" style="flex:1;" :disabled="!sheetsUrl">동기화</button>
    </div>
    <small class="text-workout-sm" x-show="syncStatus" x-text="syncStatus" style="margin-top:0.5rem; display:block;"></small>
  </div>

  <!-- Data Management -->
  <div class="card">
    <h4>데이터 관리</h4>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button @click="exportData()" style="flex:1;">JSON 내보내기</button>
      <button @click="$refs.importFile.click()" style="flex:1;">JSON 가져오기</button>
      <input type="file" accept=".json" x-ref="importFile" @change="importData($event)" style="display:none;">
    </div>
  </div>

  <!-- Reset -->
  <div class="card" style="border-color: var(--pico-del-color);">
    <h4>초기화</h4>
    <p class="text-workout-sm">모든 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
    <button @click="resetConfirm()" class="outline" style="color:var(--pico-del-color); border-color:var(--pico-del-color);">
      전체 초기화
    </button>
  </div>
</div>
```

- [ ] **Step 2: Add settingsPage component in app.js**

```javascript
Alpine.data('settingsPage', () => ({
  state: Storage.getState(),
  sheetsUrl: localStorage.getItem('sheets_url') || '',
  apiKey: localStorage.getItem('sheets_api_key') || '',
  syncStatus: '',

  get currentTheme() { return document.documentElement.getAttribute('data-theme'); },
  get level() { return Progressions.getLevelFromXP(this.state.xp); },
  get phaseName() { return Routines.phaseNames[this.state.current_phase] || '입문'; },
  get schedule() { return this.state.schedule || { 1: 'A', 3: 'B' }; },

  updateSchedule(dow, value) {
    const schedule = { ...this.schedule };
    if (value) {
      schedule[dow] = value;
    } else {
      delete schedule[dow];
    }
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
      // Will be implemented in sheets-api.js task
      if (typeof SheetsAPI !== 'undefined') {
        await SheetsAPI.sync();
        this.syncStatus = '✓ 동기화 완료';
      } else {
        this.syncStatus = '⚠ Sheets API 모듈 미로드';
      }
    } catch (e) {
      this.syncStatus = '✗ 동기화 실패: ' + e.message;
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
    if (confirm('정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add Settings page with theme toggle, Sheets config, data export/import"
```

---

### Task 11: Safety System Module

**Files:**
- Create: `js/modules/safety.js`
- Modify: `js/app.js` — integrate safety checks into workout flow

- [ ] **Step 1: Create js/modules/safety.js**

```javascript
// js/modules/safety.js — 6 safety mechanisms
// 2026-04-03

const Safety = {
  // 1. Pain check — should show after set?
  shouldShowPainCheck(exerciseId, state) {
    const phase = state.current_phase;
    const exerciseLevels = state.exercise_levels || {};
    const exWeeks = exerciseLevels[exerciseId]?.weeks || 0;

    // Always show in intro phase
    if (phase === 'intro') return true;
    // Show for first 2 weeks of new exercise
    if (exWeeks < 2) return true;
    return false;
  },

  // 2. RPE overload warning
  checkRPEOverload(exerciseId) {
    const logs = Storage.getLogs();
    const recent = logs
      .filter(l => l.exercise === exerciseId && l.rpe)
      .slice(-6); // last ~2 sessions

    const highRPE = recent.filter(l => l.rpe >= 9);
    return highRPE.length >= 4; // 2+ sessions with RPE 9+
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
    return (thisWeekSets / lastWeekSets) > 1.2; // 20%+ increase
  },

  // 4. Rest day compliance
  checkRestDayCompliance(split) {
    const logs = Storage.getLogs();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Check if same split was done yesterday
    const yesterdayLogs = logs.filter(l => l.date === yesterdayStr);
    if (yesterdayLogs.length === 0) return true; // OK — rested

    // Check if same muscle group (same routine type)
    const yesterdayRoutine = yesterdayLogs[0]?.routine;
    const todayRoutine = split === 'A' ? 'push_pull' : 'lower_posterior';
    return yesterdayRoutine !== todayRoutine; // OK if different split
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
    return exWeeks < 4; // Show for first 4 weeks
  },

  // Get all pre-workout alerts
  getPreWorkoutAlerts(split, state) {
    const alerts = [];

    // Volume surge
    if (this.checkVolumeSurge()) {
      alerts.push({
        type: 'warning',
        message: '주간 볼륨이 20% 이상 증가했습니다. 부상 위험이 올라갈 수 있습니다.',
      });
    }

    // Rest day
    if (!this.checkRestDayCompliance(split)) {
      alerts.push({
        type: 'warning',
        message: '동일 부위가 48시간 미경과 — 회복 부족 가능. 다른 부위나 휴식을 권장합니다.',
      });
    }

    // Return after gap
    const gap = this.checkReturnAfterGap(state);
    if (gap) {
      alerts.push({
        type: 'info',
        message: gap.message,
      });
    }

    // RPE overload for any exercise in today's routine
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
```

- [ ] **Step 2: Import safety.js in index.html**

```html
<script src="js/modules/safety.js"></script>
```

- [ ] **Step 3: Integrate safety alerts into workout page idle phase**

In the `template x-if="phase === 'idle'"` section, add before the start button:

```html
<!-- Safety Alerts -->
<template x-for="alert in preWorkoutAlerts" :key="alert.message">
  <div class="alert" :class="'alert-' + alert.type" x-text="alert.message"></div>
</template>
```

Add to workoutPage component:
```javascript
get preWorkoutAlerts() {
  return Safety.getPreWorkoutAlerts(this.splitLabel, this.state);
},
```

- [ ] **Step 4: Commit**

```bash
git add js/modules/safety.js index.html js/app.js
git commit -m "feat: add 6-point safety system with pre-workout alerts"
```

---

## Chunk 5: Google Sheets API & Final Polish

### Task 12: Google Apps Script Backend

**Files:**
- Create: `google-apps-script/Code.gs` (reference — deployed separately)

- [ ] **Step 0: Google Apps Script 설정 가이드**

> **Setup:**
> 1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성 → Sheet ID 복사 (URL의 `/d/SHEET_ID/` 부분)
> 2. Extensions → Apps Script 열기
> 3. 아래 Code.gs 내용 붙여넣기
> 4. `SHEET_ID`를 실제 시트 ID로 교체
> 5. `YOUR_API_KEY_HERE`를 원하는 임의 문자열로 교체 (예: `my-workout-key-2026`)
> 6. Deploy → New deployment → Web app → Who has access: Anyone → Deploy
> 7. 배포 URL을 복사하여 앱 Settings에서 입력

- [ ] **Step 1: Create Google Apps Script code (reference file)**

```javascript
// google-apps-script/Code.gs
// Deploy as Web App in Google Apps Script editor
// 2026-04-03

const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace after creating spreadsheet

function doGet(e) {
  const action = e.parameter.action;
  const key = e.parameter.key;

  // Simple API key check
  if (key !== 'YOUR_API_KEY_HERE') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  switch (action) {
    case 'getLogs':
      return jsonResponse(getLogs(e.parameter.from));
    case 'getState':
      return jsonResponse(getState());
    default:
      return jsonResponse({ error: 'Unknown action' }, 400);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const key = body.key;

  if (key !== 'YOUR_API_KEY_HERE') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  switch (body.action) {
    case 'saveLogs':
      return jsonResponse(saveLogs(body.logs));
    case 'saveState':
      return jsonResponse(saveState(body.state));
    case 'reportPain':
      return jsonResponse(savePainReport(body.report));
    default:
      return jsonResponse({ error: 'Unknown action' }, 400);
  }
}

function getLogs(fromDate) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('workout_logs');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  if (fromDate) return rows.filter(r => r.date >= fromDate);
  return rows;
}

function saveLogs(logs) {
  const sheet = getOrCreateSheet('workout_logs',
    ['date', 'routine', 'exercise', 'set_num', 'reps', 'rpe', 'level', 'duration_sec', 'notes', 'created_at']);
  logs.forEach(log => {
    sheet.appendRow([
      log.date, log.routine, log.exercise, log.set_num,
      log.reps, log.rpe || '', log.level, log.duration_sec || '',
      log.notes || '', log.created_at || new Date().toISOString(),
    ]);
  });
  return { saved: logs.length };
}

function getState() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('user_state');
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const state = {};
  data.slice(1).forEach(row => {
    try { state[row[0]] = JSON.parse(row[1]); }
    catch { state[row[0]] = row[1]; }
  });
  return state;
}

function saveState(state) {
  const sheet = getOrCreateSheet('user_state', ['key', 'value', 'updated_at']);
  // Clear existing and rewrite
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  const now = new Date().toISOString();
  Object.entries(state).forEach(([key, value]) => {
    sheet.appendRow([key, JSON.stringify(value), now]);
  });
  return { saved: true };
}

function savePainReport(report) {
  const sheet = getOrCreateSheet('pain_reports',
    ['date', 'exercise', 'body_part', 'severity', 'action_taken', 'created_at']);
  sheet.appendRow([
    report.date, report.exercise, report.body_part,
    report.severity, report.action_taken || '', report.created_at || new Date().toISOString(),
  ]);
  return { saved: true };
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function jsonResponse(data, code) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: Commit reference file**

```bash
git add google-apps-script/
git commit -m "feat: add Google Apps Script backend reference code"
```

---

### Task 13: Sheets API Frontend Module

**Files:**
- Create: `js/modules/sheets-api.js`

- [ ] **Step 1: Create sheets-api.js**

```javascript
// js/modules/sheets-api.js — Google Sheets sync via Apps Script
// 2026-04-03

const SheetsAPI = {
  getConfig() {
    return {
      url: localStorage.getItem('sheets_url'),
      key: localStorage.getItem('sheets_api_key'),
    };
  },

  isConfigured() {
    const { url, key } = this.getConfig();
    return !!(url && key);
  },

  async _get(action, params = {}) {
    const { url, key } = this.getConfig();
    if (!url) throw new Error('Sheets URL not configured');
    const searchParams = new URLSearchParams({ action, key, ...params });
    const res = await fetch(`${url}?${searchParams}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async _post(action, data) {
    const { url, key } = this.getConfig();
    if (!url) throw new Error('Sheets URL not configured');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, key, ...data }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async sync() {
    if (!this.isConfigured()) return;

    // 1. Push queued changes
    const queue = Storage.getSyncQueue();
    if (queue.length > 0) {
      const logs = queue.filter(q => q.type === 'log').map(q => q.data);
      const stateUpdates = queue.filter(q => q.type === 'state');
      const painReports = queue.filter(q => q.type === 'pain').map(q => q.data);

      if (logs.length > 0) await this._post('saveLogs', { logs });
      if (stateUpdates.length > 0) await this._post('saveState', { state: Storage.getState() });
      for (const report of painReports) await this._post('reportPain', { report: report.data });

      Storage.clearSyncQueue();
    }

    // 2. Pull latest state
    try {
      const remoteState = await this._get('getState');
      if (remoteState && remoteState.updated_at) {
        const localState = Storage.getState();
        if (remoteState.updated_at > (localState.updated_at || '')) {
          Storage.saveState({ ...localState, ...remoteState });
        }
      }
    } catch (e) {
      console.warn('State sync failed:', e);
    }
  },
};
```

- [ ] **Step 2: Import in index.html and add auto-sync to app init**

```html
<script src="js/modules/sheets-api.js"></script>
```

Add to `init()` in app.js:
```javascript
// Auto-sync on startup
if (SheetsAPI.isConfigured() && navigator.onLine) {
  SheetsAPI.sync().catch(console.warn);
}
// Sync on coming back online
window.addEventListener('online', () => {
  if (SheetsAPI.isConfigured()) SheetsAPI.sync().catch(console.warn);
});
```

- [ ] **Step 3: Commit**

```bash
git add js/modules/sheets-api.js index.html js/app.js
git commit -m "feat: add Google Sheets sync module with offline queue"
```

---

### Task 14: Motivation Messages Module

**Files:**
- Create: `js/data/motivation.js`

- [ ] **Step 1: Create motivation.js — Context-aware messages**

```javascript
// js/data/motivation.js — Motivation messages
// 2026-04-03

const Motivation = {
  // Start messages
  start: [
    '오늘도 왔네요. 이미 절반은 한 겁니다.',
    '시작이 반이에요. 나머지 반은 끝내는 거죠.',
    '어제보다 한 발 더. 오늘의 목표입니다.',
    '당신의 몸은 기억하고 있어요. 다시 깨워봅시다.',
  ],

  // Set complete (with data)
  setComplete(exerciseName, reps, previousBest) {
    if (previousBest && reps > previousBest) {
      return `${exerciseName} ${reps}회 — 기록 갱신! (이전 최고: ${previousBest})`;
    }
    return `${exerciseName} ${reps}회 완료.`;
  },

  // Session complete
  sessionComplete(totalSets, weekCount) {
    return `총 ${totalSets}세트 완료. 이번 주 ${weekCount}회째입니다.`;
  },

  // Return after absence
  returnMessages: {
    2: '쉬는 것도 훈련입니다. 5분 스트레칭만 어때요?',
    3: (lastExercise, lastReps) =>
      `마지막에 ${lastExercise} ${lastReps}회를 해냈죠. 거기서 이어갈까요?`,
    7: '일주일 만이네요. 돌아온 것 자체가 대단합니다.',
    14: '2주 만이에요. 몸이 기다리고 있었을 거예요.',
  },

  getReturnMessage(daysSince, lastLog) {
    if (daysSince >= 14) return this.returnMessages[14];
    if (daysSince >= 7) return this.returnMessages[7];
    if (daysSince >= 3 && lastLog) {
      const exName = Exercises[lastLog.exercise]?.name || lastLog.exercise;
      return this.returnMessages[3](exName, lastLog.reps);
    }
    if (daysSince >= 2) return this.returnMessages[2];
    return null;
  },

  // Random start message
  getStartMessage() {
    return this.start[Math.floor(Math.random() * this.start.length)];
  },

  // Streak milestones
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
```

- [ ] **Step 2: Import in index.html**

```html
<script src="js/data/motivation.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add js/data/motivation.js index.html
git commit -m "feat: add context-aware motivation messages module"
```

---

### Task 15: Level-Up Check & Block Periodization Integration

**Files:**
- Create: `js/modules/gamification.js`
- Modify: `js/app.js` — integrate level-up check into session finish

- [ ] **Step 1: Create js/modules/gamification.js — Level-up evaluation**

```javascript
// js/modules/gamification.js — Level-up checks and phase transitions
// 2026-04-03

const Gamification = {
  // Check if user meets criteria for next phase
  // Returns { eligible: bool, nextPhase: string, criteria: [] } or null
  checkLevelUp(state) {
    const phase = state.current_phase;
    let criteriaKey;
    if (phase === 'intro') criteriaKey = 'intro_to_beginner';
    else if (phase === 'beginner') criteriaKey = 'beginner_to_intermediate';
    else if (phase === 'intermediate') criteriaKey = 'intermediate_to_advanced';
    else return null; // already advanced

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
        // For timed exercises, reps field stores seconds
        const maxSec = Math.max(0, ...exLogs.map(l => l.reps));
        met = maxSec >= test.value;
      } else if (test.metric === 'form_check') {
        // Form check — has exercise been performed at all in recent logs?
        met = exLogs.length >= 5; // at least 5 sets logged
      }

      return { ...test, met };
    });

    const allMet = results.every(r => r.met);
    return {
      eligible: allMet,
      nextPhase: criteria.to,
      criteria: results,
    };
  },

  // Get current block week info for periodization display
  getBlockInfo(state) {
    if (!state.last_workout_date) return Progressions.getBlockWeek(0);
    const start = state.training_start_date || state.last_workout_date;
    const weeksSince = Math.floor(
      (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return Progressions.getBlockWeek(weeksSince);
  },

  // Apply phase transition
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
```

- [ ] **Step 2: Integrate level-up check into finishSession() in workout page**

Add at the end of `finishSession()`, before `this.phase = 'done'`:

```javascript
    // Check level-up eligibility
    const levelUpResult = Gamification.checkLevelUp(Storage.getState());
    if (levelUpResult?.eligible) {
      this.levelUpInfo = levelUpResult;
      // Will show promotion prompt in 'done' phase
    }
```

Add `levelUpInfo: null` to initial data, and in the `done` template, add after badges section:

```html
    <!-- Level-up prompt -->
    <template x-if="levelUpInfo?.eligible">
      <div class="card card-highlight" style="margin-bottom:1rem; text-align:left;">
        <h4>🎉 단계 승급 가능!</h4>
        <p class="text-workout-sm" x-text="'모든 ' + Routines.phaseNames[levelUpInfo.nextPhase] + ' 진입 기준을 충족했습니다.'"></p>
        <div style="display:flex; gap:8px; margin-top:0.75rem;">
          <button @click="acceptLevelUp()" style="flex:1;">승급하기</button>
          <button @click="levelUpInfo = null" class="outline" style="flex:1;">나중에</button>
        </div>
      </div>
    </template>
```

Add `acceptLevelUp()` method:
```javascript
  acceptLevelUp() {
    if (this.levelUpInfo) {
      Gamification.applyPhaseUp(Storage.getState(), this.levelUpInfo.nextPhase);
      this.newBadges.push('phase_' + this.levelUpInfo.nextPhase);
      this.levelUpInfo = null;
    }
  },
```

- [ ] **Step 3: Show block week info on workout idle screen**

In the workout idle template, add after the split name:

```html
<p class="text-workout-sm" x-text="blockInfo.name + ' 주차 (RPE ' + blockInfo.rpe + ')'"></p>
```

Add to workoutPage:
```javascript
  get blockInfo() { return Gamification.getBlockInfo(this.state); },
```

- [ ] **Step 4: Import gamification.js in index.html**

```html
<script src="js/modules/gamification.js"></script>
```

- [ ] **Step 5: Commit**

```bash
git add js/modules/gamification.js index.html js/app.js
git commit -m "feat: add level-up check, phase transitions, and block periodization display"
```

---

### Task 16: Update Service Worker Cache & Final Polish

**Files:**
- Modify: `sw.js` — update STATIC_ASSETS with all files
- Modify: `index.html` — ensure all scripts are loaded in correct order

- [ ] **Step 1: Update sw.js STATIC_ASSETS**

```javascript
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data/exercises.js',
  './js/data/routines.js',
  './js/data/progressions.js',
  './js/data/motivation.js',
  './js/modules/storage.js',
  './js/modules/timer.js',
  './js/modules/safety.js',
  './js/modules/charts.js',
  './js/modules/sheets-api.js',
  './js/modules/gamification.js',
  './js/utils/wakelock.js',
  './js/utils/haptic.js',
  './manifest.json',
];
```

- [ ] **Step 2: Verify complete script load order in index.html**

```html
<!-- Utils (no dependencies) -->
<script src="js/utils/wakelock.js"></script>
<script src="js/utils/haptic.js"></script>
<!-- Data (no dependencies) -->
<script src="js/data/exercises.js"></script>
<script src="js/data/routines.js"></script>
<script src="js/data/progressions.js"></script>
<script src="js/data/motivation.js"></script>
<!-- Modules (may depend on data) -->
<script src="js/modules/storage.js"></script>
<script src="js/modules/timer.js"></script>
<script src="js/modules/safety.js"></script>
<script src="js/modules/charts.js"></script>
<script src="js/modules/sheets-api.js"></script>
<script src="js/modules/gamification.js"></script>
<!-- App (depends on everything above) -->
<script src="js/app.js"></script>
<!-- Alpine (must be last) -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

- [ ] **Step 3: End-to-end test**

1. Open app → Home dashboard renders
2. Navigate tabs → all 5 pages load
3. Start workout → warmup → exercise → set check → rest timer → RPE → session complete
4. Check History → calendar shows today's entry
5. Check Progress → stats updated, chart renders
6. Settings → toggle dark/light, export JSON
7. Safety alerts appear when appropriate

- [ ] **Step 4: Add .superpowers/ to .gitignore if not already**

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete bodyweight workout app v1 — all features integrated"
```

---

### Task 17: GitHub Pages Deployment

- [ ] **Step 1: Create GitHub repository**

```bash
cd f:/Apps_home/workout_routines
gh repo create workout-routines --public --source=. --push
```

- [ ] **Step 2: Enable GitHub Pages**

```bash
gh api repos/{owner}/workout-routines/pages -X POST -f source.branch=main -f source.path=/
```

Or: GitHub repo → Settings → Pages → Source: main branch, root (/)

- [ ] **Step 3: Verify deployment**

Visit `https://{username}.github.io/workout-routines/`
Expected: App loads, PWA installable, all features work.

- [ ] **Step 4: Commit any deployment fixes**

```bash
git add -A && git commit -m "fix: deployment adjustments for GitHub Pages"
git push
```
