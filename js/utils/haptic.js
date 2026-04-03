// js/utils/haptic.js — Haptic feedback utility
// 2026-04-03 15:30

const Haptic = {
  light()  { navigator.vibrate?.(30); },
  medium() { navigator.vibrate?.(50); },
  heavy()  { navigator.vibrate?.([50, 30, 50]); },
};
