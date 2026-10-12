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
  - **정적 데이터 (exercises, programs)** → repo `data/*.csv`가 원본. 앱(`index.html`)이 GitHub Pages에서 **same-origin으로 직접 fetch** (`fetchCsvObjects`, 2026-07-10~). master 푸시 = Pages 빌드 후 자동 반영, 수동 시트 동기화 불필요. (Code.gs `fetchCsvAsObjects_`는 레거시 `init` 호환용으로만 raw CSV fetch)
  - **사용자 데이터 (logs, user_config)** → Google Sheets 읽기/쓰기 (`getSheetData`/`handleConfigWrite`).
  - `exercises`/`programs` 시트는 vestigial(더 이상 안 읽음). Sheet UI 직접 편집 불가 — 프로그램/운동 변경은 CSV(git)로만.
- LocalStorage for session temp state only (current set progress)

## 데이터 스키마
- `data/exercises-v2.csv` (repo) — exercise DB (id, name, category, level, form_guide, video_url, progression_from/to, etc.)
- `data/programs-3month.csv` (repo) — schedule (date, **seq**, day_label, order, exercise_id, sets, reps, rest_sec, promotion_criteria, note). `seq` = 순차 진행 "하루" 일련번호(휴식일 포함). 앱은 날짜가 아닌 `current_seq` 커서 기준 "현재 하루" 표시. **행 순서 = 표시 순서**(order 컬럼은 표시용 메타, 정렬 안 함)
  - **v2 (2026-10-12~, 꾸준함 우선)**: A/B 교대 48 seq (12단계 × A·B·A·B), **휴식일 행 없음** — 앱은 항상 다음 운동 표시. 최소 주 2회(권장일 화 A·수 B), 주 4회까지. A = 밀기·코어 + 스윙 EMOM, B = 당기기·하체 + 파워 스윙. 일정표: `docs/3month-schedule.md` (CSV에서 생성). v1(주 6일)은 `archive/`
  - `note` = `단계 목표 | 세션 안내 | 운동별 요령` 3칸 (` | ` 구분). 앱 Today 헤더에 앞 두 칸, 운동 카드에 마지막 칸 표시
  - `reps`는 정수 또는 `N초`만 (앱 스테퍼 `^\d+(초)?$`). 한 세션 안에 같은 `exercise_id` 중복 금지 (세션 진행상태 키)
- `archive/` — 앱이 읽지 않는 이전 버전 CSV·문서 보관
- Sheet `logs` — workout records (date, exercise_id, set_number, reps_done, note)
  - **몸 기록 (2026-10-12~)**: 같은 시트에 `exercise_id`가 `body_weight`(kg) / `body_waist`(cm, 갈비뼈 맨 아래~골반뼈 맨 위 중간 지점 기준)인 행, `set_number`=1, `reps_done`=측정값. 날짜당 마지막 값 유효. 앱은 boot 직후 `body_*` 행을 `state.bodyLogs`로 분리 → 운동 집계·캘린더에 섞이지 않음. 입력·표시는 기록 탭 '몸 기록' 카드 (Code.gs 변경 없음)
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
