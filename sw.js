// sw.js — Service Worker 제거용 (자기 자신을 unregister + 캐시 전부 삭제)
// 이 파일이 로드되면 기존 캐시를 모두 지우고 자기 자신을 해제합니다.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
