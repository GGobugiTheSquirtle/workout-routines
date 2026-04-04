# Bodyweight Workout App

## Tech Stack
- Vanilla HTML/CSS/JS (no framework, no build)
- Single index.html — CSS/JS inline (GitHub Pages)
- Google Sheets — 4 sheets (exercises, programs, logs, user_config)
- Google Apps Script — API gateway (Code.gs)
- Pretendard font (CDN) or system font stack
- CSS custom properties for dark/light theming

## Architecture
- Online-first: no PWA, no ServiceWorker, no offline cache
- App shell has ZERO hardcoded data — everything fetched from Sheets
- LocalStorage for session temp state only (current set progress)
- Apps Script doGet/doPost for all Sheets I/O

## Google Sheets Schema
- `exercises` — exercise database (id, name, category, level, form_guide, etc.)
- `programs` — monthly schedule (date, exercise_id, sets, reps, note)
- `logs` — workout records (date, exercise_id, set_number, reps_done, note)
- `user_config` — key/value settings (current_level, start_date, etc.)

## Conventions
- 한국어 UI, 영어 코드
- 모바일 우선 (breakpoint: max-width 700px)
- 터치 타겟: 최소 44px, 핵심 액션 64px
- 코드 변경 시 타임스탬프: // 2026-MM-DD HH:MM
- CSS 변수 기반 테마 (prefers-color-scheme 자동 전환)

## Agent Team
See `AGENTS.md` for 7 expert agent definitions:
- 🎼 오케스트레이터 — project orchestration
- 🧬 운동과학자 — exercise science
- 🏋️ 트레이너 — routine design, monthly schedules
- 🛡️ 폼 & 안전 — form guides, injury prevention
- 🔥 동기부여 코치 — motivation, progress review
- 💻 앱 개발자 — HTML/CSS/JS implementation
- 📐 커리큘럼 설계자 — 5-level roadmap

## Spec
docs/superpowers/specs/2026-04-04-bodyweight-workout-app-design.md

## Plan
docs/superpowers/plans/2026-04-04-bodyweight-workout-app.md
