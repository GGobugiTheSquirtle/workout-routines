// google-apps-script/Code.gs
// Deploy as Web App in Google Apps Script editor
// 2026-04-03 16:30
//
// Setup:
// 1. Google Sheets에서 새 스프레드시트 생성 → Sheet ID 복사 (URL의 /d/SHEET_ID/ 부분)
// 2. Extensions → Apps Script 열기
// 3. 이 코드 붙여넣기
// 4. SHEET_ID를 실제 시트 ID로 교체
// 5. API_KEY를 원하는 임의 문자열로 교체
// 6. Deploy → New deployment → Web app → Who has access: Anyone → Deploy
// 7. 배포 URL을 복사하여 앱 Settings에서 입력

const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const API_KEY = 'YOUR_API_KEY_HERE';

function doGet(e) {
  const action = e.parameter.action;
  const key = e.parameter.key;

  if (key !== API_KEY) {
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

  if (key !== API_KEY) {
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
    catch (e) { state[row[0]] = row[1]; }
  });
  return state;
}

function saveState(state) {
  const sheet = getOrCreateSheet('user_state', ['key', 'value', 'updated_at']);
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

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
