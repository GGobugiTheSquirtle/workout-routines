# 배포 / 업데이트 가이드 — 3개월 입문(순차 seq) 프로그램

> **현재 라이브 상태** (2026-07-01): Pages + Apps Script(@5) + 데이터 모두 배포 완료.
> 앱 URL: https://ggobugithesquirtle.github.io/workout-routines/

## 데이터 소스 구조 (핵심)

| 데이터 | 소스 | 변경 방법 | 반영 |
|---|---|---|---|
| exercises, programs | repo `data/*.csv` | git 커밋+푸시 (master) | **자동** — Apps Script가 raw CSV 직접 fetch (raw CDN ~5분) |
| logs, current_seq 등 | Google Sheets | 앱에서 기록 / config API | 즉시 |

**→ 프로그램·운동 데이터 변경은 CSV 푸시만 하면 끝. 수동 시트 동기화 불필요.**

---

## 시나리오별 절차

### A. 프로그램/운동 데이터만 변경 (대부분의 경우)
1. `data/programs-3month.csv` 또는 `data/exercises-v2.csv` 수정
2. `git commit && git push origin master`
3. 끝. ~5분 내 앱에 자동 반영 (raw CDN 캐시). 급하면 raw URL을 브라우저에서 한 번 열어 캐시 갱신 유도.

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

---

## 검증
```
curl -sL ".../exec?action=init" | jq '{ex:(.exercises|length), seq:.current_seq, days:.total_days}'
```
- exercises 65, current_seq 존재, total_days 84 면 정상
- 앱 새로고침 → 현재 seq의 일정 + 운동별 지정 영상 표시
- 완료/건너뛰기 → current_seq +1

문제 시:
- 데이터 안 바뀜 → raw CDN 캐시(~5분) 대기, 또는 raw URL 직접 열기
- 앱 안 뜸 → user_config에 current_seq 있는지 (시나리오 D)
- 옛 동작 → Code.gs 최신 배포됐는지 (`clasp list-deployments`로 @버전 확인)
