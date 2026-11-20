// 단어키우기 웹앱: 한 번 열면 인터넷 없이도 열려요. 새 버전이 올라오면 다음에 열 때 바뀌어요
const C = 'daneokiugi-0.1.19', FILES = ["./", "app.css", "chal.js", "core.js", "data.js", "fonts/GumiRomance.otf", "fonts/NoonnuBasicGothic.ttf", "ground.js", "icons/apple-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/mask-512.png", "index.html", "manifest.webmanifest", "report.js", "screens.js", "study.js", "titles.js", "village.js", "web.js", "words.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('daneokiugi-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))); });
