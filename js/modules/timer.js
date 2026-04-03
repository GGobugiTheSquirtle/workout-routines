// js/modules/timer.js — Rest timer with auto-start
// 2026-04-03 15:30

const Timer = {
  _interval: null,

  start(seconds, onTick, onDone) {
    this.stop();
    let remaining = seconds;
    onTick(remaining);

    this._interval = setInterval(() => {
      remaining--;
      onTick(remaining);
      if (remaining <= 0) {
        this.stop();
        Haptic.heavy();
        if (onDone) onDone();
      }
    }, 1000);
  },

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },
};
