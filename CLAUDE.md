# Bodyweight Workout App

## Tech Stack
- Vanilla HTML/CSS/JS (no framework, no build)
- Single index.html — CSS/JS inline (GitHub Pages)
- 정적 데이터: repo `data/*.csv` (exercises, programs) — Apps Script가 raw로 fetch
- Google Sheets — 사용자 데이터 2 sheets (logs, user_config)
- Google Apps Script — API gateway (Code.gs)
- Pretendard font (CDN) or system font stack
- CSS custom properties for dark/light theming

## Architecture
- Online-first: no PWA, no ServiceWorker, no offline cache
- App shell has ZERO hardcoded data — everything fetched via Apps Script API
- **데이터 소스 분리 (2026-07-01)**:
  - **정적 데이터 (exercises, programs)** → repo `data/*.csv`가 원본. Apps Script가 GitHub **raw CSV에서 직접 fetch** (`fetchCsvAsObjects_`). CSV 푸시 = 앱 자동 반영(raw CDN ~5분), 수동 시트 동기화 불필요.
  - **사용자 데이터 (logs, user_config)** → Google Sheets 읽기/쓰기 (`getSheetData`/`handleConfigWrite`).
  - `exercises`/`programs` 시트는 vestigial(더 이상 안 읽음). Sheet UI 직접 편집 불가 — 프로그램/운동 변경은 CSV(git)로만.
- LocalStorage for session temp state only (current set progress)

## 데이터 스키마
- `data/exercises-v2.csv` (repo) — exercise DB (id, name, category, level, form_guide, video_url, progression_from/to, etc.)
- `data/programs-3month.csv` (repo) — schedule (date, **seq**, day_label, order, exercise_id, sets, reps, rest_sec, promotion_criteria, note). `seq` = 순차 진행 "하루" 일련번호(휴식일 포함). 앱은 날짜가 아닌 `current_seq` 커서 기준 "현재 하루" 표시. **행 순서 = 표시 순서**(order 컬럼은 표시용 메타, 정렬 안 함)
- Sheet `logs` — workout records (date, exercise_id, set_number, reps_done, note)
- Sheet `user_config` — key/value (current_level, start_date, **current_seq**). `current_seq` = 현재 일정 번호, 완료/건너뛰기 시 +1 (날짜 무관, 스킵해도 연속성 유지)

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
