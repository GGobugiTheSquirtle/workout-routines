// js/app.js — Alpine.js SPA core
// 2026-04-03 15:00

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    page: 'home',

    init() {
      // Hash router
      this.page = this.getPageFromHash();
      window.addEventListener('hashchange', () => {
        this.page = this.getPageFromHash();
      });

      // Set initial hash if none
      if (!window.location.hash) {
        window.location.hash = '#/home';
      }

      // Load theme preference
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
      }
    },

    getPageFromHash() {
      const hash = window.location.hash.replace('#/', '') || 'home';
      const valid = ['home', 'workout', 'history', 'progress', 'settings'];
      return valid.includes(hash) ? hash : 'home';
    },

    navigate(page) {
      window.location.hash = `#/${page}`;
    },

    // Theme toggle
    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    },
  }));
});
