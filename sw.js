// sw.js — Service Worker
// 2026-04-03 15:00

const CACHE_NAME = 'workout-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Cache First for static, Network First for API
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network First for Google Apps Script API
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache First for everything else
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
