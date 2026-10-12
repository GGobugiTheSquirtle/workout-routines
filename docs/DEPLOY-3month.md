# 배포 / 업데이트 가이드 — 3개월 입문(순차 seq) 프로그램

> **현재 라이브 상태** (2026-07-01): Pages + Apps Script(@5) + 데이터 모두 배포 완료.
> 앱 URL: https://ggobugithesquirtle.github.io/workout-routines/

## 데이터 소스 구조 (핵심)

| 데이터 | 소스 | 변경 방법 | 반영 |
|---|---|---|---|
| exercises, programs | repo `data/*.csv` | git 커밋+푸시 (master) | **자동** — 앱이 GitHub Pages에서 CSV 직접 fetch (Pages 빌드 ~1분, 2026-07-10~) |
| logs, current_seq 등 | Google Sheets | 앱에서 기록 / config API | 즉시 |

**→ 프로그램·운동 데이터 변경은 CSV 푸시만 하면 끝. 수동 시트 동기화 불필요.**

---

## 시나리오별 절차

### A. 프로그램/운동 데이터만 변경 (대부분의 경우)
1. `data/programs-3month.csv` 또는 `data/exercises-v2.csv` 수정
2. `git commit && git push origin master`
3. 끝. Pages 빌드(~1분) 후 앱 새로고침 시 반영. (레거시 `action=init`만 raw CDN ~5분 캐시)
4. 일정표 문서 `docs/3month-schedule.md`도 CSV 기준으로 다시 생성해 함께 커밋.

### B. Code.gs (API 로직) 변경
clasp 인증돼 있으면 자동:
```
cd google-apps-script
npx @google/clasp push -f
npx @google/clasp deploy -i AKfycby_0_keb2239-sOTSJTZXhXFW-7tgX6fa9_QrXI20zRxPTQ4Ht19yPi5qnteG8FMk2- -d "설명"
```
→ 프로덕션 URL 유지된 채 새 버전 배포. (수동: 편집기에 붙여넣기 → Manage deployments → New version)

### C. index.html (프론트) 변경
`git push origin master` → GitHub Pages 자동 빌드 (~1분).

### D. 신규 스프레드시트로 처음 세팅할 때만
`user_config`에 `current_seq`가 없으면 앱이 안 뜬다. 최초 1회만:
- Apps Script 편집기 → `setupThreeMonthProgram` ▶ Run (current_seq=1 시드, idempotent — 이미 있으면 no-op이라 진행도 안 날아감)
- 또는 `user_config` 시트에 행 추가: `current_seq | 1`

### E. 프로그램을 통째로 교체할 때 (예: 2026-10 v1 주 6일 → v2 A/B 48세션)
`current_seq`는 순번 커서라 새 CSV에서도 같은 번호를 가리킨다. 처음부터 시작하려면:
1. 새 CSV가 master에 반영된 **직후** `user_config` 시트의 `current_seq` 값을 `1`로 수정
2. 앱 새로고침 → `Day 1 / 48` 확인
(반영 전에 리셋하면 옛 프로그램 Day 1이 보이고, 그 상태에서 진행하면 커서가 다시 올라감)

---

## 검증
```
curl -sL ".../exec?action=init" | jq '{ex:(.exercises|length), seq:.current_seq, days:.total_days}'
```
- exercises 69, current_seq 존재, total_days 48 이면 정상 (`action=init`은 레거시 경로)
- 앱 새로고침 → 현재 seq의 일정 + 운동별 지정 영상 표시
- 완료/건너뛰기 → current_seq +1

문제 시:
- 데이터 안 바뀜 → Pages 빌드 완료 대기 후 강력 새로고침 (레거시 init은 raw CDN ~5분)
- 앱 안 뜸 → user_config에 current_seq 있는지 (시나리오 D)
- 옛 동작 → Code.gs 최신 배포됐는지 (`clasp list-deployments`로 @버전 확인)
