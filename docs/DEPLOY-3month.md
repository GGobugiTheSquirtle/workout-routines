# 배포 가이드 — 3개월 입문(순차 seq) 프로그램

> 코드(index.html / Code.gs)와 데이터(programs-3month.csv)는 repo에 완성돼 있다.
> 앱은 **Google Sheet에서 읽으므로**, 아래 3단계를 거쳐야 실제로 동작한다.
> 순서대로 1회만 수행하면 된다.

---

## 1. PR 머지 (repo → master 반영)

`setupThreeMonthProgram()`이 `master` 브랜치의 CSV를 fetch하므로 **머지가 먼저**다.

- GitHub PR #1 → **Merge** (또는 로컬에서 master로 머지 후 push)

확인: `https://raw.githubusercontent.com/GGobugiTheSquirtle/workout-routines/master/data/programs-3month.csv` 가 200으로 열리면 OK.

---

## 2. Apps Script 재배포 (seq 로직 활성화)

`Code.gs`의 doGet/doPost가 순차 모드(seq 커서) 로직으로 바뀌었으므로 **재배포 필수**.

1. 스프레드시트 → **Extensions → Apps Script**
2. `Code.gs` 내용을 repo 최신본으로 **전체 교체** (붙여넣기)
3. **Deploy → Manage deployments → (기존 웹앱) → Edit(연필) → Version: New version → Deploy**
   - 새 deployment를 만들면 URL이 바뀌어 앱 설정도 바꿔야 하니, **기존 deployment를 New version으로 갱신**하는 게 편하다.

> URL은 index.html에 하드코딩돼 있음(`API_URL`). 기존 deployment를 갱신하면 URL 유지 → 앱 수정 불필요.

---

## 3. exercises + programs 시트 채우기 + current_seq 시드

Apps Script 편집기에서 일회용 함수 실행:

1. 상단 함수 드롭다운에서 **`setupThreeMonthProgram`** 선택
2. **▶ Run**
3. 최초 실행 시 권한 승인 팝업 (스프레드시트 접근 + 외부 fetch) → **허용**
4. 실행 로그에 `완료: exercises 65행 + programs 246행 import + current_seq=1 시드` 뜨면 성공

이 함수가 하는 일:
- `exercises` 시트를 최신본(65종, 신규 운동 + 큐레이션 영상 URL)으로 **전체 교체**
  → 신규 운동(고블릿/클린&프레스/겟업) 고아참조 방지 + 영상 링크 반영
- `programs` 시트를 3개월 프로그램(246행, seq 1~84)으로 **전체 교체**
- `user_config`에 `current_seq = 1` 시드 (처음부터 시작)
- `logs` 시트와 user_config의 다른 사용자 데이터는 **건드리지 않음**

### 수동 대안 (스크립트 실행이 꺼려지면)
- `exercises` 시트 → **File → Import → Upload → `data/exercises-v2.csv` → "Replace current sheet"**
- `programs` 시트 → **File → Import → Upload → `data/programs-3month.csv` → "Replace current sheet"**
- `user_config` 시트 → 행 추가: `current_seq | 1`

---

## 4. 검증

앱을 새로고침하면:
- Today 탭에 **Day 1 / 84** 와 "Day 1 - Push A" 운동 3종 표시
- 완료 또는 "건너뛰고 다음 일정으로" → `current_seq`가 +1 되며 다음 일정으로 이동
- 휴식일(seq 7, 14...)은 "휴식일" 화면 + "휴식 완료 — 다음 일정으로" 버튼

문제 시 체크:
- exercises 시트에 `video_url` 컬럼 존재 여부 (영상 링크용)
- user_config에 `current_seq` 행 존재 여부
- 웹앱이 **New version**으로 재배포됐는지 (구버전이면 날짜 모드로 동작)
