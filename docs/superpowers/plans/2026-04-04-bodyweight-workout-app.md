# Bodyweight Workout App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bodyweight workout app (single HTML) that fetches all data from Google Sheets, with 4-tab navigation, premium dark/light design, and a 7-agent team definition.

**Architecture:** Single `index.html` (GitHub Pages) talks to Google Apps Script (`Code.gs`) which reads/writes 4 Google Sheets (exercises, programs, logs, user_config). No data is hardcoded in HTML. CSS variables power automatic dark/light theming via `prefers-color-scheme`.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework, no build), Google Apps Script, Google Sheets, Pretendard font, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-04-04-bodyweight-workout-app-design.md`

**Security note:** This is a single-user personal tool. All data comes from the user's own Google Sheets. innerHTML is used for rendering — data source is trusted (user-controlled Sheets). No untrusted external input.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `AGENTS.md` | 7-agent team definitions |
| `CLAUDE.md` | Project conventions, tech stack, agent references |
| `google-apps-script/Code.gs` | Apps Script API gateway for Sheets CRUD |
| `index.html` | Complete app — CSS design system + tab router + 4 tab UIs + API client (all inline) |
| `data/*.csv` | Initial data for Google Sheets import (not served by app) |
| `.gitignore` | Ignore .env and other non-deploy files |

---

### Task 1: Project Foundation — AGENTS.md

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Create AGENTS.md**

Create the complete agent team file with 7 agents: Orchestrator, Exercise Scientist, Trainer, Form & Safety Expert, Motivation Coach, App Developer, Curriculum Designer. Each agent has: icon, role summary, core responsibilities, knowledge domain, when to adopt, and collaboration rules. Include common principles (safety first, data-driven, user final decision) and the agent selection guide with task-to-agent mapping.

Reference the spec Section 5 for the full agent definitions and workflows.

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "feat: add 7-agent team definitions for workout project"
```

---

### Task 2: Update CLAUDE.md + .gitignore

**Files:**
- Modify: `CLAUDE.md`
- Create: `.gitignore`

- [ ] **Step 1: Update CLAUDE.md**

Replace with current tech stack (Vanilla HTML/CSS/JS, Google Sheets, Apps Script), architecture decisions (online-first, no PWA, app shell has zero hardcoded data), conventions (Korean UI, English code, mobile-first, timestamps), and agent team references.

- [ ] **Step 2: Create .gitignore**

```
.env
.DS_Store
node_modules/
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .gitignore
git commit -m "chore: update CLAUDE.md for new architecture, add .gitignore"
```

---

### Task 3: Google Apps Script — Code.gs

**Files:**
- Create: `google-apps-script/Code.gs`

- [ ] **Step 1: Create Code.gs with all API handlers**

Implement the Apps Script API gateway with these handlers:

**doGet endpoints:**
- `?action=init` — returns exercises + today's programs + user_config in one call
- `?action=exercises` — full exercise DB
- `?action=programs&month=YYYY-MM` — month's schedule
- `?action=logs&month=YYYY-MM` — month's workout records

**doPost endpoints:**
- `action=log` — append row to logs sheet (date, exercise_id, set_number, reps_done, note)
- `action=config` — upsert key/value in user_config sheet

**Utilities:**
- `getSheetData(sheetName)` — reads sheet, returns array of row objects (headers as keys, dates formatted as YYYY-MM-DD)
- `getConfigMap()` — reads user_config as key-value map
- All responses return JSON via ContentService
- Errors return `{ error: "message" }`
- Date formatting uses Asia/Seoul timezone

- [ ] **Step 2: Commit**

```bash
git add google-apps-script/Code.gs
git commit -m "feat: add Google Apps Script API gateway for Sheets CRUD"
```

---

### Task 4: HTML App Shell + Design System

**Files:**
- Create: `index.html`

This task creates the foundation. All subsequent tasks add to this file.

- [ ] **Step 1: Create index.html with complete app shell**

The file must include ALL of the following inline:

**HTML head:**
- meta charset, viewport (width=device-width, initial-scale=1.0, viewport-fit=cover)
- title: 맨몸운동
- Pretendard font CDN link

**CSS design system (inline `<style>`):**

Apply taste-skill principles — premium typography, precise spacing on 4px grid, hardware-accelerated animations, no generic AI aesthetics.

Variables (`:root`):
- Colors: bg-primary/secondary/tertiary, text-primary/secondary/tertiary, accent, accent-soft, success, success-soft, warning, border, border-subtle
- Light defaults: bg-primary #FAFAFA, accent #4F46E5, text-primary #1A1A1A
- Spacing: 4px grid (space-1 through space-12)
- Typography: Pretendard Variable font stack, sizes xs through 3xl, weights normal/medium/semibold/bold
- Radius: sm(6px)/md(10px)/lg(14px)/xl(20px)/full(9999px)
- Shadows: sm/md/lg
- Transitions: ease-out cubic-bezier(0.16,1,0.3,1), duration-fast(150ms)/normal(250ms)
- Tab height: 64px

Dark mode (`@media (prefers-color-scheme: dark)`):
- bg-primary #0A0A0A, bg-secondary #141414, bg-tertiary #1C1C1C
- text-primary #F5F5F5, text-secondary #A0A0A0
- accent #818CF8, accent-soft #1E1B4B
- border #2A2A2A, shadows with more opacity

Base styles: box-sizing reset, html font smoothing, body bg/color/min-height, scrollbar thin styling

Layout: #app flex column min-height 100dvh, #app-header sticky top with app title, #main flex-1 with bottom padding for tab bar + safe area

Tab system: .tab-content display none, .tab-content.active display block with fadeIn animation

Tab bar: #tab-bar fixed bottom, bg-secondary, border-top, flex space-around, safe-area padding. .tab-btn flex column center with svg icons, .tab-btn.active color accent

Loading: #loading centered spinner + text. .spinner 32px border animation

Setup card: .setup-card centered max-width 400px with URL input and save button

Responsive: @media min-width 700px centers #main at max-width 500px

**HTML body structure:**
```
div#loading (spinner + text)
div#app (hidden initially)
  header#app-header (title + subtitle)
  main#main
    section#tab-today.tab-content.active
    section#tab-curriculum.tab-content
    section#tab-records.tab-content
    section#tab-guide.tab-content
  nav#tab-bar (4 buttons with inline SVG icons: play, list, calendar, book)
```

**JS (inline `<script>`):**

State object:
```javascript
const state = {
  exercises: [], todayProgram: [], config: {}, logs: [], programs: [],
  today: '', activeTab: 'today', sessionProgress: {},
  exerciseMap: {}, guideFilter: '전체', guideScrollTo: null,
  recordsMonth: null, recordsDate: null
};
```

API client: object with methods init(), getPrograms(month), getLogs(month), getExercises(), postLog(data), postConfig(key,value). All use fetch with the stored API URL.

Tab router: switchTab(name) updates DOM classes, hash, calls renderTab(). Hash change listener. Tab bar click delegation.

initApp(): fetch API_URL from localStorage, call api.init(), populate state, build exerciseMap, init sessionProgress, hide loading, show app, handle initial hash.

showSetup() / saveSetup(): if no API URL, show setup card with URL input.

Placeholder render functions (implemented in tasks 5-8):
```javascript
function renderToday() {}
function renderCurriculum() {}
function renderRecords() {}
function renderGuide() {}
```

Utility: formatDateKR(dateStr) returns Korean formatted date string.

- [ ] **Step 2: Open in browser to verify**

Expected: loading screen → setup card (no API URL yet). Tab bar visible. Dark/light follows system.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add app shell with design system, tab router, and API client"
```

---

### Task 5: "오늘" Tab — Workout List

**Files:**
- Modify: `index.html` — add CSS classes, replace renderToday()

- [ ] **Step 1: Add workout card styles and implement renderToday()**

**CSS to add** (inside existing `<style>` block):
- .today-header: padding, h2 bold, .day-meta small secondary
- .workout-list: flex column, gap
- .workout-card: bg-secondary, border, radius-lg, padding, transition. States: .is-current (accent border + accent-soft box-shadow), .is-done (opacity 0.5), .is-pending (opacity 0.7)
- .workout-card-header: flex space-between
- .workout-name: semibold, cursor pointer, active changes to accent color
- .now-badge: xs text, accent on accent-soft bg, pill shape
- .workout-meta: sm text, secondary color
- .set-indicators: flex row of .set-dot circles (28px, border). .set-dot.done: success bg, white checkmark
- .btn-complete: full width, accent bg, white text, 48px min-height, scale(0.97) on active. :disabled uses border bg. .all-done uses success bg
- .note-input: full width textarea, border, bg-tertiary, focus accent border
- .rest-day: centered text with padding
- .complete-banner: centered, success-soft bg, success text

**renderToday() logic:**
1. Get todayProgram from state. If empty → show rest day message
2. Show header (day_label + level + formatted date)
3. Check if all exercises done → show complete banner
4. Find currentIdx = first exercise with incomplete sets
5. For each program entry:
   - Get exercise details from exerciseMap
   - Get progress array from sessionProgress
   - Determine status class (is-done/is-current/is-pending)
   - Render card with: order number + name (clickable → guide), meta (sets x reps + muscles), set indicators (dots), and for current: complete button + note textarea
6. Clicking exercise name calls navigateToGuide(exerciseId)

**completeSet(exerciseId) logic:**
1. Find next incomplete set index in sessionProgress
2. Mark it true
3. Get note from textarea
4. POST to api.postLog({date, exercise_id, set_number, reps_done, note})
5. Re-render today tab

**navigateToGuide(exerciseId):** sets state.guideScrollTo, calls switchTab('guide')

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: implement Today tab with workout list and set tracking"
```

---

### Task 6: "가이드" Tab — Exercise Guide

**Files:**
- Modify: `index.html` — add CSS, replace renderGuide()

- [ ] **Step 1: Add guide styles and implement renderGuide()**

**CSS to add:**
- .guide-filters: flex row, horizontal scroll, gap. .filter-chip: pill buttons, .active gets accent bg
- .guide-list: flex column, gap
- .guide-card: bg-secondary, border, radius-lg, overflow hidden. .guide-card-header: flex between, cursor pointer. .guide-card-body: hidden by default, shown when .open class
- .chevron: rotates 180deg when .open
- .guide-section: margin bottom, .guide-section-title: sm semibold accent color
- .guide-section ul: no list-style, li with dot pseudo-element
- .guide-progression: flex wrap with arrows between exercise names, .current highlighted

**renderGuide() logic:**
1. Category filter chips: 전체/Push/Pull/Legs/Core/Swing
2. Filter exercises by selected category
3. For each exercise: render accordion card with header (name, level/category/equipment tags, chevron)
4. Card body sections: muscles, form guide, common mistakes, safety notes, progression chain, video link
5. Form guide / mistakes / safety: split by newline, render as list items
6. Progression chain: walk from chain start via progression_from/to, highlight current exercise
7. If guideScrollTo is set, scroll to that card and open it

**Helper functions:**
- setGuideFilter(cat): updates state.guideFilter, re-renders
- toggleGuideCard(id): toggles .open class on card
- renderProgressionChain(ex): builds full chain from exerciseMap, returns HTML

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: implement Guide tab with exercise cards and filters"
```

---

### Task 7: "커리큘럼" Tab — Level Roadmap

**Files:**
- Modify: `index.html` — add CSS, replace renderCurriculum()

- [ ] **Step 1: Add curriculum styles and implement renderCurriculum()**

**CSS to add:**
- .curriculum-header: padding, h2 bold
- .level-list: flex column, gap
- .level-card: bg-secondary, border, radius-lg. .is-current: accent border. .is-locked: opacity 0.5
- .level-card-header: flex between, cursor pointer. .level-badge: pill, .current accent, .locked tertiary
- .level-card-body: hidden by default, shown when .open
- .level-exercises: flex column. .level-exercise-row: flex between, sm text, border-bottom
- .progress-bar-container: bg-tertiary, radius, padding. .progress-bar: 6px height. .progress-bar-fill: accent bg, animated width
- .promotion-box: accent-soft bg, centered, with .btn-levelup button

**renderCurriculum() logic:**
1. Get currentLevel from config
2. Group exercises by level
3. Level names: 1=기초체력, 2=기본근력, 3=중급, 4=상급, 5=고급
4. For each level 1-5:
   - Status: current/completed/locked
   - Accordion card: header (level name + badge), auto-open current level
   - Body: exercise list by category (push/pull/legs/core/swing)
   - For current level: progress bar (calculateLevelProgress) + promotion box if >= 80%
5. "레벨 업" button calls levelUp() with confirm dialog

**calculateLevelProgress(level):** Count level's exercises that have >= 3 logged sessions. Return percentage.

**levelUp():** confirm → api.postConfig('current_level', newLevel) → update state → re-render

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: implement Curriculum tab with level roadmap"
```

---

### Task 8: "기록" Tab — Calendar & Journal

**Files:**
- Modify: `index.html` — add CSS, replace renderRecords()

- [ ] **Step 1: Add records styles and implement renderRecords()**

**CSS to add:**
- .records-header: flex between, h2 bold. .month-nav: flex with prev/next buttons and month label
- .mini-calendar: 7-column grid. .day-name: xs tertiary text. .day-cell: centered, cursor pointer, min-height 36px. .day-cell.today: bold accent. .day-cell.selected: accent bg white text. .day-cell.has-workout: dot pseudo-element after
- .journal-section: padding. .journal-date: semibold. .journal-empty: centered tertiary
- .journal-exercise: bg-secondary card. .journal-exercise-name: semibold. .journal-set-row: flex between. .journal-note: xs accent with memo icon
- .journal-summary: bg-tertiary card with total volume

**renderRecords() logic:**
1. Track state.recordsMonth and state.recordsDate (default to current)
2. Header: month label with prev/next buttons
3. renderMiniCalendar(year, month): 7-column grid, empty cells before first day, each day cell with today/selected/has-workout classes. Click selects date.
4. renderJournal(dateStr): filter logs by date, group by exercise_id, show each exercise's sets with reps_done and notes. Show planned reps from programs if available. Total volume summary.

**changeMonth(delta):** adjust month, fetch new logs and programs from API, re-render.

**selectDate(dateStr):** update state.recordsDate, re-render.

**Update initApp():** After init call, also fetch full month logs and programs:
```javascript
const month = state.today.substring(0, 7);
const [logsData, programsData] = await Promise.all([
  api.getLogs(month), api.getPrograms(month)
]);
if (logsData.logs) state.logs = logsData.logs;
if (programsData.programs) state.programs = programsData.programs;
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: implement Records tab with calendar and journal"
```

---

### Task 9: Initial Google Sheets Data

**Files:**
- Create: `data/initial-exercises.csv`
- Create: `data/initial-programs-april.csv`
- Create: `data/initial-user-config.csv`

These CSV files are imported into Google Sheets to populate initial data. NOT served by the app.

- [ ] **Step 1: Create initial exercises CSV (Level 1-2)**

Columns: id, name, category, equipment, level, muscles_primary, muscles_secondary, form_guide, common_mistakes, safety_notes, progression_from, progression_to, video_url

Level 1 exercises (5):
- pushup_incline (push, 푸쉬업바, L1) → pushup_standard
- dip_assisted (push, 치닝디핑, L1) → dip_standard
- dead_hang (pull, 치닝디핑, L1) → pullup_negative
- squat_band (legs, 밴드, L1) → squat_bodyweight
- plank_standard (core, 요가매트, L1) → plank_side
- kb_swing_12 (swing, 케틀벨12, L1) → kb_swing_16

Level 2 exercises (6):
- pushup_standard, pullup_negative, squat_bodyweight, plank_side, dip_standard, kb_swing_16

Each with complete form_guide, common_mistakes, safety_notes (newline-separated points).

- [ ] **Step 2: Create user_config CSV**

```csv
key,value
current_level,1
start_date,2026-04-04
```

- [ ] **Step 3: Create sample programs CSV (first week of April)**

A-B-R-A-B-R-R pattern starting 2026-04-06 (Monday). Each workout day has 4 exercises with sets/reps appropriate for Level 1 beginner. Include promotion_criteria and coach notes.

- [ ] **Step 4: Commit**

```bash
git add data/
git commit -m "feat: add initial exercise database and sample schedule for Sheets import"
```

---

### Task 10: Polish & Integration Testing

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Verify all styles are present**

Ensure the complete CSS is in place: reset, layout, all tab-specific styles, responsive, scrollbar. Apply taste-skill review: check for generic AI patterns, verify spacing consistency, typography hierarchy, color usage.

- [ ] **Step 2: End-to-end verification**

1. Create Google Sheet with 4 tabs (exercises/programs/logs/user_config) matching spec headers
2. Import CSV data from `data/` folder
3. Open Apps Script editor, paste Code.gs, deploy as Web App
4. Open index.html, enter Web App URL, save
5. Verify all 4 tabs render correctly with real data
6. Test set completion (Today tab) → confirm row appears in Sheets logs
7. Test month navigation (Records tab)
8. Test dark/light mode toggle
9. Test on mobile viewport

- [ ] **Step 3: Final commit**

```bash
git add index.html
git commit -m "feat: polish design and complete integration"
```

---

## Task Summary

| Task | What | Files |
|------|------|-------|
| 1 | Agent team definitions | AGENTS.md |
| 2 | Project conventions | CLAUDE.md, .gitignore |
| 3 | Google Apps Script API | google-apps-script/Code.gs |
| 4 | HTML shell + design system + tab router | index.html |
| 5 | Today tab — workout list with set tracking | index.html |
| 6 | Guide tab — exercise cards with filter | index.html |
| 7 | Curriculum tab — level roadmap | index.html |
| 8 | Records tab — calendar + journal | index.html |
| 9 | Initial Sheets data (CSV) | data/*.csv |
| 10 | Polish + integration test | index.html |
