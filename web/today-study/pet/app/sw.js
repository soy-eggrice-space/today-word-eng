const CACHE = 'pet-english-2';
const FILES = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.indexOf('pet-voice-') !== 0).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;

  const u = new URL(e.request.url);
  if (/\/bgm\//.test(u.pathname)) return;
  if (/\/voice\/[a-z0-9_]+\.mp3$/.test(u.pathname)) {
    const VC = 'pet-voice-' + (u.searchParams.get('v') || '0');
    e.respondWith(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('pet-voice-') === 0 && k !== VC).map(k => caches.delete(k)))).then(() => caches.open(VC)).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./'))));
});
