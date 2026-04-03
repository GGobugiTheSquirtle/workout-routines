// js/modules/sheets-api.js — Google Sheets sync via Apps Script
// 2026-04-03 16:30

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
