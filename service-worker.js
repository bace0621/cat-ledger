const CACHE_NAME = 'cat-ledger-v1';
const URLS_TO_CACHE = [
  '/cat-ledger/',
  '/cat-ledger/index.html',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Noto+Sans+TC:wght@400;500;700&family=DM+Sans:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
];

// 安裝：快取核心檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 啟動：清除舊快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 請求攔截：網路優先，失敗用快取
self.addEventListener('fetch', event => {
  // Google API 和 Sheets 不快取
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('script.google.com') ||
      event.request.url.includes('accounts.google.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
