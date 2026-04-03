// js/utils/wakelock.js — Screen wake lock for workout sessions
// 2026-04-03 15:30

const WakeLock = {
  _lock: null,

  async acquire() {
    if ('wakeLock' in navigator) {
      try {
        this._lock = await navigator.wakeLock.request('screen');
      } catch (e) { /* ignore if not supported */ }
    }
  },

  async release() {
    if (this._lock) {
      await this._lock.release();
      this._lock = null;
    }
  },
};
