// google-apps-script/Code.gs — API gateway for Bodyweight Workout App
// 2026-04-04 09:00
//
// Google Sheets 4시트 (exercises, programs, logs, user_config) CRUD API
//
// 배포 방법:
// 1. Google Sheets에서 새 스프레드시트 생성 (4시트: exercises, programs, logs, user_config)
// 2. Extensions → Apps Script 열기
// 3. 이 코드 붙여넣기
// 4. SPREADSHEET_ID를 실제 시트 ID로 교체 (URL의 /d/SPREADSHEET_ID/ 부분)
// 5. Deploy → New deployment → Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. 배포 URL을 복사하여 앱 Settings에서 입력

// ─── Configuration ───────────────────────────────────────────────────
const SPREADSHEET_ID = '1LrPw9XkbbvQ239G6VUtLwta3HowMthvDCFkGjNG-ADo';
const TIMEZONE = 'Asia/Seoul';

// ─── HTTP Handlers ───────────────────────────────────────────────────

/**
 * doGet — handles all read operations
 *
 * Endpoints:
 *   ?action=init              → exercises + today's programs + user_config (한번에)
 *   ?action=exercises         → full exercise DB
 *   ?action=programs&month=YYYY-MM → month's schedule
 *   ?action=logs&month=YYYY-MM     → month's workout records
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || '';

    switch (action) {
      case 'init':
        return jsonResponse(handleInit());

      case 'exercises':
        return jsonResponse(handleExercises());

      case 'programs':
        return jsonResponse(handlePrograms(e.parameter.month));

      case 'logs':
        return jsonResponse(handleLogs(e.parameter.month));

      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

/**
 * doPost — handles all write operations (JSON body)
 *
 * Endpoints:
 *   action=log    → append row to logs sheet
 *   action=config → upsert key/value in user_config sheet
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || '';

    switch (action) {
      case 'log':
        return jsonResponse(handleLogWrite(body));

      case 'config':
        return jsonResponse(handleConfigWrite(body));

      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ─── GET Handlers ────────────────────────────────────────────────────

/**
 * init — 앱 로드 시 한 번의 호출로 필요한 데이터 전부 반환
 * exercises 전체 + 오늘의 programs + user_config
 */
function handleInit() {
  const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');

  const exercises = getSheetData('exercises');
  const allPrograms = getSheetData('programs');
  const config = getConfigMap();

  // 순차 모드(seq 컬럼 존재): current_seq 커서가 가리키는 "하루"만 반환.
  //   완료 시 클라이언트가 current_seq를 +1 하여 다음 일정으로 진행 → 날짜와 무관, 스킵해도 연속성 유지.
  // 날짜 모드(레거시): seq 없으면 오늘 날짜 일정 반환.
  var hasSeq = allPrograms.some(function(r) { return r.seq !== '' && r.seq != null; });

  if (hasSeq) {
    var seqs = allPrograms
      .map(function(r) { return Number(r.seq); })
      .filter(function(n) { return !isNaN(n); });
    var totalDays = seqs.length ? Math.max.apply(null, seqs) : 0;

    var currentSeq = Number(config.current_seq) || 1;
    if (currentSeq < 1) currentSeq = 1;
    if (currentSeq > totalDays) currentSeq = totalDays;

    var dayPrograms = allPrograms.filter(function(r) {
      return Number(r.seq) === currentSeq;
    });
    var isRest = dayPrograms.every(function(r) { return !r.exercise_id; });
    var nextRows = allPrograms.filter(function(r) { return Number(r.seq) === currentSeq + 1; });
    var nextLabel = nextRows.length ? (nextRows[0].day_label || '') : '';

    return {
      exercises: exercises,
      programs: dayPrograms,
      user_config: config,
      today: today,
      current_seq: currentSeq,
      total_days: totalDays,
      is_rest: isRest,
      next_label: nextLabel,
    };
  }

  // 레거시 날짜 모드
  var todayPrograms = allPrograms.filter(function(row) { return row.date === today; });
  return {
    exercises: exercises,
    programs: todayPrograms,
    user_config: config,
    today: today,
  };
}

/**
 * exercises — 전체 운동 DB 반환
 */
function handleExercises() {
  return { exercises: getSheetData('exercises') };
}

/**
 * programs — 월별 스케줄 반환 (YYYY-MM 필터)
 */
function handlePrograms(month) {
  const allPrograms = getSheetData('programs');

  if (!month) {
    return { programs: allPrograms };
  }

  // month = "YYYY-MM" → 해당 월의 데이터만 필터
  var filtered = allPrograms.filter(function(row) {
    return row.date && row.date.substring(0, 7) === month;
  });

  return { programs: filtered };
}

/**
 * logs — 월별 운동 기록 반환 (YYYY-MM 필터)
 */
function handleLogs(month) {
  const allLogs = getSheetData('logs');

  if (!month) {
    return { logs: allLogs };
  }

  var filtered = allLogs.filter(function(row) {
    return row.date && row.date.substring(0, 7) === month;
  });

  return { logs: filtered };
}

// ─── POST Handlers ───────────────────────────────────────────────────

/**
 * log — logs 시트에 세트 기록 1행 추가 (append-only)
 *
 * Expected body fields:
 *   date         — YYYY-MM-DD (생략 시 오늘)
 *   exercise_id  — exercises.id 참조
 *   set_number   — 세트 번호 (1, 2, 3...)
 *   reps_done    — 실제 수행 횟수/시간
 *   note         — 메모 (선택)
 */
function handleLogWrite(body) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('logs');

  if (!sheet) {
    // 시트가 없으면 헤더와 함께 생성
    sheet = ss.insertSheet('logs');
    sheet.appendRow(['date', 'exercise_id', 'set_number', 'reps_done', 'note']);
  }

  var date = body.date || Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');

  sheet.appendRow([
    date,
    body.exercise_id || '',
    body.set_number || '',
    body.reps_done || '',
    body.note || '',
  ]);

  return { success: true, date: date };
}

/**
 * config — user_config 시트에 key-value 쌍 upsert
 * key가 이미 존재하면 value 업데이트, 없으면 새 행 추가
 *
 * Expected body fields:
 *   key   — 설정 키 (예: current_level, start_date)
 *   value — 설정 값
 */
function handleConfigWrite(body) {
  if (!body.key) {
    return { error: 'Missing required field: key' };
  }

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('user_config');

  if (!sheet) {
    // 시트가 없으면 헤더와 함께 생성
    sheet = ss.insertSheet('user_config');
    sheet.appendRow(['key', 'value']);
  }

  var data = sheet.getDataRange().getValues();
  var foundRow = -1;

  // 헤더(행 1) 건너뛰고 기존 key 검색
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.key)) {
      foundRow = i + 1; // Sheets는 1-based index
      break;
    }
  }

  if (foundRow > 0) {
    // 기존 key → value 업데이트
    sheet.getRange(foundRow, 2).setValue(body.value);
  } else {
    // 새 key → 행 추가
    sheet.appendRow([body.key, body.value]);
  }

  return { success: true, key: body.key, value: body.value };
}

// ─── Utility Functions ───────────────────────────────────────────────

/**
 * getSheetData — 시트 전체를 읽어 헤더 기반 오브젝트 배열로 반환
 *
 * @param {string} sheetName — 시트 이름
 * @returns {Object[]} — [{header1: val, header2: val, ...}, ...]
 *
 * 날짜(Date 타입) 셀은 YYYY-MM-DD (Asia/Seoul) 문자열로 변환
 */
function getSheetData(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return [];
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return []; // 헤더만 있거나 빈 시트
  }

  var headers = data[0].map(function(h) {
    return String(h).trim();
  });

  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var cell = data[i][j];
      // Date 객체 → YYYY-MM-DD 문자열 변환 (Asia/Seoul)
      if (cell instanceof Date) {
        cell = Utilities.formatDate(cell, TIMEZONE, 'yyyy-MM-dd');
      }
      obj[headers[j]] = cell;
    }
    rows.push(obj);
  }

  return rows;
}

/**
 * getConfigMap — user_config 시트를 key-value 맵으로 반환
 *
 * @returns {Object} — { key1: value1, key2: value2, ... }
 */
function getConfigMap() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('user_config');

  if (!sheet) {
    return {};
  }

  var data = sheet.getDataRange().getValues();
  var map = {};

  // 헤더(행 0) 건너뛰기
  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    if (key) {
      map[key] = data[i][1];
    }
  }

  return map;
}

/**
 * jsonResponse — JSON 형태의 TextOutput 생성
 *
 * @param {Object} data — 응답 데이터
 * @returns {TextOutput}
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── One-time Setup (수동 실행) ───────────────────────────────────────

/**
 * setupThreeMonthProgram — 3개월 입문(순차 seq) 프로그램을 시트에 일회성 import
 * // 2026-06-30
 *
 * GitHub raw에서 data/programs-3month.csv를 받아 'programs' 시트를 전체 교체하고,
 * user_config 에 current_seq=1 을 시드한다. logs/exercises 시트는 건드리지 않는다.
 *
 * 실행: Apps Script 편집기 상단 함수 드롭다운에서 setupThreeMonthProgram 선택 → ▶ 실행 (최초 1회).
 *       처음 실행 시 권한 승인(스프레드시트 + 외부 fetch) 팝업 → 허용.
 * ⚠️ PR 머지 후 실행할 것 — CSV가 master 브랜치에 있어야 fetch 성공.
 *
 * @returns {Object} { success, programRows }
 */
function setupThreeMonthProgram() {
  var CSV_URL = 'https://raw.githubusercontent.com/GGobugiTheSquirtle/workout-routines/master/data/programs-3month.csv';

  var resp = UrlFetchApp.fetch(CSV_URL, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) {
    throw new Error('CSV fetch 실패 (HTTP ' + resp.getResponseCode() + '): ' + CSV_URL);
  }

  var rows = Utilities.parseCsv(resp.getContentText()); // 따옴표/줄바꿈 필드 안전 파싱
  if (rows.length < 2) {
    throw new Error('CSV가 비어 있거나 헤더만 있음');
  }

  // setValues는 직사각형 배열 요구 → 행 폭을 헤더 기준으로 정규화
  var width = rows[0].length;
  var norm = rows.map(function(r) {
    var out = r.slice(0, width);
    while (out.length < width) out.push('');
    return out;
  });

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1) programs 시트 전체 교체 (값만 clear, 서식 유지)
  var sheet = ss.getSheetByName('programs');
  if (!sheet) {
    sheet = ss.insertSheet('programs');
  }
  sheet.clearContents();
  sheet.getRange(1, 1, norm.length, width).setValues(norm);

  // 2) current_seq=1 시드 (기존 값 있으면 1로 리셋 → 프로그램 처음부터)
  handleConfigWrite({ key: 'current_seq', value: 1 });

  var imported = norm.length - 1;
  Logger.log('완료: programs ' + imported + '행 import + current_seq=1 시드');
  return { success: true, programRows: imported };
}
