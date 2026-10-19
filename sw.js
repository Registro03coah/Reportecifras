self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('macs-app-v11').then((cache) => {
      return cache.addAll([
        './index.html',
        './bd_madre.html',
        './reporte_acumulado.html',
        './reporte_campana.html',
        './reporte_dias.html',
        './reporte_semanal.html',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
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