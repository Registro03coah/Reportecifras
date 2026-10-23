self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('macs-app-v11').then((cache) => {
      return cache.addAll([
        './index.html',
        './vaciado.html',
        './reportes.html',
        './acumulado.html',
        './campana.html',
        './lunesasabado.json',
        './manifest.json',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
