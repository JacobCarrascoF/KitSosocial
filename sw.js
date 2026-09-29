/* Kit Sosocial — service worker: guarda la app para que funcione sin internet.
   IMPORTANTE: cada vez que subas cambios, sube el número de VERSION para que los móviles descarguen la nueva versión. */
const VERSION = 'kit-sosocial-v7';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/estilos.css',
  './js/nucleo/config.js', './js/nucleo/estado.js', './js/nucleo/idioma.js', './js/nucleo/acordes.js', './js/nucleo/audio.js',
  './js/metronomo.js', './js/piano.js', './js/guitarra.js', './js/bajo.js', './js/diccionario.js', './js/app.js',
  './iconos/icono-192.png', './iconos/icono-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Tipografías de Google: se guardan la primera vez que se descargan
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION + '-fonts').then(c => c.match(req).then(hit => hit || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Primero internet (así siempre llega la última versión); si no hay conexión, lo guardado
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(hit => hit || caches.match('./index.html')))
  );
});
